(function() {
  function aplicarPreferencias() {
    const tamanioGuardado = localStorage.getItem('agroclima_tamanio_letra') || 'Normal';
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('font-pequena', 'font-normal', 'font-grande');
    if (tamanioGuardado === 'Pequeña') htmlEl.classList.add('font-pequena');
    else if (tamanioGuardado === 'Grande') htmlEl.classList.add('font-grande');
    else htmlEl.classList.add('font-normal');
    
    const altoContraste = localStorage.getItem('agroclima_alto_contraste') || 'Desactivado';
    if (altoContraste === 'Activado') {
      if (document.body) document.body.classList.add('high-contrast');
      else document.addEventListener('DOMContentLoaded', () => document.body.classList.add('high-contrast'));
    } else {
      if (document.body) document.body.classList.remove('high-contrast');
      else document.addEventListener('DOMContentLoaded', () => document.body.classList.remove('high-contrast'));
    }
  }
  aplicarPreferencias();
  document.addEventListener('DOMContentLoaded', aplicarPreferencias);
})();

function toggleDropdown(id) {
  const el = document.getElementById(id);
  const estaAbierto = el.classList.contains('open');
  document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
  if (!estaAbierto) el.classList.add('open');
}

function seleccionarOpcion(idDropdown, valor) {
  const el = document.getElementById(idDropdown);
  el.querySelector('.dropdown-selected').textContent = valor;
  el.classList.remove('open');
  filtrarTabla();
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.custom-dropdown')) {
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
  }
});

function filtrarTabla() {
  const busqueda = document.getElementById('inputBuscar').value.toLowerCase();
  const provincia = document.querySelector('#dropdown-provincia .dropdown-selected').textContent;
  const filas = document.querySelectorAll('#tablaBitacora tbody tr');
  filas.forEach(fila => {
    const textoFila = fila.textContent.toLowerCase();
    const coincideBusqueda = textoFila.includes(busqueda);
    let coincideProvincia = true;
    if (provincia !== 'Todo' && provincia !== 'Puno') {
      coincideProvincia = textoFila.includes(provincia.toLowerCase());
    }
    if (coincideBusqueda && coincideProvincia) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  });
}

function reintentarEnvio(idSms, boton) {
  boton.textContent = 'Enviando...';
  boton.disabled = true;
  setTimeout(() => {
    const tdPadre = boton.parentElement;
    const tdEstado = tdPadre.previousElementSibling;
    tdEstado.textContent = 'Entregado (100%)';
    tdPadre.textContent = '100% (Recibido)';
    alert(`¡Reintento exitoso para ${idSms}! Aviso SMS reenviado a la comunidad.`);
  }, 1200);
}

function exportarReporte() {
  const prov = document.querySelector('#dropdown-provincia .dropdown-selected').textContent;
  const rango = document.querySelector('#dropdown-rango .dropdown-selected').textContent;
  const cultivo = document.querySelector('#dropdown-cultivo .dropdown-selected').textContent;
  alert(`Generando reporte descargable:\n- Provincia: ${prov}\n- Rango: ${rango}\n- Cultivo: ${cultivo}\n\nEl archivo se descargará en unos instantes.`);
}

/* FUNCIONES DE LA VENTANA EMERGENTE (MODAL OVERLAY) */
function abrirModalGrafico() {
  document.getElementById('modalGrafico').classList.add('active');
}

function cerrarModalGrafico() {
  document.getElementById('modalGrafico').classList.remove('active');
}

function cerrarModalAlHacerClicFuera(event) {
  if (event.target.id === 'modalGrafico') {
    cerrarModalGrafico();
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    cerrarModalGrafico();
  }
});