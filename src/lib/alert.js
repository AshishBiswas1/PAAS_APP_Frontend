export default function showAlert(message, type = 'info', timeout = 3500) {
  try {
    const id = `alert-${Date.now()}`;
    const container = document.createElement('div');
    container.id = id;
    container.style.position = 'fixed';
    container.style.right = '20px';
    container.style.top = '20px';
    container.style.zIndex = 9999;
    container.style.pointerEvents = 'auto';

    const box = document.createElement('div');
    box.textContent = message;
    box.style.padding = '10px 14px';
    box.style.borderRadius = '8px';
    box.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    box.style.color = '#fff';
    box.style.fontFamily =
      'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial';
    box.style.fontSize = '13px';
    box.style.maxWidth = '320px';
    box.style.wordBreak = 'break-word';

    if (type === 'success') {
      box.style.background = 'linear-gradient(90deg,#10b981,#059669)';
    } else if (type === 'error') {
      box.style.background = 'linear-gradient(90deg,#ef4444,#dc2626)';
    } else {
      box.style.background = 'linear-gradient(90deg,#0ea5e9,#0369a1)';
    }

    container.appendChild(box);
    document.body.appendChild(container);

    setTimeout(() => {
      container.style.transition = 'opacity 200ms ease, transform 200ms ease';
      container.style.opacity = '0';
      container.style.transform = 'translateY(-6px)';
      setTimeout(() => document.body.removeChild(container), 220);
    }, timeout);
  } catch (e) {
    // fallback
    try {
      alert(message);
    } catch (_) {}
  }
}
