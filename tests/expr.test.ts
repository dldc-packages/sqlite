import { builder as b, printNode } from '../src/mod';
import { format, sql } from './utils/sql';

test('Basic Expr', () => {
  const node = b.Expr.equal(b.Expr.literal(1), b.Expr.literal(2));

  expect(format(printNode(node))).toBe(sql`
    1 == 2
  `);
});

test('Auto precedence', () => {
  const col = b.Expr.column;

  const andExpr = b.Expr.and(col('a'), col('b'));
  const orExpr = b.Expr.or(col('a'), col('b'));

  expect(format(printNode(andExpr))).toBe(sql`a AND b`);
  expect(format(printNode(orExpr))).toBe(sql`a OR b`);

  const orInAnd = b.Expr.and(col('c'), orExpr);
  expect(format(printNode(orInAnd))).toBe(sql`c AND (a OR b)`);

  const andInOr = b.Expr.or(col('c'), andExpr);
  expect(format(printNode(andInOr))).toBe(sql`c OR a AND b`);

  const nestedOr = b.Expr.or(col('c'), orExpr);
  expect(format(printNode(nestedOr))).toBe(sql`c OR (a OR b)`);
});
