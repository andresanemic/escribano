# Escribano

Proyecto 6 de los diez de Vespi: **la DAO con registro de cada cambio de su contrato**.

Escribano guarda, en un archivo append-only, cada cambio del contrato de una DAO: qué se cambió,
quién lo autorizó, con qué recibo, y cómo se llega de la versión anterior a esa. Quien tenga el
archivo puede leer el estado actual y recorrer el historial entero.

> **Esto no es un registro legal.** Es un registro **con recibos**. No se presenta nada ante ninguna
> autoridad, no modifica artículos de organización, no confiere condición de DAO y no crea persona
> jurídica. El último paso del recorrido dice, en pantalla, todo lo que no demuestra.

## Correrlo

```sh
node --test "test/*.test.js"     # la suite entera, a la vista
node src/recorrido.js            # el recorrido completo, de la propuesta al historial
node src/cli.js                  # la terminal
```

No hay dependencias que instalar. Node ≥ 18.

## La terminal

```sh
node src/cli.js fundar "La Fragua" "file://contrato/la-frauga/v1"
node src/cli.js otorgar bruna 2 2026-10-30T12:00:00.000Z
node src/cli.js proponer c-1 plazo "60 dias"
node src/cli.js firmar c-1 bruna
node src/cli.js decidir c-1 bruna,nilo        # no entra: falta una firma, y lo dice
node src/cli.js firmar c-1 sabina
node src/cli.js decidir c-1 bruna,nilo,sabina # entra, con su recibo
node src/cli.js estado
node src/cli.js historial
node src/cli.js auditar
```

## Qué está simulado y qué no

W.S. 17-31 (*Wyoming Statutes*, Título 17, capítulo 31, leído el 2026-09-29 del PDF oficial de la
Legislatura de Wyoming) describe una forma: un contrato inteligente con **identificador público**, y
artículos de organización que se **enmendan cuando el contrato cambia**. Escribano simula **esa
forma** —que un cambio sea un evento con identificador y con recibo— y nada más.

**El quórum de tres firmas es una elección de diseño de este proyecto, no un requisito de esa
norma.** La norma exige enmendar los artículos y establecer el procedimiento; no dice cuántas firmas
hacen falta. Decir lo contrario sería el defecto que la decisión 26 vino a impedir.

El detalle completo, con artículo y texto, está en `acuerdo.md`.

## El núcleo que corre aquí

Escribano **consume** el kernel de Vespi desde la copia vendorizada que Lore Plugin tiene
**instalada** en este host, fijada al commit `54c20c7` (Lore Plugin 2.4.9-rc.5, kernel 0.1.3
candidato). No lo modifica, y `test/kernel.test.js` fija los cinco SHA-256 contra lo que declara el
kit. **Si RC6 instala un núcleo distinto, esa prueba se pone roja a propósito**: es el control
funcionando, y reevaluar la huella es decisión de Andrés.

## El árbol

| | |
|---|---|
| `acuerdo.md` | el acuerdo: problema, actores, autoridad, datos, efecto externo, recibos, cierre, límites |
| `src/nucleo.js` | dónde está el núcleo y cómo se niega a degradar al árbol de desarrollo |
| `src/escribano.js` | la carrocería: contrato, miembros, permisos, registro, auditoría |
| `src/recorrido.js` | el recorrido completo, que termina en lo que no demuestra |
| `src/cli.js` | la terminal |
| `test/red.test.js` | los ocho rojos adversariales |
| `test/kernel.test.js` | el pin de los cinco digest del núcleo |
| `datos/registro.jsonl` | el registro. Se genera al correr; está en `.gitignore` |
