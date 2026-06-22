---
# Klassenfilter ist standardmäßig AUS, daher ist kein cssclass nötig.
# Falls du "nur Seiten mit cssclass verarbeiten" aktiviert hast, einkommentieren:
# cssclasses: [calccraft]
---

# Notenliste (CalcCraft-Vorlage)

Nachbau der Excel-Notenliste mit CalcCraft. Da CalcCraft pro Note mit **einer**
Tabelle arbeitet (keine Verweise zwischen mehreren Blättern), wurde das
5‑Blatt‑Original sinnvoll in **eine** Tabelle zusammengeführt:

| Original (Excel)                         | hier (CalcCraft)                                  |
| ---------------------------------------- | ------------------------------------------------- |
| Blatt *Unterrichtsbeteiligung* → `!Y`    | Eingabespalte **UB**                              |
| Blatt *Klausur1* → `!N`                  | Eingabespalte **Klausur 1** (analog Klausur 2)    |
| Gewichtung in Spalte *H* (`$H$2` …)      | **sichtbare Parameter-Zellen** (Spalte *k*), per `§k§…` referenziert |
| Blatt *Schlüssel* (`$A$2:$B$17`)         | inline **Notenskala** in Spalten **l/m** (ausgeblendet) |
| `VLOOKUP(...; Schlüssel!$A$2:$B$17; …)`   | `VLOOKUP(...; [l:m]; …)` (Spalten-Range)          |

## Gewichtung anpassen (sichtbar, an *einer* Stelle)

Die Gewichte stehen **sichtbar** in Spalte **„Wert" (k)** und werden über
**`§`-Anker** (`§k§2` …) in alle Formeln eingespeist – ändern an *einer* Stelle,
wirkt für alle Schüler. Einfach direkt in der Tabelle anpassen:

| Zelle  | Bedeutung                     | Standard | ändern? |
| ------ | ----------------------------- | -------- | ------- |
| **k2** | Gewicht **mündlich (UB)**     | `60%`    | ✏️ ja   |
| k3     | Gewicht schriftlich           | `=100%-§k§2` | automatisch |
| **k4** | Gewicht **Klausur 1**         | `50%`    | ✏️ ja   |
| k5     | Gewicht Klausur 2             | `=100%-§k§4` | automatisch |
| **k6** | Endnote: Gewicht **akt. Hj**  | `60%`    | ✏️ ja   |
| k7     | Endnote: Gewicht 1. Hj        | `=100%-§k§6` | automatisch |

Du setzt also nur **k2, k4, k6** – die Gegengewichte (`100% − …`) rechnen sich
selbst (mündlich + schriftlich = 100 % usw.).

> Warum `§` und `·`? `$` rendert Obsidian als Mathe-Formel, `*` als Kursiv. Die
> neutralen Zeichen `§` (Anker) und `·` (Mal) bleiben unverändert. `$`, `*`
> funktionieren weiterhin.

## Die Liste

> **Eingabe:** nur **Vorname, Name, UB, Klausur 1, Klausur 2** (Punkte 0–15) und
> optional **Note 1. Hj.** (als Notenwert, z. B. `2.3`). Der Rest rechnet sich.
> **Sichtbar:** Schülerspalten + Gewichte (rechts). **Ausgeblendet:** nur die
> Skala (*l/m*) – gesteuert über die **sichtbare** Zelle **k9** (`=hide(l,m)`).

