// URL de la API. La levanta json-server cuando corres `npm run api`.
const API_URL = 'http://localhost:3000/tickets';

// Estado de la aplicación: la lista de tickets tal como la conoce el navegador.
// La pantalla siempre se dibuja a partir de este arreglo.
let tickets = [];

// Tu código empieza aquí.

// Textos para personas y colores (el texto siempre acompaña al color).
const ESTADOS = {
  abierto: {
    etiqueta: 'Abierto',
    clases: 'bg-sky-100 text-sky-800',
    siguiente: 'en_progreso',
    textoBoton: 'Empezar',
  },
  en_progreso: {
    etiqueta: 'En progreso',
    clases: 'bg-amber-100 text-amber-800',
    siguiente: 'resuelto',
    textoBoton: 'Marcar resuelto',
  },
  resuelto: {
    etiqueta: 'Resuelto',
    clases: 'bg-emerald-100 text-emerald-800',
    siguiente: null,
    textoBoton: null,
  },
};
 
const PRIORIDADES = {
  baja: { etiqueta: 'Baja', clases: 'bg-gray-100 text-gray-800' },
  media: { etiqueta: 'Media', clases: 'bg-amber-100 text-amber-800' },
  alta: { etiqueta: 'Alta', clases: 'bg-red-100 text-red-800' },
};
 
const CATEGORIAS = {
  hardware: 'Hardware',
  software: 'Software',
  red: 'Red',
  accesos: 'Accesos',
};
 
// Elementos de la página
const listaTickets = document.getElementById('lista-tickets');
const mensaje = document.getElementById('mensaje');
const resumen = document.getElementById('resumen');
const filtroEstado = document.getElementById('filtro-estado');
const busqueda = document.getElementById('busqueda');
 
// Evita que texto escrito por una persona se interprete como HTML.
function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
 
function mostrarMensaje(texto) {
  mensaje.textContent = texto;
  mensaje.hidden = false;
}
 
function ocultarMensaje() {
  mensaje.textContent = '';
  mensaje.hidden = true;
}
 
// Muestra cuántos tickets hay en cada estado y cuántos de prioridad alta
// siguen sin resolver. Cuenta todos los tickets, sin importar los filtros.
function dibujarResumen() {
  const porEstado = tickets.reduce(
    (cuenta, ticket) => {
      cuenta[ticket.estado] += 1;
      return cuenta;
    },
    { abierto: 0, en_progreso: 0, resuelto: 0 }
  );
 
  const altasPendientes = tickets.filter(
    (ticket) => ticket.prioridad === 'alta' && ticket.estado !== 'resuelto'
  ).length;
 
  const caja = 'border border-green-700 bg-green-50 px-2 py-1';
 
  resumen.innerHTML = `
    <div class="flex flex-wrap gap-2">
      <span class="${caja}">Abiertos: ${porEstado.abierto}</span>
      <span class="${caja}">En progreso: ${porEstado.en_progreso}</span>
      <span class="${caja}">Resueltos: ${porEstado.resuelto}</span>
      <span class="${caja}">Prioridad alta sin resolver: ${altasPendientes}</span>
    </div>
  `;
}
 
