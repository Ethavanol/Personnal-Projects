// main.js

const { app, BrowserWindow, Menu } = require('electron');
const ejs = require('ejs');
const useApp = require('./routes');
const server = require('http').createServer(useApp);
const io = require('socket.io')(server);


// Créer la fenêtre de navigateur Electron
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Charger la page principale de l'application
  win.loadURL('http://localhost:3000');

  win.webContents.openDevTools()

  
  io.on('connection', function(socket) {   
    //console.log(`A user is connected`);
    socket.on('disconnect', function(){
   //   console.log('user disconnected');
    });
    socket.on('chatMessage', function(msg){
      console.log('message reçu ' +msg);
      socket.emit('chatMessage', msg);
    }) 
  });

  // Lancer le serveur Express
  server.listen(3000, function() {
    console.log('Serveur Express en cours d\'exécution sur le port 3000...');
  });
}

// Lancer l'application Electron
app.whenReady().then(() => {
  createWindow();
});

// Fermer l'application lorsque toutes les fenêtres sont fermées
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

