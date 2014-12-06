/**
 * Created by Housssam on 05/12/2014.
 *
 * Tout d'abord on va inclure les librairies
 * que l'on souhaite utiliser à l'aide de la
 * méthode require()
 */

var http, httpServer, socket_io, md5;

http = require('http');
socket_io=require('../../libs/node_modules/socket.io');
md5=require("MD5");

/**
 * Dans ce qui suit , on va créer un serveur, qui prends une fonction en paramètre
 * recevant la requête envoyée et la réponse à renvoyer à l'utilisateur
 */
httpServer=http.createServer(function(req, rep){
    rep.end("hello");
    console.log("hello");
});

/**
 * Maintenant faut se connecter à ce serveur en écoutant un port
 */
var port=2222;
httpServer.listen(port);


/** maintenant on va écouter les connections/communication qui se font
 * via notre serveur node.js à l'aide de la socket socket_io */

socket_io.listen(httpServer);


