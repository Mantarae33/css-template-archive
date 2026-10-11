// Template page: reads ?t=slug, builds the page, auto-splits code.txt into CSS / HTML views.
const root = document.getElementById("template-root");
const slug = new URLSearchParams(location.search).get("t");

// Pulls every <style>...</style> block out as the CSS view; whatever is left is the HTML view.
function splitCode(source) {
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const css = [];
  let match;
  while ((match = styleRe.exec(source))) css.push(match[1].trim());
  const html = source.replace(styleRe, "").trim();
  return { css: css.join("\n\n"), html };
}

function buildSlider(t) {
  let index = 0;
  const large = root.querySelector(".large");
  const thumbs = [...root.querySelectorAll(".thumbs img")];

  function show(i) {
    index = (i + t.previews.length) % t.previews.length;
    large.src = t.previews[index];
    thumbs.forEach((el, n) => el.classList.toggle("active", n === index));
  }
  root.querySelector(".prev").addEventListener("click", () => show(index - 1));
  root.querySelector(".next").addEventListener("click", () => show(index + 1));
  thumbs.forEach((el, n) => el.addEventListener("click", () => show(n)));
  show(0);
}

async function buildCode(t) {
  const pre = root.querySelector("#code-view");
  const tabs = root.querySelectorAll("[data-view]");
  const copyBtns = root.querySelectorAll("[data-copy]");

  const res = await fetch(`data/${t.slug}/code.txt`);
  if (!res.ok) {
    pre.querySelector("code").textContent = "Code file not found.";
    return;
  }
  const raw = (await res.text()).trim();
  const parts = splitCode(raw);

  // What each copy button puts on the clipboard
  const copyText = { css: parts.css, html: parts.html, all: raw };

  function show(v) {
    pre.querySelector("code").textContent =
      parts[v] || `(no ${v.toUpperCase()} in this template)`;
    tabs.forEach((b) => b.classList.toggle("active", b.dataset.view === v));
  }
  tabs.forEach((b) => b.addEventListener("click", () => show(b.dataset.view)));

  copyBtns.forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener("click", async () => {
      const text = copyText[btn.dataset.copy];
      if (!text) {
        btn.textContent = "Nothing to copy";
      } else {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied!";
      }
      setTimeout(() => (btn.textContent = label), 1500);
    });
  });

  show("css");
}

function render(t) {
  document.title = t.title;
  const isPaid = t.price === "paid";

  root.innerHTML = `
    <h1>${t.title}</h1>
    <p class="lead">${t.description}</p>

    <div class="slider">
      <img class="large" alt="${t.title} preview">
      <button class="nav prev" aria-label="Previous">&#8249;</button>
      <button class="nav next" aria-label="Next">&#8250;</button>
    </div>
    <div class="thumbs">
      ${t.previews.map((src, n) => `<img src="${src}" alt="Preview ${n + 1}">`).join("")}
    </div>

    <ul class="notes">${(t.notes || []).map((n) => `<li>${n}</li>`).join("")}</ul>

    ${
      isPaid
        ? `<p><a class="btn" href="${t.listing}" target="_blank" rel="noopener">Get this template</a></p>`
        : `<section class="code-box">
            <div class="code-head">
              <h2># Code</h2>
              <div class="tabs">
                <button class="btn ghost" data-view="css">CSS</button>
                <button class="btn ghost" data-view="html">HTML</button>
              </div>
            </div>
            <pre id="code-view"><code></code></pre>
            <div class="code-foot">
              <button class="btn ghost" data-copy="css">Copy CSS</button>
              <button class="btn ghost" data-copy="html">Copy HTML</button>
              <button class="btn" data-copy="all">Copy all</button>
            </div>
          </section>`
    }
  `;

  buildSlider(t);
  if (!isPaid) buildCode(t);
}

loadTemplates()
  .then((all) => {
    const t = all.find((x) => x.slug === slug);
    if (!t) {
      root.innerHTML =
        "<h1>Template not found</h1><p><a href='templates.html'>Back to templates</a></p>";
      return;
    }
    render(t);
  })
  .catch((err) => (root.textContent = err.message));