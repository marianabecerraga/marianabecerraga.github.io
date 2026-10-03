# Portafolio · Mariana Becerra

Web publicada en: **https://marianabecerraga.github.io**

## Qué hay en esta carpeta

| Archivo / carpeta | Para qué sirve |
|---|---|
| `index.html` | Todo el contenido: textos, proyectos, links. Aquí editas los textos. |
| `css/styles.css` | El diseño: colores, tipografías, tamaños y espacios. |
| `js/main.js` | Los movimientos: el cursor, los filtros de Work, los videos y el menú. |
| `assets/img/` | Las imágenes de los proyectos y tu foto. |
| `assets/video/` | Los videos (y sus imágenes de portada `.jpg`). |
| `assets/Mariana_Becerra_CV.pdf` | Tu CV en ATS. Es el que se descarga con el botón Résumé. |

## Cómo publicar cambios

La carpeta está conectada con git al repositorio `marianabecerraga/marianabecerraga.github.io`.
Cada vez que guardes cambios con un *commit* y los subas con *push*, GitHub Pages actualiza la web
en 1–5 minutos. Si no ves el cambio, recarga con Cmd+Shift+R.

**Cambiar un texto:** está todo en `index.html`.

**Cambiar tu CV:** reemplaza `assets/Mariana_Becerra_CV.pdf` por el nuevo con el mismo nombre exacto.

**Cambiar una imagen o un video:** reemplaza el archivo en `assets/img` o `assets/video` con el mismo nombre.

## Cómo está diseñada (sistema editorial)

- **Cada sección abre igual:** una línea fina con dos etiquetas en las esquinas y un título grande en Anybody.
- **Retícula de 12 columnas:** el texto ocupa las columnas 1–4 y las imágenes las columnas 5–12.
- **Filas de imágenes:** las imágenes de una misma fila comparten la altura y se muestran completas, sin recortes.
  En el HTML, cada imagen lleva `--ar` (ancho ÷ alto). Si cambias una imagen por otra de distinta proporción, actualiza ese número.
- **Motion:** los tres videos tienen el mismo tamaño y se reproducen solos, en loop y sin sonido.
  Al pasar el mouse por uno, se abre a su formato horizontal; en el celular se abre con el botón “Full frame”.
  Los videos de Motion ya están editados: sin cursor, sin marco de selección y sin barra del reproductor.

## Colores (por si los necesitas)

- Dynamic Black `#151314`
- Honey Beige `#F4E0C9`
- Egg Liqueur `#DFC9A8`
- Apocalyptic Orange `#F15328`
- Estrellas `#E2BB8F`

## Tipografías

- Títulos: **Anybody** (Extra Expanded, Black)
- Subtítulos y menú: **Outfit**
- Textos: **DM Sans**

Todas se cargan desde Google Fonts; no hay que instalar nada.
