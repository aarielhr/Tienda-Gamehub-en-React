
export default function ListaResenas({ resenas = [] }) {

  // Ordenar las reseñas desde la más reciente
  const resenasOrdenadas = [...resenas].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  // Calcular el promedio de puntuación
  const promedio = resenas.length > 0
    ? resenas.reduce(
        (suma, resena) => suma + resena.puntuacion,
        0
      ) / resenas.length
    : 0;

  // Mostrar mensaje si no existen reseñas
  if (resenas.length === 0) {
    return (
      <section>
        <h2>Reseñas de clientes</h2>
        <p>No hay reseñas disponibles.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Reseñas de clientes</h2>

      <p>
        Puntuación promedio: {promedio.toFixed(1)} / 5
      </p>

      <ul className="list-group">
        {resenasOrdenadas.map((resena) => (
          <li
            className="list-group-item resena-item"
            key={resena.id}
          >
            <strong>{resena.usuario}</strong>

            <p className="mb-1">
              Puntuación: {resena.puntuacion}/5
            </p>

            <p className="mb-1">
              {resena.comentario}
            </p>

            <small>{resena.fecha}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
