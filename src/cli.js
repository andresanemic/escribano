'use strict';

// La terminal de Escribano. Una persona que no conoce el núcleo puede fundar una DAO, proponer un
// cambio de contrato, recoger firmas, decidir, y leer el estado y el historial — sin abrir el código.
//
// Cada comando dice qué hizo y, cuando algo no entró, dice por qué y por dónde se sale. El anclaje
// aparece `pending` en cada recibo y no se disimula: no hay blockchain encendido.

const fs = require('node:fs');
const path = require('node:path');

const { Escribano, QUORUM } = require('./escribano.js');
const nucleo = require('./nucleo.js');

const DIR = process.env.ESCRIBANO_DIR || path.join(__dirname, '..', 'datos');

function linea(t = '') { process.stdout.write(`${t}\n`); }
function titulo(t) { linea(`\n── ${t}`); }

// El pie que acompaña a todo estado que se pueda malinterpretar. Va en cada pantalla que muestra un
// contrato, no solo en un README: es la única forma de que no se pueda leer sin verlo.
function pie() {
  linea('  · Sin efecto legal: esto no se presenta ante ninguna autoridad, no modifica artículos de');
  linea('    organización, no confiere condición de DAO y no crea persona jurídica.');
  linea('  · El anclaje queda `pending`: no hay blockchain, ni testnet, ni explorador.');
  linea('  · El quórum de tres es una elección de diseño de este proyecto, no un requisito legal.');
}

const AYUDA = `escribano — el registro con recibos de cada cambio del contrato de una DAO

  escribano fundar <nombre> <identificador>            funda la DAO con una firma y escribe el registro vacío
  escribano estado                                    el contrato vigente
  escribano historial                                 todas las entradas, en orden
  escribano leer <version>                            una versión vieja, y si sigue vigente
  escribano otorgar <miembro> <presupuesto> <vence>    permiso con presupuesto y reloj
  escribano revocar <miembro>                         retira el permiso; no deshace lo ya firmado
  escribano proponer <id> <clausula> <valor>           propone un cambio; proponer no autoriza
  escribano firmar <cambio> <miembro>                  una firma, si el permiso alcanza
  escribano decidir <cambio> <m1,m2,...>              pasa el cambio por la puerta del núcleo
  escribano pendientes                                lo que está esperando firmas, y por qué
  escribano auditar                                   recalcula el registro desde el archivo
  escribano nucleo                                    de dónde sale el núcleo y sus huellas
`;

