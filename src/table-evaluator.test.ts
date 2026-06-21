/**
 * Characterization tests for TableEvaluator.
 *
 * These tests lock in the CURRENT behaviour of the evaluator before any
 * refactoring. They are intentionally descriptive rather than aspirational:
 * where today's behaviour is surprising, the test documents it (and says so),
 * so that a later refactor surfaces any unintended change.
 *
 * The evaluator is DOM-free, so these run in plain Node via Vitest without
 * Obsidian. Display concerns (precision rounding, digit grouping) live in
 * main.ts, NOT here, so the evaluator returns raw numbers.
 */
import { describe, it, expect } from "vitest";
import { TableEvaluator } from "./table-evaluator";

// cellType enum is not exported; mirror the numeric values used internally.
const TYPE = { number: 1, formula: 2, matrix: 3, escaped_text: 4 } as const;

function run(grid: string[][], settings?: Record<string, unknown>) {
  return new TableEvaluator().evaluateTable(grid, settings);
}

describe("scalars and cell types", () => {
  it("returns plain numbers, text and null for empty cells", () => {
    const { values } = run([["5", "x", ""]]);
    expect(values[0][0]).toBe(5);
    expect(values[0][1]).toBe("x");
    expect(values[0][2]).toBeNull();
  });

  it("classifies cell types: number / formula / text / empty", () => {
    const { cellTypes } = run([["5", "=a1+1", "x", ""]]);
    expect(cellTypes[0]).toEqual([
      TYPE.number,
      TYPE.formula,
      TYPE.number, // text is stored as a "number" type cell (raw value)
      TYPE.number, // empty is also a "number" type cell with null value
    ]);
  });

  it("evaluates a simple addition", () => {
    expect(run([["5", "12", "=a1+b1"]]).values[0][2]).toBe(17);
  });

  it("evaluates division and comparisons", () => {
    expect(run([["10", "4", "=a1/b1"]]).values[0][2]).toBe(2.5);
    expect(run([["5", "=a1>3"]]).values[0][1]).toBe(true);
  });

  it("supports large powers", () => {
    expect(run([["=2^64"]]).values[0][0]).toBe(18446744073709552000);
  });

  it("exposes constants like pi", () => {
    expect(run([["=pi"]]).values[0][0]).toBeCloseTo(Math.PI, 12);
  });
});

describe("cell references", () => {
  it("resolves absolute a1-style references", () => {
    expect(run([["5", "12"], ["=a1+b1", ""]]).values[1][0]).toBe(17);
  });

  it("resolves relative column/row references (+0c-1r = cell above)", () => {
    expect(run([["5"], ["=+0c-1r"]]).values[1][0]).toBe(5);
  });

  it("resolves mixed letter + relative row (a+1r = column a, one row down)", () => {
    expect(run([["1", "=a+1r"], ["9", ""]]).values[0][1]).toBe(9);
  });
});

describe("ranges", () => {
  it("sums an explicit rectangular range", () => {
    expect(run([["5", "12"], ["7", "5"], ["=sum(a1:b2)", ""]]).values[2][0]).toBe(29);
  });

  it("column range a:a skips the header row", () => {
    // a1=3 is treated as a header and excluded; sums a2+a3 = 9
    expect(run([["3", "=sum(a:a)"], ["4", ""], ["5", ""]]).values[0][1]).toBe(9);
  });

  it("row range 1:1 sums the whole first row", () => {
    expect(run([["3", "4", "5"], ["=sum(1:1)", "", ""]]).values[1][0]).toBe(12);
  });

  it("supports relative range endpoints sum(a1:+0c-1r)", () => {
    expect(run([["5"], ["7"], ["9"], ["=sum(a1:+0c-1r)"]]).values[3][0]).toBe(21);
  });

  it("ignores text values inside a summed range", () => {
    expect(run([["5", "x", "7", "=sum(a1:c1)"]]).values[0][3]).toBe(12);
  });
});

