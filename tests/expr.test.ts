import { expect } from "$std/expect/mod.ts";
import { builder as b, printNode } from "../mod.ts";
import { format, sql } from "./utils/sql.ts";

Deno.test("Basic Expr", () => {
  const node = b.Operations.equal(b.Literal.literal(1), b.Literal.literal(2));

  expect(format(printNode(node))).toBe(sql`
    1 == 2
  `);
});

Deno.test("Auto precedence", () => {
  const col = b.Expr.column;

  const andExpr = b.Operations.and(col("a"), col("b"));
  const orExpr = b.Operations.or(col("a"), col("b"));

  expect(format(printNode(andExpr))).toBe(sql`a AND b`);
  expect(format(printNode(orExpr))).toBe(sql`a OR b`);

  const orInAnd = b.Operations.and(col("c"), orExpr);
  expect(format(printNode(orInAnd))).toBe(sql`c AND (a OR b)`);

  const andInOr = b.Operations.or(col("c"), andExpr);
  expect(format(printNode(andInOr))).toBe(sql`c OR a AND b`);

  const nestedOr = b.Operations.or(col("c"), orExpr);
  expect(format(printNode(nestedOr))).toBe(sql`c OR (a OR b)`);
});
