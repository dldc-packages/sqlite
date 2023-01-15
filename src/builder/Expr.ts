import * as n from '../Node';
import { arrayToNonEmptyArray, NonEmptyArray } from '../Utils';
import { TypeName, ValidTypeName } from './CreateTableStmt';

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

export interface AggregateFunctionParams<Expr = Exp[]> {
  distinct?: boolean;
  params: Expr;
}

const AggregateFunctions = {
  avg: (options: AggregateFunctionParams<Exp>) => AggregateFunctionInvocation('avg', options),
  count: (options: AggregateFunctionParams<Exp>) => AggregateFunctionInvocation('count', options),
  group_concat: (options: AggregateFunctionParams<Exp | [x: Exp, y: Exp]>) => AggregateFunctionInvocation('group_concat', options),
  max: (options: AggregateFunctionParams<Exp>) => AggregateFunctionInvocation('max', options),
  min: (options: AggregateFunctionParams<Exp>) => AggregateFunctionInvocation('min', options),
  sum: (options: AggregateFunctionParams<Exp>) => AggregateFunctionInvocation('sum', options),
  total: (options: AggregateFunctionParams<Exp>) => AggregateFunctionInvocation('total', options),
  // JSON
  json_group_array: (options: AggregateFunctionParams<Exp>) => AggregateFunctionInvocation('json_group_array', options),
  json_group_object: (options: AggregateFunctionParams<[name: Exp, value: Exp]>) => AggregateFunctionInvocation('json_group_object', options),
};

