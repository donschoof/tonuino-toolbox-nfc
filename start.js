const path = require('path');
const { pathToFileURL } = require('url');
const { app, BrowserWindow, ipcMain, protocol, dialog, globalShortcut, Menu, net } = require('electron');
//const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const template = require('./menu');

let mainWindow, dialogWindow, workerWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

function sendWindowMessage(targetWindow, message, payload) {
  if(typeof targetWindow === 'undefined') {
    console.log('Target window does not exist');
    return;
  }
  targetWindow.webContents.send(message, payload);
}

/*
 * Custom schemes must be registered as privileged before the app is ready.
 * protocol.registerFileProtocol/interceptFileProtocol were removed from
 * Electron; protocol.handle() (registered after whenReady) replaces both.
 */
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'coverart',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true }
  },
  {
    scheme: 'static',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true }
  }
]);

const registerProtocols = () => {

  protocol.handle('coverart', (request) => {
    const url = request.url.split('coverart://')[1].trim();
    const filePath = path.normalize(path.join(app.getPath('userData'), 'coverart', url));
    return net.fetch(pathToFileURL(filePath).toString());
  });

  protocol.handle('static', (request) => {
    const url = request.url.split('static://')[1].trim();
    const filePath = path.normalize(path.join(__dirname, 'static', url));
    return net.fetch(pathToFileURL(filePath).toString());
  });

};

const setMainMenu = () => {

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu)

};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 700,
    frame: false,
    webPreferences: {
      // Modern Electron defaults webPreferences.sandbox to true for every
      // renderer, which disables Node integration even with
      // nodeIntegration:true unless sandbox is explicitly turned back off.
      // This app's renderer code calls require() directly (no preload/
      // contextBridge split), so nodeIntegration + sandbox:false is kept
      // to preserve existing behavior. See the accompanying report for the
      // contextIsolation/preload migration this leaves as future work.
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      webSecurity: false
    },
    show: false,
    hasShadow: true,
    devTools: false
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', () => {

    mainWindow.show();
  });

  //mainWindow.webContents.openDevTools();

  workerWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false }
  });

  //workerWindow.webContents.openDevTools();

  workerWindow.loadFile('worker.html');

  ipcMain.on('command-from-window', (event, arg) => {
    sendWindowMessage(workerWindow, 'command-from-window', arg);
  });

  ipcMain.on('answer-from-worker', (event, arg) => {
    sendWindowMessage(mainWindow, 'answer-from-worker', arg);
  });

  ipcMain.on('logger-message', (event, arg) => {
    let thread = path.basename(event.sender.history[0]).replace('.html','');

    /*
    if(loggi[arg.type]) {
      if(typeof arg.message !== 'string') {
        loggi[arg.type](JSON.stringify(arg.message));
      }
      else {
        loggi[arg.type](arg.message);
      }

    }
    else {
      console.log(arg.type);
      console.warn(thread, arg);
    }
    */


  });


  /*
   * Main Window Actions
   */
  ipcMain.on('mainwindow-action', (event, action) => {

    switch (action) {

      case 'close':
        app.exit(0);
        break;

      case 'minimize':
        mainWindow.minimize();
        break;

      case 'maximize':
        if(mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        }
        else {
          mainWindow.maximize();
        }

        break;

    }

  });

  /*
   * mp3 chooser dialog
   */
  ipcMain.on('open-mp3-chooser', async () => {
    let result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [{
        name: 'MP3 Dateien',
        extensions: ['mp3']
      }],
      buttonLabel: 'Kopieren'
    });
    if(result && !result.canceled && result.filePaths.length > 0) {
      mainWindow.webContents.send('mp3s-choosed', result.filePaths);
    }

  });

  /*
   * Status Meldungen
   */
  ipcMain.on('status-message', async (event, arg) => {

    mainWindow.webContents.send('status-message', arg);

  });
};

const createWindowDialog = () => {

  dialogWindow = new BrowserWindow({
    width: 350,
    height: 240,
    frame: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false },
    show: false,
    modal: true,
    parent: mainWindow,
    resizable: false
  });

  dialogWindow.loadFile('dialog.html');

  ipcMain.on('open-dialog', (event, arg) => {
    dialogWindow.webContents.send('open-dialog', arg);
    dialogWindow.show();
  });

  ipcMain.on('answer-from-dialog', (event, arg) => {
    dialogWindow.hide();
    mainWindow.webContents.send('answer-from-dialog', arg);
  });

};

/* const initAutoUpdater = () => {

  ipcMain.on('restart-app', () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
  });

  mainWindow.webContents.on('did-finish-load', () => {

    setTimeout(() => {

      console.log('check for updates');
      autoUpdater.checkForUpdatesAndNotify();

    }, 5000);
  });

}; */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  /*
   * Replacements for the removed `electron.remote` module: app version and
   * well-known paths, previously read directly from the renderer/worker.
   * Registered once, here, so re-activating the app on macOS doesn't try
   * to register the same handle() twice.
   */
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('get-app-path', (event, name) => {
    return app.getPath(name);
  });

  registerProtocols();
  createWindow();
  createWindowDialog();
 // initAutoUpdater();
  setMainMenu();

  globalShortcut.register('Control+Shift+I', () => {
    return null;
  });

  globalShortcut.register('Control+Shift+T', () => {
    //workerWindow.show();
    workerWindow.openDevTools({mode: 'undocked'});
  });

  globalShortcut.register('Control+Shift+W', () => {
    //workerWindow.show();
    mainWindow.openDevTools({mode: 'undocked'});
  });


});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
