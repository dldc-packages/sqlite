import * as n from "../Node.ts";
import type { NonEmptyArray } from "../Utils.ts";
import { Expr } from "./Expr.ts";
import { integer } from "./Literal.ts";

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export type DeleteStmtOptions = {
  schema?: string | Id;
  where?: Exp;
  limit?: number;
  orderBy?: NonEmptyArray<Node<"OrderingTerm">>;
};

export function build(
  table: string | Id,
  { where, schema, limit, orderBy }: DeleteStmtOptions = {},
): n.Node<"DeleteStmtLimited"> {
  return n.createNode("DeleteStmtLimited", {
    qualifiedTableName: n.createNode("QualifiedTableName", {
      tableName: Expr.identifier(table),
      schemaName: schema ? Expr.identifier(schema) : undefined,
    }),
    where,
    limit: limit === undefined ? undefined : { expr: integer(limit) },
    orderBy,
  });
}
