import * as n from '../Node.ts';
import { arrayToNonEmptyArray, arrayToOptionalNonEmptyArray } from '../Utils.ts';
import { Expr } from './Expr.ts';
import { TypeName, ValidTypeName } from './TypeName.ts';

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export function ColumnDef(
  name: string | Id,
  typeName?: ValidTypeName | Node<'TypeName'>,
  columnConstraints?: Array<Node<'ColumnConstraint'>>
): Node<'ColumnDef'> {
  return n.createNode('ColumnDef', {
    columnName: Expr.identifier(name),
    typeName: typeof typeName === 'string' ? TypeName(typeName) : typeName,
    columnConstraints: arrayToOptionalNonEmptyArray(columnConstraints),
  });
}

export type CreateTableStmtOptions = {
  temp?: boolean;
  strict?: true;
  ifNotExists?: true;
  schema?: Id | string;
  tableConstraints?: Array<Node<'TableConstraint'>>;
};

export function CreateTableStmt(
  table: string | Id,
  columns: Array<Node<'ColumnDef'>>,
  { temp, strict, ifNotExists, schema, tableConstraints }: CreateTableStmtOptions = {}
): Node<'CreateTableStmt'> {
  return n.createNode('CreateTableStmt', {
    temp: temp ? 'Temp' : undefined,
    ifNotExists,
    tableName: Expr.identifier(table),
    schemaName: schema ? Expr.identifier(schema) : undefined,
    definition: {
      variant: 'Columns',
      columnDefs: arrayToNonEmptyArray(columns),
      tableConstraints: arrayToOptionalNonEmptyArray(tableConstraints),
      tableOptions: strict ? n.createNode('TableOptions', { options: [{ variant: 'Strict' }] }) : undefined,
    },
  });
}

export type ColumnConstraint_PrimaryKeyOptions = {
  direction?: 'Asc' | 'Desc';
  autoincrement?: true;
  name?: string | Id;
  conflictClause?: Node<'ConflictClause'>;
};

export const ColumnConstraint = {
  PrimaryKey({ name, autoincrement, direction }: ColumnConstraint_PrimaryKeyOptions = {}): Node<'ColumnConstraint'> {
    return n.createNode('ColumnConstraint', {
      constraintName: name ? Expr.identifier(name) : undefined,
      constraint: { variant: 'PrimaryKey', direction, autoincrement },
    });
  },
  NotNull({
    name,
    conflictClause,
  }: { name?: string | Id; conflictClause?: Node<'ConflictClause'> } = {}): Node<'ColumnConstraint'> {
    return n.createNode('ColumnConstraint', {
      constraintName: name ? Expr.identifier(name) : undefined,
      constraint: { variant: 'NotNull', conflictClause },
    });
  },
  Unique({
    name,
    conflictClause,
  }: { name?: string | Id; conflictClause?: Node<'ConflictClause'> } = {}): Node<'ColumnConstraint'> {
    return n.createNode('ColumnConstraint', {
      constraintName: name ? Expr.identifier(name) : undefined,
      constraint: { variant: 'Unique', conflictClause },
    });
  },
  ForeignKey(foreignKeyClause: Node<'ForeignKeyClause'>, name?: string | Id): Node<'ColumnConstraint'> {
    return n.createNode('ColumnConstraint', {
      constraintName: name ? Expr.identifier(name) : undefined,
      constraint: { variant: 'ForeignKey', foreignKeyClause },
    });
  },
  DefaultExpr(expr: Exp, name?: string | Id): Node<'ColumnConstraint'> {
    return n.createNode('ColumnConstraint', {
      constraintName: name ? Expr.identifier(name) : undefined,
      constraint: { variant: 'DefaultExpr', expr },
    });
  },
};

export const TableConstraint = {
  PrimaryKey(
    indexedColumns: Array<Node<'IndexedColumn'> | string>,
    conflictClause?: Node<'ConflictClause'>,
    name?: string | Id
  ): Node<'TableConstraint'> {
    return n.createNode('TableConstraint', {
      constraintName: name ? Expr.identifier(name) : undefined,
      inner: {
        variant: 'PrimaryKey',
        conflictClause,
        indexedColumns: arrayToNonEmptyArray(
          indexedColumns.map((v) =>
            typeof v !== 'string'
              ? v
              : n.createNode('IndexedColumn', { column: { variant: 'Name', name: Expr.identifier(v) } })
          )
        ),
      },
    });
  },
  Unique(
    indexedColumns: Array<Node<'IndexedColumn'> | string>,
    conflictClause?: Node<'ConflictClause'>,
    name?: string | Id
  ): Node<'TableConstraint'> {
    return n.createNode('TableConstraint', {
      constraintName: name ? Expr.identifier(name) : undefined,
      inner: {
        variant: 'Unique',
        conflictClause,
        indexedColumns: arrayToNonEmptyArray(
          indexedColumns.map((v) =>
            typeof v !== 'string'
              ? v
              : n.createNode('IndexedColumn', { column: { variant: 'Name', name: Expr.identifier(v) } })
          )
        ),
      },
    });
  },
  Check(expr: Exp, name?: string | Id): Node<'TableConstraint'> {
    return n.createNode('TableConstraint', {
      constraintName: name ? Expr.identifier(name) : undefined,
      inner: { variant: 'Check', expr },
    });
  },
  ForeignKey(
    columnNames: Array<Id | string>,
    foreignKeyClause: Node<'ForeignKeyClause'>,
    name?: string | Id
  ): Node<'TableConstraint'> {
    return n.createNode('TableConstraint', {
      constraintName: name ? Expr.identifier(name) : undefined,
      inner: {
        variant: 'ForeignKey',
        foreignKeyClause,
        columnNames: arrayToNonEmptyArray(columnNames.map((v) => Expr.identifier(v))),
      },
    });
  },
};
