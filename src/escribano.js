'use strict';

// Escribano — proyecto 6 de los diez de Vespi: el registro con recibos de cada cambio del
// contrato de una DAO.
//
// Este archivo es la carrocería; el núcleo ejecutable es el kernel de Vespi, que este proyecto
// consume sin modificar y desde la copia **instalada** (`src/nucleo.js`). Del núcleo son, y no se
// reescriben: el predicado de suficiencia (reloj, presupuesto, destino), la puerta de varias
// partes, la verificación separada, el estado de la operación y el sello del recibo.
//
// Lo que el núcleo no expresa y este proyecto agrega: el contrato y sus versiones, el registro
// append-only con su idempotencia por contenido, la redacción legible del rechazo con su salida,
// y la auditoría que recalcula desde el almacén en vez de creerle a quien corrió.
//
// **Lo que este archivo no es:** no presenta nada ante autoridad alguna, no modifica artículos de
// organización, no confiere condición de DAO y no crea persona jurídica. Corre en local y escribe
// un archivo. El anclaje de cada recibo queda `pending` porque no hay blockchain encendido, y el
// recorrido lo dice en pantalla en vez de simular un hash.

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const nucleo = require('./nucleo.js');

const { createOperation, runOperation, STATES } = nucleo.carga('operation.js');
const { sufficient } = nucleo.carga('authority.js');
const { verifyReceipt } = nucleo.carga('receipt.js');

const REGISTRO = 'registro.jsonl';

// El quórum de este proyecto. Es una **elección de diseño**, no un requisito de la norma que este
// proyecto imita: W.S. 17-31-107(a)(iii) exige que los artículos se amenden cuando el contrato
// cambia, y 106(c)(x) que los artículos establezcan el procedimiento — no dice cuántas firmas.
// Decir lo contrario sería el defecto que la decisión 26 vino a impedir. Ver `acuerdo.md`.
const QUORUM = 3;

// La salida de todo rechazo. Un rechazo sin salida no es una medida de seguridad: es una puerta
// cerrada sin explicar por dónde se sale (decisiones 16 y 19).
const SALIDA_BASE =
  'el cambio queda pendiente: vuelve a las personas que firman, con el motivo escrito, o se retira la propuesta. No se fuerza ni se reintenta con el mismo contenido.';

// Las comprobaciones que la auditoría tiene que recalcular **desde el almacén**. Una auditoría que
// no produce exactamente este conjunto no auditó nada: devolver un subconjunto, o añadir uno
// propio, es creerle a quien corrió.
const COMPROBACIONES = [
  'cadena-intacta',
  'sellos-verifican',
  'firma-nombreada',
  'orden-creciente',
  'identificador-declarado',
  'solo-verificados',
];

function texto(v) { return typeof v === 'string' && v.length > 0; }

function iso(v) {
  if (v === undefined || v === null) return new Date().toISOString();
  const ms = Date.parse(v);
  return Number.isNaN(ms) ? new Date().toISOString() : new Date(ms).toISOString();
}

