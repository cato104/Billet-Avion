/* Billet Avion — générateur de prompts pour trouver des vols moins chers.
   Chaque outil définit ses champs et un gabarit ; les {clés} sont remplacées
   en direct par les valeurs saisies, ou laissées entre crochets si vides. */

const TOOLS = [
  {
    id: "dates",
    nav: "1. Meilleures dates",
    title: "Meilleures dates autour de votre voyage",
    desc: "Trouve les combinaisons départ/retour les moins chères dans une fenêtre autour de vos dates.",
    fields: [
      { key: "origin", label: "Ville de départ", placeholder: "Paris", empty: "[origine]" },
      { key: "destination", label: "Destination", placeholder: "Tokyo", empty: "[destination]" },
      { key: "date", label: "Date cible", type: "date", empty: "[date cible]" },
      { key: "window", label: "Fenêtre (jours avant/après)", placeholder: "7", empty: "[X]" },
    ],
    template: `Agissez en tant qu'analyste des prix de voyage.

Je souhaite voler de {origin} à {destination} autour de {date}.

Examinez une fenêtre de {window} jours avant et après cette date.
Trouvez les 3 combinaisons départ/retour les moins chères.

Pour chaque option, expliquez :
• Dates exactes
• Prix total
• Pourquoi c'est moins cher (jour de la semaine, demande, événements, etc.).`,
  },
  {
    id: "hidden-flights",
    nav: "2. Vols cachés",
    title: "Trouver les vols que les recherches normales manquent",
    desc: "Liste tous les vols disponibles, y compris low-cost, régionales et connexions moins connues.",
    fields: [
      { key: "origin", label: "Ville de départ", placeholder: "Lyon", empty: "[origine]" },
      { key: "destination", label: "Destination", placeholder: "Lisbonne", empty: "[destination]" },
      { key: "weeks", label: "Période (semaines)", placeholder: "4", empty: "[X]" },
    ],
    template: `Agissez en tant qu'assistant de recherche de vols.

Listez tous les vols disponibles de {origin} à {destination} pour les prochaines {weeks} semaines.

Incluez :
• Les grandes compagnies aériennes
• Les transporteurs à bas coût
• Les compagnies régionales
• Les connexions moins connues

Triez tout par prix total (tarif + frais obligatoires), pas seulement le tarif de base.

Mettez en évidence tout schéma où certains jours ou horaires sont systématiquement moins chers.`,
  },
  {
    id: "layovers",
    nav: "3. Escales intelligentes",
    title: "Itinéraires plus intelligents avec de bonnes escales",
    desc: "Des itinéraires alternatifs avec 1–2 escales qui restent sous votre budget.",
    fields: [
      { key: "origin", label: "Ville de départ", placeholder: "Nantes", empty: "[origine]" },
      { key: "destination", label: "Destination", placeholder: "New York", empty: "[destination]" },
      { key: "budget", label: "Budget maximum (€)", placeholder: "450", empty: "[budget]" },
      { key: "hours", label: "Durée max d'escale (heures)", placeholder: "4", empty: "[X]" },
    ],
    template: `Agissez en tant qu'expert en itinéraires.

Trouvez des itinéraires alternatifs de {origin} à {destination} avec 1–2 escales qui coûtent moins de {budget} €.

Priorisez :
• Escales de moins de {hours} heures
• Aéroports avec peu de tracas ou de frais de transit
• Temps de voyage total raisonnable

Retournez :
• 3–5 options d'itinéraires (aéroports + compagnies aériennes)
• Prix total et temps de voyage
• Pourquoi chaque itinéraire représente un bon compromis.`,
  },
  {
    id: "deals",
    nav: "4. Vraies offres",
    title: "Des offres réelles, pas des promotions bidon",
    desc: "Codes promo, ventes flash et réductions vérifiables uniquement.",
    fields: [
      { key: "routes", label: "Compagnies aériennes ou trajets", placeholder: "Air France, Transavia, ou Paris → Rome", empty: "[compagnies aériennes ou trajets]" },
    ],
    template: `Agis comme mon vérificateur d'offres.

Pour les vols sur {routes}, trouve :
• Les codes promo actuels
• Les ventes flash
• Les réductions publiques

Pour chacune, dis-moi :
• D'où ça vient (newsletter, site, campagne)
• Date d'expiration
• Conditions ou restrictions
• Comment l'appliquer

N'inclus que les offres clairement valides et vérifiables.
Ignore les offres expirées ou suspectes.`,
  },
  {
    id: "fees",
    nav: "5. Frais cachés",
    title: "Décomposer tous les frais supplémentaires",
    desc: "Le prix total réel d'un billet, et comment réduire légalement chaque frais.",
    fields: [
      { key: "fare", label: "Infos tarifaires ou lien du vol", type: "textarea", placeholder: "Collez ici les détails du tarif ou le lien de la réservation…", empty: "[coller les infos tarifaires ou le lien]" },
    ],
    template: `Agissez en tant qu'expert en règles tarifaires.

Pour ce vol : {fare}

Décomposez chaque coût supplémentaire :
• Bagages
• Sélection de siège
• Embarquement prioritaire
• Frais de paiement ou de service

Ensuite :
• Affichez le prix total réel
• Suggérez des moyens légaux d'éviter ou de réduire chaque frais (basés sur les règles tarifaires actuelles)
• M'avertissez de tout piège qui semble bon marché mais coûte plus cher plus tard.`,
  },
  {
    id: "email",
    nav: "6. E-mail de négociation",
    title: "Rédiger un e-mail de garantie des prix / remise",
    desc: "Un e-mail professionnel pour demander une garantie de prix, une remise ou des avantages.",
    fields: [
      { key: "price", label: "Prix trouvé (€)", placeholder: "220", empty: "[prix]" },
      { key: "seller", label: "Compagnie / agence", placeholder: "Air France", empty: "[compagnie aérienne/agence]" },
      { key: "higherPrice", label: "Prix plus élevé comparé (€)", placeholder: "280", empty: "[prix plus élevé]" },
      { key: "competitor", label: "Compagnie / agence concurrente", placeholder: "Lufthansa", empty: "[compagnie aérienne/agence]" },
    ],
    template: `Agissez en tant que négociateur du support client poli mais ferme.

J'ai trouvé ce vol à {price} € chez {seller}, et une option similaire à {higherPrice} € chez {competitor}.

Rédigez un e-mail professionnel demandant :
• Une garantie des prix, OU
• Une remise de bonne volonté, OU
• Des crédits/avantages

Mentionnez :
• Ma fidélité ou mon historique avec eux (je remplirai les détails)
• Le prix du concurrent
• Leurs politiques actuelles si pertinent

Gardez un ton respectueux mais confiant.`,
  },
  {
    id: "risk",
    nav: "7. Analyse de risque",
    title: "Comparer le risque si mes plans changent",
    desc: "Compare les règles de modification, d'annulation et de remboursement entre plusieurs billets.",
    fields: [
      { key: "count", label: "Nombre d'options (2–4)", placeholder: "3", empty: "[2–4]" },
      { key: "options", label: "Options de vols et leurs règles", type: "textarea", placeholder: "Collez ou décrivez chaque option et ses conditions…", empty: "[coller ou décrire]" },
    ],
    template: `Agissez en tant qu'analyste des risques pour les billets d'avion.

Voici {count} options de vols avec leurs règles de modification/annulation/remboursement : {options}

Comparez-les et dites-moi :
• Quelle option présente le risque financier le plus faible si mes plans changent
• Combien je perdrais dans chaque scénario (modification, annulation, non-présentation)
• Toute clause cachée à laquelle je devrais prêter attention

Terminez par une recommandation simple : « Si vous valorisez la flexibilité plus que le prix, choisissez X ; si vous voulez l'option la moins chère et acceptez le risque, choisissez Y. »`,
  },
  {
    id: "hidden-city",
    nav: "8. Ville cachée",
    title: "Évaluer les astuces de billets pour ville cachée",
    desc: "Analyse réaliste des risques et bénéfices de la billetterie « ville cachée ».",
    fields: [
      { key: "origin", label: "Ville de départ", placeholder: "Paris", empty: "[origine]" },
      { key: "destination", label: "Destination", placeholder: "Milan", empty: "[destination]" },
    ],
    template: `Agissez en tant qu'expert en politique aéronautique.

Expliquez si l'utilisation de billets avec des destinations cachées (billetterie ville cachée) pourrait réduire le coût de {origin} à {destination}.

Pour mon cas :
• Montrez si cela permet réellement d'économiser de l'argent
• Listez les risques réels et les politiques des compagnies aériennes
• Dans quelles situations spécifiques cela pourrait valoir la peine
• Quand je devrais absolument l'éviter

Je veux une analyse réaliste des risques/avantages, pas du battage publicitaire.`,
  },
  {
    id: "multi-city",
    nav: "9. Multi-villes",
    title: "Planifier un voyage complet multi-villes",
    desc: "Le meilleur ordre, les meilleures dates et les vols pour un circuit complet.",
    fields: [
      { key: "cities", label: "Villes ou pays à visiter", type: "textarea", placeholder: "Rome, Athènes, Istanbul…", empty: "[liste des villes ou pays]" },
      { key: "origin", label: "Ville de départ", placeholder: "Paris", empty: "[origine]" },
      { key: "duration", label: "Durée du voyage", placeholder: "3 semaines", empty: "[X jours/semaines]" },
    ],
    template: `Agissez en tant que planificateur de voyages.

Je souhaite visiter ces endroits lors d'un seul voyage :
{cities}

Ma ville de départ : {origin}
Durée du voyage : {duration}

Concevez l'itinéraire le plus intelligent et les vols.

Retour :
• Meilleur ordre pour visiter chaque ville
• Dates suggérées pour chaque étape
• Aéroports recommandés
• Prix approximatifs pour chaque segment
• Où je peux économiser le plus d'argent en modifiant l'ordre ou les dates.`,
  },
  {
    id: "true-cost",
    nav: "10. Coût réel",
    title: "Vérifier le coût réel du voyage, pas seulement le billet",
    desc: "Billet + transferts + bagages + transport local : le vrai total, et de meilleures alternatives.",
    fields: [
      { key: "details", label: "Détails ou lien du vol", type: "textarea", placeholder: "Collez ici les détails du vol ou le lien…", empty: "[détails ou lien]" },
    ],
    template: `Agissez en tant qu'analyste des coûts de voyage.

Je considère ce vol : {details}

Estimez le coût total de voyage pour cette option, incluant :
• Prix du vol + frais
• Transferts aéroport (aller et retour)
• Coûts probables pour les bagages
• Coûts courants de transport local pour les heures d'arrivée

Puis :
• Suggérez 1–2 options de vol alternatives (horaires ou aéroports différents)
• Comparez le coût total du voyage, pas seulement le billet
• Dites-moi quelle option offre le meilleur rapport qualité-prix.`,
  },
];

