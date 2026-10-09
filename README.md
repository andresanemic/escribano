[![Escribano cover](./assets/cover.png)](./assets/cover.png)

# Escribano

<p align="center">
  <a href="#english"><img src="https://img.shields.io/badge/status-prototype-D7B698?style=for-the-badge&labelColor=07111A" alt="Status: prototype"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-review--only-D7B698?style=for-the-badge&labelColor=07111A" alt="Review-only license"></a>
  <a href="./docs/EVIDENCE.md"><img src="https://img.shields.io/badge/suite-13_of_13_pass-D7B698?style=for-the-badge&labelColor=07111A" alt="Suite: all 13 pass"></a>
  <a href="#english"><img src="https://img.shields.io/badge/agreement-written_before_code-E0C170?style=for-the-badge&labelColor=07111A" alt="Agreement written before code"></a>
  <a href="https://github.com/andresanemic/vespi"><img src="https://img.shields.io/badge/built_with-Vespi_%C2%B7_Lore_Plugin-E0C170?style=for-the-badge&labelColor=07111A" alt="Built with Vespi and Lore Plugin"></a>
  <a href="https://github.com/andresanemic/vespi/tree/ed559e83c976dd6e6a379a5510db776206f670b4"><img src="https://img.shields.io/badge/kernel-0.1.5_release-ed559e8?style=for-the-badge&labelColor=07111A&color=E0C170" alt="Kernel: 0.1.5 release (commit ed559e8)"></a>
</p>

<p align="center"><strong>Public contract, private logjam.</strong> The delay between a promise and its fulfillment, with no way to explain who authorized it: a real public contract only reaches today's text, and Escribano makes the version history of a fictional DAO consultable, with its receipt and its authorization trail, showing 13 of 13 tests passing in the 2026-10-09 run. It is not a register, nor proof of identity, nor a thing with legal effect; this checkout holds only the agreement and review documents, without source code.</p>

<p align="center"><strong>Contrato público, atasco privado.</strong> El retraso entre una promesa y su cumplimiento, sin forma de explicar quién lo autorizó: un contrato público real solo llega hasta el texto vigente, y Escribano deja consultar el historial de versiones de una DAO ficticia, con su recibo y su rastro de autorizaciones, con evidencia de 13 de 13 pruebas aprobadas en la corrida del 2026-10-09. No es un registro, ni prueba de identidad, ni efecto jurídico; esta copia solo contiene el acuerdo y los documentos de revisión, sin código fuente.</p>

<p align="center"><strong>A local record for every change to a fictional DAO's governing contract, with its receipt, its authorization trail, and its place in the version history.</strong></p>

<p align="center">A public contract can tell you what the rule says today. It cannot, by itself, tell a new member who changed it, which approvals counted, or what the earlier version said.</p>

<p align="center">This repository contains the agreement and review documents. It does not include the source code.</p>

---

<details>
<summary><b>Read in English</b></summary>

<a id="english"></a>

**Escribano keeps a readable local record of each change to a fictional DAO's governing contract.**

> **The unit is the change and its receipt: what changed, who authorized it, and how it follows the previous version.**

### Why

Imagine joining an organization after a difficult decision. You can find the current contract, but the person who kept the old copies has left. The document does not tell you which version came first, who approved the change, or why a proposal that lacked enough support was refused. A record that keeps only today's text leaves that explanation in someone's memory.

Escribano explores a local, append-only history in which a contract change is treated as an event with an identifier and a receipt. The record is meant to let a reader follow the change back through earlier versions. The project is a software model of that form; it is not a legal register or a filing service.

### If you are judging Find Your Way or Meridian, start here

- Read the project foundation and its walkthrough. Start with [How it works](./docs/HOW_IT_WORKS.md).
- Open the test record. See [Evidence](./docs/EVIDENCE.md).
- Read the legal and verification limits. See [Legal and limits](./docs/LEGAL_AND_LIMITS.md).
- Review the publication conditions. See [Code not included](./CODE_NOT_INCLUDED.md) and the [review-only license](./LICENSE).