// JSON canónico: claves ordenadas, sin `undefined`. El mismo contenido produce siempre la misma
// huella, y eso es lo que hace idempotente el registro.
function canonico(valor) {
  if (valor === null || typeof valor !== 'object') return JSON.stringify(valor === undefined ? null : valor);
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(',')}]`;
  const claves = Object.keys(valor).filter((k) => valor[k] !== undefined).sort();
  return `{${claves.map((k) => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(',')}}`;
}

function huella(valor) { return createHash('sha256').update(canonico(valor), 'utf8').digest('hex'); }

// Lo que la huella de la entrada cubre: el contenido del cambio, no el recibo. El recibo lleva su
// propio sello, y atarlo aquí lo ataría a sí mismo. Es el mismo corte que hace el núcleo en
// `receipt.js`, donde `anchor` queda fuera del digest porque el digest es lo que va a la red.
function contenidoHuellable(entrada) {
  return {
    id: entrada.id,
    version: entrada.version,
    fundacional: entrada.fundacional === true,
    titulo: entrada.titulo,
    clausula: entrada.clausula,
    valor: entrada.valor,
    identificador: entrada.identificador,
    contrato: entrada.contrato,
    firmas: entrada.firmas,
    entrada_padre: entrada.entrada_padre,
    operacion: entrada.operacion,
  };
}

// La clave de idempotencia: qué contrato **resulta** de aplicar el cambio, y con qué identificador
// público. Dos propuestas que dejan el mismo contrato son el mismo cambio, y solo uno entra. La
// clave no lleva ni id ni versión de la entrada, justamente para que un reintento posterior —que
// tiene otras— siga reconociendo la que ya está.
function claveDe(dao, identificador, contrato) {
  return huella({ dao, identificador, clausulas: contrato.clausulas });
}

class Escribano {
  constructor({ dir } = {}) {
    if (!dir) throw new Error('Escribano necesita un directorio: el registro es un archivo en disco');
    this.dir = dir;
    this.ruta = path.join(dir, REGISTRO);
  }

  // ── el almacén ────────────────────────────────────────────────────────────────────────────────
  // Append-only de verdad: toda escritura agrega al final y no reescribe lo que estaba.

  registro() {
    if (!fs.existsSync(this.ruta)) return [];
    return fs
      .readFileSync(this.ruta, 'utf8')
      .split('\n')
      .filter((l) => l.trim().length > 0)
      .map((l) => JSON.parse(l));
  }

  escribir(linea) {
    fs.mkdirSync(this.dir, { recursive: true });
    fs.appendFileSync(this.ruta, `${JSON.stringify(linea)}\n`, 'utf8');
    return linea;
  }

  lineas(tipo) { return this.registro().filter((l) => l.tipo === tipo); }

  // El registro es append-only y una propuesta se **reescribe** agregando otra línea con el mismo
  // `id`. Gana la última: leer la primera devolvería siempre el estado fundacional de la propuesta
  // y haría que una firma recogida pareciera no existir.
  ultimasDe(tipo) {
    const porId = new Map();
    for (const l of this.lineas(tipo)) porId.set(l.id, l);
    return [...porId.values()];
  }

  // ── la DAO y su contrato ───────────────────────────────────────────────────────────────────────

  async crearDao({ dao, identificador, contrato, miembros, otorgante, now }) {
    if (this.lineas('cambio').length > 0) throw new Error('la DAO ya tiene contrato: no se funda dos veces');
    if (!texto(dao) || !texto(identificador) || !texto(otorgante)) {
      throw new Error('dao, identificador y otorgante son obligatorios');
    }
    const miembrosLimpios = [...new Set((miembros || []).filter(texto))];
    this.escribir({ tipo: 'dao', dao, identificador, miembros: miembrosLimpios, quórum: QUORUM, creada: iso(now) });

    // La fundación es un acto único de quien constituye, no un cambio sujeto a quórum. Por eso la
    // entrada fundacional lleva una sola firma y la auditoría lo comprueba aparte: fingir que la
    // fundación también pasó por tres firmas sería inventar historia.
    const entrada = {
      tipo: 'cambio',
      id: 'e-1',
      version: 1,
      fundacional: true,
      titulo: 'constitución de la DAO',
      clausula: null,
      valor: null,
      identificador,
      contrato: JSON.parse(JSON.stringify(contrato)),
      firmas: [otorgante],
      entrada_padre: null,
      en: iso(now),
    };
    entrada.clave = claveDe(dao, identificador, entrada.contrato);
    entrada.huella = huella(contenidoHuellable(entrada));
    const fundacional = await this.sellarFundacional(entrada, now);
    entrada.operacion = fundacional.operacion;
    entrada.huella = huella(contenidoHuellable(entrada));
    this.escribir(entrada);
    this.escribir({ tipo: 'recibo', entrada: entrada.id, operacion: fundacional.operacion, recibo: fundacional.recibo });
    // Se relee del almacén y no se devuelve el objeto en memoria: lo que se devuelve es lo que
    // quedó escrito, con su recibo, no lo que esta función cree que escribió.
    return this.entradas().find((e) => e.id === entrada.id);
  }

  // La entrada fundacional también lleva recibo, y también se sella con el núcleo: se corre como
  // operación de una sola firma, que es lo que pasó.
  async sellarFundacional(entrada, now) {
    const quorumFundacional = 1;
    const op = createOperation({
      goal: `fundar ${this.dao()?.dao ?? 'la DAO'}`,
      action: 'fundar-contrato',
      agent: 'escribano',
      exit: 'la DAO queda constituida con una sola firma; los cambios siguientes exigen quórum',
      authority: {
        spend: [{ asset: 'firma', maxAmount: '1', to: entrada.firmas[0] }],
        signers: { required: quorumFundacional, allowed: [entrada.firmas[0]] },
        pausers: [entrada.firmas[0]],
      },
    });
    const resultado = await runOperation(
      op,
      {
        id: 'escribano.fundar',
        required: () => ({ spend: [{ asset: 'firma', amount: '1', to: entrada.firmas[0] }] }),
        perform: async () => ({
          ok: true,
          evidence: { operationId: op.id, type: 'dao-fundada', status: 'registrada', code: '1' },
        }),
      },
      {
        ask: async () => ({ approved: true, by: entrada.firmas[0] }),
        verify: async () => ({
          verified: true,
          checks: Object.fromEntries(COMPROBACIONES.map((c) => [c, true])),
          reason: 'la entrada fundacional tiene una firma nombrada y su huella recién calculada',
        }),
        // El reloj inyectado: sin él el núcleo usaría el reloj real y los permisos de prueba
        // (que vencen) leerían vencidos según el día que sea.
        ...(now !== undefined && now !== null ? { now: () => now } : {}),
      },
    );
    return { operacion: op.id, recibo: resultado.receipt };
  }
  dao() { return this.lineas('dao')[0] || null; }

  // El contenido de una entrada es inmutable: se escribe una vez y no se toca. El recibo llega
  // **después**, porque el núcleo sella cuando la operación termina, y se guarda como un hecho
  // aparte en su propia línea. Un registro append-only en el que se pudiera reescribir una entrada
  // para cambiarle el recibo no sería append-only; y el recibo alterado a mano lo caza
  // `sellos-verifican`, porque el digest está sellado sobre él.
  recibos() { return this.lineas('recibo'); }

  reciboDe(id) {
    const todos = this.recibos().filter((r) => r.entrada === id);
    return todos.length === 0 ? null : todos[todos.length - 1].recibo;
  }

  // El estado vigente es la última entrada **verificada**. Una entrada cuyo verificador falló queda
  // en el historial —no se borra— pero no gobierna: el registro no se maquilla.
  entradas() {
    return this.lineas('cambio').map((e) => ({ ...e, recibo: this.reciboDe(e.id) }));
  }
  entradasVerificadas() { return this.entradas().filter((e) => e.recibo && e.recibo.status === 'verified'); }

  historial() { return this.entradas(); }

  actual() {
    const v = this.entradasVerificadas();
    if (v.length === 0) return null;
    return { ...v[v.length - 1], vigente: true };
  }

  // Leer una versión vieja es una lectura corriente: no necesita permiso, y no conviertte a nadie
  // en autoridad sobre lo leído. Solo dice si lo que se está leyendo es lo vigente.
  leer(version) {
    const n = Number(version);
    const e = this.entradas().find((x) => x.version === n);
    if (!e) return null;
    const vigente = this.actual();
    return { ...e, vigente: !!vigente && vigente.version === e.version };
  }

  // ── autorizaciones: el permiso con presupuesto, reloj y origen ────────────────────────────────

  autorizaciones() { return this.lineas('autorizacion'); }

  autorizacionDe(miembro) {
    const todas = this.autorizaciones().filter((a) => a.miembro === miembro);
    return todas.length === 0 ? null : todas[todas.length - 1];
  }

  viva(miembro) {
    const a = this.autorizacionDe(miembro);
    return a && !a.revocada_en ? a : null;
  }

  otorgar(spec) {
    const { miembro, presupuesto, vence, otorgada_por, padre, now } = spec;
    if (!texto(miembro) || !texto(otorgada_por)) throw new Error('miembro y otorgada_por son obligatorios');
    // Delegar solo reduce: una autorización derivada no puede superar a la que la origina, ni en
    // presupuesto ni en plazo. `delegation ≠ amplification` (Vespi, arquitectura-operacion.md).
    if (texto(padre)) {
      if (padre === miembro) throw new Error('una autorización no se delega a sí misma');
      const origen = this.autorizacionDe(padre);
      if (!origen) throw new Error(`la autorización de la que se delega (${padre}) no existe`);
      if (this.viva(padre) === null) throw new Error(`delegar solo reduce: ${padre} no tiene autorización vigente`);
      if (String(presupuesto) > String(origen.presupuesto)) {
        throw new Error(`delegar solo reduce: ${miembro} recibiría ${presupuesto} y ${padre} solo tiene ${origen.presupuesto}`);
      }
      if (texto(vence) && texto(origen.vence) && Date.parse(vence) > Date.parse(origen.vence)) {
        throw new Error(`delegar solo reduce: ${miembro} vencería después que ${padre}`);
      }
    }
    return this.escribir({
      tipo: 'autorizacion',
      miembro,
      presupuesto: String(presupuesto),
      vence: texto(vence) ? iso(vence) : null,
      otorgada_por,
      padre: texto(padre) ? padre : null,
      revocada_en: null,
      revocada_por: null,
      en: iso(now),
    });
  }

  // Revocar impide lo que viene; no deshace lo ya registrado (principio 3 del proyecto).
  revocar({ miembro, por, now }) {
    const a = this.autorizacionDe(miembro);
    if (!a) throw new Error(`${miembro} no tiene autorización que revocar`);
    if (a.revocada_en) return a;
    this.escribir({ tipo: 'revocacion', miembro, por, en: iso(now) });
    return this.escribir({ tipo: 'autorizacion', ...a, presupuesto: '0', revocada_en: iso(now), revocada_por: por });
  }

  // ── propuestas ────────────────────────────────────────────────────────────────────────────────

  propuestas() { return this.ultimasDe('propuesta'); }
  cambio(id) { return this.propuestas().find((p) => p.id === id) || null; }

  proponer({ id, titulo, clausula, valor, now }) {
    if (!texto(id) || !texto(clausula) || valor === undefined) throw new Error('id, clausula y valor son obligatorios');
    if (this.cambio(id)) throw new Error(`ya existe una propuesta con el id ${id}`);
    return this.escribir({
      tipo: 'propuesta',
      id,
      titulo: texto(titulo) ? titulo : `cambio de ${clausula}`,
      clausula,
      valor,
      firmas: [],
      decidido: false,
      entrada: null,
      en: iso(now),
    });
  }

  // El contrato que resultaría de aplicar la propuesta: el vigente con esa cláusula cambiada.
  contratoResultante(p) {
    const vigente = this.actual();
    const base = vigente ? JSON.parse(JSON.stringify(vigente.contrato)) : { version: 1, clausulas: {} };
    base.clausulas = { ...(base.clausulas || {}), [p.clausula]: p.valor };
    // Cambiar la cláusula del identificador cambia el identificador público, que es exactamente la
    // otra razón por la que la norma pide enmendar los artículos cuando el identificador cambia.
    const identificador = p.clausula === 'identificador' ? String(p.valor) : vigente ? vigente.identificador : null;
    return { contrato: base, identificador };
  }

  // Cuántos votos lleva gastados: la cuenta corre sobre las propuestas que siguen abiertas. Un
  // cambio que ya entró no vuelve a descontar, porque ya no admite firmas nuevas.
  votosGastados(miembro) {
    return this.propuestas().filter((p) => !p.decidido && p.firmas.includes(miembro)).length;
  }

  // ── la firma, con su reloj y su presupuesto ───────────────────────────────────────────────────

  firmar({ cambio, miembro, now }) {
    const p = this.cambio(cambio);
    if (!p) throw new Error(`no hay propuesta ${cambio}`);
    if (p.decidido) return { ok: false, motivo: `el cambio ${cambio} ya entró al registro y no admite firmas nuevas`, salida: SALIDA_BASE };

    const a = this.viva(miembro);
    if (!a) {
      const revocada = this.autorizacionDe(miembro);
      const motivo = revocada
        ? `la autorización de ${miembro} fue revocada por ${revocada.revocada_por} el ${revocada.revocada_en}`
        : `${miembro} no tiene autorización: ser miembro no basta para firmar`;
      return {
        ok: false,
        motivo,
        salida: `${miembro} necesita una autorización vigente. Vuelve a quien otorga y pide una: revocar impide lo que viene, no deshace lo ya firmado.`,
      };
    }

    // Firmar dos veces el mismo cambio no gasta presupuesto dos veces: no es una decisión nueva.
    if (p.firmas.includes(miembro)) {
      return { ok: true, yaFirmaba: true, motivo: `${miembro} ya había firmado este cambio` };
    }

    // El presupuesto se comprueba con el predicado del núcleo, no con una cuenta propia. El
    // requisito que se le pasa es el consumo acumulado, para que el mensaje que salga sea el del
    // núcleo y nombre los números: "consume 3 against grant max 2".
    const consumido = this.votosGastados(miembro);
    const autoridad = {
      spend: [{ asset: 'voto', maxAmount: a.presupuesto, to: miembro, ...(a.vence ? { expiresAt: a.vence } : {}) }],
    };
    const check = sufficient([{ asset: 'voto', amount: String(consumido + 1), to: miembro }], autoridad, { now });

    if (!check.ok) {
      return {
        ok: false,
        motivo: check.reason,
        salida: `${miembro} no puede seguir firmando: su autorización es un límite duro, no un promedio. Vuelve a quien otorga, que puede ampliar la autorización como un permiso nuevo — nunca por la vía del reintento.`,
      };
    }

    this.escribir({ tipo: 'propuesta', ...p, firmas: [...p.firmas, miembro] });
    return { ok: true, miembro, restantes: Number(a.presupuesto) - (consumido + 1) };
  }

  // Una sola puerta para las dos cosas que se llaman parecido: otorgar una autorización y firmar un
  // cambio. Se despacha por lo que trae el pedido, no por método, para que ninguna se llame con el
  // nombre de la otra por accidente.
  autorizar(spec) {
    return texto(spec.cambio) ? this.firmar(spec) : this.otorgar(spec);
  }

  // ── la puerta: el núcleo decide si el cambio entra ─────────────────────────────────────────────

  async decidir({ cambio, firmas, firmasRecogidas, ahora, now }) {
    const p = this.cambio(cambio);
    if (!p) throw new Error(`no hay propuesta ${cambio}`);

    // El momento contra el que se evalúan reloj y presupuesto: `ahora` es la vía del recorrido y
    // `now` la de las pruebas. Sin él el núcleo usaría el reloj real y los permisos de prueba,
    // que vencen el 2026-10-01, leerían vencidos según el día que sea.
    const momento = ahora ?? now;
    const recogidas = firmasRecogidas || firmas || p.firmas;

    // Idempotencia por contenido: si este contrato resultante ya está en el registro, se devuelve
    // la entrada que ya existe en vez de escribir una segunda. Un historial que se infla al
    // reintentar deja de ser contable (principio 2 del proyecto).
    const prevista = this.contratoResultante(p);
    const clave = claveDe(this.dao()?.dao, prevista.identificador, prevista.contrato);
    const previa = this.entradas().find((e) => e.clave === clave);
    if (previa) {
      // La propuesta se marca resuelta aunque no escriba nada: si no, un reintento aparecería
      // como cambio pendiente para siempre, y el registro mostraría un fantasma.
      this.escribir({ tipo: 'propuesta', ...p, firmas: recogidas, decidido: true, entrada: previa.id });
      return { estado: 'already_registered', detalle: 'este contenido de contrato ya estaba en el registro', salida: '', recibo: previa.recibo, entrada: previa };
    }

    // Solo pueden firmar quienes tienen autorización vigente. Aquí es donde la revocación muerde:
    // la firma está en la propuesta, pero el registro no la cuenta. Lo que se vuelve a comprobar en
    // este punto es la **vigencia** —revocación y reloj—, que es lo que pudo cambiar entre la
    // firma y la decisión. El gasto acumulado ya se liquidó al firmar, y no se vuelve a cobrar.
    const noCuentan = [];
    const cuentan = [];
    for (const m of recogidas) {
      const a = this.viva(m);
      if (!a) {
        const r = this.autorizacionDe(m);
        noCuentan.push({ miembro: m, motivo: r ? `autorización revocada por ${r.revocada_por}` : 'sin autorización' });
        continue;
      }
      const check = sufficient(
        [{ asset: 'voto', amount: '1', to: m }],
        { spend: [{ asset: 'voto', maxAmount: a.presupuesto, to: m, ...(a.vence ? { expiresAt: a.vence } : {}) }] },
        { now: momento },
      );
      if (!check.ok) noCuentan.push({ miembro: m, motivo: check.reason });
      else cuentan.push(m);
    }

    const permitidos = this.dao()?.miembros || [];
    const allowed = permitidos.filter((m) => this.viva(m));
    const faltan = QUORUM - cuentan.length;
    const salida = this.textoSalida({ faltan, cuenta: cuentan.length, noCuentan, recogidas });

    if (faltan > 0) {
      const detalle = `missing ${faltan} approval${faltan === 1 ? '' : 's'} (${cuentan.length} of ${QUORUM})`;
      this.escribir({ tipo: 'propuesta', ...p, firmas: recogidas });
      return { estado: STATES.NEEDS_DECISION, detalle, salida, recibo: null, entrada: null, noCuentan };
    }

    // Con quórum, la puerta es la del núcleo: `signers` con `required` y `allowed` hace que cuente
    // identidades distintas que pasaron por la puerta, y una aprobación sin nombre cuenta cero.
    const op = createOperation({
      goal: `${p.titulo} (${p.clausula} = ${p.valor})`,
      action: 'cambiar-contrato',
      agent: 'escribano',
      exit: salida,
      authority: {
        spend: [{ asset: 'voto', maxAmount: '1', to: 'registro' }],
        signers: { required: QUORUM, allowed },
        pausers: permitidos,
      },
    });

    const resultado = await runOperation(op, this.capacidad(op, p, prevista, cuentan, momento), {
      ask: async () => ({ approvals: cuentan.map((m) => ({ by: m })) }),
      verify: async (evidencia) => this.verificar(evidencia),
      ...(momento !== undefined && momento !== null ? { now: () => momento } : {}),
    });

    if (resultado.status === 'verified') {
      // El recibo llega aparte: la entrada ya está escrita y su contenido no se toca.
      this.escribir({ tipo: 'recibo', entrada: resultado.output.entrada.id, operacion: op.id, recibo: resultado.receipt });
      this.escribir({ tipo: 'propuesta', ...p, firmas: recogidas, decidido: true, entrada: resultado.output.entrada.id });
      return { estado: resultado.status, detalle: resultado.receipt.detail, salida: '', recibo: resultado.receipt, entrada: this.entradas().find((e) => e.id === resultado.output.entrada.id) };
    }

    // Aunque no haya pasado la verificación, el recibo se guarda: es evidencia, y la entrada queda
    // en el historial sin gobernar. Borrarla sería maquillar el registro.
    if (resultado.receipt) {
      const id = resultado.output && resultado.output.entrada ? resultado.output.entrada.id : null;
      if (id) this.escribir({ tipo: 'recibo', entrada: id, operacion: op.id, recibo: resultado.receipt });
    }
    this.escribir({ tipo: 'propuesta', ...p, firmas: recogidas });
    return { estado: resultado.status, detalle: resultado.receipt?.detail || resultado.status, salida, recibo: resultado.receipt || null, entrada: null, noCuentan };
  }

  textoSalida({ faltan, cuenta, noCuentan, recogidas }) {
    const partes = [];
    if (faltan > 0) partes.push(`Faltan ${faltan} ${faltan === 1 ? 'firma' : 'firmas'} de ${QUORUM} (van ${cuenta}).`);
    for (const n of noCuentan) partes.push(`La firma de ${n.miembro} no cuenta: ${n.motivo}.`);
    const siguen = recogidas.filter((m) => !noCuentan.some((n) => n.miembro === m));
    if (faltan > 0) partes.push(`Firman hasta ahora: ${siguen.length > 0 ? siguen.join(', ') : 'nadie'}.`);
    partes.push(SALIDA_BASE);
    return partes.join(' ');
  }

  // La capacidad: qué exige, qué ejecuta y qué se verifica.
  capacidad(op, p, prevista, cuentan, ahora) {
    return {
      id: 'escribano.cambiar-contrato',
      required: () => ({ spend: [{ asset: 'voto', amount: '1', to: 'registro' }] }),
      perform: async () => {
        const padre = this.actual();
        const entrada = {
          tipo: 'cambio',
          id: `e-${this.entradas().length + 1}`,
          version: (padre ? padre.version : 0) + 1,
          fundacional: false,
          titulo: p.titulo,
          clausula: p.clausula,
          valor: p.valor,
          identificador: prevista.identificador,
          contrato: prevista.contrato,
          firmas: cuentan,
          entrada_padre: padre ? padre.id : null,
          operacion: op.id,
          en: iso(ahora),
        };
        entrada.clave = claveDe(this.dao()?.dao, entrada.identificador, entrada.contrato);
        entrada.huella = huella(contenidoHuellable(entrada));
        this.escribir(entrada);
        return {
          ok: true,
          evidence: { operationId: op.id, type: 'cambio-registrado', status: 'registrada', code: String(entrada.version) },
          output: { entrada },
        };
      },
    };
  }

  // El verificador recalcula desde el almacén. No lee el informe de quien corrió: si el ejecutor
  // dijera que salió bien, esta función ni se entera.
  //
  // Una salvedad que se declara en vez de esconderse: en el momento en que se verifica, la entrada
  // que se acaba de escribir **todavía no tiene recibo**, porque el núcleo sella el recibo después
  // de que el verificador responde. Por eso `auditar` recibe `exceptoId` y no le exige a esa entrada
  // ni sello ni veredicto. Las dos comprobaciones del recibo se pagan en la auditoría posterior, que
  // corre cuando el registro ya está completo, y ahí sí miran todas las entradas.
  async verificar(evidencia) {
    const entrada = this.entradas().find((e) => e.operacion === evidencia.operationId);
    const r = this.auditar({ exceptoId: entrada ? entrada.id : null });
    const checks = {};
    for (const c of COMPROBACIONES) checks[c] = r.checks[c] === true;
    return {
      verified: !!entrada && r.ok,
      checks,
      reason: entrada && r.ok
        ? `recalculado desde el almacén: ${COMPROBACIONES.join(', ')}`
        : `la auditoría del almacén no pasa: ${r.motivo}`,
    };
  }

  // ── pendientes ────────────────────────────────────────────────────────────────────────────────

  pendientes() {
    return this.propuestas()
      .filter((p) => !p.decidido)
      .map((p) => {
        const valen = p.firmas.filter((m) => this.viva(m));
        const noCuentan = p.firmas.filter((m) => !this.viva(m));
        const faltan = Math.max(0, QUORUM - valen.length);
        const cuenta = `(${valen.length} of ${QUORUM})`;
        return {
          id: p.id,
          titulo: p.titulo,
          firmas: p.firmas,
          valen,
          noCuentan,
          faltan,
          motivo: noCuentan.length > 0
            ? `missing ${faltan} approval${faltan === 1 ? '' : 's'} ${cuenta}; la firma de ${noCuentan.join(', ')} no cuenta porque su autorización no está vigente`
            : `missing ${faltan} approval${faltan === 1 ? '' : 's'} ${cuenta}`,
        };
      });
  }

  // ── la auditoría independiente ─────────────────────────────────────────────────────────────────

  // `exceptoId` es la entrada que se está verificando ahora mismo: todavía no tiene recibo, porque
  // el núcleo sella después de que el verificador responda. Se le saltea solo lo que depende del
  // recibo —`sellos-verifican` y `solo-verificados`— y se le exige todo lo demás. La auditoría
  // posterior, con el registro completo, no se salta nada.
  auditar({ exceptoId = null } = {}) {
    const entradas = this.entradas();
    const checks = {};
    const fallos = [];
    let motivo = '';
    for (const c of COMPROBACIONES) checks[c] = true;

    if (entradas.length === 0) {
      for (const c of COMPROBACIONES) checks[c] = false;
      return { ok: false, motivo: 'el registro no tiene entrada fundacional', fallos, checks, total: 0 };
    }

    for (const e of entradas) {
      if (huella(contenidoHuellable(e)) !== e.huella) {
        checks['cadena-intacta'] = false;
        fallos.push(e.id);
        motivo = `cadena-intacta: la entrada ${e.id} no coincide con la huella que ella misma declara`;
      }
      if (e.id !== exceptoId) {
        if (!e.recibo || verifyReceipt(e.recibo).ok !== true) {
          checks['sellos-verifican'] = false;
          fallos.push(e.id);
          motivo = `sellos-verifican: el recibo de ${e.id} no verifica`;
        } else if (e.recibo.operation.id !== e.operacion) {
          checks['sellos-verifican'] = false;
          fallos.push(e.id);
          motivo = `sellos-verifican: el recibo de ${e.id} sella otra operación, no la que la produjo`;
        }
        if (!e.recibo || e.recibo.status !== 'verified') {
          checks['solo-verificados'] = false;
          fallos.push(e.id);
          motivo = `solo-verificados: ${e.id} entró sin verificación y por lo tanto no gobierna`;
        }
      }
      const esperadas = e.fundacional ? 1 : QUORUM;
      if (!Array.isArray(e.firmas) || new Set(e.firmas).size < esperadas) {
        checks['firma-nombreada'] = false;
        fallos.push(e.id);
        motivo = `firma-nombreada: ${e.id} no tiene ${esperadas} firmas distintas y nombradas`;
      }
      if (!texto(e.identificador)) {
        checks['identificador-declarado'] = false;
        fallos.push(e.id);
        motivo = `identificador-declarado: ${e.id} no declara un identificador público`;
      }
    }

    entradas.forEach((e, i) => {
      if (e.version !== i + 1) {
        checks['orden-creciente'] = false;
        fallos.push(e.id);
        motivo = `orden-creciente: la entrada ${e.id} es la versión ${e.version} y le toca la ${i + 1}`;
      }
    });

    const unicos = [...new Set(fallos)];
    return { ok: unicos.length === 0, motivo, fallos: unicos, checks, total: entradas.length };
  }
}

module.exports = { Escribano, QUORUM, COMPROBACIONES, canonico, huella, contenidoHuellable, claveDe };
