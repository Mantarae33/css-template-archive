// Shared bits: header + help tooltip, used on every page.
const SITE_NAME = "Username's CSS"; // <- change me

function renderHeader() {
  const mount = document.getElementById("site-header");
  if (!mount) return;
  const page = document.body.dataset.page;
  mount.innerHTML = `
    <header class="site-header">
      <a class="logo" href="index.html">${SITE_NAME}</a>
      <nav>
        <a href="index.html" class="${page === "home" ? "active" : ""}">Home</a>
        <a href="templates.html" class="${page === "templates" || page === "template" ? "active" : ""}">Templates</a>
      </nav>
    </header>`;
}

function renderHelp() {
  const btn = document.createElement("button");
  btn.className = "help-btn";
  btn.textContent = "?";
  btn.setAttribute("aria-label", "How to use the code");

  const pop = document.createElement("div");
  pop.className = "help-pop";
  pop.hidden = true;
  pop.innerHTML = `
    <h3>Using the code</h3>
    <ol>
      <li>Open a template and pick the <b>CSS</b> or <b>HTML</b> tab.</li>
      <li>Press <b>Copy all</b>.</li>
      <li>Paste it in the JanitorAI About me section in <a href="https://janitorai.com/profile-settings" target="_blank" rel="noopener">Settings</a>.</li>
      <li>Keep the credit in place.</li>
    </ol>`; // <- edit these steps

  btn.addEventListener("click", () => (pop.hidden = !pop.hidden));
  document.body.append(pop, btn);
}
function renderFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <p> Github code made by <a href="https://janitorai.com/profiles/25241a53-d996-45de-862d-f2ca87863b26_profile-of-manta-rae" target="_blank" rel="noopener">Manta</a> &copy; ${new Date().getFullYear()}</p>
  `;
  document.body.append(footer);
}

renderHeader();
renderFooter();
renderHelp();

// Loads data/index.json (list of folder names), then each folder's info.json.
// Used by the gallery and the template page.
async function loadTemplates() {
  const res = await fetch("data/index.json");
  if (!res.ok) throw new Error("Could not load data/index.json");
  const slugs = await res.json();

  const all = await Promise.all(
    slugs.map(async (slug) => {
      const r = await fetch(`data/${slug}/info.json`);
      if (!r.ok) {
        console.warn(`Missing or unreadable info.json for "${slug}"`);
        return null;
      }
      const t = await r.json();
      const base = `data/${slug}/`;
      return {
        ...t,
        slug,
        banner: base + t.banner,
        previews: (t.previews || []).map((p) => base + p),
      };
    })
  );

  return all.filter(Boolean); // skips any folder with a typo
}