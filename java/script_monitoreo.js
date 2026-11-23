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
  document.addEventListener('DOMContentLoaded', () => {
    aplicarPreferencias();
    aplicarMonitoreoDifundidos();
    actualizarMetricasSMS();
  });
})();

function actualizarMetricasSMS() {
  const total = localStorage.getItem('agroclima_total_sms');
  if (total) {
    document.querySelectorAll('.metric-card').forEach(card => {
      const title = card.querySelector('.metric-title');
      if (title && title.textContent.includes('SMS')) {
        const val = card.querySelector('.metric-value');
        if (val) val.textContent = Number(total).toLocaleString('es-PE');
      }
    });
  }
}

function aplicarMonitoreoDifundidos() {
  const monitoreoDif = JSON.parse(localStorage.getItem('agroclima_monitoreo_dif') || '{}');
  document.querySelectorAll('table tbody tr').forEach(fila => {
    Object.keys(monitoreoDif).forEach(alertaId => {
      if (fila.textContent.includes(alertaId)) {
        const btn = fila.querySelector('button');
        if (btn) {
          if (monitoreoDif[alertaId]) {
            btn.classList.add('seleccionado');
            btn.textContent = "Difusión activada";
          } else {
            btn.classList.remove('seleccionado');
            btn.textContent = "Activar difusión masiva";
          }
        }
      }
    });
  });
}

function toggleDropdown(id) {
  document.querySelectorAll('.dropdown-menu-box').forEach(menu => {
    if (menu.id !== id) menu.classList.remove('show');
  });
  document.getElementById(id).classList.toggle('show');
}

// Variables de estado para los filtros del mapa
let filtroSemaforoActivo = null; // 'rojo', 'amarillo', 'verde' o null
let filtroProvinciaActivo = 'Todas';
let filtroAltitudActivo = 'Todas';

function seleccionarAltitud(valor) {
  filtroAltitudActivo = valor;
  document.getElementById('btnAltitudText').textContent = valor === 'Todas' ? 'Altitud: Todas' : `Altitud: ${valor} m.s.n.m.`;
  document.getElementById('dropdownAltitud').classList.remove('show');
  filtrarAlertasMonitoreo();
}

function seleccionarProvincia(valor) {
  filtroProvinciaActivo = valor;
  document.getElementById('btnProvinciaText').textContent = valor === 'Todas' ? 'Provincia: Todas' : `Provincia: ${valor}`;
  document.getElementById('dropdownProvincia').classList.remove('show');
  filtrarAlertasMonitoreo();

  // Si seleccionó una provincia específica, resaltar fila en la tabla
  if (valor !== 'Todas') {
    resaltarFilaProvincia(valor);
  }
}

function seleccionarFiltroSemaforo(color) {
  const filasSemaforo = document.querySelectorAll('.semaforo-fila');
  if (filtroSemaforoActivo === color) {
    // Desactivar filtro
    filtroSemaforoActivo = null;
    filasSemaforo.forEach(f => f.classList.remove('active'));
  } else {
    filtroSemaforoActivo = color;
    filasSemaforo.forEach(f => f.classList.remove('active'));
    const el = document.getElementById(`semaforo-${color}`);
    if (el) el.classList.add('active');
  }
  filtrarAlertasMonitoreo();
}

function filtrarAlertasMonitoreo() {
  const busqueda = (document.getElementById('inputBuscarMapa')?.value || '').toLowerCase().trim();
  const filas = document.querySelectorAll('#tablaAlertasMonitoreo tbody tr');
  let visibles = 0;

  filas.forEach(fila => {
    if (fila.id === 'fila-sin-alertas') return;

    const textoFila = fila.textContent.toLowerCase();
    
    // 1. Filtro por buscador
    const coincideBusqueda = !busqueda || textoFila.includes(busqueda);

    // 2. Filtro por provincia
    let coincideProvincia = true;
    if (filtroProvinciaActivo && filtroProvinciaActivo !== 'Todas') {
      const pLimpia = filtroProvinciaActivo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const fLimpia = textoFila.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      coincideProvincia = fLimpia.includes(pLimpia) || (pLimpia === 'el collado' && fLimpia.includes('collao'));
    }

    // 3. Filtro por altitud
    let coincideAltitud = true;
    if (filtroAltitudActivo && filtroAltitudActivo !== 'Todas') {
      if (filtroAltitudActivo === '>3 800') {
        coincideAltitud = textoFila.includes('sand') || textoFila.includes('colla');
      } else if (filtroAltitudActivo === '3 501-3 800') {
        coincideAltitud = textoFila.includes('lampa') || textoFila.includes('puno');
      }
    }

    // 4. Filtro por semáforo de riesgo
    let coincideSemaforo = true;
    if (filtroSemaforoActivo === 'rojo') {
      coincideSemaforo = textoFila.includes('alto');
    } else if (filtroSemaforoActivo === 'amarillo') {
      coincideSemaforo = textoFila.includes('medio');
    } else if (filtroSemaforoActivo === 'verde') {
      coincideSemaforo = textoFila.includes('bajo');
    }

    if (coincideBusqueda && coincideProvincia && coincideAltitud && coincideSemaforo) {
      fila.style.display = '';
      visibles++;
    } else {
      fila.style.display = 'none';
    }
  });

  let filaSinResultados = document.getElementById('fila-sin-alertas');
  if (visibles === 0) {
    if (!filaSinResultados) {
      filaSinResultados = document.createElement('tr');
      filaSinResultados.id = 'fila-sin-alertas';
      filaSinResultados.innerHTML = `<td colspan="6" style="text-align: center; padding: 24px; color: #6b7280; font-style: italic;">No se encontraron alertas para los criterios seleccionados.</td>`;
      document.querySelector('#tablaAlertasMonitoreo tbody').appendChild(filaSinResultados);
    }
    filaSinResultados.style.display = '';
  } else if (filaSinResultados) {
    filaSinResultados.style.display = 'none';
  }
}

