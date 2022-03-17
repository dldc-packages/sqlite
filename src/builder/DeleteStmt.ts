import * as n from '../Node';
import { NonEmptyArray } from '../Utils';
import { Expr, Identifier } from './Expr';

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export type DeleteStmtOptions = {
  schema?: string | Id;
  where?: Exp;
  limit?: number;
  orderBy?: NonEmptyArray<Node<'OrderingTerm'>>;
};

export function DeleteStmt(table: string | Id, { where, schema, limit, orderBy }: DeleteStmtOptions): n.Node<'DeleteStmtLimited'> {
  return n.createNode('DeleteStmtLimited', {
    qualifiedTableName: n.createNode('QualifiedTableName', {
      table: Identifier(table),
      schema: schema ? Identifier(schema) : undefined,
    }),
    where,
    limit: limit === undefined ? undefined : { expr: Expr.LiteralValue.NumericLiteral.Integer(limit) },
    orderBy,
  });
}
