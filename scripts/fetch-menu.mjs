// Beolvassa az Interfood aktuális és következő heti kínálatát, és a data/menu.json fájlba írja.
// Csak akkor ír, ha a kínálat változott. Hiba esetén nem nyúl a meglévő fájlhoz.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildWeek } from "./lib.mjs";

const API = "https://ia.interfood.hu/api/v1/";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../data/menu.json");
const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "interfood-menu (github.com/lbiri84/interfood-menu)",
};

async function api(path, body) {
  const res = await fetch(API + path, {
    method: body ? "POST" : "GET",
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(path + " -> HTTP " + res.status + " " + (await res.text()).slice(0, 200));
  return res.json();
}

const range = (max) => ({ min: 0, max });

async function main() {
  const cur = (await api("current-week")).data;
  const curY = Number(cur.year), curW = Number(cur.week);
  const weeks = (await api("weeks")).data.filter(
    (w) => !w.disabled && (w.year > curY || (w.year === curY && w.week >= curW))
  );
  if (!weeks.length) throw new Error("Nincs rendelhető hét az API szerint.");

  const out = [];
  for (const w of weeks) {
    const res = await api("menu", {
      year: w.year,
      week: w.week,
      favorites: false,
      seek_labels: [],
      ignore_labels: [],
      seek_ingredients: [],
      ignore_ingredients: [],
      calorie: range(5000),
      carb: range(2000),
      protein: range(2000),
      fat: range(2000),
      price: range(1000000),
    });
    if (res.error) throw new Error("menu " + w.year + "/" + w.week + ": " + JSON.stringify(res).slice(0, 200));
    const built = buildWeek(res.data, w.year, w.week);
    console.log("Hét " + w.week + ": " + built.items.length + " tétel");
    if (built.items.length) out.push(built);
  }
  if (!out.length) throw new Error("Egyik héten sem találtam a keresett kódokat.");

  const next = { currentWeek: { year: curY, week: curW }, weeks: out };

  let prev = null;
  try { prev = JSON.parse(await readFile(OUT, "utf8")); } catch {}
  if (prev && JSON.stringify({ currentWeek: prev.currentWeek, weeks: prev.weeks }) === JSON.stringify(next)) {
    console.log("Nincs változás.");
    return;
  }
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), ...next }, null, 1) + "\n", "utf8");
  console.log("Frissítve: " + OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