// Dibuja el resumen y una tarjeta por cada ticket que pasa los filtros.
function dibujarTickets() {
  dibujarResumen();
 
  const estadoElegido = filtroEstado.value;
  const texto = busqueda.value.trim().toLowerCase();
 
  const visibles = tickets.filter(
    (ticket) =>
      (estadoElegido === 'todos' || ticket.estado === estadoElegido) &&
      ticket.titulo.toLowerCase().includes(texto)
  );
 
  if (tickets.length === 0) {
    mostrarMensaje('Todavía no hay tickets. Crea el primero con el formulario.');
  } else if (visibles.length === 0) {
    mostrarMensaje('Ningún ticket coincide con los filtros.');
  } else {
    ocultarMensaje();
  }
 
  listaTickets.innerHTML = visibles
    .map((ticket) => {
      const estado = ESTADOS[ticket.estado];
      const prioridad = PRIORIDADES[ticket.prioridad];
 
      // Los tickets resueltos se ven apagados y no tienen el botón de avanzar.
      const claseTarjeta =
        ticket.estado === 'resuelto'
          ? 'border-gray-200 bg-gray-100 opacity-70'
          : 'border-gray-300 bg-white';
 
      const botonAvanzar = estado.siguiente
        ? `<button type="button" data-avanzar="${ticket.id}" class="bg-green-700 text-white text-sm font-medium px-3 py-1 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2">${estado.textoBoton}</button>`
        : '';
 
      const botonEditar = `<button type="button" data-editar="${ticket.id}" class="bg-white text-green-800 text-sm font-medium border border-green-700 px-3 py-1 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2">Editar</button>`;
 
      const botonEliminar = `<button type="button" data-eliminar="${ticket.id}" class="bg-white text-red-700 text-sm font-medium border border-red-700 px-3 py-1 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2">Eliminar</button>`;
 
      return `
        <article class="border ${claseTarjeta} p-4 break-words">
          <h3 class="font-bold text-green-800">#${ticket.id} ${escapar(ticket.titulo)}</h3>
          <p class="text-sm text-gray-700 mt-2">${escapar(ticket.descripcion)}</p>
          <p class="text-sm mt-2"><span class="font-medium">Solicitante:</span> ${escapar(ticket.solicitante)}</p>
          <p class="text-sm"><span class="font-medium">Categoría:</span> ${CATEGORIAS[ticket.categoria]}</p>
          <div class="flex flex-wrap gap-2 mt-3 text-sm">
            <span class="px-2 py-1 ${prioridad.clases}">Prioridad: ${prioridad.etiqueta}</span>
            <span class="px-2 py-1 ${estado.clases}">Estado: ${estado.etiqueta}</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            ${botonAvanzar}
            ${botonEditar}
            ${botonEliminar}
          </div>
        </article>
      `;
    })
    .join('');
 
  // Cada botón actúa sobre el ticket al que pertenece.
  listaTickets.querySelectorAll('button[data-avanzar]').forEach((boton) => {
    const ticket = tickets.find((t) => String(t.id) === boton.dataset.avanzar);
    boton.addEventListener('click', () => avanzarTicket(ticket));
  });
 
  listaTickets.querySelectorAll('button[data-editar]').forEach((boton) => {
    const ticket = tickets.find((t) => String(t.id) === boton.dataset.editar);
    boton.addEventListener('click', () => iniciarEdicion(ticket));
  });
 
  listaTickets.querySelectorAll('button[data-eliminar]').forEach((boton) => {
    const ticket = tickets.find((t) => String(t.id) === boton.dataset.eliminar);
    boton.addEventListener('click', () => eliminarTicket(ticket));
  });
}
 
