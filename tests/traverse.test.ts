import { expect, test, vi } from 'vitest';
import { Ast, Utils, builder as b } from '../src/mod';

test('Travers Select using builder', () => {
  const node = b.SelectStmt({
    from: b.From.Join(
      b.TableOrSubquery.Table('users'),
      b.JoinOperator.Join('Left'),
      b.TableOrSubquery.Table('posts'),
      b.JoinConstraint.On(b.Expr.equal(b.Expr.columnFromString('users.id'), b.Expr.columnFromString('posts.user_id')))
    ),
    resultColumns: [b.ResultColumn.columnFromString('users.id'), b.ResultColumn.TableStar('users')],
    where: b.Expr.equal(b.Expr.columnFromString('users.name'), b.Expr.literal('azerty')),
  });

  const nodeKinds: Array<Ast.NodeKind> = [];

  const onNode = vi.fn((node: Ast.Node) => {
    nodeKinds.push(node.kind);
    return null;
  });

  Utils.traverse(node, onNode);

  expect(onNode).toHaveBeenCalledTimes(27);
  expect(nodeKinds).toEqual([
    'SelectStmt',
    'SelectCore',
    'ResultColumn',
    'Column',
    'Identifier',
    'Identifier',
    'ResultColumn',
    'Identifier',
    'JoinClause',
    'TableOrSubquery',
    'Identifier',
    'JoinOperator',
    'TableOrSubquery',
    'Identifier',
    'JoinConstraint',
    'Equal',
    'Column',
    'Identifier',
    'Identifier',
    'Column',
    'Identifier',
    'Identifier',
    'Equal',
    'Column',
    'Identifier',
    'Identifier',
    'StringLiteral',
  ]);
});
