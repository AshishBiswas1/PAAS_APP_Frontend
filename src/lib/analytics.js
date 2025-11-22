export function trackEvent(name, props = {}) {
  try {
    // Lightweight, no-op analytics: replace with real tracking when available
    console.log('[analytics]', name, props);
  } catch (e) {
    // swallow errors to avoid breaking UI
  }
}