async function main(argv) {
  const [cmd, ...args] = argv;
  const corte = nucleo.rutaNucleo();
  if (!corte.existe) { nucleo.carga('authority.js'); return; } // deja que el nucleo diga por qué

  const e = new Escribano({ dir: DIR });

  switch (cmd) {
    case 'fundar': {
      const [nombre, identificador] = args;
      if (!nombre || !identificador) return linea('faltan nombre e identificador');
      fs.mkdirSync(DIR, { recursive: true });
      const fund = await e.crearDao({
        dao: nombre,
        identificador,
        contrato: { version: 1, clausulas: { quorum: String(QUORUM), plazo: '30 dias' } },
        miembros: ['bruna', 'nilo', 'sabina', 'tomas', 'yago'],
        otorgante: 'bruna',
      });
      linea(`fundada ${fund.dao || nombre}: entrada ${fund.id} v${fund.version}, firmada por ${fund.firmas.join(', ')}`);
      linea('los miembros son de ejemplo; otórgales un permiso antes de que puedan firmar');
      return;
    }

    case 'estado': {
      const a = e.actual();
      if (!a) return linea('todavía no hay contrato: `escribano fundar <nombre> <identificador>`');
      titulo(`contrato vigente — versión ${a.version}`);
      linea(`  dao:          ${e.dao()?.dao ?? '?'}`);
      linea(`  identificador público: ${a.identificador}`);
      for (const [k, v] of Object.entries(a.contrato.clausulas || {})) linea(`  ${k.padEnd(12)} ${v}`);
      linea(`  firmada por:  ${a.firmas.join(', ')}`);
      linea(`  sello:        ${a.recibo.digest.slice(0, 32)}…`);
      linea(`  anclaje:      ${a.recibo.anchor.status} en ${a.recibo.anchor.network} — nada llegó a una red`);
      titulo('lo que esto NO es');
      pie();
      return;
    }

    case 'historial': {
      const h = e.historial();
      if (h.length === 0) return linea('el registro está vacío');
      linea(`${h.length} entrada(s), en orden:`);
      for (const x of h) {
        linea(`  ${x.id}  v${String(x.version).padEnd(3)} ${x.firmas.join('+').padEnd(26)} ${x.titulo}`);
        linea(`      identificador: ${x.identificador}   sello: ${x.recibo ? x.recibo.digest.slice(0, 16) + '…' : 'SIN RECIBO'}`);
      }
      return;
    }

    case 'leer': {
      const v = e.leer(args[0]);
      if (!v) return linea(`no existe la versión ${args[0]}`);
      titulo(`versión ${v.version} — vigente: ${v.vigente}`);
      for (const [k, val] of Object.entries(v.contrato.clausulas || {})) linea(`  ${k.padEnd(12)} ${val}`);
      linea(`  firmada por:  ${v.firmas.join(', ')}`);
      if (!v.vigente) linea('  esta NO es la versión vigente: es el registro de lo que había antes');
      return;
    }

    case 'otorgar': {
      const [miembro, presupuesto, vence] = args;
      if (!miembro || !presupuesto) return linea('faltan miembro y presupuesto');
      const a = e.otorgar({ miembro, presupuesto, vence, otorgada_por: 'bruna' });
      linea(`${a.miembro} puede autorizar ${a.presupuesto} cambios${a.vence ? `, hasta ${a.vence}` : ', sin reloj'}`);
      return;
    }

    case 'revocar': {
      const [miembro] = args;
      if (!miembro) return linea('falta el miembro');
      e.revocar({ miembro, por: 'bruna' });
      linea(`permiso de ${miembro} revocado. Lo ya firmado no se deshace; lo que viene ya no cuenta.`);
      return;
    }

    case 'proponer': {
      const [id, clausula, ...resto] = args;
      if (!id || !clausula || resto.length === 0) return linea('uso: proponer <id> <clausula> <valor>');
      e.proponer({ id, clausula, valor: resto.join(' ') });
      linea(`propuesto ${id}: ${clausula} = ${resto.join(' ')}. Proponer no autoriza nada todavía.`);
      return;
    }

    case 'firmar': {
      const [cambio, miembro] = args;
      if (!cambio || !miembro) return linea('uso: firmar <cambio> <miembro>');
      const r = e.autorizar({ cambio, miembro });
      if (r.ok) {
        linea(r.yaFirmaba ? `${miembro} ya había firmado ${cambio}` : `${miembro} firmó ${cambio} (le quedan ${r.restantes} de su presupuesto)`);
        return;
      }
      linea(`NO firmó — ${r.motivo}`);
      linea(`salida: ${r.salida}`);
      return;
    }

    case 'decidir': {
      const [cambio, lista] = args;
      if (!cambio) return linea('uso: decidir <cambio> <m1,m2,...>');
      const firmas = lista ? lista.split(',').map((s) => s.trim()).filter(Boolean) : e.cambio(cambio)?.firmas ?? [];
      const r = await e.decidir({ cambio, firmas });
      linea(`estado: ${r.estado}`);
      if (r.entrada) {
        linea(`entró la entrada ${r.entrada.id} (versión ${r.entrada.version}), firmada por ${r.entrada.firmas.join(', ')}`);
        linea(`sello: ${r.recibo.digest.slice(0, 32)}…   anclaje: ${r.recibo.anchor.status} — nada llegó a una red`);
        linea(`NO cubierto por el verificador: ${r.recibo.notCovered.join(', ')}`);
        return;
      }
      if (r.detalle) linea(`motivo: ${r.detalle}`);
      linea(`salida: ${r.salida}`);
      return;
    }

    case 'pendientes': {
      const p = e.pendientes();
      if (p.length === 0) return linea('no hay cambios pendientes');
      for (const x of p) linea(`  ${x.id.padEnd(14)} faltan ${x.faltan}  ${x.motivo}`);
      return;
    }

    case 'auditar': {
      const a = e.auditar();
      titulo(a.ok ? 'auditoría: PASA' : 'auditoría: NO PASA');
      linea(`  entradas: ${a.total}`);
      for (const [k, v] of Object.entries(a.checks)) linea(`  ${v ? 'sí' : 'NO'}  ${k}`);
      if (a.motivo) linea(`  motivo: ${a.motivo}`);
      if (a.fallos.length > 0) linea(`  entradas señaladas: ${a.fallos.join(', ')}`);
      linea('');
      linea('  esto recalcula desde el archivo. No comprueba quién escribió, porque eso no se puede');
      linea('  comprobar sin una clave: el digest es un SHA-256 sin llave y quien reescribe recalcula.');
      return;
    }

    case 'nucleo': {
      titulo('núcleo que corre Escribano');
      linea(`  ${corte.ruta}`);
      linea(`  ${corte.origen === corte.ruta ? 'origen: la copia vendorizada instalada' : 'origen: SIN DECLARAR'}`);
      for (const m of nucleo.MODULOS) linea(`  ${m}`);
      linea('');
      linea('  Las huellas están fijadas en test/kernel.test.js contra lo que declara el kit.');
      linea('  Si RC6 instala otro núcleo, la suite se pone roja a propósito: es el control, no una regresión.');
      return;
    }

    default:
      linea(AYUDA);
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((err) => {
    process.stdout.write(`error: ${err.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { main, AYUDA };
