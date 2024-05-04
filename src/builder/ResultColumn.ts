import type { Expr as Exp, Identifier, Node } from "../Node.ts";
import { createNode } from "../Node.ts";
import { Expr as AllExpr } from "./Expr.ts";

export function Expr(
  expr: Exp,
  alias?: string | Identifier,
): Node<"ResultColumn"> {
  return createNode("ResultColumn", {
    variant: "Expr",
    expr,
    alias: alias
      ? { columnName: AllExpr.identifier(alias), as: true }
      : undefined,
  });
}

export function Star(): Node<"ResultColumn"> {
  return createNode("ResultColumn", {
    variant: "Star",
  });
}

export function TableStar(
  tableName: string | Identifier,
): Node<"ResultColumn"> {
  return createNode("ResultColumn", {
    variant: "TableStar",
    tableName: AllExpr.identifier(tableName),
  });
}

export type TColumnParam =
  | string
  | {
    column: string | Identifier;
    table?: string | {
      table: string | Identifier;
      schema?: string | Identifier;
    };
  };

// Shortcut
export function column(column: TColumnParam): Node<"ResultColumn"> {
  return Expr(AllExpr.column(column));
}

export function columnFromString(col: string): Node<"ResultColumn"> {
  return Expr(AllExpr.columnFromString(col));
}
