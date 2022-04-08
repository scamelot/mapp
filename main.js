const { app, BrowserWindow } = require('electron')
const JamfApiClient = require('jamf')
const path = require('path')

const createWindow = () => {
    const window = new BrowserWindow({
        width:700,
        height: 450,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    window.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

// Mac open new window if none open
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
})

//Linux / Win kill app on window close
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

