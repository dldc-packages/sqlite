import * as n from "../Node.ts";

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

const SIMPLE_IDENTIFIER_REG = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const Expr = {
  identifier,
  column,
  columnFromString,
};

export function identifier(name: string | Id, variant?: Id["variant"]): Id {
  if (typeof name !== "string") {
    return name;
  }
  const variantResolved: Id["variant"] = variant ??
    (SIMPLE_IDENTIFIER_REG.test(name) ? "Basic" : "Backtick");
  return n.createNode("Identifier", {
    name,
    variant: variantResolved,
  });
}

/**
 * Parse simple column suche as:
 * - col
 * - table.col
 * - schema.table.col
 */
export function columnFromString(col: string): Node<"Column"> {
  const parts = col.split(".");
  if (parts.length === 1) {
    return column(parts[0]);
  }
  if (parts.length === 2) {
    return column({ table: parts[0], column: parts[1] });
  }
  if (parts.length === 3) {
    return column({
      table: { schema: parts[0], table: parts[1] },
      column: parts[2],
    });
  }
  throw new Error(`Invalid column: ${col} (too many parts)`);
}

export function column(
  column: string | {
    column: string | Id;
    table?: string | { table: string | Id; schema?: string | Id };
  },
): Node<"Column"> {
  if (typeof column === "string") {
    return n.createNode("Column", { columnName: identifier(column) });
  }
  const table = column.table;
  return n.createNode("Column", {
    columnName: identifier(column.column),
    table: table === undefined
      ? undefined
      : typeof table === "string"
      ? { name: identifier(table) }
      : {
        name: identifier(table.table),
        schema: table.schema ? identifier(table.schema) : undefined,
      },
  });
}
