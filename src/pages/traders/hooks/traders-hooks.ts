import { DeciDashConfig, getMarketCandlesticks, getMarketPrice, type WebsocketResponseMarketDepth, type MarketCandlesticks, type MarketCandlesticksInterval } from '@coldbell/decidash-ts-sdk';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { getMarketIdBySymbol } from '@/shared/api/client';
import { getWsSession } from '@/shared/api/decidash-websocket';

// 마켓 가격 쿼리
export const useMarketPrice = (market: string) => {
  return useQuery({
    queryKey: ['marketPrice', market],
    queryFn: async () => {
      const marketId = await getMarketIdBySymbol(market);
      const priceData = await getMarketPrice({
        decidashConfig: DeciDashConfig.DEVNET,
        market: marketId,
      });
      return priceData.length > 0 ? priceData[0].mark_px : 0;
    },
    enabled: !!market,
    staleTime: 1000 * 60, // 1분
    refetchInterval: 1000 * 5, // 5초마다 업데이트
  });
};

// 캔들스틱 데이터 쿼리 (실시간 업데이트 포함)
export const useMarketCandlesticks = (market: string, interval: string, startTime: number, endTime: number) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['candlesticks', market, interval, startTime, endTime],
    queryFn: async () => {
      const marketId = await getMarketIdBySymbol(market);
      const candlestickData = await getMarketCandlesticks({
        decidashConfig: DeciDashConfig.DEVNET,
        market: marketId,
        interval: interval as MarketCandlesticksInterval,
        startTime,
        endTime,
      });
      return candlestickData;
    },
    enabled: !!market && !!interval && !!startTime && !!endTime,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // WebSocket으로 실시간 가격을 받아 마지막 캔들을 갱신 (싱글톤 세션 사용)
  useEffect(() => {
    if (!market) return;
    const { connect, disconnect, subscribeMarketPrice } = getWsSession(DeciDashConfig.DEVNET);

    const subscribeToCandles = async () => {
      try {
        await connect();
        const marketId = await getMarketIdBySymbol(market);
        const priceStream = subscribeMarketPrice(marketId);

        const intervalMs = ((): number => {
          switch (interval) {
            case '1m': return 60_000;
            case '15m': return 900_000;
            case '1h': return 3_600_000;
            case '4h': return 14_400_000;
            case '1d': return 86_400_000;
            default: return 3_600_000;
          }
        })();

        for await (const update of priceStream) {
          const mark = update.price.mark_px;
          const ts = update.price.transaction_unix_ms; // ms
          const bucketT = Math.floor(ts / intervalMs) * intervalMs;

          queryClient.setQueryData(
            ['candlesticks', market, interval, startTime, endTime],
            (oldData: MarketCandlesticks[] | undefined) => {
              if (!oldData || oldData.length === 0) return oldData;
              const arr = [...oldData];
              const idx = arr.findIndex(c => c.t === bucketT);
              if (idx >= 0) {
                const prev = arr[idx];
                arr[idx] = {
                  ...prev,
                  h: Math.max(prev.h, mark),
                  l: Math.min(prev.l, mark),
                  c: mark,
                } as MarketCandlesticks;
              } else {
                // 새 버킷 시작: o=h=l=c=mark
                arr.push({ t: bucketT, T: bucketT + intervalMs - 1, o: mark, h: mark, l: mark, c: mark, v: 0, i: interval as any });
              }
              return arr;
            },
          );
        }
      } catch (error) {
        console.error('WebSocket subscription failed:', error);
      }
    };

    subscribeToCandles();

    return () => {
      disconnect();
    };
  }, [market, interval, queryClient, startTime, endTime]);

  return query;
};

// 오더북(마켓 뎁스) 구독 훅
export type DepthLevel = { price: number; size: number; total: number };
export type MarketDepth = { bids: DepthLevel[]; asks: DepthLevel[]; bestBid?: number; bestAsk?: number };

export const useMarketDepth = (market: string, depth: number = 15): MarketDepth => {
  const wsRef = useRef<ReturnType<typeof getWsSession> | null>(null);
  const [bids, setBids] = useState<DepthLevel[]>([]);
  const [asks, setAsks] = useState<DepthLevel[]>([]);
  const [marketAddr, setMarketAddr] = useState<string | null>(null);

  // 마켓 주소 가져오기
  useEffect(() => {
    const fetchMarketAddr = async () => {
      try {
        const addr = await getMarketIdBySymbol(market);
        setMarketAddr(addr);
      } catch (error) {
        console.error('Failed to get market address:', error);
      }
    };

    if (market) {
      fetchMarketAddr();
    }
  }, [market]);

  useEffect(() => {
    if (!market || !marketAddr) return;
    const ws = getWsSession(DeciDashConfig.DEVNET);
    wsRef.current = ws;
    let cancelled = false;

    const run = async () => {
      try {
        await ws.connect();
        const it = ws.subscribeMarketDepth(marketAddr);
        for await (const msg of it as AsyncIterable<WebsocketResponseMarketDepth>) {
          if (cancelled) break;
          let nextBids = (msg.bids || []).slice().sort((a,b) => b.price - a.price).slice(0, depth);
          let nextAsks = (msg.asks || []).slice().sort((a,b) => a.price - b.price).slice(0, depth);
          // 비정상 샘플 정정: bestBid > bestAsk이면, 교차 영역을 기준으로 필터링
          if (nextBids.length && nextAsks.length) {
            const bid0 = nextBids[0].price;
            const ask0 = nextAsks[0].price;
            if (bid0 > ask0) {
              const filteredBids = nextBids.filter(l => l.price <= ask0);
              const filteredAsks = nextAsks.filter(l => l.price >= bid0);
              if (filteredBids.length > 0) nextBids = filteredBids;
              if (filteredAsks.length > 0) nextAsks = filteredAsks;
            }
          }
          let acc = 0;
          const mappedBids = nextBids.map(l => { acc += l.size; return { price: l.price, size: l.size, total: acc }; });
          acc = 0;
          const mappedAsks = nextAsks.map(l => { acc += l.size; return { price: l.price, size: l.size, total: acc }; });
          setBids(mappedBids);
          setAsks(mappedAsks);
        }
      } catch (error) {
        // ignore error
        console.warn('Market depth subscription error:', error)
      }
    };

    run();
    return () => {
      cancelled = true;
      try { ws.disconnect(); } catch (error) {
        // ignore disconnect error
        console.warn('WebSocket disconnect error:', error)
      }
      wsRef.current = null;
    };
  }, [marketAddr, market, depth]);

  const bestBid = bids.length > 0 ? bids[0].price : undefined;
  const bestAsk = asks.length > 0 ? asks[0].price : undefined;

  return { bids, asks, bestBid, bestAsk };
};
