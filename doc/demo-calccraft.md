---
# Class filtering is OFF by default, so no cssclass is needed.
# If you enabled "Only process pages with specific cssclass" in settings,
# uncomment the next line:
# cssclasses: [calccraft]
---

# CalcCraft – Test- & Demo-Datei

Diese Datei führt **alle** Funktionen vor. Öffne sie in der **Leseansicht**
oder in der **Live-Vorschau** – dort werden die Formeln durch die berechneten
Werte ersetzt. Im **Quelltextmodus** siehst du die Formeln.

> Konvention: Die Kopfzeile ist **Zeile 1** (`a1`, `b1`, …), die erste
> Datenzeile ist **Zeile 2** (`a2`, …). Spalten sind `a`, `b`, `c`, …

---

## 1. Grundrechnen & einfache Bezüge

| Artikel | Menge | Preis | Summe   |
| ------- | ----- | ----- | ------- |
| Apfel   | 5     | 2     | =b2*c2  |
| Birne   | 3     | 4     | =b3*c3  |
| Kirsche | 10    | 1     | =b4*c4  |

**Erwartet:** Summe = `10`, `12`, `10`.

---

## 2. Relative Bezüge (`c`/`r`-Notation)

| Wert | links davon | Zelle darüber |
| ---- | ----------- | ------------- |
| 10   | =-1c+0r     |               |
| 20   | =-1c+0r     | =+0c-1r       |

**Erwartet:** „links davon" = `10`, `20` (Spalte a derselben Zeile).
„Zelle darüber" in Zeile 3 = `20` (b2).

---

## 3. Absolute `$`-Bezüge (Vorbereitung für Fill-Down)

| Basis | Faktor | Berechnung |
| ----- | ------ | ---------- |
| 100   | 0.1    | =a2*$b$2   |
| 200   |        | =a3*$b$2   |
| 300   |        | =a4*$b$2   |

**Erwartet:** `10`, `20`, `30`. Der Anker `$b$2` bleibt fix – `=$a$1`, `=$a1`,
`=a$1` werden ebenfalls akzeptiert.

---

## 4. Bereiche (Ranges)

| plums | bananas | Bereichssumme | Spaltensumme |
| ----- | ------- | ------------- | ------------ |
| 5     | 12      | =sum(a2:b3)   | =sum(a:a)    |
| 7     | 5       |               |              |

**Erwartet:** `sum(a2:b3)` = `29`. `sum(a:a)` = `12` (Kopfzeile `a1` wird
übersprungen, also `a2+a3` = `5+7`).

### Zeilenbereich `1:1`

| 3         | 4   | 5   |
| --------- | --- | --- |
| =sum(1:1) |     |     |

**Erwartet:** `12` (summiert die gesamte erste Zeile `3+4+5`).

---

## 5. Matrizen & Vektoren

### Vektor-Addition (`[ … ]` füllt mehrere Zellen)

| plums | bananas | fruits           |
| ----- | ------- | ---------------- |
| 5     | 12      | =[a2:a4]+[b2:b4] |
| 7     | 5       |                  |
| 19    | 10      |                  |

**Erwartet:** Spalte fruits = `17`, `12`, `29`.

### Transponieren

| 1   | 2   | 3   |     | =transpose([a2:c4]) |     |     |
| --- | --- | --- | --- | ------------------- | --- | --- |
| 4   | 5   | 6   |     |                     |     |     |
| 7   | 8   | 9   |     |                     |     |     |

**Erwartet:** ab Spalte e: `1 4 7 / 2 5 8 / 3 6 9`.

### Determinante

| 1   | 2   | 3   | =det([a2:c4]) |
| --- | --- | --- | ------------- |
| 4   | 5   | 7   |               |
| 7   | 8   | 9   |               |

**Erwartet:** `6`.

---

## 6. Einheiten (MathJS)

| Strecke | Zeit | Geschwindigkeit |
| ------- | ---- | --------------- |
| 5 m     | 10 s | =a2/b2          |
| 100 km  | 2 h  | =a3/b3          |

**Erwartet:** `0.5 m/s`, `50 km/h`.

| a      | b      | Addition / Umrechnung |
| ------ | ------ | --------------------- |
| 5 kg   | 3000 g | =a2+b2                |
| 12 inch|        | =to(unit(a3), "cm")   |

