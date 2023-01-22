import * as n from '../Node';
import { arrayToNonEmptyArray, NonEmptyArray } from '../Utils';
import { TypeName, ValidTypeName } from './TypeName';

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

const SIMPLE_IDENTIFIER_REG = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export interface AggregateFunctionParams<Expr = Exp[]> {
  distinct?: boolean;
  params: Expr;
}

const AggregateFunctions = {
  avg: (options: AggregateFunctionParams<Exp>) => aggregateFunctionInvocation('avg', options),
  count: (options: AggregateFunctionParams<Exp>) => aggregateFunctionInvocation('count', options),
  group_concat: (options: AggregateFunctionParams<Exp | [x: Exp, y: Exp]>) => aggregateFunctionInvocation('group_concat', options),
  max: (options: AggregateFunctionParams<Exp>) => aggregateFunctionInvocation('max', options),
  min: (options: AggregateFunctionParams<Exp>) => aggregateFunctionInvocation('min', options),
  sum: (options: AggregateFunctionParams<Exp>) => aggregateFunctionInvocation('sum', options),
  total: (options: AggregateFunctionParams<Exp>) => aggregateFunctionInvocation('total', options),
  // JSON
  json_group_array: (options: AggregateFunctionParams<Exp>) => aggregateFunctionInvocation('json_group_array', options),
  json_group_object: (options: AggregateFunctionParams<[name: Exp, value: Exp]>) =>
    aggregateFunctionInvocation('json_group_object', options),
};

// https://www.sqlite.org/lang_corefunc.html
const ScalarFunctions = {
  abs: (x: Exp) => functionInvocation('abs', x),
  changes: () => functionInvocation('changes'),
  char: (x1: Exp, x2: Exp, ...xn: Exp[]) => functionInvocation('char', x1, x2, ...xn),
  coalesce: (x: Exp, y: Exp, ...yn: Exp[]) => functionInvocation('coalesce', x, y, ...yn),
  format: (format: Exp, ...args: Exp[]) => functionInvocation('format', format, ...args),
  glob: (x: Exp, y: Exp) => functionInvocation('glob', x, y),
  hex: (x: Exp) => functionInvocation('hex', x),
  ifnull: (x: Exp, y: Exp) => functionInvocation('ifnull', x, y),
  iif: (x: Exp, y: Exp, z: Exp) => functionInvocation('iif', x, y, z),
  instr: (x: Exp, y: Exp) => functionInvocation('instr', x, y),
  last_insert_rowid: () => functionInvocation('last_insert_rowid'),
  length: (x: Exp) => functionInvocation('length', x),
  like: (x: Exp, y: Exp, z?: Exp) => (z ? functionInvocation('like', x, y, z) : functionInvocation('like', x, y)),
  likelihood: (x: Exp, y: Exp) => functionInvocation('likelihood', x, y),
  likely: (x: Exp) => functionInvocation('likely', x),
  load_extension: (x: Exp, y?: Exp) => (y ? functionInvocation('load_extension', x, y) : functionInvocation('load_extension', x)),
  lower: (x: Exp) => functionInvocation('lower', x),
  ltrim: (x: Exp, y?: Exp) => (y ? functionInvocation('ltrim', x, y) : functionInvocation('ltrim', x)),
  max: (x: Exp, y: Exp, ...yn: Exp[]) => functionInvocation('max', x, y, ...yn),
  min: (x: Exp, y: Exp, ...yn: Exp[]) => functionInvocation('min', x, y, ...yn),
  nullif: (x: Exp, y: Exp) => functionInvocation('nullif', x, y),
  printf: (format: Exp, ...args: Exp[]) => functionInvocation('printf', format, ...args),
  quote: (x: Exp) => functionInvocation('quote', x),
  random: () => functionInvocation('random'),
  randomblob: (n: Exp) => functionInvocation('randomblob', n),
  replace: (x: Exp, y: Exp, z: Exp) => functionInvocation('replace', x, y, z),
  round: (x: Exp, y?: Exp) => (y ? functionInvocation('round', x, y) : functionInvocation('round', x)),
  rtrim: (x: Exp, y?: Exp) => (y ? functionInvocation('rtrim', x, y) : functionInvocation('rtrim', x)),
  sign: (x: Exp) => functionInvocation('sign', x),
  soundex: (x: Exp) => functionInvocation('soundex', x),
  sqlite_compileoption_get: (n: Exp) => functionInvocation('sqlite_compileoption_get', n),
  sqlite_compileoption_used: (x: Exp) => functionInvocation('sqlite_compileoption_used', x),
  sqlite_offset: (x: Exp) => functionInvocation('sqlite_offset', x),
  sqlite_source_id: () => functionInvocation('sqlite_source_id'),
  sqlite_version: () => functionInvocation('sqlite_version'),
  substr: (x: Exp, y: Exp, z?: Exp) => (z ? functionInvocation('substr', x, y, z) : functionInvocation('substr', x, y)),
  substring: (x: Exp, y: Exp, z?: Exp) => (z ? functionInvocation('substring', x, y, z) : functionInvocation('substring', x, y)),
  total_changes: () => functionInvocation('total_changes'),
  trim: (x: Exp, y?: Exp) => (y ? functionInvocation('trim', x, y) : functionInvocation('trim', x)),
  typeof: (x: Exp) => functionInvocation('typeof', x),
  unicode: (x: Exp) => functionInvocation('unicode', x),
  unlikely: (x: Exp) => functionInvocation('unlikely', x),
  upper: (x: Exp) => functionInvocation('upper', x),
  zeroblob: (n: Exp) => functionInvocation('zeroblob', n),
  // JSON
  json: (x: Exp) => functionInvocation('json', x),
  json_array: (...valueN: Exp[]) => functionInvocation('json_array', ...valueN),
  json_array_length: (json: Exp, path?: Exp) =>
    path ? functionInvocation('json_array_length', json, path) : functionInvocation('json_array_length', json),
  json_extract: (json: Exp, path: Exp, ...pathN: Exp[]) => functionInvocation('json_extract', json, path, ...pathN),
  json_insert: (json: Exp, path: Exp, value: Exp, ...pathValueN: Exp[]) =>
    functionInvocation('json_insert', json, path, value, ...pathValueN),
  json_object: (...labelValueN: Exp[]) => functionInvocation('json_object', ...labelValueN),
  json_patch: (json1: Exp, json2: Exp) => functionInvocation('json_patch', json1, json2),
  json_remove: (json: Exp, path: Exp, ...pathN: Exp[]) => functionInvocation('json_remove', json, path, ...pathN),
  json_replace: (json: Exp, path: Exp, value: Exp, ...pathValueN: Exp[]) =>
    functionInvocation('json_replace', json, path, value, ...pathValueN),
  json_set: (json: Exp, path: Exp, value: Exp, ...pathValueN: Exp[]) => functionInvocation('json_set', json, path, value, ...pathValueN),
  json_type: (json: Exp, path?: Exp) => (path ? functionInvocation('json_type', json, path) : functionInvocation('json_type', json)),
  json_valid: (json: Exp) => functionInvocation('json_valid', json),
  json_quote: (value: Exp) => functionInvocation('json_quote', value),
};

