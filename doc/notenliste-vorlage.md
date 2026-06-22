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
| Gewichtung in Spalte *H* (`$H$2` …)      | **Parameter-Zellen** (Spalte *m*), referenziert per `§m§…` |
| Blatt *Schlüssel* (`$A$2:$B$17`)         | inline **Notenskala** in Spalten **j/k**          |
| `VLOOKUP(...; Schlüssel!$A$2:$B$17; …)`   | `VLOOKUP(...; [j:k]; …)` (Spalten-Range)          |

## Gewichtung anpassen (an *einer* Stelle)

Die Gewichte stehen als Prozentwerte in der (ausgeblendeten) Spalte **m** und
werden über **`§`-Anker** (`§m§2` …) in alle Formeln eingespeist – ändern an
*einer* Stelle, wirkt für alle Schüler.

| Zelle  | Bedeutung                     | Standard | ändern? |
| ------ | ----------------------------- | -------- | ------- |
| **m2** | Gewicht **mündlich (UB)**     | `60%`    | ✏️ ja   |
| m3     | Gewicht schriftlich           | `=100%-§m§2` | automatisch |
| **m4** | Gewicht **Klausur 1**         | `50%`    | ✏️ ja   |
| m5     | Gewicht Klausur 2             | `=100%-§m§4` | automatisch |
| **m6** | Endnote: Gewicht **akt. Hj**  | `60%`    | ✏️ ja   |
| m7     | Endnote: Gewicht 1. Hj        | `=100%-§m§6` | automatisch |

Du musst also nur **m2, m4, m6** setzen – die Gegengewichte (`100% − …`) rechnen
sich selbst. Zum Bearbeiten die Spalten kurz einblenden (Formel in Zelle **n2**
löschen) oder im **Quelltextmodus** direkt die Werte in Spalte *m* ändern.

> Warum `§` und `·`? `$` rendert Obsidian als Mathe-Formel, `*` als Kursiv. Die
> neutralen Zeichen `§` (Anker) und `·` (Mal) bleiben unverändert. `$`, `*`
> funktionieren weiterhin – auf Wunsch baue ich die Vorlage darauf um.

## Die Liste

> **Eingabe:** nur **Vorname, Name, UB, Klausur 1, Klausur 2** (Punkte 0–15) und
> optional **Note 1. Hj.** (als Notenwert, z. B. `2.3`). Der Rest rechnet sich.
> Skala (*j/k*), Parameter (*l/m*) und die Hilfsspalte *n* sind per
> `=hide(j,k,l,m,n)` (Zelle **n2**) ausgeblendet.

| Vorname | Name    | UB  | Klausur 1 | Klausur 2 | Note 1. Hj. | Gesamt                                    | Note                       | Endnote                                    | Skala Pkt | Skala Note | Parameter            | Wert         | hide              |
| ------- | ------- | --- | --------- | --------- | ----------- | ----------------------------------------- | -------------------------- | ------------------------------------------ | --------- | ---------- | -------------------- | ------------ | ----------------- |
| Anna    | Müller  | 12  | 10        | 14        |             | =round(c2·§m§2+(d2·§m§4+e2·§m§5)·§m§3,1)   | =VLOOKUP(g2,[j:k],2,true)  | =IF(f2>0,round(h2·§m§6+f2·§m§7,1),h2)       | 0         | 6          | Gew. mündlich (UB)   | 60%          | =hide(j,k,l,m,n)  |
| Ben     | Schmidt | 9   | 8         | 11        | 3           | =round(c3·§m§2+(d3·§m§4+e3·§m§5)·§m§3,1)   | =VLOOKUP(g3,[j:k],2,true)  | =IF(f3>0,round(h3·§m§6+f3·§m§7,1),h3)       | 1         | 5.3        | Gew. schriftlich     | =100%-§m§2   |                   |
| Cara    | Wolf    | 14  | 15        | 13        |             | =round(c4·§m§2+(d4·§m§4+e4·§m§5)·§m§3,1)   | =VLOOKUP(g4,[j:k],2,true)  | =IF(f4>0,round(h4·§m§6+f4·§m§7,1),h4)       | 2         | 5          | Gew. Klausur 1       | 50%          |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 3         | 4.7        | Gew. Klausur 2       | =100%-§m§4   |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 4         | 4.3        | Endnote: akt. Hj     | 60%          |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 5         | 4          | Endnote: 1. Hj       | =100%-§m§6   |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 6         | 3.7        |                      |              |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 7         | 3.3        |                      |              |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 8         | 3          |                      |              |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 9         | 2.7        |                      |              |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 10        | 2.3        |                      |              |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 11        | 2          |                      |              |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 12        | 1.7        |                      |              |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 13        | 1.3        |                      |              |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 14        | 1          |                      |              |                   |
|         |         |     |           |           |             |                                           |                            |                                            | 15        | 0.7        |                      |              |                   |

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
  down"** (Befehlspalette oder Rechtsklick) ausführen. Die `§m§…`-Bezüge auf die
  Parameter bleiben dabei fix, die Schüler-Bezüge (`c2`→`c3`…) wandern mit. Tipp:
  nur bis zur letzten belegten Zeile füllen.
- **Gewichte ändern:** siehe oben – nur **m2, m4, m6**.
- **Skala/Parameter ein-/ausblenden:** Formel in **n2** (`=hide(j,k,l,m,n)`)
  löschen bzw. wieder setzen.
- **+/- Skala** (z. B. „1+", „2-") statt Dezimalnote: derzeit werden Werte wie
  `1+` als Zahl `1` interpretiert. Falls du das brauchst – sag Bescheid, kleine
  separate Erweiterung.

## Bewusste Abweichungen vom Original

- **Eine Tabelle** statt fünf Blätter (Cross-Sheet-Referenzen gibt es in CalcCraft
  noch nicht). UB und Klausurnoten werden direkt eingetragen.
- **Note als Zahl** (Dezimal, z. B. `1.7`) statt der +/- Skala (`1+`, `2-`).
- **Zusatzleistungen** (Bonus-Spalten M–U im Original) sind weggelassen, um die
  Vorlage übersichtlich zu halten – können bei Bedarf ergänzt werden.
- **Punkte/Notenwerte-Umschalter** (`H11 = P/N`) entfällt; es wird direkt der
  Notenwert ausgegeben.
