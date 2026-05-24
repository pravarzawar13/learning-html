/* =========================================================
   HTML Playground — editor, live preview, friendly linter
   ========================================================= */
"use strict";

/* ---------- DOM ---------- */
const code      = document.getElementById("code");
const gutter    = document.getElementById("gutter");
const preview   = document.getElementById("preview");
const report    = document.getElementById("report");
const pulse     = document.getElementById("pulse");
const clearBtn  = document.getElementById("format-clear");

const toolbox      = document.getElementById("toolbox");
const toolboxBtn   = document.getElementById("toolbox-toggle");
const toolboxClose = document.getElementById("toolbox-close");
const scrim        = document.getElementById("scrim");
const snippetsEl   = document.getElementById("snippets");
const cheatEl      = document.getElementById("cheatsheet");

const STORAGE_KEY = "html-playground:code";

/* ---------- Reference data ---------- */

// Tags that have no closing tag — never flag them as "unclosed".
const VOID_TAGS = new Set([
  "area","base","br","col","embed","hr","img","input",
  "link","meta","param","source","track","wbr"
]);

// Recognised modern HTML tags.
const KNOWN_TAGS = new Set([
  "html","head","title","meta","link","style","script","base","body",
  "header","nav","main","section","article","aside","footer","hgroup","search",
  "h1","h2","h3","h4","h5","h6","p","div","span","a","br","hr",
  "ul","ol","li","dl","dt","dd","menu",
  "img","figure","figcaption","picture","source","audio","video","track",
  "table","thead","tbody","tfoot","tr","th","td","caption","colgroup","col",
  "form","input","textarea","button","select","option","optgroup","label",
  "fieldset","legend","datalist","output","progress","meter",
  "em","strong","b","i","u","s","small","mark","sub","sup","code","pre",
  "kbd","samp","var","blockquote","q","cite","abbr","address","time","data",
  "bdi","bdo","wbr","ins","del","details","summary","dialog",
  "canvas","svg","iframe","embed","object","param","map","area",
  "template","slot","ruby","rt","rp"
]);

// Deprecated / old tags → friendly modern advice.
const DEPRECATED = {
  center:   "Center things with CSS instead: <code>text-align: center;</code> or <code>margin: auto;</code>.",
  font:     "Style text with CSS instead — set <code>color</code> and <code>font-family</code> in a stylesheet.",
  marquee:  "Scrolling text is old. If you really want motion, use CSS animations.",
  blink:    "The &lt;blink&gt; tag was removed from browsers. Use CSS animations if you need attention.",
  big:      "Use CSS <code>font-size</code> instead of &lt;big&gt;.",
  strike:   "Use &lt;del&gt; (for removed text) or &lt;s&gt; (no longer accurate) instead.",
  tt:       "Use &lt;code&gt; for code, or set a monospace font with CSS.",
  acronym:  "Use &lt;abbr&gt; instead — it works for all abbreviations.",
  frame:    "Frames are obsolete. Use &lt;iframe&gt; or modern CSS layout.",
  frameset: "Framesets are obsolete. Use CSS layout (flexbox/grid) instead.",
  basefont: "Set base fonts with CSS on the &lt;body&gt; instead.",
  dir:      "Use a normal list &lt;ul&gt; instead of &lt;dir&gt;.",
  applet:   "Use &lt;object&gt; or modern embedding instead of &lt;applet&gt;.",
  nobr:     "Prevent wrapping with CSS <code>white-space: nowrap;</code> instead."
};

