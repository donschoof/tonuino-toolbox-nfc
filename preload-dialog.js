/*
 * Preload script for the modal dialog window (dialog.html).
 * Same reasoning as preload-main.js, but this window only ever uses two
 * IPC channels, so its whitelist is much smaller.
 */
const { contextBridge, ipcRenderer } = require('electron');

const VALID_SEND_CHANNELS = ['answer-from-dialog', 'renderer-log'];
const VALID_ON_CHANNELS = ['open-dialog'];

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
  }
});
