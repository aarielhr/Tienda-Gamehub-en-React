import { ErrorApi, solicitar } from './api.js';

function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(cuerpo) };
}

describe('integración EV3 · servicio HTTP', () => {
  beforeEach(() => localStorage.clear());

  it('envía el token JWT como Bearer en solicitudes protegidas', async () => {
    const traer = jasmine.createSpy('fetch').and.resolveTo(respuesta(200, { ok: true }));
    await solicitar('/api/ordenes/mias', { sesion: { token: 'jwt.ejemplo.firma' } }, traer);
    expect(traer.calls.mostRecent().args[1].headers.Authorization).toBe('Bearer jwt.ejemplo.firma');
  });

  it('traduce un 403 del servidor a un error entendible', async () => {
    const traer = jasmine.createSpy('fetch').and.resolveTo(respuesta(403, { mensaje: 'Acceso denegado por rol.' }));
    const error = await solicitar('/api/admin/productos', { sesion: null }, traer).catch((e) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.estado).toBe(403);
    expect(error.message).toBe('Acceso denegado por rol.');
  });
});
