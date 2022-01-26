import { printNode, createNode, Node, nonEmptyList } from '../src/mod';

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
      variant: 'TableOrSubquery',
      tableOrSubqueries: nonEmptyList(
        createNode('TableOrSubquery', {
          variant: 'Table',
          table: identifier('users'),
        })
      ),
    },
    resultColumns: nonEmptyList(
      createNode('ResultColumn', {
        variant: 'Star',
      })
    ),
  });

  expect(printNode(node)).toBe('SELECT * FROM `users`');
});