**Erwartet:** `8 kg`, `30.48 cm`.

---

## 7. Prozent-Literale

| Preis | Rabatt | Endpreis    |
| ----- | ------ | ----------- |
| 200   | 60%    | =a2*(1-b2)  |
| 100   | 25%    | =a3*b3      |
| =50%  |        |             |

**Erwartet:** `80` (200·0,4), `25` (100·0,25), `0.5`.
Hinweis: `60%` als Zellwert wird zu `0.6`.

---

## 8. Excel-Funktionen

### IF / AND / OR / NOT

| a   | b   | IF                   | AND             | OR             | NOT         |
| --- | --- | -------------------- | --------------- | -------------- | ----------- |
| 5   | 3   | =IF(a2>b2,"hi","lo") | =AND(a2>0,b2>0) | =OR(a2<0,b2>0) | =NOT(a2>b2) |

**Erwartet:** `hi`, `true`, `true`, `false`.

### IFERROR (fängt Fehler & NaN)

| Beschreibung    | Ergebnis              |
| --------------- | --------------------- |
| 0/0 abgefangen  | =IFERROR(0/0, "n/a")  |
| ok-Fall         | =IFERROR(42, "n/a")   |

**Erwartet:** `n/a`, `42`.
(Achtung: `10/0` ergibt in MathJS `Infinity`, KEINen Fehler – wird also *nicht*
von IFERROR gefangen.)

### ROUND & AVERAGE

| Werte |     |     | ROUND               | AVERAGE          |
| ----- | --- | --- | ------------------- | ---------------- |
| 2     | 4   | 6   | =ROUND(3.14159, 2)  | =AVERAGE(a2:c2)  |
| 2     |     | 4   |                     | =AVERAGE(a3:c3)  |

**Erwartet:** ROUND = `3.14`; AVERAGE = `4` und `3` (leere Zelle wird
ignoriert, konsistent zu `sum()`).

### VLOOKUP (Notenskala – alles in EINER Tabelle)

