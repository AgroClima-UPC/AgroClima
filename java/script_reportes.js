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
    aplicarBitacoraGuardada();
    aplicarReintentosGuardados();
    actualizarMetricasSMS();
  });
})();

function aplicarBitacoraGuardada() {
  const bitacora = JSON.parse(localStorage.getItem('agroclima_reportes_bitacora') || '[]');
  if (!bitacora.length) return;

  const tbody = document.querySelector('#tablaBitacora tbody');
  if (!tbody) return;

  // Insertar cada registro difundido en la parte superior de la tabla
  bitacora.slice().reverse().forEach(item => {
    const idFila = `fila-${item.id}`;
    if (!document.getElementById(idFila)) {
      const nuevaFila = document.createElement('tr');
      nuevaFila.id = idFila;
      nuevaFila.innerHTML = `
        <td><strong>${item.id}</strong></td>
        <td>${item.comunidad}</td>
        <td>${item.canal}</td>
        <td>${item.estado}</td>
        <td>${item.lecturas}</td>
        <td>${item.fecha}</td>
      `;
      tbody.insertBefore(nuevaFila, tbody.firstChild);
    }
  });
}

function aplicarReintentosGuardados() {
  const reintentos = JSON.parse(localStorage.getItem('agroclima_reintentos_sms') || '{}');
  const filas = document.querySelectorAll('#tablaBitacora tbody tr');
  filas.forEach(fila => {
    Object.keys(reintentos).forEach(idSms => {
      if (reintentos[idSms] && fila.textContent.includes(idSms)) {
        const celdas = fila.children;
        if (celdas.length >= 5) {
          celdas[3].textContent = 'Entregado (100%)';
          celdas[4].textContent = '100% (Recibido)';
        }
      }
    });
  });
}

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

    // Guardar persistencia en localStorage para que no se reinicie al salir o recargar
    const reintentos = JSON.parse(localStorage.getItem('agroclima_reintentos_sms') || '{}');
    reintentos[idSms] = true;
    localStorage.setItem('agroclima_reintentos_sms', JSON.stringify(reintentos));

    mostrarAlerta({
      titulo: '¡Reintento Exitoso!',
      mensaje: `El aviso ${idSms} fue reenviado exitosamente a la red comunal y marcado como entregado (100%).`,
      tipo: 'success'
    });
  }, 1200);
}

function exportarReporte() {
  const prov = document.querySelector('#dropdown-provincia .dropdown-selected').textContent;
  const rango = document.querySelector('#dropdown-rango .dropdown-selected').textContent;
  const cultivo = document.querySelector('#dropdown-cultivo .dropdown-selected').textContent;

  // Generar descarga real de archivo CSV con los datos actuales de la bitácora
  let csvContent = "Envio ID,Comunidad,Canal,Estado,Lecturas,Fecha\n";
  const filas = document.querySelectorAll('#tablaBitacora tbody tr');
  filas.forEach(fila => {
    if (fila.style.display !== 'none' && fila.id !== 'fila-sin-alertas') {
      const celdas = Array.from(fila.querySelectorAll('td')).map(td => `"${td.innerText.trim().replace(/\n/g, ' ')}"`);
      if (celdas.length >= 6) {
        csvContent += celdas.join(",") + "\n";
      }
    }
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.setAttribute("href", url);
  enlace.setAttribute("download", `Reporte_Bitacora_AgroClima_${prov}_${Date.now()}.csv`);
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  mostrarAlerta({
    titulo: '¡Reporte Descargado!',
    mensaje: `Se ha descargado el archivo CSV con la trazabilidad filtrada:\n- Provincia: ${prov}\n- Rango: ${rango}\n- Cultivo: ${cultivo}`,
    tipo: 'success'
  });
}

function confirmarBorrarReportes() {
  mostrarConfirmacion({
    titulo: '¿Borrar todos los reportes?',
    mensaje: 'Se eliminarán todos los avisos SMS emitidos de la bitácora y se restablecerán los registros iniciales.\n\n¿Estás seguro de continuar?',
    tipo: 'danger',
    textoConfirmar: 'Sí, borrar todo',
    textoCancelar: 'Cancelar',
    onConfirm: () => {
      // 1. Limpiar localStorage de reportes generados
      localStorage.removeItem('agroclima_reportes_bitacora');
      localStorage.removeItem('agroclima_alertas_difundidas');
      localStorage.removeItem('agroclima_monitoreo_dif');
      localStorage.setItem('agroclima_total_sms', '8450');

      // 2. Restaurar la tabla al estado inicial (solo SMS-001, SMS-002, SMS-003)
      const tbody = document.querySelector('#tablaBitacora tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td><strong>SMS-001</strong></td>
            <td>Sandia</td>
            <td>SMS Prioritario</td>
            <td>Entregado (95%)</td>
            <td>80% (1 respuesta)</td>
            <td>9 Oct 2026</td>
          </tr>
          <tr>
            <td><strong>SMS-002</strong></td>
            <td>El Collao</td>
            <td>SMS Masivo</td>
            <td>Entregado (90%)</td>
            <td>75% (18 respuestas)</td>
            <td>8 Oct 2026</td>
          </tr>
          <tr>
            <td><strong>SMS-003</strong></td>
            <td>Lampa</td>
            <td>Notificación Push</td>
            <td>Fallido / Retir.</td>
            <td>
              <button class="btn-retry" onclick="reintentarEnvio('SMS-003', this)">Reintentar</button>
            </td>
            <td>7 Oct 2026</td>
          </tr>
        `;
      }

      // 3. Actualizar tarjetas métricas
      actualizarMetricasSMS();

      mostrarAlerta({
        titulo: '¡Bitácora Limpiada!',
        mensaje: 'Se han eliminado los reportes acumulados y se restauró la bitácora al estado original.',
        tipo: 'success'
      });
    }
  });
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
