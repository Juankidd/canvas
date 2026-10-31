# Canvas Studio UAO | Business Model Canvas

Aplicación estática para GitHub Pages, con el logo de la UAO y nueve bloques interactivos.

## Características

- Cuatro campos independientes de autores o responsables, que se incluyen en el PNG.
- Exportación únicamente en PNG, directamente mediante Canvas API del navegador, sin dependencias externas.
- Guardado automático local, edición de ideas y respaldo JSON.
- Menú de ejemplos con **Uber, Netflix y Nubank (Nu)**, cada uno con nueve bloques y contenido ilustrativo editable. Los ejemplos son interpretaciones didácticas, no Canvas oficiales.
- Al cargar un ejemplo, los cuatro campos de autores quedan vacíos.
- Compatible con respaldos anteriores con el campo `author` (se migra a Autor 1).

## Publicar

Sube **el contenido de la carpeta** a la raíz del repositorio de GitHub. Mantén `index.html`, `app.js`, `offline-export.js`, `styles.css`, `.nojekyll` y la carpeta `assets/`. En Settings > Pages selecciona `main` y `/ (root)`.

Actualiza la página con Ctrl+F5 cuando GitHub termine de publicar.

## Corrección de exportación PNG
El logo UAO se incrusta dentro del exportador como imagen local de datos. No se dibujan imágenes de orígenes externos en el Canvas, evitando el error `Tainted canvases may not be exported` al abrir la aplicación localmente o en GitHub Pages.