const LiteralValue = {
  NumericLiteral: {
    integer(integer: number, exponent?: number): Node<'NumericLiteral'> {
      return n.createNode('NumericLiteral', {
        variant: 'Integer',
        integer: Math.floor(integer),
        exponent:
          exponent === undefined ? undefined : { e: 'e', sign: exponent < 0 ? '-' : undefined, number: Math.abs(Math.floor(exponent)) },
      });
    },
    hexadecimal(hexadecimal: string): Node<'NumericLiteral'> {
      return n.createNode('NumericLiteral', { variant: 'Hexadecimal', value: parseInt(hexadecimal, 16), zeroX: '0x' });
    },
    float(integral: number, fractional: number, exponent?: number): Node<'NumericLiteral'> {
      return n.createNode('NumericLiteral', {
        variant: 'Float',
        integral: Math.floor(integral),
        fractional: fractional,
        exponent:
          exponent === undefined ? undefined : { e: 'e', sign: exponent < 0 ? '-' : undefined, number: Math.abs(Math.floor(exponent)) },
      });
    },
  },
  stringLiteral(content: string | Node<'StringLiteral'>): Node<'StringLiteral'> {
    if (typeof content !== 'string') {
      return content;
    }
    return n.createNode('StringLiteral', { content });
  },
  blobLiteral(content: string): Node<'BlobLiteral'> {
    return n.createNode('BlobLiteral', { content, x: 'x' });
  },
  null: n.createNode('Null', {}),
  true: n.createNode('True', {}),
  false: n.createNode('False', {}),
  current_Time: n.createNode('Current_Time', {}),
  current_Date: n.createNode('Current_Date', {}),
  current_Timestamp: n.createNode('Current_Timestamp', {}),
};

