/**
* Created by Housssam on 06/12/2014.
* Ici, on va se connecter au site depuis SOCKET.IO
* Remarque : ici on utilise JQUERY
*/

/** Document Pret*/
(function($) {



    var mode_communication='', voir_anciens_msg='', button_quitter=false;
    $('#send-msg-form').on('change', function(){
        // Mode Communication Var
        mode_communication= jQuery( 'input[name="modecom"]:checked' ).val();
        // Voir ou pas les anciens messages du chat
        voir_anciens_msg=jQuery('input[name="file_msg"]:checked').val();

    });
    // Le button Quitter cliqué
    $('#quitter').click(function(){
        button_quitter=true;
        alert(button_quitter);
    });


    /** io utilisé ci-dessous est chargé automatiquement via le JS intégré dans index.html
     * on appelle la méthode connect du composant io(chargé de socket) pour nous connecter au serveur.*/
    var socket=io('http://localhost:3000/');

    var Me;

     /**
     * -----------------------------------------------------------------------------------------------------------
     * ------------------------------------------------------ GESTION MESSAGERIE---------------------------------
     * -----------------------------------------------------------------------------------------------------------
     */

     var message_template=$('#message_tpl').html(); //recuperer la div où s'affiche les msg
     $('#message_tpl').remove();//puis la supprimer

     var message_template_left=$('#message_tpl_left').html();// recuperer la div ou s'affiche les msg gauches
    $('#message_tpl_right').remove();//puis le supprimer

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
         if(message.user.id != Me.id){
             //on injecte le contenu message dans le template message_tmpl
             $('#listmessages').append('<div class="message-right" style="margin-bottom:-45px; ">'
                 + Mustache.render(message_template, message) +
                 '</div>');
         }
         if(message.user.id == Me.id){
             $('#listmessages').append('<div class="message-left" style="margin-bottom:-45px; ">'
                 + Mustache.render(message_template_left, message) + '</div>');
         }
         $('#listmessages-right').animate({scrollTop: $('#message_tpl').offset().top }, 1000);
         $('#listmessages-right_left').animate({scrollTop: $('#message_tpl_right').offset().top }, 1000);
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
        // scroller vers la section messagerie
        goToByScroll("messagerielink");

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
        Me=created_user;
        $('#liste-utilisateurs').append('<li class="list-group-item" style="background-color: transparent;border-width:0.03cm;"><img src="' +
            created_user.avatar + '" id="' + created_user.id + ' " > '+ created_user.username+'<span class="badge text-center pull-right">'+
            created_user.connectionhour +':'+created_user.connectionminutes+'</span></li>');


    });


    /** on regarde qui se déconnecte */
    socket.on('user-disconnected', function(user){
        $("#" + user.id).remove();
    });




    }
 )(jQuery);//END SCRIPT


function goToByScroll(id){
    // Reove "link" from the ID
    id = id.replace("link", "");
    // Scroll
    $('html,body').animate({
            scrollTop: $("#"+id).offset().top},
        'fast');
}