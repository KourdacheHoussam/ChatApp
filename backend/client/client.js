/**
* Created by Housssam on 06/12/2014.
* Ici, on va se connecter au site depuis SOCKET.IO
* Remarque : ici on utilise JQUERY
*/

(function($) {

    /** io utilisé ci-dessous est chargé automatiquement via le JS intégré dans index.html
     * on appelle la méthode connect du composant io(chargé de socket) pour nous connecter au serveur.*/
    var socket=io('http://localhost:3000/');


     /**
     * -----------------------------------------------------------------------------------------------------------
     * ------------------------------------------------------ GESTION MESSAGERIE---------------------------------
     * -----------------------------------------------------------------------------------------------------------
     */

     var message_template=$('#message_tpl').html(); //recuperer la div où s'affiche les msg
     $('#message_tpl').remove();//puis la supprimer

     /** Quand j'envoie un message*/
     $('#send-msg-form').submit(function(event){
        event.preventDefault();
        /** Prevenir le serveur qu'il y a un nouveau msg*/
        socket.emit('new-message-coming', {
           message : $('#message_content').val()
        });
        $('#message_content').val('');
        $('#message_content').focus();
     });

     /** Quand je recois un message*/
     socket.on('new-message-coming', function(message){
         //on injecte le contenu message dans le template message_tmpl
         $('#listmessages').append('<div class="message">' + Mustache.render(message_template, message) + '</div>');
         $('#listmessages').animate({scrollTop: $('#message_tpl').offset().top }, 1000);
     });



    /**
     * -----------------------------------------------------------------------------------------------------------
     * ------------------------------------------------------ GESTION CONNECTIONS---------------------------------
     * -----------------------------------------------------------------------------------------------------------
     */

    /** A l'aide de jquery on va recupérer les elements "username" et "email" de l'utilisateur **/
    $('#loginform').submit(function(event){
        console.log("inside submit method #client");
        event.preventDefault(); //empecher l'utilisateur de soumettre le formulaire
        /**
         * puis émettre un évènement à la socket
         * on spécifiant le nom de l'évènement que l'on veut
         * Notre premiere evenement est le : LOGIN : envoi d'un event login au serveur
         */
        socket.emit('login', {
                username : $('#username').val(),
                mail 	 : $('#mail').val()
        })
        //on vide les champs
        $('#username').val('');
        $('#username').focus();
        $('#mail').val('');
        $('#mail').focus();
    });

    /** Vérifier si le login est bien ok **/
    socket.on('logging-ok', function(){
        //window.location='http://localhost/projects/Chat/chatroom.html';
        //$('#connect').style.visibility="hidden";
        $('#messagerie').style.visibility="visible";
        $('#message').focus();
    });


    /** Vérifier que l'user est bien crée on écoutant l'evement provenant du serveur (new-user-created)*/
    socket.on('new-user-created', function(created_user){
        $('#liste-utilisateurs').append('<img src="' + created_user.avatar + '" id="' + created_user.id + '">');
        $('#liste-utilisateurs').append('<br/>');
    });


    /** on regarde qui se déconnecte */
    socket.on('user-disconnected', function(user){
        $("#" + user.id).remove();
    });




    }
 )(jQuery);//END SCRIPT
