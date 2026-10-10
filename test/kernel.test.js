'use strict';

// La frontera de versión de Escribano, verificada por bytes.
//
// Escribano consume la copia vendorizada del kernel que viaja en `vendor/vespi-kernel`, con su
// `SOURCE.md` de procedencia. Estos diez digest fijan el corte
// 0.1.5. Si el corte cambia, esta suite se pone roja **a propósito**: es el control funcionando,
// no una regresión. Reevaluar la huella es decisión de Andrés, no de este proyecto.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const { rutaNucleo, MODULOS, ESPERADOS } = require('../src/nucleo.js');

// 0.1.5: el commit fijado que las cabeceras de la copia vendorizada declaran (forma corta) y que
// `vendor/vespi-kernel/SOURCE.md` documenta (forma completa).
const COMMIT_CORTO = 'ed559e8';
const COMMIT_FIJADO = 'ed559e83c976dd6e6a379a5510db776206f670b4';

test('la copia del núcleo que Escribano consume es la vendorizada, y solo esa', () => {
  const r = rutaNucleo();
  assert.ok(r.existe, `no se encontró la copia vendorizada. Se buscó en:\n  ${r.buscados.join('\n  ')}`);
  const esperada = process.env.VESPI_KERNEL_ROOT
    ? path.resolve(process.env.VESPI_KERNEL_ROOT)
    : path.resolve(__dirname, '..', 'vendor', 'vespi-kernel');
  assert.equal(r.ruta, esperada, `el núcleo debe cargarse desde la copia vendorizada (${esperada}), no de ${r.ruta}`);
  assert.equal(r.origen, r.ruta, 'el origen declarado es la ruta que se cargó');
});

test('el núcleo es el corte fijado, módulo por módulo', () => {
  const r = rutaNucleo();
  for (const modulo of MODULOS) {
    const crudo = fs.readFileSync(path.join(r.ruta, modulo));
    // Tres líneas de encabezado de procedencia, y debajo los bytes exactos del corte.
    const cuerpo = crudo.subarray(corte(crudo));
    const real = createHash('sha256').update(cuerpo).digest('hex');
    assert.equal(real, ESPERADOS[modulo], `${modulo}: el núcleo se movió; repiñalo a mano y vuelve a correr la suite`);
  }
});

test('los diez encabezados declaran el mismo commit fijado', () => {
  const r = rutaNucleo();
  const commits = new Set();
  for (const modulo of MODULOS) {
    const encabezado = fs.readFileSync(path.join(r.ruta, modulo), 'utf8').split('\n').slice(0, 3).join(' ');
    const encontrado = encabezado.match(/commit ([0-9a-f]{7,40})/);
    assert.ok(encontrado, `${modulo}: el encabezado no declara un commit`);
    assert.match(encabezado, /^\/\/ Vendored copy/m, `${modulo}: no es la copia vendorizada`);
    commits.add(encontrado[1].slice(0, 7));
  }
  assert.equal(commits.size, 1, `los diez módulos no apuntan al mismo commit: ${[...commits].join(', ')}`);
  // 0.1.5: el commit de la cabecera es el que SOURCE.md documenta; la cabecera trae la forma
  // corta y SOURCE.md la completa.
  assert.equal([...commits][0], COMMIT_CORTO, `el commit fijado cambió; SOURCE.md documenta ${COMMIT_FIJADO}`);
  assert.ok(COMMIT_FIJADO.startsWith([...commits][0]), `la cabecera no coincide con ${COMMIT_FIJADO}`);
});

test('el SOURCE.md vendido declara los mismos diez módulos que este proyecto espera', () => {
  const r = rutaNucleo();
  const fuente = fs.readFileSync(path.join(r.ruta, 'SOURCE.md'), 'utf8');
  const declarados = [...fuente.matchAll(/^\|\s*\x60([^\x60]+\.js)\x60\s*\|\s*\x60([0-9a-f]{64})\x60\s*\|\s*(\d+)\s*\|$/gm)].map((m) => m[1]);
  assert.deepEqual(declarados.sort(), [...MODULOS].sort());
});

test('lo que el núcleo exporta es lo que este proyecto usa, y existe', () => {
  const r = rutaNucleo();
  const autoridad = require(path.join(r.ruta, 'authority.js'));
  const operacion = require(path.join(r.ruta, 'operation.js'));
  const recibo = require(path.join(r.ruta, 'receipt.js'));
  for (const nombre of ['sufficient']) assert.equal(typeof autoridad[nombre], 'function', `authority.${nombre}`);
  for (const nombre of ['createOperation', 'runOperation', 'STATES']) assert.ok(operacion[nombre], `operation.${nombre}`);
  for (const nombre of ['verifyReceipt']) assert.equal(typeof recibo[nombre], 'function', `receipt.${nombre}`);
});

function corte(buffer) {
  let i = 0;
  for (let n = 0; n < 3; n++) i = buffer.indexOf(0x0a, i) + 1;
  return i;
}
