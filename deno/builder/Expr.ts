import * as n from '../Node.ts';
import { AnyOperator, OperatorPrecedence } from '../Operator.ts';
import { NonEmptyArray, arrayToNonEmptyArray } from '../Utils.ts';
import { TypeName, ValidTypeName } from './TypeName.ts';

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

const SIMPLE_IDENTIFIER_REG = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export interface AggregateFunctionParams<Expr = Exp[]> {
  distinct?: boolean;
  params: Expr;
}

type AFI = Node<'AggregateFunctionInvocation'>;

export const AggregateFunctions = {
  avg: (options: AggregateFunctionParams<Exp>): AFI => aggregateFunctionInvocation('avg', options),
  count: (options: AggregateFunctionParams<Exp>): AFI => aggregateFunctionInvocation('count', options),
  group_concat: (options: AggregateFunctionParams<Exp | [x: Exp, y: Exp]>): AFI =>
    aggregateFunctionInvocation('group_concat', options),
  max: (options: AggregateFunctionParams<Exp>): AFI => aggregateFunctionInvocation('max', options),
  min: (options: AggregateFunctionParams<Exp>): AFI => aggregateFunctionInvocation('min', options),
  sum: (options: AggregateFunctionParams<Exp>): AFI => aggregateFunctionInvocation('sum', options),
  total: (options: AggregateFunctionParams<Exp>): AFI => aggregateFunctionInvocation('total', options),
  // JSON
  json_group_array: (options: AggregateFunctionParams<Exp>): AFI =>
    aggregateFunctionInvocation('json_group_array', options),
  json_group_object: (options: AggregateFunctionParams<[name: Exp, value: Exp]>): AFI =>
    aggregateFunctionInvocation('json_group_object', options),
};

type SFI = Node<'SimpleFunctionInvocation'>;

