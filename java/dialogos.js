/**
 * Sistema de Notificaciones y Cuadros de Diálogo Modernos para AgroClima
 * Reemplaza los 'alert()' y 'confirm()' nativos del navegador por modales estilizados.
 */
(function() {
  // Inyectar estilos CSS una sola vez
  if (!document.getElementById('agro-dialog-styles')) {
    const style = document.createElement('style');
    style.id = 'agro-dialog-styles';
    style.textContent = `
      .agro-dialog-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: agroFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes agroFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .agro-dialog-card {
        background: #ffffff;
        border-radius: 20px;
        width: 100%;
        max-width: 440px;
        padding: 28px 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
        border: 1px solid #e5e7eb;
        animation: agroPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        text-align: center;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }
      @keyframes agroPop {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .agro-dialog-icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px auto;
      }
      .agro-dialog-icon.warning {
        background-color: #fef3c7;
        color: #d97706;
      }
      .agro-dialog-icon.danger {
        background-color: #fee2e2;
        color: #dc2626;
      }
      .agro-dialog-icon.success {
        background-color: #dcfce7;
        color: #16a34a;
      }
      .agro-dialog-icon.info {
        background-color: #e0f2fe;
        color: #0284c7;
      }
      .agro-dialog-title {
        font-size: 18px;
        font-weight: 700;
        color: #111827;
        margin: 0 0 8px 0;
        letter-spacing: -0.01em;
      }
      .agro-dialog-message {
        font-size: 14px;
        color: #4b5563;
        line-height: 1.55;
        margin: 0 0 24px 0;
        white-space: pre-line;
      }
      .agro-dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
      .agro-dialog-btn {
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        padding: 11px 22px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex: 1;
        border: none;
        outline: none;
      }
      .agro-dialog-btn-primary {
        background-color: #14532d;
        color: #ffffff;
        box-shadow: 0 2px 4px rgba(20, 83, 45, 0.2);
      }
      .agro-dialog-btn-primary:hover {
        background-color: #166534;
        transform: translateY(-1px);
      }
      .agro-dialog-btn-danger {
        background-color: #dc2626;
        color: #ffffff;
        box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
      }
      .agro-dialog-btn-danger:hover {
        background-color: #b91c1c;
        transform: translateY(-1px);
      }
      .agro-dialog-btn-cancel {
        background-color: #f3f4f6;
        color: #4b5563;
        border: 1px solid #d1d5db;
      }
      .agro-dialog-btn-cancel:hover {
        background-color: #e5e7eb;
        color: #111827;
      }
    `;
    document.head.appendChild(style);
  }

  function getIconSVG(tipo) {
    if (tipo === 'success') {
      return `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    }
    if (tipo === 'danger') {
      return `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
    }
    if (tipo === 'warning') {
      return `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    }
    return `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  }

  window.mostrarAlerta = function(opciones) {
    let titulo = 'AgroClima';
    let mensaje = '';
    let tipo = 'info';

    if (typeof opciones === 'string') {
      mensaje = opciones;
    } else if (opciones) {
      titulo = opciones.titulo || titulo;
      mensaje = opciones.mensaje || '';
      tipo = opciones.tipo || tipo;
    }

    const overlay = document.createElement('div');
    overlay.className = 'agro-dialog-overlay';
    overlay.innerHTML = `
      <div class="agro-dialog-card">
        <div class="agro-dialog-icon ${tipo}">
          ${getIconSVG(tipo)}
        </div>
        <h3 class="agro-dialog-title">${titulo}</h3>
        <p class="agro-dialog-message">${mensaje}</p>
        <div class="agro-dialog-actions">
          <button class="agro-dialog-btn agro-dialog-btn-primary" id="btn-dialog-ok">Entendido</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btnOk = overlay.querySelector('#btn-dialog-ok');
    btnOk.focus();

    function cerrar() {
      overlay.remove();
      if (opciones && typeof opciones.onClose === 'function') opciones.onClose();
    }

    btnOk.addEventListener('click', cerrar);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrar();
    });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        document.removeEventListener('keydown', escHandler);
        cerrar();
      }
    });
  };

  window.mostrarConfirmacion = function(opciones) {
    const titulo = opciones.titulo || 'Confirmación';
    const mensaje = opciones.mensaje || '';
    const tipo = opciones.tipo || 'warning';
    const textoConfirmar = opciones.textoConfirmar || 'Confirmar';
    const textoCancelar = opciones.textoCancelar || 'Cancelar';
    const btnClase = tipo === 'danger' ? 'agro-dialog-btn-danger' : 'agro-dialog-btn-primary';

    const overlay = document.createElement('div');
    overlay.className = 'agro-dialog-overlay';
    overlay.innerHTML = `
      <div class="agro-dialog-card">
        <div class="agro-dialog-icon ${tipo}">
          ${getIconSVG(tipo)}
        </div>
        <h3 class="agro-dialog-title">${titulo}</h3>
        <p class="agro-dialog-message">${mensaje}</p>
        <div class="agro-dialog-actions">
          <button class="agro-dialog-btn agro-dialog-btn-cancel" id="btn-dialog-cancel">${textoCancelar}</button>
          <button class="agro-dialog-btn ${btnClase}" id="btn-dialog-confirm">${textoConfirmar}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirm = overlay.querySelector('#btn-dialog-confirm');
    const btnCancel = overlay.querySelector('#btn-dialog-cancel');
    btnConfirm.focus();

    function cerrar(confirmado) {
      overlay.remove();
      if (confirmado && typeof opciones.onConfirm === 'function') {
        opciones.onConfirm();
      } else if (!confirmado && typeof opciones.onCancel === 'function') {
        opciones.onCancel();
      }
    }

    btnConfirm.addEventListener('click', () => cerrar(true));
    btnCancel.addEventListener('click', () => cerrar(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrar(false);
    });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', escHandler);
        cerrar(false);
      }
    });
  };
})();