/* Starter snippets — full documents to load and tinker with. */
const SNIPPETS = [
  {
    title: "Hello page",
    desc: "A tiny complete page",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Page</title>
</head>
<body>
  <h1>Hello, world!</h1>
  <p>I am learning HTML. 🌱</p>
</body>
</html>`
  },
  {
    title: "Headings",
    desc: "h1 down to h3",
    html: `<h1>Big heading</h1>
<h2>Medium heading</h2>
<h3>Small heading</h3>
<p>Headings give your page an outline.</p>`
  },
  {
    title: "A list",
    desc: "Bullets & numbers",
    html: `<h2>My favourite fruits</h2>
<ul>
  <li>Mango</li>
  <li>Banana</li>
  <li>Apple</li>
</ul>

<h2>Steps</h2>
<ol>
  <li>Wake up</li>
  <li>Brush teeth</li>
  <li>Code!</li>
</ol>`
  },
  {
    title: "A link",
    desc: "Go somewhere",
    html: `<p>
  Visit
  <a href="https://developer.mozilla.org/">MDN Web Docs</a>
  to learn more.
</p>`
  },
  {
    title: "An image",
    desc: "With alt text",
    html: `<figure>
  <img
    src="https://picsum.photos/320/200"
    alt="A random photo"
    width="320"
  >
  <figcaption>A photo with a caption.</figcaption>
</figure>`
  },
  {
    title: "A table",
    desc: "Rows & columns",
    html: `<table border="1">
  <thead>
    <tr><th>Name</th><th>Age</th></tr>
  </thead>
  <tbody>
    <tr><td>Pravar</td><td>10</td></tr>
    <tr><td>Asha</td><td>12</td></tr>
  </tbody>
</table>`
  }
];

/* Cheatsheet — click to insert a small example at the cursor. */
const CHEATS = [
  { tag: "h1",         desc: "Page heading",          ex: `<h1>My heading</h1>\n` },
  { tag: "p",          desc: "Paragraph of text",     ex: `<p>Some text here.</p>\n` },
  { tag: "a",          desc: "Link to a page",        ex: `<a href="https://example.com">link text</a>` },
  { tag: "img",        desc: "Picture (needs alt)",   ex: `<img src="cat.jpg" alt="A cat">` },
  { tag: "ul / li",    desc: "Bulleted list",         ex: `<ul>\n  <li>One</li>\n  <li>Two</li>\n</ul>\n` },
  { tag: "ol / li",    desc: "Numbered list",         ex: `<ol>\n  <li>First</li>\n  <li>Second</li>\n</ol>\n` },
  { tag: "strong",     desc: "Important (bold)",      ex: `<strong>important</strong>` },
  { tag: "em",         desc: "Emphasis (italic)",     ex: `<em>emphasised</em>` },
  { tag: "br",         desc: "Line break",            ex: `<br>\n` },
  { tag: "div",        desc: "A box / container",     ex: `<div>\n  content\n</div>\n` },
  { tag: "button",     desc: "A clickable button",    ex: `<button>Click me</button>` },
  { tag: "input",      desc: "A text box",            ex: `<input type="text" placeholder="Type...">` },
  { tag: "table",      desc: "A data table",          ex: `<table border="1">\n  <tr><th>A</th><th>B</th></tr>\n  <tr><td>1</td><td>2</td></tr>\n</table>\n` },
  { tag: "figure",     desc: "Image with caption",    ex: `<figure>\n  <img src="pic.jpg" alt="">\n  <figcaption>Caption</figcaption>\n</figure>\n` }
];

/* HTMLHint rules tuned for beginners + friendly message overrides. */
const HINT_RULES = {
  "tag-pair": true,
  "tagname-lowercase": true,
  "attr-no-duplication": true,
  "id-unique": true,
  "src-not-empty": true,
  "attr-unsafe-chars": true,
  "spec-char-escape": false,
  "attr-value-double-quotes": false,
  "doctype-first": false,
  "title-require": false
};

const HINT_FRIENDLY = {
  "tag-pair": (m) =>
    `Looks like a tag isn't closed properly. Every <code>&lt;tag&gt;</code> usually needs a matching <code>&lt;/tag&gt;</code>.`,
  "tagname-lowercase": () =>
    `Write tag names in lowercase, like <code>&lt;div&gt;</code> not <code>&lt;DIV&gt;</code>.`,
  "attr-no-duplication": () =>
    `This tag has the same attribute twice. Keep just one of them.`,
  "id-unique": () =>
    `Two elements share the same <code>id</code>. Each <code>id</code> should be unique on the page.`,
  "src-not-empty": () =>
    `An <code>src</code> (or similar) attribute is empty — give it a value, like a file name or URL.`,
  "attr-unsafe-chars": () =>
    `There's an unusual character inside an attribute. Double-check the quotes around it.`
};

/* ---------- Helpers ---------- */

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === "\n") line++;
  }
  return line;
}