// https://www.sqlite.org/lang_corefunc.html
export const ScalarFunctions = {
  abs: (x: Exp): SFI => simpleFunctionInvocation('abs', x),
  changes: (): SFI => simpleFunctionInvocation('changes'),
  char: (x1: Exp, x2: Exp, ...xn: Exp[]): SFI => simpleFunctionInvocation('char', x1, x2, ...xn),
  coalesce: (x: Exp, y: Exp, ...yn: Exp[]): SFI => simpleFunctionInvocation('coalesce', x, y, ...yn),
  format: (format: Exp, ...args: Exp[]): SFI => simpleFunctionInvocation('format', format, ...args),
  glob: (x: Exp, y: Exp): SFI => simpleFunctionInvocation('glob', x, y),
  hex: (x: Exp): SFI => simpleFunctionInvocation('hex', x),
  ifnull: (x: Exp, y: Exp): SFI => simpleFunctionInvocation('ifnull', x, y),
  iif: (x: Exp, y: Exp, z: Exp): SFI => simpleFunctionInvocation('iif', x, y, z),
  instr: (x: Exp, y: Exp): SFI => simpleFunctionInvocation('instr', x, y),
  last_insert_rowid: (): SFI => simpleFunctionInvocation('last_insert_rowid'),
  length: (x: Exp): SFI => simpleFunctionInvocation('length', x),
  like: (x: Exp, y: Exp, z?: Exp): SFI =>
    z ? simpleFunctionInvocation('like', x, y, z) : simpleFunctionInvocation('like', x, y),
  likelihood: (x: Exp, y: Exp): SFI => simpleFunctionInvocation('likelihood', x, y),
  likely: (x: Exp): SFI => simpleFunctionInvocation('likely', x),
  load_extension: (x: Exp, y?: Exp): SFI =>
    y ? simpleFunctionInvocation('load_extension', x, y) : simpleFunctionInvocation('load_extension', x),
  lower: (x: Exp): SFI => simpleFunctionInvocation('lower', x),
  ltrim: (x: Exp, y?: Exp): SFI => (y ? simpleFunctionInvocation('ltrim', x, y) : simpleFunctionInvocation('ltrim', x)),
  max: (x: Exp, y: Exp, ...yn: Exp[]): SFI => simpleFunctionInvocation('max', x, y, ...yn),
  min: (x: Exp, y: Exp, ...yn: Exp[]): SFI => simpleFunctionInvocation('min', x, y, ...yn),
  nullif: (x: Exp, y: Exp): SFI => simpleFunctionInvocation('nullif', x, y),
  printf: (format: Exp, ...args: Exp[]): SFI => simpleFunctionInvocation('printf', format, ...args),
  quote: (x: Exp): SFI => simpleFunctionInvocation('quote', x),
  random: (): SFI => simpleFunctionInvocation('random'),
  randomblob: (n: Exp): SFI => simpleFunctionInvocation('randomblob', n),
  replace: (x: Exp, y: Exp, z: Exp): SFI => simpleFunctionInvocation('replace', x, y, z),
  round: (x: Exp, y?: Exp): SFI => (y ? simpleFunctionInvocation('round', x, y) : simpleFunctionInvocation('round', x)),
  rtrim: (x: Exp, y?: Exp): SFI => (y ? simpleFunctionInvocation('rtrim', x, y) : simpleFunctionInvocation('rtrim', x)),
  sign: (x: Exp): SFI => simpleFunctionInvocation('sign', x),
  soundex: (x: Exp): SFI => simpleFunctionInvocation('soundex', x),
  sqlite_compileoption_get: (n: Exp): SFI => simpleFunctionInvocation('sqlite_compileoption_get', n),
  sqlite_compileoption_used: (x: Exp): SFI => simpleFunctionInvocation('sqlite_compileoption_used', x),
  sqlite_offset: (x: Exp): SFI => simpleFunctionInvocation('sqlite_offset', x),
  sqlite_source_id: (): SFI => simpleFunctionInvocation('sqlite_source_id'),
  sqlite_version: (): SFI => simpleFunctionInvocation('sqlite_version'),
  substr: (x: Exp, y: Exp, z?: Exp): SFI =>
    z ? simpleFunctionInvocation('substr', x, y, z) : simpleFunctionInvocation('substr', x, y),
  substring: (x: Exp, y: Exp, z?: Exp): SFI =>
    z ? simpleFunctionInvocation('substring', x, y, z) : simpleFunctionInvocation('substring', x, y),
  total_changes: (): SFI => simpleFunctionInvocation('total_changes'),
  trim: (x: Exp, y?: Exp): SFI => (y ? simpleFunctionInvocation('trim', x, y) : simpleFunctionInvocation('trim', x)),
  typeof: (x: Exp): SFI => simpleFunctionInvocation('typeof', x),
  unicode: (x: Exp): SFI => simpleFunctionInvocation('unicode', x),
  unlikely: (x: Exp): SFI => simpleFunctionInvocation('unlikely', x),
  upper: (x: Exp): SFI => simpleFunctionInvocation('upper', x),
  zeroblob: (n: Exp): SFI => simpleFunctionInvocation('zeroblob', n),
  // JSON
  json: (x: Exp): SFI => simpleFunctionInvocation('json', x),
  json_array: (...valueN: Exp[]): SFI => simpleFunctionInvocation('json_array', ...valueN),
  json_array_length: (json: Exp, path?: Exp): SFI =>
    path
      ? simpleFunctionInvocation('json_array_length', json, path)
      : simpleFunctionInvocation('json_array_length', json),
  json_extract: (json: Exp, path: Exp, ...pathN: Exp[]): SFI =>
    simpleFunctionInvocation('json_extract', json, path, ...pathN),
  json_insert: (json: Exp, path: Exp, value: Exp, ...pathValueN: Exp[]): SFI =>
    simpleFunctionInvocation('json_insert', json, path, value, ...pathValueN),
  json_object: (...labelValueN: Exp[]): SFI => simpleFunctionInvocation('json_object', ...labelValueN),
  json_patch: (json1: Exp, json2: Exp): SFI => simpleFunctionInvocation('json_patch', json1, json2),
  json_remove: (json: Exp, path: Exp, ...pathN: Exp[]): SFI =>
    simpleFunctionInvocation('json_remove', json, path, ...pathN),
  json_replace: (json: Exp, path: Exp, value: Exp, ...pathValueN: Exp[]): SFI =>
    simpleFunctionInvocation('json_replace', json, path, value, ...pathValueN),
  json_set: (json: Exp, path: Exp, value: Exp, ...pathValueN: Exp[]): SFI =>
    simpleFunctionInvocation('json_set', json, path, value, ...pathValueN),
  json_type: (json: Exp, path?: Exp): SFI =>
    path ? simpleFunctionInvocation('json_type', json, path) : simpleFunctionInvocation('json_type', json),
  json_valid: (json: Exp): SFI => simpleFunctionInvocation('json_valid', json),
  json_quote: (value: Exp): SFI => simpleFunctionInvocation('json_quote', value),
};

