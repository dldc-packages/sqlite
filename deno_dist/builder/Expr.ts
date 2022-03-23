import * as n from '../Node.ts';
import { NonEmptyArray } from '../Utils.ts';
import { TypeName, ValidTypeName } from './CreateTableStmt.ts';

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

const SIMPLE_IDENTIFIER_REG = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function Identifier(name: string | Id, variant?: Id['variant']): Id {
  if (typeof name !== 'string') {
    return name;
  }
  const variantResolved: Id['variant'] = variant ?? (SIMPLE_IDENTIFIER_REG.test(name) ? 'Basic' : 'Backtick');
  return n.createNode('Identifier', {
    name,
    variant: variantResolved,
  });
}

/**
 * Parse simple column suche as:
 * - id
 * - users.id
 * - public.users.id
 */
export function parseColumn(col: string): Node<'Column'> {
  const parts = col.split('.');
  if (parts.length === 1) {
    return Column(parts[0]);
  }
  if (parts.length === 2) {
    return Column({ table: parts[0], column: parts[1] });
  }
  if (parts.length === 3) {
    return Column({ table: { schema: parts[0], table: parts[1] }, column: parts[2] });
  }
  throw new Error(`Invalid column: ${col} (too many parts)`);
}

export function Column(column: string | { column: string | Id; table?: string | { table: string | Id; schema?: string | Id } }): Node<'Column'> {
  if (typeof column === 'string') {
    return n.createNode('Column', { columnName: Identifier(column) });
  }
  const table = column.table;
  return n.createNode('Column', {
    columnName: Identifier(column.column),
    table:
      table === undefined
        ? undefined
        : typeof table === 'string'
        ? { name: Identifier(table) }
        : { name: Identifier(table.table), schema: table.schema ? Identifier(table.schema) : undefined },
  });
}

export const FunctionInvocation = {
  // abs(X)
  // changes()
  // char(X1,X2,...,XN)
  // coalesce(X,Y,...)
  // format(FORMAT,...)
  // glob(X,Y)
  // hex(X)
  // ifnull(X,Y)
  // iif(X,Y,Z)
  // instr(X,Y)
  // last_insert_rowid()
  // length(X)
  // like(X,Y)
  // like(X,Y,Z)
  // likelihood(X,Y)
  // likely(X)
  // load_extension(X)
  // load_extension(X,Y)
  // lower(X)
  // ltrim(X)
  // ltrim(X,Y)
  // max(X,Y,...)
  // min(X,Y,...)
  // nullif(X,Y)
  // printf(FORMAT,...)
  // quote(X)
  // random()
  // randomblob(N)
  // replace(X,Y,Z)
  // round(X)
  // round(X,Y)
  // rtrim(X)
  // rtrim(X,Y)
  // sign(X)
  // soundex(X)
  // sqlite_compileoption_get(N)
  // sqlite_compileoption_used(X)
  // sqlite_offset(X)
  // sqlite_source_id()
  // sqlite_version()
  // substr(X,Y)
  // substr(X,Y,Z)
  // substring(X,Y)
  // substring(X,Y,Z)
  // total_changes()
  // trim(X)
  // trim(X,Y)
  // typeof(X)
  // unicode(X)
  // unlikely(X)
  // upper(X)
  // zeroblob(N)
};

