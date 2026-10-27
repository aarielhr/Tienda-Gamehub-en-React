
import { cuponVigente } from '../src/servicios/servicioCarrito.js';

describe('Vigencia de cupones - Jasmine', () => {

  it('acepta cupones vigentes y rechaza los vencidos', () => {

    const hoy = new Date('2026-10-26T12:00:00');

    // Cupón dentro del período permitido
    expect(
      cuponVigente('2026-10-01', '2026-10-31', hoy)
    ).toBe(true);

    // Cupón vencido
    expect(
      cuponVigente('2026-09-01', '2026-09-30', hoy)
    ).toBe(false);

    // Cupón que todavía no comienza
    expect(
      cuponVigente('2026-11-01', '2026-11-30', hoy)
    ).toBe(false);

  });

});