// https://www.sqlite.org/lang_corefunc.html
const ScalarFunctions = {
  abs: (x: Exp) => FunctionInvocation('abs', x),
  changes: () => FunctionInvocation('changes'),
  char: (x1: Exp, x2: Exp, ...xn: Exp[]) => FunctionInvocation('char', x1, x2, ...xn),
  coalesce: (x: Exp, y: Exp, ...yn: Exp[]) => FunctionInvocation('coalesce', x, y, ...yn),
  format: (format: Exp, ...args: Exp[]) => FunctionInvocation('format', format, ...args),
  glob: (x: Exp, y: Exp) => FunctionInvocation('glob', x, y),
  hex: (x: Exp) => FunctionInvocation('hex', x),
  ifnull: (x: Exp, y: Exp) => FunctionInvocation('ifnull', x, y),
  iif: (x: Exp, y: Exp, z: Exp) => FunctionInvocation('iif', x, y, z),
  instr: (x: Exp, y: Exp) => FunctionInvocation('instr', x, y),
  last_insert_rowid: () => FunctionInvocation('last_insert_rowid'),
  length: (x: Exp) => FunctionInvocation('length', x),
  like: (x: Exp, y: Exp, z?: Exp) => (z ? FunctionInvocation('like', x, y, z) : FunctionInvocation('like', x, y)),
  likelihood: (x: Exp, y: Exp) => FunctionInvocation('likelihood', x, y),
  likely: (x: Exp) => FunctionInvocation('likely', x),
  load_extension: (x: Exp, y?: Exp) => (y ? FunctionInvocation('load_extension', x, y) : FunctionInvocation('load_extension', x)),
  lower: (x: Exp) => FunctionInvocation('lower', x),
  ltrim: (x: Exp, y?: Exp) => (y ? FunctionInvocation('ltrim', x, y) : FunctionInvocation('ltrim', x)),
  max: (x: Exp, y: Exp, ...yn: Exp[]) => FunctionInvocation('max', x, y, ...yn),
  min: (x: Exp, y: Exp, ...yn: Exp[]) => FunctionInvocation('min', x, y, ...yn),
  nullif: (x: Exp, y: Exp) => FunctionInvocation('nullif', x, y),
  printf: (format: Exp, ...args: Exp[]) => FunctionInvocation('printf', format, ...args),
  quote: (x: Exp) => FunctionInvocation('quote', x),
  random: () => FunctionInvocation('random'),
  randomblob: (n: Exp) => FunctionInvocation('randomblob', n),
  replace: (x: Exp, y: Exp, z: Exp) => FunctionInvocation('replace', x, y, z),
  round: (x: Exp, y?: Exp) => (y ? FunctionInvocation('round', x, y) : FunctionInvocation('round', x)),
  rtrim: (x: Exp, y?: Exp) => (y ? FunctionInvocation('rtrim', x, y) : FunctionInvocation('rtrim', x)),
  sign: (x: Exp) => FunctionInvocation('sign', x),
  soundex: (x: Exp) => FunctionInvocation('soundex', x),
  sqlite_compileoption_get: (n: Exp) => FunctionInvocation('sqlite_compileoption_get', n),
  sqlite_compileoption_used: (x: Exp) => FunctionInvocation('sqlite_compileoption_used', x),
  sqlite_offset: (x: Exp) => FunctionInvocation('sqlite_offset', x),
  sqlite_source_id: () => FunctionInvocation('sqlite_source_id'),
  sqlite_version: () => FunctionInvocation('sqlite_version'),
  substr: (x: Exp, y: Exp, z?: Exp) => (z ? FunctionInvocation('substr', x, y, z) : FunctionInvocation('substr', x, y)),
  substring: (x: Exp, y: Exp, z?: Exp) => (z ? FunctionInvocation('substring', x, y, z) : FunctionInvocation('substring', x, y)),
  total_changes: () => FunctionInvocation('total_changes'),
  trim: (x: Exp, y?: Exp) => (y ? FunctionInvocation('trim', x, y) : FunctionInvocation('trim', x)),
  typeof: (x: Exp) => FunctionInvocation('typeof', x),
  unicode: (x: Exp) => FunctionInvocation('unicode', x),
  unlikely: (x: Exp) => FunctionInvocation('unlikely', x),
  upper: (x: Exp) => FunctionInvocation('upper', x),
  zeroblob: (n: Exp) => FunctionInvocation('zeroblob', n),

  // json functions
  json: (x: Exp) => FunctionInvocation('json', x),
  json_array: (...valueN: Exp[]) => FunctionInvocation('json_array', ...valueN),
  json_array_length: (json: Exp, path?: Exp) => (path ? FunctionInvocation('json_array_length', json, path) : FunctionInvocation('json_array_length', json)),
  json_extract: (json: Exp, path: Exp, ...pathN: Exp[]) => FunctionInvocation('json_extract', json, path, ...pathN),
  json_insert: (json: Exp, path: Exp, value: Exp, ...pathValueN: Exp[]) => FunctionInvocation('json_insert', json, path, value, ...pathValueN),
  json_object: (...labelValueN: Exp[]) => FunctionInvocation('json_object', ...labelValueN),
  json_patch: (json1: Exp, json2: Exp) => FunctionInvocation('json_patch', json1, json2),
  json_remove: (json: Exp, path: Exp, ...pathN: Exp[]) => FunctionInvocation('json_remove', json, path, ...pathN),
  json_replace: (json: Exp, path: Exp, value: Exp, ...pathValueN: Exp[]) => FunctionInvocation('json_replace', json, path, value, ...pathValueN),
  json_set: (json: Exp, path: Exp, value: Exp, ...pathValueN: Exp[]) => FunctionInvocation('json_set', json, path, value, ...pathValueN),
  json_type: (json: Exp, path?: Exp) => (path ? FunctionInvocation('json_type', json, path) : FunctionInvocation('json_type', json)),
  json_valid: (json: Exp) => FunctionInvocation('json_valid', json),
  json_quote: (value: Exp) => FunctionInvocation('json_quote', value),
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
  Null: LiteralValue.Null,
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
  Notnull(expr: Exp): Node<'Notnull'> {
    return n.createNode('Notnull', { expr });
  },
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
  Parenthesis(first: Exp, ...other: Array<Exp>): Node<'Parenthesis'> {
    return n.createNode('Parenthesis', { exprs: [first, ...other] });
  },
  CastAs(expr: Exp, typeName: Node<'TypeName'> | ValidTypeName): Node<'CastAs'> {
    return n.createNode('CastAs', { expr, typeName: typeof typeName === 'string' ? TypeName(typeName) : typeName });
  },
  Case(expr: Exp | null, cases: NonEmptyArray<{ whenExpr: Exp; thenExpr: Exp }>, elseExpr?: Exp): Node<'Case'> {
    return n.createNode('Case', { expr: expr ?? undefined, cases, else: elseExpr });
  },
  FunctionInvocation,
  ScalarFunctions,
  AggregateFunctionInvocation,
  AggregateFunctions,
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

function AggregateFunctionInvocation(
  name: string,
  args: { distinct?: boolean; params: Exp | Exp[] } | '*',
  filterClause?: Node<'FilterClause'>
): Node<'AggregateFunctionInvocation'> {
  if (args === '*') {
    return n.createNode('AggregateFunctionInvocation', {
      aggregateFunc: Identifier(name),
      parameters: { variant: 'Star' },
      filterClause,
    });
  }
  const distinct = args.distinct === true ? true : undefined;
  const argsArr = arrayToNonEmptyArray(Array.isArray(args.params) ? args.params : [args.params]);
  return n.createNode('AggregateFunctionInvocation', {
    aggregateFunc: Identifier(name),
    parameters: { variant: 'Exprs', distinct, exprs: argsArr },
    filterClause,
  });
}

function FunctionInvocation(name: string, ...args: Exp[]): Node<'FunctionInvocation'> {
  return n.createNode('FunctionInvocation', {
    functionName: Identifier(name),
    parameters: args.length === 0 ? undefined : { variant: 'Exprs', exprs: arrayToNonEmptyArray(args) },
  });
}
