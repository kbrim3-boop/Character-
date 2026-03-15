const STORAGE_KEY = "character_codex_state_v1";
const STATE_VERSION = 1;

const questionSchema = [
  { id: "name", label: "Full Name", type: "text", category: "I. Core Identity", placeholder: "Enter full name" },
  { id: "role", label: "Primary Role / Archetype", type: "select", category: "I. Core Identity", options: ["", "Soldier", "Refugee", "Civilian", "Medical", "Detective", "Leader", "Scholar", "Operative"] },
  { id: "storyFunction", label: "Story Function", type: "select", category: "I. Core Identity", options: ["", "Protagonist", "Deuteragonist", "Love Interest", "Ally", "Foil", "Rival", "Antagonist", "Mentor", "Witness"] },
  { id: "settingLane", label: "Setting / Lane", type: "text", category: "I. Core Identity", placeholder: "WWII Europe, noir city, fantasy court…" },

  { id: "oceanOpenness", label: "Openness to Experience", type: "select", category: "II. Personality (Big Five)", options: ["", "Low (Traditional, Cautious)", "Moderate", "High (Imaginative, Curious)"] },
  { id: "oceanConscientiousness", label: "Conscientiousness", type: "select", category: "II. Personality (Big Five)", options: ["", "Low (Spontaneous, Careless)", "Moderate", "High (Organized, Disciplined)"] },
  { id: "oceanExtraversion", label: "Extraversion", type: "select", category: "II. Personality (Big Five)", options: ["", "Low (Introverted, Reserved)", "Moderate", "High (Outgoing, Energetic)"] },
  { id: "oceanAgreeableness", label: "Agreeableness", type: "select", category: "II. Personality (Big Five)", options: ["", "Low (Competitive, Suspicious)", "Moderate", "High (Cooperative, Trusting)"] },
  { id: "oceanNeuroticism", label: "Neuroticism", type: "select", category: "II. Personality (Big Five)", options: ["", "Low (Calm, Steady)", "Moderate", "High (Anxious, Volatile)"] },

  { id: "woundTheme", label: "Primary Wound Category", type: "select", category: "III. Emotional Engine", options: ["", "Childhood Trauma / Neglect", "Betrayal", "Failure / Mistake", "Injustice / Victimization", "Loss of a Loved One"] },
  {
    id: "coreLie",
    label: "The Lie They Believe",
    type: "select",
    category: "III. Emotional Engine",
    note: "This list changes based on the wound category. The machine grows teeth, eventually.",
    dynamicOptions: (character) => {
      switch (character.data.woundTheme) {
        case "Betrayal":
          return ["", "People will always use me.", "Trust is a weakness.", "Love is leverage."];
        case "Failure / Mistake":
          return ["", "I ruin what I touch.", "If I try, I will fail again.", "I must be perfect to be safe."];
        case "Childhood Trauma / Neglect":
          return ["", "I am invisible.", "No one is coming for me.", "Need is dangerous."];
        case "Loss of a Loved One":
          return ["", "Everyone I love leaves.", "Joy never lasts.", "Their death is my fault."];
        case "Injustice / Victimization":
          return ["", "The world is built to crush me.", "Safety is an illusion.", "Power is the only shield."];
        default:
          return ["", "I am not enough.", "I must control everything.", "I do not deserve happiness."];
      }
    }
  },
  { id: "greatestFear", label: "Greatest Fear", type: "text", category: "III. Emotional Engine", placeholder: "What disaster are they trying not to repeat?" },
  { id: "outerGoal", label: "Outer Goal", type: "text", category: "III. Emotional Engine", placeholder: "What do they want in the plot?" },
  { id: "innerNeed", label: "Inner Need", type: "text", category: "III. Emotional Engine", placeholder: "What do they actually need, whether they like it or not?" },

  { id: "somaticResponse", label: "Somatic Stress Response", type: "select", category: "IV. Body & Behavior", options: ["", "Hyperarousal (Jittery, Panic, Fast heart rate)", "Dissociation (Numb, Detached, Blank stare)", "Somatic Pain (Headaches, Nausea)", "Chronic Tension (Tight jaw, Raised shoulders)"] },
  { id: "selfProtection", label: "Primary Self-Protection Strategy", type: "select", category: "IV. Body & Behavior", options: ["", "Control", "Withdrawal", "Appeasement", "Aggression", "Performance", "Humor"] },
  { id: "physicalTells", label: "Physical Tells", type: "textarea", category: "IV. Body & Behavior", placeholder: "Scar touching, exit scanning, jaw clenching, pacing…" },
  { id: "viceOrPressureValve", label: "Vice / Pressure Valve", type: "text", category: "IV. Body & Behavior", placeholder: "Drink, prayer, work, cigarettes, ritual cleaning…" },

  { id: "publicSelf", label: "Public Mask", type: "textarea", category: "V. Public vs. Private", placeholder: "How they want to be read." },
  { id: "privateSelf", label: "Private Truth", type: "textarea", category: "V. Public vs. Private", placeholder: "Who they are when nobody is watching." },
  { id: "relationshipPattern", label: "Relationship Pattern", type: "text", category: "V. Public vs. Private", placeholder: "Push-pull, caretaker, rivalrous bond, strategic distance…" },
  { id: "voiceNotes", label: "Voice Notes", type: "textarea", category: "V. Public vs. Private", placeholder: "Cadence, diction, silences, favorite evasions…" },

  { id: "storyPressure", label: "Primary Plot Pressure", type: "text", category: "VI. Plot Engine", placeholder: "What force keeps squeezing them?" },
  { id: "stakes", label: "Stakes", type: "text", category: "VI. Plot Engine", placeholder: "What breaks if they fail?" },
  { id: "changeArc", label: "Target Change Arc", type: "select", category: "VI. Plot Engine", options: ["", "Positive Change", "Negative Change", "Flat / Influence Arc", "Corruption Arc", "Disillusionment Arc"] },
  { id: "turningPoint", label: "Breaking Point / Turn", type: "text", category: "VI. Plot Engine", placeholder: "Which scene or revelation corners them?" }
];

