# Code not included

## What this repository contains

This public repository contains the project agreement and review documentation, not Escribano's source code or test files. That means the described terminal flow cannot be independently run from this checkout. The evidence page reports a supplied test run and distinguishes its passing and failing assertions; it does not ask readers to treat that snapshot as a working product.

## Review period

The project plan says the source is intended to open during the judges' review period under the review-only license in [LICENSE](./LICENSE). That license governs what reviewers may do with the code. The intended opening is a project plan, not a claim that the code is available in this repository today.

For the current review, begin with the [agreement walkthrough](./docs/HOW_IT_WORKS.md), compare it with [the test record](./docs/EVIDENCE.md), and read the [legal and verification limits](./docs/LEGAL_AND_LIMITS.md). Together, those documents separate intended behavior from the behavior shown in the supplied run.

## When source becomes available

The source project's package manifest specifies Node.js 18 or later and defines the suite command as `node --test "test/*.test.js"`. The source README says there are no dependencies to install. The current public checkout does not contain the package manifest, source files, or tests, so those instructions cannot be used here to reproduce the recorded 8/13 result.

## Español

### Qué contiene este repositorio

Este repositorio público contiene el acuerdo del proyecto y documentación de revisión, no el código fuente ni los archivos de prueba de Escribano. Por eso, el recorrido de terminal descrito no se puede ejecutar por cuenta propia desde esta copia. La página de evidencia informa una corrida proporcionada y distingue las aserciones aprobadas y fallidas; no pide tratar esa fotografía como un producto listo.

### Periodo de revisión

El plan del proyecto dice que está previsto abrir el código durante el periodo de revisión de los jueces bajo la licencia de solo revisión de [LICENSE](./LICENSE). Esa licencia establece lo que pueden hacer quienes revisan el código. La apertura prevista es parte del plan del proyecto, no una afirmación de que hoy el código esté disponible en este repositorio.

Para esta revisión, empieza por el [recorrido del acuerdo](./docs/HOW_IT_WORKS.md), compáralo con [el registro de pruebas](./docs/EVIDENCE.md) y lee los [límites jurídicos y de verificación](./docs/LEGAL_AND_LIMITS.md). En conjunto, esos documentos separan el comportamiento previsto del que muestra la corrida proporcionada.

### Cuando esté disponible el código

El manifiesto del proyecto fuente especifica Node.js 18 o posterior y define el comando de la suite como `node --test "test/*.test.js"`. El README fuente dice que no hay dependencias que instalar. Esta copia pública no incluye el manifiesto, los archivos fuente ni las pruebas, así que esas instrucciones no sirven aquí para reproducir el resultado 8/13.