function resaltarFilaProvincia(nombreProvincia) {
  const pLimpia = nombreProvincia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filas = document.querySelectorAll('#tablaAlertasMonitoreo tbody tr');
  filas.forEach(fila => {
    const fLimpia = fila.textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (fLimpia.includes(pLimpia) || (pLimpia === 'el collado' && fLimpia.includes('collao'))) {
      fila.classList.remove('table-row-highlight');
      void fila.offsetWidth; // trigger reflow
      fila.classList.add('table-row-highlight');
      fila.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
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
    mostrarConfirmacion({
      titulo: 'Activar Difusión Masiva',
      mensaje: `¿Desea activar la difusión masiva automática para la ${alertaId}?\nSe emitirán alertas a todos los agricultores registrados en la zona.`,
      tipo: 'warning',
      textoConfirmar: 'Activar difusión',
      textoCancelar: 'Cancelar',
      onConfirm: () => {
        btn.classList.add('seleccionado');
        btn.textContent = "Difusión activada";

        // Guardar en bitácora de reportes
        const bitacora = JSON.parse(localStorage.getItem('agroclima_reportes_bitacora') || '[]');
        const numSms = 4 + bitacora.length;
        const idSms = `SMS-00${numSms}`;
        let comunidad = "Sandia";
        if (alertaId.includes("2")) comunidad = "El Collao";
        else if (alertaId.includes("3")) comunidad = "Lampa";

        const nuevoEnvio = {
          id: idSms,
          alertaId: alertaId,
          comunidad: comunidad,
          canal: 'SMS Masivo',
          estado: 'Entregado (100%)',
          lecturas: '100% (Recibido)',
          fecha: '10 Oct 2026'
        };
        bitacora.unshift(nuevoEnvio);
        localStorage.setItem('agroclima_reportes_bitacora', JSON.stringify(bitacora));

        // Guardar estado del botón en monitoreo
        const monitoreoDif = JSON.parse(localStorage.getItem('agroclima_monitoreo_dif') || '{}');
        monitoreoDif[alertaId] = true;
        localStorage.setItem('agroclima_monitoreo_dif', JSON.stringify(monitoreoDif));

        let totalSms = parseInt(localStorage.getItem('agroclima_total_sms') || '8450', 10);
        totalSms += 1240;
        localStorage.setItem('agroclima_total_sms', totalSms.toString());
        actualizarMetricasSMS();

        mostrarAlerta({
          titulo: '¡Difusión Activada!',
          mensaje: `¡Difusión masiva activada con éxito para la ${alertaId}!\n\nSe registró en la Bitácora de Reportes como ${idSms}.`,
          tipo: 'success'
        });
      }
    });
  } else {
    mostrarConfirmacion({
      titulo: 'Desactivar Difusión',
      mensaje: `¿Desea desactivar la difusión masiva para la ${alertaId}?`,
      tipo: 'info',
      textoConfirmar: 'Desactivar',
      textoCancelar: 'Mantener activa',
      onConfirm: () => {
        btn.classList.remove('seleccionado');
        btn.textContent = "Activar difusión masiva";
        const monitoreoDif = JSON.parse(localStorage.getItem('agroclima_monitoreo_dif') || '{}');
        monitoreoDif[alertaId] = false;
        localStorage.setItem('agroclima_monitoreo_dif', JSON.stringify(monitoreoDif));

        mostrarAlerta({
          titulo: 'Difusión Desactivada',
          mensaje: `La difusión automática para la ${alertaId} ha sido pausada.`,
          tipo: 'info'
        });
      }
    });
  }
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
  mostrarAlerta({
    titulo: 'Pronóstico Validado',
    mensaje: `Pronóstico validado con éxito.\nUmbrales térmicos actualizados para la simulación a ${temperaturaActual} °C.`,
    tipo: 'success'
  });
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
