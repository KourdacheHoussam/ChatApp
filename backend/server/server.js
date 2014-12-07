/**
 * Created by Housssam on 05/12/2014.
 * Tout d'abord on va inclure les librairies que l'on souhaite utiliser à l'aide de la
 * méthode require()*/

 //Variables globales stockés sur le serveur js utilisables par tous les clients
var port=1337;
var md5 = require('md5');
var io, app, http_server, path, express;
express=require('express');
path=require('path');
app=require('express')();

/** Dans ce qui suit , on va créer un serveur, qui prends une fonction en paramètre
 * recevant la requête envoyée et la réponse à renvoyer à l'utilisateur*/
http_server=require('http').Server(app);


io=require('socket.io')(http_server);

app.get('/', function(req, rep){
    rep.sendFile(path.resolve('../../index.html'));
});

/** maintenant on va écouter les connections/communication qui se font
 * via notre serveur node.js à l'aide de la socket socket_io */

io.sockets.on('connection', function(socket){    /** socket = socket utilisateur en cours*/
    var current_user;
    console.log("New User connected");
    /** Dans cette partie on reçoit les évènement prevenant du côté client */
    socket.on('login', function(user){  // A la réception de loginEvent, j'envoi une fonction de CallBack
        /**  enregistrer les proprietes du client*/
        current_user=user;
        current_user.id=user.mail.replace('@', '-').replace('.', '-');
        current_user.avatar='https://gravatar.com/avatar/'+ md5.digest_s(user.mail)+"?s=40";
        /** prévenir l'utilisateur et tous les autrees que le new client est enregistre*/
        socket.emit("new-user-created", current_user);
        socket.broadcast.emit("new-user-created", current_user);
        console.log(user);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


/** ecoute des sockets sur le port 3000 du serveur */
http_server.listen(3000, function(){
    console.log("Listening on : 3000");
});


