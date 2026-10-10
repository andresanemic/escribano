'use strict';

// El rojo de Escribano, escrito antes que la implementación.
//
// Cada prueba describe un Rojo que tiene que **existir** para que la suite signifique algo. Si una
// de estas pasa sin que el código exista, la prueba está mal; si pasa sin que el comportamiento
// esté, no está probando el comportamiento.
//
// Los ocho son los que nombra la consigna del 2026-09-29:
//   1. cambio sin quorum
//   2. cambio autorizado con la firma de un miembro cuyo permiso fue revocado
//   3. doble cambio de idéntico contenido, que debe ser idempotente y no crear dos entradas
//   4. historial alterado
//   5. lectura de una versión vieja del contrato cuando hay una nueva
//   6. autorización con el reloj vencido
//   7. miembro que intenta autorizar por encima de su propio presupuesto delegado
//   8. cambio propuesto que nunca alcanza las firmas y queda pendiente con su motivo

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { Escribano, QUORUM } = require('../src/escribano.js');

const T0 = '2026-09-29T12:00:00.000Z';
const T1 = '2026-09-30T12:00:00.000Z';
const T2 = '2026-10-05T12:00:00.000Z'; // después del reloj de varias autorizaciones

const MIEMBROS = ['bruna', 'nilo', 'sabina', 'tomas', 'yago'];

async function nuevo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'escribano-red-'));
  const e = new Escribano({ dir });
  await e.crearDao({
    dao: 'La Fragua',
    identificador: 'file://contrato/la-frauga/v1',
    contrato: { version: 1, clausulas: { quorum: '3', plazo: '30 dias' } },
    miembros: MIEMBROS,
    otorgante: 'bruna',
    now: T0,
  });
  // Todas las autorizaciones viven con reloj y presupuesto; el rojo 6 y el 7 los aprietan.
  for (const m of MIEMBROS) {
    e.autorizar({ miembro: m, presupuesto: '2', vence: T1, otorgada_por: 'bruna', now: T0 });
  }
  return { e, dir };
}

test('1. un cambio sin quórum no entra, y vuelve con la salida que lo dice', async () => {
  const { e } = await nuevo();
  e.proponer({ id: 'c-1', titulo: 'subir el plazo', clausula: 'plazo', valor: '60 dias', now: T0 });

  e.autorizar({ cambio: 'c-1', miembro: 'bruna', now: T0 });
  e.autorizar({ cambio: 'c-1', miembro: 'nilo', now: T0 });

  const r = await e.decidir({ cambio: 'c-1', firmas: ['bruna', 'nilo'], now: T0 });

  assert.equal(r.estado, 'needs_human_decision', 'dos firmas de tres no son quórum');
  assert.equal(r.entrada, null, 'no debe entrar ninguna entrada al registro');
  assert.equal(e.historial().length, 1, 'el registro solo tiene la entrada fundacional');
  assert.match(r.detalle, /missing 1 approval \(2 of 3\)/, 'el detalle dice cuántas faltan');
  assert.ok(r.salida && r.salida.length > 0, 'todo rechazo nombra su salida');
});

test('2. la firma de un miembro revocado no cuenta, y el rechazo lo nombra', async () => {
  const { e } = await nuevo();
  e.proponer({ id: 'c-2', titulo: 'cambiar el quorum', clausula: 'quorum', valor: '5', now: T0 });

  e.autorizar({ cambio: 'c-2', miembro: 'bruna', now: T0 });
  e.autorizar({ cambio: 'c-2', miembro: 'nilo', now: T0 });
  e.autorizar({ cambio: 'c-2', miembro: 'sabina', now: T0 });
  e.revocar({ miembro: 'nilo', por: 'bruna', now: T0 });

  // Tres firmas recogidas, pero una es de un permiso revocado: el registro solo puede contar dos.
  const r = await e.decidir({ cambio: 'c-2', firmas: ['bruna', 'nilo', 'sabina'], now: T0 });

  assert.equal(r.estado, 'needs_human_decision', 'una firma revocada no completa el quórum');
  assert.equal(r.entrada, null);
  assert.match(r.detalle, /missing 1 approval \(2 of 3\)/);
  assert.match(r.salida, /nilo/, 'la salida nombra al miembro cuya autorización fue revocada');
});