let state = {
  schemaVersion: STATE_VERSION,
  activeCharId: null,
  characters: []
};

const el = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  bindGlobalEvents();
  loadState();

  if (!state.characters.length) {
    const starter = makeCharacter();
    starter.data.name = "New Character";
    state.characters.push(starter);
    state.activeCharId = starter.id;
    saveState();
  }

  renderAll();
}

function cacheElements() {
  el.statusBanner = document.getElementById("status-banner");
  el.characterList = document.getElementById("character-list");
  el.dynamicFormContainer = document.getElementById("dynamic-form-container");
  el.editorTitle = document.getElementById("editor-title");
  el.editorSubtitle = document.getElementById("editor-subtitle");
  el.editorActions = document.getElementById("editor-actions");
  el.newCharacterBtn = document.getElementById("new-character-btn");
  el.exportAllBtn = document.getElementById("export-all-btn");
  el.importRosterInput = document.getElementById("import-roster-input");
  el.memoirUpload = document.getElementById("memoir-upload");
  el.loadingIndicator = document.getElementById("loading-indicator");
  el.analyzeBtn = document.getElementById("analyze-btn");
  el.copyPromptBtn = document.getElementById("copy-prompt-btn");
  el.exportCharacterBtn = document.getElementById("export-character-btn");
  el.duplicateCharacterBtn = document.getElementById("duplicate-character-btn");
  el.deleteCharacterBtn = document.getElementById("delete-character-btn");
}

