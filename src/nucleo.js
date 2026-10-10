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

// Los diez módulos del corte 0.1.5, incluida la procedencia completa de la copia.
// Runtime y suite fijan los mismos bytes.
const MODULOS = [
  'authority.js',
  'continuity.js',
  'delegation.js',
  'emergency.js',
  'operation.js',
  'receipt.js',
  'skill-provenance.js',
  'time.js',
  'x402.js',
  'zk.js',
];

// Lo que el corte declara para el kernel 0.1.5, commit
// ed559e83c976dd6e6a379a5510db776206f670b4. Estos son los SHA-256 de los bytes que quedan tras
// quitar las tres líneas de encabezado de procedencia. Escritos aquí a mano y no leídos del
// `SOURCE.md` instalado: leer la tabla que se está verificando sería verificar la tabla contra
// sí misma.
const ESPERADOS = {
  'authority.js': 'fcf7952489d6f9c42616b52f54832524926d2f2ba6c0ea6514480a7bdc7a265e',
  'continuity.js': 'abbee9cab8c92b2c4680dba2d573bf8eb6a50ab63194e4a0b0b525af5f044e6c',
  'delegation.js': '357d8b9398ac2b2c3508565e6c2293cc6abff3801f09a60f985dc1c781e002a3',
  'emergency.js': '73bd7199b4d8fbf373331bc7b75d9940cdd9896383739461252c2888f08a408c',
  'operation.js': '9a95815fc10435cb55415da1531e1545168eaf209518630b83f24b10f0e78d48',
  'receipt.js': 'd006eff3538b2c701366ba09d1e41a32d267b2bad44177f0095541ce9b2a644d',
  'skill-provenance.js': 'd416956c0fc8ad04d1d3cca21c20c05046c3705701cd22e03447ffe9f509872b',
  'time.js': '3ed3565a3843b62341e61a2de405eab77b8218a37ac4ef1b41d49f4a4718502d',
  'x402.js': '63c6765b98c70758fad50859ae66df7833d300c93a961749df85b36aaf9282a2',
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
