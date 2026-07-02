export default function Loading() {
  return (
    <main className="detail" aria-busy="true">
      <div className="sys-loading">
        <span className="sys-spinner" />
        <span className="sys-loading-txt">CARGANDO EL PARTE…</span>
      </div>
    </main>
  )
}
