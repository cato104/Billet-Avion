# FUN56 — fun56.bzh

Refonte du site de **FUN56**, base nautique du port de Guidel-Plages (Morbihan) :
jet ski, bouée tractée, flyboard, ski nautique & wakeboard.

## Structure

```
index.html        Page unique (accueil, activités, rando Groix, tarifs, infos, contact)
css/style.css     Feuille de style (responsive, animations au scroll)
assets/hero.jpg   Photo aérienne du port avec le logo FUN56 (image d'origine conservée)
```

## Développement

Site 100 % statique, sans dépendance ni build :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Déployable tel quel sur n'importe quel hébergement statique (OVH, Netlify, GitHub Pages…).
