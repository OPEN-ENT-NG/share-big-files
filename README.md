# À propos de l'application Poste-fichiers

* Licence : [AGPL v3](http://www.gnu.org/licenses/agpl.txt) - Copyright Conseil Régional Nord Pas de Calais - Picardie
* Développeur(s) : ATOS
* Financeur(s) : Région Nord Pas de Calais-Picardie

* Description : Service d'échange de fichiers volumineux.

# Documentation technique

## Prérequis

 1. L'application Poste-Fichier nécessite un accès à un système de stockage objet RESTful, en l'occurrence Swift qui est intégré à l'infrastructure de l'ENT et employé par l'application. Certaines informations de configuration de ce système de stockage doivent être fournies pour mener à bien la configuration de cette application.
 2. Swift est un service multi-conteneur. Un conteneur spécifique est nécessaire aux usages de cette application. Il permet de spécifier une taille maximale du stockage allouée à cette application pour l'ENT.

## Construction

<pre>
		gradle copyMod
</pre>

## Déployer dans ent-core


## Configuration

Dans le fichier `/share-big-files/deployment/sharebigfiles/conf.json.template` :

Configurer l'application de la manière suivante :
<pre>
{
      "name": "fr.openent~share-big-files~0.1-SNAPSHOT",
      "config": {
        "main" : "fr.openent.sharebigfiles.ShareBigFiles",
        "port" : 8052,
        "app-name" : "ShareBigFiles",
    	"app-address" : "/sharebigfiles",
    	"app-icon" : "sharebigfiles-large",
        "host": "${host}",
        "ssl" : $ssl,
        "auto-redeploy": false,
        "userbook-host": "${host}",
        "integration-mode" : "HTTP",
        "app-registry.port" : 8012,
        "mode" : "${mode}",
        "entcore.port" : 8009,
        "swift": {
              "uri": "http://$IP:$PORT",
              "container": "CONTAINER_ID" ,
               "user":  "$user",
              "key":  "$key"
        },
        "expirationDateList" : [1,5,10,30],
        "maxQuota" : 1073741824,
        "maxRepositoryQuota" : 1099511627776,
        "purgeFilesCron" : "0 0 23 * * ?"
}
</pre>
Configurer l'ip (**$IP**) et le port (**$PORT**) afin de joindre le backend de stockage adéquat. Renseigner l'utilisateur(**$user**) et la clef(**$key**) pour permettre à l'API coeur de générer un jeton d'authentification.

Les paramètres de configurations suivant peuvent être omis et comportent les valeurs par défaut spécifiées ci-dessus (Extrait de configuration) :
 - "expirationDateList": Liste d'entier (ordre croissant) qui représente la gamme de jours d'expiration disponibles dans l'IHM

 - "maxQuota" et "maxRepositoryQuota": Valeurs à définir en octet qui représentent respectivement le quota alloué à chaque usager et la taille maximale du système de stockage objet. Il est à noter, par convention, que la taille du conteneur sur le backend de stockage doit bien évidement correspondre à cette valeur de configuration.

 - "purgeFilesCron" : Expression Quartz. Tâche planifiée gérée par le "verticle" qui permet de nettoyer les fichiers qui ont atteint la date d'expiration au passage de celle-ci.

Associer une route d'entée à la configuration du module proxy intégré (`"name": "fr.openent~share-big-files~0.1-SNAPSHOT"`) :
<pre>
	{
		"location": "/sharebigfiles",
		"proxy_pass": "http://localhost:8052"
	}
</pre>



# Présentation du module

## Fonctionnalités

Poste-Fichiers est un outil de partage de fichiers volumineux.
Il vous permet de partager du contenu de type fichier avec vos groupes ou un utilisateur particulier.

Des permissions sur les différentes actions possibles sur les fichiers, dont la contribution et la gestion, sont configurées dans Poste-Fichiers (via des partages Ent-core) :

 - Le droit de lecture, correspondant à qui peut consulter et télécharger le fichier
 - Le droit de contribution permet quant-à-lui, en sus, de permettre à
   l'usager de consulter le journal de téléchargement
 - Enfin le droit de gestionnaire permet de partager à l'usager toutes
              les actions disponibles dans l'application pour ce fichier.

## Modèle serveur

Le module serveur utilise un contrôleur et une tâche planifiée (cron).

Le contrôleur`ShareBigFilesController`, correspond au point d'entrée de l'application, permet notamment l'établissement de :
 * L'exposition des micro-services REST,
 * La sécurité globale

Le service `ShareBigFilesService` offre une interface de comportement particulier en dehors de mécanisme CRUD comme l'établissement des traitements avec le système de stockage objet et certaines opérations sur la collection Mongo.

Le contrôleur et le service étendent les classes du framework Ent-core exploitant ainsi l'API Swift et le client Mongo.

Deux jsonschema permettent de vérifier les données reçues par le serveur, il se trouve dans le dossier "src/main/resources/jsonschema" :

 - deletes.json utilisé par le service de destruction de masse de fichier.
 - update.json utilisé par le service de mise à jour des métadonnées associées au fichier (label, description et date d'expiration)

## Modèle front-end

Le modèle Front-end manipule un objet model `Upload` et fournit une collection (liste) d'objet `uploads`.

Le contrôleur `SharebigfilesController` assure le routage des URLs de type (#)  et l'exposition de fonctions du model aux vues.
