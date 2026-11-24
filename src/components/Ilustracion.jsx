// Ilustraciones de línea que reemplazan a las fotos de producto mientras el equipo no tenga las suyas.
// Cada producto trae en "imagen" el tipo ("gpu", "notebook"...) o la URL de una foto (ver ImagenProducto).
const LINEA = '#C5C9D6'
const ACENTO = '#9B8CFF'
const CUERPO = '#161A22'

const DIBUJOS = {
  notebook: (
    <>
      <rect x="54" y="20" width="132" height="90" rx="8" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <rect x="64" y="30" width="112" height="70" rx="3" stroke={ACENTO} strokeWidth="2" />
      <path d="M74 86l18-18 14 11 22-25 16 14 20-14" stroke={ACENTO} strokeWidth="2.5" />
      <path d="M30 114h180l14 16H16l14-16z" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <path d="M104 122h32" stroke={LINEA} strokeWidth="3" />
    </>
  ),
  gpu: (
    <>
      <path d="M16 32v96M16 32h10M16 128h10" stroke={LINEA} strokeWidth="3" />
      <rect x="26" y="38" width="196" height="76" rx="10" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <path d="M44 48h158" stroke={ACENTO} strokeWidth="3" />
      <circle cx="82" cy="80" r="24" stroke={ACENTO} strokeWidth="3" />
      <circle cx="166" cy="80" r="24" stroke={ACENTO} strokeWidth="3" />
      <path
        d="M82 60v40M62 80h40M68 66l28 28M96 66l-28 28M166 60v40M146 80h40M152 66l28 28M180 66l-28 28"
        stroke={LINEA}
        strokeWidth="2"
        opacity="0.55"
      />
      <circle cx="82" cy="80" r="6" fill={ACENTO} />
      <circle cx="166" cy="80" r="6" fill={ACENTO} />
      <path d="M60 114v12h92v-12" stroke={LINEA} strokeWidth="3" />
      <path d="M68 121h76" stroke={LINEA} strokeWidth="3" strokeDasharray="4 4" strokeLinecap="butt" />
    </>
  ),
  cpu: (
    <>
      <path
        d="M60 48h12M60 64h12M60 80h12M60 96h12M60 112h12M168 48h12M168 64h12M168 80h12M168 96h12M168 112h12M88 20v12M104 20v12M120 20v12M136 20v12M152 20v12M88 128v12M104 128v12M120 128v12M136 128v12M152 128v12"
        stroke={LINEA}
        strokeWidth="3"
      />
      <rect x="72" y="32" width="96" height="96" rx="10" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <rect x="94" y="54" width="52" height="52" rx="5" stroke={ACENTO} strokeWidth="3" />
      <rect x="108" y="68" width="24" height="24" rx="2" fill={ACENTO} opacity="0.3" />
      <path d="M80 40h10L80 50z" fill={ACENTO} />
    </>
  ),
  teclado: (
    <>
      <path d="M120 50c0-12 8-18 20-20s20-8 20-22" stroke={LINEA} strokeWidth="3" />
      <rect x="18" y="50" width="204" height="78" rx="10" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <path
        d="M32 66h176M32 82h176M32 98h176"
        stroke={LINEA}
        strokeOpacity="0.35"
        strokeWidth="9"
        strokeDasharray="11 5"
        strokeLinecap="butt"
      />
      <path d="M76 114h88" stroke={LINEA} strokeOpacity="0.35" strokeWidth="9" strokeLinecap="butt" />
      <path d="M48 66h11M32 82h11M48 82h11M64 82h11" stroke={ACENTO} strokeWidth="9" strokeLinecap="butt" />
    </>
  ),
  mouse: (
    <>
      <path
        d="M120 20c-24 0-40 20-40 48v28c0 26 17 44 40 44s40-18 40-44V68c0-28-16-48-40-48z"
        fill={CUERPO}
        stroke={LINEA}
        strokeWidth="3"
      />
      <path d="M120 20v44M80 68h80" stroke={LINEA} strokeWidth="2.5" opacity="0.6" />
      <rect x="114" y="34" width="12" height="20" rx="6" fill={CUERPO} stroke={ACENTO} strokeWidth="3" />
      <path d="M96 116c14 10 34 10 48 0" stroke={ACENTO} strokeWidth="3" />
    </>
  ),
  audifonos: (
    <>
      <path d="M62 102V86c0-32 26-58 58-58s58 26 58 58v16" stroke={LINEA} strokeWidth="3" />
      <rect x="44" y="92" width="34" height="48" rx="13" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <rect x="162" y="92" width="34" height="48" rx="13" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <path d="M56 106v20M184 106v20" stroke={ACENTO} strokeWidth="4" />
      <path d="M70 138c4 10 14 14 30 14h8" stroke={LINEA} strokeWidth="3" />
      <circle cx="112" cy="152" r="4" fill={ACENTO} />
    </>
  ),
  monitor: (
    <>
      <rect x="26" y="16" width="188" height="108" rx="8" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <rect x="36" y="26" width="168" height="88" rx="3" stroke={ACENTO} strokeWidth="2" />
      <circle cx="120" cy="70" r="16" stroke={ACENTO} strokeWidth="2.5" />
      <path d="M120 46v12M120 82v12M96 70h12M132 70h12" stroke={ACENTO} strokeWidth="2.5" />
      <path d="M112 124v14M128 124v14M86 142h68" stroke={LINEA} strokeWidth="3" />
    </>
  ),
  consola: (
    <>
      <rect x="18" y="42" width="204" height="84" rx="36" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <rect x="74" y="52" width="92" height="64" rx="5" stroke={ACENTO} strokeWidth="2.5" />
      <path d="M88 100l14-14 10 8 16-18 14 12" stroke={ACENTO} strokeWidth="2" opacity="0.7" />
      <path d="M38 84h22M49 73v22" stroke={LINEA} strokeWidth="6" />
      <circle cx="190" cy="72" r="5" fill={ACENTO} />
      <circle cx="202" cy="84" r="5" fill={LINEA} />
      <circle cx="178" cy="84" r="5" fill={LINEA} />
      <circle cx="190" cy="96" r="5" fill={LINEA} />
    </>
  ),
  control: (
    <>
      <path
        d="M72 46h96c24 0 38 20 44 50 4 22-4 40-20 40-11 0-17-7-23-17l-8-6H79l-8 6c-6 10-12 17-23 17-16 0-24-18-20-40 6-30 20-50 44-50z"
        fill={CUERPO}
        stroke={LINEA}
        strokeWidth="3"
      />
      <path d="M62 82h22M73 71v22" stroke={LINEA} strokeWidth="6" />
      <circle cx="166" cy="70" r="5" fill={ACENTO} />
      <circle cx="178" cy="82" r="5" fill={LINEA} />
      <circle cx="154" cy="82" r="5" fill={LINEA} />
      <circle cx="166" cy="94" r="5" fill={LINEA} />
      <circle cx="100" cy="96" r="9" stroke={ACENTO} strokeWidth="3" />
      <circle cx="140" cy="96" r="9" stroke={ACENTO} strokeWidth="3" />
    </>
  ),
  ssd: (
    <>
      <rect x="22" y="58" width="188" height="44" rx="5" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <path d="M210 66h10v28h-10" stroke={LINEA} strokeWidth="3" />
      <path d="M215 70v20" stroke={LINEA} strokeWidth="3" strokeDasharray="2 3" strokeLinecap="butt" />
      <rect x="44" y="68" width="44" height="24" rx="3" stroke={ACENTO} strokeWidth="2.5" />
      <rect x="98" y="68" width="44" height="24" rx="3" stroke={ACENTO} strokeWidth="2.5" />
      <rect x="152" y="70" width="30" height="20" rx="3" stroke={LINEA} strokeWidth="2.5" />
      <circle cx="32" cy="80" r="4" stroke={LINEA} strokeWidth="2.5" />
    </>
  ),
  microfono: (
    <>
      <path d="M86 66v8c0 19 15 32 34 32s34-13 34-32v-8" stroke={LINEA} strokeWidth="3" />
      <rect x="100" y="16" width="40" height="76" rx="20" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <path d="M110 34h20M108 46h24M108 58h24M110 70h20" stroke={ACENTO} strokeWidth="2.5" />
      <path d="M120 106v28M94 140h52" stroke={LINEA} strokeWidth="3" />
    </>
  ),
  mousepad: (
    <>
      <rect x="18" y="34" width="204" height="96" rx="12" fill={CUERPO} stroke={LINEA} strokeWidth="3" />
      <path d="M18 58h204M18 82h204M18 106h204M59 34v96M100 34v96M140 34v96M181 34v96" stroke="#2B3242" strokeWidth="1.5" />
      <rect x="26" y="42" width="188" height="80" rx="7" stroke={ACENTO} strokeWidth="2" opacity="0.8" />
    </>
  ),
}

// etiqueta: si viene, la ilustración se anuncia como imagen (equivale al alt de una foto)
export default function Ilustracion({ tipo, etiqueta }) {
  const dibujo = DIBUJOS[tipo] ?? DIBUJOS.gpu
  return (
    <svg
      viewBox="0 0 240 160"
      width="100%"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', height: 'auto' }}
      role={etiqueta ? 'img' : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : 'true'}
      focusable="false"
    >
      {dibujo}
    </svg>
  )
}
