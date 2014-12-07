/**
* Created by Housssam on 06/12/2014.
* Ici, on va se connecter au site depuis SOCKET.IO
* Remarque : ici on utilise JQUERY
*/

(function($) {

    /** io utilisé ci-dessous est chargé automatiquement via le JS intégré dans index.html
     * on appelle la méthode connect du composant io(chargé de socket) pour nous connecter au serveur.*/
    var socket=io('http://localhost:3000/');

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
    });

    /** Vérifier que l'user est bien crée on écoutant l'evement provenant du serveur (new-user-created)*/
    socket.on('new-user-created', function(created_user){
        alert("new user created !");
        $('#liste-utilisateurs').append('<li> <img src="' + created_user.avatar + '"</li>');
    });
    console.log("after submit method #client");


    }//END ANONYME FUNCTION
 )(jQuery);//END SCRIPT
