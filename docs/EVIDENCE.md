# Evidence

## Current result

The supplied run dated 2026-10-03 reports **8 passing tests out of 13 and 5 failures**. The public repository does not contain the test files or source code, so the run cannot be repeated from this checkout.

The five failures are one kernel digest check and four adversarial assertions. The pin expects `continuity.js` to match its earlier fixed SHA-256 digest, but the installed copy has a different digest. This is the kernel pin: it records the exact kernel cut the project was written against. A moved digest does not prove the newer file is incorrect; it means the project has not reviewed and deliberately accepted that changed file. Keeping the check red until that decision is made prevents an unnoticed kernel change from being treated as the approved boundary.

The other four failures are behavioral mismatches: the missing-quorum detail, the revoked-member detail, repeated identical-change behavior, and reading an earlier version. The observed output and the assertion's expected behavior are kept distinct below.

## The 13 tests

### Kernel boundary and expected interface

| Test name | Result | What the supplied run shows |
|---|---|---|
| `la copia del núcleo que Escribano consume está instalada, no es el árbol de desarrollo` | Pass | The consumed copy is the installed copy. |
| `el núcleo es el corte fijado, módulo por módulo` | Fail | `continuity.js` differs from the fixed digest. |
| `los cinco encabezados declaran el mismo commit fijado` | Pass | All five headers report the fixed commit. |
| `el SOURCE.md instalado declara los mismos cinco módulos que este proyecto espera` | Pass | The declared module list matches the expected modules. |
| `lo que el núcleo exporta es lo que este proyecto usa, y existe` | Pass | The expected exports exist. |

### Adversarial cases

The project phase record says these eight cases were written and each was observed failing before implementation. The current run passes four assertions and fails four.

| Test name | Result | What the supplied run shows |
|---|---|---|
| `1. un cambio sin quórum no entra, y vuelve con la salida que lo dice` | Fail | Actual detail: `missing 3 approvals (0 of 3)`. The assertion expects `missing 1 approval (2 of 3)`. |
| `2. la firma de un miembro revocado no cuenta, y el rechazo lo nombra` | Fail | The observed detail again reports `missing 3 approvals (0 of 3)` where the assertion expects two of three counted. |
| `3. el mismo cambio dos veces es un cambio: una entrada, el mismo sello` | Fail | The assertion expected a founding entry plus one change, but observed one entry. |
| `4. un historial alterado a mano rompe la cadena y la auditoría lo dice` | Pass | The assertion detects the hand-altered history. |
| `5. con una versión nueva, la versión vieja se lee igual y se dice que no es la vigente` | Fail | The assertion expected current version 2 but observed version 1. |
| `6. con el reloj vencido la autorización se niega, y dice cuándo venció` | Pass | The assertion observes the expired authorization being denied with its expiry detail. |
| `7. un miembro no autoriza por encima de su presupuesto delegado` | Pass | The assertion observes the delegated budget limit. |
| `8. un cambio que nunca alcanza las firmas queda pendiente, con su motivo` | Pass | The assertion observes an under-quorum proposal staying pending. |

These results describe what the assertions observed on the supplied host and kernel version. They do not establish that Escribano is ready for use. The source code and test files are not in this public repository.

## What the earlier project phase establishes

The project phase record states that the written agreement preceded implementation, the eight adversarial cases were written first and observed failing, and a complete terminal walkthrough was built. It also records the installed kernel cut as Lore Plugin 2.4.9-rc.5, candidate kernel 0.1.3, commit `54c20c7`, with five module digests fixed by the project tests. The supplied current run now reports that the `continuity.js` digest differs from the expected value. These are project phase records, not source artifacts that can be independently inspected in this checkout.

The nine Vespi projects with code were recorded as built against cut `54c20c7` on 2026-09-29, with green suites at that cut. That historical record does not mean their suites are green against the installed kernel today. No Escribano testnet transactions or chain receipts are claimed.

## Rerunning when code opens

The package manifest defines the test command as `node --test "test/*.test.js"`, and the source README documents the same suite command. The project says it has no dependencies to install and requires Node.js 18 or later. The code is intended to open during the judges' review period under the review-only license. These instructions are for that future code checkout; they cannot be run from this documentation-only repository.

## Español

### Resultado actual

La corrida proporcionada del 2026-10-03 informa **8 pruebas aprobadas de 13 y 5 fallidas**. El repositorio público no incluye los archivos de prueba ni el código fuente, por lo que no se puede repetir desde esta copia.

Los cinco fallos son una comprobación del digest del núcleo y cuatro aserciones adversariales. El pin espera que `continuity.js` coincida con un digest SHA-256 fijado antes, pero la copia instalada tiene otro digest. Este es el pin del núcleo: registra el corte exacto contra el que se escribió el proyecto. Un digest distinto no demuestra que el archivo nuevo sea incorrecto; significa que el proyecto aún no revisó y aceptó deliberadamente ese archivo. Mantener la comprobación en rojo hasta tomar esa decisión evita tratar un cambio de núcleo inadvertido como si fuera una frontera aprobada.

