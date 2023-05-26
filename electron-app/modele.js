const mysql = require('mysql');
const session = require('express-session');
const dotenv = require("dotenv");
const result = dotenv.config();

const con = mysql.createConnection({ 
    host: process.env.AUTH_DOMAIN,
    user: process.env.DB_USERNAME,   
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

con.connect(function(err) {   
    if (err) throw err;   
    console.log("Connecté à la base de données MySQL!"); 
});

function getLogin(username, password, callback){
    const getLoginQuery = `SELECT idLogin, username FROM login WHERE username = '${username}' AND password = '${password}'`;
    con.query(getLoginQuery, function(error, results, fields) {
        if (error) throw error;
       // console.log(results[0].idLogin);
        if (results.length > 0){
            const lineUser = results[0];
            callback(null, lineUser);
        } else {
            callback(new Error("login ou mot de passe invalide"));
        }
    });
}

function getUserById(idLogin, callback){
    const getUserByIdQuery = `SELECT * FROM user WHERE idUser = ${idLogin}`;
    con.query(getUserByIdQuery, function(error, results, fields) {
        if (error) throw error;
       // console.log(results[0].idLogin);
        if (results.length > 0){
            const lineUser = results[0];
            callback(null, lineUser);
        }
        else {
            callback(null);
        }
    });
}

function getUserByUsername(username, callback){
    const getUserByUsernameQuery = `SELECT * FROM user WHERE username = '${username}'`;
    con.query(getUserByUsernameQuery, function(error, results, fields) {
        if (error) throw error;
       // console.log(results[0].idLogin);
        if (results.length > 0){
            const lineUser = results[0];
            callback(null, lineUser);
        }
        else {
            callback(null);
        }
    });
}

function getAllUsers(callback){
    const getAllUsersQuery = 'SELECT * FROM user';
    con.query(getAllUsersQuery, function(error, resultsAllUser, fields){
        if (error) throw error;
        if (resultsAllUser.length > 0){
            const allUsers = resultsAllUser;
            callback(null, allUsers);
        }
        else{
            callback(null);
        }
    });
}

function getLoginByUsername(username, callback){
    const getLoginByUsernameQuery = `SELECT idLogin, username FROM login WHERE username = '${username}'`;
    con.query(getLoginByUsernameQuery, function(error, results, fields) {
        if (error) throw error;
        // on définit notre constante ici, dans le but de la renvoyer quoi qu'il arrive. 
        //on gérera ensuite les événements suivant si celle-ci est nulle ou non.
        let lineUser = null;
        if (results.length > 0){
            lineUser = results[0];
        }
        callback(null, lineUser);
    });
}

function insertNewLoger(username, password, callback){
    const insertNewLogerQuery = `INSERT INTO login(username, password) VALUES ('${username}', '${password}');`;
    con.query(insertNewLogerQuery, function(error, fields) {
        if (error) throw error;
        callback(null);
    });
}

function insertNewUser(idUser, username, name, surname, callback){
    const insertNewUserQuery = `INSERT INTO user(idUser, username, name, surname) VALUES ('${idUser}', '${username}', '${name}', '${surname}');`;
    con.query(insertNewUserQuery, function(error, fields) {
        if (error) throw error;
        callback(null);
    });
}

function insertFriendRequest(idUserAdding, idUserAsked, callback){
    const insertFriendRequestQuery =  `INSERT INTO contact(idUser1, idUser2, status) VALUES ('${idUserAdding}', '${idUserAsked}', 0);`;
    con.query(insertFriendRequestQuery, function(error, fields) {
        if (error) throw error;
        callback(null);
    });
}

function checkIfContactExist(idUserAdding, idUserAsked, callback){
    const checkExistingContactQuery =  `SELECT * FROM contact WHERE idUser1='${idUserAdding}' AND idUser2='${idUserAsked}' UNION
                                        SELECT * FROM contact WHERE idUser1='${idUserAsked}' AND idUser2='${idUserAdding}'`;
    con.query(checkExistingContactQuery, function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0){
            callback(null, true);
        } else{ callback(null, false); }
    });
}

function selectFriendRequests(idUser, callback){
    const selectFriendRequestsQuery =  `SELECT DISTINCT idUser2 as idUser FROM contact WHERE idUser1='${idUser}' AND status=0`;
    con.query(selectFriendRequestsQuery, function(error, results, fields) {
        if (error) throw error;
        let lineUser = null;
        if (results.length > 0){
            lineUser = results;
        }
        callback(null, lineUser);
    });
}

function selectFriendInvitations(idUser, callback){
    const selectFriendInvitationsQuery =  `SELECT DISTINCT idUser1 as idUser FROM contact WHERE idUser2='${idUser}' AND status=0`;
    con.query(selectFriendInvitationsQuery, function(error, results, fields) {
        if (error) throw error;
        let lineUser = null;
        if (results.length > 0){
            lineUser = results;
        }
        callback(null, lineUser);
    });
}

function selectFriendContacts(idUser, callback){
    const selectFriendContactsQuery =  `SELECT idUser2 as idUser FROM contact WHERE idUser1='${idUser}' AND status=1 UNION
                                        SELECT idUser1 as idUser FROM contact WHERE idUser2='${idUser}' AND status=1`;
    con.query(selectFriendContactsQuery, function(error, results, fields) {
        if (error) throw error;
        let lineUser = null;
        if (results.length > 0){
            lineUser = results;
        }
        callback(null, lineUser);
    });
}

