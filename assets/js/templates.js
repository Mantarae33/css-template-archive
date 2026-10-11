// Gallery: search + free/paid filter + tag filter.
const state = { all: [], query: "", price: "all", tag: null };

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const tagBar = document.getElementById("tag-bar");

function cardHTML(t) {
  const isFree = t.price === "free";
  const badge = isFree
    ? '<span class="badge">Free</span>'
    : `<span class="badge badge-paid">${t.price_label || "Paid"}</span>`;

  return `
    <article class="card">
      <div class="banner">
        <img src="${t.banner}" alt="${t.title} banner" loading="lazy">
        ${badge}
      </div>
      <div class="body">
        <h3><span class="accent">#</span> ${t.title}</h3>
        <a href="template.html?t=${t.slug}">&gt; View Template</a>
      </div>
    </article>`;
}

function render() {
  const q = state.query.trim().toLowerCase();
  const list = state.all.filter((t) => {
    const matchesSearch = !q || t.title.toLowerCase().includes(q);
    const matchesPrice = state.price === "all" || t.price === state.price;
    const matchesTag = !state.tag || t.tags.includes(state.tag);
    return matchesSearch && matchesPrice && matchesTag;
  });
  grid.innerHTML = list.map(cardHTML).join("");
  empty.hidden = list.length > 0;
}

function renderTags() {
  const tags = [...new Set(state.all.flatMap((t) => t.tags))].sort();
  tagBar.innerHTML = tags
    .map((tag) => `<button class="tag ${state.tag === tag ? "active" : ""}" data-tag="${tag}">${tag}</button>`)
    .join("");
}

tagBar.addEventListener("click", (e) => {
  const tag = e.target.dataset.tag;
  if (!tag) return;
  state.tag = state.tag === tag ? null : tag; // click again to clear
  renderTags();
  render();
});

document.getElementById("search").addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

document.getElementById("price-filter").addEventListener("change", (e) => {
  state.price = e.target.value;
  render();
});

loadTemplates()
  .then((data) => {
    state.all = data;
    renderTags();
    render();
  })
  .catch((err) => {
    grid.innerHTML = `<p class="empty">${err.message}</p>`;
  });
