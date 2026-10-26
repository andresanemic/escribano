'use strict';

// Dónde está el núcleo, y desde dónde se carga.
//
// Escribano consume la copia vendorizada que viaja en `vendor/vespi-kernel`, con su `SOURCE.md`
// de procedencia. No consume copias instaladas en los hosts ni ningún árbol de desarrollo: en un
// clon limpio esas rutas no existen, y un proyecto que dice consumir el corte y en realidad
// consume otra cosa es peor que un proyecto que no arranca.
//
// Si no se encuentra la copia vendorizada, esto **falla ruidosamente**.

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

// Los doce módulos del corte 0.1.8, incluida la procedencia completa de la copia.
// Runtime y suite fijan los mismos bytes.
const MODULOS = [
  'authority.js',
  'context.js',
  'continuity.js',
  'delegation.js',
  'emergency.js',
  'operation.js',
  'receipt.js',
  'skill-provenance.js',
  'time.js',
  'x402.js',
  'zk-bn254-reference.js',
  'zk.js',
];

// Lo que el corte declara para el kernel 0.1.8, commit
// 13dbe24310dab2a12eee26ad51dfdfddbff5458b. Estos son los SHA-256 de los bytes que quedan tras
// quitar las tres líneas de encabezado de procedencia. Escritos aquí a mano y no leídos del
// `SOURCE.md` instalado: leer la tabla que se está verificando sería verificar la tabla contra
// sí misma.
const ESPERADOS = {
  'authority.js': '6cdf59ff884c5acc51ea00d7dfa946b6cf2058b67f4779e63250edfc0623d946',
  'context.js': '8bfd3ca4ceccb57291c34363e7a847147a291fe677bf64c34a543d6ecbcb3e8f',
  'continuity.js': 'abbee9cab8c92b2c4680dba2d573bf8eb6a50ab63194e4a0b0b525af5f044e6c',
  'delegation.js': 'd6c96c7fbfe02c7d2c2dc0ec7b5ca54bdc78d8ebdd3e4e5f802b0912183399c4',
  'emergency.js': '73bd7199b4d8fbf373331bc7b75d9940cdd9896383739461252c2888f08a408c',
  'operation.js': '5cf64d6bd477ef0f2dd2a5ebc8ec3b391473763d101f8fcb3819000434848399',
  'receipt.js': '0a443b45967efdf23a6ddaa3abd00361acc87b59297bae94e929b99abe11d69a',
  'skill-provenance.js': '946b2e15a60882e96adf3510ffb157a49cfa7f356263118e89cd1004d15b3724',
  'time.js': '3ed3565a3843b62341e61a2de405eab77b8218a37ac4ef1b41d49f4a4718502d',
  'x402.js': '1084ab26beebc71fb25cf704a3b90ed17020789bc12bcc10b467967ffea0138f',
  'zk-bn254-reference.js': '79c6e7306100817bf1e8837a973a83ee3d58f645a625b0c3885a57639ae7686d',
  'zk.js': 'e7885a6ceafe8665212323456b17fd5fac61c1907e361d17da31b56a051b9820',
};

// La copia vendorizada. Vive aquí para que un clon limpio la traiga consigo.
const VENDORIZADA = path.join(__dirname, '..', 'vendor', 'vespi-kernel');

// Compatibilidad: antes nombraba el árbol de desarrollo que había que evitar. Ya no hay otro
// origen; apunta a la misma copia vendorizada.
const ARBOL_DESARROLLO = VENDORIZADA;

function candidatos() {
  return process.env.VESPI_KERNEL_ROOT
    ? [process.env.VESPI_KERNEL_ROOT]
    : [VENDORIZADA];
}

function cuerpo(archivo) {
  const bytes = fs.readFileSync(archivo);
  let inicio = 0;
  for (let i = 0; i < 3; i += 1) {
    const salto = bytes.indexOf(0x0a, inicio);
    if (salto < 0) throw new Error('encabezado de procedencia incompleto: ' + archivo);
    inicio = salto + 1;
  }
  return bytes.subarray(inicio);
}

function completa(dir) {
  return MODULOS.every((modulo) => {
    try {
      const archivo = path.join(dir, modulo);
      const real = createHash('sha256').update(cuerpo(archivo)).digest('hex');
      return real === ESPERADOS[modulo];
    } catch {
      return false;
    }
  });
}

function resolver() {
  const buscados = candidatos();
  for (const dir of buscados) {
    if (completa(dir)) return { ruta: path.resolve(dir), existe: true, buscados, origen: path.resolve(dir) };
  }
  return { ruta: null, existe: false, buscados, origen: null };
}

function carga(modulo) {
  const r = resolver();
  if (!r.existe) {
    throw new Error(
      'Escribano no encuentra la copia vendorizada del kernel en vendor/vespi-kernel.\n' +
        `Se buscó en:\n  ${r.buscados.join('\n  ')}\n` +
        'Restaurá la copia vendorizada del corte fijado; cualquier VESPI_KERNEL_ROOT explícito también debe coincidir byte a byte con ese corte.',
    );
  }
  return require(path.join(r.ruta, modulo));
}

function metodos(modulo) {
  return carga(modulo);
}

module.exports = {
  MODULOS,
  ESPERADOS,
  ARBOL_DESARROLLO,
  resolver,
  rutaNucleo: resolver,
  carga,
  metodos,
  // Los predicados del núcleo, cargados por la vía que resuelve.
  sufficient: () => carga('authority.js').sufficient,
  createOperation: () => carga('operation.js').createOperation,
  runOperation: () => carga('operation.js').runOperation,
  STATES: () => carga('operation.js').STATES,
  verifyReceipt: () => carga('receipt.js').verifyReceipt,
};
