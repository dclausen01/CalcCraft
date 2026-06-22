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
| Gewichtung in Spalte *H* (`$H$2` …)      | **Prozent-Literale** direkt in der Gesamt-Formel  |
| Blatt *Schlüssel* (`$A$2:$B$17`)         | inline **Notenskala** in Spalten **j/k**          |
| `VLOOKUP(...; Schlüssel!$A$2:$B$17; …)`   | `VLOOKUP(...; [j:k]; …)` (Spalten-Range)          |

## Gewichtung (so anpassen)

Die Gewichte stecken als Prozentwerte in der **Gesamt-Formel** (Spalte *g*):

```
=round( UB·60% + (Klausur1·50% + Klausur2·50%)·40% , 1)
```

> Hinweis: Als Malzeichen wird hier **`·`** verwendet (statt `*`). Grund: `*`
> rendert Obsidian als *Kursivschrift*; `·` bleibt unverändert. CalcCraft
> versteht `·`, `×` und `*` gleichermaßen als Multiplikation. Genauso gibt es
> **`§`** als Anker‑Alternative zu `$` (das Obsidian als Mathe‑Formel rendert),
> z. B. `[§a§2:§b§9]`.

- **Mündlich (UB): 60 %**, **Schriftlich gesamt: 40 %**
- Innerhalb schriftlich: **Klausur 1: 50 %**, **Klausur 2: 50 %**

Zum Ändern einfach die Prozentzahlen in der Formel anpassen (in Zeile 2) und
**herunterziehen**. *(Das Original nutzt 100 %/0 % für K1/K2, weil dort erst eine
Klausur geschrieben war – hier ist 50/50 als sinnvoller Standard gesetzt.)*

## Die Liste

> **Eingabe:** nur **Vorname, Name, UB, Klausur 1, Klausur 2** (Punkte 0–15) und
> optional **Note 1. Hj.** (als Notenwert, z. B. `2.3`). Der Rest rechnet sich.
> Die Skala (Spalten *j/k*) ist per `=hide(j,k,l)` ausgeblendet – zum Einblenden
> die Formel in Zelle **l2** löschen.

| Vorname | Name    | UB  | Klausur 1 | Klausur 2 | Note 1. Hj. | Gesamt                                | Note                       | Endnote                                | Skala Pkt | Skala Note | hide          |
| ------- | ------- | --- | --------- | --------- | ----------- | ------------------------------------- | -------------------------- | -------------------------------------- | --------- | ---------- | ------------- |
| Anna    | Müller  | 12  | 10        | 14        |             | =round(c2·60%+(d2·50%+e2·50%)·40%,1)  | =VLOOKUP(g2,[j:k],2,true)  | =IF(f2>0,round(h2·60%+f2·40%,1),h2)    | 0         | 6          | =hide(j,k,l)  |
| Ben     | Schmidt | 9   | 8         | 11        | 3           | =round(c3·60%+(d3·50%+e3·50%)·40%,1)  | =VLOOKUP(g3,[j:k],2,true)  | =IF(f3>0,round(h3·60%+f3·40%,1),h3)    | 1         | 5.3        |               |
| Cara    | Wolf    | 14  | 15        | 13        |             | =round(c4·60%+(d4·50%+e4·50%)·40%,1)  | =VLOOKUP(g4,[j:k],2,true)  | =IF(f4>0,round(h4·60%+f4·40%,1),h4)    | 2         | 5          |               |
|         |         |     |           |           |             |                                       |                            |                                        | 3         | 4.7        |               |
|         |         |     |           |           |             |                                       |                            |                                        | 4         | 4.3        |               |
|         |         |     |           |           |             |                                       |                            |                                        | 5         | 4          |               |
|         |         |     |           |           |             |                                       |                            |                                        | 6         | 3.7        |               |
|         |         |     |           |           |             |                                       |                            |                                        | 7         | 3.3        |               |
|         |         |     |           |           |             |                                       |                            |                                        | 8         | 3          |               |
|         |         |     |           |           |             |                                       |                            |                                        | 9         | 2.7        |               |
|         |         |     |           |           |             |                                       |                            |                                        | 10        | 2.3        |               |
|         |         |     |           |           |             |                                       |                            |                                        | 11        | 2          |               |
|         |         |     |           |           |             |                                       |                            |                                        | 12        | 1.7        |               |
|         |         |     |           |           |             |                                       |                            |                                        | 13        | 1.3        |               |
|         |         |     |           |           |             |                                       |                            |                                        | 14        | 1          |               |
|         |         |     |           |           |             |                                       |                            |                                        | 15        | 0.7        |               |

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
  down"** (Befehlspalette oder Rechtsklick) ausführen – die Formeln werden mit
  angepassten Bezügen heruntergezogen. Tipp: nur bis zur letzten belegten Zeile
  füllen (leere Formelzeilen würden sonst `0`/Note `6` zeigen).
- **Notenskala-Spalten ein-/ausblenden:** Formel in **l2** (`=hide(j,k,l)`)
  löschen bzw. wieder setzen.
- **Note als +/- Skala** (z. B. „1+", „2-") statt Dezimalnote: derzeit werden
  Werte wie `1+` als Zahl `1` interpretiert. Wenn du das brauchst, sag Bescheid –
  das ist eine kleine, separate Erweiterung.

## Bewusste Abweichungen vom Original

- **Eine Tabelle** statt fünf Blätter (Cross-Sheet-Referenzen gibt es in CalcCraft
  noch nicht). UB und Klausurnoten werden direkt eingetragen statt aus
  Quell-Blättern gezogen.
- **Note als Zahl** (Dezimal, z. B. `1.7`) statt der +/- Skala (`1+`, `2-`).
- **Zusatzleistungen** (Bonus-Spalten M–U im Original) sind hier weggelassen, um
  die Vorlage übersichtlich zu halten – können bei Bedarf ergänzt werden.
- **Punkte/Notenwerte-Umschalter** (`H11 = P/N`) entfällt; es wird direkt der
  Notenwert ausgegeben.
