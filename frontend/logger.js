/*
 * Browser-safe logger for renderer code bundled into index.bundle.js /
 * dialog.bundle.js. The original root-level logger.js requires
 * electron-log + ipcRenderer directly, which only works with Node
 * integration; with contextIsolation enabled these renderers instead
 * forward through window.electronAPI (see preload-main.js /
 * preload-dialog.js) to the same electron-log instance in the main
 * process (see the 'renderer-log' handler in start.js). worker.js and the
 * worker/**.js files keep using the original root logger.js unchanged,
 * since they still run with full Node access via preload-worker.js.
 */

const send = (level, args) => {
  try {
    if (window.electronAPI && typeof window.electronAPI.send === 'function') {
      window.electronAPI.send('renderer-log', { level: level, args: args });
    }
  } catch (e) {
    // ignore - logging must never crash the UI
  }
};

const logger = {

  log: (...args) => {
    console.log(...args);
    send('info', args);
  },

  warn: (...args) => {
    console.warn(...args);
    send('warn', args);
  },

  error: (...args) => {
    console.error(...args);
    send('error', args);
  }

};

module.exports = logger;
