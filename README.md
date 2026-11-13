# Interfood heti válogatás

Egyoldalas oldal az Interfood heti kínálatának átnézéséhez. A hétfői, szerdai és pénteki napokra szóló
kódokat (SP1, L1K, L2K, L3K, E2K, E3K, E4K, AK, BK, CK, DK, GK, F1K, F2K, F3K, F4K, DKM, KM) lehet kijelölni, majd a kijelölést
vágólapra másolni.

## Felépítés

- `index.html`: az oldal, külső függőség nélkül. A `data/menu.json` fájlból tölti be a kínálatot.
- `data/menu.json`: az aktuális és a következő hetek kínálata. Ezt a GitHub Actions tölti.
- `scripts/fetch-menu.mjs`: beolvassa az Interfood nyilvános API-ját, és csak változás esetén írja a fájlt.
- `scripts/lib.mjs`: az API-válasz feldolgozása.
- `.github/workflows/update-menu.yml`: hatóránként lefuttatja a beolvasást, elmenti a változást, és közzéteszi az oldalt GitHub Pages-en.

## Kódok vagy napok módosítása

A kódok listája a `scripts/lib.mjs` elején (`CODES`), a napok a `DAY_KEYS` alatt vannak. A módosítás után az oldal
`index.html` fejlécében lévő felsorolást is érdemes átírni.

## Kézi frissítés

Az Actions fülön a „Kínálat frissítése és közzététel” munkafolyamat a „Run workflow” gombbal azonnal lefuttatható.
Helyben: `node scripts/fetch-menu.mjs`.
