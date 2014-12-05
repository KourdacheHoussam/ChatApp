/**
 * Created by Housssam on 05/12/2014.
 */
console.log("salut");

/**
 * Tout d'abord on va inclure les librairies
 * que l'on souhaite utiliser à l'aide de la
 * méthode require()
 */

var http, httpServer;

http = require('http');

/**
 * Dans ce qui suit , on va créer un serveur, qui prends une fonction en paramètre
 * recevant la requête et la réponse à renvoyer à l'utilisateur
 */

httpServer=http.createServer(function(req, rep){
    rep.end("hello");
});

/**
 * Maintenant faut se connecter à ce serveur en écoutant un port
 */

httpServer.listen(1337);
