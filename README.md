# mdp-reto

CLI para guardar enlaces en Redis y buscarlos por etiqueta.

1. Instalar dependencias: `npm ci`.
2. Iniciar Redis en `127.0.0.1:6379`; por ejemplo, `docker run --rm -p 6379:6379 redis` (sin volumen, los datos se pierden al eliminar el contenedor).
3. Guardar y consultar:

```sh
node src/index.js mdplinks "https://www.mdp.com.pe" --tags empresa,programacion --title "MDP"
node src/index.js mdplinks --tags empresa
```

Las etiquetas deben ser alfabéticas, separadas por comas. El título de la página tiene prioridad; `--title` se usa si está vacío. La consulta actual mantiene el proceso abierto; detener con Ctrl+C.
Pruebas de regresión sin Redis ni red: `npm test`.
