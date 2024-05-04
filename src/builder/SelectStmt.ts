import type { Expr as Exp, Identifier, Node } from "../Node.ts";
import { createNode } from "../Node.ts";
import type { NonEmptyArray } from "../Utils.ts";
import { arrayToNonEmptyArray } from "../Utils.ts";
import { Expr } from "./Expr.ts";

export type JoinItem = {
  joinOperator: Node<"JoinOperator">;
  tableOrSubquery: Node<"TableOrSubquery">;
  joinConstraint?: Node<"JoinConstraint">;
};

export function Join(
  tableOrSubquery: Node<"TableOrSubquery">,
  joinOperator: Node<"JoinOperator">,
  joinTableOrSubquery: Node<"TableOrSubquery">,
  joinConstraint?: Node<"JoinConstraint">,
): Node<"JoinClause"> {
  return createNode("JoinClause", {
    tableOrSubquery,
    joins: [{
      joinOperator,
      tableOrSubquery: joinTableOrSubquery,
      joinConstraint,
    }],
  });
}

export function CommaJoinOperator(): Node<"JoinOperator"> {
  return createNode("JoinOperator", { variant: "Comma" });
}

export function JoinOperator(
  join?: "Left" | "Right" | "Full",
  natural?: true,
): Node<"JoinOperator"> {
  return createNode("JoinOperator", { variant: "Join", join, natural });
}

export function InnerJoinOperator(natural?: true): Node<"JoinOperator"> {
  return createNode("JoinOperator", { variant: "InnerJoin", natural });
}

export function OnJoinConstraint(expr: Exp): Node<"JoinConstraint"> {
  return createNode("JoinConstraint", { variant: "On", expr });
}

export function UsingJoinConstraint(
  columns: NonEmptyArray<Identifier | string>,
): Node<"JoinConstraint"> {
  return createNode("JoinConstraint", {
    variant: "Using",
    columnNames: arrayToNonEmptyArray(
      columns.map((v): Identifier => Expr.identifier(v)),
    ),
  });
}

export function Joins(
  tableOrSubquery: Node<"TableOrSubquery">,
  firstJoin: JoinItem,
  ...otherJoin: Array<JoinItem>
): Node<"JoinClause"> {
  return createNode("JoinClause", {
    tableOrSubquery,
    joins: [firstJoin, ...otherJoin],
  });
}

export type SelectFrom = Extract<
  Node<"SelectCore">,
  { variant: "Select" }
>["from"];

export type SelectStmtOptions = {
  distinct?: "Distinct" | "All";
  resultColumns: Array<Node<"ResultColumn">>;
  from: SelectFrom;
  where?: Exp;
  orderBy?: Node<"SelectStmt">["orderBy"];
  limit?: Node<"SelectStmt">["limit"];
  groupBy?: Extract<Node<"SelectCore">, { variant: "Select" }>["groupBy"];
};

export function build({
  distinct,
  resultColumns,
  from,
  where,
  limit,
  orderBy,
  groupBy,
}: SelectStmtOptions): Node<"SelectStmt"> {
  return createNode("SelectStmt", {
    select: createNode("SelectCore", {
      variant: "Select",
      distinct,
      resultColumns: arrayToNonEmptyArray(resultColumns),
      from,
      where,
      groupBy,
    }),
    limit,
    orderBy,
  });
}

export function Table(
  tableName: string,
  { schema, alias }: {
    schema?: Identifier | string;
    alias?: Identifier | string;
  } = {},
): Node<"TableOrSubquery"> {
  return createNode("TableOrSubquery", {
    variant: "Table",
    schemaName: schema ? Expr.identifier(schema) : undefined,
    tableName: Expr.identifier(tableName),
    alias: alias ? { tableAlias: Expr.identifier(alias), as: true } : undefined,
  });
}

export function Subquery(
  selectStmt: Node<"SelectStmt">,
  alias?: Identifier | string,
): Node<"TableOrSubquery"> {
  return createNode("TableOrSubquery", {
    variant: "Select",
    selectStmt: selectStmt,
    alias: alias ? { tableAlias: Expr.identifier(alias), as: true } : undefined,
  });
}

export function FromTable(
  tableName: string,
  { schema, alias }: {
    schema?: Identifier | string;
    alias?: Identifier | string;
  } = {},
): SelectFrom {
  return {
    variant: "TablesOrSubqueries",
    tablesOrSubqueries: [Table(tableName, { schema, alias })],
  };
}

export function FromTables(
  firstTable: Node<"TableOrSubquery">,
  ...otherTables: Array<Node<"TableOrSubquery">>
): SelectFrom {
  return {
    variant: "TablesOrSubqueries",
    tablesOrSubqueries: [firstTable, ...otherTables],
  };
}

export function FromJoins(
  tableOrSubquery: Node<"TableOrSubquery">,
  firstJoin: JoinItem,
  ...otherJoin: Array<JoinItem>
): SelectFrom {
  return {
    variant: "Join",
    joinClause: Joins(tableOrSubquery, firstJoin, ...otherJoin),
  };
}

export function FromJoin(
  tableOrSubquery: Node<"TableOrSubquery">,
  joinOperator: Node<"JoinOperator">,
  joinTableOrSubquery: Node<"TableOrSubquery">,
  joinConstraint?: Node<"JoinConstraint">,
): SelectFrom {
  return {
    variant: "Join",
    joinClause: Join(
      tableOrSubquery,
      joinOperator,
      joinTableOrSubquery,
      joinConstraint,
    ),
  };
}
