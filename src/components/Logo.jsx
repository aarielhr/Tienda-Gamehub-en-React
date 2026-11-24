// Logotipo: un cubo en isométrico (caja de despacho) que también se lee como un nodo que conecta
export function MarcaLogo({ tamano = 36 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <path d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25L16 2.5z" stroke="#9B8CFF" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 16 27.7 9.25M16 16 4.3 9.25M16 16v13.5" stroke="#9B8CFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <circle cx="16" cy="16" r="3.6" fill="#3FE0A0" />
    </svg>
  )
}

export default function Logo({ tamano = 36 }) {
  return (
    <>
      <MarcaLogo tamano={tamano} />
      <span className="d-flex flex-column" style={{ gap: 3 }}>
        <span className="logo-texto">
          Game<span>Hub</span>
        </span>
        <span className="logo-store">STORE</span>
      </span>
    </>
  )
}
