// Az Interfood heti kínálatának feldolgozása. Tiszta függvények, hálózat nélkül.

export const CODES = ["SP1", "L1K", "L2K", "L3K", "E2K", "E3K", "E4K", "F1K", "F2K", "F3K", "F4K", "DKM"];

// JS getUTCDay(): 1 = hétfő, 3 = szerda, 5 = péntek
export const DAY_KEYS = {
  1: { key: "hetfo", label: "Hétfő" },
  3: { key: "szerda", label: "Szerda" },
  5: { key: "pentek", label: "Péntek" },
};
const DAY_ORDER = ["hetfo", "szerda", "pentek"];

export function fixText(s) {
  return String(s == null ? "" : s)
    .replace(/õ/g, "ő").replace(/Õ/g, "Ő")
    .replace(/û/g, "ű").replace(/Û/g, "Ű")
    .replace(/\s+/g, " ")
    .replace(/\s*\*+\s*$/, "")
    .trim();
}

function pad(n) { return (n < 10 ? "0" : "") + n; }

export function dayOfWeek(iso) {
  return new Date(iso + "T12:00:00Z").getUTCDay();
}

// "2026-11-16" -> "2026.11.16."
export function huDate(iso) {
  return iso.replace(/-/g, ".") + ".";
}

// Az ISO-hét hétfője és pénteke ("YYYY-MM-DD")
export function isoWeekDays(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4, 12));
  const jan4Dow = jan4.getUTCDay() || 7;
  const monday = new Date(jan4.getTime() + ((week - 1) * 7 - (jan4Dow - 1)) * 86400000);
  const friday = new Date(monday.getTime() + 4 * 86400000);
  const f = (d) => d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
  return { monday: f(monday), friday: f(friday) };
}

function kcalOf(it) {
  let sum = Number(it.energy_portion_food_one) || 0;
  if (fixText(it.food_name_two)) sum += Number(it.energy_portion_food_two) || 0;
  if (fixText(it.food_name_three)) sum += Number(it.energy_portion_food_three) || 0;
  return sum > 0 ? Math.round(sum) : null;
}

// menuData: az /api/v1/menu válasz "data" mezője
export function buildWeek(menuData, year, week, codes = CODES) {
  const items = [];
  const dates = {};
  for (const group of Object.values(menuData || {})) {
    for (const cat of group.categories || []) {
      if (!codes.includes(cat.code)) continue;
      for (const it of cat.items || []) {
        const d = DAY_KEYS[dayOfWeek(it.date)];
        if (!d) continue;
        const name = fixText((it.food && (it.food.display_name || it.food.name)) || it.food_name_one);
        if (!name) continue;
        dates[d.key] = it.date;
        items.push({
          code: cat.code,
          cat: fixText(cat.name),
          day: d.key,
          name,
          kcal: kcalOf(it),
          price: Math.round(Number(it.price)) + " Ft",
        });
      }
    }
  }
  const wd = isoWeekDays(year, week);
  const days = DAY_ORDER.filter((k) => dates[k]).map((k) => {
    const dk = Object.values(DAY_KEYS).find((x) => x.key === k);
    return { key: k, label: dk.label, date: huDate(dates[k]) };
  });
  const order = (c) => codes.indexOf(c);
  items.sort((a, b) => order(a.code) - order(b.code) || DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  return {
    year,
    week,
    range: wd.monday.replace(/-/g, ".") + "–" + wd.friday.slice(5).replace("-", "."),
    days,
    items,
  };
}
