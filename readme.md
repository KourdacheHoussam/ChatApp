
Sujet :
Développement d’une application web de messagerie instantanée entre deux ou plusieurs utilisateurs.

Objectifs :
-	Se familiariser avec les concepts de communication réseaux : Push, Polling, Long-polling
-	Améliorer nos connaissances dans le développement Javascript
-

Outils utilisés :
-	Pour la création du serveur d’application, on a utilisé Node.JS
-	Pour mettre en place une application communiquant en temps réel, on a eus recours à la librairie Socket.IO.
Socket.IO permet de faire la liaison entre vous et les autres personnes connectées sur l’application Web, le tout en temps réel.
-	Editeur web : WebStorm.
-	Le Framework css de grille utilisé est : 34Grid (34grid.com)


I.	Installation de l’environnement de travail :
a.	Installation de Node.JS :
i.	Télécharger node.js via ce lien : http://nodejs.org/download/ en choisissant la version correspondant à votre système d’exploitation.
ii.	Une fois le nodejs.exe installé, il faut ajouter la chemin vers le répertoire où il a été installé, dans la variable d’environnement Path
iii.	 Pour tester que tout fonctionne, on essaye d’afficher la version de node.js installée : node –version
iv.	Une fois que tout cela fonctionne, on aura la possibilité de démarrer notre serveur Javascript.
b.	Installation de Socket.IO :
i.	Une fois que l’on a installé Node.js, on peut maintenant utiliser la commande « npm » pour installer Socket.IO.
ii.	On ouvre la console et on la pointe sur le répertoire de notre projet ChatApp.
iii.	Tapez la commande : « npm install socket.io »
iv.	La commande précédente génère un dossier : /node_modules contenant les modules node.js, en l’occurrence pour nous ici, c’est Socket.IO.
v.
