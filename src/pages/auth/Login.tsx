export default function Login() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">로그인</h1>
      <form className="space-y-3">
        <input className="w-full rounded border px-3 py-2" placeholder="이메일" />
        <input className="w-full rounded border px-3 py-2" type="password" placeholder="비밀번호" />
        <button className="w-full rounded bg-black px-3 py-2 text-white">로그인</button>
      </form>
    </div>
  )
}
