# Working Calculator

## Ajuste de seguridad

Se reemplazó el uso de `eval()` en `script.js` por un analizador de expresiones aritméticas implementado en JavaScript.

El analizador solo acepta números, decimales, paréntesis y los operadores `+`, `-`, `*`, `/` y `%`. También rechaza caracteres y expresiones inválidas, limita la longitud de la expresión y controla la división por cero y los resultados no finitos.

## Motivo

`eval()` interpreta su entrada como código JavaScript, no solo como una operación matemática. Esto puede permitir la ejecución de código si la entrada llega a ser manipulada o si se amplía la aplicación para aceptar texto u otras fuentes de datos. El analizador restringido calcula únicamente expresiones aritméticas permitidas y evita ejecutar JavaScript arbitrario.
