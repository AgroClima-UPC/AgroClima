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

window.onload = function() {
  const telefonoSesion = localStorage.getItem('agroclima_telefono');
  if (telefonoSesion) {
    document.getElementById('val-celular').textContent = formatearTelefono(telefonoSesion);
  }
  const altoContrasteGuardado = localStorage.getItem('agroclima_alto_contraste') || 'Desactivado';
  aplicarAltoContrasteUI(altoContrasteGuardado);
  
  const tamanioLetraGuardado = localStorage.getItem('agroclima_tamanio_letra') || 'Normal';
  aplicarTamanioLetraUI(tamanioLetraGuardado);
  const umbralGuardado = localStorage.getItem('agroclima_umbral_critico') || '-1.0 °C';
  document.getElementById('umbral').value = umbralGuardado;
};

function formatearTelefono(num) {
  let limpio = num.replace(/\D/g, '');
  if (limpio.length === 9) {
    return `${limpio.slice(0,3)} ${limpio.slice(3,6)} ${limpio.slice(6,9)}`;
  }
  return num;
}

function cambiarAltoContraste(accion) {
  const estado = (accion === 'Activar') ? 'Activado' : 'Desactivado';
  localStorage.setItem('agroclima_alto_contraste', estado);
  aplicarAltoContrasteUI(estado);
  document.getElementById('dropdown-contraste').classList.remove('open');
}

function aplicarAltoContrasteUI(estado) {
  document.getElementById('val-contraste').textContent = estado;
  if (estado === 'Activado') {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
}

function cambiarTamanioLetra(tamanio) {
  localStorage.setItem('agroclima_tamanio_letra', tamanio);
  aplicarTamanioLetraUI(tamanio);
  document.getElementById('dropdown-letra').classList.remove('open');
}

function aplicarTamanioLetraUI(tamanio) {
  document.getElementById('val-letra').textContent = tamanio;
  const htmlEl = document.documentElement;
  htmlEl.classList.remove('font-pequena', 'font-normal', 'font-grande');
  if (tamanio === 'Pequeña') htmlEl.classList.add('font-pequena');
  else if (tamanio === 'Grande') htmlEl.classList.add('font-grande');
  else htmlEl.classList.add('font-normal');
}

function guardarUmbral(valor) {
  localStorage.setItem('agroclima_umbral_critico', valor);
  alert(`Umbral crítico actualizado a ${valor}. Las simulaciones y gráficos comparativos utilizarán este nuevo límite de alerta.`);
}

function toggleDropdown(id) {
  const el = document.getElementById(id);
  const estaAbierto = el.classList.contains('open');
  document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
  if (!estaAbierto) el.classList.add('open');
}

function seleccionarOpcion(idDropdown, accion) {
  const estado = (accion === 'Activar') ? 'Activado' : 'Desactivado';
  document.getElementById(idDropdown).querySelector('.dropdown-selected').textContent = estado;
  document.getElementById(idDropdown).classList.remove('open');
}

function toggleCanal(idCanal) {
  const el = document.getElementById(idCanal);
  el.classList.toggle('active');
  el.classList.toggle('inactive');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.custom-dropdown')) {
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
  }
});

function activarEdicion(campoId) {
  const contenedor = document.getElementById(`field-${campoId}`);
  const valEl = document.getElementById(`val-${campoId}`);
  const textoActual = valEl.textContent.trim();
  contenedor.innerHTML = `
    <span class="field-label">${capitalizar(campoId)}:</span>
    <input type="text" class="edit-input" id="input-${campoId}" value="${textoActual}" />
    <button class="btn-icon" onclick="guardarEdicion('${campoId}')" style="color:#059669;">✓</button>
    <button class="btn-icon" onclick="cancelarEdicion('${campoId}', '${textoActual}')" style="color:#dc2626;">✕</button>
  `;
}

function guardarEdicion(campoId) {
  const inputEl = document.getElementById(`input-${campoId}`);
  const nuevoTexto = inputEl.value.trim();
  if (!nuevoTexto) return;

  if (campoId === 'celular') {
    let limpio = nuevoTexto.replace(/\D/g, '');
    if (limpio.length !== 9) {
      alert('El número de celular debe tener exactamente 9 dígitos.');
      inputEl.focus();
      return;
    }
    localStorage.setItem('agroclima_telefono', limpio);
    restaurarCampoHTML(campoId, formatearTelefono(limpio));
    return;
  }

  if (campoId === 'nombres') {
    localStorage.setItem('agroclima_nombres', nuevoTexto);
  }
  restaurarCampoHTML(campoId, nuevoTexto);
}

function cancelarEdicion(campoId, textoOriginal) {
  restaurarCampoHTML(campoId, textoOriginal);
}

function restaurarCampoHTML(campoId, texto) {
  const contenedor = document.getElementById(`field-${campoId}`);
  contenedor.innerHTML = `
    <span class="field-label">${capitalizar(campoId)}:</span>
    <span class="field-value" id="val-${campoId}">${texto}</span>
    <button class="btn-icon" onclick="activarEdicion('${campoId}')">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
    </button>
  `;
}

function capitalizar(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function importarPadron() { document.getElementById('archivoPadron').click(); }

function procesarArchivo(e) { if(e.target.files[0]) alert(`¡Padrón "${e.target.files[0].name}" importado!`); }