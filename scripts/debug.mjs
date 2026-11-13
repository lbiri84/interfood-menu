const B = "https://ia.interfood.hu/api/v1/";
const cw = await (await fetch(B + "current-week")).json();
const w = cw.data || cw;
const body = {year: w.year, week: w.week, favorites:false, seek_labels:[], ignore_labels:[], seek_ingredients:[], ignore_ingredients:[], calorie:{min:0,max:5000}, carb:{min:0,max:2000}, protein:{min:0,max:2000}, fat:{min:0,max:2000}, price:{min:0,max:1000000}};
const j = await (await fetch(B + "menu", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body)})).json();
const seen = new Map();
for (const g of Object.values(j.data)) for (const c of g.categories) for (const it of c.items) {
  const icons = JSON.stringify(it.menu_icons);
  const key = c.code + "|" + (it.food.display_name || it.food.name).slice(0,40);
  if (!seen.has(key)) seen.set(key, icons);
}
let n = 0;
for (const [k, v] of seen) { console.log("DBG", k, v.slice(0, 220)); if (++n > 40) break; }
console.log("DBGKEYS", Object.keys(j.data[Object.keys(j.data)[0]].categories[0].items[0]).join(","));
const f = Object.values(j.data)[0].categories[0].items[0];
console.log("DBGLABELS", JSON.stringify(f.food).slice(0, 400));
