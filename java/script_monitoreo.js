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
  document.querySelectorAll('.dropdown-menu-box').forEach(menu => {
    if (menu.id !== id) menu.classList.remove('show');
  });
  document.getElementById(id).classList.toggle('show');
}

function seleccionarAltitud(valor) {
  document.getElementById('btnAltitudText').textContent = `Altitud: ${valor} m.s.n.m.`;
  document.getElementById('dropdownAltitud').classList.remove('show');
}

function seleccionarProvincia(valor) {
  document.getElementById('btnProvinciaText').textContent = `Provincia: ${valor}`;
  document.getElementById('dropdownProvincia').classList.remove('show');
}

window.onclick = function(event) {
  if (!event.target.closest('.filter-dropdown-container')) {
    document.querySelectorAll('.dropdown-menu-box').forEach(menu => {
      menu.classList.remove('show');
    });
  }
}

function activarDifusion(btn, alertaId) {
  const estaSeleccionado = btn.classList.contains('seleccionado');
  if (!estaSeleccionado) {
    if (confirm(`¿Desea activar la difusión masiva automática para la ${alertaId}?`)) {
      btn.classList.add('seleccionado');
      btn.textContent = "Difusión activada";
      alert(`¡Difusión masiva activada con éxito para la ${alertaId}!`);
    }
  } else {
    if (confirm(`¿Desea desactivar la difusión masiva para la ${alertaId}?`)) {
      btn.classList.remove('seleccionado');
      btn.textContent = "Activar difusión masiva";
    }
  }
}

function seleccionarFiltroSemaforo(color) {
  alert(`Filtro de mapa actualizado: Mostrando zonas de nivel ${color.toUpperCase()}`);
}

function actualizarSimulacion(valor) {
  const tempNum = parseFloat(valor);
  
  document.getElementById('sliderTemperatura').value = tempNum;
  document.getElementById('modalSliderTemperatura').value = tempNum;
  const badge = document.getElementById('badgeTemperatura');
  badge.textContent = `${tempNum > 0 ? '+' : ''}${tempNum} °C`;
  if (tempNum <= 0) {
    badge.style.backgroundColor = '#fee2e2';
    badge.style.color = '#b91c1c';
  } else {
    badge.style.backgroundColor = '#e0f2fe';
    badge.style.color = '#0369a1';
  }
  
  let yStart = 80 - (tempNum * 6);
  let tempEnd = Math.max(-9, Math.min(8, tempNum - 7));
  let yEnd = 80 - (tempEnd * 6);
  let cp1x = 150, cp1y = yStart;
  let cp2x = 275, cp2y = yEnd;
  const pathD = `M 50 ${yStart} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, 375 ${yEnd}`;
  
  document.querySelectorAll('.curvaGraficoClase').forEach(curva => {
    curva.setAttribute('d', pathD);
  });
}

function validarPronostico() {
  const temperaturaActual = document.getElementById('sliderTemperatura').value;
  alert(`Pronóstico validado con éxito. Umbrales térmicos actualizados para la simulación a ${temperaturaActual}°C.`);
}

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

window.onload = function() {
  actualizarSimulacion(0);
};