// Pasa el ticket al siguiente estado: solo se envía el campo que cambia.
async function avanzarTicket(ticket) {
  const siguiente = ESTADOS[ticket.estado].siguiente;
 
  try {
    const respuesta = await fetch(`${API_URL}/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: siguiente }),
    });
 
    if (!respuesta.ok) {
      throw new Error(`El servidor respondió ${respuesta.status}`);
    }
 
    // Se reemplaza el ticket viejo por el que devuelve el servidor.
    const ticketActualizado = await respuesta.json();
    tickets = tickets.map((t) => (t.id === ticketActualizado.id ? ticketActualizado : t));
    dibujarTickets();
  } catch (error) {
    console.error(error);
    mostrarMensaje(
      'No se pudo actualizar el ticket. Revisa que la API esté corriendo e inténtalo de nuevo.'
    );
  }
}
 
// Elimina el ticket después de pedir confirmación.
async function eliminarTicket(ticket) {
  if (!confirm(`¿Eliminar el ticket #${ticket.id}? Esta acción no se puede deshacer.`)) {
    return;
  }
 
  try {
    const respuesta = await fetch(`${API_URL}/${ticket.id}`, { method: 'DELETE' });
 
    if (!respuesta.ok) {
      throw new Error(`El servidor respondió ${respuesta.status}`);
    }
 
    tickets = tickets.filter((t) => t.id !== ticket.id);
 
    // Si era el ticket del formulario de edición, se vuelve al modo de creación.
    if (idEnEdicion === ticket.id) {
      salirDeEdicion();
    }
 
    dibujarTickets();
  } catch (error) {
    console.error(error);
    mostrarMensaje(
      'No se pudo eliminar el ticket. Revisa que la API esté corriendo e inténtalo de nuevo.'
    );
  }
}
 
// Pide los tickets a la API y actualiza la pantalla.
async function cargarTickets() {
  mostrarMensaje('Cargando tickets...');
 
  try {
    const respuesta = await fetch(API_URL);
 
    // fetch no falla con un 404 o 500: hay que revisarlo a mano.
    if (!respuesta.ok) {
      throw new Error(`El servidor respondió ${respuesta.status}`);
    }
 
    tickets = await respuesta.json();
    dibujarTickets();
  } catch (error) {
    console.error(error);
    listaTickets.innerHTML = '';
    mostrarMensaje(
      'No se pudieron cargar los tickets. Revisa que la API esté corriendo (npm run api) y recarga la página.'
    );
  }
}
 
// ---- Nivel 2: crear tickets ----
 
const formTicket = document.getElementById('form-ticket');
const inputTitulo = document.getElementById('titulo');
const inputDescripcion = document.getElementById('descripcion');
const inputSolicitante = document.getElementById('solicitante');
const selectCategoria = document.getElementById('categoria');
const selectPrioridad = document.getElementById('prioridad');
const errorTitulo = document.getElementById('error-titulo');
const errorSolicitante = document.getElementById('error-solicitante');
 
// Muestra o borra los errores según los datos del formulario.
// Devuelve true si todo está bien.
function validarFormulario() {
  let esValido = true;
 
  if (inputTitulo.value.trim().length < 5) {
    errorTitulo.textContent = 'El título debe tener al menos 5 caracteres.';
    esValido = false;
  } else {
    errorTitulo.textContent = '';
  }
 
  if (inputSolicitante.value.trim() === '') {
    errorSolicitante.textContent = 'Escribe el nombre del solicitante.';
    esValido = false;
  } else {
    errorSolicitante.textContent = '';
  }
 
  return esValido;
}
 
// El error desaparece apenas el dato se corrige.
inputTitulo.addEventListener('input', () => {
  if (inputTitulo.value.trim().length >= 5) {
    errorTitulo.textContent = '';
  }
});
 
inputSolicitante.addEventListener('input', () => {
  if (inputSolicitante.value.trim() !== '') {
    errorSolicitante.textContent = '';
  }
});
 
// ---- Nivel 4: editar tickets ----
 
const tituloFormulario = document.getElementById('titulo-formulario');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
 
// id del ticket que se está editando, o null si el formulario está creando.
let idEnEdicion = null;
 
// Llena el formulario con el ticket y lo pasa a modo edición.
function iniciarEdicion(ticket) {
  idEnEdicion = ticket.id;
 
  inputTitulo.value = ticket.titulo;
  inputDescripcion.value = ticket.descripcion;
  inputSolicitante.value = ticket.solicitante;
  selectCategoria.value = ticket.categoria;
  selectPrioridad.value = ticket.prioridad;
  errorTitulo.textContent = '';
  errorSolicitante.textContent = '';
 
  tituloFormulario.textContent = `Editar ticket #${ticket.id}`;
  btnGuardar.textContent = 'Guardar cambios';
  btnCancelar.hidden = false;
  inputTitulo.focus();
}
 
// Vuelve al modo de creación y limpia el formulario.
function salirDeEdicion() {
  idEnEdicion = null;
 
  formTicket.reset();
  errorTitulo.textContent = '';
  errorSolicitante.textContent = '';
 
  tituloFormulario.textContent = 'Nuevo ticket';
  btnGuardar.textContent = 'Crear ticket';
  btnCancelar.hidden = true;
}
 
btnCancelar.addEventListener('click', salirDeEdicion);
 
formTicket.addEventListener('submit', async (evento) => {
  evento.preventDefault();
 
  if (!validarFormulario()) {
    return;
  }
 
  const datos = {
    titulo: inputTitulo.value.trim(),
    descripcion: inputDescripcion.value.trim(),
    solicitante: inputSolicitante.value.trim(),
    categoria: selectCategoria.value,
    prioridad: selectPrioridad.value,
  };
 
  try {
    if (idEnEdicion === null) {
      // Crear: el ticket nuevo arranca abierto.
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, estado: 'abierto' }),
      });
 
      if (!respuesta.ok) {
        throw new Error(`El servidor respondió ${respuesta.status}`);
      }
 
      // El servidor devuelve el ticket con su id: ese es el que se agrega.
      const ticketCreado = await respuesta.json();
      tickets.push(ticketCreado);
    } else {
      // Editar: PUT reemplaza el ticket completo, así que también se envía
      // el estado actual para que no se pierda.
      const ticketActual = tickets.find((t) => t.id === idEnEdicion);
 
      const respuesta = await fetch(`${API_URL}/${idEnEdicion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, estado: ticketActual.estado }),
      });
 
      if (!respuesta.ok) {
        throw new Error(`El servidor respondió ${respuesta.status}`);
      }
 
      const ticketEditado = await respuesta.json();
      tickets = tickets.map((t) => (t.id === ticketEditado.id ? ticketEditado : t));
    }
 
    dibujarTickets();
    salirDeEdicion();
  } catch (error) {
    console.error(error);
    mostrarMensaje(
      idEnEdicion === null
        ? 'No se pudo crear el ticket. Revisa que la API esté corriendo e inténtalo de nuevo.'
        : 'No se pudieron guardar los cambios. Revisa que la API esté corriendo e inténtalo de nuevo.'
    );
  }
});
 
// ---- Nivel 6: filtros ----
 
filtroEstado.addEventListener('change', dibujarTickets);
busqueda.addEventListener('input', dibujarTickets);
 
cargarTickets();