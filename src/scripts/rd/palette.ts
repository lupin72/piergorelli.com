/**
 * ⌘K command palette — also the mobile menu.
 * Loaded on first use; builds a native <dialog> once and keeps it.
 */
import { navigate } from "astro:transitions/client";
import { toggleTheme, cycleAccent, toggleGrid } from "./site";

type Item = { label: string; hint: string; group: string; run: () => void };

let dialog: HTMLDialogElement | undefined;
let items: Item[] = [];
let filtered: Item[] = [];
let active = 0;

const go = (href: string) => () => { dialog?.close(); navigate(href); };

const base: Item[] = [
  { group: "Go to", label: "Home", hint: "/", run: go("/") },
  { group: "Go to", label: "Services", hint: "/services/", run: go("/services/") },
  { group: "Go to", label: "AI for agencies", hint: "/services/ai-for-agencies/", run: go("/services/ai-for-agencies/") },
  { group: "Go to", label: "Work", hint: "/#work", run: go("/#work") },
  { group: "Go to", label: "About", hint: "/about/", run: go("/about/") },
  { group: "Go to", label: "Blog", hint: "/blog/", run: go("/blog/") },
  { group: "Go to", label: "Contact", hint: "/contact/", run: go("/contact/") },
  { group: "Do", label: "Toggle light / dark", hint: "theme", run: () => toggleTheme() },
  { group: "Do", label: "Next accent colour", hint: "accent", run: () => cycleAccent() },
  { group: "Do", label: "Show the grid", hint: "⌥G", run: () => { toggleGrid(); dialog?.close(); } },
  { group: "Do", label: "Copy email address", hint: "me@piergorelli.com", run: () => { navigator.clipboard?.writeText("me@piergorelli.com"); dialog?.close(); } },
];

function build() {
  dialog = document.createElement("dialog");
  dialog.className = "palette";
  dialog.setAttribute("aria-label", "Command palette");
  dialog.innerHTML = `
    <div class="palette__box">
      <div class="palette__search">
        <span class="note" aria-hidden="true">⌘K</span>
        <input type="text" role="combobox" aria-label="Search pages, posts, actions" aria-expanded="true" aria-autocomplete="list"
          aria-controls="palette-list" placeholder="Search pages, posts, actions…" autocomplete="off" spellcheck="false" />
        <button type="button" class="note palette__close" aria-label="Close (Esc)">Esc</button>
      </div>
      <ul class="palette__list" id="palette-list" role="listbox" aria-label="Results"></ul>
      <p class="sr-only" role="status" data-palette-count></p>
    </div>`;
  document.body.append(dialog);

  const input = dialog.querySelector("input")!;
  input.addEventListener("input", () => { active = 0; render(input.value); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { active = Math.min(active + 1, filtered.length - 1); e.preventDefault(); paint(); }
    else if (e.key === "ArrowUp") { active = Math.max(active - 1, 0); e.preventDefault(); paint(); }
    else if (e.key === "Enter") { filtered[active]?.run(); }
  });
  dialog.querySelector(".palette__close")!.addEventListener("click", () => dialog!.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog!.close(); });
  dialog.querySelector(".palette__list")!.addEventListener("click", (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
    if (li) filtered[Number(li.dataset.i)]?.run();
  });

  items = base;
  // Blog posts come from a tiny build-time index.
  fetch("/search.json")
    .then((r) => r.json())
    .then((posts: { title: string; url: string; pillar: string }[]) => {
      items = [...base, ...posts.map((p) => ({ group: "Blog", label: p.title, hint: p.pillar, run: go(p.url) }))];
      render(input.value);
    })
    .catch(() => {});
}

function render(query: string) {
  const q = query.trim().toLowerCase();
  filtered = q ? items.filter((i) => `${i.label} ${i.hint} ${i.group}`.toLowerCase().includes(q)) : items;
  const list = dialog!.querySelector(".palette__list")!;
  let group = "";
  list.innerHTML = filtered
    .map((item, i) => {
      const head = item.group !== group ? `<li class="note palette__group" role="presentation">${(group = item.group)}</li>` : "";
      return `${head}<li role="option" id="palette-opt-${i}" data-i="${i}"><span>${escape(item.label)}</span><span class="note">${escape(item.hint)}</span></li>`;
    })
    .join("") || `<li class="palette__empty note" role="presentation">Nothing found. Try “ai” or “astro”.</li>`;
  const count = dialog!.querySelector("[data-palette-count]")!;
  count.textContent = q ? `${filtered.length} result${filtered.length === 1 ? "" : "s"}` : "";
  paint();
}

function paint() {
  const input = dialog!.querySelector("input")!;
  input.removeAttribute("aria-activedescendant");
  dialog!.querySelectorAll<HTMLElement>("[data-i]").forEach((li) => {
    const on = Number(li.dataset.i) === active;
    li.setAttribute("aria-selected", String(on));
    if (on) {
      input.setAttribute("aria-activedescendant", li.id);
      li.scrollIntoView({ block: "nearest" });
    }
  });
}

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function open() {
  if (!dialog?.isConnected) build();
  if (dialog!.open) return dialog!.close();
  active = 0;
  const input = dialog!.querySelector("input")!;
  input.value = "";
  render("");
  dialog!.showModal();
  input.focus();
}
