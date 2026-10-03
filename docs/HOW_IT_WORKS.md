# How Escribano works

## The model

Escribano is designed as a local, append-only record of changes to a fictional DAO's governing contract. Each accepted change belongs to a version history and is associated with a receipt and the member authorizations counted for it. Anyone holding the record can read the current state and earlier entries.

The agreement defines the change as the meaningful unit: a contract clause or public identifier changes, the event is recorded, and a receipt describes the operation and its checks. The record is intended to be readable without Escribano. It does not submit anything to an authority or write to a blockchain.

All project data are synthetic: a fictional DAO, five fictional members, a fictional contract, and a local record. There are no real members, contributors, third-party records, or blockchain addresses.

## People and permissions

| Actor | What they can do | Boundary |
|---|---|---|
| Proposer | Any member may submit a contract change proposal. | A proposal alone authorizes nothing and does not alter the current contract. |
| Members | A member with a current authorization may attest to a proposal. Distinct member identities count toward the threshold. | Membership alone does not grant signing authority. Attestations are local and fictional, not cryptographic signatures. |
| Authorization giver | Grant or revoke member authorizations. Each authorization has a budget, expiry, and origin. | Revocation affects later changes and does not erase an accepted entry. |
| Verifier | Recalculate from the stored record independently of the execution report. | It checks consistency in the supplied local data; it cannot establish real identity, truth, or legal effect. |
| Reader | Read the current state and full history, including earlier versions. | Read access gives no authority to change the record. |

The design requires more than one distinct member approval; its illustrated workflow and suite use a three-approval threshold. This is a project rule, not a requirement stated by Wyoming W.S. 17-31. Delegated authority may only narrow its parent's budget, time limit, and origin. The budget is a hard limit. An unnamed approval counts as zero, and the agent's own identity is excluded from the member quorum.

## One change, from proposal to history

Consider a fictional DAO changing one clause in its governing contract. The stages below describe the intended flow. The public repository does not contain source code that can run this example today.

1. A member proposes the change. It remains pending and does not alter the current contract.
2. Members attest using their own authorizations. The model checks that each authorization is current, unrevoked, within budget, and attributable to a distinct member.
3. If the required quorum is missing, the proposal stays pending. The intended result identifies the missing approvals and the reason they do not count.
4. When the quorum is met, the intended flow appends a local entry and receipt. The receipt records who counted, what operation was exercised, and what checks were performed under their declared coverage.
5. Identical change content is intended to correspond to one history entry, so retrying does not inflate the record. This behavior is not passing its current assertion; see [Evidence](./EVIDENCE.md).
6. A reader can inspect the current version or walk backward through earlier versions. A separate verifier recalculates from the stored history and checks whether a manual alteration breaks the recorded chain.

```text
proposal
   |
   v
check current authorizations, limits, and distinct approvals
   |
   +---- quorum missing ----> pending, with reasons
   |
   v
quorum met
   |
   v
append local entry + receipt
   |
   +----> current state and full history are readable
   |
   +----> separate verifier recalculates from the store
```

The example in the README uses the fictional names La Fragua, Bruna, Nilo, and Sabina. The documented terminal commands are quoted there as commands from the source README, not as a run from this public checkout. No sample output is invented for a successful change.

## How authority is bounded

An authorization is not a flat permission. It carries an allowed number of operations, an expiry, and an origin. The model checks these separately:

- A member cannot use authority that has expired or been revoked.
- A member cannot spend beyond the authorization's budget.
- Delegating authority cannot increase its parent's budget, extend its time window, or change its origin.
- Several attestations from one member do not count as several distinct approvals.
- Revocation stops future use; it does not rewrite the accepted history.
- Narrowing the DAO's rules, such as raising quorum or reducing budgets, is allowed by the agreement's model. Expanding authority must go through the same contract-change quorum.

The current test snapshot passes the expiry, delegated-budget, and under-quorum-pending assertions. The revoked-member detail assertion fails. These statements describe different evidence: the rules are the intended model, while the test result shows which assertions currently pass.

## What the record and receipt can show