| Vorname | Name    | UB  | Klausur 1 | Klausur 2 | Note 1. Hj. | Gesamt                                    | Note                       | Endnote                                    | Gewicht              | Wert         | Skala Pkt | Skala Note |
| ------- | ------- | --- | --------- | --------- | ----------- | ----------------------------------------- | -------------------------- | ------------------------------------------ | -------------------- | ------------ | --------- | ---------- |
| Anna    | Müller  | 12  | 10        | 14        |             | =round(c2·§k§2+(d2·§k§4+e2·§k§5)·§k§3,1)   | =VLOOKUP(g2,[l:m],2,true)  | =IF(f2>0,round(h2·§k§6+f2·§k§7,1),h2)       | Gew. mündlich (UB)   | 60%          | 0         | 6          |
| Ben     | Schmidt | 9   | 8         | 11        | 3           | =round(c3·§k§2+(d3·§k§4+e3·§k§5)·§k§3,1)   | =VLOOKUP(g3,[l:m],2,true)  | =IF(f3>0,round(h3·§k§6+f3·§k§7,1),h3)       | Gew. schriftlich     | =100%-§k§2   | 1         | 5.3        |
| Cara    | Wolf    | 14  | 15        | 13        |             | =round(c4·§k§2+(d4·§k§4+e4·§k§5)·§k§3,1)   | =VLOOKUP(g4,[l:m],2,true)  | =IF(f4>0,round(h4·§k§6+f4·§k§7,1),h4)       | Gew. Klausur 1       | 50%          | 2         | 5          |
|         |         |     |           |           |             |                                           |                            |                                            | Gew. Klausur 2       | =100%-§k§4   | 3         | 4.7        |
|         |         |     |           |           |             |                                           |                            |                                            | Endnote: akt. Hj     | 60%          | 4         | 4.3        |
|         |         |     |           |           |             |                                           |                            |                                            | Endnote: 1. Hj       | =100%-§k§6   | 5         | 4          |
|         |         |     |           |           |             |                                           |                            |                                            |                      |              | 6         | 3.7        |
|         |         |     |           |           |             |                                           |                            |                                            | Skala ausblenden:    | =hide(l,m)   | 7         | 3.3        |
|         |         |     |           |           |             |                                           |                            |                                            |                      |              | 8         | 3          |
|         |         |     |           |           |             |                                           |                            |                                            |                      |              | 9         | 2.7        |
|         |         |     |           |           |             |                                           |                            |                                            |                      |              | 10        | 2.3        |
|         |         |     |           |           |             |                                           |                            |                                            |                      |              | 11        | 2          |
|         |         |     |           |           |             |                                           |                            |                                            |                      |              | 12        | 1.7        |
|         |         |     |           |           |             |                                           |                            |                                            |                      |              | 13        | 1.3        |
|         |         |     |           |           |             |                                           |                            |                                            |                      |              | 14        | 1          |
|         |         |     |           |           |             |                                           |                            |                                            |                      |              | 15        | 0.7        |

**Erwartete Werte (Beispielschüler):**

| Schüler | Gesamt (g) | Note (h) | Endnote (i) |
| ------- | ---------- | -------- | ----------- |
| Anna    | 12         | 1.7      | 1.7         |
| Ben     | 9.2        | 2.7      | 2.8         |
| Cara    | 14         | 1        | 1           |

Rechenweg Ben: Gesamt = 9·60 % + (8·50 % + 11·50 %)·40 % = 5,4 + 9,5·40 % = 9,2 →
Note (Skala, größter Pkt ≤ 9,2 = 9) = **2,7** → Endnote = 2,7·60 % + 3·40 % = **2,8**.

## Bedienung

- **Schüler hinzufügen:** Vorname/Name/Punkte eintragen, dann den Cursor in eine
  Formelzelle (Spalte *g*, *h* oder *i*) setzen und **„CalcCraft: Fill formula
  down"** (Befehlspalette oder Rechtsklick) ausführen. Die `§k§…`-Bezüge auf die
  Gewichte bleiben fix, die Schüler-Bezüge (`c2`→`c3`…) wandern mit. Tipp: nur bis
  zur letzten belegten Zeile füllen.
- **Gewichte ändern:** direkt in Spalte **Wert** (Zellen **k2, k4, k6**).
- **Skala ein-/ausblenden:** Zelle **k9** (`=hide(l,m)`) leeren bzw. wieder
  setzen. Diese Zelle ist **sichtbar**, du kommst also immer dran. *(Generell
  gilt: im **Quelltextmodus** ist nie etwas ausgeblendet – dort siehst du immer
  die komplette Tabelle.)*
- **+/- Skala** (z. B. „1+", „2-") statt Dezimalnote: derzeit werden Werte wie
  `1+` als Zahl `1` interpretiert. Falls gewünscht – kleine separate Erweiterung.

## Bewusste Abweichungen vom Original

- **Eine Tabelle** statt fünf Blätter (Cross-Sheet-Referenzen gibt es in CalcCraft
  noch nicht). UB und Klausurnoten werden direkt eingetragen.
- **Note als Zahl** (Dezimal, z. B. `1.7`) statt der +/- Skala (`1+`, `2-`).
- **Zusatzleistungen** (Bonus-Spalten M–U im Original) sind weggelassen, um die
  Vorlage übersichtlich zu halten – können bei Bedarf ergänzt werden.
- **Punkte/Notenwerte-Umschalter** (`H11 = P/N`) entfällt; es wird direkt der
  Notenwert ausgegeben.
