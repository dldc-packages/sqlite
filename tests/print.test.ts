import { printNode, createNode, Node, builder as b } from '../src/mod';

function identifier(name: string): Node<'Identifier'> {
  return createNode('Identifier', { variant: 'Backtick', name });
}

test('Print AlterTableStmt', () => {
  const node = createNode('AlterTableStmt', {
    table: identifier('users'),
    action: {
      variant: 'RenameTo',
      newTableName: identifier('users_new'),
    },
  });

  expect(printNode(node)).toBe('ALTER TABLE `users` RENAME TO `users_new`');
});

test('Print Select', () => {
  const node = createNode('SelectCore', {
    variant: 'Select',
    from: {
      variant: 'TablesOrSubqueries',
      tablesOrSubqueries: [
        createNode('TableOrSubquery', {
          variant: 'Table',
          table: identifier('users'),
        }),
      ],
    },
    resultColumns: [
      createNode('ResultColumn', {
        variant: 'Star',
      }),
    ],
  });

  expect(printNode(node)).toBe('SELECT * FROM `users`');
});

test('Print Select using builder', () => {
  const node = b.SelectStmt({
    from: b.From.Join(
      b.TableOrSubquery.Table('users'),
      b.JoinOperator.Join('Left'),
      b.TableOrSubquery.Table('posts'),
      b.JoinConstraint.On(b.Expr.Equal(b.parseColumn('users.id'), b.parseColumn('posts.user_id')))
    ),
    resultColumns: [b.ResultColumn.parseColumn('users.id'), b.ResultColumn.TableStar('users')],
    where: b.Expr.Equal(b.parseColumn('users.name'), b.Expr.literal('azerty')),
  });

  expect(printNode(node)).toBe(
    "SELECT `users`.`id`, `users`.* FROM `users` LEFT JOIN `posts` ON `users`.`id` == `posts`.`user_id` WHERE `users`.`name` == 'azerty'"
  );
});

test('Print join of table and subquery', () => {
  const node = b.SelectStmt({
    from: b.From.Join(
      b.TableOrSubquery.Table('posts'),
      b.JoinOperator.Join('Inner'),
      // Find user
      b.TableOrSubquery.Select(
        b.SelectStmt({
          from: b.From.Table('users'),
          resultColumns: [b.ResultColumn.Star()],
          where: b.Expr.Equal(b.parseColumn('users.name'), b.Expr.literal('azerty')),
        }),
        `users`
      ),
      b.JoinConstraint.On(b.Expr.Equal(b.parseColumn('users.id'), b.parseColumn('posts.user_id')))
    ),
    resultColumns: [b.ResultColumn.Star()],
  });

  expect(printNode(node)).toBe(
    "SELECT * FROM `posts` INNER JOIN (SELECT * FROM `users` WHERE `users`.`name` == 'azerty') AS `users` ON `users`.`id` == `posts`.`user_id`"
  );
});