### In one minute

In a fictional DAO called La Fragua, a member proposes changing the contract's notice period. Bruna, Nilo, and Sabina are fictional members. The proposal does not change the contract by itself. Each person's authority must still be current and within its budget, expiry, and origin; the project counts distinct member identities toward its three-approval threshold. If support is short, the proposal stays pending. If the threshold is met, the intended flow records the change and a receipt in a local append-only file. A reader can then inspect the current version and walk back through the history. The names and scenario are invented for explanation, not evidence of a real organization or filing.

### What it looks like in practice

The source README documents a terminal walkthrough using fictional member names. These are the documented commands, not output reproduced from this public checkout:

```sh
node src/cli.js proponer c-1 plazo "60 dias"
node src/cli.js firmar c-1 bruna
node src/cli.js decidir c-1 bruna,nilo
node src/cli.js firmar c-1 sabina
node src/cli.js decidir c-1 bruna,nilo,sabina
node src/cli.js estado
node src/cli.js historial
node src/cli.js auditar
```

The project rules say the first decision is short of the three-member threshold and leaves the proposal pending. The supplied run dated 2026-10-09 records this case passing: the test `1. un cambio sin quórum no entra, y vuelve con la salida que lo dice`. An earlier capture, dated 2026-10-03, was red because the project was pinned to an older kernel cut (0.1.3); that re-pin is now done. The public repository has no source or test files with which to reproduce the terminal walkthrough.

### Why Escribano

| You need | What it gives you | Where it lives |
|---|---|---|
| To understand how the latest contract came to be | A proposed history of changes, receipts, and earlier versions in a local append-only record | [How it works](./docs/HOW_IT_WORKS.md) |
| To see which people counted toward a change | A model that counts distinct members with current authority, not repeated attestations from one identity | [How it works](./docs/HOW_IT_WORKS.md) |
| To know why authority is bounded | Rules for budget, expiry, origin, delegation, and revocation | [How it works](./docs/HOW_IT_WORKS.md) |
| To distinguish a record check from proof of identity | A separate verification model, with the limits of an unkeyed digest explained | [Legal and limits](./docs/LEGAL_AND_LIMITS.md) |
| To see what was tested and what it covers | Test names, the 2026-10-09 capture, and the recorded result of each case | [Evidence](./docs/EVIDENCE.md) |

### How it works

```text
member proposes a contract change
              |
              v
check authority, limits, and distinct approvals
       |                         |
threshold not met                threshold met
       |                         |
       v                         v
proposal stays pending     append local entry + receipt
                                   |
                       current version + full history
                                   |
                     separate verifier checks the record
```

| Actor | Rights in the model | Limits |
|---|---|---|
| Proposer | Any member can propose a change. | A proposal is not an approval and does not change the contract. |
| Members | A member with current authority can attest to a proposal. | Membership alone is not authority. Attestations are fictional and local, not cryptographic signatures. |
| Authorization giver | Grants, delegates, or revokes authority with a budget, expiry, and origin. | Delegation can only reduce authority. Revocation affects future changes and does not erase accepted history. |
| Verifier | Recalculates from the stored record separately from the execution report. | It checks the supplied local data; it does not establish identity, truth, or legal effect. |
| Reader | Reads the current state and full history without special authority. | Reading does not grant power to change the contract. |

The illustrated flow uses three distinct approvals. That threshold is a project design choice. The cited Wyoming provisions do not set a multiple-signature requirement for changing a contract.

### What it is not

Escribano is not a legal filing, a legal register, a deployed smart contract, a DAO service, a cryptographic signature system, a blockchain anchor, or legal advice. Its people and approvals are fictional local attestations. Its receipt digest cannot prove who wrote a record or when it existed.

