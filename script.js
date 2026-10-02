// ---------- Constants ----------
const CATEGORIES = ["All", "Web Development", "App Development", "AI / ML", "Tools"];
const KEYS = { custom: "devresources:custom", votes: "devresources:votes", voted: "devresources:voted", theme: "devresources:theme" };

const DEFAULT_RESOURCES = [
  { id: "mdn", title: "MDN Web Docs", category: "Web Development", url: "https://developer.mozilla.org", description: "The definitive reference for HTML, CSS and JavaScript, with guides and browser compatibility tables.", votes: 128 },
  { id: "react", title: "React Documentation", category: "Web Development", url: "https://react.dev", description: "Official React docs with interactive examples, a quick-start tutorial and in-depth guides.", votes: 112 },
  { id: "webdev", title: "web.dev", category: "Web Development", url: "https://web.dev", description: "Google's guidance on performance, accessibility and modern web best practices.", votes: 74 },
  { id: "freecodecamp", title: "freeCodeCamp", category: "Web Development", url: "https://www.freecodecamp.org", description: "Free, project-based curriculum covering web development, data and more, with certifications.", votes: 96 },
  { id: "flutter", title: "Flutter Docs", category: "App Development", url: "https://docs.flutter.dev", description: "Build beautiful cross-platform apps for mobile, web and desktop from a single codebase.", votes: 69 },
  { id: "android", title: "Android Developers", category: "App Development", url: "https://developer.android.com", description: "Official guides, Jetpack libraries and Kotlin courses for building Android apps.", votes: 58 },
  { id: "reactnative", title: "React Native", category: "App Development", url: "https://reactnative.dev", description: "Create native iOS and Android apps using React and JavaScript.", votes: 52 },
  { id: "kaggle", title: "Kaggle", category: "AI / ML", url: "https://www.kaggle.com", description: "Datasets, notebooks and competitions, plus short hands-on micro-courses in ML.", votes: 88 },
  { id: "tensorflow", title: "TensorFlow", category: "AI / ML", url: "https://www.tensorflow.org", description: "End-to-end open source machine learning platform with tutorials and a model garden.", votes: 81 },
  { id: "huggingface", title: "Hugging Face", category: "AI / ML", url: "https://huggingface.co", description: "Hub for open models, datasets and Spaces, with free courses on transformers and NLP.", votes: 77 },
  { id: "github", title: "GitHub", category: "Tools", url: "https://github.com", description: "Host code, collaborate through pull requests and discover open source projects.", votes: 134 },
  { id: "figma", title: "Figma", category: "Tools", url: "https://www.figma.com", description: "Collaborative interface design tool for wireframes, prototypes and design systems.", votes: 91 },
  { id: "postman", title: "Postman", category: "Tools", url: "https://www.postman.com", description: "Design, test and document APIs with collections, environments and automated tests.", votes: 66 },
  { id: "vscode", title: "Visual Studio Code", category: "Tools", url: "https://code.visualstudio.com", description: "Fast, extensible code editor with built-in Git, debugging and a huge extension marketplace.", votes: 105 }
];

// ---------- localStorage helpers ----------
function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

// ---------- State ----------
const state = {
  custom: load(KEYS.custom, []),   // resources added by the user
  votes: load(KEYS.votes, {}),     // { id: count } overrides for vote counts
  voted: load(KEYS.voted, []),     // ids this browser has upvoted
  category: "All",
  query: ""
};

// ---------- Elements ----------
const $ = (id) => document.getElementById(id);
const grid = $("resource-grid"), emptyState = $("empty-state"), countEl = $("result-count");
const filtersEl = $("filters"), heroSearch = $("hero-search"), listSearch = $("resource-search");
const form = $("resource-form"), toast = $("toast");

// ---------- Data helpers ----------
const allResources = () => [...state.custom, ...DEFAULT_RESOURCES];
const voteCount = (r) => (state.votes[r.id] ?? r.votes ?? 0);
const getDomain = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

function getVisibleResources() {
  const q = state.query.trim().toLowerCase();
  return allResources().filter((r) => {
    const inCategory = state.category === "All" || r.category === state.category;
    const matches = !q || `${r.title} ${r.description} ${r.category}`.toLowerCase().includes(q);
    return inCategory && matches;
  });
}

// ---------- Rendering ----------
function renderFilters() {
  filtersEl.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (cat === state.category ? " active" : "");
    btn.textContent = cat;
    btn.setAttribute("aria-pressed", cat === state.category);
    btn.addEventListener("click", () => { state.category = cat; renderFilters(); renderResources(); });
    filtersEl.appendChild(btn);
  });
}