The intended receipt identifies who was counted, what operation was exercised, and what the verifier checked under its declared coverage. The local store holds the receipt digest so the verifier can check the supplied history. The project uses Vespi's receipt format and verification mechanism according to the agreement; Escribano does not modify the kernel.

A plain SHA-256 digest has no secret key. Someone able to rewrite the local file can also recalculate the digest. It can help detect a mismatch against a record being checked, but it does not authenticate the writer or prove when the receipt existed. A successful local verification supports consistency of the inputs checked, not the truth of the claims in those inputs.

The agreement describes the receipt anchor as `pending`. No blockchain or testnet transaction is claimed.

## What this does not prove

Escribano does not create a DAO, establish legal status, amend filed articles, submit documents to a public authority, deploy or update a smart contract, or produce a filing with legal effect. It does not use blockchain or testnet. Member approvals are fictional local attestations, not cryptographic signatures. The record does not establish a person's identity, whether a proposal is true or fair, or whether an organization followed a real legal process.

This repository currently contains documentation rather than the source and test files. The recorded suite result does not establish a finished or ready-to-use product. See [Legal and limits](./LEGAL_AND_LIMITS.md), [Evidence](./EVIDENCE.md), and [Code not included](../CODE_NOT_INCLUDED.md) for those boundaries.

## Español

### El modelo

Escribano está diseñado como un registro local append-only de cambios al contrato rector de una DAO ficticia. Cada cambio aceptado pertenece a un historial de versiones y se asocia con un recibo y las autorizaciones de miembros contadas. Cualquiera que tenga el registro puede leer el estado actual y las entradas anteriores.

El acuerdo define el cambio como la unidad relevante: cambia una cláusula o un identificador público del contrato, se registra el evento y un recibo describe la operación y sus comprobaciones. Se espera que el registro pueda leerse sin Escribano. No presenta nada ante una autoridad ni escribe en una blockchain.

Todos los datos del proyecto son sintéticos: una DAO ficticia, cinco miembros ficticios, un contrato ficticio y un registro local. No hay miembros, aportadores, registros de terceros ni direcciones de blockchain reales.

### Personas y permisos

| Actor | Qué puede hacer | Límite |
|---|---|---|
| Quien propone | Cualquier miembro puede presentar un cambio al contrato. | La propuesta por sí sola no autoriza nada ni altera el contrato vigente. |
| Miembros | Un miembro con autorización vigente puede atestiguar una propuesta. Las identidades distintas cuentan para el umbral. | Ser miembro no concede autoridad para firmar. Las atestaciones son locales y ficticias, no firmas criptográficas. |
| Persona que otorga autorizaciones | Otorga o revoca autorizaciones de miembros. Cada autorización tiene presupuesto, vencimiento y origen. | Revocar afecta cambios futuros y no borra una entrada aceptada. |
| Verificador | Recalcula desde el registro almacenado, por separado del informe de ejecución. | Comprueba la coherencia de los datos locales recibidos; no establece identidad real, verdad ni efecto legal. |
| Lector | Lee el estado actual y el historial completo, incluidas las versiones anteriores. | Leer no concede autoridad para cambiar el registro. |

El diseño exige más de una aprobación de miembros distintos; el recorrido ilustrado y la suite usan un umbral de tres aprobaciones. Es una regla del proyecto, no un requisito de Wyoming W.S. 17-31. La autoridad delegada solo puede reducir el presupuesto, el plazo y el origen de la autorización de origen. El presupuesto es un límite duro. Una aprobación sin nombre cuenta cero, y la identidad propia del agente queda fuera del quórum.

### Un cambio, de la propuesta al historial

Imagina que una DAO ficticia cambia una cláusula de su contrato rector. Las etapas siguientes describen el flujo previsto. El repositorio público no incluye hoy código fuente que permita ejecutar el ejemplo.