### Evidence you can open

The supplied run dated 2026-10-09 reports **13 tests, all passing and none skipped** on Node v24.15.0. It ran `node --test test/*.test.js` in a clean clone of the private project with an empty HOME and no network. The kernel is Vespi **0.1.5**, commit `ed559e8`, copied into the project at `vendor/vespi-kernel`, and the suite checks that copy against its `SOURCE.md`, module by module and commit by commit. An earlier capture, dated 2026-10-03, was red because the project was pinned to an older kernel cut (0.1.3); that re-pin is since done.

All eight adversarial assertions pass in this run: the missing-quorum detail, the revoked-member detail, identical-change idempotency, reading an older version, altered-history detection, expired authorization, delegated-budget limits, and leaving an under-quorum proposal pending. The phase record says all eight cases were written first and observed red before implementation. See the exact test names and recorded outcomes in [Evidence](./docs/EVIDENCE.md).

The public checkout contains no test files or source code, so this capture cannot be rerun here. The result describes what these thirteen tests exercise; it does not establish a finished or ready-to-use product.

### Escribano, Vespi, and Lore Plugin

Escribano consumes Vespi's kernel and the agreement says it does not modify it. The documented design uses the kernel's authority checks, operation receipts, verification separate from execution, and continuity reconstructed from the record. Lore Plugin supplies the installed project context from which Escribano's kernel copy was selected. The current public checkout does not include code for an independent inspection of those integrations. [Vespi](https://github.com/andresanemic/vespi) is the kernel project; [Lore Plugin](https://github.com/andresanemic/lore-plugin) provides the host context described by the agreement.

**What this relationship means.** The project was built with Lore Plugin's method (its agreement and criterion live in the project, in `acuerdo.md` and `lore/`), and its operations, authority and receipts run on the Vespi kernel 0.1.5, in the pinned copy that Lore Plugin 2.5.1 distributes (`skills/vespi/core/kernel`). That copy sits in the project as `vendor/vespi-kernel` and the suite verifies it against its `SOURCE.md`. Lore Plugin does not run inside the project. This project does not use the kernel's newer capabilities (Stellar pubnet anchors, live x402 settlement, the ZK verifier, emergency access); it exercises the core of operations, authority and receipts.

### What it does not do, and what is not verified

Escribano does not submit documents to Wyoming, amend filed articles, confer DAO status, create a legal entity, deploy a contract, write to a blockchain, or produce a deposit with legal effect. The agreement cites Wyoming W.S. 17-31 as a reference for the shape of a record with an identifier and update history. It does not claim legal compliance. The project has not been compared with an actual filing process or reviewed by a competent legal professional.

The records and member names are synthetic. Approvals are local attestations, not cryptographic signatures. SHA-256 is unkeyed: someone who can rewrite the local file can recalculate its digest, so it does not prove authenticity or time of creation. There is no blockchain or testnet anchor; the receipt anchor is described as `pending`. The supplied run of 2026-10-09 passes its 13 tests, and readiness for use is not established. More detail is in [Legal and limits](./docs/LEGAL_AND_LIMITS.md).

### How to review this project

Start with the agreement's model and the walkthrough in [How it works](./docs/HOW_IT_WORKS.md). Compare intended behavior with the recorded results in [Evidence](./docs/EVIDENCE.md), then read [Legal and limits](./docs/LEGAL_AND_LIMITS.md) and [Code not included](./CODE_NOT_INCLUDED.md). Today this repository contains documentation rather than source code. The code is intended to open during the judges' review period under the [review-only license](./LICENSE), whose terms govern reading and evaluation.

### Author

