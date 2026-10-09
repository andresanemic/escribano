# Legal framework and limits

## What the agreement cites

The project agreement says its primary source was read on 2026-09-29: Wyoming Statutes, Title 17, Chapter 31, from the official Wyoming Legislature PDF. It cites these provisions to describe the form the local mechanism imitates:

| Provision cited in the agreement | Description in the agreement | What Escribano simulates |
|---|---|---|
| W.S. 17-31-102(a)(x) | Defines a publicly available identifier as an address publicly available that identifies a smart contract. | A public-identifier field on each record entry, using a fictional string rather than a real blockchain address. |
| W.S. 17-31-106(b) | Says articles of organization include a publicly available identifier for a smart contract directly used to manage, facilitate, or operate the DAO. | The fictional current contract names an identifier and the record entry includes it. |
| W.S. 17-31-106(c)(x) | Says articles and smart contracts govern procedures for updating, modifying, or revising the organization's smart contracts. | A written procedure for contract changes. |
| W.S. 17-31-107(a)(iii) and (iv) | Says articles are amended when smart contracts or their public identifier change. | A contract change or identifier change is modeled as a record event with a receipt. |
| W.S. 17-31-109 | Says smart contracts used by the DAO must be capable of being updated, modified, or upgraded. | The fictional contract declares that it can change and names a route for doing so. |

This is a design reference only. The agreement says Escribano simulates the form of a record entry, identifier, and receipt, and nothing more. It does not claim compliance with Wyoming law or any other law. No competent legal professional has reviewed this project, and the behavior has not been compared with an actual filing process.

The agreement is explicit that Wyoming W.S. 17-31 does **not** require multiple signatures to change a contract. The quorum is a Vespi design choice, not a statutory requirement. The cited provisions concern an identifier, a procedure, amendments, and update capability as summarized above.

## Limits and open questions

- There is no real DAO, member, contributor, wallet, legal entity, or third-party data in the project. The agreement says its data are synthetic.
- The record is local and reversible. Nothing is filed with a Wyoming authority or sent to a third-party system.
- The member approvals are fictional local attestations. There are no cryptographic keys and no proof that a real person controls a member name.
- SHA-256 detects certain changes only when checked against the supplied record; because it is unkeyed, someone who can rewrite the file can recalculate it. It does not prove authenticity or time of creation.
- There is no blockchain, testnet, explorer, or on-chain anchor. The receipt anchor remains `pending`.
- The public repository does not contain source code today. The 2026-10-09 run reports 13 tests, all passing, and no assertion of product readiness is made.
- The project has not been checked against an actual Wyoming filing process. What would be required for a real organization to amend filed articles remains outside the evidence supplied here.
- The agreement leaves the name and terminal interface as choices that Andrés may revisit before a jury sees them; other forms such as web, desktop, or mobile are not promised.

# Español

## Qué cita el acuerdo

El acuerdo del proyecto dice que su fuente primaria se leyó el 2026-09-29: Wyoming Statutes, Título 17, capítulo 31, en el PDF oficial de la Legislatura de Wyoming. Cita estos artículos para describir la forma que imita el mecanismo local:

| Artículo citado en el acuerdo | Descripción del acuerdo | Qué simula Escribano |
|---|---|---|
| W.S. 17-31-102(a)(x) | Define un identificador público como una dirección disponible públicamente que identifica un contrato inteligente. | Un campo de identificador público en cada entrada, con una cadena ficticia en vez de una dirección real de blockchain. |
| W.S. 17-31-106(b) | Dice que los artículos de organización incluyen un identificador público para un contrato inteligente usado directamente para administrar, facilitar u operar la DAO. | El contrato ficticio vigente nombra un identificador y la entrada del registro lo incluye. |
| W.S. 17-31-106(c)(x) | Dice que los artículos y contratos inteligentes establecen procedimientos para actualizar, modificar o revisar los contratos inteligentes de la organización. | Un procedimiento escrito para cambiar el contrato. |
| W.S. 17-31-107(a)(iii) y (iv) | Dice que los artículos se enmiendan cuando cambia el contrato inteligente o su identificador público. | Un cambio de contrato o de identificador se modela como un evento del registro con recibo. |
| W.S. 17-31-109 | Dice que los contratos inteligentes usados por la DAO deben poder actualizarse, modificarse o mejorarse. | El contrato ficticio declara que puede cambiar e indica una vía para hacerlo. |

Esto es solo una referencia de diseño. El acuerdo dice que Escribano simula la forma de una entrada de registro, un identificador y un recibo, y nada más. No afirma cumplir la ley de Wyoming ni ninguna otra ley. Ninguna persona competente en derecho ha revisado el proyecto, y su comportamiento no se ha comparado con un proceso real de presentación.

El acuerdo es explícito: Wyoming W.S. 17-31 **no exige** varias firmas para cambiar un contrato. El quórum es una elección de diseño de Vespi, no un requisito legal. Los artículos citados tratan del identificador, el procedimiento, las enmiendas y la capacidad de actualización descritos arriba.

## Límites y preguntas abiertas

- El proyecto no tiene una DAO, miembros, aportadores, wallet, persona jurídica ni datos de terceros reales. El acuerdo dice que todos sus datos son sintéticos.
- El registro es local y reversible. No se presenta nada ante una autoridad de Wyoming ni se envía a sistemas de terceros.
- Las aprobaciones de miembros son atestaciones locales ficticias. No hay claves criptográficas ni prueba de que una persona real controle el nombre de un miembro.
- SHA-256 detecta ciertos cambios solo al compararlo con el registro recibido; como no usa una clave, quien pueda reescribir el archivo también puede recalcularlo. No prueba autenticidad ni fecha de creación.
- No hay blockchain, testnet, explorador ni anclaje en cadena. El anclaje del recibo queda `pending`.
- El repositorio público hoy no incluye código fuente. La corrida del 2026-10-09 informa 13 pruebas, todas aprobadas, y no se afirma que el producto esté listo.
- El proyecto no se ha contrastado con un proceso real de presentación en Wyoming. Qué necesitaría una organización real para enmendar artículos presentados queda fuera de la evidencia disponible.
- El acuerdo deja abiertos el nombre y la interfaz de terminal, que Andrés puede reconsiderar antes de que los vea un jurado; no promete otras formas como web, escritorio o móvil.