function createCard(r) {
  const card = document.createElement("article");
  card.className = "card resource-card";
  const voted = state.voted.includes(r.id);

  const badge = document.createElement("span"); badge.className = "badge"; badge.textContent = r.category;
  const title = document.createElement("h3"); title.textContent = r.title;
  const desc = document.createElement("p"); desc.className = "desc"; desc.textContent = r.description;
  const domain = document.createElement("p"); domain.className = "domain"; domain.textContent = getDomain(r.url);

  const actions = document.createElement("div"); actions.className = "card-actions";
  const open = document.createElement("a");
  open.className = "btn btn-primary btn-sm"; open.href = r.url; open.target = "_blank"; open.rel = "noopener noreferrer";
  open.textContent = "Open Resource"; open.setAttribute("aria-label", `Open ${r.title} in a new tab`);

  const vote = document.createElement("button");
  vote.type = "button"; vote.className = "vote" + (voted ? " voted" : "");
  vote.setAttribute("aria-pressed", voted);
  vote.setAttribute("aria-label", `${voted ? "Remove upvote from" : "Upvote"} ${r.title}`);
  vote.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="${voted ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V6M5 12l7-7 7 7"/></svg><span></span>`;
  vote.querySelector("span").textContent = voteCount(r);
  vote.addEventListener("click", () => toggleVote(r, vote));

  actions.append(open, vote);
  card.append(badge, title, desc, domain, actions);
  return card;
}

function renderResources() {
  const list = getVisibleResources();
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  list.forEach((r) => frag.appendChild(createCard(r)));
  grid.appendChild(frag);
  emptyState.hidden = list.length > 0;
  countEl.textContent = `${list.length} ${list.length === 1 ? "resource" : "resources"}`;
}

// ---------- Upvotes ----------
function toggleVote(resource, button) {
  const alreadyVoted = state.voted.includes(resource.id);
  const current = voteCount(resource);
  if (alreadyVoted) {
    state.voted = state.voted.filter((id) => id !== resource.id);
    state.votes[resource.id] = Math.max(0, current - 1);
  } else {
    state.voted.push(resource.id);
    state.votes[resource.id] = current + 1;
  }
  save(KEYS.votes, state.votes); save(KEYS.voted, state.voted);
  renderResources();
  if (!alreadyVoted) showToast(`Upvoted “${resource.title}”`);
  // Animate the new button after re-render
  if (!alreadyVoted) {
    const index = getVisibleResources().findIndex((r) => r.id === resource.id);
    const fresh = grid.children[index]?.querySelector(".vote");
    if (fresh) { fresh.classList.add("pop"); fresh.focus(); }
  }
}

// ---------- Search ----------
function onSearch(value) {
  state.query = value;
  heroSearch.value = value; listSearch.value = value;
  renderResources();
}
heroSearch.addEventListener("input", (e) => {
  onSearch(e.target.value);
});
heroSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); $("resources").scrollIntoView({ behavior: "smooth" }); }
});
listSearch.addEventListener("input", (e) => onSearch(e.target.value));
$("reset-filters").addEventListener("click", () => {
  state.category = "All"; renderFilters(); onSearch("");
});

// ---------- Add resource form ----------
const fields = ["title", "description", "category", "url"];
const descInput = $("description");
descInput.addEventListener("input", () => { $("char-count").textContent = `${descInput.value.length}/160`; });

function validate(values) {
  const errors = {};
  if (values.title.length < 3) errors.title = "Title must be at least 3 characters.";
  if (values.description.length < 10) errors.description = "Please write at least 10 characters.";
  if (!values.category) errors.category = "Choose a category.";
  try {
    const u = new URL(values.url);
    if (!["http:", "https:"].includes(u.protocol)) throw new Error();
  } catch { errors.url = "Enter a valid URL starting with http:// or https://"; }
  return errors;
}
function showErrors(errors) {
  fields.forEach((name) => {
    $(name).closest(".field").classList.toggle("invalid", Boolean(errors[name]));
    $(`${name}-error`).textContent = errors[name] || "";
    $(name).setAttribute("aria-invalid", Boolean(errors[name]));
  });
}
fields.forEach((name) => $(name).addEventListener("input", () => {
  if ($(name).closest(".field").classList.contains("invalid")) {
    $(name).closest(".field").classList.remove("invalid"); $(`${name}-error`).textContent = "";
  }
}));

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const values = Object.fromEntries(fields.map((n) => [n, $(n).value.trim()]));
  const errors = validate(values);
  showErrors(errors);
  const firstError = fields.find((n) => errors[n]);
  if (firstError) { $(firstError).focus(); return; }

  const duplicate = allResources().some((r) => getDomain(r.url) === getDomain(values.url) && r.title.toLowerCase() === values.title.toLowerCase());
  if (duplicate) { showErrors({ title: "This resource is already listed." }); $("title").focus(); return; }

  const resource = { id: `custom-${Date.now()}`, ...values, votes: 0 };
  state.custom.unshift(resource);
  save(KEYS.custom, state.custom);
  form.reset(); $("char-count").textContent = "0/160";
  state.category = "All"; renderFilters(); onSearch("");
  showToast("Resource added successfully");
  $("resources").scrollIntoView({ behavior: "smooth" });
});

// ---------- Toast ----------
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// ---------- Theme ----------
const themeBtn = $("theme-toggle");
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
const preferredTheme = load(KEYS.theme, window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(preferredTheme);
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next); save(KEYS.theme, next);
});

// ---------- Mobile menu ----------
const menuBtn = $("menu-toggle"), navMenu = $("nav-menu");
function setMenu(open) {
  navMenu.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn.addEventListener("click", () => setMenu(!navMenu.classList.contains("open")));
navMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ---------- Active nav link on scroll ----------
const navLinks = [...navMenu.querySelectorAll("a")];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
["home", "resources", "add"].forEach((id) => observer.observe($(id)));

// ---------- Init ----------
$("year").textContent = new Date().getFullYear();
renderFilters();
renderResources();
