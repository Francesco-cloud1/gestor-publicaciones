const API = 'https://jsonplaceholder.typicode.com';
const formBuscar   = document.querySelector('#form-buscar');
const formCrear    = document.querySelector('#form-crear');
const inputUsuario = document.querySelector('#input-usuario');
const selectLimite = document.querySelector('#select-limite');
const inputFiltro  = document.querySelector('#input-filtro');
const conteo       = document.querySelector('#conteo');
const inputTitulo  = document.querySelector('#input-titulo');
const inputCuerpo  = document.querySelector('#input-cuerpo');
const btnCrear     = document.querySelector('#btn-crear');
const estado       = document.querySelector('#estado');
const lista        = document.querySelector('#lista');

// Actividad 3: referencias de validación y del formulario de comentarios
const errorTitulo  = document.querySelector('#error-titulo');
const errorCuerpo  = document.querySelector('#error-cuerpo');
const formComentar = document.querySelector('#form-comentar');
const btnComentar  = document.querySelector('#btn-comentar');
const camposComentario = {
    postId: { input: document.querySelector('#input-post-id'),    error: document.querySelector('#error-post-id') },
    name:   { input: document.querySelector('#input-nombre'),     error: document.querySelector('#error-nombre') },
    email:  { input: document.querySelector('#input-email'),      error: document.querySelector('#error-email') },
    body:   { input: document.querySelector('#input-comentario'), error: document.querySelector('#error-comentario') }
};

// Estado de la aplicación
let publicaciones = [];                 // [{ post, esNuevo }]
const cacheComentarios = new Map();     // id de post -> arreglo de comentarios
const abiertos = new Set();             // ids de posts con comentarios visibles

// 1. Petición genérica: sirve para GET y para POST
async function peticion(url, opciones = {}) {
    const res = await fetch(url, opciones);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return { status: res.status, datos: await res.json() };
}

// 2. Funciones de interfaz
function crearTarjeta(post, esNuevo = false) {
    const art = document.createElement('article');
    art.className = esNuevo ? 'post nuevo' : 'post';
    art.dataset.id = post.id;
    const h3 = document.createElement('h3');
    h3.textContent = `#${post.id} ${post.title}`;
    h3.title = 'Clic para ver los comentarios';
    const p = document.createElement('p');
    p.textContent = post.body;
    art.append(h3, p);

    if (abiertos.has(post.id) && cacheComentarios.has(post.id)) {
        art.append(crearComentarios(cacheComentarios.get(post.id)));
    }
    return art;
}

function crearComentarios(comentarios) {
    const div = document.createElement('div');
    div.className = 'comentarios';
    if (comentarios.length === 0) {
        const vacio = document.createElement('p');
        vacio.textContent = 'Esta publicación no tiene comentarios.';
        div.append(vacio);
        return div;
    }
    comentarios.forEach(c => {
        const item = document.createElement('div');
        // CAMBIO: los comentarios recién creados con POST se resaltan
        item.className = c.esNuevo ? 'comentario nuevo' : 'comentario';
        const autor = document.createElement('strong');
        autor.textContent = c.esNuevo ? `#${c.id} ${c.name}` : c.name;
        const correo = document.createElement('small');
        correo.textContent = ` (${c.email})`;
        const texto = document.createElement('p');
        texto.textContent = c.body;
        item.append(autor, correo, texto);
        div.append(item);
    });
    return div;
}

function mostrarEstado(texto, esError = false) {
    estado.textContent = texto;
    estado.className = esError ? 'error' : '';
}

function renderizar() {
    const texto = inputFiltro.value.trim().toLowerCase();
    const visibles = publicaciones.filter(({ post }) =>
        post.title.toLowerCase().includes(texto)
    );
    lista.replaceChildren(
        ...visibles.map(({ post, esNuevo }) => crearTarjeta(post, esNuevo))
    );
    conteo.textContent = `Mostrando ${visibles.length} de ${publicaciones.length} publicaciones`;
}

// NUEVO (Actividad 3): marca o limpia el error de un campo
function marcarCampo(input, spanError, mensaje = '') {
    spanError.textContent = mensaje;
    input.classList.toggle('invalido', mensaje !== '');
}

// 3. GET: listar las publicaciones de un usuario
formBuscar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
        userId: inputUsuario.value,
        _limit: selectLimite.value
    });
    mostrarEstado('Cargando...');
    try {
        const { status, datos } = await peticion(`${API}/posts?${params}`);
        publicaciones = datos.map(post => ({ post, esNuevo: false }));
        abiertos.clear();
        renderizar();
        mostrarEstado(`GET ${status}: ${datos.length} publicaciones`);
    } catch (error) {
        mostrarEstado(error.message, true);
    }
});

selectLimite.addEventListener('change', () => formBuscar.requestSubmit());
inputFiltro.addEventListener('input', renderizar);