const Operations = {
  or(leftExpr: Exp, rightExpr: Exp): Node<'Or'> {
    return n.createNode('Or', { leftExpr, rightExpr });
  },
  and(leftExpr: Exp, rightExpr: Exp): Node<'And'> {
    return n.createNode('And', { leftExpr, rightExpr });
  },
  not(expr: Exp): Node<'Not'> {
    return n.createNode('Not', { expr });
  },
  equal(leftExpr: Exp, rightExpr: Exp): Node<'Equal'> {
    return n.createNode('Equal', { leftExpr, rightExpr, operator: '==' });
  },
  different(leftExpr: Exp, rightExpr: Exp): Node<'Different'> {
    return n.createNode('Different', { leftExpr, rightExpr, operator: '!=' });
  },
  is(leftExpr: Exp, rightExpr: Exp): Node<'Is'> {
    return n.createNode('Is', { leftExpr, rightExpr });
  },
  isNot(leftExpr: Exp, rightExpr: Exp): Node<'IsNot'> {
    return n.createNode('IsNot', { leftExpr, rightExpr });
  },
  notBetween(expr: Exp, betweenExpr: Exp, andExpr: Exp): Node<'NotBetween'> {
    return n.createNode('NotBetween', { expr, betweenExpr, andExpr });
  },
  between(expr: Exp, betweenExpr: Exp, andExpr: Exp): Node<'Between'> {
    return n.createNode('Between', { expr, betweenExpr, andExpr });
  },
  In: {
    list(expr: Exp, items?: NonEmptyArray<Exp>): Node<'In'> {
      return n.createNode('In', { expr, values: { variant: 'List', items } });
    },
    select(expr: Exp, selectStmt: Node<'SelectStmt'>): Node<'In'> {
      return n.createNode('In', { expr, values: { variant: 'Select', selectStmt } });
    },
    tableName(expr: Exp, table: string | Id, schema?: string | Id): Node<'In'> {
      return n.createNode('In', {
        expr,
        values: { variant: 'TableName', table: identifier(table), schema: schema ? identifier(schema) : undefined },
      });
    },
    tableFunctionInvocation(expr: Exp, functionName: string | Id, parameters?: NonEmptyArray<Exp>, schema?: string | Id): Node<'In'> {
      return n.createNode('In', {
        expr,
        values: {
          variant: 'TableFunctionInvocation',
          functionName: identifier(functionName),
          parameters,
          schema: schema ? identifier(schema) : undefined,
        },
      });
    },
  },
  NotIn: {
    list(expr: Exp, items?: NonEmptyArray<Exp>): Node<'NotIn'> {
      return n.createNode('NotIn', { expr, values: { variant: 'List', items } });
    },
    select(expr: Exp, selectStmt: Node<'SelectStmt'>): Node<'NotIn'> {
      return n.createNode('NotIn', { expr, values: { variant: 'Select', selectStmt } });
    },
    tableName(expr: Exp, table: string | Id, schema?: string | Id): Node<'NotIn'> {
      return n.createNode('NotIn', {
        expr,
        values: { variant: 'TableName', table: identifier(table), schema: schema ? identifier(schema) : undefined },
      });
    },
    tableFunctionInvocation(expr: Exp, functionName: string | Id, parameters?: NonEmptyArray<Exp>, schema?: string | Id): Node<'NotIn'> {
      return n.createNode('NotIn', {
        expr,
        values: {
          variant: 'TableFunctionInvocation',
          functionName: identifier(functionName),
          parameters,
          schema: schema ? identifier(schema) : undefined,
        },
      });
    },
  },
  match(leftExpr: Exp, rightExpr: Exp): Node<'Match'> {
    return n.createNode('Match', { leftExpr, rightExpr });
  },
  notMatch(leftExpr: Exp, rightExpr: Exp): Node<'NotMatch'> {
    return n.createNode('NotMatch', { leftExpr, rightExpr });
  },
  like(leftExpr: Exp, rightExpr: Exp): Node<'Like'> {
    return n.createNode('Like', { leftExpr, rightExpr });
  },
  notLike(leftExpr: Exp, rightExpr: Exp): Node<'NotLike'> {
    return n.createNode('NotLike', { leftExpr, rightExpr });
  },
  glob(leftExpr: Exp, rightExpr: Exp): Node<'Glob'> {
    return n.createNode('Glob', { leftExpr, rightExpr });
  },
  notGlob(leftExpr: Exp, rightExpr: Exp): Node<'NotGlob'> {
    return n.createNode('NotGlob', { leftExpr, rightExpr });
  },
  regexp(leftExpr: Exp, rightExpr: Exp): Node<'Regexp'> {
    return n.createNode('Regexp', { leftExpr, rightExpr });
  },
  notRegexp(leftExpr: Exp, rightExpr: Exp): Node<'NotRegexp'> {
    return n.createNode('NotRegexp', { leftExpr, rightExpr });
  },
  isnull(expr: Exp): Node<'Isnull'> {
    return n.createNode('Isnull', { expr });
  },
  notnull(expr: Exp): Node<'Notnull'> {
    return n.createNode('Notnull', { expr });
  },
  notNull(expr: Exp): Node<'NotNull'> {
    return n.createNode('NotNull', { expr });
  },
  lowerThan(leftExpr: Exp, rightExpr: Exp): Node<'LowerThan'> {
    return n.createNode('LowerThan', { leftExpr, rightExpr });
  },
  greaterThan(leftExpr: Exp, rightExpr: Exp): Node<'GreaterThan'> {
    return n.createNode('GreaterThan', { leftExpr, rightExpr });
  },
  lowerThanOrEqual(leftExpr: Exp, rightExpr: Exp): Node<'LowerThanOrEqual'> {
    return n.createNode('LowerThanOrEqual', { leftExpr, rightExpr });
  },
  greaterThanOrEqual(leftExpr: Exp, rightExpr: Exp): Node<'GreaterThanOrEqual'> {
    return n.createNode('GreaterThanOrEqual', { leftExpr, rightExpr });
  },
  bitwiseAnd(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseAnd'> {
    return n.createNode('BitwiseAnd', { leftExpr, rightExpr });
  },
  bitwiseOr(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseOr'> {
    return n.createNode('BitwiseOr', { leftExpr, rightExpr });
  },
  bitwiseShiftLeft(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseShiftLeft'> {
    return n.createNode('BitwiseShiftLeft', { leftExpr, rightExpr });
  },
  bitwiseShiftRight(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseShiftRight'> {
    return n.createNode('BitwiseShiftRight', { leftExpr, rightExpr });
  },
  add(leftExpr: Exp, rightExpr: Exp): Node<'Add'> {
    return n.createNode('Add', { leftExpr, rightExpr });
  },
  subtract(leftExpr: Exp, rightExpr: Exp): Node<'Subtract'> {
    return n.createNode('Subtract', { leftExpr, rightExpr });
  },
  multiply(leftExpr: Exp, rightExpr: Exp): Node<'Multiply'> {
    return n.createNode('Multiply', { leftExpr, rightExpr });
  },
  divide(leftExpr: Exp, rightExpr: Exp): Node<'Divide'> {
    return n.createNode('Divide', { leftExpr, rightExpr });
  },
  modulo(leftExpr: Exp, rightExpr: Exp): Node<'Modulo'> {
    return n.createNode('Modulo', { leftExpr, rightExpr });
  },
  concatenate(leftExpr: Exp, rightExpr: Exp): Node<'Concatenate'> {
    return n.createNode('Concatenate', { leftExpr, rightExpr });
  },
  collate(expr: Exp, collationName: string | Id): Node<'Collate'> {
    return n.createNode('Collate', { expr, collationName: identifier(collationName) });
  },
  bitwiseNegation(expr: Exp): Node<'BitwiseNegation'> {
    return n.createNode('BitwiseNegation', { expr });
  },
  plus(expr: Exp): Node<'Plus'> {
    return n.createNode('Plus', { expr });
  },
  minus(expr: Exp): Node<'Minus'> {
    return n.createNode('Minus', { expr });
  },
  exists(selectStmt: Node<'SelectStmt'>): Node<'Exists'> {
    return n.createNode('Exists', { selectStmt, exists: true });
  },
  notExists(selectStmt: Node<'SelectStmt'>): Node<'NotExists'> {
    return n.createNode('NotExists', { selectStmt });
  },
  parenthesis(first: Exp, ...other: Array<Exp>): Node<'Parenthesis'> {
    return n.createNode('Parenthesis', { exprs: [first, ...other] });
  },
  castAs(expr: Exp, typeName: Node<'TypeName'> | ValidTypeName): Node<'CastAs'> {
    return n.createNode('CastAs', { expr, typeName: typeof typeName === 'string' ? TypeName(typeName) : typeName });
  },
  case(expr: Exp | null, cases: NonEmptyArray<{ whenExpr: Exp; thenExpr: Exp }>, elseExpr?: Exp): Node<'Case'> {
    return n.createNode('Case', { expr: expr ?? undefined, cases, else: elseExpr });
  },
};

