# FUN56 — fun56.bzh

Refonte du site de **FUN56 SARL**, base nautique du port de plaisance de Guidel-Plages
(Morbihan) : jet ski, flyboard, wakeboard / ski nautique, bouée tractée et atelier
mécanique jet-ski.

## Structure

```
index.html            Accueil (héro, la base, activités, l'équipe, tarifs, contact)
jet-ski.html          4 formules : baptême, navigation libre, randonnée, excursion Groix
flyboard.html         Session découverte 99 €/20 min
wake-ski.html         Wake board / ski nautique (35 € à 160 €)
bouee-tractee.html    Galette, Banane, Flyfish — 25 €/pers./15 min
atelier.html          Atelier mécanique jet-ski + CGV atelier (15 articles)
bon-cadeau.html       Bon cadeau (valable sur l'activité jet ski)
cgv.html              CGV activités (18 articles)
contact.html          Coordonnées + formulaire (ouvre la messagerie du visiteur)
css/style.css         Feuille de style commune (responsive, animations au scroll)
js/main.js            Menu mobile, apparitions au scroll, formulaire de contact
assets/               hero.jpg · port-guidel.jpg · jetski-plage.jpg · logo.png · favicon.png
```

## Développement

Site 100 % statique, sans dépendance ni build :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Déployable tel quel sur n'importe quel hébergement statique (OVH, Netlify, GitHub Pages…).

## Contenu

Textes, tarifs et CGV repris du site d'origine (captures fournies par la cliente).
Contact : 06 31 04 97 96 · contact.fun56@gmail.com · Port de Plaisance, 56520 Guidel-Plages.