describe("matrices and vectors", () => {
  it("adds two column vectors and expands across cells", () => {
    const { values } = run([
      ["5", "12", "=[a1:a3]+[b1:b3]"],
      ["7", "5", ""],
      ["19", "10", ""],
    ]);
    expect(values.map((r) => r[2])).toEqual([17, 12, 29]);
  });

  it("expands a column-range matrix [a:a] (skipping the header)", () => {
    const { values } = run([["1", "=[a:a]"], ["2", ""], ["3", ""]]);
    expect(values.map((r) => r[1])).toEqual([2, 3, null]);
  });

  it("transposes a matrix", () => {
    const { values } = run([
      ["1", "2", "3", "=transpose([a1:c3])"],
      ["4", "5", "6", ""],
      ["7", "8", "9", ""],
    ]);
    // first column of the transpose result is the first row of the input
    expect(values.map((r) => r[3])).toEqual([1, 2, 3]);
  });

  it("computes a determinant", () => {
    const { values } = run([
      ["1", "2", "3", "=det([a1:c3])"],
      ["4", "5", "7", ""],
      ["7", "8", "9", ""],
    ]);
    expect(values[0][3]).toBe(6);
  });

  it("marks expanded cells as matrix type", () => {
    const { cellTypes } = run([["1", "=[a:a]"], ["2", ""], ["3", ""]]);
    expect(cellTypes[1][1]).toBe(TYPE.matrix);
  });
});

describe("units (mathjs)", () => {
  it("adds compatible units and normalises", () => {
    const v = run([["5 kg", "3000 g", "=a1+b1"]]).values[0][2];
    expect(v.toString()).toBe("8 kg");
  });

  it("converts between unit systems", () => {
    const v = run([['12 inch', '=to(unit(a1),"cm")']]).values[0][1];
    expect(v.toString()).toBe("30.479999999999997 cm");
  });

  it("sum() skips empty cells so unit ranges still work", () => {
    const v = run([["5 cm", "", "=sum(a1:b1)"]]).values[0][2];
    expect(v.toString()).toBe("5 cm");
  });
});

describe("errors", () => {
  it("detects direct circular references as loops", () => {
    const { errors } = run([["=b1", "=a1"]]);
    expect(errors[0][0]).toContain("loop");
    expect(errors[0][1]).toContain("loop");
  });

  it("reports references outside the table", () => {
    const { errors } = run([["=z9"]]);
    expect(errors[0][0]).toContain("out of");
  });

  it("records an error message for malformed formulas", () => {
    const { errors } = run([["=a1+@@"]]);
    expect(errors[0][0]).toBeTruthy();
  });

  it("rejects formulas containing forbidden identifiers", () => {
    const { errors } = run([['=import("fs")']]);
    expect(errors[0][0]).toContain("forbidden");
  });

  it("rejects overly long formulas", () => {
    const longFormula = "=1" + "+1".repeat(600); // > 1000 chars
    const { errors } = run([[longFormula]]);
    expect(errors[0][0]).toContain("too long");
  });

  it("still allows matrices that contain quoted text (not a false positive)", () => {
    // The previous (dead) sanitizer would have rejected bracketed strings; the
    // new guard must not. isNumeric over a text column relies on this.
    const { values } = run([["3", "=isNumeric([a:a])"], ["x", ""], ["2", ""]]);
    expect(values.map((r) => r[1])).toEqual([0, 1, null]);
  });
});

describe("escaped text", () => {
  it("treats '= as literal text and strips the apostrophe", () => {
    const { values, cellTypes } = run([["'=hello"]]);
    expect(values[0][0]).toBe("=hello");
    expect(cellTypes[0][0]).toBe(TYPE.escaped_text);
  });
});

describe("locale-aware number parsing", () => {
  it("parses comma as decimal separator", () => {
    const v = run([["1,5", "2,5", "=a1+b1"]], {
      decimalSeparator: ",",
      groupingSeparator: ".",
    }).values[0][2];
    expect(v).toBe(4);
  });

  it("strips the grouping separator when parsing input", () => {
    // With decimal "," and grouping ".", "1.234" parses as 1234 (-> 1235).
    // (Phase 1 fixed a double-escaped regex that previously left the grouping
    // separator in place, yielding 2.234.)
    const v = run([["1.234", "=a1+1"]], {
      decimalSeparator: ",",
      groupingSeparator: ".",
    }).values[0][1];
    expect(v).toBe(1235);
  });
});

describe("functions", () => {
  it("evaluates nested mathjs functions", () => {
    expect(run([["2", "=round(sqrt(a1),3)"]]).values[0][1]).toBe(1.414);
  });

  it("format(value, precision) returns a fixed-precision string", () => {
    expect(run([["=format(1/3,5)"]]).values[0][0]).toBe("0.33333");
  });

  it("isNumeric maps over a column (1 numeric, 0 non-numeric)", () => {
    const { values } = run([["3", "=isNumeric([a:a])"], ["x", ""], ["2", ""]]);
    expect(values.map((r) => r[1])).toEqual([0, 1, null]);
  });
});

