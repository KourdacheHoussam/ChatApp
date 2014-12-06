/**
 * Created by Housssam on 05/12/2014.
 *
 * Tout d'abord on va inclure les librairies
 * que l'on souhaite utiliser à l'aide de la
 * méthode require()
 */

//Variables globales stockés sur le serveur js utilisables par tous les clients
var http, httpServer, io, md5;
var port=1337;

http = require('http');  /** Serveur http de Node.JS **/
md5 = require('md5');

/**
 * Dans ce qui suit , on va créer un serveur, qui prends une fonction en paramètre
 * recevant la requête envoyée et la réponse à renvoyer à l'utilisateur
 */

httpServer=http.createServer(function(req, rep){
    rep.end("hello");
    console.log("Un utilisateur a affiché la page html");
});


/** maintenant on va écouter les connections/communication qui se font
 * via notre serveur node.js à l'aide de la socket socket_io */

io=require('socket.io').listen(httpServer); /** Socket.IO pour utiliser des sockets**/

/** Maintenant faut se connecà ce serveur en écoutant un port */
httpServer.listen(port);

/**
 *  Il est temps maintenant d'écouter les connections: dés qu'il y a une connection
 * sur une socket on lance la fonction anonyme qui prend la socket de l'utilisateur en cours
 **/

/**  on écoute l'evènement "connection" */
io.sockets.on('connection', function(socket){    /** socket = socket utilisateur en cours*/

    console.log("nouveau utilisateur");

    /** Dans cette partie on reçoit les évènement prevenant du côté client */
    socket.on('login', function(user){  // A la réception de loginEvent, j'envoi une fonction de CallBack
        console.log(user);
    });


});


