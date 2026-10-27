
export default function FormularioCheckout({
  direccion = '',
  alConfirmar,
  children,
  className = ''
}) {
  const direccionValida = direccion.trim().length > 0;

  return (
    <form
      className={className}
      noValidate
      onSubmit={alConfirmar}
    >
      {children}

      <button
        className="btn btn-primary btn-lg"
        type="submit"
        disabled={!direccionValida}
      >
        Confirmar compra
      </button>
    </form>
  );
}
