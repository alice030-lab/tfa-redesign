export function Topbar() {
  return (
    <div className="bg-vermillion text-paper text-center py-1.5 text-xs tracking-[0.14em] font-latin">
      滿 <span className="font-medium">NT$ 999</span> 免運 · 全台產地直送 ·
      <a href="/join" className="underline underline-offset-2 ml-2 hover:opacity-90">
        成為農友
      </a>
    </div>
  );
}