const BindParameter = {
  indexed(): Node<'BindParameter'> {
    return n.createNode('BindParameter', { variant: 'Indexed' });
  },
  numbered(number: number): Node<'BindParameter'> {
    return n.createNode('BindParameter', { variant: 'Numbered', number: Math.abs(Math.floor(number)) });
  },
  atNamed(name: string, suffix?: string): Node<'BindParameter'> {
    return n.createNode('BindParameter', { variant: 'AtNamed', name, suffix });
  },
  colonNamed(name: string, suffix?: string): Node<'BindParameter'> {
    return n.createNode('BindParameter', { variant: 'ColonNamed', name, suffix });
  },
  dollarNamed(name: string, suffix?: string): Node<'BindParameter'> {
    return n.createNode('BindParameter', { variant: 'DollarNamed', name, suffix });
  },
};

const RaiseFunction = {
  ignore(): Node<'RaiseFunction'> {
    return n.createNode('RaiseFunction', { variant: 'Ignore' });
  },
  rollback(errorMessage: Node<'StringLiteral'> | string): Node<'RaiseFunction'> {
    return n.createNode('RaiseFunction', { variant: 'Rollback', errorMessage: LiteralValue.stringLiteral(errorMessage) });
  },
  abort(errorMessage: Node<'StringLiteral'> | string): Node<'RaiseFunction'> {
    return n.createNode('RaiseFunction', { variant: 'Abort', errorMessage: LiteralValue.stringLiteral(errorMessage) });
  },
  fail(errorMessage: Node<'StringLiteral'> | string): Node<'RaiseFunction'> {
    return n.createNode('RaiseFunction', { variant: 'Fail', errorMessage: LiteralValue.stringLiteral(errorMessage) });
  },
};

