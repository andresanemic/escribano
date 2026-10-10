# Evidence

## Current result

The supplied run dated 2026-10-09 reports **13 tests, all passing and none skipped** on Node v24.15.0. The capture, kept at [`suite-2026-10-09.txt`](./suite-2026-10-09.txt), is the reference for these counts and these test names. The public repository contains the test files and source code under the review-only license, so the run can be repeated from this checkout with `npm test`.

The run executed `node --test test/*.test.js` in a clean clone of the private project with an empty HOME and no network. The kernel is Vespi 0.1.5, commit `ed559e83c976dd6e6a379a5510db776206f670b4`, copied into the project at `vendor/vespi-kernel`; the kernel-boundary checks compare that copy against its `SOURCE.md`, module by module and commit by commit.

### Why the earlier capture was red

The earlier capture, dated 2026-10-03, was red because the project was pinned to an older kernel cut (0.1.3). That re-pin is now done: this run checks the vendored 0.1.5 copy against its own `SOURCE.md`, and every check in it passes. The earlier result is kept here as history; it is not the current state.

## The 13 tests

### Kernel boundary and expected interface

| Test name | Result | What the supplied run shows |
|---|---|---|
| `la copia del núcleo que Escribano consume es la vendorizada, y solo esa` | Pass | The consumed copy is the vendored copy, not the development tree. |
| `el núcleo es el corte fijado, módulo por módulo` | Pass | Each module's digest matches the cut fixed for the vendored copy. |
| `los ocho encabezados declaran el mismo commit fijado` | Pass | All eight headers declare the same fixed commit. |
| `el SOURCE.md vendido declara los mismos ocho módulos que este proyecto espera` | Pass | The vendored `SOURCE.md` declares the eight modules the project expects. |
| `lo que el núcleo exporta es lo que este proyecto usa, y existe` | Pass | The expected exports exist. |

### Adversarial cases

The project phase record says these eight cases were written first and each was observed red before implementation. In this run, all eight assertions pass.

| Test name | Result | What the supplied run shows |
|---|---|---|
| `1. un cambio sin quórum no entra, y vuelve con la salida que lo dice` | Pass | A change without quorum does not enter, and the refusal carries the output that says so. |
| `2. la firma de un miembro revocado no cuenta, y el rechazo lo nombra` | Pass | A revoked member's attestation does not count, and the refusal names them. |
| `3. el mismo cambio dos veces es un cambio: una entrada, el mismo sello` | Pass | The same change twice is one change: a single entry, the same seal. |
| `4. un historial alterado a mano rompe la cadena y la auditoría lo dice` | Pass | A hand-altered history breaks the chain, and the audit reports it. |
| `5. con una versión nueva, la versión vieja se lee igual y se dice que no es la vigente` | Pass | With a newer version, the older version reads the same and is reported as not current. |
| `6. con el reloj vencido la autorización se niega, y dice cuándo venció` | Pass | With an expired clock, authorization is denied and the expiry is stated. |
| `7. un miembro no autoriza por encima de su presupuesto delegado` | Pass | A member does not authorize above their delegated budget. |
| `8. un cambio que nunca alcanza las firmas queda pendiente, con su motivo` | Pass | A change that never reaches the signatures stays pending, with its reason. |

These results describe what the assertions observed in the supplied run of 2026-10-09 against the vendored Vespi 0.1.5 copy. They cover only the behavior these cases exercise; they do not establish that Escribano is ready for use. The source code and test files are not in this public repository.

## What the earlier project phase establishes

The project phase record states that the written agreement preceded implementation, the eight adversarial cases were written first and observed red, and a complete terminal walkthrough was built. It also records the kernel cut installed at that time (Lore Plugin 2.4.9-rc.5, candidate kernel 0.1.3) with module digests fixed by the project tests; the 2026-10-03 capture was red against that cut, and the project has since re-pinned to 0.1.5. These are project phase records, not source artifacts that can be independently inspected in this checkout.

The nine Vespi projects with code were recorded as built against that same earlier cut on 2026-09-29, with green suites at that cut. That historical record does not mean their suites are green against the installed kernel today. No Escribano testnet transactions or chain receipts are claimed.

## Rerunning the suite

The package manifest defines the test command as `node --test "test/*.test.js"`, and the source README documents the same suite command. The project says it has no dependencies to install and is run on Node 24; the supplied run used Node v24.15.0. The code is in this repository under the review-only license, which permits reading and cloning for evaluation but not modification or redistribution. From the project root, run `npm test` on Node 24; the suite should report the same count as the reference capture in [`suite-2026-10-09.txt`](./suite-2026-10-09.txt): 13 tests, all passing, none skipped.

# Español

## Resultado actual

La corrida proporcionada del 2026-10-09 informa **13 pruebas: 13 aprobadas, 0 omitidas** sobre Node v24.15.0. La captura, guardada en [`suite-2026-10-09.txt`](./suite-2026-10-09.txt), es la referencia de estos conteos y de estos nombres de prueba. El repositorio público incluye los archivos de prueba y el código fuente bajo la licencia de solo revisión, por lo que se puede repetir desde esta copia con `npm test`.