test('3. el mismo cambio dos veces es un cambio: una entrada, el mismo sello', async () => {
  const { e } = await nuevo();
  const cambio = { id: 'c-3', titulo: 'subir el plazo', clausula: 'plazo', valor: '60 dias' };

  e.proponer({ ...cambio, now: T0 });
  e.autorizar({ cambio: 'c-3', miembro: 'bruna', now: T0 });
  e.autorizar({ cambio: 'c-3', miembro: 'nilo', now: T0 });
  e.autorizar({ cambio: 'c-3', miembro: 'sabina', now: T0 });
  const uno = await e.decidir({ cambio: 'c-3', firmas: ['bruna', 'nilo', 'sabina'], now: T0 });

  const largo = e.historial().length;
  assert.equal(largo, 2, 'fundacional + un cambio');
  assert.equal(uno.estado, 'verified');

  // Exactamente la misma propuesta, de nuevo, con las mismas tres firmas.
  e.proponer({ ...cambio, id: 'c-3-bis', now: T1 });
  e.autorizar({ cambio: 'c-3-bis', miembro: 'bruna', now: T1 });
  e.autorizar({ cambio: 'c-3-bis', miembro: 'nilo', now: T1 });
  e.autorizar({ cambio: 'c-3-bis', miembro: 'sabina', now: T1 });
  const dos = await e.decidir({ cambio: 'c-3-bis', firmas: ['bruna', 'nilo', 'sabina'], now: T1 });

  assert.equal(dos.entrada.id, uno.entrada.id, 'el reintento devuelve la entrada que ya existe');
  assert.equal(dos.recibo.digest, uno.recibo.digest, 'y el mismo sello: no hay un segundo recibo');
  assert.equal(e.historial().length, largo, 'el historial no creció: la idempotencia es contable');
});