const nav = document.getElementById("tool-nav");
const form = document.getElementById("tool-form");
const output = document.getElementById("prompt-output");
const titleEl = document.getElementById("tool-title");
const descEl = document.getElementById("tool-desc");
const copyBtn = document.getElementById("copy-btn");

let currentTool = TOOLS[0];

function formatDate(value) {
  // Convertit AAAA-MM-JJ (input date) en date lisible en français.
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function buildPrompt(tool, highlight) {
  let text = tool.template;
  for (const field of tool.fields) {
    const input = form.elements[field.key];
    let value = input ? input.value.trim() : "";
    if (value && field.type === "date") value = formatDate(value);
    const replacement = value
      ? value
      : highlight ? `\u0001${field.empty}\u0001` : field.empty;
    text = text.split(`{${field.key}}`).join(replacement);
  }
  return text;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function render() {
  const marked = escapeHtml(buildPrompt(currentTool, true));
  output.innerHTML = marked.replace(/\u0001(.*?)\u0001/g, '<span class="gap">$1</span>');
}

function selectTool(tool) {
  currentTool = tool;
  titleEl.textContent = tool.title;
  descEl.textContent = tool.desc;

  for (const chip of nav.children) {
    chip.classList.toggle("active", chip.dataset.id === tool.id);
  }

  form.innerHTML = "";
  for (const field of tool.fields) {
    const wrap = document.createElement("div");
    wrap.className = "field";

    const label = document.createElement("label");
    label.textContent = field.label;
    label.htmlFor = `f-${field.key}`;

    const input = document.createElement(field.type === "textarea" ? "textarea" : "input");
    if (field.type && field.type !== "textarea") input.type = field.type;
    input.id = `f-${field.key}`;
    input.name = field.key;
    if (field.placeholder) input.placeholder = field.placeholder;
    input.addEventListener("input", render);

    wrap.append(label, input);
    form.appendChild(wrap);
  }
  render();
}

for (const tool of TOOLS) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "tool-chip";
  chip.dataset.id = tool.id;
  chip.textContent = tool.nav;
  chip.addEventListener("click", () => selectTool(tool));
  nav.appendChild(chip);
}

copyBtn.addEventListener("click", async () => {
  const text = buildPrompt(currentTool, false);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  copyBtn.textContent = "Copié !";
  copyBtn.classList.add("copied");
  setTimeout(() => {
    copyBtn.textContent = "Copier le prompt";
    copyBtn.classList.remove("copied");
  }, 1600);
});

selectTool(TOOLS[0]);