> Cross-Table-Referenzen sind noch nicht möglich (kommt mit „C3"), deshalb
> stehen Skala und Suche hier in derselben Tabelle.

| Pkt | Note | Skala | Suche | Note (approx)              | Note (exakt)                |
| --- | ---- | ----- | ----- | -------------------------- | --------------------------- |
| 0   | 6    |       | 12    | =VLOOKUP(d2,[a2:b6],2,true)| =VLOOKUP(a3,[a2:b6],2,false)|
| 8   | 4    |       |       |                            |                             |
| 11  | 2    |       |       |                            |                             |
| 13  | 1    |       |       |                            |                             |
| 15  | 1    |       |       |                            |                             |

**Erwartet:** „Note (approx)" = `2` — VLOOKUP sucht in Spalte `a` (Pkt) den
größten Wert ≤ `12`, das ist `11` → zugehörige Note `2`. „Note (exakt)" für
`a3 = 8` = `4` (exakter Treffer in Spalte a).

---

## 9. Spalten ausblenden – `=hide(...)`

| Name | Rohwert | Zwischenrechnung | Endnote      |          |
| ---- | ------- | ---------------- | ------------ | -------- |
| Anna | 80      | =b2*1.1          | =round(c2,0) | =hide(c) |
| Ben  | 60      | =b3*1.1          | =round(c3,0) |          |

**Erwartet:** Spalte `c` (Zwischenrechnung) ist in der Lese-/Live-Ansicht
**ausgeblendet**; die Endnote rechnet trotzdem (`88`, `66`). Die `=hide(c)`-Zelle
erscheint leer. Mehrere/Range möglich: `=hide(c, e)` oder `=hide(c:e)`.

---

## 10. Escaped-Text & Fehler

| literaler Text   |
| ---------------- |
| '=keine Formel   |

**Erwartet:** zeigt `=keine Formel` (das `'` wird ausgeblendet).

| Loop A | Loop B | Außerhalb |
| ------ | ------ | --------- |
| =b2    | =a2    | =z99      |

**Erwartet:** `=b2`/`=a2` zeigen `loop`; `=z99` zeigt `cell / out of / table`.

---

## 11. Fill-Down zum Selbst-Testen ⬇️

**So testest du:** Cursor in die **Formelzelle** setzen (Quelltext- oder
Live-Vorschau-Modus), dann **Befehlspalette → „CalcCraft: Fill formula down"**
oder **Rechtsklick → „CalcCraft: Fill formula down"**.

### a) Einfaches Herunterziehen

Setze den Cursor in `b2` (`=a2^2`) und führe Fill-Down aus:

| n   | n²     |
| --- | ------ |
| 1   | =a2^2  |
| 2   |        |
| 3   |        |
| 4   |        |

**Erwartet nach Fill-Down:** `b3=4`, `b4=9`, `b5=16` (im Quelltext stehen dann
`=a3^2`, `=a4^2`, `=a5^2`).

### b) Mit `$`-Anker

Cursor in `b2` (`=a2*$c$2`), dann Fill-Down:

| Wert | Ergebnis  | Faktor |
| ---- | --------- | ------ |
| 10   | =a2*$c$2  | 3      |
| 20   |           |        |
| 30   |           |        |

**Erwartet:** `30`, `60`, `90`. Der relative Teil `a2` wandert (`a3`, `a4`),
der Anker `$c$2` bleibt fix.

---

## 12. Realistische Mini-Notenliste (Showcase)

Kombiniert Prozent-Gewichtung, `average`, `round`, `VLOOKUP` mit `$`-Anker.
Die Notenskala (Spalten **j/k**) steht rechts in derselben Tabelle.
Die Note-Formel (Spalte **h**) eignet sich ideal zum **Herunterziehen**.

| Vorname | Name    | UB  | K1  | K2  | Schnitt schr.           | Gesamt                       | Note                          |     | Pkt | Note |
| ------- | ------- | --- | --- | --- | ----------------------- | ---------------------------- | ----------------------------- | --- | --- | ---- |
| Anna    | Müller  | 12  | 10  | 14  | =round(average(d2:e2),1)| =round(c2*40%+f2*60%,1)      | =VLOOKUP(g2,[$j$2:$k$6],2,true)|     | 0   | 6    |
| Ben     | Schmidt | 9   | 8   | 11  | =round(average(d3:e3),1)| =round(c3*40%+f3*60%,1)      | =VLOOKUP(g3,[$j$2:$k$6],2,true)|     | 8   | 4    |
| Cara    | Wolf    | 14  | 15  | 13  | =round(average(d4:e4),1)| =round(c4*40%+f4*60%,1)      | =VLOOKUP(g4,[$j$2:$k$6],2,true)|     | 11  | 2    |
|         |         |     |     |     |                         |                              |                               |     | 13  | 1    |
|         |         |     |     |     |                         |                              |                               |     | 15  | 1    |

**Erwartete Ergebnisse:**

| Schüler | Schnitt schr. (f) | Gesamt (g) | Note (h) |
| ------- | ----------------- | ---------- | -------- |
| Anna    | 12                | 12         | 2        |
| Ben     | 9.5               | 9.3        | 4        |
| Cara    | 14                | 14         | 1        |

Rechenweg Anna: Schnitt = ⌀(10,14)=12; Gesamt = 12·40 % + 12·60 % = 12;
VLOOKUP(12) → größter Pkt-Wert ≤ 12 ist `11` → Note `2`.

> Tipp: Du kannst die Hilfsspalten der Skala mit `=hide(i, j, k)` in einer
> freien Zelle ausblenden, sobald du die Liste „fertig" hast.

---

## Checkliste

- [ ] 1 Grundrechnen & Bezüge
- [ ] 2 Relative Bezüge
- [ ] 3 Absolute `$`-Bezüge
- [ ] 4 Bereiche (inkl. `a:a`, `1:1`)
- [ ] 5 Matrizen (Vektor, transpose, det)
- [ ] 6 Einheiten
- [ ] 7 Prozent-Literale
- [ ] 8 Excel-Funktionen (IF/IFERROR/AND/OR/NOT/ROUND/AVERAGE/VLOOKUP)
- [ ] 9 Spalten ausblenden `=hide(...)`
- [ ] 10 Escaped-Text & Fehler
- [ ] 11 Fill-Down (a einfach, b mit `$`-Anker)
- [ ] 12 Mini-Notenliste
