const express = require('express');
const bodyParser = require("body-parser");
const dataBase = require('./modele');
const session = require('express-session');
const alert = require('alert');
// serveur html


// Créer l'application Express
const expressApp = express();


expressApp.use(session({
  secret: 'clé_secrète',
  resave: false,
  saveUninitialized: true
}));

expressApp.use(bodyParser.urlencoded({ extended: true }));



// Configurer le moteur de template EJS
expressApp.set('view engine', 'ejs');

expressApp.use(express.static(__dirname + '/views'));

// Configurer le dossier de vues
expressApp.set('views', `${__dirname}/views`);

// Définir les routes

///////////////INDEX
expressApp.get('/', function(req, res) {
  res.render('index', { session: req.session});
});

///////////////LOGIN
expressApp.get('/login', function(req, res) {
  res.render('login', {session: req.session});
});

///////////////CONTACT
//à chaque appel de contact, on souhaite renvoyer un certain nb de données (contacts, demandes d'ami, etc.)
//on va donc écrire une fonction que l'on appellera à chaque fois que l'on veut renvoyer la vue conta
expressApp.get('/contacts', function(req, res) {
  seeContactView(req, res);
});


//////////////CHAT
expressApp.get('/chat', function(req, res) {
  res.render('chat', {session: req.session});
});

///////////////ACCOUNT
expressApp.get('/account', function(req, res) {
  if(req.session.isConnected) {
    dataBase.getUserById(req.session.idUser, function(error, userResults){
      if(error) {
        console.error(error);
        return;
      }
      req.session.name = userResults.name;
      req.session.surname = userResults.surname;
      res.render('account', {session: req.session});
    })
  }
  else {
    res.render('account', {session: req.session});
  }
});

///////////////MOVING
expressApp.get('/moving', function(req, res) {
  res.render('moving/moving', {session: req.session});
});

expressApp.post('/test.html', function(req, res) {
  let idUserRequested = req.body.userRequested;
  console.log(idUserRequested);
  seeContactView(req, res);
});


expressApp.post('/searchAContact.html', function(req, res) {
  let usernameSearched = req.body.searchbar; 
  dataBase.getFriendsAndRequestsAndInvitations(req.session.idUser, function(error, allFriendsResults){
    dataBase.getUserByUsername(usernameSearched, function(error, userSearchedResults){
      if(userSearchedResults != null){
        dataBase.checkIfContactExist(req.session.idUser, userSearchedResults.idUser, function(error, checkingContact){
          res.render('contacts', {session: req.session, allContacts: allFriendsResults, checkContact: checkingContact, resultSearched: userSearchedResults});
        });
      }
      else{
        res.render('contacts', {session: req.session, allContacts: allFriendsResults, resultSearched: userSearchedResults});
      }
    });
  });
});

expressApp.post('/addAContact.html', function(req, res) {
  let idUserRequested = req.body.userRequested;
  dataBase.insertFriendRequest(req.session.idUser, idUserRequested, function(error){
    if(error){
      alert(error);
      return;
    }
    alert("Une demande d'ami a été envoyée");
  });
  dataBase.getFriendsAndRequestsAndInvitations(req.session.idUser, function(error, allFriendsResults){
    res.render('contacts', {session: req.session, allContacts: allFriendsResults});
  });
});


expressApp.post('/acceptAContact.html', function(req, res) {
  let idUserAsking = req.body.userRequested
  dataBase.acceptFriendInvitation(idUserAsking, req.session.idUser, function(error){
    if(error){
      alert(error);
      return;
    }
  });
  seeContactView(req,res);
});

expressApp.post('/deleteAContact.html', function(req, res) {
  let idUserAsking = req.body.userRequested
  dataBase.deleteContact(idUserAsking, req.session.idUser, function(error){
    if(error){
      alert(error);
      return;
    }
  });
  seeContactView(req,res);
});


expressApp.post('/postLogin.html', function(request, response) {
  let usernameLog = request.body.usernameLogin; 
  let passwordLog = request.body.passwordLogin; 
  dataBase.getLogin(usernameLog, passwordLog, function(error, userResults){
    if(error) {
      alert(error);
      console.error(error);
      return;
    }
    request.session.isConnected = true;
    request.session.idUser = userResults.idLogin;
    request.session.username = userResults.username;
    response.render('index', { session: request.session });
  });
});

expressApp.get('/postLogout', function(request, response) {
    request.session.isConnected = false;
    request.session.idUser = null;
    request.session.username = null;
    response.render('index', { session: request.session });
});

expressApp.post('/postSignup.html', function(request, response) {
  let nameSign = request.body.nameSignup; 
  let surnameSign = request.body.surnameSignup; 
  let usernameSign = request.body.usernameSignup; 
  let passwordSign = request.body.passwordSignup; 
  dataBase.getLoginByUsername(usernameSign, function(error, checkingUserExistsResults){
    //si il existe déjà un compte portant ce pseudo, on alerte l'utilisateur de ceci et on n'effectue aucune opération
    if(checkingUserExistsResults != null) {
      alert("Pseudo déjà existant");
      return;
    }
    //sinon, on créé le compte et on insère les données dans la BDD
    //et on seconnecte au compte
    else{
      dataBase.insertNewLoger(usernameSign, passwordSign, function(error){
        if(error){
          alert(error);
          return;
        }
        //si il n'y a pas d'erreurs, on récupère l'id du nouveau login que l'on vient d'insérer
        dataBase.getLoginByUsername(usernameSign, function(error, newUserResults){
          if(error) {
            alert(error);
            return;
          }
          dataBase.insertNewUser(newUserResults.idLogin, usernameSign, nameSign, surnameSign, function(error){
            if(error){
              alert(error);
              return;
            }
            alert("Votre compte a bien été créé.");
          });
        });
      });
    }
  });
});


function seeContactView(req, res){
  dataBase.getFriendsAndRequestsAndInvitations(req.session.idUser, function(error, allFriendsResults){
    res.render('contacts', {session: req.session, allContacts: allFriendsResults});
  });
}

module.exports = expressApp;