La corrida ejecutó `node --test test/*.test.js` en un clon limpio del proyecto privado, con HOME vacío y sin red. El núcleo es Vespi 0.1.5, commit `ed559e83c976dd6e6a379a5510db776206f670b4`, copiado dentro del proyecto en `vendor/vespi-kernel`; las comprobaciones de frontera comparan esa copia contra su `SOURCE.md`, módulo por módulo y commit por commit.

### Por qué la captura anterior estaba en rojo

La captura anterior, del 2026-10-03, estaba en rojo porque el proyecto estaba fijado a un corte anterior del núcleo (0.1.3). Esa re-fijación ya está hecha: esta corrida comprueba la copia vendorizada de 0.1.5 contra su propio `SOURCE.md`, y todas las comprobaciones pasan. El resultado anterior se conserva como historial; no es el estado actual.

## Las 13 pruebas

### Frontera del núcleo e interfaz esperada

| Nombre de la prueba | Resultado | Qué muestra la corrida proporcionada |
|---|---|---|
| `la copia del núcleo que Escribano consume es la vendorizada, y solo esa` | Pasa | La copia consumida es la vendorizada, no el árbol de desarrollo. |
| `el núcleo es el corte fijado, módulo por módulo` | Pasa | Cada módulo coincide con el corte fijado para la copia vendorizada. |
| `los ocho encabezados declaran el mismo commit fijado` | Pasa | Los ocho encabezados declaran el mismo commit fijado. |
| `el SOURCE.md vendido declara los mismos ocho módulos que este proyecto espera` | Pasa | El `SOURCE.md` vendido declara los ocho módulos que el proyecto espera. |
| `lo que el núcleo exporta es lo que este proyecto usa, y existe` | Pasa | Existen las exportaciones esperadas. |

### Casos adversariales

El registro de fases del proyecto dice que los ocho casos se escribieron primero y se observaron en rojo antes de implementar. En esta corrida, las ocho aserciones pasan.

| Nombre de la prueba | Resultado | Qué muestra la corrida proporcionada |
|---|---|---|
| `1. un cambio sin quórum no entra, y vuelve con la salida que lo dice` | Pasa | Un cambio sin quórum no entra, y el rechazo lleva la salida que lo dice. |
| `2. la firma de un miembro revocado no cuenta, y el rechazo lo nombra` | Pasa | La firma de un miembro revocado no cuenta, y el rechazo lo nombra. |
| `3. el mismo cambio dos veces es un cambio: una entrada, el mismo sello` | Pasa | El mismo cambio dos veces es un cambio: una entrada, el mismo sello. |
| `4. un historial alterado a mano rompe la cadena y la auditoría lo dice` | Pasa | Un historial alterado a mano rompe la cadena, y la auditoría lo dice. |
| `5. con una versión nueva, la versión vieja se lee igual y se dice que no es la vigente` | Pasa | Con una versión nueva, la vieja se lee igual y se dice que no es la vigente. |
| `6. con el reloj vencido la autorización se niega, y dice cuándo venció` | Pasa | Con el reloj vencido la autorización se niega, y dice cuándo venció. |
| `7. un miembro no autoriza por encima de su presupuesto delegado` | Pasa | Un miembro no autoriza por encima de su presupuesto delegado. |
| `8. un cambio que nunca alcanza las firmas queda pendiente, con su motivo` | Pasa | Un cambio que nunca alcanza las firmas sigue pendiente, con su motivo. |

Estos resultados describen lo que observaron las aserciones en la corrida proporcionada del 2026-10-09 contra la copia vendorizada de Vespi 0.1.5. Cubren solo el comportamiento que ejercen estos casos; no establecen que Escribano esté listo para usarse. El código y las pruebas no están en este repositorio público.

## Qué establece la fase anterior del proyecto

El registro de fases del proyecto dice que el acuerdo escrito precedió a la implementación, que los ocho casos adversariales se escribieron primero y se observaron en rojo, y que se construyó un recorrido completo por terminal. También registra el corte del núcleo instalado en ese momento (Lore Plugin 2.4.9-rc.5, núcleo candidato 0.1.3) con digests de módulos fijados por las pruebas del proyecto; la captura del 2026-10-03 quedó en rojo contra ese corte, y el proyecto ya re-fijó el núcleo a 0.1.5. Son registros de fase del proyecto, no artefactos de código que se puedan inspeccionar por separado en esta copia.

El registro histórico dice que los nueve proyectos de Vespi con código se construyeron contra ese mismo corte anterior el 2026-09-29 y tenían suites verdes en ese corte. Ese antecedente no implica que sus suites estén verdes contra el núcleo instalado de hoy. No se afirman transacciones de Escribano en testnet ni recibos en cadena.

## Cómo repetir la corrida

El manifiesto del paquete define el comando de pruebas como `node --test "test/*.test.js"`, y el README fuente documenta el mismo comando para la suite. El proyecto dice que no requiere instalar dependencias y que se ejecuta con Node 24; la corrida proporcionada usó Node v24.15.0. El código está en este repositorio bajo la licencia de solo revisión, que permite leer y clonar para evaluar, no modificar ni redistribuir. Desde la raíz del proyecto, ejecuta `npm test` con Node 24; la suite debe informar el mismo conteo que la captura de referencia en [`suite-2026-10-09.txt`](./suite-2026-10-09.txt): 13 pruebas, todas aprobadas, ninguna omitida.
