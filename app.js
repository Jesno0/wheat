'use strict';

require('koa2frame').start(__dirname);

try {require('electron')}
catch (err) {return;}

// Modules to control application life and create native browser window
const {app, BrowserWindow,Menu} = require('electron');
const path = require('path');

function createWindow () {
    Menu.setApplicationMenu(null);
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1100,
        height: 850,
        webPreferences: {
            // preload: path.join(__dirname, './view/js/main.js')
        }
    });

    // and load the index.html of the app.
    // mainWindow.loadFile('./view/index.html');

    // or load the url of the app
    mainWindow.loadURL('http://localhost:3003');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

 //In this file you can include the rest of your app's specific main process
 //code. You can also put them in separate files and require them here.