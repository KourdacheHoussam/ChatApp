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

    var socket = io.connect('http://localhost:2222');

})(jQuery);