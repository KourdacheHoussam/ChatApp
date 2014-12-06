/**
 * Created by Housssam on 06/12/2014.
 */

/**
 * Ici, on va se connecter au site depuis SOCKET.IO
 *
 * Remarque : ici on utilise JQUERY
 */



/**
 *  --1--  : connexion à socket IO
 */

(function($){

    /** io utilisé ci-dessous est chargé automatiquement via le JS intégré dans index.html
    * on appelle la méthode connect du composant io(chargé de socket) pour nous connecter au serveur.*/

    var socket = io.connect('http://localhost:1337');
    console.log(io);

    /** A l'aide de jquery on va recupérer les elements pseudo et email de l'user **/


    $('#loginform').submit(function(event){
        event.preventDefault(); //empecher l'utilisateur de soumettre le formulaire

        /**
         * puis émettre un évènement à la socket
         * on spécifiant le nom de l'évènement que l'on veut
         */

        /**
         * Notre premiere evenement est le : LOGIN : envoi d'un event login au serveur
         */

        socket.emit('login', {  // on emet un event de type loginEvent + les paramètres (pseudo+mail)
            pseudo:$('#pseudo').val(),  // on récupere la valeur du cham pseudo, puis
            adressemail:$('#adressemail').val() // celle du champ adressemail
        });

        socket.emit('try', { val:"cocou"});
    });

})(jQuery);