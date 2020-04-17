// Imports
const express = require('express');
const webRoutes = require('./routes/web');

// Session imports
let cookieParser = require('cookie-parser');
let session = require('express-session');
let flash = require('express-flash');
let passport = require('passport');

// Express app creation
const app = express();

//Socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);


// Configurations
const appConfig = require('./configs/app');

// View engine configs
const exphbs = require('express-handlebars');
const hbshelpers = require("handlebars-helpers");
const multihelpers = hbshelpers();
const extNameHbs = 'hbs';
const hbs = exphbs.create({
  extname: extNameHbs,
  helpers: multihelpers
});
app.engine(extNameHbs, hbs.engine);
app.set('view engine', extNameHbs);

// Session configurations
let sessionStore = new session.MemoryStore;
app.use(cookieParser());
app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: appConfig.secret
}));
app.use(flash());

// Configuraciones de passport
require('./configs/passport');
app.use(passport.initialize());
app.use(passport.session());

// Receive parameters from the Form requests
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/', express.static(__dirname + '/public'));
app.use('/', webRoutes);

let activeGame = false;
let activePlayers = 3; 


io.on('disconnect', (socket) =>{
  console.log("Client Disconnected");
})

let letter = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

let playerName = [{name: 'generic name 1', used: false}, {name: 'generic name 2', used: false}, {name: 'generic name 3', used: false}];

io.on('connection', (socket) => {

  console.log('Client connected ' + io.engine.clientsCount);
  socket.emit('toast', {message: "Conectado con el servidor"});
  let i = 0;
  setInterval(() => {
    socket.emit('toast', {message: "Conectado con el servidor"});
    i++;
  }, 10000)
  socket.on('message-to-server', (data) => {
    console.log('message received', data);
  });
  let timeout = null;
  let time = 10;

  let ans = []  

  socket.on('answer', (data) =>{
    console.log("Answer: ", data);
    ans.push(data);
    if (ans.length == activePlayers) {
      console.log("Calculate Results");
    }
  })


  socket.on('stop-game', () => {
    timeout = setInterval(() =>{
      socket.emit('timeout',{time: time})
      console.log("Timeout in "+time);
      time--;
      if (time == 0) {
        clearInterval(timeout);
        activeGame = false;
        socket.emit('end-game')
      }
    },1000)

  })
  
  socket.on('player-ready',() =>{
    activePlayers++;
    let randName = Math.floor(Math.random()*playerName.length);
    socket.emit('player-name',{playerName: playerName[randName].name }) 
    if (activePlayers > 1 && !activeGame) {
    activeGame = true;
    console.log("GameStart");
    let rand = Math.floor(Math.random()*26);
    socket.emit('gameStart',{letter: letter[rand]})
  }
  })

  

});

// App init
server.listen(appConfig.expressPort, () => {
  console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});