describe("percent literals", () => {
  it("parses a percent value cell as its decimal fraction", () => {
    expect(run([["60%"]]).values[0][0]).toBe(0.6);
    expect(run([["100%"]]).values[0][0]).toBe(1);
  });

  it("evaluates a percent literal inside a formula", () => {
    expect(run([["=50%"]]).values[0][0]).toBe(0.5);
    expect(run([["=100%"]]).values[0][0]).toBe(1);
  });

  it("multiplies a value by a percent literal in a formula", () => {
    expect(run([["200", "=a1*60%"]]).values[0][1]).toBe(120);
  });

  it("uses a percent value cell from a formula reference", () => {
    expect(run([["60%", "=a1*100"]]).values[0][1]).toBe(60);
  });

  it("supports decimals in percent literals (formula and locale value)", () => {
    expect(run([["=12.5%"]]).values[0][0]).toBe(0.125);
    const v = run([["12,5%"]], {
      decimalSeparator: ",",
      groupingSeparator: ".",
    }).values[0][0];
    expect(v).toBe(0.125);
  });

  it("does not break the mod() function", () => {
    expect(run([["=mod(10,3)"]]).values[0][0]).toBe(1);
  });
});

describe("Excel-style functions", () => {
  it("IF returns the matching branch", () => {
    expect(run([["=IF(5>3, 10, 20)"]]).values[0][0]).toBe(10);
    expect(run([["=IF(2>3, 10, 20)"]]).values[0][0]).toBe(20);
  });

  it("IF does not evaluate the untaken branch (lazy)", () => {
    // The false branch would throw (VLOOKUP not found); IF must not run it.
    const { values, errors } = run([
      ["1", "A", "=IF(1>0, 99, VLOOKUP(7,[a1:b1],2,false))"],
    ]);
    expect(values[0][2]).toBe(99);
    expect(errors[0][2]).toBeNull();
  });

  it("IFERROR returns the value when there is no error", () => {
    expect(run([["=IFERROR(10, 5)"]]).values[0][0]).toBe(10);
  });

  it("IFERROR catches NaN and thrown errors", () => {
    expect(run([["=IFERROR(0/0, 5)"]]).values[0][0]).toBe(5);
    // VLOOKUP miss throws "N/A" inside mathjs; IFERROR returns the fallback.
    // (Lookup table must not overlap the formula cell, or it self-references.)
    const grid = [["1", "A"], ["2", "B"], ["=IFERROR(VLOOKUP(9,[a1:b2],2,false), 0)", ""]];
    expect(run(grid).values[2][0]).toBe(0);
  });

  it("AND / OR / NOT evaluate logically", () => {
    expect(run([["=AND(1>0, 2>1)"]]).values[0][0]).toBe(true);
    expect(run([["=AND(1>0, 2<1)"]]).values[0][0]).toBe(false);
    expect(run([["=OR(1<0, 2>1)"]]).values[0][0]).toBe(true);
    expect(run([["=NOT(1>2)"]]).values[0][0]).toBe(true);
  });

  it("AVERAGE averages numbers, ignoring blanks", () => {
    expect(run([["=AVERAGE(2,4,6)"]]).values[0][0]).toBe(4);
    expect(run([["2", "4", "6", "=AVERAGE(a1:c1)"]]).values[0][3]).toBe(4);
    // empty cell is ignored (consistent with sum())
    expect(run([["2", "", "4", "=AVERAGE(a1:c1)"]]).values[0][3]).toBe(3);
  });

  it("ROUND rounds to the given number of decimals", () => {
    expect(run([["=ROUND(3.14159, 2)"]]).values[0][0]).toBe(3.14);
    expect(run([["=ROUND(2.7, 0)"]]).values[0][0]).toBe(3);
  });

  it("VLOOKUP approximate match finds the largest key <= lookup", () => {
    const grid = [
      ["0.7", "A"],
      ["1", "B"],
      ["1.3", "C"],
      ["", "=VLOOKUP(1.2,[a1:b3],2,true)"],
    ];
    expect(run(grid).values[3][1]).toBe("B");
  });

  it("VLOOKUP exact match returns the row value", () => {
    const grid = [
      ["0.7", "A"],
      ["1", "B"],
      ["1.3", "C"],
      ["", "=VLOOKUP(1,[a1:b3],2,false)"],
    ];
    expect(run(grid).values[3][1]).toBe("B");
  });
});
