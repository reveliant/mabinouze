---
title: FAQ
slug: faq
menus: footer
weight: 20
---
## Général

### Qu'est-ce que Ma binouze et pourquoi l'utiliser ?

Ma binouze est une application gratuite qui permet d'organiser facilement une tournée dans un bar.

Chaque participant ajoute sa commande directement depuis son téléphone, ou son ordinateur avant de quitter son bureau, ce qui évite les oublis et les allers-retours au comptoir.

### À qui s'adresse Ma binouze ?

À tous ceux qui prennent un verre entre amis, en famille ou entre collègues.
Que vous vous retrouviez à quatre autour d'une table ou à vingt en terrasse, Ma binouze simplifie la prise de commande.

### Faut-il installer une application ?

**Non** ! Ma binouze fonctionne directement dans ton navigateur préféré sur ordinateur, tablette ou smartphone.
Aucun téléchargement n'est nécessaire.

### Est-ce gratuit ?

**Oui** ! Ma binouze est et restera entièrement gratuit et libre d'utilisation.

## Utilisation

### Comment créer une tournée ?

Clique sur **Créer une nouvelle tournée**, choisis un nom de code, puis partage simplement le lien ou le nom de la tournée avec tes amis.

Ne perd pas le mot de passe organisateur ou tu ne pourras plus savoir qui a commandé quoi !

### Comment rejoindre une tournée ?

Saisis le nom de la tournée ou ouvre le lien partagé par l'organisateur, puis ajoute ta commande.

### Peut-on modifier sa commande ?

**Oui** ! Tant que la commande n'a pas été annoncée au bar, chacun peut ajouter, modifier ou supprimer ses consommations.
Et on peut repartir de la pour lancer la tournée suivante !

### Plusieurs personnes peuvent-elles commander en même temps ?

Oui. Toutes les commandes sont synchronisées en temps réel.

### Qui voit les commandes ?

Les participants voient la liste des consommations anonymisées.

L'organisateur de la tournée (ou les personnes à qui il a donné le code organisateur) voit qui a commandé quoi, et peut modifier les commandes.

### Que se passe-t-il si je ferme la page ?

Tu peux simplement rouvrir le lien de la tournée.

Pour faire des modifications, il te suffira d'indiquer le même prénom ou pseudo et le même mot de passe qu'avant (ou le même code organisateur si c'était ton rôle).

### Peut-on utiliser Ma binouze dans n'importe quel bar ?

**Oui** ! L'application n'est liée à aucun établissement et fonctionne partout où il y a du réseau (désolé pour ta tournée à 3 500 m d'altitude !). La seule condition est bien de disposer d'une connexion Internet.

## Confidentialité

### Dois-je créer un compte ?

**Non** ! C'est un principe fondateur de l'application, aucun compte n'est nécessaire pour l'utiliser, que ce soit pour participer à une tournée ou en créer une.

Pour créer et organiser une tournée, tu auras juste besoin de te souvenir du nom de code et du mot de passe utilisateur.

Pour participer à une tournée, tu n'as besoin que d'indiquer un prénom ou un pseudo, uniquement pour permettre à l'organisateur de retrouver ses petits, et un mot de passe pour éviter que ton voisin assoifé ne commande toutes ses consommations en ton nom.

Un système de compte sera peut-être développé ultérieurement, pour permettre de sauvegarder ses consommations préférées, mais de manière tout à fait optionnelle. 

### Quelles données sont enregistrées ?

Ma binouze se veut par conception une application respectueuse de la vie privée (***privacy by design***) et enregistre uniquement le [strict minimum nécessaire](https://github.com/reveliant/mabinouze/blob/main/assets/python/mabinouze/utils/schema.sql) au bon fonctionnement :

- tournées : nom de code, description, horaire de la tournée, horaire d'expiration technique de la tournée, mot de passe d’organisation, éventuel mot de passe d'accès pour les participants ;
- participants : tournée associée, nom (prénom ou pseudo) du participant, mot de passe ;
- consommations : partiticpant associé, nom de la consommation, quantité.

Les données ne sont sauvegardées que le temps nécessaire, pour un maximum de 12 heures (soit 6 heures après l'horaire de la tournée, cette dernière pouvant elle-même être prolongée de 6 heures).

Et c'est tout, garanti sans additif ni conservateur !

### Mes données sont-elles revendues ?

**Non**, jamais ! Ma binouze ne revend aucune donnée personnelle, même pour payer l'hébergement dont le coût annuel est dérisoire (environ 22 € par an tout inclus).

### Les tournées sont-elles publiques ?

Non. Seules les personnes connaissant le nom de code de la tournée peuvent y accéder.

## Divers

### Pourquoi « Ma binouze » ?

Parce qu'une tournée, c'est avant tout un moment de convivialité dont les bières 

Et avouons-le... « logiciel collaboratif pour la gestion raisonnée et coordonnées des consommations », c'était un peu moins sexy comme nom ! 

### Puis-je utiliser l'application pour des boissons sans alcool ?

**Bien sûr** ! Le nom est humoristique, mais Ma binouze fonctionne pour toutes les consommations : bières, cocktails, mais aussi sodas, cafés, chocolat chaud ou ton matcha préféré, et toutes les choses à grignotter.

### L'application encourage-t-elle la consommation d'alcool ?

**Non** ! Ma binouze aide uniquement à organiser une commande.
Malgré son nom à caractère humoristique, elle ne promeut pas la consommation d'alcool et est tout à fait utilisable avec des *softs*.
Elle rappelle au contraire quelques messages de prévention pour inciter à consommer avec modération.

### Le code source est-il consultable ?

Oui, Ma binouze est un projet libre sous license beer-ware. Tu peux consulter son code source, proposer des améliorations ou signaler un *bug*.

### Puis-je signaler un bug ou proposer une idée ?

**Bien sûr** ! Ma binouze devrait fonctionner sur tous les navigateurs modernes (Chrome, Firefox, Safari et Edge) quelque soit la plateforme (Android, iPhone, Windows, macOS et Linux, et peut-être même ta console de jeu préférée), mais n'hésite pas à signaler tout *bug* !

Tu peux ouvrir une *issue* sur le [dépôt GitHub du projet](https://github.com/reveliant/mabinouze). Toutes les idées d'améliorations sont également les bienvenues, sans garantie de prise en compte.