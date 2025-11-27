
------------- Complete ---------------------
compiler le typescript dans le dockerfile
verifier que la base de donnee (postgreSQL) est bien fonctionnelle
faire le network entre les containers
verifier que les services sont disponibles (url localhost/3000 sur un navigateur web)
faire un test de base (comunication entre frontend et backend) et apres verifier postgre.


A faire:
- faire en sorte que les composants sur la page soient bien alignés (OK)
- gérer correctement la validation des formulaires (OK)
- implementer le boutton de retour "Back"
- implémenter le composant stepper dans les trois pages
- mettre des visuels sur la partie de droite des pages
merger la derniere page de signup "images" - reprendre page co-équipier
modifier le margin 55 (il faut un system de grid)
implémenter le stockage et la gestion du stockage entre le flux de navigation utilisateur

pour les icones:
https://pictogrammers.com/library/mdi/icon/account/
cd frontend/
npm install @mdi/react @mdi/js

-----------------------------------------

A faire 07/11/2025:

- voir comment gerer le routage proprement.. parce que ce n'est pas fonctionnel.. on perds les datas..
- modifier dans registerImageForm.tsx dans page.tsx du register principale pour le submit final.
- centrer les login/signup/register page sinon on doit scroller... c'est pas professionnel..
- ajouter le framer-motion module pour un effet professionnel
- re-ajuster la derniere page image du formulaire  car elle parait tres serre..
voir pour optimiser les interfaces dans chaque registerPage, peut etre tout regrouper..

le 16/11/2025
Tutoriel entier a faire: https://www.youtube.com/watch?v=Y7wbzq1j9g0

25/11/2025
faire menu hamburger pour small size (medium et large doit etre pareil, juste en pourcentage)
en sm du coup il n'y a que la chatlist (les messages ne sont pas visible (hidden))
et quand on clique sur un boutton, la chatlist disparait et les messages apparaissent avec la conversation selectionner par rapport aux donnees charges.

26/11/2025
socket pour chat realtime