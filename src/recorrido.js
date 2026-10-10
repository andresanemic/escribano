'use strict';

// El recorrido de Escribano, de la propuesta al historial completo.
//
// Cada línea sale de una ejecución real: no hay dato maquetado, ni hash de blockchain inventado, ni
// explorador simulado. La DAO, sus miembros y sus datos son de EJEMPLO. No hay DAO real, ni
// miembros reales, ni aportadores reales, y no se reclama ningún permiso de nadie.
//
// El núcleo que corre aquí es la copia vendorizada que Lore Plugin tiene **instalada** en este host.
// La suite lo verifica por digest antes de que corra una línea de esto.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { Escribano, QUORUM } = require('./escribano.js');
const nucleo = require('./nucleo.js');
const { verifyReceipt } = nucleo.carga('receipt.js');

const T0 = '2026-09-29T12:00:00.000Z';
const T1 = '2026-09-30T12:00:00.000Z';
const T2 = '2026-10-05T12:00:00.000Z';

function linea(t = '') { process.stdout.write(`${t}\n`); }
function titulo(t) { linea(`\n── ${t}`); }
function choque(t) { linea(`  ${t}`); }

async function main() {
  const dir = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'escribano-recorrido-'));
  const e = new Escribano({ dir });
  const corte = nucleo.rutaNucleo();

  linea('ESCRIBANO — el registro con recibos de cada cambio del contrato de una DAO');
  linea(`núcleo: ${corte.ruta}`);
  linea('DAO, miembros y datos son de EJEMPLO. Sin red, sin blockchain, sin pagos, sin un tercero.');
  linea('El efecto legal no está demostrado y no se afirma (el detalle está en la última pantalla).');

  // ── 0. La DAO y su contrato ────────────────────────────────────────────────────────────────────
  titulo('0. La DAO existe y su contrato tiene una versión y un identificador público');
  const fundacional = await e.crearDao({
    dao: 'La Fragua',
    identificador: 'file://contrato/la-frauga/v1',
    contrato: { version: 1, clausulas: { quorum: '3', plazo: '30 dias', Identificador: 'file://contrato/la-frauga/v1' } },
    miembros: ['bruna', 'nilo', 'sabina', 'tomas', 'yago'],
    otorgante: 'bruna',
    now: T0,
  });
  choque(`entrada ${fundacional.id} · versión 1 · firmada por ${fundacional.firmas.join(', ')}`);
  choque(`identificador público: ${fundacional.identificador}`);
  choque(`sello del recibo: ${fundacional.recibo.digest.slice(0, 16)}…`);
  choque(`anclaje: ${fundacional.recibo.anchor.status} en ${fundacional.recibo.anchor.network} — nada llegó a una red`);
  choque('(la fundación la firma quien constituye: un solo acto. Los cambios de después exigen quórum)');

  // Las autorizaciones: permiso con presupuesto y reloj, como el dinero.
  titulo('1. La persona que otorga reparte permisos con presupuesto y reloj');
  for (const m of ['bruna', 'nilo', 'sabina', 'tomas', 'yago']) {
    const a = e.otorgar({ miembro: m, presupuesto: '2', vence: T1, otorgada_por: 'bruna', now: T0 });
    choque(`${a.miembro}: ${a.presupuesto} cambios que puede autorizar, hasta ${a.vence}`);
  }
  choque('Un miembro sin autorización no firma, por mucho que sea miembro.');

  // ── 2. Propuesta sin quórum ────────────────────────────────────────────────────────────────────
  titulo('2. Se propone un cambio y se firma de menos: NO entra');
  e.proponer({ id: 'c-plazo', titulo: 'ampliar el plazo de deliberación', clausula: 'plazo', valor: '60 dias', now: T0 });
  e.autorizar({ cambio: 'c-plazo', miembro: 'bruna', now: T0 });
  e.autorizar({ cambio: 'c-plazo', miembro: 'nilo', now: T0 });
  const sinQuorum = await e.decidir({ cambio: 'c-plazo', firmas: ['bruna', 'nilo'], ahora: T0 });
  choque(`estado:  ${sinQuorum.estado}`);
  choque(`detalle: ${sinQuorum.detalle}`);
  choque(`salida:  ${sinQuorum.salida}`);
  choque(`entradas en el registro: ${e.historial().length} (solo la fundacional)`);

  // ── 3. Con quórum, el cambio entra con su recibo ──────────────────────────────────────────────
  titulo('3. Llega la tercera firma: el cambio ENTRA, con su recibo');
  e.autorizar({ cambio: 'c-plazo', miembro: 'sabina', now: T0 });
  const conQuorum = await e.decidir({ cambio: 'c-plazo', firmas: ['bruna', 'nilo', 'sabina'], ahora: T0 });
  choque(`estado:    ${conQuorum.estado}`);
  choque(`entrada:   ${conQuorum.entrada.id} · versión ${conQuorum.entrada.version}`);
  choque(`firmas:    ${conQuorum.entrada.firmas.join(', ')} (las nombra el recibo, no solo cuenta)`);
  choque(`recibió el cambio por parte de: ${conQuorum.recibo.decidedBy}`);
  choque(`sello:     ${conQuorum.recibo.digest.slice(0, 16)}…`);
  choque(`cobertura: ${conQuorum.recibo.coverage.join(', ')}`);
  choque(`NO cubierto: ${conQuorum.recibo.notCovered.join(', ')}`);
  choque(`anclaje:   ${conQuorum.recibo.anchor.status} — sin blockchain, el anclaje queda pendiente A PROPÓSITO`);

  // ── 4. Idempotencia ───────────────────────────────────────────────────────────────────────────
  titulo('4. Se vuelve a proponer el mismo contenido: es el MISMO cambio');
  const antes = e.historial().length;
  e.proponer({ id: 'c-plazo-2', titulo: 'ampliar el plazo (otra vez)', clausula: 'plazo', valor: '60 dias', now: T1 });
  for (const m of ['bruna', 'nilo', 'sabina']) e.autorizar({ cambio: 'c-plazo-2', miembro: m, now: T1 });
  const repetido = await e.decidir({ cambio: 'c-plazo-2', firmas: ['bruna', 'nilo', 'sabina'], ahora: T1 });
  choque(`estado: ${repetido.estado} — ${repetido.detalle}`);
  choque(`devuelve la entrada ${repetido.entrada.id}, con el mismo sello: ${repetido.recibo.digest === conQuorum.recibo.digest}`);
  choque(`entradas antes ${antes}, después ${e.historial().length}: el historial no se infló`);

  // ── 5. Firma con el permiso revocado ──────────────────────────────────────────────────────────
  titulo('5. A un miembro se le revoca el permiso: su firma ya no cuenta');
  // Todo esto pasa antes de que venza el reloj: si pasara después, TODAS las firmas leerían
  // vencidas y el punto del paso se perdería. El caso del reloj vencido va en el paso 6.
  e.proponer({ id: 'c-quorum', titulo: 'cambiar el quórum', clausula: 'quorum', valor: '4', now: T0 });
  for (const m of ['bruna', 'nilo', 'sabina']) e.autorizar({ cambio: 'c-quorum', miembro: m, now: T0 });
  e.revocar({ miembro: 'nilo', por: 'bruna', now: T0 });
  const revocado = await e.decidir({ cambio: 'c-quorum', firmas: ['bruna', 'nilo', 'sabina'], ahora: T0 });
  choque(`estado:  ${revocado.estado}`);
  choque(`detalle: ${revocado.detalle}`);
  choque(`salida:  ${revocado.salida}`);
  choque('Las tres firmas existen en la propuesta. El registro solo cuenta dos, y lo dice con nombre.');

  // ── 6. Reloj vencido ──────────────────────────────────────────────────────────────────────────
  titulo('6. Pasó la fecha: la autorización muere con su reloj');
  e.proponer({ id: 'c-tarde', titulo: 'cambio tardío', clausula: 'plazo', valor: '90 dias', now: T2 });
  const tarde = e.autorizar({ cambio: 'c-tarde', miembro: 'tomas', now: T2 });
  choque(`estado:  ${tarde.ok ? 'firmó' : 'NO firmó'}`);
  choque(`motivo:  ${tarde.motivo}`);
  choque('El reloj lo dice el núcleo, con su redacción y su fecha. No es un "no permitido".');

  // ── 7. Presupuesto delegado ───────────────────────────────────────────────────────────────────
  titulo('7. Un miembro quiere firmar por encima de su presupuesto');
  e.proponer({ id: 'c-x1', titulo: 'x1', clausula: 'plazo', valor: '11 dias', now: T0 });
  e.proponer({ id: 'c-x2', titulo: 'x2', clausula: 'plazo', valor: '12 dias', now: T0 });
  e.proponer({ id: 'c-x3', titulo: 'x3', clausula: 'plazo', valor: '13 dias', now: T0 });
  choque(`x1: ${e.autorizar({ cambio: 'c-x1', miembro: 'tomas', now: T0 }).ok ? 'firmó' : 'no'}`);
  choque(`x2: ${e.autorizar({ cambio: 'c-x2', miembro: 'tomas', now: T0 }).ok ? 'firmó' : 'no'}`);
  const sobre = e.autorizar({ cambio: 'c-x3', miembro: 'tomas', now: T0 });
  choque(`x3: ${sobre.ok ? 'firmó' : 'NO firmó'} — ${sobre.motivo}`);
  choque('El presupuesto es un límite duro, no un promedio: tres contra un techo de dos no es dos y media.');

  // ── 8. Queda pendiente ────────────────────────────────────────────────────────────────────────
  titulo('8. Un cambio que nunca alcanza las firmas queda pendiente, con su motivo');
  e.proponer({ id: 'c-olvidado', titulo: 'cambio olvidado', clausula: 'plazo', valor: '10 dias', now: T0 });
  choque('Nadie firma nunca, y nadie decide. El registro no lo ignora: lo lista y explica por qué.');
  for (const p of e.pendientes()) {
    const marca = p.id === 'c-olvidado' ? ' ← el olvidado' : '';
    choque(`  ${p.id.padEnd(12)} faltan ${p.faltan} · ${p.motivo}${marca}`);
  }

  // ── 9. Cualquiera lee ─────────────────────────────────────────────────────────────────────────
  titulo('9. Cualquiera lee el estado actual y el historial completo');
  const actual = e.actual();
  choque(`vigente: versión ${actual.version} · ${actual.identificador} · plazo ${actual.contrato.clausulas.plazo}`);
  const vieja = e.leer(1);
  choque(`versión 1 (histórica, vigente=${vieja.vigente}): plazo ${vieja.contrato.clausulas.plazo}`);
  choque('La versión vieja se lee tal como era, y se dice que no es la vigente.');
  choque('');
  for (const entrada of e.historial()) {
    choque(`  ${entrada.id}  v${entrada.version}  ${entrada.firmas.join('+').padEnd(24)} ${entrada.titulo}`);
  }

  // ── 10. La auditoría recalcula ────────────────────────────────────────────────────────────────
  titulo('10. Un tercero recalcula el registro desde el archivo, sin creerle a nadie');
  const a = e.auditar();
  choque(`auditoría: ${a.ok ? 'PASA' : 'NO PASA'} sobre ${a.total} entradas`);
  choque(`comprobaciones: ${Object.entries(a.checks).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  for (const entrada of e.historial()) {
    choque(`  ${entrada.id}: el sello ${verifyReceipt(entrada.recibo).ok ? 'verifica' : 'NO verifica'}`);
  }

  titulo('11. Alguien edita el historial a mano');
  const ruta = path.join(dir, 'registro.jsonl');
  const crudo = fs.readFileSync(ruta, 'utf8').trim().split('\n');
  const manipulado = crudo.map((l) => {
    const o = JSON.parse(l);
    if (o.tipo === 'cambio' && o.version === 2) o.contrato.clausulas.plazo = '9999 dias';
    return JSON.stringify(o);
  });
  fs.writeFileSync(ruta, `${manipulado.join('\n')}\n`);
  const alterado = e.auditar();
  choque(`auditoría después de editar: ${alterado.ok ? 'PASA' : 'NO PASA'}`);
  choque(`motivo: ${alterado.motivo}`);
  choque(`entradas señaladas: ${alterado.fallos.join(', ')}`);
  choque('La entrada editada sigue ahí — no se borra — pero la auditoría ya no la acepta.');

  // ── La pantalla que dice lo que no demuestra ───────────────────────────────────────────────────
  titulo('12. Lo que este recorrido NO demuestra');
  linea('  · NO demuestra ningún efecto legal. Este programa no presenta nada ante el secretario de');
  linea('    estado de Wyoming, no modifica artículos de organización, no confiere condición de DAO');
  linea('    y no crea persona jurídica. Corre en local y escribe un archivo.');
  linea('  · NO cumple ninguna norma. W.S. 17-31 se cita (Wyoming Statutes, Título 17, cap. 31,');
  linea('    leído el 2026-09-29 del PDF oficial de la Legislatura) como el MARCO cuya FORMA imita:');
  linea('    que un cambio de contrato sea un evento con identificador público y con recibo.');
  linea('    El comportamiento implementado NO se contrastó contra un proceso de depósito real,');
  linea('    porque aquí no existe tal proceso.');
  linea('  · NO hay anclaje. El anclaje de cada recibo queda `pending`: no hay blockchain, no hay');
  linea('    testnet, no hay explorador. No se simula un hash para que parezca lo que no es.');
  linea('  · NO hay autenticidad. El digest es un SHA-256 sin clave: quien pueda reescribir el');
  linea('    archivo puede recalcularlo. Lo que en una cadena real daría la propiedad del archivo es');
  linea('    justamente lo que aquí no hay.');
  linea('  · NO hay firmas criptográficas. "bruna" firma porque el archivo lo dice. No hay claves,');
  linea('    no hay firma de curva, no hay prueba de quién es quién.');
  linea('  · NO hay DAO, ni miembros, ni aportadores reales. Todo es de ejemplo.');
  linea('  · El quórum de tres firmas es una ELECCIÓN DE DISEÑO de este proyecto. La norma citada');
  linea('    exige enmendar los artículos cuando el contrato cambia y establecer el procedimiento;');
  linea('    NO dice cuántas firmas hacen falta. Decir lo contrario sería mentir.');
  linea('');
  return dir;
}

if (require.main === module) {
  main()
    .then((dir) => { process.stdout.write(`registro: ${path.join(dir, 'registro.jsonl')}\n`); })
    .catch((err) => { process.stdout.write(`recorrido detenido: ${err.message}\n`); process.exitCode = 1; });
}

module.exports = { main };