export const LiteralValue = {
  NumericLiteral: {
    Integer(integer: number, exponent?: number): Node<'NumericLiteral'> {
      return n.createNode('NumericLiteral', {
        variant: 'Integer',
        integer: Math.floor(integer),
        exponent: exponent === undefined ? undefined : { e: 'e', sign: exponent < 0 ? '-' : undefined, number: Math.abs(Math.floor(exponent)) },
      });
    },
    Hexadecimal(hexadecimal: string): Node<'NumericLiteral'> {
      return n.createNode('NumericLiteral', { variant: 'Hexadecimal', value: parseInt(hexadecimal, 16), zeroX: '0x' });
    },
    Float(integral: number, fractional: number, exponent?: number): Node<'NumericLiteral'> {
      return n.createNode('NumericLiteral', {
        variant: 'Float',
        integral: Math.floor(integral),
        fractional: fractional,
        exponent: exponent === undefined ? undefined : { e: 'e', sign: exponent < 0 ? '-' : undefined, number: Math.abs(Math.floor(exponent)) },
      });
    },
  },
  StringLiteral(content: string | Node<'StringLiteral'>): Node<'StringLiteral'> {
    if (typeof content !== 'string') {
      return content;
    }
    return n.createNode('StringLiteral', { content });
  },
  BlobLiteral(content: string): Node<'BlobLiteral'> {
    return n.createNode('BlobLiteral', { content, x: 'x' });
  },
  Null: n.createNode('Null', {}),
  True: n.createNode('True', {}),
  False: n.createNode('False', {}),
  Current_Time: n.createNode('Current_Time', {}),
  Current_Date: n.createNode('Current_Date', {}),
  Current_Timestamp: n.createNode('Current_Timestamp', {}),
};

export function literal(val: null | number | string | boolean): n.LiteralValue {
  if (val === true) {
    return LiteralValue.True;
  }
  if (val === false) {
    return LiteralValue.False;
  }
  if (val === null) {
    return LiteralValue.Null;
  }
  if (typeof val === 'number') {
    const isInt = Math.floor(val) === val;
    if (isInt) {
      return LiteralValue.NumericLiteral.Integer(val);
    }
    const integral = Math.floor(val);
    const fractional = parseInt((val - integral).toString().slice(2));
    return LiteralValue.NumericLiteral.Float(integral, fractional);
  }
  if (typeof val === 'string') {
    return LiteralValue.StringLiteral(val);
  }
  throw new Error(`Invalid literal: ${val}`);
}

