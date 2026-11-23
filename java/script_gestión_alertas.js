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
    aplicarAlertasDifundidas();
    actualizarMetricasSMS();
  });
})();

let difusionPendiente = null;

function prepararDifusionAlerta(alertaId, comunidad, canal, fecha) {
  difusionPendiente = {
    tipo: 'alerta',
    alertaId: alertaId,
    comunidad: comunidad,
    canal: canal,
    fecha: fecha,
    alcance: 1240
  };
  const modalMsg = document.querySelector('#modalConfirmacion .modal-title-text');
  if (modalMsg) {
    modalMsg.textContent = `¿Desea confirmar el envío del aviso (${alertaId} - ${comunidad})?`;
  }
  abrirModal();
}

function cambiarDestino(destino) {
  const textarea = document.getElementById('textoMensajeSMS');
  if (textarea) {
    let texto = textarea.value;
    texto = texto.replace(/Sandia|El Collao|Lampa|Carabaya|Todas las zonas en alerta/gi, destino);
    textarea.value = texto;
  }
  actualizarContadorTexto();
}

function prepararDifusionConsola() {
  const selectDestino = document.getElementById('selectorDestino');
  const comunidad = selectDestino ? selectDestino.value : "Sandia";
  const option = selectDestino ? selectDestino.options[selectDestino.selectedIndex] : null;
  const alcance = option ? parseInt(option.getAttribute('data-alcance') || '1240', 10) : 1240;

  const idGen = 'CONSOLA-' + Date.now().toString().slice(-4);
  difusionPendiente = {
    tipo: 'consola',
    alertaId: idGen,
    comunidad: comunidad,
    canal: 'SMS Masivo (Pasarela)',
    fecha: '10 Oct 2026',
    alcance: alcance
  };
  const modalMsg = document.querySelector('#modalConfirmacion .modal-title-text');
  if (modalMsg) {
    modalMsg.textContent = `¿Desea confirmar la difusión masiva para: ${comunidad}?`;
  }
  abrirModal();
}

function abrirModal() {
  if (!difusionPendiente) {
    prepararDifusionConsola();
    return;
  }
  document.getElementById('modalConfirmacion').classList.add('show');
}

function cerrarModal() {
  document.getElementById('modalConfirmacion').classList.remove('show');
  difusionPendiente = null;
}

function confirmarEnvio() {
  if (!difusionPendiente) {
    cerrarModal();
    return;
  }
  const info = difusionPendiente;
  document.getElementById('modalConfirmacion').classList.remove('show');
  difusionPendiente = null;

  // 1. Guardar en lista de alertas difundidas para persistir el botón
  if (info.tipo === 'alerta') {
    const difundidas = JSON.parse(localStorage.getItem('agroclima_alertas_difundidas') || '{}');
    difundidas[info.alertaId] = true;
    localStorage.setItem('agroclima_alertas_difundidas', JSON.stringify(difundidas));
    marcarBotonDifundido(info.alertaId);
  }

  // 2. Registrar en la Bitácora de Reportes
  const bitacora = JSON.parse(localStorage.getItem('agroclima_reportes_bitacora') || '[]');
  const numSms = 4 + bitacora.length;
  const idSms = `SMS-00${numSms}`;

  const nuevoEnvio = {
    id: idSms,
    alertaId: info.alertaId,
    comunidad: info.comunidad,
    canal: info.canal,
    estado: 'Entregado (100%)',
    lecturas: '100% (Recibido)',
    fecha: info.fecha || '10 Oct 2026'
  };

  bitacora.unshift(nuevoEnvio);
  localStorage.setItem('agroclima_reportes_bitacora', JSON.stringify(bitacora));

  // 3. Incrementar métrica de SMS con el alcance real seleccionado
  let totalSms = parseInt(localStorage.getItem('agroclima_total_sms') || '8450', 10);
  totalSms += (info.alcance || 1240);
  localStorage.setItem('agroclima_total_sms', totalSms.toString());
  actualizarMetricasSMS();

  mostrarAlerta({
    titulo: '¡Difusión Masiva Ejecutada!',
    mensaje: `Se ha emitido el aviso ${idSms} (${info.alertaId} con destino a ${info.comunidad}) exitosamente.\n\nYa se encuentra guardado en la Bitácora de Reportes.`,
    tipo: 'success'
  });
}

function aplicarAlertasDifundidas() {
  const difundidas = JSON.parse(localStorage.getItem('agroclima_alertas_difundidas') || '{}');
  Object.keys(difundidas).forEach(id => {
    if (difundidas[id]) {
      marcarBotonDifundido(id);
    }
  });
}

function marcarBotonDifundido(id) {
  const btn = document.getElementById(`btn-${id}`);
  if (btn) {
    btn.textContent = 'Difundido ✓';
    btn.disabled = true;
    btn.classList.add('difundido');
  }
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

function cambiarPlantilla(valor) {
  const textarea = document.getElementById('textoMensajeSMS');
  const destino = document.getElementById('selectorDestino')?.value || 'Sandia';
  
  if (valor === "1") {
    textarea.value = `AGROCLIMA: Helada en ${destino} el 10/10 entre 2AM-5AM. Aplique riego por aspersion o aporque alto en sus cultivos de papa.`;
  } else if (valor === "2") {
    textarea.value = `AGROCLIMA: Alerta moderada de helada en ${destino}. Realice aporques altos y cobertura de suelo en sus parcelas para proteger los cultivos.`;
  } else if (valor === "3") {
    textarea.value = `AGROCLIMA: Descenso brusco de temperatura en ${destino}. Se recomienda el uso preventivo de mantas térmicas en viveros y semilleros.`;
  }
  actualizarContadorTexto();
}

function actualizarContadorTexto() {
  const textarea = document.getElementById('textoMensajeSMS');
  const contador = document.getElementById('contadorCaracteres');
  const selectDestino = document.getElementById('selectorDestino');
  const destino = selectDestino ? selectDestino.value : 'Sandia';
  const option = selectDestino ? selectDestino.options[selectDestino.selectedIndex] : null;
  const alcanceNum = option ? Number(option.getAttribute('data-alcance') || 1240).toLocaleString('es-PE') : '1,240';

  if (textarea && contador) {
    const len = textarea.value.length;
    contador.textContent = `Mensaje (${len}/160 caracteres) — Alcance estimado: ${alcanceNum} agricultores empadronados en ${destino}`;
  }
}

function filtrarTablaAlertas() {
  const busqueda = (document.getElementById('inputBuscarAlertas')?.value || '').toLowerCase().trim();
  const provincia = document.getElementById('filtroProvinciaAlertas')?.value || 'Todas';
  const riesgo = document.getElementById('filtroRiesgoAlertas')?.value || 'Todos';
  const fecha = document.getElementById('filtroFechaAlertas')?.value || 'Todas';

  const filas = document.querySelectorAll('#tablaAlertasGestion tbody tr');

  filas.forEach(fila => {
    const textoFila = fila.textContent.toLowerCase();
    const coincideBusqueda = !busqueda || textoFila.includes(busqueda);
    const coincideProvincia = provincia === 'Todas' || textoFila.includes(provincia.toLowerCase());
    const coincideRiesgo = riesgo === 'Todos' || textoFila.includes(riesgo.toLowerCase());
    let coincideFecha = true;
    if (fecha === 'Hoy') coincideFecha = textoFila.includes('10 oct');
    else if (fecha === 'Esta semana') coincideFecha = true;

    if (coincideBusqueda && coincideProvincia && coincideRiesgo && coincideFecha) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  });
}
