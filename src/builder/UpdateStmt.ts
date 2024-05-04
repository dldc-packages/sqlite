import * as n from "../Node.ts";
import { arrayToNonEmptyArray } from "../Utils.ts";
import { Expr } from "./Expr.ts";
import { integer } from "./Literal.ts";

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export type SetItems = Node<"UpdateStmtLimited">["setItems"];

export type SetItem = SetItems extends Array<infer I> ? I : never;

export type UpdateStmtOptions = {
  schema?: string | Id;
  where?: Exp;
  limit?: number;
  setItems: Array<SetItem>;
};

export function build(
  table: string | Id,
  { where, schema, limit, setItems }: UpdateStmtOptions,
): Node<"UpdateStmtLimited"> {
  return n.createNode("UpdateStmtLimited", {
    qualifiedTableName: n.createNode("QualifiedTableName", {
      tableName: Expr.identifier(table),
      schemaName: schema ? Expr.identifier(schema) : undefined,
    }),
    where: where ? { expr: where } : undefined,
    limit: limit === undefined ? undefined : { expr: integer(limit) },
    setItems: arrayToNonEmptyArray(setItems),
  });
}

export function ColumnName(columnName: string | Id, value: Exp): SetItem {
  return {
    variant: "ColumnName",
    columnName: Expr.identifier(columnName),
    expr: value,
  };
}

export function ColumnNameList(
  columns: Array<string | Id>,
  value: Exp,
): SetItem {
  return {
    variant: "ColumnNameList",
    columnNameList: n.createNode("ColumnNameList", {
      columnNames: arrayToNonEmptyArray(
        columns.map((v): Id => Expr.identifier(v)),
      ),
    }),
    expr: value,
  };
}
