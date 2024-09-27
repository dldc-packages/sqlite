import * as n from "../Node.ts";
import { Expr } from "./Expr.ts";

type Id = n.Identifier;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export type DropTableStmtOptions = {
  temp?: boolean;
  strict?: true;
  ifExists?: true;
  schema?: Id | string;
  tableConstraints?: Array<Node<"TableConstraint">>;
};

export function build(
  table: string | Id,
  { ifExists, schema }: DropTableStmtOptions = {},
): Node<"DropTableStmt"> {
  return n.createNode("DropTableStmt", {
    tableName: Expr.identifier(table),
    schemaName: schema ? Expr.identifier(schema) : undefined,
    ifExists,
  });
}
