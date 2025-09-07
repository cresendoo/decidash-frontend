export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-gray-900">
          React + TypeScript + TailwindCSS
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Vite, ESLint, Prettier, Husky, alias('@')가 설정되었습니다.
        </p>
        <div className="flex justify-center gap-3">
          <a
            className="rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800"
            href="https://vite.dev"
            target="_blank"
            rel="noreferrer"
          >
            Vite
          </a>
          <a
            className="rounded-md bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-500"
            href="https://react.dev"
            target="_blank"
            rel="noreferrer"
          >
            React
          </a>
          <a
            className="rounded-md bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500"
            href="https://tailwindcss.com"
            target="_blank"
            rel="noreferrer"
          >
            Tailwind
          </a>
        </div>
      </div>
    </main>
  )
}
