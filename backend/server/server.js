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

var list_users={}; //user list container
var list_messages=[]; //cache message
var history_limit=30; //limit taille list_messages
var date=new Date();

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
    var current_user=false;

    /** afficher tout les utilisateurs dans la liste*/
    for(var user in list_users){
        socket.emit('new-user-created', list_users[user]);
    }
    for(var msg in list_messages){
        socket.emit('new-message-coming', list_messages[msg]);
    }

    /**
     * ---------------------------------------------------------------------
     * ---------------- GESTION MESSAGERIE---------------------------------
     * ---------------------------------------------------------------------
     */

    /** Message reçu */
    socket.on('new-message-coming', function(message){
        message.user=current_user;
        message.hour=date.getHours();
        message.minutes=date.getMinutes();
        //sauvegarder le message
        list_messages.push(message);
        if(list_messages.length>history_limit){
            list_messages.shift();//enlever le premier element du tableau
        }
        //Renvoyer le message à tous les utilisateurs
        io.sockets.emit('new-message-coming', message);
        console.log('L id : '+message.user.id);
    });

    /**
     * ---------------------------------------------------------------------
     * ---------------- GESTION CONNECTIONS---------------------------------
     * ---------------------------------------------------------------------
     */

    /** ---LOGIN---- Dans cette partie on reçoit les évènement prevenant du côté client  **/
    socket.on('login', function(user){  // A la réception de loginEvent, j'envoi une fonction de CallBack
        /**  enregistrer les proprietes du client*/
        current_user=user;
        current_user.id=user.mail.replace('@', '-').replace('.', '-');
        current_user.avatar='http://robohash.org/'+  md5.digest_s(user.mail) +'/arfset_bg1/3.14159?size=60x60';
        current_user.connectionhour=date.getHours();
        current_user.connectionminutes=date.getMinutes();
        /** prévenir l'utilisateur et tous les autrees que le new client est enregistre*/
        io.sockets.emit("new-user-created", current_user);

        /** ajouter le nouveau dans la liste */
        list_users[current_user.id]=current_user;
        console.log(list_users);

        /** lui dire qu'il est bien connecté **/
        socket.emit("logging-ok");
        console.log(user);
    });

    /**
     * ----QUIT---- Quand l'user quitte le chat, on le supprime de la liste
     */
    socket.on('disconnect', function(){
        if(!current_user){   return false;  }
        delete list_users[current_user.id];
        //prevenir les autres users
        io.sockets.emit('user-disconnected', current_user);
    });
});

/** ecoute des sockets sur le port 3000 du serveur */
http_server.listen(3000, function(){
    console.log("Listening on : 3000");
});


