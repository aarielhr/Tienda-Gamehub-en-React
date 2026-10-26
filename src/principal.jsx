import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './estilos.css';
import Aplicacion from './Aplicacion.jsx';
import { ProveedorCarrito } from './contexto/ProveedorCarrito.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProveedorCarrito hijos={<Aplicacion />} />
    </BrowserRouter>
  </React.StrictMode>
);
