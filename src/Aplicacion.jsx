import { Navigate, Route, Routes } from 'react-router-dom';
import Estructura from './componentes/Estructura.jsx';
import Inicio from './vistas/Inicio.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Carrito from './pages/Carrito.jsx';
import Pago from './vistas/Pago.jsx';
import Ordenes from './vistas/Ordenes.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import Acceso from './pages/Acceso.jsx';
import Confirmacion from './pages/Confirmacion.jsx';
import PanelOperador from './pages/PanelOperador.jsx';
import PanelAdmin from './pages/PanelAdmin.jsx';
import NoEncontrado from './pages/NoEncontrado.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';

export default function Aplicacion() {
  return (
    <Routes>
      <Route element={<Estructura />}>
        <Route index element={<Inicio />} />
        <Route path="index.html" element={<Inicio />} />
        <Route path="catalogo.html" element={<Catalogo />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="carrito.html" element={<Carrito />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="checkout.html" element={<RutaProtegida rol="CLIENTE"><Pago /></RutaProtegida>} />
        <Route path="checkout" element={<RutaProtegida rol="CLIENTE"><Pago /></RutaProtegida>} />
        <Route path="ordenes.html" element={<RutaProtegida rol="CLIENTE"><Ordenes /></RutaProtegida>} />
        <Route path="mis-ordenes" element={<RutaProtegida rol="CLIENTE"><Ordenes /></RutaProtegida>} />
        <Route path="producto/:id" element={<DetalleProducto />} />
        <Route path="acceso" element={<Acceso />} />
        <Route path="ordenes/:id/confirmacion" element={<RutaProtegida rol="CLIENTE"><Confirmacion /></RutaProtegida>} />
        <Route path="operador" element={<RutaProtegida rol={['OPERADOR', 'ADMIN']}><PanelOperador /></RutaProtegida>} />
        <Route path="admin" element={<RutaProtegida rol="ADMIN"><PanelAdmin /></RutaProtegida>} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}