// Tiny edit-distance for "did you mean" suggestions.
function distance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function suggestTag(name) {
  let best = null, bestD = Infinity;
  for (const t of KNOWN_TAGS) {
    const d = distance(name, t);
    if (d < bestD) { bestD = d; best = t; }
  }
  return bestD <= 2 ? best : null;
}

/* ---------- Custom beginner rules ---------- */
// Returns array of { line, severity, title, detail }.
function customRules(src) {
  const out = [];
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;

  let m;
  let lastHeading = 0;          // for heading-order checks
  let sawImgNoAlt = false;
  const seen = { html: false, head: false, title: false, body: false, htmlLang: false };

  while ((m = tagRe.exec(src)) !== null) {
    const isClose = m[0][1] === "/";
    const name = m[1].toLowerCase();
    const attrs = m[2] || "";
    const line = lineOf(src, m.index);

    if (name === "html") { seen.html = true; if (/\blang\s*=/.test(attrs)) seen.htmlLang = true; }
    if (name === "head") seen.head = true;
    if (name === "title") seen.title = true;
    if (name === "body") seen.body = true;

    if (isClose) continue; // remaining checks are for opening tags

    // 1) Deprecated tags
    if (DEPRECATED[name]) {
      out.push({
        line, severity: "warning",
        title: `<code>&lt;${name}&gt;</code> is an old, deprecated tag`,
        detail: DEPRECATED[name]
      });
      continue;
    }

    // 2) Unknown / misspelled tags  (ignore SVG/MathML inner tags loosely)
    if (!KNOWN_TAGS.has(name) && !name.includes("-")) {
      const guess = suggestTag(name);
      out.push({
        line, severity: "warning",
        title: `I don't recognise the tag <code>&lt;${name}&gt;</code>`,
        detail: guess
          ? `Did you mean <code>&lt;${guess}&gt;</code>? Browsers ignore unknown tags.`
          : `This isn't a standard HTML tag, so browsers will ignore it.`
      });
    }

    // 3) <img> missing alt
    if (name === "img" && !/\balt\s*=/.test(attrs)) {
      sawImgNoAlt = true;
      out.push({
        line, severity: "tip",
        title: `Add <code>alt</code> text to your image`,
        detail: `<code>alt="..."</code> describes the picture for screen readers and shows if the image fails to load.`
      });
    }

    // 4) <a> missing href
    if (name === "a" && !/\bhref\s*=/.test(attrs)) {
      out.push({
        line, severity: "tip",
        title: `This link has no <code>href</code>`,
        detail: `Add <code>href="..."</code> so the link actually goes somewhere.`
      });
    }

    // 5) Heading order
    const hMatch = /^h([1-6])$/.exec(name);
    if (hMatch) {
      const level = Number(hMatch[1]);
      if (lastHeading && level > lastHeading + 1) {
        out.push({
          line, severity: "tip",
          title: `Heading jumps from h${lastHeading} to h${level}`,
          detail: `Try not to skip heading levels — go h${lastHeading} → h${lastHeading + 1} so the page outline stays tidy.`
        });
      }
      lastHeading = level;
    }
  }

  // Document-level tips (only nudge once the doc is taking shape)
  if (seen.html && !seen.htmlLang) {
    out.push({
      line: 1, severity: "tip",
      title: `Add a language to <code>&lt;html&gt;</code>`,
      detail: `Write <code>&lt;html lang="en"&gt;</code> so browsers and screen readers know the language.`
    });
  }
  if (seen.head && !seen.title) {
    out.push({
      line: 1, severity: "tip",
      title: `Your page has no <code>&lt;title&gt;</code>`,
      detail: `Add a <code>&lt;title&gt;My page&lt;/title&gt;</code> inside <code>&lt;head&gt;</code> — it shows on the browser tab.`
    });
  }

  return out;
}