export const Expr = {
  LiteralValue,
  literal,
  Or(leftExpr: Exp, rightExpr: Exp): Node<'Or'> {
    return n.createNode('Or', { leftExpr, rightExpr });
  },
  And(leftExpr: Exp, rightExpr: Exp): Node<'And'> {
    return n.createNode('And', { leftExpr, rightExpr });
  },
  Not(expr: Exp): Node<'Not'> {
    return n.createNode('Not', { expr });
  },
  Equal(leftExpr: Exp, rightExpr: Exp): Node<'Equal'> {
    return n.createNode('Equal', { leftExpr, rightExpr, operator: '==' });
  },
  Different(leftExpr: Exp, rightExpr: Exp): Node<'Different'> {
    return n.createNode('Different', { leftExpr, rightExpr, operator: '!=' });
  },
  Is(leftExpr: Exp, rightExpr: Exp): Node<'Is'> {
    return n.createNode('Is', { leftExpr, rightExpr });
  },
  IsNot(leftExpr: Exp, rightExpr: Exp): Node<'IsNot'> {
    return n.createNode('IsNot', { leftExpr, rightExpr });
  },
  NotBetween(expr: Exp, betweenExpr: Exp, andExpr: Exp): Node<'NotBetween'> {
    return n.createNode('NotBetween', { expr, betweenExpr, andExpr });
  },
  Between(expr: Exp, betweenExpr: Exp, andExpr: Exp): Node<'Between'> {
    return n.createNode('Between', { expr, betweenExpr, andExpr });
  },
  In: {
    List(expr: Exp, items?: NonEmptyArray<Exp>): Node<'In'> {
      return n.createNode('In', { expr, values: { variant: 'List', items } });
    },
    Select(expr: Exp, selectStmt: Node<'SelectStmt'>): Node<'In'> {
      return n.createNode('In', { expr, values: { variant: 'Select', selectStmt } });
    },
    TableName(expr: Exp, table: string | Id, schema?: string | Id): Node<'In'> {
      return n.createNode('In', { expr, values: { variant: 'TableName', table: Identifier(table), schema: schema ? Identifier(schema) : undefined } });
    },
    TableFunctionInvocation(expr: Exp, functionName: string | Id, parameters?: NonEmptyArray<Exp>, schema?: string | Id): Node<'In'> {
      return n.createNode('In', {
        expr,
        values: { variant: 'TableFunctionInvocation', functionName: Identifier(functionName), parameters, schema: schema ? Identifier(schema) : undefined },
      });
    },
  },
  NotIn: {
    List(expr: Exp, items?: NonEmptyArray<Exp>): Node<'NotIn'> {
      return n.createNode('NotIn', { expr, values: { variant: 'List', items } });
    },
    Select(expr: Exp, selectStmt: Node<'SelectStmt'>): Node<'NotIn'> {
      return n.createNode('NotIn', { expr, values: { variant: 'Select', selectStmt } });
    },
    TableName(expr: Exp, table: string | Id, schema?: string | Id): Node<'NotIn'> {
      return n.createNode('NotIn', { expr, values: { variant: 'TableName', table: Identifier(table), schema: schema ? Identifier(schema) : undefined } });
    },
    TableFunctionInvocation(expr: Exp, functionName: string | Id, parameters?: NonEmptyArray<Exp>, schema?: string | Id): Node<'NotIn'> {
      return n.createNode('NotIn', {
        expr,
        values: { variant: 'TableFunctionInvocation', functionName: Identifier(functionName), parameters, schema: schema ? Identifier(schema) : undefined },
      });
    },
  },
  Match(leftExpr: Exp, rightExpr: Exp): Node<'Match'> {
    return n.createNode('Match', { leftExpr, rightExpr });
  },
  NotMatch(leftExpr: Exp, rightExpr: Exp): Node<'NotMatch'> {
    return n.createNode('NotMatch', { leftExpr, rightExpr });
  },
  Like(leftExpr: Exp, rightExpr: Exp): Node<'Like'> {
    return n.createNode('Like', { leftExpr, rightExpr });
  },
  NotLike(leftExpr: Exp, rightExpr: Exp): Node<'NotLike'> {
    return n.createNode('NotLike', { leftExpr, rightExpr });
  },
  Glob(leftExpr: Exp, rightExpr: Exp): Node<'Glob'> {
    return n.createNode('Glob', { leftExpr, rightExpr });
  },
  NotGlob(leftExpr: Exp, rightExpr: Exp): Node<'NotGlob'> {
    return n.createNode('NotGlob', { leftExpr, rightExpr });
  },
  Regexp(leftExpr: Exp, rightExpr: Exp): Node<'Regexp'> {
    return n.createNode('Regexp', { leftExpr, rightExpr });
  },
  NotRegexp(leftExpr: Exp, rightExpr: Exp): Node<'NotRegexp'> {
    return n.createNode('NotRegexp', { leftExpr, rightExpr });
  },
  Isnull(expr: Exp): Node<'Isnull'> {
    return n.createNode('Isnull', { expr });
  },
  // Notnull(expr: IExpr): Node<'Notnull'> {
  //   return n.createNode('Notnull', { expr });
  // }
  NotNull(expr: Exp): Node<'NotNull'> {
    return n.createNode('NotNull', { expr });
  },
  LowerThan(leftExpr: Exp, rightExpr: Exp): Node<'LowerThan'> {
    return n.createNode('LowerThan', { leftExpr, rightExpr });
  },
  GreaterThan(leftExpr: Exp, rightExpr: Exp): Node<'GreaterThan'> {
    return n.createNode('GreaterThan', { leftExpr, rightExpr });
  },
  LowerThanOrEqual(leftExpr: Exp, rightExpr: Exp): Node<'LowerThanOrEqual'> {
    return n.createNode('LowerThanOrEqual', { leftExpr, rightExpr });
  },
  GreaterThanOrEqual(leftExpr: Exp, rightExpr: Exp): Node<'GreaterThanOrEqual'> {
    return n.createNode('GreaterThanOrEqual', { leftExpr, rightExpr });
  },
  BitwiseAnd(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseAnd'> {
    return n.createNode('BitwiseAnd', { leftExpr, rightExpr });
  },
  BitwiseOr(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseOr'> {
    return n.createNode('BitwiseOr', { leftExpr, rightExpr });
  },
  BitwiseShiftLeft(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseShiftLeft'> {
    return n.createNode('BitwiseShiftLeft', { leftExpr, rightExpr });
  },
  BitwiseShiftRight(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseShiftRight'> {
    return n.createNode('BitwiseShiftRight', { leftExpr, rightExpr });
  },
  Add(leftExpr: Exp, rightExpr: Exp): Node<'Add'> {
    return n.createNode('Add', { leftExpr, rightExpr });
  },
  Subtract(leftExpr: Exp, rightExpr: Exp): Node<'Subtract'> {
    return n.createNode('Subtract', { leftExpr, rightExpr });
  },
  Multiply(leftExpr: Exp, rightExpr: Exp): Node<'Multiply'> {
    return n.createNode('Multiply', { leftExpr, rightExpr });
  },
  Divide(leftExpr: Exp, rightExpr: Exp): Node<'Divide'> {
    return n.createNode('Divide', { leftExpr, rightExpr });
  },
  Modulo(leftExpr: Exp, rightExpr: Exp): Node<'Modulo'> {
    return n.createNode('Modulo', { leftExpr, rightExpr });
  },
  Concatenate(leftExpr: Exp, rightExpr: Exp): Node<'Concatenate'> {
    return n.createNode('Concatenate', { leftExpr, rightExpr });
  },
  Collate(expr: Exp, collationName: string | Id): Node<'Collate'> {
    return n.createNode('Collate', { expr, collationName: Identifier(collationName) });
  },
  BitwiseNegation(expr: Exp): Node<'BitwiseNegation'> {
    return n.createNode('BitwiseNegation', { expr });
  },
  Plus(expr: Exp): Node<'Plus'> {
    return n.createNode('Plus', { expr });
  },
  Minus(expr: Exp): Node<'Minus'> {
    return n.createNode('Minus', { expr });
  },
  Identifier,
  BindParameter: {
    Indexed(): Node<'BindParameter'> {
      return n.createNode('BindParameter', { variant: 'Indexed' });
    },
    Numbered(number: number): Node<'BindParameter'> {
      return n.createNode('BindParameter', { variant: 'Numbered', number: Math.abs(Math.floor(number)) });
    },
    AtNamed(name: string, suffix?: string): Node<'BindParameter'> {
      return n.createNode('BindParameter', { variant: 'AtNamed', name, suffix });
    },
    ColonNamed(name: string, suffix?: string): Node<'BindParameter'> {
      return n.createNode('BindParameter', { variant: 'ColonNamed', name, suffix });
    },
    DollarNamed(name: string, suffix?: string): Node<'BindParameter'> {
      return n.createNode('BindParameter', { variant: 'DollarNamed', name, suffix });
    },
  },
  Column,
  Exists(selectStmt: Node<'SelectStmt'>): Node<'Exists'> {
    return n.createNode('Exists', { selectStmt, exists: true });
  },
  NotExists(selectStmt: Node<'SelectStmt'>): Node<'NotExists'> {
    return n.createNode('NotExists', { selectStmt });
  },
  FunctionInvocation,
  Parenthesis(first: Exp, ...other: Array<Exp>): Node<'Parenthesis'> {
    return n.createNode('Parenthesis', { exprs: [first, ...other] });
  },
  CastAs(expr: Exp, typeName: Node<'TypeName'> | ValidTypeName): Node<'CastAs'> {
    return n.createNode('CastAs', { expr, typeName: typeof typeName === 'string' ? TypeName(typeName) : typeName });
  },
  Case(expr: Exp | null, cases: NonEmptyArray<{ whenExpr: Exp; thenExpr: Exp }>, elseExpr?: Exp): Node<'Case'> {
    return n.createNode('Case', { expr: expr ?? undefined, cases, else: elseExpr });
  },
  RaiseFunction: {
    Ignore(): Node<'RaiseFunction'> {
      return n.createNode('RaiseFunction', { variant: 'Ignore' });
    },
    Rollback(errorMessage: Node<'StringLiteral'> | string): Node<'RaiseFunction'> {
      return n.createNode('RaiseFunction', { variant: 'Rollback', errorMessage: LiteralValue.StringLiteral(errorMessage) });
    },
    Abort(errorMessage: Node<'StringLiteral'> | string): Node<'RaiseFunction'> {
      return n.createNode('RaiseFunction', { variant: 'Abort', errorMessage: LiteralValue.StringLiteral(errorMessage) });
    },
    Fail(errorMessage: Node<'StringLiteral'> | string): Node<'RaiseFunction'> {
      return n.createNode('RaiseFunction', { variant: 'Fail', errorMessage: LiteralValue.StringLiteral(errorMessage) });
    },
  },
};

