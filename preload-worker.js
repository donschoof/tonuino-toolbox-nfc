/*
 * Preload script for the hidden background-work window (worker.html).
 *
 * This window never touches the DOM for its own logic - it only exists as
 * a dedicated renderer process for filesystem/SD-card work (see worker.js
 * and worker/**). Preload scripts keep full Node & Electron module access
 * even when contextIsolation is enabled, so the simplest, most faithful
 * migration for this particular window is to keep its Node-heavy logic
 * running unchanged in the preload script instead of the page - no
 * contextBridge surface is required because the page itself calls into
 * nothing. worker.js and worker/**.js are therefore untouched; only the
 * place they get loaded from moved from an inline `require()` in
 * worker.html (which contextIsolation would break) to here.
 */
require('./worker.js');