test('4. un historial alterado a mano rompe la cadena y la auditoría lo dice', async () => {
  const { e, dir } = await nuevo();
  e.proponer({ id: 'c-4', titulo: 'nuevo quorum', clausula: 'quorum', valor: '4', now: T0 });
  for (const m of ['bruna', 'nilo', 'sabina']) e.autorizar({ cambio: 'c-4', miembro: m, now: T0 });
  await e.decidir({ cambio: 'c-4', firmas: ['bruna', 'nilo', 'sabina'], now: T0 });

  const limpio = e.auditar();
  assert.equal(limpio.ok, true, `el registro intacto audita bien: ${limpio.motivo || ''}`);

  // Alguien edita la cláusula en el archivo, sin recalcular la huella.
  const ruta = path.join(dir, 'registro.jsonl');
  const lineas = fs.readFileSync(ruta, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const entrada = lineas.find((l) => l.tipo === 'cambio');
  entrada.contrato.clausulas.quorum = '1';
  fs.writeFileSync(ruta, `${lineas.map((l) => JSON.stringify(l)).join('\n')}\n`);

  const alterado = e.auditar();
  assert.equal(alterado.ok, false, 'un historial alterado no puede auditar bien');
  assert.match(alterado.motivo, /cadena-intacta/, 'la auditoría nombra la comprobación que falló');
  assert.ok(alterado.fallos.includes(entrada.id), 'y nombra la entrada alterada');
});

test('5. con una versión nueva, la versión vieja se lee igual y se dice que no es la vigente', async () => {
  const { e } = await nuevo();
  e.proponer({ id: 'c-5', titulo: 'subir el plazo', clausula: 'plazo', valor: '60 dias', now: T0 });
  for (const m of ['bruna', 'nilo', 'sabina']) e.autorizar({ cambio: 'c-5', miembro: m, now: T0 });
  await e.decidir({ cambio: 'c-5', firmas: ['bruna', 'nilo', 'sabina'], now: T0 });

  assert.equal(e.actual().version, 2, 'la versión vigente es la 2');
  assert.equal(e.actual().contrato.clausulas.plazo, '60 dias');

  const vieja = e.leer(1);
  assert.equal(vieja.version, 1, 'la versión 1 se lee tal como era');
  assert.equal(vieja.contrato.clausulas.plazo, '30 dias', 'con el valor de entonces, no el de ahora');
  assert.equal(vieja.vigente, false, 'y se declara que no es la vigente');
  assert.equal(e.actual().vigente, true);
  assert.equal(e.leer(1).vigente, false, 'releerla no la convierte en vigente');
});

test('6. con el reloj vencido la autorización se niega, y dice cuándo venció', async () => {
  const { e } = await nuevo();
  e.proponer({ id: 'c-6', titulo: 'cambio tardio', clausula: 'plazo', valor: '90 dias', now: T0 });
  e.autorizar({ cambio: 'c-6', miembro: 'bruna', now: T0 });

  // T2 es posterior al `vence` que se le dio a todos en `nuevo()`.
  const tarde = e.autorizar({ cambio: 'c-6', miembro: 'nilo', now: T2 });

  assert.equal(tarde.ok, false, 'nilo no puede firmar con el reloj vencido');
  assert.match(tarde.motivo, /expired at/, 'el motivo lo dice el núcleo, con su propia redacción');
  assert.ok(tarde.motivo.includes(T1), 'y trae la fecha del vencimiento');
  assert.deepEqual(e.cambio('c-6').firmas, ['bruna'], 'la firma vencida no se recogió');
});

test('7. un miembro no autoriza por encima de su presupuesto delegado', async () => {
  const { e } = await nuevo(); // cada autorización tiene presupuesto 2

  // Tres cambios distintos: el presupuesto cuenta **firmas nuevas**, y firmar dos veces el mismo
  // cambio no es una decisión nueva, así que no gasta dos veces. Para topar con el techo hay que
  // proponer de verdad tres veces.
  e.proponer({ id: 'c-7a', titulo: 'a', clausula: 'plazo', valor: '45 dias', now: T0 });
  e.proponer({ id: 'c-7b', titulo: 'b', clausula: 'plazo', valor: '50 dias', now: T0 });
  e.proponer({ id: 'c-7c', titulo: 'c', clausula: 'plazo', valor: '55 dias', now: T0 });

  const primera = e.autorizar({ cambio: 'c-7a', miembro: 'sabina', now: T0 });
  assert.equal(primera.ok, true, 'la primera entra: queda 1 de 2');
  assert.equal(primera.restantes, 1);

  const repetida = e.autorizar({ cambio: 'c-7a', miembro: 'sabina', now: T0 });
  assert.equal(repetida.ok, true, 'firmar dos veces el mismo cambio no es una firma nueva');
  assert.equal(repetida.yaFirmaba, true);

  const segunda = e.autorizar({ cambio: 'c-7b', miembro: 'sabina', now: T0 });
  assert.equal(segunda.ok, true, 'la segunda entra: queda 0 de 2');
  assert.equal(segunda.restantes, 0);

  const tercera = e.autorizar({ cambio: 'c-7c', miembro: 'sabina', now: T0 });
  assert.equal(tercera.ok, false, 'la tercera no: sabina ya gastó su presupuesto de dos');
  assert.match(tercera.motivo, /consume 3 against grant max 2/, 'el límite duro se nombra con números');
  assert.equal(tercera.motivo.includes('sabina'), true, 'y con el nombre de quien se pasó');
  assert.ok(tercera.salida.length > 0, 'y la negativa nombra su salida');
  assert.deepEqual(e.cambio('c-7c').firmas, [], 'no se recogió ninguna firma de más');
});

test('8. un cambio que nunca alcanza las firmas queda pendiente, con su motivo', async () => {
  const { e } = await nuevo();
  e.proponer({ id: 'c-8', titulo: 'cambio olvidado', clausula: 'plazo', valor: '10 dias', now: T0 });
  e.autorizar({ cambio: 'c-8', miembro: 'bruna', now: T0 });

  // Nadie decide. El registro no lo ignora: lo lista.
  const pendientes = e.pendientes();
  assert.equal(pendientes.length, 1);
  assert.equal(pendientes[0].id, 'c-8');
  assert.equal(pendientes[0].firmas.length, 1);
  assert.equal(pendientes[0].faltan, QUORUM - 1);
  assert.ok(pendientes[0].motivo.length > 0, 'el pendiente dice por qué está pendiente');
  assert.match(pendientes[0].motivo, /1 of 3/);

  assert.equal(e.historial().length, 1, 'y no entró nada al registro');
  assert.equal(e.actual().version, 1, 'el contrato vigente sigue siendo el primero');
});