export const AggregateFunction = {
  Avg(val: Exp, distinct?: true, filterClause?: Node<'FilterClause'>): Node<'AggregateFunctionInvocation'> {
    return n.createNode('AggregateFunctionInvocation', {
      aggregateFunc: Identifier('avg'),
      parameters: { variant: 'Exprs', distinct, exprs: [val] },
      filterClause,
    });
  },
  CountAll(filterClause?: Node<'FilterClause'>): Node<'AggregateFunctionInvocation'> {
    return n.createNode('AggregateFunctionInvocation', { aggregateFunc: Identifier('count'), parameters: { variant: 'Star' }, filterClause });
  },
  Count(val: Exp, distinct?: true, filterClause?: Node<'FilterClause'>): Node<'AggregateFunctionInvocation'> {
    return n.createNode('AggregateFunctionInvocation', {
      aggregateFunc: Identifier('count'),
      parameters: { variant: 'Exprs', distinct, exprs: [val] },
      filterClause,
    });
  },
  GroupConcat(val: Exp, separator?: Exp, distinct?: true, filterClause?: Node<'FilterClause'>): Node<'AggregateFunctionInvocation'> {
    return n.createNode('AggregateFunctionInvocation', {
      aggregateFunc: Identifier('group_concat'),
      parameters: { variant: 'Exprs', distinct, exprs: separator ? [val, separator] : [val] },
      filterClause,
    });
  },
  Max(val: Exp, distinct?: true, filterClause?: Node<'FilterClause'>): Node<'AggregateFunctionInvocation'> {
    return n.createNode('AggregateFunctionInvocation', {
      aggregateFunc: Identifier('max'),
      parameters: { variant: 'Exprs', distinct, exprs: [val] },
      filterClause,
    });
  },
  Min(val: Exp, distinct?: true, filterClause?: Node<'FilterClause'>): Node<'AggregateFunctionInvocation'> {
    return n.createNode('AggregateFunctionInvocation', {
      aggregateFunc: Identifier('min'),
      parameters: { variant: 'Exprs', distinct, exprs: [val] },
      filterClause,
    });
  },
  Sum(val: Exp, distinct?: true, filterClause?: Node<'FilterClause'>): Node<'AggregateFunctionInvocation'> {
    return n.createNode('AggregateFunctionInvocation', {
      aggregateFunc: Identifier('sum'),
      parameters: { variant: 'Exprs', distinct, exprs: [val] },
      filterClause,
    });
  },
  Total(val: Exp, distinct?: true, filterClause?: Node<'FilterClause'>): Node<'AggregateFunctionInvocation'> {
    return n.createNode('AggregateFunctionInvocation', {
      aggregateFunc: Identifier('total'),
      parameters: { variant: 'Exprs', distinct, exprs: [val] },
      filterClause,
    });
  },
};
