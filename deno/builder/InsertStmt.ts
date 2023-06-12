import * as n from '../Node.ts';
import { arrayToNonEmptyArray } from '../Utils.ts';
import { Expr } from './Expr.ts';

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export type InsertStmtData = Node<'InsertStmt'>['data'];

export type InsertStmtOptions = {
  schema?: string | Id;
  alias?: string | Id;
  columnNames?: Array<string | Id>;
  data: InsertStmtData;
  returningClause?: Node<'ReturningClause'>;
};

export function InsertStmt(
  table: string | Id,
  { data, alias, columnNames, schema, returningClause }: InsertStmtOptions
): Node<'InsertStmt'> {
  return n.createNode('InsertStmt', {
    tableName: Expr.identifier(table),
    data,
    columnNames: columnNames ? arrayToNonEmptyArray(columnNames.map((col) => Expr.identifier(col))) : undefined,
    alias: alias ? Expr.identifier(alias) : undefined,
    schemaName: schema ? Expr.identifier(schema) : undefined,
    method: { variant: 'InsertInto' },
    returningClause,
  });
}

export const InsertStmtData = {
  Values(rows: Array<Array<Exp>>, upsertClause?: Node<'UpsertClause'>): InsertStmtData {
    return {
      variant: 'Values',
      rows: arrayToNonEmptyArray(rows.map((cols) => arrayToNonEmptyArray(cols))),
      upsertClause,
    };
  },
  Select(selectStmt: Node<'SelectStmt'>, upsertClause?: Node<'UpsertClause'>): InsertStmtData {
    return { variant: 'Select', selectStmt, upsertClause };
  },
};
