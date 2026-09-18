/*
 * Preload script for the main window (index.html).
 *
 * contextIsolation is enabled for this window, so the page can no longer
 * `require()` Node/Electron modules directly. This preload script keeps
 * running with full Node access (preload scripts always do, regardless of
 * contextIsolation) and exposes a narrow, explicit API on
 * `window.electronAPI` via contextBridge instead of the raw `ipcRenderer`.
 *
 * Only the channels this window actually uses (see frontend/**) are
 * whitelisted below.
 */
const { contextBridge, ipcRenderer, shell } = require('electron');

const VALID_SEND_CHANNELS = [
  'command-from-window',
  'mainwindow-action',
  'open-mp3-chooser',
  'open-dialog',
  'restart-app',
  'renderer-log'
];

const VALID_ON_CHANNELS = [
  'answer-from-worker',
  'mp3s-choosed',
  'status-message',
  'answer-from-dialog',
  'update-available',
  'update-downloaded'
];

const VALID_INVOKE_CHANNELS = [
  'get-app-version',
  'get-app-path'
];

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    if (VALID_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, callback) => {
    if (VALID_ON_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  removeAllListeners: (channel) => {
    if (VALID_ON_CHANNELS.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
  invoke: (channel, ...args) => {
    if (VALID_INVOKE_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error('Invalid invoke channel: ' + channel));
  },
  openExternal: (url) => shell.openExternal(url)
});