**Andrés Peña**, repository authority: `andresanemic`.

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[How it works](./docs/HOW_IT_WORKS.md) · [Evidence](./docs/EVIDENCE.md) · [Legal and limits](./docs/LEGAL_AND_LIMITS.md) · [Code not included](./CODE_NOT_INCLUDED.md) · [Review-only license](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>

<details>
<summary><b>Leer en español</b></summary>

**Escribano conserva un registro local y legible de cada cambio al contrato rector de una DAO ficticia.**

> **La unidad es el cambio y su recibo: qué cambió, quién lo autorizó y cómo sigue a la versión anterior.**

### Por qué

Imagina que te incorporas a una organización después de una decisión difícil. Encuentras el contrato vigente, pero la persona que guardaba las copias anteriores ya no está. El documento no te dice qué versión fue primero, quién aprobó el cambio ni por qué se rechazó una propuesta que no tenía suficiente apoyo. Si solo se conserva el texto de hoy, esa explicación queda en la memoria de alguien.

Escribano explora un historial local append-only en el que cada cambio del contrato se trata como un evento con identificador y recibo. El registro busca que quien lo lea pueda seguir el cambio hacia atrás, hasta las versiones anteriores. Es un modelo de software para esa forma de registro, no un registro legal ni un servicio de presentación.

### Si estás evaluando Find Your Way o Meridian, empieza aquí

- Lee la base del proyecto y su recorrido. Empieza por [Cómo funciona](./docs/HOW_IT_WORKS.md).
- Abre el registro de pruebas. Consulta [Evidencia](./docs/EVIDENCE.md).
- Lee los límites jurídicos y de verificación. Consulta [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md).
- Revisa las condiciones de publicación. Consulta [Código no incluido](./CODE_NOT_INCLUDED.md) y la [licencia de solo revisión](./LICENSE).

### En un minuto

En una DAO ficticia llamada La Fragua, una persona propone cambiar el plazo de aviso del contrato. Bruna, Nilo y Sabina son miembros ficticios. La propuesta no cambia el contrato por sí sola. La autoridad de cada persona debe seguir vigente y respetar su presupuesto, vencimiento y origen; para el umbral de tres aprobaciones del proyecto cuentan identidades distintas. Si falta apoyo, la propuesta queda pendiente. Si se alcanza el umbral, el flujo previsto registra el cambio y un recibo en un archivo local append-only. Después, cualquiera puede revisar la versión actual y recorrer el historial hacia atrás. Los nombres y el caso son inventados para explicar el modelo, no son evidencia de una organización o presentación real.

### Cómo se ve en la práctica

El README fuente documenta un recorrido de terminal con nombres de miembros ficticios. Estos son los comandos documentados, no una salida reproducida desde esta copia pública:

```sh
node src/cli.js proponer c-1 plazo "60 dias"
node src/cli.js firmar c-1 bruna
node src/cli.js decidir c-1 bruna,nilo
node src/cli.js firmar c-1 sabina
node src/cli.js decidir c-1 bruna,nilo,sabina
node src/cli.js estado
node src/cli.js historial
node src/cli.js auditar
```

Las reglas del proyecto indican que la primera decisión no alcanza el umbral de tres miembros y deja la propuesta pendiente. La corrida proporcionada del 2026-10-09 registra este caso como aprobado: la prueba `1. un cambio sin quórum no entra, y vuelve con la salida que lo dice`. La captura anterior, del 2026-10-03, estaba en rojo porque el proyecto estaba fijado a un corte anterior del núcleo (0.1.3); esa re-fijación ya está hecha. El repositorio público no incluye el código ni las pruebas para repetir aquí el recorrido de terminal.

### Por qué Escribano

| Necesitas | Qué te da | Dónde vive |
|---|---|---|
| Entender cómo se llegó al contrato vigente | Un historial propuesto de cambios, recibos y versiones anteriores en un registro local append-only | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Ver quién contó para un cambio | Un modelo que cuenta miembros distintos con autoridad vigente, no varias atestaciones de una identidad | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Saber qué límites tiene la autoridad | Reglas de presupuesto, vencimiento, origen, delegación y revocación | [Cómo funciona](./docs/HOW_IT_WORKS.md) |
| Distinguir una revisión del registro de una prueba de identidad | Un modelo de verificación separado y los límites de un digest sin clave | [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) |
| Saber qué se probó y qué cubre | Nombres de pruebas, la captura del 2026-10-09 y el resultado registrado de cada caso | [Evidencia](./docs/EVIDENCE.md) |

### Cómo funciona

```text
un miembro propone un cambio al contrato
               |
               v
revisar autoridad, límites y aprobaciones distintas
       |                          |
no alcanza el umbral              alcanza el umbral
       |                          |
       v                          v
queda pendiente             agregar entrada local + recibo
                                      |
                         versión actual + historial completo
                                      |
                      verificador aparte revisa el registro
```

| Actor | Derechos en el modelo | Límites |
|---|---|---|
| Quien propone | Cualquier miembro puede proponer un cambio. | Proponer no es aprobar ni cambia el contrato. |
| Miembros | Quien tiene autoridad vigente puede atestiguar una propuesta. | Ser miembro no basta para tener autoridad. Las atestaciones son ficticias y locales, no firmas criptográficas. |
| Persona que otorga autorizaciones | Otorga, delega o revoca autoridad con presupuesto, vencimiento y origen. | Delegar solo puede reducir autoridad. Revocar afecta cambios futuros y no borra el historial aceptado. |
| Verificador | Recalcula desde el registro almacenado, por separado del informe de ejecución. | Comprueba los datos locales recibidos; no establece identidad, verdad ni efecto legal. |
| Lector | Lee el estado actual y el historial completo sin autoridad especial. | Leer no concede poder para cambiar el contrato. |

El flujo ilustrado usa tres aprobaciones distintas. Ese umbral es una decisión de diseño del proyecto. Los artículos de Wyoming citados no establecen un requisito de varias firmas para cambiar un contrato.

### Qué no es

Escribano no es una presentación legal, un registro jurídico, un contrato inteligente desplegado, un servicio DAO, un sistema de firmas criptográficas, un anclaje en blockchain ni asesoría jurídica. Sus personas y aprobaciones son atestaciones locales ficticias. El digest del recibo no puede probar quién escribió el registro ni cuándo existía.

### Evidencia que puedes abrir

La corrida proporcionada del 2026-10-09 informa **13 pruebas, todas aprobadas y ninguna omitida** sobre Node v24.15.0. Corrió `node --test test/*.test.js` en un clon limpio del proyecto privado, con HOME vacío y sin red. El núcleo es Vespi **0.1.5**, commit `ed559e8`, copiado dentro del proyecto en `vendor/vespi-kernel`, y la suite verifica esa copia contra su `SOURCE.md`, módulo por módulo y commit por commit. La captura anterior, del 2026-10-03, estaba en rojo porque el proyecto estaba fijado a un corte anterior del núcleo (0.1.3); esa re-fijación ya está hecha.

Las ocho aserciones adversariales pasan en esta corrida: el detalle del quórum insuficiente, el detalle del miembro revocado, la idempotencia de un cambio repetido, la lectura de una versión anterior, la detección de historial alterado, la autorización vencida, los límites de presupuesto delegado y dejar pendiente una propuesta sin quórum. El registro de fases dice que los ocho casos se escribieron primero y se observaron en rojo antes de implementar. [Evidencia](./docs/EVIDENCE.md) conserva sus nombres y resultados registrados.

La copia pública no incluye los archivos de pruebas ni el código, así que no se puede repetir aquí esta corrida. El resultado describe lo que ejercen estas trece pruebas; no demuestra que el producto esté terminado ni listo para usarse.

### Escribano, Vespi y Lore Plugin

Escribano consume el núcleo de Vespi y, según el acuerdo, no lo modifica. El diseño documentado usa las comprobaciones de autoridad del núcleo, recibos de operaciones, verificación separada de la ejecución y continuidad reconstruida desde el registro. Lore Plugin aporta el contexto instalado del que se seleccionó la copia del núcleo. La copia pública actual no incluye código para inspeccionar esas integraciones por cuenta propia. [Vespi](https://github.com/andresanemic/vespi) es el proyecto del núcleo; [Lore Plugin](https://github.com/andresanemic/lore-plugin) aporta el contexto de hosts descrito en el acuerdo.

**Qué significa esta relación.** El proyecto se construyó con el método de Lore Plugin (su acuerdo y su criterio viven en el proyecto, en `acuerdo.md` y `lore/`), y sus operaciones, autoridad y recibos corren sobre el kernel de Vespi 0.1.5, en la copia fijada que distribuye Lore Plugin 2.5.1 (`skills/vespi/core/kernel`). Esa copia está en el proyecto como `vendor/vespi-kernel` y la suite la verifica contra su `SOURCE.md`. Lore Plugin no corre dentro del proyecto. Este proyecto no usa las capacidades nuevas del kernel (anclas Stellar pubnet, liquidación x402 en vivo, el verificador ZK, el acceso de emergencia); ejerce el núcleo de operaciones, autoridad y recibos.

### Qué no hace y qué no está verificado

Escribano no presenta documentos en Wyoming, no enmienda artículos depositados, no confiere condición de DAO, no crea una persona jurídica, no despliega contratos, no escribe en una blockchain ni produce un depósito con efecto legal. El acuerdo cita Wyoming W.S. 17-31 como referencia para la forma de un registro con identificador e historial de actualizaciones. No afirma cumplimiento legal. El proyecto no se ha comparado con un proceso real de presentación ni lo ha revisado una persona competente en derecho.

Los registros y nombres de miembros son sintéticos. Las aprobaciones son atestaciones locales, no firmas criptográficas. SHA-256 no usa una clave: quien pueda reescribir el archivo local también puede recalcular su digest, por lo que no prueba autenticidad ni fecha de creación. No hay anclaje en blockchain ni testnet; el anclaje del recibo figura como `pending`. La corrida proporcionada del 2026-10-09 aprueba sus 13 pruebas, y no se ha establecido que el proyecto esté listo para usarse. Hay más detalle en [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md).

### Cómo revisar el proyecto

Empieza por el modelo del acuerdo y el recorrido de [Cómo funciona](./docs/HOW_IT_WORKS.md). Compara el comportamiento previsto con los resultados registrados en [Evidencia](./docs/EVIDENCE.md), y luego lee [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) y [Código no incluido](./CODE_NOT_INCLUDED.md). Hoy este repositorio contiene documentación, no código fuente. Está previsto abrir el código durante el periodo de revisión de los jueces bajo la [licencia de solo revisión](./LICENSE), que establece las condiciones de lectura y evaluación.

### Autor

**Andrés Peña**, autoridad del repositorio: `andresanemic`.

[<img src="./assets/icons/v2/telegram.svg" width="28" alt="Telegram">](https://t.me/andresanemic) &nbsp;&nbsp; [<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/icons/v2/x-dark.svg"><img src="./assets/icons/v2/x.svg" width="28" alt="X"></picture>](https://x.com/andresanemic) &nbsp;&nbsp; [<img src="./assets/icons/v2/linkedin.svg" width="28" alt="LinkedIn">](https://www.linkedin.com/in/andresanemic/)

---

[Cómo funciona](./docs/HOW_IT_WORKS.md) · [Evidencia](./docs/EVIDENCE.md) · [Marco legal y límites](./docs/LEGAL_AND_LIMITS.md) · [Código no incluido](./CODE_NOT_INCLUDED.md) · [Licencia de solo revisión](./LICENSE) · [Vespi](https://github.com/andresanemic/vespi) · [Lore Plugin](https://github.com/andresanemic/lore-plugin)

</details>
