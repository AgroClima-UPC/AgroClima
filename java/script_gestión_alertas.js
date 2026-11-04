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

function abrirModal() {
  document.getElementById('modalConfirmacion').classList.add('show');
}

function cerrarModal() {
  document.getElementById('modalConfirmacion').classList.remove('show');
}

function confirmarEnvio() {
  cerrarModal();
  alert("¡Difusión masiva ejecutada y enviada exitosamente a la red comunal!");
}

function cambiarPlantilla(valor) {
  const textarea = document.getElementById('textoMensajeSMS');
  const contador = document.getElementById('contadorCaracteres');
  
  if (valor === "1") {
    textarea.value = "AGROCLIMA: Helada en Sandia el 10/10 entre 2AM-5AM. Aplique riego por aspersion o aporque alto en sus cultivos de papa.";
    contador.textContent = "Mensaje (119/160 caracteres) — Alcance estimado: 1,240 agricultores empadronados en Sandia";
  } else if (valor === "2") {
    textarea.value = "AGROCLIMA: Alerta moderada de helada. Realice aporques altos y cobertura de suelo en sus parcelas para proteger los cultivos.";
    contador.textContent = "Mensaje (133/160 caracteres) — Alcance estimado: 980 agricultores empadronados";
  } else if (valor === "3") {
    textarea.value = "AGROCLIMA: Descenso brusco de temperatura. Se recomienda el uso preventivo de mantas térmicas en viveros y semilleros.";
    contador.textContent = "Mensaje (128/160 caracteres) — Alcance estimado: 1,150 agricultores empadronados";
  }
}