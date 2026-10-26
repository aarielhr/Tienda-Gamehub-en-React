import { Navigate, Route, Routes } from 'react-router-dom';
import Estructura from './componentes/Estructura.jsx';
import Inicio from './vistas/Inicio.jsx';
import Catalogo from './vistas/Catalogo.jsx';
import Carrito from './vistas/Carrito.jsx';
import Pago from './vistas/Pago.jsx';
import Ordenes from './vistas/Ordenes.jsx';

export default function Aplicacion() {
  return (
    <Routes>
      <Route element={<Estructura />}>
        <Route index element={<Inicio />} />
        <Route path="index.html" element={<Inicio />} />
        <Route path="catalogo.html" element={<Catalogo />} />
        <Route path="carrito.html" element={<Carrito />} />
        <Route path="checkout.html" element={<Pago />} />
        <Route path="ordenes.html" element={<Ordenes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
