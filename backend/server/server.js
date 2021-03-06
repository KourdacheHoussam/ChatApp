/**
 * Created by Housssam on 05/12/2014.
 * Tout d'abord on va inclure les librairies que
 * l'on souhaite utiliser à l'aide de la méthode require()*/

/** ----------------------------------------------------------------------------------------------------------
 *  ------------------------------ VARIABLES  & CREATION DU SERVEUR NODE(EXPRESS------------------------------
 *  ---------------------------------------------------------------------------------------------------------- */

var port=3000;  //Port de COM
var md5 = require('md5');   //
var io, app, http_server, path, express, util, url, date, queryString, current_user;
express=require('express');
path=require('path');
app=require('express')();
util=require('util');
url=require('url');
queryString=require('querystring');
var list_users={}; //user list container
var list_messages=[]; //cache message
var history_limit=30; //limit taille list_messages
var date;
var clients_en_attente=[];
var queue_messages={}; //stocket tous les messages tombés pendant le timeout fait côté client
//Créer un serveur avec une fonction en param  recevant la
//requête envoyée et la réponse à renvoyer à l'utilisateur
http_server=require('http').Server(app);
io=require('socket.io')(http_server);

/** ---------------------------------------------------------------------------------------------------------
 * ---------------------- QUAND ON APPELE URL(/addmessage) : localhost:port/addmessage ----------------------
 * ----------------------------------------------------------------------------------------------------------*/
 // Reception d'un nouveau message à enregistrer
 app.get('/addmessage', function(req, rep){
        var msg=req.query.message;
        date=new Date();
        var avatar='http://robohash.org/'+  md5.digest_s(date.getHours()) +'/arfset_bg1/3.14159?size=60x60';
        /** save message*/
        if(req.query.message != null){
            saveMessageDB(msg);
        }
        // NE SERA EXECUTEE QUE DANS LE MODE POLLING /
        // S'il y a des clients qui attendent, on leurs envoit le message
        while (clients_en_attente.length > 0) {
                var client = clients_en_attente.pop(); // je l'enleve de la liste
                client.writeHead(200, {'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });
                client.end(JSON.stringify({			 // puis, je lui envoie le message
                    user: msg.user,
                    message: msg,
                    hour:date.getHours(),
                    minutes:date.getMinutes(),
                    avatar:avatar
                }));
        }
        console.log("msg envoyé "+msg);
        rep.writeHead(200, {'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
        rep.write(JSON.stringify({			 // je lui envoie le message
            user: msg.user,
            message: msg,
            hour:date.getHours(),
            minutes:date.getMinutes(),
            avatar:avatar
        }));
        rep.end();
 });


/** ---------------------------------------------------------------------------------------------------------
 * ---------------------- QUAND ON APPELE URL(/newuser) : localhost:port/newuser ----------------------
 * ----------------------------------------------------------------------------------------------------------*/

//ajout d'un nouveau utilisateur en mode longpolling
app.get('/newuser', function(req, rep){

    console.log("je suis dans newuser");
    date=new Date();
    var objet= JSON.stringify(req.query);
    var json=JSON.parse(objet);
    var username=json.username;
    var email=json.email;
    var new_user={};
    new_user.username=username;
    new_user.email=email;
    new_user.id=email.replace('@', '-').replace('.', '-');
    new_user.avatar='http://robohash.org/'+  md5.digest_s(new_user.email) +'/arfset_bg1/3.14159?size=60x60';
    new_user.heure=date.getHours();
    new_user.minutes=date.getMinutes();
    list_users[new_user.id]=new_user;
    current_user=new_user;
    console.log(JSON.stringify(new_user));
    rep.end();

});
/** ---------------------------------------------------------------------------------------------------------
 * ---------------------- QUAND ON APPELE URL(/addmessage) : localhost:port/addmessage ----------------------
 * ----------------------------------------------------------------------------------------------------------*/
 // L'utilisateur demande de changer de mode de communication
 app.get('/choosemode', function(req, rep){
        console.log("Je suis dans choosemode");
        if(req.query.modecommunication != null){
            console.log(" mode :  "+ req.query.modecommunication);
            switch(req.query.modecommunication ){
                case "polling":
                    console.log("Mode polling choisi");
                    //prevenir le client que le mode est polling
                    //confirmMode("polling");
                    break;
                case "long-polling":
                    console.log("Mode long-polling choisi");
                    //prevenir le client que le mode est long polling
                    //confirmMode("long-polling");
                    break;
                case "push":
                    console.log("Mode push choisi");
                    //prvenir le client que le mode est push
                    //confirmMode("push");
                    break;
            }
        }
        //confirmer à l'utilisateur le mode choisi
        function confirmMode(mode){
            console.log(mode);
            rep.writeHead(200, {'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
            rep.write(JSON.stringify(mode)); //faut absolument le garder pour que ça marche
            rep.end();
        }
 });

/** ----------------------------------------------------------------------------------------------------------
 * -------------- QUAND ON APPELE URL(/longpolling) : localhost:port/  => LONG-POLLING -----------------------
 * -----------------------------------------------------------------------------------------------------------*/

 app.get('/longpolling', function(req, rep){
    //code long polling
    //on récupere la date d'arrivee dans le chat
    var objet= JSON.stringify(req.query);
    var json=JSON.parse(objet);
    var heure=json.heure;
    var minutes=json.minutes;
    var secondes=json.secondes;
    console.log("Heure : "+heure+" min: "+minutes + " sec: "+secondes);
    //nouveau messages à envoyer
    var new_messages=[];
    //si le nombre de message que j'ai dans mon tableau list_message est sup à l'heure, j'envoie la data à l'user
    if(list_messages.length>0){
        for(var i=0; i<list_messages.length;i++){
            console.log("le new message : "+list_messages[i]["hour"] + " min "+ list_messages[i]["seconds"]);
            //list_messages[i]["seconds"] > secondes ||
            if(  list_messages[i]["hour"] > heure && list_messages[i]["minutes"] > minutes  ){
                new_messages.push(list_messages[i]);
            }
        }
    }
    console.log("la liste des nouveau messages "+new_messages.length);
    if(new_messages.length>0){
        rep.writeHead(200, {'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
        console.log("le contenu du new message :" + new_messages);
        rep.write(JSON.stringify(new_messages)); //faut absolument le garder pour que ça marche
        rep.end();
    }else{
        clients_en_attente.push(rep);	//S'il n'y a pas de nouveau messages à envoyer au client, on l'enregistre juqu'a ce qu'il y en est de nouveaux
        console.log("Client connecté à H: "+heure +" m: "+ minutes + "  est en attente");
    }

});


/** ----------------------------------------------------------------------------------------------------------
 * -------------- QUAND ON APPELE URL(/polling) : localhost:port/  => POLLING ----------------------------
 * -----------------------------------------------------------------------------------------------------------*/
app.get('/pollingusers', function(req, rep){
    var new_users=[];
    date=new Date();
    var heure=date.getHours();
    var minutes=date.getMinutes();
    var secondes=date.getSeconds();
    if(list_users.length > 0){
        for(var i=0; i<list_users.length; i++){
            if(list_users[i]["connectionhour"]>heure && list_users[i]["connectionminutes"]>minutes ){
                new_users.push(list_users[i]);
            }
        }
    }
    rep.writeHead(200, {'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
    rep.write(JSON.stringify(new_users)); //faut absolument le garder pour que ça marche
    rep.end();
    new_users=null;
});

app.get('/polling', function(req, rep){
    console.log("je suis dans le polling a la seconde : ");
    //on récupere la date d'arrivee dans le chat
    var objet= JSON.stringify(req.query);
    var json=JSON.parse(objet);
    var heure=json.heure;
    var minutes=json.minutes;
    var secondes=json.secondes;
    console.log("Heure : "+heure+" min: "+minutes + " sec: "+secondes);
    // on crée un tableau pour enregistrer les nouveau messages par rapport à
    // l'utilisateur connecté
    var new_messages = [];

    //console.log(obj.heure+' '+obj.minutes+' '+obj.secondes);
    console.log("La liste des messages avant le IF :"+ list_messages.length);

    if(list_messages.length > 0){
        for(var i=0; i<list_messages.length;i++){
            console.log("le message -> : " +list_messages[i]["message"]);
            if( list_messages[i]["seconds"] > secondes ||  list_messages[i]["hour"] > heure || list_messages[i]["minutes"] > minutes  ){
                new_messages.push(list_messages[i]);
            }
        }
    }

    rep.writeHead(200, {'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
    rep.write(JSON.stringify(new_messages)); //faut absolument le garder pour que ça marche
    rep.end();
});

/** ----------------------------------------------------------------------------------------------------------
 * ----------------------- QUAND ON APPELE URL(/) : localhost:port/ ------------------------------------------
 * -----------------------------------------------------------------------------------------------------------*/
app.get('/', function(req, rep){
    console.log("Je suis dans le /");
    //Ne rien faire ICI
});
/** ----------------------------------------------------------------------------------------------------------
 * ----------------------- QUAND ON FAIT DU PUSH --------------------------------------------------------------
 * -----------------------------------------------------------------------------------------------------------*/

 io.sockets.on('connection', function(socket){    /** socket = socket utilisateur en cours*/
    var current_user=false;
    /** informer tous les autres utilisateurs qu'un nouveau utilisé est connecte au chat */
    for(var user in list_users){
        socket.emit('new-user-created', list_users[user]);
    }
    /** diffuser les messages aux autres utilisateurs */
    for(var var_msg in list_messages){
        socket.emit('new-message-coming', list_messages[var_msg]);
    }
    /**----------------------------- GESTION MESSAGERIE ------------------------------------------------- */

    /** Message reçu par l'evenement : new-message-coming*/
    socket.on('new-message-coming', function(message){
        message.user=current_user;
        date=new Date();
        message.hour=date.getHours();
        message.minutes=date.getMinutes();
        message.seconds=date.getSeconds();
        //sauvegarder le message
        list_messages.push(message);
        if(list_messages.length>history_limit){
            list_messages.shift();//enlever le premier element du tableau
        }
        //Renvoyer le message à tous les utilisateurs
        io.sockets.emit('new-message-coming', message);
        console.log('L id : '+message.user.id);
    });

    /**----------------------------- GESTION CONNECTIONS--------------------------------------------------- */

    /** LOGIN: reception de l'evenement login du nouveau user */
    socket.on('login', function(user){  // A la réception de loginEvent, j'envoi une fonction de CallBack
        //enregistrer les proprietes du client
        date=new Date();
        current_user=user;
        current_user.id=user.mail.replace('@', '-').replace('.', '-');
        current_user.avatar='http://robohash.org/'+  md5.digest_s(user.mail) +'/arfset_bg1/3.14159?size=60x60';
        current_user.heure=date.getHours();
        current_user.minutes=date.getMinutes();
        /** prévenir l'utilisateur et tous les autrees que le new client est enregistre*/
        io.sockets.emit("new-user-created", current_user);
        /** ajouter le nouveau dans la liste */
        list_users[current_user.id]=current_user;
        console.log(list_users);
        /** lui dire qu'il est bien connecté **/
        socket.emit("logging-ok");
        console.log(user);
    });

    /** QUITTER le chat : Quand l'user quitte le chat, on le supprime de la liste  */
    socket.on('disconnect', function(){
        console.log("Disconnected");
        if(!current_user){return false;}
        io.sockets.emit('user-disconnected', current_user);
        delete list_users[current_user.id];
    });
});

/** ----------------------------------------------------------------------------------------------------------
 * -------------------------------------------- FONCTIONS COMMUNES -------------------------------------------
 * -----------------------------------------------------------------------------------------------------------*/
// enregistrer un message dans la liste de message
function saveMessageDB(message){
    date=new Date();
    var currentmessage=new Object();
    if(current_user==null){currentmessage['user']="";}
    else{currentmessage['user']=current_user;}
    currentmessage['message']=message;
    currentmessage['hour']=date.getHours();
    currentmessage['minutes']=date.getMinutes();
    currentmessage['seconds']=date.getSeconds();
    //enregistrer dans le tableau
    list_messages.push(currentmessage);
    console.log(" *** Message saved : "+currentmessage.message);

};



/** ----------------------------------------------------------------------------------------------------------
 * ----------------------------ECOUTE DES SOCKETS SUR LE PORT 3000 DU SERVEUR ---------------------------------
 * -----------------------------------------------------------------------------------------------------------*/
http_server.listen(port, function(){
    console.log("Listening on : "+port);
});


