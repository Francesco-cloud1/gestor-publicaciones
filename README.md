# Gestor de publicaciones

Aplicación web hecha con HTML, CSS y JavaScript que consume la API de prueba [JSONPlaceholder](https://jsonplaceholder.typicode.com) usando `fetch`, con peticiones **GET** y **POST**.

Proyecto de la **Guía de Laboratorio #04** del curso Desarrollo de Software I (Universidad Nacional de San Antonio Abad del Cusco, UNSAAC).

## Enlaces

- Sitio publicado: https://Francesco-cloud1.github.io/gestor-publicaciones/
- Repositorio: https://github.com/Francesco-cloud1/gestor-publicaciones

## Funcionalidades

**GET**
- Listar las publicaciones de un usuario (1 a 10).
- Elegir cuántas publicaciones traer (`_limit`: 5, 10 o 20) con un `<select>`.
- Filtrar las publicaciones por título desde el navegador, con `filter`.
- Al hacer clic en una publicación, se hace un GET a `/posts/{id}/comments` y se muestran sus comentarios debajo de ella.

**POST**
- Crear una publicación, con validación previa (título de al menos 5 caracteres y contenido no vacío) y mensajes de error.
- Comentar una publicación con un POST a `/comments` (campos `postId`, `name`, `email` y `body`). El cuerpo se construye con `FormData` + `Object.fromEntries`.
- Se muestra el código de estado y el `id` devuelto por la API.
- El botón se deshabilita mientras se envía la petición, para evitar envíos duplicados.

## Cómo usarlo

1. Clona el repositorio o descarga los archivos.
2. Abre la carpeta en Visual Studio Code.
3. Ejecuta `index.html` con la extensión **Live Server**.
4. Abre las herramientas de desarrollo (F12) y revisa la pestaña **Red** para ver cada petición.

No necesita instalar dependencias ni usar un token.

## Estructura

```
gestor-publicaciones/
├── index.html
├── app.js
├── .gitignore
└── README.md
```

## Nota

JSONPlaceholder responde `201 Created` a los POST, pero **no guarda** los datos: lo que se crea no aparecerá al volver a listar con GET.