// Clic en una publicación -> GET /posts/{id}/comments
lista.addEventListener('click', async (e) => {
    if (e.target.closest('.comentarios')) return;
    const art = e.target.closest('.post');
    if (!art) return;
    const id = Number(art.dataset.id);

    if (abiertos.has(id)) {
        abiertos.delete(id);
        renderizar();
        return;
    }

    if (!cacheComentarios.has(id)) {
        mostrarEstado(`Cargando comentarios de la publicación ${id}...`);
        try {
            const { status, datos } = await peticion(`${API}/posts/${id}/comments`);
            cacheComentarios.set(id, datos);
            mostrarEstado(`GET ${status}: ${datos.length} comentarios de la publicación ${id}`);
        } catch (error) {
            mostrarEstado(error.message, true);
            return;
        }
    }
    abiertos.add(id);
    renderizar();
});

// 4. POST: crear una publicación (ahora con validación)
// NUEVO: devuelve true si el formulario es válido y muestra los mensajes de error
function validarPublicacion() {
    const titulo = inputTitulo.value.trim();
    const cuerpo = inputCuerpo.value.trim();
    let valido = true;

    if (titulo.length < 5) {
        marcarCampo(inputTitulo, errorTitulo,
            `El título debe tener al menos 5 caracteres (tiene ${titulo.length}).`);
        valido = false;
    } else {
        marcarCampo(inputTitulo, errorTitulo);
    }

    if (cuerpo === '') {
        marcarCampo(inputCuerpo, errorCuerpo, 'El contenido no puede estar vacío.');
        valido = false;
    } else {
        marcarCampo(inputCuerpo, errorCuerpo);
    }
    return valido;
}

// Limpia el error de cada campo en cuanto el usuario vuelve a escribir
inputTitulo.addEventListener('input', () => marcarCampo(inputTitulo, errorTitulo));
inputCuerpo.addEventListener('input', () => marcarCampo(inputCuerpo, errorCuerpo));

formCrear.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarPublicacion()) {            // CAMBIO: no se envía nada si hay errores
        mostrarEstado('Corrija los errores del formulario.', true);
        return;
    }
    const nuevo = {
        title: inputTitulo.value.trim(),
        body: inputCuerpo.value.trim(),
        userId: Number(inputUsuario.value)
    };
    btnCrear.disabled = true;               // evita envíos duplicados
    mostrarEstado('Enviando...');
    try {
        const { status, datos } = await peticion(`${API}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevo)
        });
        publicaciones.unshift({ post: datos, esNuevo: true });
        renderizar();
        mostrarEstado(`POST ${status}: creada con id ${datos.id}`);
        formCrear.reset();
    } catch (error) {
        mostrarEstado(error.message, true);
    } finally {
        btnCrear.disabled = false;
    }
});

// NUEVO (Actividad 3): POST /comments con FormData + Object.fromEntries
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarComentario(c) {
    const errores = {};
    if (!Number.isInteger(Number(c.postId)) || Number(c.postId) < 1) {
        errores.postId = 'Ingrese un ID de publicación válido (entero mayor o igual a 1).';
    }
    if (c.name.trim() === '') {
        errores.name = 'El nombre no puede estar vacío.';
    }
    if (!REGEX_EMAIL.test(c.email.trim())) {
        errores.email = 'Ingrese un correo válido (ej. ana@mail.com).';
    }
    if (c.body.trim() === '') {
        errores.body = 'El comentario no puede estar vacío.';
    }
    return errores;
}

// Limpia el error de cada campo al escribir
Object.values(camposComentario).forEach(({ input, error }) =>
    input.addEventListener('input', () => marcarCampo(input, error))
);

formComentar.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1) FormData toma todos los campos con atributo name; 2) fromEntries lo convierte en objeto
    const datosForm = new FormData(formComentar);
    const objeto = Object.fromEntries(datosForm);

    // Validar y mostrar mensajes
    const errores = validarComentario(objeto);
    Object.entries(camposComentario).forEach(([clave, { input, error }]) =>
        marcarCampo(input, error, errores[clave] || '')
    );
    if (Object.keys(errores).length > 0) {
        mostrarEstado('Corrija los errores del formulario de comentarios.', true);
        return;
    }

    // FormData entrega todo como texto: postId debe viajar como número
    const comentario = {
        postId: Number(objeto.postId),
        name: objeto.name.trim(),
        email: objeto.email.trim(),
        body: objeto.body.trim()
    };

    btnComentar.disabled = true;
    mostrarEstado('Enviando comentario...');
    try {
        const { status, datos } = await peticion(`${API}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comentario)
        });
        mostrarEstado(`POST ${status}: comentario creado con id ${datos.id} (postId ${datos.postId})`);

        // Si los comentarios de ese post ya estaban descargados, se muestra el nuevo
        // (la API no lo guarda: un GET posterior no lo devolvería)
        if (cacheComentarios.has(comentario.postId)) {
            cacheComentarios.get(comentario.postId).push({ ...datos, esNuevo: true });
            abiertos.add(comentario.postId);
            renderizar();
        }
        formComentar.reset();
    } catch (error) {
        mostrarEstado(error.message, true);
    } finally {
        btnComentar.disabled = false;
    }
});

// 5. Carga inicial
formBuscar.requestSubmit();