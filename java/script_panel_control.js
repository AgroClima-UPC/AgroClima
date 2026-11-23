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

function emitirAvisoUrgente() {
  mostrarConfirmacion({
    titulo: 'Aviso Urgente de Helada',
    mensaje: '¿Desea emitir el aviso urgente de helada para la provincia de Puno (Sandia)?\nSe alertará de inmediato a los dirigentes y agricultores.',
    tipo: 'warning',
    textoConfirmar: 'Emitir aviso urgente',
    textoCancelar: 'Cancelar',
    onConfirm: () => {
      const bitacora = JSON.parse(localStorage.getItem('agroclima_reportes_bitacora') || '[]');
      const numSms = 4 + bitacora.length;
      const idSms = `SMS-00${numSms}`;
      const nuevoEnvio = {
        id: idSms,
        alertaId: 'ALRT-URGENTE',
        comunidad: 'Sandia',
        canal: 'SMS Urgente (SENAMHI)',
        estado: 'Entregado (100%)',
        lecturas: '100% (Recibido)',
        fecha: '10 Oct 2026'
      };
      bitacora.unshift(nuevoEnvio);
      localStorage.setItem('agroclima_reportes_bitacora', JSON.stringify(bitacora));

      let totalSms = parseInt(localStorage.getItem('agroclima_total_sms') || '8450', 10);
      totalSms += 1240;
      localStorage.setItem('agroclima_total_sms', totalSms.toString());
      actualizarMetricasSMS();

      mostrarAlerta({
        titulo: '¡Aviso Urgente Emitido!',
        mensaje: `¡Aviso emitido exitosamente a los dirigentes y agricultores de Sandia!\n\nSe ha guardado en la Bitácora de Reportes como ${idSms}.`,
        tipo: 'success'
      });
    }
  });
}

function actualizarSimulacion(valor) {
  const tempNum = parseFloat(valor);
  
  // Sincronizar sliders
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
  
  // Actualizar ambas curvas SVG (la previa y la del modal)
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

window.onload = function() {
  actualizarSimulacion(0);
};