/* ---------- HTMLHint rules → friendly messages ---------- */
// HTMLHint's global shape changed across versions: older builds expose
// `window.HTMLHint.verify`, while 1.9.x exposes the namespace as
// `window.HTMLHint` with the linter at `window.HTMLHint.HTMLHint`. Resolve
// whichever is present so a CDN version bump can't silently break checking.
function getLinter() {
  const NS = window.HTMLHint;
  if (!NS) return null;
  if (typeof NS.verify === "function") return NS;
  if (NS.HTMLHint && typeof NS.HTMLHint.verify === "function") return NS.HTMLHint;
  return null;
}

function structuralRules(src) {
  const linter = getLinter();
  if (!linter) return null; // CDN not ready (or blocked)
  let results;
  try {
    results = linter.verify(src, HINT_RULES);
  } catch (e) {
    return [];
  }
  return results.map((r) => {
    const id = r.rule && r.rule.id;
    const friendly = HINT_FRIENDLY[id];
    return {
      line: r.line || 1,
      severity: r.type === "error" ? "error" : "warning",
      title: friendly ? friendly(r) : (r.message || "Something looks off here."),
      detail: friendly ? "" : ""
    };
  });
}

/* ---------- Render report ---------- */
const SEV_RANK = { error: 0, warning: 1, tip: 2 };

function renderReport(items, structuralAvailable) {
  report.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "report-empty";
    li.innerHTML = `Looks good! 🎉 <span class="sub">No mistakes spotted — keep going.</span>`;
    report.appendChild(li);
  } else {
    items
      .slice()
      .sort((a, b) => (a.line - b.line) || (SEV_RANK[a.severity] - SEV_RANK[b.severity]))
      .forEach((it, i) => {
        const li = document.createElement("li");
        li.className = `report-item sev-${it.severity}`;
        li.style.animationDelay = `${Math.min(i * 0.03, 0.3)}s`;
        const icon = it.severity === "error" ? "🔴" : it.severity === "warning" ? "🟡" : "🔵";
        li.innerHTML = `
          <span class="loc">line ${it.line}</span>
          <div class="body">
            <div class="title">${icon} ${it.title}</div>
            ${it.detail ? `<p class="detail">${it.detail}</p>` : ""}
          </div>`;
        report.appendChild(li);
      });
  }

  if (!structuralAvailable) {
    const note = document.createElement("li");
    note.className = "report-note";
    note.textContent = "ℹ️ Structural checking (unclosed tags) is offline right now — the rest still works.";
    report.appendChild(note);
  }
}

/* ---------- Main update ---------- */
function update() {
  const src = code.value;

  // Live preview
  preview.srcdoc = src;
  pulse.classList.remove("beat");
  void pulse.offsetWidth;        // restart animation
  pulse.classList.add("beat");

  // Lint
  const structural = structuralRules(src);
  const items = [...(structural || []), ...customRules(src)];
  renderReport(items, structural !== null);

  // Autosave
  try { localStorage.setItem(STORAGE_KEY, src); } catch (e) {}
}

/* ---------- Editor chrome (gutter, tab, debounce) ---------- */
function refreshGutter() {
  const lines = code.value.split("\n").length;
  let s = "";
  for (let i = 1; i <= lines; i++) s += i + (i < lines ? "\n" : "");
  gutter.textContent = s || "1";
}

