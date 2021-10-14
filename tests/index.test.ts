import { TSQliteParser, FragmentParser, KeywordParser, NodeParser } from '../src/mod';

test('should parse literal expression', () => {
  expect(TSQliteParser.parseAdvanced(FragmentParser.Expr, '0').result).toEqual({
    exponent: undefined,
    interger: 0,
    kind: 'NumericLiteral',
    variant: 'Integer',
  });
});

test('should parse expression', () => {
  expect(TSQliteParser.parseAdvanced(FragmentParser.Expr, '5 > 3').result).toEqual({
    kind: 'GreaterThan',
    leftExpr: { exponent: undefined, interger: 5, kind: 'NumericLiteral', variant: 'Integer' },
    rightExpr: { exponent: undefined, interger: 3, kind: 'NumericLiteral', variant: 'Integer' },
    whitespaceBeforeOperator: [{ content: ' ', kind: 'Whitespace' }],
    whitespaceBeforeRightExpr: [{ content: ' ', kind: 'Whitespace' }],
  });
});

test('should parse empty as SqlStmtList', () => {
  expect(TSQliteParser.parseSqlStmtList('').result).toEqual({ items: [], kind: 'SqlStmtList' });
});

test('should parse semicolon as two empty', () => {
  expect(TSQliteParser.parseSqlStmtList(';').result).toEqual({
    items: [{ variant: 'Empty' }, { variant: 'Empty' }],
    kind: 'SqlStmtList',
  });
});

test('Parse empty statements', () => {
  expect(TSQliteParser.parseSqlStmtList('; ;; ').result.items).toEqual([
    { variant: 'Empty' },
    { variant: 'Whitespace', whitespace: [{ kind: 'Whitespace', content: ' ' }] },
    { variant: 'Empty' },
    { variant: 'Whitespace', whitespace: [{ kind: 'Whitespace', content: ' ' }] },
  ]);
});

test('Parse comment', () => {
  expect(TSQliteParser.parseSqlStmtList('/* Foo */').result.items).toEqual([
    { variant: 'Whitespace', whitespace: [{ content: ' Foo ', kind: 'CommentSyntax', variant: 'Multiline' }] },
  ]);
});

test('Parse comment with semicolon', () => {
  expect(TSQliteParser.parseSqlStmtList('/* Foo */;').result.items).toEqual([
    { variant: 'Whitespace', whitespace: [{ content: ' Foo ', kind: 'CommentSyntax', variant: 'Multiline' }] },
    { variant: 'Empty' },
  ]);
});

test('should parse line comment', () => {
  expect(TSQliteParser.parseSqlStmtList('-- hello').result.items).toEqual([
    { variant: 'Whitespace', whitespace: [{ kind: 'CommentSyntax', content: ' hello', variant: 'SingleLine', close: 'EndOfFile' }] },
  ]);
});

test('should parse keyword', () => {
  expect(TSQliteParser.parseAdvanced(KeywordParser.CREATE, 'CREATE').result).toBe('CREATE');
  expect(TSQliteParser.parseAdvanced(KeywordParser.CREATE, 'create').result).toBe('create');
  expect(TSQliteParser.parseAdvanced(KeywordParser.CREATE, 'Create').result).toBe('Create');
  expect(() => TSQliteParser.parseAdvanced(KeywordParser.CREATE, 'Created')).toThrow();
});

test('should parse expression', () => {
  expect(TSQliteParser.parseAdvanced(FragmentParser.Expr, '`anger` > 0').result.kind).toBe('GreaterThan');
});

// test('should parse expression', () => {
//   const res = TSQliteParser.parseAdvanced(FragmentParser.Expr, 'NEW.cust_addr');
//   expect(res.result.kind).toBe('Identifier');
//   expect(res.rest).toBe(null);
// });

test('should parse whitespace', () => {
  expect(TSQliteParser.parseAdvanced(FragmentParser.WhitespaceLike, '\n').result).toEqual([{ kind: 'Whitespace', content: '\n' }]);
});

test('should parse expression but not whitespace', () => {
  expect(TSQliteParser.parseAdvanced(FragmentParser.Expr, '`happiness` ').rest).toEqual(' ');
});

test('should parse indexed column', () => {
  expect(TSQliteParser.parseAdvanced(NodeParser.IndexedColumn, '`happiness` ASC').result).toEqual({
    collate: undefined,
    column: { columnName: { kind: 'Identifier', name: 'happiness', variant: 'Backtick' }, variant: 'Name' },
    direction: { ascKeyword: 'ASC', variant: 'Asc', whitespaceBeforeAscKeyword: [{ content: ' ', kind: 'Whitespace' }] },
    kind: 'IndexedColumn',
  });
});

test('should parse create index as stmt', () => {
  expect(
    TSQliteParser.parseAdvanced(NodeParser.SqlStmt, 'CREATE INDEX `bees`.`hive_state`\nON `hive` (`happiness` ASC, `anger` DESC)\nWHERE `anger` > 0').result
      .stmt.kind
  ).toEqual('CreateIndexStmt');
});

test('should parse function expression', () => {
  const res = TSQliteParser.parseAdvanced(NodeParser.FunctionInvocation, `count ( * )`);
  expect(res.result.kind).toEqual('FunctionInvocation');
  expect(res.rest).toBe(null);
});

test('should parse result column', () => {
  const res = TSQliteParser.parseAdvanced(NodeParser.ResultColumn, `count( * )`);
  expect(res.result.kind).toEqual('ResultColumn');
  expect(res.rest).toBe(null);
});

