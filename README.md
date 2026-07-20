# ✈️ Billet Avion

**Billet Avion** est un outil qui trouve pour vous des billets d'avion moins chers grâce à l'IA.

Vous remplissez vos informations (origine, destination, dates, budget…), et l'outil interroge directement Claude (Anthropic) **avec la recherche web activée** : l'IA cherche de vrais prix et de vraies offres en ligne, et la réponse s'affiche en direct dans la page.

## Les 10 outils

1. **Meilleures dates** — trouver les combinaisons départ/retour les moins chères autour de vos dates
2. **Vols cachés** — lister les vols que les recherches classiques manquent (low-cost, régionales…)
3. **Escales intelligentes** — itinéraires alternatifs avec 1–2 escales sous votre budget
4. **Vraies offres** — codes promo et ventes flash vérifiables, pas de promos bidon
5. **Frais cachés** — décomposer tous les frais supplémentaires et le prix total réel
6. **E-mail de négociation** — demander une garantie de prix ou une remise
7. **Analyse de risque** — comparer les règles de modification/annulation entre plusieurs billets
8. **Billets « ville cachée »** — analyse réaliste des risques et bénéfices
9. **Voyage multi-villes** — le meilleur ordre et les meilleures dates pour un circuit
10. **Coût réel du voyage** — billet + transferts + bagages + transport local

## Utilisation

1. Ouvrez `index.html` dans un navigateur (aucune installation nécessaire).
2. Cliquez sur **⚙️ Clé API** et collez votre clé API Anthropic (créée sur [console.anthropic.com](https://console.anthropic.com)). Elle est enregistrée uniquement dans votre navigateur.
3. Choisissez un outil, remplissez le formulaire, puis cliquez sur **🔍 Lancer la recherche**.

Chaque recherche utilise le modèle Claude Opus avec la recherche web et coûte quelques centimes, débités sur votre compte Anthropic. Les prix trouvés restent indicatifs : vérifiez-les toujours avant de réserver.

Sans clé API, vous pouvez toujours utiliser le bouton « Copier le prompt » pour coller la demande dans votre assistant IA préféré.
