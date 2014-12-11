/**
* Created by Housssam on 06/12/2014.
* Ici, on va se connecter au site depuis SOCKET.IO
* Remarque : ici on utilise JQUERY
*/

/**-------------------
 * ---Document Pret --
 * ------------------*/
(function($) {

    /**----------------------------------------------------------------------------------------------------------
     *  -------------------------------------- VARIABLES  --------------------------------------------------------
     * ----------------------------------------------------------------------------------------------------------- */
    var list_messages=[];
    var list_users=[];
    var mode_actuel='';
    var date_connection=new Date();
    var date_hour=date_connection.getHours();
    var date_minutes=date_connection.getMinutes();
    var date_seconds=date_connection.getSeconds();
    var mode_communication='',mode_communication_precedent='', previous_messages='', button_quitter=false;
    var Me;
    var socket;//=io('http://localhost:3000/');


    $('#send-msg-form').on('change', function(){
        // Mode Communication Var
        mode_communication= jQuery( 'input[name="modecom"]:checked' ).val();
        // Voir ou pas les anciens messages du chat
        previous_messages=jQuery('input[name="file_msg"]:checked').val();

    });
    // Le button Quitter cliqué
    $('#quitter').click(function(){
        alert("dans quit button");
        var time;
        button_quitter=true;
        socket.emit('disconnect',{});
        clearInterval(time);
        setTimeout( function(){
            socket.disconnect();
        }, 2000 );
        //longPolling();
    });

    //Si le mode précédent est push,, i-e mode par défaut
    if(mode_communication_precedent=='Push'){ }

    /** Quand j'envoie un message*/
    $('#send-msg-form').submit(function(event) {
        event.preventDefault();
    });


    /** ----------------------------------------------------------------------------------------------------------
     *  -------------------------------------- FONCTIONS COMMUNES ------------------------------------------------
     *  ---------------------------------------------------------------------------------------------------------- */

    // fonction pour prévenir le serveur du choix de mode de COM
    function chooseModeCommunication(mode){
        $.ajax({
            url:'http://localhost:3000/choosemode/',
            type:'GET',
            data: 'modecommunication=' + mode,
            dataType:'json',
            complete: function(data, status, xhr){ //recevoir une confirmation du serveur
                //si c bon, on coche la case du mode choisi sur l'IHM
                // on démarre le long polling()
                alert("La communication avec ce mode est établie");
                mode_actuel=JSON.stringify(data);
                alert("Mode actuel =" +mode_actuel);
            },
            fail: function(xhr, status){
                alert("La communication avec ce mode n'est pas établie");
            }
        });

    };
    //fonction pour envoyer un nouveau message
    function sendNewMessage(message){
        $.ajax({		// la méthode ajax() est utilisé pour effectuer une requête réseau asynchrone.
            url: 'http://localhost:3000/addmessage/',	// l'url vers laquelle j'envoie ma requete
            type: 'GET',				// specifie le type de requete GET ou POST
            data: 'message=' + message, //specifie les données à envoyer au serveur
            dataType: 'json',			//le type de données attendue par le serveur, ici c du json
            //success est la méthode à faire tourner quand la requete aboutit
            complete: function(data, status, xhr){
                if(status=="success"){
                    var msg='';
                    //var obj=$.parse(data);
                    //list_messages=JSON.stringify(data);
                    //var obj=JSON.parse(data);
                    //alert(data.message);
                }
            },
            fail:function(xhr, status){
                alert("il y a une error");
            }
            // la méthode à appeler quand la requete est finie: quand on a reçu le callback success ou error.
            //complete:
        });
        return false; //empecher le rafraichissement
    };

    //create new user
    function createNewuser(username, email){
        jQuery.ajax({
         url:'http://localhost:3000/newuser/',
         type:'GET',
         data:{username:username, email:email},
         dataType:'json',
         success:function(){},
         complete:function(data, status, xhr){
             if(status=="success"){
                 var msg='';
             }
         },
         fail:function(xhr, status){
             alert("Utilisateur non ajouté");
         }
      });
      return false;
    };
    /** ----------------------------------------------------------------------------------------------------------
     *  -------------------------------------- GESTION DES BOUTONS -----------------------------------------------
     *  ---------------------------------------------------------------------------------------------------------- */
    //Ajout user
    $('#loginform').submit(function(event){
        event.preventDefault(); //empecher l'utilisateur de soumettre le formulaire
        // scroller vers la section messagerie
        goToByScroll("messagerielink");
        //envoyer requete vers serveurs
        createNewuser($('#username').val(),$('#mail').val());
        //on vide les champs
        $('#username').val('');
        $('#username').focus();
        $('#mail').val('');
        $('#mail').focus();
    });


    // quand le formulaire est envoyé
    $('#send-msg-form').submit( function(){
        // on récupère le contenu de l'input
        var message = $('#message_content').val();
        // Si le contenu du message du formulaire est null
        if( jQuery.trim( message ) == '' ){
            window.alert('Enter a message!');
            return false;
        }
        sendNewMessage(message);//send it
        return false;//empecher le rafraichissement
    });


    /** ----------------------------------------------------------------------------------------------------------------
     ---------------------------------------------- SECTION POLLING ----------------------------------------------------
     -------------------------------------------------------------------------------------------------------------------*/
    function pollingUsers(){
       var time;
        $.ajax({
            url:'http://localhost:3000/pollingusers/',
            type:'GET',
            data:{},
            dataType:'json',
            success:function(data, status, xhr){
                clearInterval(time);
                if(status=="success"){
                    var msg='';
                    list_users=JSON.stringify(data);
                    $('#message_content').append(list_users.toString());
                    time=setTimeout(function(){
                        pollingUsers();
                    }, 3000);
                }else{
                    alert("Please refresh the page");
                }
            },
            error:function(){
                clearInterval(time);
                time=setTimeout(function(){
                    pollingUsers();
                }, 15000);
            }
        });
        return false;
    }
    function polling(){
        if(io!=null){  socket.emit('disconnect',{}); socket.disconnect(); }
        var time;
        $.ajax({
            url:'http://localhost:3000/polling/',
            type:'GET',
            data: { heure: date_hour, minutes:date_minutes, secondes:date_seconds },
            dataType:'json',
            success: function(data, status, xhr){
                clearInterval(time);
                if(status=="success"){
                    time=setTimeout( function(){
                        polling();
                    }, 2000 );  // redemarre le polling au bout de 2 sec
                    var msg='';
                    list_messages=JSON.stringify(data);
                    $('#liste-utilisateurs').append("<p>Votre message:   " + list_messages.toString()+"</p>");
                }else{
                    alert(':( Please refresh the page!');
                }
            },
            error:function(){
                clearInterval( time );
                time = setTimeout( function(){
                    polling( );
                }, 19000 );//on attend 15 scd
            }
        });
        return false;
    };
    // Appel à la fonction polling
    polling();
    //pollingUsers()

    /** -----------------------------------------------------------------------------------------------------------------
     ------------------------------------------------ SECTION LONG POLLING ----------------------------------------------
     --------------------------------------------------------------------------------------------------------------------*/

     // Start Long-polling for messages
     // on crée une novuelle fonction javascript
     function longPolling( ){
        var time;
        //on envoie la requete vers le serveur dont le port est 3000:
        //on lui passe en parametre un timestamp et un lastid
        jQuery.ajax({
            url: 'http://localhost:3000/longpolling/',
            type: 'GET',
            data: { heure: date_hour, minutes:date_minutes, secondes:date_seconds },
            dataType: 'json',
            //SUCESS et ERROR sont deux call back renvoyées par le serveur
            success: function( data, status, xhr ){  //Au cas du succes on verifie si on a des resultats
                clearInterval( time );
                if( status == 'success' ){
                    // quand on reçoit des données, on refait une nouvelle requete
                    // aprés une seconde, en appelant
                    // la fonction longpolling
                    time=setTimeout( function(){
                        longPolling( );
                    }, 1000 );
                    var msg='';

                    list_messages=JSON.stringify(data);
                    //alert(list_messages);
                    var json=JSON.parse(list_messages);

                    // var message_template=$('#message_tpl').html(); //recuperer la div où s'affiche les msg
                    //$('#message_tpl').remove();//puis la supprimer

                    $('#fuck').append("<p>Message : " +json.message+" Heure : "+ json.hour+":"+json.minutes+"</p>");
                    //on injecte le contenu message dans le template message_tmpl
                    var message= {"hour":json.hour, "minutes":json.minutes, "message":json.message,"user.avatar":json.avatar ,"message.user.id":" dsdsd"};
                    //$('#listmessages').append('<div class="message-right" style="margin-bottom:-45px; ">'
                    //    + Mustache.render(message_template, message) +
                    //    '</div>');
                }
                else if( data.status == 'error' ){
                    alert('We got confused, Please refresh the page!');
                }
            },
            // Si la requete envoye renvoie une errer: exemple d'un serveur en panne
            // ou pas de connexion internet.
            // nous allons renvoyer une requete au bout de 15 seconde afin de laisse le temps au serveur de redemarrer
            error: function(){
                clearInterval( time );
                time = setTimeout( function(){
                    longPolling( );
                }, 15000); //15 secondes
            }
            // quand la requete est complete
            //complete:longPolling
        });
        return false;
     }
    // longPolling();

    /** --------------------------------------------------------------------------------------------------------------------
    *   -------------------------------------------------------- SECTION PUSH ----------------------------------------------
    *   --------------------------------------------------------------------------------------------------------------------*/

    function Push(){
        /** io utilisé ci-dessous est chargé automatiquement via le JS intégré dans index.html
         * on appelle la méthode connect du composant io(chargé de socket) pour nous connecter au serveur.*/
        socket=io('http://localhost:3000/');

        /**---------------------- GESTION MESSAGERIE -------------------- */
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
                $('#listmessages').append('<div class="message-left" style="margin-bottom:-45px" id="'+message.user.id+'">'
                    + Mustache.render(message_template_left, message) + '</div>');
            }
            $('#messagerie').animate({scrollTop: $('.message-left').last().offset().top }, 1000);
            //$('#listmessages-right_left').animate({scrollTop: $('#message_tpl_right').offset().top }, 1000);
        });

        /** -------------------------- GESTION CONNECTIONS ------------------------ */

        /** A l'aide de jquery on va recupérer les elements "username" et "email" de l'utilisateur **/
        $('#loginform').submit(function(event){
            event.preventDefault(); //empecher l'utilisateur de soumettre le formulaire
            // scroller vers la section messagerie
            goToByScroll("messagerielink");

            /** puis émettre un évènement à la socket
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
            $('#messagerie').style.visibility="visible";
            $('#message').focus();
        });
        /** Vérifier que l'user est bien crée on écoutant l'evement provenant du serveur (new-user-created)*/
        socket.on('new-user-created', function(created_user){
            Me=created_user;
            $('#liste-utilisateurs').append('<li id="'+created_user.id+'" class="list-group-item" ' +
                'style="background-color: transparent;border-width:0.03cm;">' +
                '<img src="'+ created_user.avatar +'">'+ created_user.username+'<span class="badge text-center pull-right">'+
                created_user.connectionhour +':'+created_user.connectionminutes+'</span></li>');
        });
        /** on regarde qui se déconnecte */
        socket.on('user-disconnected', function(user){
            $("#" + user.id).remove();
            socket.disconnect();
            alert("disconnected");
        });
    };

    //Push();


} //ENF OF MAIN FUNCTION
)(jQuery); //END SCRIPT


function goToByScroll(id){
    // Remove "link" from the ID
    id = id.replace("link", "");
    // Scroll
    $('html,body').animate({
            scrollTop: $("#"+id).first().offset().top},
        'fast');
}