1. Un miembro propone el cambio. Queda pendiente y no altera el contrato vigente.
2. Los miembros atestiguan con sus propias autorizaciones. El modelo comprueba que cada una esté vigente, no revocada, dentro del presupuesto y asociada a un miembro distinto.
3. Si falta el quórum requerido, la propuesta sigue pendiente. El resultado previsto identifica las aprobaciones faltantes y por qué no cuentan.
4. Cuando se alcanza el quórum, el flujo previsto agrega una entrada local y un recibo. El recibo registra quién contó, qué operación se ejerció y qué comprobaciones se hicieron bajo la cobertura declarada.
5. Se espera que un cambio de contenido idéntico corresponda a una sola entrada, para que reintentarlo no infle el registro. Esta conducta no pasa su aserción actual; consulta [Evidencia](./EVIDENCE.md).
6. Un lector puede inspeccionar la versión actual o recorrer hacia atrás las anteriores. Un verificador aparte recalcula desde el historial almacenado y comprueba si una alteración manual rompe la cadena registrada.

```text
propuesta
   |
   v
comprobar autorizaciones, límites y aprobaciones distintas
   |
   +---- falta quórum ----> pendiente, con motivos
   |
   v
quórum alcanzado
   |
   v
agregar entrada local + recibo
   |
   +----> estado actual e historial legibles
   |
   +----> verificador aparte recalcula desde el almacén
```

El ejemplo del README usa los nombres ficticios La Fragua, Bruna, Nilo y Sabina. Los comandos de terminal documentados se citan allí desde el README fuente, no como una ejecución de esta copia pública. No se inventa una salida de éxito para un cambio.

### Cómo se limita la autoridad

Una autorización no es un permiso plano. Tiene un número de operaciones permitido, vencimiento y origen. El modelo los comprueba por separado:

- Un miembro no puede usar una autorización vencida o revocada.
- No puede exceder el presupuesto de la autorización.
- Delegar no puede aumentar el presupuesto de origen, extender su plazo ni cambiar su origen.
- Varias atestaciones de un miembro no cuentan como varias aprobaciones distintas.
- Revocar impide usos futuros, pero no reescribe el historial aceptado.
- Reducir las reglas de la DAO, por ejemplo elevar el quórum o bajar presupuestos, está permitido en el modelo del acuerdo. Ampliar autoridad debe pasar por el mismo quórum de cambio al contrato.

La fotografía actual de pruebas aprueba las aserciones de vencimiento, presupuesto delegado y propuesta pendiente sin quórum. Falla la aserción sobre el detalle del miembro revocado. Son tipos de evidencia distintos: las reglas describen el modelo previsto y el resultado de pruebas muestra qué aserciones pasan ahora.

### Qué pueden mostrar el registro y el recibo

El recibo previsto identifica quién contó, qué operación se ejerció y qué comprobó el verificador según su cobertura declarada. El almacén local conserva el digest del recibo para que el verificador compruebe el historial recibido. Según el acuerdo, el proyecto usa el formato de recibos y el mecanismo de verificación de Vespi; Escribano no modifica el núcleo.

Un digest SHA-256 simple no tiene una clave secreta. Quien puede reescribir el archivo local también puede recalcular el digest. Puede ayudar a detectar una diferencia frente al registro que se revisa, pero no autentica a quien lo escribió ni prueba cuándo existía el recibo. Una verificación local exitosa respalda la coherencia de los datos comprobados, no la verdad de sus afirmaciones.

El acuerdo describe el anclaje del recibo como `pending`. No se afirma ninguna transacción en blockchain ni testnet.

### Qué no demuestra

Escribano no crea una DAO, establece condición jurídica, enmienda artículos depositados, presenta documentos ante una autoridad pública, despliega ni actualiza un contrato inteligente, ni produce una presentación con efecto legal. No usa blockchain ni testnet. Las aprobaciones de miembros son atestaciones locales ficticias, no firmas criptográficas. El registro no establece la identidad de una persona, si una propuesta es verdadera o justa, ni si una organización siguió un proceso legal real.

Este repositorio contiene hoy documentación, no los archivos de código y pruebas. El resultado de la suite registrada no demuestra que el producto esté terminado ni listo para usarse. Consulta [Marco legal y límites](./LEGAL_AND_LIMITS.md), [Evidencia](./EVIDENCE.md) y [Código no incluido](../CODE_NOT_INCLUDED.md) para conocer esos límites.