code.addEventListener("scroll", () => {
  gutter.scrollTop = code.scrollTop;
});

code.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const s = code.selectionStart, end = code.selectionEnd;
    code.setRangeText("  ", s, end, "end");
    debounced();
  }
});

let timer = null;
function debounced() {
  refreshGutter();
  clearTimeout(timer);
  timer = setTimeout(update, 300);
}
code.addEventListener("input", debounced);

clearBtn.addEventListener("click", () => {
  if (code.value.trim() && !confirm("Clear everything and start fresh?")) return;
  code.value = "";
  code.focus();
  refreshGutter();
  update();
});

/* ---------- Insert at cursor ---------- */
function insertAtCursor(text) {
  const s = code.selectionStart, end = code.selectionEnd;
  code.setRangeText(text, s, end, "end");
  code.focus();
  refreshGutter();
  update();
}

/* ---------- Toolbox ---------- */
function buildToolbox() {
  SNIPPETS.forEach((sn) => {
    const b = document.createElement("button");
    b.className = "btn snippet-btn";
    b.innerHTML = `<span class="s-title">${sn.title}</span><span class="s-desc">${sn.desc}</span>`;
    b.addEventListener("click", () => {
      if (code.value.trim() && !confirm(`Load the "${sn.title}" example? This replaces what's in the editor.`)) return;
      code.value = sn.html;
      closeToolbox();
      code.focus();
      refreshGutter();
      update();
    });
    snippetsEl.appendChild(b);
  });

  CHEATS.forEach((c) => {
    const b = document.createElement("button");
    b.className = "btn cheat-item";
    b.innerHTML = `<span class="tag">${c.tag}</span><span class="desc">${c.desc}</span>`;
    b.addEventListener("click", () => { insertAtCursor(c.ex); closeToolbox(); });
    cheatEl.appendChild(b);
  });
}

function openToolbox() {
  toolbox.classList.add("open");
  toolbox.setAttribute("aria-hidden", "false");
  toolboxBtn.setAttribute("aria-expanded", "true");
  scrim.hidden = false;
}
function closeToolbox() {
  toolbox.classList.remove("open");
  toolbox.setAttribute("aria-hidden", "true");
  toolboxBtn.setAttribute("aria-expanded", "false");
  scrim.hidden = true;
}
toolboxBtn.addEventListener("click", () =>
  toolbox.classList.contains("open") ? closeToolbox() : openToolbox()
);
toolboxClose.addEventListener("click", closeToolbox);
scrim.addEventListener("click", closeToolbox);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeToolbox(); });

/* ---------- Boot ---------- */
const DEFAULT_DOC = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
</head>
<body>
  <h1>Hi, I'm Pravar! 👋</h1>
  <p>This is my first web page. I can change this text!</p>

  <h2>Things I like</h2>
  <ul>
    <li>Drawing</li>
    <li>Football</li>
    <li>Coding</li>
  </ul>

  <p>Open the <strong>Toolbox</strong> to try more tags. 🧰</p>
</body>
</html>`;

function boot() {
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  code.value = saved !== null ? saved : DEFAULT_DOC;
  buildToolbox();
  refreshGutter();
  update();
}

// `app.js` is deferred, so the DOM is ready now — start immediately.
// Crucially we do NOT wait for window.load: if the HTMLHint CDN or web
// fonts are slow/blocked, the load event can stall, which would otherwise
// leave the preview and toolbox dead. Core features must never depend on
// the network.
boot();

// HTMLHint loads separately (CDN, deferred). Poll briefly and re-run the
// linter once it arrives so structural checks (unclosed tags) light up.
// If it never loads, the custom rules and everything else still work.
if (!getLinter()) {
  let tries = 0;
  const wait = setInterval(() => {
    if (getLinter() || ++tries > 40) {
      clearInterval(wait);
      update();
    }
  }, 150);
}