export const Expr = {
  ...LiteralValue,
  ...Operations,

  literal,
  identifier,
  column,
  columnFromString,
  functionInvocation,
  aggregateFunctionInvocation,

  BindParameter,
  ScalarFunctions,
  AggregateFunctions,
  RaiseFunction,
};

function aggregateFunctionInvocation(
  name: string,
  args: { distinct?: boolean; params: Exp | Exp[] } | '*',
  filterClause?: Node<'FilterClause'>
): Node<'AggregateFunctionInvocation'> {
  if (args === '*') {
    return n.createNode('AggregateFunctionInvocation', {
      aggregateFunc: identifier(name),
      parameters: { variant: 'Star' },
      filterClause,
    });
  }
  const distinct = args.distinct === true ? true : undefined;
  const argsArr = arrayToNonEmptyArray(Array.isArray(args.params) ? args.params : [args.params]);
  return n.createNode('AggregateFunctionInvocation', {
    aggregateFunc: identifier(name),
    parameters: { variant: 'Exprs', distinct, exprs: argsArr },
    filterClause,
  });
}

function functionInvocation(name: string, ...args: Exp[]): Node<'FunctionInvocation'> {
  return n.createNode('FunctionInvocation', {
    functionName: identifier(name),
    parameters: args.length === 0 ? undefined : { variant: 'Exprs', exprs: arrayToNonEmptyArray(args) },
  });
}

function literal(val: null | number | string | boolean): n.LiteralValue {
  if (val === true) {
    return LiteralValue.true;
  }
  if (val === false) {
    return LiteralValue.false;
  }
  if (val === null) {
    return LiteralValue.null;
  }
  if (typeof val === 'number') {
    const isInt = Math.floor(val) === val;
    if (isInt) {
      return LiteralValue.NumericLiteral.integer(val);
    }
    const integral = Math.floor(val);
    const fractional = parseInt((val - integral).toString().slice(2));
    return LiteralValue.NumericLiteral.float(integral, fractional);
  }
  if (typeof val === 'string') {
    return LiteralValue.stringLiteral(val);
  }
  throw new Error(`Invalid literal: ${val}`);
}

function identifier(name: string | Id, variant?: Id['variant']): Id {
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
 * - col
 * - table.col
 * - schema.table.col
 */
function columnFromString(col: string): Node<'Column'> {
  const parts = col.split('.');
  if (parts.length === 1) {
    return column(parts[0]);
  }
  if (parts.length === 2) {
    return column({ table: parts[0], column: parts[1] });
  }
  if (parts.length === 3) {
    return column({ table: { schema: parts[0], table: parts[1] }, column: parts[2] });
  }
  throw new Error(`Invalid column: ${col} (too many parts)`);
}

function column(column: string | { column: string | Id; table?: string | { table: string | Id; schema?: string | Id } }): Node<'Column'> {
  if (typeof column === 'string') {
    return n.createNode('Column', { columnName: identifier(column) });
  }
  const table = column.table;
  return n.createNode('Column', {
    columnName: identifier(column.column),
    table:
      table === undefined
        ? undefined
        : typeof table === 'string'
        ? { name: identifier(table) }
        : { name: identifier(table.table), schema: table.schema ? identifier(table.schema) : undefined },
  });
}