Los otros cuatro fallos son diferencias de comportamiento: el detalle del quórum insuficiente, el detalle del miembro revocado, el comportamiento ante cambios idénticos repetidos y la lectura de una versión anterior. La salida observada y el comportamiento esperado por la aserción se distinguen a continuación.

### Las 13 pruebas

#### Frontera del núcleo e interfaz esperada

| Nombre de la prueba | Resultado | Qué muestra la corrida proporcionada |
|---|---|---|
| `la copia del núcleo que Escribano consume está instalada, no es el árbol de desarrollo` | Pasa | La copia consumida es la instalada. |
| `el núcleo es el corte fijado, módulo por módulo` | Falla | `continuity.js` tiene un digest distinto al fijado. |
| `los cinco encabezados declaran el mismo commit fijado` | Pasa | Los cinco encabezados informan el commit fijado. |
| `el SOURCE.md instalado declara los mismos cinco módulos que este proyecto espera` | Pasa | La lista declarada de módulos coincide con los módulos esperados. |
| `lo que el núcleo exporta es lo que este proyecto usa, y existe` | Pasa | Existen las exportaciones esperadas. |

#### Casos adversariales

El registro de fases del proyecto dice que los ocho casos se escribieron y se observaron fallar antes de implementar. La corrida actual aprueba cuatro aserciones y falla cuatro.

| Nombre de la prueba | Resultado | Qué muestra la corrida proporcionada |
|---|---|---|
| `1. un cambio sin quórum no entra, y vuelve con la salida que lo dice` | Falla | Detalle observado: `missing 3 approvals (0 of 3)`. La aserción espera `missing 1 approval (2 of 3)`. |
| `2. la firma de un miembro revocado no cuenta, y el rechazo lo nombra` | Falla | El detalle observado vuelve a informar `missing 3 approvals (0 of 3)` cuando la aserción espera que cuenten dos de tres. |
| `3. el mismo cambio dos veces es un cambio: una entrada, el mismo sello` | Falla | La aserción esperaba una entrada fundacional y un cambio, pero observó una entrada. |
| `4. un historial alterado a mano rompe la cadena y la auditoría lo dice` | Pasa | La aserción detecta el historial alterado a mano. |
| `5. con una versión nueva, la versión vieja se lee igual y se dice que no es la vigente` | Falla | La aserción esperaba que la versión vigente fuera la 2, pero observó la versión 1. |
| `6. con el reloj vencido la autorización se niega, y dice cuándo venció` | Pasa | La aserción observa que se rechaza la autorización vencida y se informa el vencimiento. |
| `7. un miembro no autoriza por encima de su presupuesto delegado` | Pasa | La aserción observa el límite de presupuesto delegado. |
| `8. un cambio que nunca alcanza las firmas queda pendiente, con su motivo` | Pasa | La aserción observa que una propuesta sin quórum sigue pendiente. |

Estos resultados describen lo observado por las aserciones en el host y la versión del núcleo de la corrida proporcionada. No establecen que Escribano esté listo para usarse. El código y las pruebas no están en este repositorio público.

### Qué establece la fase anterior del proyecto

El registro de fases del proyecto dice que el acuerdo escrito precedió a la implementación, que los ocho casos adversariales se escribieron primero y se observaron fallar, y que se construyó un recorrido completo por terminal. También registra que el corte del núcleo instalado era Lore Plugin 2.4.9-rc.5, núcleo candidato 0.1.3, commit `54c20c7`, con cinco digests de módulos fijados por las pruebas del proyecto. La corrida actual proporcionada informa que el digest de `continuity.js` ya no coincide con el valor esperado. Son registros de fase del proyecto, no artefactos de código que se puedan inspeccionar por separado en esta copia.

El registro histórico dice que los nueve proyectos de Vespi con código se construyeron contra el corte `54c20c7` el 2026-09-29 y tenían suites verdes en ese corte. Ese antecedente no implica que sus suites estén verdes contra el núcleo instalado de hoy. No se afirman transacciones de Escribano en testnet ni recibos en cadena.

### Cómo repetir la corrida cuando se abra el código

El manifiesto del paquete define el comando de pruebas como `node --test "test/*.test.js"`, y el README fuente documenta el mismo comando para la suite. El proyecto dice que no requiere instalar dependencias y que necesita Node.js 18 o posterior. Está previsto abrir el código durante el periodo de revisión de los jueces bajo la licencia de solo revisión. Estas instrucciones corresponden a esa futura copia con código; no se pueden ejecutar desde este repositorio que solo contiene documentación.