function acceptFriendInvitation(idUser1, idUser2, callback){
    const updateFriendInvitation = `UPDATE contact SET status = 1 WHERE idUser1='${idUser1}' AND idUser2='${idUser2}'`;
    con.query(updateFriendInvitation, function(error, fields) {
        if (error) throw error;
        callback(null);
    });
}

function deleteContact(idUser1, idUser2, callback){
    const deleteContactQuery = `DELETE FROM contact WHERE idContact =
    (SELECT idContact AS id FROM ((SELECT idContact from contact WHERE idUser1='${idUser1}' AND idUser2='${idUser2}') UNION 
    (SELECT idContact FROM contact WHERE idUser1='${idUser2}' AND idUser2='${idUser1}')) AS c);`;
    con.query(deleteContactQuery, function(error, fields) {
        if (error) throw error;
        callback(null);
    });
}

async function getFriendsAndRequestsAndInvitations(idUser, callback){
    //on déclare un tableau dans lequel on va stocker tous les types de contacts:
    //les amis acceptés et en contact sur l'appli, les utilisateurs demandés en tant qu'ami et les utilisateurs qui ont envoyé une invit
    let allFriendsResults = {
        userRequested: [],
        userInvitations: [],
        userFriends: []
    };
    //on écrit une promesse car on imbrique plusieurs fonctions asynchrones, sans la promesse le tableau renvoyé serait null ou indéfini.
    //Crée une promesse pour les demandes d'amitié de l'utilisateur
    const friendRequestsPromise = new Promise((resolve, reject) => {
        // Exécute la fonction pour sélectionner les demandes d'amitié de l'utilisateur
        selectFriendRequests(idUser, function(error, userRequested){
            if(error) reject(error); // Rejette la promesse en cas d'erreur

            if(userRequested == null || userRequested == undefined) {
                resolve(); // Résout la promesse actuelle sans rien faire si le tableau est nul ou indéfini
            } else {
                // Crée des promesses pour récupérer les informations de chaque utilisateur à qui on demande l'amitié
                const promises = userRequested.map(user => { 
                    return new Promise((resolve, reject) => {
                        // Exécute la fonction pour sélectionner les informations de l'utilisateur
                        getUserById(user.idUser, (error, userInfo) => {
                            if (error) {
                                reject(error); // Rejette la promesse en cas d'erreur
                            } else {
                                resolve(userInfo); // Résout la promesse avec les informations utilisateur
                            }
                        });
                    });
                });
                // Attends que toutes les promesses soient résolues avant de résoudre la promesse actuelle
                Promise.all(promises)
                    .then(results => {
                        allFriendsResults.userRequested = results;  // Stocke les résultats dans l'objet
                        resolve(); // Résout la promesse actuelle
                    })
                    .catch(error => {
                        reject(error); // Rejette la promesse en cas d'erreur
                    });
            }
        });
    })

    const friendInvitationsPromise = new Promise((resolve, reject) => {
        selectFriendInvitations(idUser, function(error, userInvitations){
            if(error) reject(error);

            if(userInvitations == null || userInvitations == undefined) {
                resolve(); // Résout la promesse actuelle sans rien faire si le tableau est nul ou indéfini
            } else {
                const promises = userInvitations.map(user => {
                    return new Promise((resolve, reject) => {
                        getUserById(user.idUser, (error, userInfo) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(userInfo)
                            }
                        });
                    });   
                });
                Promise.all(promises)
                    .then(results => {
                        allFriendsResults.userInvitations = results;  // Stocke les résultats dans l'objet
                        resolve(); // Résout la promesse actuelle
                    })
                    .catch(error => {
                        reject(error); // Rejette la promesse en cas d'erreur
                    });
            }
        });
    });

    const friendContactsPromise = new Promise((resolve, reject) => {
        selectFriendContacts(idUser, function(error, userFriends){
            if(error) reject(error);

            if(userFriends == null || userFriends == undefined) {
                resolve(); // Résout la promesse actuelle sans rien faire si le tableau est nul ou indéfini
            } else {
                const promises = userFriends.map(user => {
                    return new Promise((resolve, reject) => {
                        getUserById(user.idUser, (error, userInfo) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(userInfo)
                            }
                        });
                    });   
                });
                Promise.all(promises)
                    .then(results => {
                        allFriendsResults.userFriends = results;  // Stocke les résultats dans l'objet
                        resolve(); // Résout la promesse actuelle
                    })
                    .catch(error => {
                        reject(error); // Rejette la promesse en cas d'erreur
                   });
            }
        });
    });
    
    //  Les promesses sont stockées dans un tableau et la méthode Promise.all() attend que toutes les promesses du tableau 
    // soient résolues ou qu'au moins une d'entre elles soit rejetée.
    try {
        await Promise.all([friendRequestsPromise, friendInvitationsPromise, friendContactsPromise]);
        callback(null, allFriendsResults);
    } catch (error) {
        callback(error, null);
    }
}

module.exports = { con, getLogin, getLoginByUsername, insertNewLoger, insertNewUser, getUserById, getUserByUsername, 
    getAllUsers, insertFriendRequest, selectFriendRequests, getFriendsAndRequestsAndInvitations, selectFriendContacts, checkIfContactExist,
    acceptFriendInvitation, deleteContact };

/*con.end ((err) => {
    // La connexion se termine normalement
    // Garantit que toutes les requêtes restantes sont exécutées
    // Envoie ensuite un paquet de sortie au serveur MySQL.
  });*/
