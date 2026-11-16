// Registra o service worker só no build de produção (no `vite dev` ele atrapalharia o HMR).
export default function registerSW() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Falha ao registrar o service worker:', error));
  });
}