test('should parse more result column', () => {
  const res1 = TSQliteParser.parseAdvanced(NodeParser.ResultColumn, `"hat".*`);
  expect(res1.result.kind).toEqual('ResultColumn');
  expect(res1.rest).toBe(null);

  const res2 = TSQliteParser.parseAdvanced(NodeParser.ResultColumn, `COUNT(*) as pants`);
  expect(res2.result.kind).toEqual('ResultColumn');
  expect(res2.rest).toBe(null);
});

test('should parse select', () => {
  const res = TSQliteParser.parseAdvanced(NodeParser.SelectStmt, `select count( * ) from hats`);
  expect(res.result.kind).toEqual('SelectStmt');
  expect(res.rest).toBe(null);
});

// test('should parse create-table/basic-create-table.sql', () => {
//   const res = TSQliteParser.parseAdvanced(
//     NodeParser.CreateTriggerStmt,
//     `
//       CREATE TRIGGER cust_addr_chng
//       INSTEAD OF UPDATE OF cust_addr ON customer_address
//       WHEN cust_addr NOT NULL
//       BEGIN
//         UPDATE customer
//         SET cust_addr = NEW.cust_addr
//         WHERE cust_id = NEW.cust_id;
//       END
//     `.trim()
//   );
//   expect(res.result.kind).toEqual('SqlStmtList');
//   expect(res.rest).toBe(null);
// });

// test('should parse create index', () => {
//   const file = 'CREATE INDEX `bees`.`hive_state`\nON `hive` (`happiness` ASC, `anger` DESC)\nWHERE `anger` > 0';
//   expect(TSQliteParser.parseAdvanced(NodeParser.CreateIndexStmt, file).result).toEqual({
//     closeParentWhitespace: undefined,
//     ifNotExists: undefined,
//     indexTarget: {
//       dotWhitespace: undefined,
//       itemName: { kind: 'IdentifierToken', name: 'hive_state', raw: '`hive_state`', variant: 'Backtick' },
//       itemNameWhitespace: undefined,
//       schemaName: { kind: 'IdentifierToken', name: 'bees', raw: '`bees`', variant: 'Backtick' },
//       variant: 'WithSchema',
//     },
//     indexTargetWhitespace: [{ content: ' ', kind: 'WhitespaceToken' }],
//     indexWhitespace: [{ content: ' ', kind: 'WhitespaceToken' }],
//     indexedColumns: {
//       head: {
//         item: {
//           collate: undefined,
//           column: {
//             expr: {
//               columnTarget: { columnName: { kind: 'IdentifierToken', name: 'happiness', raw: '`happiness`', variant: 'Backtick' }, variant: 'WithoutTable' },
//               kind: 'Expr',
//               variant: 'Column',
//             },
//             variant: 'Expr',
//           },
//           kind: 'IndexedColumn',
//           order: { ascWhitespace: [{ content: ' ', kind: 'WhitespaceToken' }], variant: 'Asc' },
//         },
//         whitespaceBefore: undefined,
//       },
//       tail: [
//         {
//           item: {
//             item: {
//               collate: undefined,
//               column: {
//                 expr: {
//                   columnTarget: { columnName: { kind: 'IdentifierToken', name: 'anger', raw: '`anger`', variant: 'Backtick' }, variant: 'WithoutTable' },
//                   kind: 'Expr',
//                   variant: 'Column',
//                 },
//                 variant: 'Expr',
//               },
//               kind: 'IndexedColumn',
//               order: { descWhitespace: [{ content: ' ', kind: 'WhitespaceToken' }], variant: 'Desc' },
//             },
//             whitespaceBefore: [{ content: ' ', kind: 'WhitespaceToken' }],
//           },
//           sep: { commaWhitespace: undefined },
//         },
//       ],
//     },
//     kind: 'CreateIndexStmt',
//     onWhitespace: [{ content: '\n', kind: 'WhitespaceToken' }],
//     openParentWhitespace: [{ content: ' ', kind: 'WhitespaceToken' }],
//     tableName: { kind: 'IdentifierToken', name: 'hive', raw: '`hive`', variant: 'Backtick' },
//     tableNameWhitespace: [{ content: ' ', kind: 'WhitespaceToken' }],
//     unique: undefined,
//     where: {
//       expr: {
//         binaryOperator: { kind: 'BinaryOperatorToken', operator: 'GreaterThan', raw: '>' },
//         binaryOperatorWhitespace: [{ content: ' ', kind: 'WhitespaceToken' }],
//         kind: 'Expr',
//         leftExpr: {
//           columnTarget: { columnName: { kind: 'IdentifierToken', name: 'anger', raw: '`anger`', variant: 'Backtick' }, variant: 'WithoutTable' },
//           kind: 'Expr',
//           variant: 'Column',
//         },
//         rightExpr: {
//           kind: 'Expr',
//           literalValue: {
//             kind: 'LiteralValue',
//             value: { exponent: undefined, interger: 0, kind: 'NumericLiteralToken', raw: '0', value: 0, variant: 'Integer' },
//             variant: 'NumericLiteral',
//           },
//           variant: 'LiteralValue',
//         },
//         rightExprWhitespace: [{ content: ' ', kind: 'WhitespaceToken' }],
//         variant: 'BinaryOperator',
//       },
//       exprWhitespace: [{ content: ' ', kind: 'WhitespaceToken' }],
//       whereWhitespace: [{ content: '\n', kind: 'WhitespaceToken' }],
//     },
//   });
// });

// test('should parse create index as SqlStmtList', () => {
//   expect(
//     TSQliteParser.parseAdvanced(
//       NodeParser.SqlStmtList,
//       'CREATE INDEX `bees`.`hive_state`\nON `hive` (`happiness` ASC, `anger` DESC)\nWHERE `anger` > 0;'
//     ).result.items.map((i) => i.variant)
//   ).toEqual(['Stmt', 'Empty']);
// });