const LiteralValue = {
  NumericLiteral: {
    integer(integer: number, exponent?: number): Node<'NumericLiteral'> {
      return n.createNode('NumericLiteral', {
        variant: 'Integer',
        integer: Math.floor(integer),
        exponent:
          exponent === undefined
            ? undefined
            : { e: 'e', sign: exponent < 0 ? '-' : undefined, number: Math.abs(Math.floor(exponent)) },
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
          exponent === undefined
            ? undefined
            : { e: 'e', sign: exponent < 0 ? '-' : undefined, number: Math.abs(Math.floor(exponent)) },
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
    return n.createNode('Or', {
      leftExpr: ensurePrecedence(leftExpr, 'Or'),
      rightExpr: ensurePrecedence(rightExpr, 'Or'),
    });
  },
  and(leftExpr: Exp, rightExpr: Exp): Node<'And'> {
    return n.createNode('And', {
      leftExpr: ensurePrecedence(leftExpr, 'And'),
      rightExpr: ensurePrecedence(rightExpr, 'And'),
    });
  },
  not(expr: Exp): Node<'Not'> {
    return n.createNode('Not', { expr: ensurePrecedence(expr, 'Not') });
  },
  equal(leftExpr: Exp, rightExpr: Exp): Node<'Equal'> {
    return n.createNode('Equal', {
      operator: '==',
      leftExpr: ensurePrecedence(leftExpr, 'Equal'),
      rightExpr: ensurePrecedence(rightExpr, 'Equal'),
    });
  },
  different(leftExpr: Exp, rightExpr: Exp): Node<'Different'> {
    return n.createNode('Different', {
      operator: '!=',
      leftExpr: ensurePrecedence(leftExpr, 'Different'),
      rightExpr: ensurePrecedence(rightExpr, 'Different'),
    });
  },
  is(leftExpr: Exp, rightExpr: Exp): Node<'Is'> {
    return n.createNode('Is', {
      leftExpr: ensurePrecedence(leftExpr, 'Is'),
      rightExpr: ensurePrecedence(rightExpr, 'Is'),
    });
  },
  isNot(leftExpr: Exp, rightExpr: Exp): Node<'Is'> {
    return n.createNode('Is', {
      not: true,
      leftExpr: ensurePrecedence(leftExpr, 'Is'),
      rightExpr: ensurePrecedence(rightExpr, 'Is'),
    });
  },
  notBetween(expr: Exp, betweenExpr: Exp, andExpr: Exp): Node<'Between'> {
    return n.createNode('Between', {
      expr: ensurePrecedence(expr, 'Between'),
      betweenExpr: ensurePrecedence(betweenExpr, 'Between'),
      not: true,
      andExpr: ensurePrecedence(andExpr, 'Between'),
    });
  },
  between(expr: Exp, betweenExpr: Exp, andExpr: Exp): Node<'Between'> {
    return n.createNode('Between', {
      expr: ensurePrecedence(expr, 'Between'),
      betweenExpr: ensurePrecedence(betweenExpr, 'Between'),
      andExpr: ensurePrecedence(andExpr, 'Between'),
    });
  },
  In: {
    list(expr: Exp, items?: NonEmptyArray<Exp>): Node<'In'> {
      return n.createNode('In', { expr: ensurePrecedence(expr, 'In'), values: { variant: 'List', items } });
    },
    select(expr: Exp, selectStmt: Node<'SelectStmt'>): Node<'In'> {
      return n.createNode('In', { expr: ensurePrecedence(expr, 'In'), values: { variant: 'Select', selectStmt } });
    },
    tableName(expr: Exp, table: string | Id, schema?: string | Id): Node<'In'> {
      return n.createNode('In', {
        expr: ensurePrecedence(expr, 'In'),
        values: {
          variant: 'TableName',
          tableName: identifier(table),
          schemaName: schema ? identifier(schema) : undefined,
        },
      });
    },
    tableFunctionInvocation(
      expr: Exp,
      functionName: string | Id,
      parameters?: NonEmptyArray<Exp>,
      schema?: string | Id
    ): Node<'In'> {
      return n.createNode('In', {
        expr: ensurePrecedence(expr, 'In'),
        values: {
          variant: 'TableFunctionInvocation',
          functionName: identifier(functionName),
          parameters,
          schemaName: schema ? identifier(schema) : undefined,
        },
      });
    },
  },
  NotIn: {
    list(expr: Exp, items?: NonEmptyArray<Exp>): Node<'In'> {
      return n.createNode('In', { expr: ensurePrecedence(expr, 'In'), not: true, values: { variant: 'List', items } });
    },
    select(expr: Exp, selectStmt: Node<'SelectStmt'>): Node<'In'> {
      return n.createNode('In', {
        expr: ensurePrecedence(expr, 'In'),
        not: true,
        values: { variant: 'Select', selectStmt },
      });
    },
    tableName(expr: Exp, table: string | Id, schema?: string | Id): Node<'In'> {
      return n.createNode('In', {
        expr: ensurePrecedence(expr, 'In'),
        not: true,
        values: {
          variant: 'TableName',
          tableName: identifier(table),
          schemaName: schema ? identifier(schema) : undefined,
        },
      });
    },
    tableFunctionInvocation(
      expr: Exp,
      functionName: string | Id,
      parameters?: NonEmptyArray<Exp>,
      schema?: string | Id
    ): Node<'In'> {
      return n.createNode('In', {
        expr: ensurePrecedence(expr, 'In'),
        not: true,
        values: {
          variant: 'TableFunctionInvocation',
          functionName: identifier(functionName),
          parameters,
          schemaName: schema ? identifier(schema) : undefined,
        },
      });
    },
  },
  match(leftExpr: Exp, rightExpr: Exp): Node<'Match'> {
    return n.createNode('Match', {
      leftExpr: ensurePrecedence(leftExpr, 'Match'),
      rightExpr: ensurePrecedence(rightExpr, 'Match'),
    });
  },
  notMatch(leftExpr: Exp, rightExpr: Exp): Node<'Match'> {
    return n.createNode('Match', {
      not: true,
      leftExpr: ensurePrecedence(leftExpr, 'Match'),
      rightExpr: ensurePrecedence(rightExpr, 'Match'),
    });
  },
  like(leftExpr: Exp, rightExpr: Exp): Node<'Like'> {
    return n.createNode('Like', {
      leftExpr: ensurePrecedence(leftExpr, 'Like'),
      rightExpr: ensurePrecedence(rightExpr, 'Like'),
    });
  },
  notLike(leftExpr: Exp, rightExpr: Exp): Node<'Like'> {
    return n.createNode('Like', {
      not: true,
      leftExpr: ensurePrecedence(leftExpr, 'Like'),
      rightExpr: ensurePrecedence(rightExpr, 'Like'),
    });
  },
  glob(leftExpr: Exp, rightExpr: Exp): Node<'Glob'> {
    return n.createNode('Glob', {
      leftExpr: ensurePrecedence(leftExpr, 'Glob'),
      rightExpr: ensurePrecedence(rightExpr, 'Glob'),
    });
  },
  notGlob(leftExpr: Exp, rightExpr: Exp): Node<'Glob'> {
    return n.createNode('Glob', {
      leftExpr: ensurePrecedence(leftExpr, 'Glob'),
      not: true,
      rightExpr: ensurePrecedence(rightExpr, 'Glob'),
    });
  },
  regexp(leftExpr: Exp, rightExpr: Exp): Node<'Regexp'> {
    return n.createNode('Regexp', {
      leftExpr: ensurePrecedence(leftExpr, 'Regexp'),
      rightExpr: ensurePrecedence(rightExpr, 'Regexp'),
    });
  },
  notRegexp(leftExpr: Exp, rightExpr: Exp): Node<'Regexp'> {
    return n.createNode('Regexp', {
      leftExpr: ensurePrecedence(leftExpr, 'Regexp'),
      not: true,
      rightExpr: ensurePrecedence(rightExpr, 'Regexp'),
    });
  },
  isnull(expr: Exp): Node<'Isnull'> {
    return n.createNode('Isnull', { expr: ensurePrecedence(expr, 'Isnull') });
  },
  isNull(expr: Exp): Node<'Is'> {
    return n.createNode('Is', { leftExpr: ensurePrecedence(expr, 'Is'), rightExpr: LiteralValue.null });
  },
  notnull(expr: Exp): Node<'Notnull'> {
    return n.createNode('Notnull', { expr: ensurePrecedence(expr, 'Notnull') });
  },
  notNull(expr: Exp): Node<'NotNull'> {
    return n.createNode('NotNull', { expr: ensurePrecedence(expr, 'NotNull') });
  },
  lowerThan(leftExpr: Exp, rightExpr: Exp): Node<'LowerThan'> {
    return n.createNode('LowerThan', {
      leftExpr: ensurePrecedence(leftExpr, 'LowerThan'),
      rightExpr: ensurePrecedence(rightExpr, 'LowerThan'),
    });
  },
  greaterThan(leftExpr: Exp, rightExpr: Exp): Node<'GreaterThan'> {
    return n.createNode('GreaterThan', {
      leftExpr: ensurePrecedence(leftExpr, 'GreaterThan'),
      rightExpr: ensurePrecedence(rightExpr, 'GreaterThan'),
    });
  },
  lowerThanOrEqual(leftExpr: Exp, rightExpr: Exp): Node<'LowerThanOrEqual'> {
    return n.createNode('LowerThanOrEqual', {
      leftExpr: ensurePrecedence(leftExpr, 'LowerThanOrEqual'),
      rightExpr: ensurePrecedence(rightExpr, 'LowerThanOrEqual'),
    });
  },
  greaterThanOrEqual(leftExpr: Exp, rightExpr: Exp): Node<'GreaterThanOrEqual'> {
    return n.createNode('GreaterThanOrEqual', {
      leftExpr: ensurePrecedence(leftExpr, 'GreaterThanOrEqual'),
      rightExpr: ensurePrecedence(rightExpr, 'GreaterThanOrEqual'),
    });
  },
  bitwiseAnd(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseAnd'> {
    return n.createNode('BitwiseAnd', {
      leftExpr: ensurePrecedence(leftExpr, 'BitwiseAnd'),
      rightExpr: ensurePrecedence(rightExpr, 'BitwiseAnd'),
    });
  },
  bitwiseOr(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseOr'> {
    return n.createNode('BitwiseOr', {
      leftExpr: ensurePrecedence(leftExpr, 'BitwiseOr'),
      rightExpr: ensurePrecedence(rightExpr, 'BitwiseOr'),
    });
  },
  bitwiseShiftLeft(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseShiftLeft'> {
    return n.createNode('BitwiseShiftLeft', {
      leftExpr: ensurePrecedence(leftExpr, 'BitwiseShiftLeft'),
      rightExpr: ensurePrecedence(rightExpr, 'BitwiseShiftLeft'),
    });
  },
  bitwiseShiftRight(leftExpr: Exp, rightExpr: Exp): Node<'BitwiseShiftRight'> {
    return n.createNode('BitwiseShiftRight', {
      leftExpr: ensurePrecedence(leftExpr, 'BitwiseShiftRight'),
      rightExpr: ensurePrecedence(rightExpr, 'BitwiseShiftRight'),
    });
  },
  add(leftExpr: Exp, rightExpr: Exp): Node<'Add'> {
    return n.createNode('Add', {
      leftExpr: ensurePrecedence(leftExpr, 'Add'),
      rightExpr: ensurePrecedence(rightExpr, 'Add'),
    });
  },
  subtract(leftExpr: Exp, rightExpr: Exp): Node<'Subtract'> {
    return n.createNode('Subtract', {
      leftExpr: ensurePrecedence(leftExpr, 'Subtract'),
      rightExpr: ensurePrecedence(rightExpr, 'Subtract'),
    });
  },
  multiply(leftExpr: Exp, rightExpr: Exp): Node<'Multiply'> {
    return n.createNode('Multiply', {
      leftExpr: ensurePrecedence(leftExpr, 'Multiply'),
      rightExpr: ensurePrecedence(rightExpr, 'Multiply'),
    });
  },
  divide(leftExpr: Exp, rightExpr: Exp): Node<'Divide'> {
    return n.createNode('Divide', {
      leftExpr: ensurePrecedence(leftExpr, 'Divide'),
      rightExpr: ensurePrecedence(rightExpr, 'Divide'),
    });
  },
  modulo(leftExpr: Exp, rightExpr: Exp): Node<'Modulo'> {
    return n.createNode('Modulo', {
      leftExpr: ensurePrecedence(leftExpr, 'Modulo'),
      rightExpr: ensurePrecedence(rightExpr, 'Modulo'),
    });
  },
  concatenate(leftExpr: Exp, rightExpr: Exp): Node<'Concatenate'> {
    return n.createNode('Concatenate', {
      leftExpr: ensurePrecedence(leftExpr, 'Concatenate'),
      rightExpr: ensurePrecedence(rightExpr, 'Concatenate'),
    });
  },
  collate(expr: Exp, collationName: string | Id): Node<'Collate'> {
    return n.createNode('Collate', {
      expr: ensurePrecedence(expr, 'Collate'),
      collationName: identifier(collationName),
    });
  },
  bitwiseNegation(expr: Exp): Node<'BitwiseNegation'> {
    return n.createNode('BitwiseNegation', { expr: ensurePrecedence(expr, 'BitwiseNegation') });
  },
  plus(expr: Exp): Node<'Plus'> {
    return n.createNode('Plus', { expr: ensurePrecedence(expr, 'Plus') });
  },
  minus(expr: Exp): Node<'Minus'> {
    return n.createNode('Minus', { expr: ensurePrecedence(expr, 'Minus') });
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
    return n.createNode('RaiseFunction', {
      variant: 'Rollback',
      errorMessage: LiteralValue.stringLiteral(errorMessage),
    });
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
  simpleFunctionInvocation,
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

function simpleFunctionInvocation(name: string, ...args: Exp[]): Node<'SimpleFunctionInvocation'> {
  return n.createNode('SimpleFunctionInvocation', {
    simpleFunc: identifier(name),
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

function column(
  column: string | { column: string | Id; table?: string | { table: string | Id; schema?: string | Id } }
): Node<'Column'> {
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

function ensurePrecedence(expr: Exp, parentOperator: AnyOperator): Exp {
  const expPrec = getPrecedence(expr);
  const parentPrec = OperatorPrecedence[parentOperator];
  if (expPrec === null) {
    return expr;
  }
  if (expPrec <= parentPrec) {
    return Expr.parenthesis(expr);
  }
  return expr;
}

function getPrecedence(expr: Exp): number | null {
  return OperatorPrecedence[expr.kind as AnyOperator] ?? null;
}