function bindGlobalEvents() {
  el.newCharacterBtn.addEventListener("click", createNewCharacter);
  el.exportAllBtn.addEventListener("click", exportAll);
  el.importRosterInput.addEventListener("change", importRoster);
  el.analyzeBtn.addEventListener("click", processMemoir);
  el.copyPromptBtn.addEventListener("click", copyAIPrompt);
  el.exportCharacterBtn.addEventListener("click", exportActiveCharacter);
  el.duplicateCharacterBtn.addEventListener("click", duplicateActiveCharacter);
  el.deleteCharacterBtn.addEventListener("click", deleteActiveCharacter);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;

    state = {
      schemaVersion: parsed.schemaVersion || STATE_VERSION,
      activeCharId: parsed.activeCharId || null,
      characters: Array.isArray(parsed.characters) ? parsed.characters : []
    };
  } catch (error) {
    console.error(error);
    showStatus("Saved state could not be read. Starting fresh instead.", "error");
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeCharacter() {
  return {
    id: makeId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      name: "",
      role: "",
      storyFunction: "",
      woundTheme: ""
    }
  };
}

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `char_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getActiveCharacter() {
  return state.characters.find((character) => character.id === state.activeCharId) || null;
}

function createNewCharacter() {
  const character = makeCharacter();
  character.data.name = `New Character ${state.characters.length + 1}`;
  state.characters.unshift(character);
  state.activeCharId = character.id;
  saveState();
  renderAll();
  showStatus("New character created.", "success");
}

function selectCharacter(characterId) {
  state.activeCharId = characterId;
  saveState();
  renderAll();
}

function duplicateActiveCharacter() {
  const active = getActiveCharacter();
  if (!active) return;

  const copy = structuredCloneSafe(active);
  copy.id = makeId();
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = copy.createdAt;
  copy.data.name = `${active.data.name || "Unnamed"} Copy`;

  state.characters.unshift(copy);
  state.activeCharId = copy.id;
  saveState();
  renderAll();
  showStatus("Character duplicated.", "success");
}

function deleteActiveCharacter() {
  const active = getActiveCharacter();
  if (!active) return;

  const okay = window.confirm(`Delete ${active.data.name || "this character"}?`);
  if (!okay) return;

  state.characters = state.characters.filter((character) => character.id !== active.id);

  if (!state.characters.length) {
    const replacement = makeCharacter();
    replacement.data.name = "New Character";
    state.characters.push(replacement);
  }

  state.activeCharId = state.characters[0].id;
  saveState();
  renderAll();
  showStatus("Character deleted.", "success");
}

function updateField(fieldId, value, options = {}) {
  const active = getActiveCharacter();
  if (!active) return;

  active.data[fieldId] = value;
  active.updatedAt = new Date().toISOString();

  if (fieldId === "woundTheme") {
    const coreLieSchema = questionSchema.find((field) => field.id === "coreLie");
    const validOptions = coreLieSchema.dynamicOptions(active);
    if (!validOptions.includes(active.data.coreLie)) {
      active.data.coreLie = "";
    }
  }

  saveState();

  if (fieldId === "name") {
    renderRoster();
    updateHeader();
  }

  if (options.rerender) {
    renderEditor();
  } else {
    updateSummaryOnly();
  }
}

function renderAll() {
  renderRoster();
  renderEditor();
}

function renderRoster() {
  el.characterList.innerHTML = "";

  for (const character of state.characters) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `character-item${character.id === state.activeCharId ? " active" : ""}`;
    button.addEventListener("click", () => selectCharacter(character.id));

    const name = document.createElement("div");
    name.className = "character-name";
    name.textContent = character.data.name || "Unnamed";

    const meta = document.createElement("div");
    meta.className = "character-meta";
    meta.textContent = [character.data.role, character.data.storyFunction].filter(Boolean).join(" • ") || "No role set yet";

    button.append(name, meta);
    el.characterList.appendChild(button);
  }
}

function renderEditor() {
  updateHeader();
  const active = getActiveCharacter();

  el.dynamicFormContainer.innerHTML = "";

  if (!active) {
    el.editorActions.classList.add("hidden");
    const empty = document.createElement("div");
    empty.className = "panel empty-state";
    empty.textContent = "No character selected. Which is a bold workflow choice, but fine.";
    el.dynamicFormContainer.appendChild(empty);
    return;
  }

  el.editorActions.classList.remove("hidden");

  const grouped = groupSchemaByCategory(active);

  for (const [category, fields] of Object.entries(grouped)) {
    const panel = document.createElement("section");
    panel.className = "panel";

    const heading = document.createElement("h3");
    heading.textContent = category;
    panel.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "form-grid";

    for (const field of fields) {
      const formGroup = document.createElement("div");
      formGroup.className = `form-group${field.type === "textarea" ? " full-width" : ""}`;

      const label = document.createElement("label");
      label.setAttribute("for", field.id);
      label.textContent = field.label;
      formGroup.appendChild(label);

      if (field.note) {
        const note = document.createElement("div");
        note.className = "field-note";
        note.textContent = field.note;
        formGroup.appendChild(note);
      }

      const value = active.data[field.id] || "";
      let control;

      if (field.type === "select") {
        control = document.createElement("select");
        const options = field.dynamicOptions ? field.dynamicOptions(active) : field.options;
        for (const optionValue of options) {
          const option = document.createElement("option");
          option.value = optionValue;
          option.textContent = optionValue || "Select…";
          if (optionValue === value) option.selected = true;
          control.appendChild(option);
        }
        control.addEventListener("change", (event) => {
          updateField(field.id, event.target.value, { rerender: Boolean(field.dynamicOptions) || field.id === "woundTheme" });
        });
      } else if (field.type === "textarea") {
        control = document.createElement("textarea");
        control.value = value;
        control.placeholder = field.placeholder || "";
        control.addEventListener("input", (event) => updateField(field.id, event.target.value));
      } else {
        control = document.createElement("input");
        control.type = "text";
        control.value = value;
        control.placeholder = field.placeholder || "";
        control.addEventListener("input", (event) => updateField(field.id, event.target.value));
      }

      control.id = field.id;
      formGroup.appendChild(control);
      grid.appendChild(formGroup);
    }

    panel.appendChild(grid);
    el.dynamicFormContainer.appendChild(panel);
  }

  el.dynamicFormContainer.appendChild(buildSummaryPanel(active));
}

function updateHeader() {
  const active = getActiveCharacter();

  if (!active) {
    el.editorTitle.textContent = "Select or Create";
    el.editorSubtitle.textContent = "Pick a character from the roster or make a new one.";
    return;
  }

  el.editorTitle.textContent = `Editing: ${active.data.name || "Unnamed"}`;
  el.editorSubtitle.textContent = [active.data.role, active.data.storyFunction, active.data.settingLane].filter(Boolean).join(" • ") || "Build the character from the inside out.";
}

function updateSummaryOnly() {
  const existingSummary = document.getElementById("live-summary");
  const active = getActiveCharacter();
  if (!existingSummary || !active) return;
  existingSummary.innerHTML = generateLiveSummary(active);
}

function buildSummaryPanel(character) {
  const panel = document.createElement("section");
  panel.className = "panel";

  const kicker = document.createElement("div");
  kicker.className = "kicker";
  kicker.textContent = "Live Summary";

  const heading = document.createElement("h3");
  heading.textContent = "Character at a Glance";

  const box = document.createElement("div");
  box.className = "summary-box";
  box.id = "live-summary";
  box.innerHTML = generateLiveSummary(character);

  panel.append(kicker, heading, box);
  return panel;
}

function generateLiveSummary(character) {
  const name = escapeHtml(character.data.name || "This character");
  const role = character.data.role ? ` functions primarily as a <strong>${escapeHtml(character.data.role.toLowerCase())}</strong>` : " exists in a state of unfinished menace";
  const storyFunction = character.data.storyFunction ? ` and serves as <strong>${escapeHtml(character.data.storyFunction.toLowerCase())}</strong>` : "";

  const wound = character.data.woundTheme ? ` Their core wound is <strong>${escapeHtml(character.data.woundTheme.toLowerCase())}</strong>.` : "";
  const lie = character.data.coreLie ? ` They operate as if <strong>“${escapeHtml(character.data.coreLie)}”</strong>.` : "";
  const goal = character.data.outerGoal ? ` Outwardly, they want <strong>${escapeHtml(character.data.outerGoal)}</strong>.` : "";
  const need = character.data.innerNeed ? ` Inwardly, they need <strong>${escapeHtml(character.data.innerNeed)}</strong>.` : "";
  const body = character.data.somaticResponse ? ` Under stress, the body goes to <strong>${escapeHtml(character.data.somaticResponse.toLowerCase())}</strong>.` : "";
  const mask = character.data.publicSelf ? ` Public mask: <strong>${escapeHtml(truncate(character.data.publicSelf, 120))}</strong>.` : "";
  const truth = character.data.privateSelf ? ` Private truth: <strong>${escapeHtml(truncate(character.data.privateSelf, 120))}</strong>.` : "";
  const pressure = character.data.storyPressure ? ` Plot pressure arrives through <strong>${escapeHtml(character.data.storyPressure)}</strong>.` : "";
  const arc = character.data.changeArc ? ` Expected arc: <strong>${escapeHtml(character.data.changeArc)}</strong>.` : "";

  const sentence = `<strong>${name}</strong>${role}${storyFunction}.${wound}${lie}${goal}${need}${body}${mask}${truth}${pressure}${arc}`;
  return sentence === `<strong>${name}</strong> exists in a state of unfinished menace.`
    ? "Start filling the codex. The summary will stop sounding like a note from a hostile archivist once there is actual data."
    : sentence;
}

function groupSchemaByCategory(character) {
  return questionSchema.reduce((accumulator, field) => {
    if (field.condition && !field.condition(character)) return accumulator;
    if (!accumulator[field.category]) accumulator[field.category] = [];
    accumulator[field.category].push(field);
    return accumulator;
  }, {});
}

function processMemoir() {
  const active = getActiveCharacter();
  if (!active) {
    showStatus("Create or select a character before importing text.", "error");
    return;
  }

  const file = el.memoirUpload.files[0];
  if (!file) {
    showStatus("Select a .txt file first.", "error");
    return;
  }

  const reader = new FileReader();
  el.analyzeBtn.disabled = true;
  el.loadingIndicator.classList.remove("hidden");
  showStatus("Running the placeholder extractor. It is clever enough to be useful and dumb enough to be honest.", "info");

  reader.onload = (event) => {
    const rawText = typeof event.target.result === "string" ? event.target.result : "";

    window.setTimeout(() => {
      const extracted = heuristicExtraction(rawText);
      Object.assign(active.data, extracted);
      active.updatedAt = new Date().toISOString();
      saveState();
      renderAll();

      el.analyzeBtn.disabled = false;
      el.loadingIndicator.classList.add("hidden");
      el.memoirUpload.value = "";

      const filledFields = Object.keys(extracted).filter((key) => Boolean(extracted[key]));
      showStatus(`Extraction complete. Filled ${filledFields.length} field${filledFields.length === 1 ? "" : "s"}. Replace heuristicExtraction() with a real backend when you want actual model inference.`, "success");
    }, 1200);
  };

  reader.onerror = () => {
    el.analyzeBtn.disabled = false;
    el.loadingIndicator.classList.add("hidden");
    showStatus("The file could not be read.", "error");
  };

  reader.readAsText(file);
}

function heuristicExtraction(rawText) {
  const text = rawText || "";
  const lower = text.toLowerCase();
  const result = {};

  const nameMatch = text.match(/(?:my name is|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/);
  if (nameMatch) result.name = nameMatch[1].trim();

  result.role = firstTruthy([
    includesAny(lower, ["refugee", "fled", "escape", "displaced", "stateless"]) && "Refugee",
    includesAny(lower, ["sergeant", "captain", "private", "platoon", "rifle", "army", "soldier"]) && "Soldier",
    includesAny(lower, ["doctor", "nurse", "surgery", "ward", "medical"]) && "Medical",
    includesAny(lower, ["professor", "archive", "library", "scholar"]) && "Scholar",
    includesAny(lower, ["spy", "surveillance", "cover story", "asset"]) && "Operative"
  ]) || "";

  result.storyFunction = firstTruthy([
    includesAny(lower, ["my journey", "i must", "i need", "my goal"]) && "Protagonist",
    includesAny(lower, ["enemy", "hunter", "villain", "destroy"]) && "Antagonist",
    includesAny(lower, ["friend", "help", "support", "confidant"]) && "Ally",
    includesAny(lower, ["rival", "competitor", "opposed"]) && "Rival"
  ]) || "";

  result.woundTheme = firstTruthy([
    includesAny(lower, ["betray", "used me", "abandoned by", "cheated", "double-cross"]) && "Betrayal",
    includesAny(lower, ["failed", "my fault", "mistake", "ruined", "botched"]) && "Failure / Mistake",
    includesAny(lower, ["ignored", "neglected", "invisible", "childhood", "nobody came"]) && "Childhood Trauma / Neglect",
    includesAny(lower, ["killed", "died", "widow", "grief", "mourning"]) && "Loss of a Loved One",
    includesAny(lower, ["persecuted", "unfair", "accused", "targeted", "victimized", "abuse"]) && "Injustice / Victimization"
  ]) || "";

  if (result.woundTheme) {
    const tempCharacter = { data: { woundTheme: result.woundTheme } };
    const field = questionSchema.find((item) => item.id === "coreLie");
    const dynamicOptions = field.dynamicOptions(tempCharacter).filter(Boolean);
    if (dynamicOptions.length) result.coreLie = dynamicOptions[0];
  }

  result.somaticResponse = firstTruthy([
    includesAny(lower, ["heart raced", "shaking", "jittery", "panic", "couldn't breathe", "hypervigilant"]) && "Hyperarousal (Jittery, Panic, Fast heart rate)",
    includesAny(lower, ["numb", "blank", "detached", "floating", "dissociated"]) && "Dissociation (Numb, Detached, Blank stare)",
    includesAny(lower, ["headache", "nausea", "sick to my stomach", "vomit"]) && "Somatic Pain (Headaches, Nausea)",
    includesAny(lower, ["jaw", "shoulders", "tight", "clenched"]) && "Chronic Tension (Tight jaw, Raised shoulders)"
  ]) || "";

  result.selfProtection = firstTruthy([
    includesAny(lower, ["control", "organized", "perfect", "planned"]) && "Control",
    includesAny(lower, ["withdrew", "silent", "stayed away", "isolated"]) && "Withdrawal",
    includesAny(lower, ["appease", "please", "kept everyone happy"]) && "Appeasement",
    includesAny(lower, ["angry", "lash out", "hit", "fight"]) && "Aggression",
    includesAny(lower, ["performed", "achieved", "excelled", "proved"]) && "Performance",
    includesAny(lower, ["joked", "humor", "laughed it off"]) && "Humor"
  ]) || "";

  const tells = [];
  if (includesAny(lower, ["jaw", "clench"])) tells.push("Jaw clenching");
  if (includesAny(lower, ["exit", "door", "scan"])) tells.push("Exit scanning");
  if (includesAny(lower, ["pace", "pacing"])) tells.push("Pacing");
  if (includesAny(lower, ["scar", "touches face", "rubbed"])) tells.push("Scar or face touching");
  if (includesAny(lower, ["hands shake", "tremble"])) tells.push("Visible hand tremor");
  if (tells.length) result.physicalTells = tells.join(", ");

  result.publicSelf = firstTruthy([
    includesAny(lower, ["cold", "competent", "professional", "controlled"]) && "Controlled, competent, hard to read.",
    includesAny(lower, ["charming", "social", "witty"]) && "Charming and socially agile.",
    includesAny(lower, ["quiet", "watchful", "reserved"]) && "Quiet, observant, withholding."
  ]) || "";

  result.privateSelf = firstTruthy([
    includesAny(lower, ["alone", "afraid", "abandonment", "ashamed"]) && "Afraid of being left, yet allergic to admitting need.",
    includesAny(lower, ["rage", "resentful", "bitter"]) && "Carries stored anger under the surface.",
    includesAny(lower, ["grief", "haunted", "mourning"]) && "Still organized by grief more than they would ever say aloud."
  ]) || "";

  result.outerGoal = firstTruthy([
    includesAny(lower, ["escape", "get out", "survive"]) && "Escape the immediate threat.",
    includesAny(lower, ["prove", "earn", "win", "promotion"]) && "Prove their worth through performance.",
    includesAny(lower, ["find", "locate", "search"]) && "Find what was taken or lost."
  ]) || "";

  result.innerNeed = firstTruthy([
    includesAny(lower, ["trust", "connection", "belong", "love"]) && "Learn that connection is not identical with surrender.",
    includesAny(lower, ["forgive", "guilt", "fault"]) && "Release self-blame.",
    includesAny(lower, ["control", "perfect"]) && "Accept uncertainty without mistaking it for annihilation."
  ]) || "";

  return Object.fromEntries(Object.entries(result).filter(([, value]) => value));
}

function exportActiveCharacter() {
  const active = getActiveCharacter();
  if (!active) return;
  downloadJson(active, `${slugify(active.data.name || "character")}_codex.json`);
}

function exportAll() {
  const payload = {
    schemaVersion: STATE_VERSION,
    activeCharId: state.activeCharId,
    characters: state.characters
  };
  downloadJson(payload, "character_codex_roster.json");
  showStatus("Roster downloaded.", "success");
}

function importRoster(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    try {
      const raw = typeof loadEvent.target.result === "string" ? loadEvent.target.result : "";
      const parsed = JSON.parse(raw);
      const imported = normalizeImportedData(parsed);
      if (!imported.characters.length) {
        throw new Error("No character records found.");
      }

      state = imported;
      saveState();
      renderAll();
      showStatus(`Imported ${state.characters.length} character${state.characters.length === 1 ? "" : "s"}.`, "success");
    } catch (error) {
      console.error(error);
      showStatus("That JSON file is not in a usable codex format.", "error");
    } finally {
      event.target.value = "";
    }
  };

  reader.onerror = () => {
    showStatus("The import file could not be read.", "error");
    event.target.value = "";
  };

  reader.readAsText(file);
}

function normalizeImportedData(parsed) {
  if (Array.isArray(parsed)) {
    return {
      schemaVersion: STATE_VERSION,
      activeCharId: parsed[0]?.id || null,
      characters: parsed
    };
  }

  return {
    schemaVersion: parsed.schemaVersion || STATE_VERSION,
    activeCharId: parsed.activeCharId || parsed.characters?.[0]?.id || null,
    characters: Array.isArray(parsed.characters) ? parsed.characters : []
  };
}

async function copyAIPrompt() {
  const active = getActiveCharacter();
  if (!active) return;

  const prompt = formatAIPrompt(active);

  try {
    await navigator.clipboard.writeText(prompt);
    showStatus("AI prompt copied.", "success");
  } catch (error) {
    console.error(error);
    showStatus("Clipboard write failed. Your browser is being difficult again.", "error");
  }
}

function formatAIPrompt(character) {
  const lines = [];
  lines.push(`You are going to act as a character named ${character.data.name || "Unnamed"}.`);
  lines.push("");
  lines.push("### Character Codex");

  for (const field of questionSchema) {
    const value = character.data[field.id];
    if (!value) continue;
    lines.push(`- **${field.label}:** ${value}`);
  }

  return lines.join("\n");
}

function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showStatus(message, type = "info") {
  el.statusBanner.textContent = message;
  el.statusBanner.className = `status-banner ${type}`;
}

function firstTruthy(values) {
  return values.find(Boolean);
}

function includesAny(haystack, needles) {
  return needles.some((needle) => haystack.includes(needle));
}

function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text || "";
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
