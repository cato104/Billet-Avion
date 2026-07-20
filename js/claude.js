/* Client API Claude pour le navigateur : streaming SSE, outil de recherche
   web serveur, reprise automatique sur stop_reason "pause_turn". */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-8";
const MAX_CONTINUATIONS = 5;

function systemPrompt() {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return `Tu es l'assistant « Billet Avion », un expert en recherche de billets d'avion au meilleur prix.
Date du jour : ${today}.

Règles :
- Utilise la recherche web pour trouver des prix et informations réels et récents (Google Flights, Skyscanner, Kayak, sites des compagnies aériennes). Ne devine jamais un prix sans avoir cherché.
- Réponds toujours en français, de façon claire et structurée (titres courts, listes à puces).
- Donne des prix concrets en euros quand c'est possible, en citant la source et la date de l'information.
- Si tu ne trouves pas un prix exact, donne une fourchette réaliste et dis d'où elle vient.
- Termine chaque réponse par un bref rappel que les prix des vols changent vite et doivent être vérifiés au moment de la réservation.`;
}

function parseSseChunk(buffer, onEvent) {
  // Découpe le tampon en événements SSE complets ; retourne le reste.
  const parts = buffer.split("\n\n");
  const rest = parts.pop();
  for (const part of parts) {
    for (const line of part.split("\n")) {
      if (line.startsWith("data: ")) {
        try {
          onEvent(JSON.parse(line.slice(6)));
        } catch {
          /* données incomplètes ou keep-alive : ignorer */
        }
      }
    }
  }
  return rest;
}

async function streamOnce(apiKey, messages, handlers) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      stream: true,
      system: systemPrompt(),
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }],
      messages,
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      detail = (await response.json()).error?.message ?? "";
    } catch { /* corps non JSON */ }
    const messagesByStatus = {
      401: "Clé API invalide ou révoquée. Vérifiez-la dans les réglages (⚙️).",
      403: "Cette clé API n'a pas les permissions nécessaires.",
      429: "Limite de requêtes atteinte. Patientez une minute puis réessayez.",
      529: "L'API est momentanément surchargée. Réessayez dans un instant.",
    };
    throw new Error(messagesByStatus[response.status] ?? `Erreur API (${response.status}) : ${detail}`);
  }

  // Accumule les blocs de contenu pour pouvoir reprendre après un pause_turn.
  const blocks = [];
  let stopReason = null;
  let buffer = "";
  const decoder = new TextDecoder();
  const reader = response.body.getReader();

  const handleEvent = (event) => {
    if (event.type === "content_block_start") {
      const block = structuredClone(event.content_block);
      if (block.type === "text" && block.text === undefined) block.text = "";
      blocks[event.index] = block;
      if (block.type === "server_tool_use") handlers.onSearchStart();
    } else if (event.type === "content_block_delta") {
      const block = blocks[event.index];
      const delta = event.delta;
      if (delta.type === "text_delta") {
        block.text += delta.text;
        handlers.onText(delta.text);
      } else if (delta.type === "input_json_delta") {
        block._json = (block._json ?? "") + delta.partial_json;
      }
    } else if (event.type === "content_block_stop") {
      const block = blocks[event.index];
      if (block?._json !== undefined) {
        try { block.input = JSON.parse(block._json || "{}"); } catch { /* garder input d'origine */ }
        delete block._json;
        if (block.type === "server_tool_use" && block.name === "web_search" && block.input?.query) {
          handlers.onSearchQuery(block.input.query);
        }
      }
    } else if (event.type === "message_delta") {
      stopReason = event.delta?.stop_reason ?? stopReason;
    } else if (event.type === "error") {
      throw new Error(event.error?.message ?? "Erreur pendant le streaming.");
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer = parseSseChunk(buffer + decoder.decode(value, { stream: true }), handleEvent);
  }

  return { blocks: blocks.filter(Boolean), stopReason };
}

/**
 * Lance une recherche complète (avec reprises pause_turn).
 * handlers : { onText, onSearchStart, onSearchQuery, onStatus }
 * Exposée en global : le site doit fonctionner ouvert en file:// (les
 * modules ES y sont bloqués par le navigateur).
 */
async function runSearch(apiKey, prompt, handlers) {
  const messages = [{ role: "user", content: prompt }];

  for (let round = 0; round <= MAX_CONTINUATIONS; round++) {
    const { blocks, stopReason } = await streamOnce(apiKey, messages, handlers);

    if (stopReason === "pause_turn") {
      // L'outil serveur a atteint sa limite d'itérations : on renvoie la
      // conversation telle quelle et l'API reprend où elle s'était arrêtée.
      messages.push({ role: "assistant", content: blocks });
      handlers.onStatus("La recherche continue…");
      continue;
    }
    if (stopReason === "refusal") {
      throw new Error("Claude a refusé de répondre à cette demande.");
    }
    if (stopReason === "max_tokens") {
      handlers.onStatus("Réponse tronquée (limite de longueur atteinte).");
    }
    return;
  }
  throw new Error("La recherche a pris trop d'étapes. Réessayez avec une demande plus précise.");
}
