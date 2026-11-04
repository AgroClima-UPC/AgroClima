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

const entradaTelefono = document.getElementById('telefono');
const entradaCodigo = document.getElementById('codigo');

entradaTelefono.addEventListener('input', (evento) => {
  let valor = evento.target.value.replace(/[^\d\s]/g, '');
  let soloDigitos = valor.replace(/\s/g, '');
  if (soloDigitos.length > 9) {
    soloDigitos = soloDigitos.slice(0, 9);
    valor = soloDigitos;
  }
  evento.target.value = valor;
});

entradaCodigo.addEventListener('input', (evento) => {
  let valor = evento.target.value.replace(/\D/g, '');
  if (valor.length > 4) {
    valor = valor.slice(0, 4);
  }
  evento.target.value = valor;
});

document.getElementById('formularioIngreso').addEventListener('submit', (evento) => {
  const digitosTelefono = entradaTelefono.value.replace(/\s/g, '');
  if (digitosTelefono.length !== 9) {
    evento.preventDefault();
    alert('El número de teléfono debe tener exactamente 9 dígitos.');
    entradaTelefono.focus();
    return;
  }
  if (entradaCodigo.value.length !== 4) {
    evento.preventDefault();
    alert('El código de verificación debe tener exactamente 4 dígitos.');
    entradaCodigo.focus();
    return;
  }
});