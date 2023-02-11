import { createNode, Expr as Exp, Identifier, Node } from '../Node.ts';
import { arrayToNonEmptyArray, NonEmptyArray } from '../Utils.ts';
import { Expr } from './Expr.ts';

export type JoinItem = {
  joinOperator: Node<'JoinOperator'>;
  tableOrSubquery: Node<'TableOrSubquery'>;
  joinConstraint?: Node<'JoinConstraint'>;
};

export function Join(
  tableOrSubquery: Node<'TableOrSubquery'>,
  joinOperator: Node<'JoinOperator'>,
  joinTableOrSubquery: Node<'TableOrSubquery'>,
  joinConstraint?: Node<'JoinConstraint'>
): Node<'JoinClause'> {
  return createNode('JoinClause', {
    tableOrSubquery,
    joins: [{ joinOperator, tableOrSubquery: joinTableOrSubquery, joinConstraint }],
  });
}

export const JoinOperator = {
  Comma(): Node<'JoinOperator'> {
    return createNode('JoinOperator', { variant: 'Comma' });
  },
  Join(join?: 'Left' | 'LeftOuter' | 'Inner' | 'Cross', natural?: true): Node<'JoinOperator'> {
    return createNode('JoinOperator', { variant: 'Join', join, natural });
  },
};

export const JoinConstraint = {
  On(expr: Exp): Node<'JoinConstraint'> {
    return createNode('JoinConstraint', { variant: 'On', expr });
  },
  Using(columns: NonEmptyArray<Identifier | string>): Node<'JoinConstraint'> {
    return createNode('JoinConstraint', {
      variant: 'Using',
      columnNames: arrayToNonEmptyArray(columns.map((v): Identifier => Expr.identifier(v))),
    });
  },
};

export function Joins(tableOrSubquery: Node<'TableOrSubquery'>, firstJoin: JoinItem, ...otherJoin: Array<JoinItem>): Node<'JoinClause'> {
  return createNode('JoinClause', {
    tableOrSubquery,
    joins: [firstJoin, ...otherJoin],
  });
}

export type SelectFrom = Extract<Node<'SelectCore'>, { variant: 'Select' }>['from'];

export type SelectStmtOptions = {
  distinct?: 'Distinct' | 'All';
  resultColumns: Array<Node<'ResultColumn'>>;
  from: SelectFrom;
  where?: Exp;
  orderBy?: Node<'SelectStmt'>['orderBy'];
  limit?: Node<'SelectStmt'>['limit'];
  groupBy?: Extract<Node<'SelectCore'>, { variant: 'Select' }>['groupBy'];
};

export function SelectStmt({ distinct, resultColumns, from, where, limit, orderBy, groupBy }: SelectStmtOptions): Node<'SelectStmt'> {
  return createNode('SelectStmt', {
    select: createNode('SelectCore', {
      variant: 'Select',
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

export const TableOrSubquery = {
  Table(tableName: string, { schema, alias }: { schema?: Identifier | string; alias?: Identifier | string } = {}): Node<'TableOrSubquery'> {
    return createNode('TableOrSubquery', {
      variant: 'Table',
      schema: schema ? Expr.identifier(schema) : undefined,
      table: Expr.identifier(tableName),
      alias: alias ? { tableAlias: Expr.identifier(alias), as: true } : undefined,
    });
  },
  Select(selectStmt: Node<'SelectStmt'>, alias?: Identifier | string): Node<'TableOrSubquery'> {
    return createNode('TableOrSubquery', {
      variant: 'Select',
      selectStmt: selectStmt,
      alias: alias ? { tableAlias: Expr.identifier(alias), as: true } : undefined,
    });
  },
};

export const From = {
  Table(tableName: string, { schema, alias }: { schema?: Identifier | string; alias?: Identifier | string } = {}): SelectFrom {
    return { variant: 'TablesOrSubqueries', tablesOrSubqueries: [TableOrSubquery.Table(tableName, { schema, alias })] };
  },
  Tables(firstTable: Node<'TableOrSubquery'>, ...otherTables: Array<Node<'TableOrSubquery'>>): SelectFrom {
    return { variant: 'TablesOrSubqueries', tablesOrSubqueries: [firstTable, ...otherTables] };
  },
  Joins(tableOrSubquery: Node<'TableOrSubquery'>, firstJoin: JoinItem, ...otherJoin: Array<JoinItem>): SelectFrom {
    return { variant: 'Join', joinClause: Joins(tableOrSubquery, firstJoin, ...otherJoin) };
  },
  Join(
    tableOrSubquery: Node<'TableOrSubquery'>,
    joinOperator: Node<'JoinOperator'>,
    joinTableOrSubquery: Node<'TableOrSubquery'>,
    joinConstraint?: Node<'JoinConstraint'>
  ): SelectFrom {
    return { variant: 'Join', joinClause: Join(tableOrSubquery, joinOperator, joinTableOrSubquery, joinConstraint) };
  },
};

export const ResultColumn = {
  Expr(expr: Exp, alias?: string | Identifier): Node<'ResultColumn'> {
    return createNode('ResultColumn', {
      variant: 'Expr',
      expr,
      alias: alias ? { name: Expr.identifier(alias), as: true } : undefined,
    });
  },
  Star(): Node<'ResultColumn'> {
    return createNode('ResultColumn', {
      variant: 'Star',
    });
  },
  TableStar(tableName: string | Identifier): Node<'ResultColumn'> {
    return createNode('ResultColumn', {
      variant: 'TableStar',
      tableName: Expr.identifier(tableName),
    });
  },
  // Shortcut
  column(
    column: string | { column: string | Identifier; table?: string | { table: string | Identifier; schema?: string | Identifier } }
  ): Node<'ResultColumn'> {
    return ResultColumn.Expr(Expr.column(column));
  },
  columnFromString(col: string): Node<'ResultColumn'> {
    return ResultColumn.Expr(Expr.columnFromString(col));
  },
};
