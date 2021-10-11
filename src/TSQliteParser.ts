/* eslint-disable no-control-regex */
import * as c from './Combinator';
import { NodeKind, Node, NodeBase, NodeData, NonEmptyList, NonEmptyListSepBy, NonEmptyCommaList, NonEmptyCommaListSingle } from './Node';
import { Complete, Parser, ParseResult, ParseResultFailure, ParseResultSuccess, Rule } from './types';
import { TSQliteError } from './TSQliteError';
import { StringReader } from './StringReader';
import { executeParser, failureToStack, ParseFailure, ParseSuccess } from './Parser';
import { KEYWORDS } from './Keyword';
import { OperatorPrecedence } from './Operators';
import { Fragment, FragmentName } from './Fragment';

export type Ranges = Map<NodeBase, { start: number; end: number }>;

type Ctx = {
  ranges: Ranges;
  createNode<K extends NodeKind>(kind: K, start: number, end: number, data: Complete<NodeData[K]>): Node<K>;
};

export interface ParseResultWithRanges<T> {
  result: T;
  ranges: Ranges;
  rest: string | null;
}

export const TSQliteParser = {
  parseSqlStmtList,
  parseAdvanced,
};

function parseAdvanced<T>(parser: Parser<T, Ctx>, file: string): ParseResultWithRanges<T> {
  const ctx = createContext();
  const input = StringReader(file);
  const result = executeParser(parser, input, ctx);
  if (result.type === 'Failure') {
    throw new TSQliteError.ParsingError(failureToStack(result));
  }
  return { result: result.value, ranges: ctx.ranges, rest: result.rest.empty ? null : result.rest.peek(Infinity) };
}

function parseSqlStmtList(file: string): ParseResultWithRanges<Node<'SqlStmtList'>> {
  return parseAdvanced(nodeParser('SqlStmtList'), file);
}

const eofParser = c.eof<Ctx>();
const semicolonParser = createExact(';');
const questionMarkParser = createExact('?');
const dotParser = createExact('.');
const colonParser = createExact(':');
const colonPairParser = createExact('::');
const starParser = createExact('*');
const atParser = createExact('@');
const dollarParser = createExact('$');
const commaParser = createExact(',');
const tildeParser = createExact('~');
const plusParser = createExact('+');
const dashParser = createExact('-');
const openParentParser = createExact('(');
const closeParentParser = createExact(')');
const newLineParser = createExact('\n');
const concatenateParser = createExact('||');
const slashParser = createExact('/');
const percentParser = createExact('%');
const ampersandParser = createExact('&');
const pipeParser = createExact('|');
const bitwiseShiftLeftParser = createExact('<<');
const bitwiseShiftRightParser = createExact('<<');
const lowerThanParser = createExact('<');
const greaterThanParser = createExact('>');
const lowerThanOrEqualParser = createExact('<=');
const greaterThanOrEqualParser = createExact('>=');
const doubleEqualParser = createExact('==');
const equalParser = createExact('=');
const differentParser = createExact('<>');
const notEqualParser = createExact('!=');
const whitespaceRawParser = createRegexp('WhitespaceRaw', /^[ \t\n\r\u000c]+/g);
const blobParser = createRegexp('Blob', /^(x|X)'[0-9A-Fa-f]*'/g);
const integerParser = createRegexp('Integer', /^[0-9]+/g);
const hexParser = createRegexp('Hex', /^0(x|X)[0-9A-Fa-f]+/g);
const exponentiationSuffixRawParser = createRegexp('Exponentiation', /^(e|E)(\+|-)?[0-9]+/g);
const parameterRawNameParser = createRegexp('ParameterRawName', /^[A-Za-z0-9$]+/g);
const parameterSuffixParser = createRegexp('ParameterSuffix', /^([^ \t\n\r\u000c]+)/g);
const rawIdentifierParser = createRegexp('RawIdentifier', /^[A-Za-z_\u007f-\uffff][0-9A-Za-z_\u007f-\uffff$]*/g);
const typeNameItemParser = createRegexp('TypeNameItem', /^[A-Za-z][A-Za-z0-9]*/g);

const DOUBLE_QUOTE = '"';
const doubleQuoteParser = createExact(DOUBLE_QUOTE);
const DOUBLE_DOUBLE_QUOTE = '""';
const doubleDoubleQuoteParser = createExact(DOUBLE_DOUBLE_QUOTE);
const notDoubleQuoteParser = createRegexp('NotDoubleQuote', /^[^"]+/g);

const BACKTICK = '`';
const backtickParser = createExact(BACKTICK);
const DOUBLE_BACKTICK = '``';
const doubleBacktickParser = createExact(DOUBLE_BACKTICK);
const notBacktickParser = createRegexp('NotBacktick', /^[^`]+/g);

const SINGLE_QUOTE = "'";
const singleQuoteParser = createExact(SINGLE_QUOTE);
const DOUBLE_SINGLE_QUOTE = "''";
const doubleSingleQuoteParser = createExact(DOUBLE_SINGLE_QUOTE);
const notSingleQuoteParser = createRegexp('NotSingleQuote', /^[^']+/g);

const multilineCommentStartParser = createExact('/*');
const multilineCommentEndParser = createExact('*/');
const notStarParser = createRegexp('NotStar', /^[^*]+/g);

const singleLineCommentStart = createExact('--');
const notNewLineParser = createRegexp('NotNewLine', /^[^\n]+/g);

// prettier-ignore
type VirtualNodes ='Add' | 'And' | 'Between' | 'BitwiseOr' | 'BitwiseShiftLeft' | 'BitwiseShiftRight' | 'Collate' | 'Concatenate' | 'Different' | 'Divide' | 'Equal' | 'Escape' | 'Glob' | 'GreaterOrEqualThan' | 'GreaterThan' | 'In' | 'Is' | 'IsNot' | 'IsNull' | 'Like' | 'LowerOrEqualThan' | 'LowerThan' | 'Match' | 'Modulo' | 'Multiply' | 'Not_Null' | 'Not' | 'NotNull' | 'Or' | 'Regexp' | 'Subtract';
type NodeParserKeys = Exclude<NodeKind, VirtualNodes>;

export const NodeParser: { [K in NodeParserKeys]?: NodeRule<K> } = {};

export const KeywordParser: { [K in typeof KEYWORDS[number]]: Parser<K, Ctx> } = Object.fromEntries(KEYWORDS.map((k) => [k, createKeyword(k)])) as any;

// prettier-ignore
type NonCompleteNodes = 'CompoundOperator';

interface NodeRule<K extends NodeKind> extends Parser<Node<K>, Ctx> {
  setParser(parser: Parser<K extends NonCompleteNodes ? NodeData[K] : Complete<NodeData[K]>, Ctx>): void;
}

function nodeParser<K extends NodeParserKeys>(kind: K): NodeRule<K> {
  if (NodeParser[kind] === undefined) {
    const innerRule = c.rule<NodeData[K], Ctx>(kind);
    const rule = {
      ...innerRule,
      setParser: (parser: any) => {
        return innerRule.setParser(c.apply(parser, (data, start, end, ctx) => ctx.createNode(kind as any, start, end, data as any)));
      },
    } as NodeRule<K>;
    NodeParser[kind] = rule as any;
  }
  return NodeParser[kind] as any;
}

// prettier-ignore
type VirtualFragments = 'ExprP01' | 'ExprP02' | 'ExprP03' | 'ExprP04' | 'ExprP05' | 'ExprP06' | 'ExprP07' | 'ExprP08' | 'ExprP09' | 'ExprP10' | 'ExprP11' | 'ExprP12' | 'ExprP13';
type FragmentParserKeys = Exclude<FragmentName, VirtualFragments>;

export const FragmentParser: { [K in FragmentParserKeys]?: Rule<Fragment<K>, Ctx> } = {};

// prettier-ignore
type NonCompleteFragments = 'AggregateFunctionInvocation_Parameters' | 'AlterAction' | 'AnalyzeStmt_Target' | 'ColumnConstraint_Constraint' | 'Direction' | 'LiteralValue' | 'MaybeMaterialized' | 'CompoundSelectStmt_Item' | 'ConflictClause_OnConflict_Inner' | 'Temp' | 'CreateTableStmt_Definition';

interface FragmentRule<K extends FragmentParserKeys> extends Parser<Fragment<K>, Ctx> {
  setParser(parser: Parser<K extends NonCompleteFragments ? Fragment<K> : Complete<Fragment<K>>, Ctx>): void;
}

function fragmentParser<K extends FragmentParserKeys>(kind: K): FragmentRule<K> {
  if (FragmentParser[kind] === undefined) {
    FragmentParser[kind] = c.rule(kind) as any;
  }
  return FragmentParser[kind] as any;
}

const WhitespaceLikeParser = fragmentParser('WhitespaceLike');
const MaybeWhitespaceLikeParser = c.maybe(WhitespaceLikeParser);
const IdentifierParser = nodeParser('Identifier');
const ExprParser = fragmentParser('Expr');

nodeParser('AggregateFunctionInvocation').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('aggregateFunc', IdentifierParser),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('parameters', c.maybe(fragmentParser('AggregateFunctionInvocation_Parameters'))),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser,
      key('filterClause', c.maybe(fragmentParser('FilterClauseWithWhitespace')))
    )
  )
);

fragmentParser('WhitespaceLike').setParser(c.many(c.oneOf(nodeParser('Whitespace'), nodeParser('CommentSyntax')), { allowEmpty: false }));

fragmentParser('AggregateFunctionInvocation_Parameters').setParser(
  c.oneOf(fragmentParser('AggregateFunctionInvocation_Parameters_Star'), fragmentParser('AggregateFunctionInvocation_Parameters_Exprs'))
);

fragmentParser('AggregateFunctionInvocation_Parameters_Star').setParser(
  c.applyPipe([MaybeWhitespaceLikeParser, starParser], ([whitespaceBeforeStar, _star]) => ({ variant: 'Star', whitespaceBeforeStar }))
);

fragmentParser('AggregateFunctionInvocation_Parameters_Exprs').setParser(
  c.applyPipe([c.maybe(fragmentParser('AggregateFunctionInvocation_Parameters_Exprs_Distinct')), nonEmptyCommaSingleList(ExprParser)], ([distinct, exprs]) => ({
    variant: 'Exprs',
    distinct,
    exprs,
  }))
);

fragmentParser('AggregateFunctionInvocation_Parameters_Exprs_Distinct').setParser(
  c.applyPipe([MaybeWhitespaceLikeParser, KeywordParser.DISTINCT], ([whitespaceBeforeDistinctKeyword, distinctKeyword]) => ({
    whitespaceBeforeDistinctKeyword,
    distinctKeyword,
  }))
);

fragmentParser('FilterClauseWithWhitespace').setParser(
  c.applyPipe([MaybeWhitespaceLikeParser, nodeParser('FilterClause')], ([whitespaceBefore, filterClause]) => ({ whitespaceBefore, filterClause }))
);

nodeParser('AlterTableStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('alterKeyword', KeywordParser.ALTER),
      key('whitespaceBeforeTableKeyword', WhitespaceLikeParser),
      key('tableKeyword', KeywordParser.TABLE),
      key('whitespaceBeforeTable', WhitespaceLikeParser),
      key('table', fragmentParser('SchemaTable')),
      key('whitespaceBeforeAction', WhitespaceLikeParser),
      key('action', fragmentParser('AlterAction'))
    )
  )
);

fragmentParser('SchemaTable').setParser(
  c.applyPipe([c.maybe(fragmentParser('SchemaItem_Schema')), IdentifierParser], ([schema, table]) => ({ schema, table }))
);

fragmentParser('SchemaItem_Schema').setParser(
  c.applyPipe(
    [IdentifierParser, MaybeWhitespaceLikeParser, dotParser, MaybeWhitespaceLikeParser],
    ([schemaName, whitespaceBeforeDot, _dot, whitespaceAfterDot]) => ({ schemaName, whitespaceBeforeDot, whitespaceAfterDot })
  )
);

fragmentParser('AlterAction').setParser(
  c.oneOf(
    fragmentParser('AlterAction_RenameTo'),
    fragmentParser('AlterAction_RenameColumn'),
    fragmentParser('AlterAction_AddColumn'),
    fragmentParser('AlterAction_DropColumn')
  )
);

fragmentParser('AlterAction_RenameTo').setParser(
  c.keyed({ variant: 'RenameTo' }, (key) =>
    c.keyedPipe(
      key('renameKeyword', KeywordParser.RENAME),
      key('whitespaceBeforeToKeyword', WhitespaceLikeParser),
      key('toKeyword', KeywordParser.TO),
      key('whitespaceBeforeNewTableName', WhitespaceLikeParser),
      key('newTableName', IdentifierParser)
    )
  )
);

fragmentParser('AlterAction_RenameColumn').setParser(
  c.keyed({ variant: 'RenameColumn' }, (key) =>
    c.keyedPipe(
      key('renameKeyword', KeywordParser.RENAME),
      key('column', c.maybe(fragmentParser('AlterTableStmt_Column'))),
      key('whitespaceBeforeColumnName', WhitespaceLikeParser),
      key('columnName', IdentifierParser),
      key('whitespaceBeforeToKeyword', WhitespaceLikeParser),
      key('toKeyword', KeywordParser.TO),
      key('whitespaceBeforeNewColumnName', WhitespaceLikeParser),
      key('newColumnName', IdentifierParser)
    )
  )
);

fragmentParser('AlterTableStmt_Column').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.COLUMN], ([whitespaceBeforeColumnKeyword, columnKeyword]) => ({
    whitespaceBeforeColumnKeyword,
    columnKeyword,
  }))
);

fragmentParser('AlterAction_AddColumn').setParser(
  c.keyed({ variant: 'AddColumn' }, (key) =>
    c.keyedPipe(
      key('addKeyword', KeywordParser.ADD),
      key('column', c.maybe(fragmentParser('AlterTableStmt_Column'))),
      key('whitespaceBeforeColumnDef', WhitespaceLikeParser),
      key('columnDef', nodeParser('ColumnDef'))
    )
  )
);

fragmentParser('AlterAction_DropColumn').setParser(
  c.keyed({ variant: 'DropColumn' }, (key) =>
    c.keyedPipe(
      key('dropKeyword', KeywordParser.DROP),
      key('column', c.maybe(fragmentParser('AlterTableStmt_Column'))),
      key('whitespaceBeforeColumnName', WhitespaceLikeParser),
      key('columnName', IdentifierParser)
    )
  )
);

nodeParser('AnalyzeStmt').setParser(
  c.applyPipe([KeywordParser.ANALYZE, c.maybe(fragmentParser('AnalyzeStmt_Target'))], ([analyzeKeyword, target]) => ({ analyzeKeyword, target }))
);

fragmentParser('AnalyzeStmt_Target').setParser(c.oneOf(fragmentParser('AnalyzeStmt_Target_Single'), fragmentParser('AnalyzeStmt_Target_WithSchema')));

fragmentParser('AnalyzeStmt_Target_Single').setParser(
  c.applyPipe([WhitespaceLikeParser, IdentifierParser], ([whitespaceBeforeName, name]) => ({ variant: 'Single', whitespaceBeforeName, name }))
);

fragmentParser('AnalyzeStmt_Target_WithSchema').setParser(
  c.keyed({ variant: 'WithSchema' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeSchemaName', WhitespaceLikeParser),
      key('schemaName', IdentifierParser),
      key('whitespaceBeforeDot', MaybeWhitespaceLikeParser),
      dotParser,
      key('whitespaceBeforeIndexOrTableName', MaybeWhitespaceLikeParser),
      key('indexOrTableName', IdentifierParser)
    )
  )
);

nodeParser('AttachStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('attachKeyword', KeywordParser.ATTACH),
      key('database', c.maybe(fragmentParser('AttachStmt_Database'))),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser),
      key('whitespaceBeforeAsKeyword', WhitespaceLikeParser),
      key('asKeyword', KeywordParser.AS),
      key('whitespaceBeforeSchemaName', WhitespaceLikeParser),
      key('schemaName', IdentifierParser)
    )
  )
);

fragmentParser('AttachStmt_Database').setParser(
  c.applyPipe([MaybeWhitespaceLikeParser, KeywordParser.DATABASE], ([whitespaceBeforeDatabaseKeyword, databaseKeyword]) => ({
    whitespaceBeforeDatabaseKeyword,
    databaseKeyword,
  }))
);

nodeParser('BeginStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('beginKeyword', KeywordParser.BEGIN),
      key('mode', c.oneOf(fragmentParser('BeginStmt_Deferred'), fragmentParser('BeginStmt_Immediate'), fragmentParser('BeginStmt_Exclusive'))),
      key('transaction', fragmentParser('BeginStmt_Transaction'))
    )
  )
);

fragmentParser('BeginStmt_Deferred').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.DEFERRED], ([whitespaceBeforeDeferredKeyword, deferredKeyword]) => ({
    variant: 'Deferred',
    whitespaceBeforeDeferredKeyword,
    deferredKeyword,
  }))
);

fragmentParser('BeginStmt_Immediate').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.IMMEDIATE], ([whitespaceBeforeImmediateKeyword, immediateKeyword]) => ({
    variant: 'Immediate',
    whitespaceBeforeImmediateKeyword,
    immediateKeyword,
  }))
);

fragmentParser('BeginStmt_Exclusive').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.EXCLUSIVE], ([whitespaceBeforeExclusiveKeyword, exclusiveKeyword]) => ({
    variant: 'Exclusive',
    whitespaceBeforeExclusiveKeyword,
    exclusiveKeyword,
  }))
);

fragmentParser('BeginStmt_Transaction').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.TRANSACTION], ([whitespaceBeforeTransactionKeyword, transactionKeyword]) => ({
    whitespaceBeforeTransactionKeyword,
    transactionKeyword,
  }))
);

nodeParser('ColumnConstraint').setParser(
  c.applyPipe([fragmentParser('ColumnConstraint_Name'), fragmentParser('ColumnConstraint_Constraint')], ([constraintName, constraint]) => ({
    constraintName,
    constraint,
  }))
);

fragmentParser('ColumnConstraint_Name').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('constraintKeyword', KeywordParser.CONSTRAINT),
      key('whitespaceBeforeName', WhitespaceLikeParser),
      key('name', IdentifierParser),
      key('whitespaceAfterName', WhitespaceLikeParser)
    )
  )
);

fragmentParser('ColumnConstraint_Constraint').setParser(
  c.oneOf(
    fragmentParser('ColumnConstraint_Constraint_PrimaryKey'),
    fragmentParser('ColumnConstraint_Constraint_NotNull'),
    fragmentParser('ColumnConstraint_Constraint_Unique'),
    fragmentParser('ColumnConstraint_Constraint_Check'),
    fragmentParser('ColumnConstraint_Constraint_DefaultExpr'),
    fragmentParser('ColumnConstraint_Constraint_DefaultLiteralValue'),
    fragmentParser('ColumnConstraint_Constraint_DefaultSignedNumber'),
    fragmentParser('ColumnConstraint_Constraint_Collate'),
    fragmentParser('ColumnConstraint_Constraint_ForeignKey'),
    fragmentParser('ColumnConstraint_Constraint_As')
  )
);

fragmentParser('ColumnConstraint_Constraint_PrimaryKey').setParser(
  c.keyed({ variant: 'PrimaryKey' }, (key) =>
    c.keyedPipe(
      key('primaryKeyword', KeywordParser.PRIMARY),
      key('whitespaceBeforeKeyKeyword', WhitespaceLikeParser),
      key('keyKeyword', KeywordParser.KEY),
      key('direction', fragmentParser('Direction')),
      key('whitespaceBeforeConflictClause', WhitespaceLikeParser),
      key('conflictClause', nodeParser('ConflictClause')),
      key('autoincrement', fragmentParser('Autoincrement'))
    )
  )
);

fragmentParser('Direction').setParser(c.oneOf(fragmentParser('Direction_Asc'), fragmentParser('Direction_Desc')));

fragmentParser('Direction_Asc').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.ASC], ([whitespaceBeforeAscKeyword, ascKeyword]) => ({
    variant: 'Asc',
    whitespaceBeforeAscKeyword,
    ascKeyword,
  }))
);

fragmentParser('Direction_Desc').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.DESC], ([whitespaceBeforeDescKeyword, descKeyword]) => ({
    variant: 'Desc',
    whitespaceBeforeDescKeyword,
    descKeyword,
  }))
);

fragmentParser('Autoincrement').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.AUTOINCREMENT], ([whitespaceBeforeAutoincrementKeyword, autoincrementKeyword]) => ({
    whitespaceBeforeAutoincrementKeyword,
    autoincrementKeyword,
  }))
);

fragmentParser('ColumnConstraint_Constraint_NotNull').setParser(
  c.keyed({ variant: 'NotNull' }, (key) =>
    c.keyedPipe(
      key('notKeyword', KeywordParser.NOT),
      key('whitespaceBeforeNullKeyword', WhitespaceLikeParser),
      key('nullKeyword', KeywordParser.NULL),
      key('whitespaceBeforeConflictClause', WhitespaceLikeParser),
      key('conflictClause', nodeParser('ConflictClause'))
    )
  )
);

fragmentParser('ColumnConstraint_Constraint_Unique').setParser(
  c.keyed({ variant: 'Unique' }, (key) =>
    c.keyedPipe(
      key('uniqueKeyword', KeywordParser.UNIQUE),
      key('whitespaceBeforeConflictClause', WhitespaceLikeParser),
      key('conflictClause', nodeParser('ConflictClause'))
    )
  )
);

fragmentParser('ColumnConstraint_Constraint_Check').setParser(
  c.keyed({ variant: 'Check' }, (key) =>
    c.keyedPipe(
      key('checkKeyword', KeywordParser.CHECK),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('whitespaceBeforeExpr', MaybeWhitespaceLikeParser),
      key('expr', ExprParser),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('ColumnConstraint_Constraint_DefaultExpr').setParser(
  c.keyed({ variant: 'DefaultExpr' }, (key) =>
    c.keyedPipe(
      key('defaultKeyword', KeywordParser.DEFAULT),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('whitespaceBeforeExpr', MaybeWhitespaceLikeParser),
      key('expr', ExprParser),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('ColumnConstraint_Constraint_DefaultLiteralValue').setParser(
  c.keyed({ variant: 'DefaultLiteralValue' }, (key) =>
    c.keyedPipe(
      key('defaultKeyword', KeywordParser.DEFAULT),
      key('whitespaceBeforeLiteralValue', WhitespaceLikeParser),
      key('literalValue', fragmentParser('LiteralValue'))
    )
  )
);

fragmentParser('LiteralValue').setParser(
  c.oneOf(
    nodeParser('NumericLiteral'),
    nodeParser('StringLiteral'),
    nodeParser('BlobLiteral'),
    nodeParser('Null'),
    nodeParser('True'),
    nodeParser('False'),
    nodeParser('CurrentTime'),
    nodeParser('CurrentDate'),
    nodeParser('CurrentTimestamp')
  )
);

fragmentParser('ColumnConstraint_Constraint_DefaultSignedNumber').setParser(
  c.keyed({ variant: 'DefaultSignedNumber' }, (key) =>
    c.keyedPipe(
      key('defaultKeyword', KeywordParser.DEFAULT),
      key('whitespaceBeforeSignedNumber', WhitespaceLikeParser),
      key('signedNumber', nodeParser('SignedNumber'))
    )
  )
);

fragmentParser('ColumnConstraint_Constraint_Collate').setParser(
  c.keyed({ variant: 'Collate' }, (key) =>
    c.keyedPipe(
      key('collateKeyword', KeywordParser.COLLATE),
      key('whitespaceBeforeCollationName', WhitespaceLikeParser),
      key('collationName', IdentifierParser)
    )
  )
);

fragmentParser('ColumnConstraint_Constraint_ForeignKey').setParser(
  c.apply(nodeParser('ForeignKeyClause'), (foreignKeyClause) => ({ variant: 'ForeignKey', foreignKeyClause }))
);

fragmentParser('ColumnConstraint_Constraint_As').setParser(
  c.keyed({ variant: 'As' }, (key) =>
    c.keyedPipe(
      key('generatedAlways', fragmentParser('GeneratedAlways')),
      key('asKeyword', KeywordParser.AS),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('whitespaceBeforeExpr', MaybeWhitespaceLikeParser),
      key('expr', ExprParser),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser,
      key('mode', c.oneOf(fragmentParser('ColumnConstraint_Constraint_As_Stored'), fragmentParser('ColumnConstraint_Constraint_As_Virtual')))
    )
  )
);

fragmentParser('GeneratedAlways').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('generatedKeyword', KeywordParser.GENERATED),
      key('whitespaceBeforeAlwaysKeyword', WhitespaceLikeParser),
      key('alwaysKeyword', KeywordParser.ALWAYS),
      key('whitespaceAfterAlwaysKeyword', WhitespaceLikeParser)
    )
  )
);

fragmentParser('ColumnConstraint_Constraint_As_Stored').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.STORED], ([whitespaceBeforeStoredKeyword, storedKeyword]) => ({
    variant: 'Stored',
    whitespaceBeforeStoredKeyword,
    storedKeyword,
  }))
);

fragmentParser('ColumnConstraint_Constraint_As_Virtual').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.VIRTUAL], ([whitespaceBeforeVirtualKeyword, virtualKeyword]) => ({
    variant: 'Virtual',
    whitespaceBeforeVirtualKeyword,
    virtualKeyword,
  }))
);

nodeParser('ColumnDef').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('columnName', IdentifierParser),
      key('typeName', fragmentParser('ColumnDef_TypeName')),
      key('columnConstraints', c.many(fragmentParser('ColumnDef_ColumnConstraint')))
    )
  )
);

fragmentParser('ColumnDef_TypeName').setParser(
  c.applyPipe([WhitespaceLikeParser, nodeParser('TypeName')], ([whitespaceBeforeTypeName, typeName]) => ({ whitespaceBeforeTypeName, typeName }))
);

fragmentParser('ColumnDef_ColumnConstraint').setParser(
  c.applyPipe([WhitespaceLikeParser, nodeParser('ColumnConstraint')], ([whitespaceBeforeColumnConstraint, columnConstraint]) => ({
    whitespaceBeforeColumnConstraint,
    columnConstraint,
  }))
);

nodeParser('ColumnNameList').setParser(
  c.applyPipe(
    [openParentParser, nonEmptyCommaSingleList(IdentifierParser), MaybeWhitespaceLikeParser, closeParentParser],
    ([_openParent, columnNames, whitespaceBeforeCloseParent, _closeParent]) => ({ columnNames, whitespaceBeforeCloseParent })
  )
);

nodeParser('CommentSyntax').setParser(c.oneOf(fragmentParser('Comment_Multiline'), fragmentParser('Comment_SingleLine')));

fragmentParser('Comment_SingleLine').setParser(
  c.applyPipe([singleLineCommentStart, notNewLineParser, c.oneOf(newLineParser, c.eof())], ([_open, content, close]) => {
    return { variant: 'SingleLine', content, close: close === null ? 'EndOfFile' : 'NewLine' };
  })
);

fragmentParser('Comment_Multiline').setParser(
  c.apply(c.manyBetween(multilineCommentStartParser, c.oneOf(notStarParser, starParser), multilineCommentEndParser), ([_open, items, _close]) => {
    const content = items.join('');
    return { variant: 'Multiline', content };
  })
);

nodeParser('CommitStmt').setParser(
  c.applyPipe(
    [c.oneOf(fragmentParser('CommitStmt_Action_Commit'), fragmentParser('CommitStmt_Action_End')), c.maybe(fragmentParser('CommitStmt_Transaction'))],
    ([action, transaction]) => ({ action, transaction })
  )
);

fragmentParser('CommitStmt_Action_Commit').setParser(c.apply(KeywordParser.COMMIT, (commitKeyword) => ({ variant: 'Commit', commitKeyword })));

fragmentParser('CommitStmt_Action_End').setParser(c.apply(KeywordParser.END, (endKeyword) => ({ variant: 'End', endKeyword })));

fragmentParser('CommitStmt_Transaction').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.TRANSACTION], ([whitespaceBeforeTransactionKeyword, transactionKeyword]) => ({
    whitespaceBeforeTransactionKeyword,
    transactionKeyword,
  }))
);

nodeParser('CommonTableExpression').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('tableName', IdentifierParser),
      key('columnNames', fragmentParser('ColumnNames')),
      key('whitespaceBeforeAsKeyword', WhitespaceLikeParser),
      key('asKeyword', KeywordParser.AS),
      key('materialized', fragmentParser('MaybeMaterialized')),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('whitespaceBeforeSelect', MaybeWhitespaceLikeParser),
      key('select', nodeParser('SelectStmt')),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('ColumnNames').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('columnNames', nonEmptyCommaSingleList(IdentifierParser)),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('MaybeMaterialized').setParser(c.oneOf(fragmentParser('Materialized'), fragmentParser('NotMaterialized')));

fragmentParser('Materialized').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.MATERIALIZED], ([whitespaceBeforeMaterializedKeyword, materializedKeyword]) => ({
    variant: 'Materialized',
    whitespaceBeforeMaterializedKeyword,
    materializedKeyword,
  }))
);

fragmentParser('NotMaterialized').setParser(
  c.applyPipe(
    [WhitespaceLikeParser, KeywordParser.NOT, WhitespaceLikeParser, KeywordParser.MATERIALIZED],
    ([whitespaceBeforeNotKeyword, notKeyword, whitespaceBeforeMaterializedKeyword, materializedKeyword]) => ({
      variant: 'NotMaterialized',
      whitespaceBeforeNotKeyword,
      notKeyword,
      whitespaceBeforeMaterializedKeyword,
      materializedKeyword,
    })
  )
);

nodeParser('CompoundOperator').setParser(
  c.oneOf(
    fragmentParser('CompoundOperator_Union'),
    fragmentParser('CompoundOperator_UnionAll'),
    fragmentParser('CompoundOperator_Intersect'),
    fragmentParser('CompoundOperator_Except')
  )
);

fragmentParser('CompoundOperator_Union').setParser(c.apply(KeywordParser.UNION, (unionKeyword) => ({ variant: 'Union', unionKeyword })));

fragmentParser('CompoundOperator_UnionAll').setParser(
  c.applyPipe([KeywordParser.UNION, WhitespaceLikeParser, KeywordParser.ALL], ([unionKeyword, whitespaceBeforeAllKeyword, allKeyword]) => ({
    variant: 'UnionAll',
    unionKeyword,
    whitespaceBeforeAllKeyword,
    allKeyword,
  }))
);

fragmentParser('CompoundOperator_Intersect').setParser(c.apply(KeywordParser.INTERSECT, (intersectKeyword) => ({ variant: 'Intersect', intersectKeyword })));

fragmentParser('CompoundOperator_Except').setParser(c.apply(KeywordParser.EXCEPT, (exceptKeyword) => ({ variant: 'Except', exceptKeyword })));

nodeParser('CompoundSelectStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('with', fragmentParser('StmtWith')),
      key('select', nodeParser('SelectCore')),
      key('compoundSelects', nonEmptyList(fragmentParser('CompoundSelectStmt_Item'))),
      key('orderBy', fragmentParser('OrderBy')),
      key('limit', fragmentParser('Limit'))
    )
  )
);

fragmentParser('StmtWith').setParser(
  c.applyPipe(
    [KeywordParser.WITH, fragmentParser('StmtWith_Recursive'), nonEmptyCommaSingleList(nodeParser('CommonTableExpression')), WhitespaceLikeParser],
    ([withKeyword, recursive, commonTableExpressions, whitespaceAfter]) => ({ withKeyword, recursive, commonTableExpressions, whitespaceAfter })
  )
);

fragmentParser('StmtWith_Recursive').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.RECURSIVE], ([whitespaceBeforeRecursiveKeyword, recursiveKeyword]) => ({
    whitespaceBeforeRecursiveKeyword,
    recursiveKeyword,
  }))
);

fragmentParser('CompoundSelectStmt_Item').setParser(
  c.oneOf(
    fragmentParser('CompoundSelectStmt_Item_Union'),
    fragmentParser('CompoundSelectStmt_Item_UnionAll'),
    fragmentParser('CompoundSelectStmt_Item_Intersect'),
    fragmentParser('CompoundSelectStmt_Item_Except')
  )
);

fragmentParser('CompoundSelectStmt_Item_Union').setParser(
  c.keyed({ variant: 'Union' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeUnionKeyword', WhitespaceLikeParser),
      key('unionKeyword', KeywordParser.UNION),
      key('whitespaceBeforeSelect', WhitespaceLikeParser),
      key('select', nodeParser('SelectCore'))
    )
  )
);

fragmentParser('CompoundSelectStmt_Item_UnionAll').setParser(
  c.keyed({ variant: 'UnionAll' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeUnionKeyword', WhitespaceLikeParser),
      key('unionKeyword', KeywordParser.UNION),
      key('whitespaceBeforeAllKeyword', WhitespaceLikeParser),
      key('allKeyword', KeywordParser.ALL),
      key('whitespaceBeforeSelect', WhitespaceLikeParser),
      key('select', nodeParser('SelectCore'))
    )
  )
);

fragmentParser('CompoundSelectStmt_Item_Intersect').setParser(
  c.keyed({ variant: 'Intersect' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeIntersectKeyword', WhitespaceLikeParser),
      key('intersectKeyword', KeywordParser.INTERSECT),
      key('whitespaceBeforeSelect', WhitespaceLikeParser),
      key('select', nodeParser('SelectCore'))
    )
  )
);

fragmentParser('CompoundSelectStmt_Item_Except').setParser(
  c.keyed({ variant: 'Except' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeExceptKeyword', WhitespaceLikeParser),
      key('exceptKeyword', KeywordParser.EXCEPT),
      key('whitespaceBeforeSelect', WhitespaceLikeParser),
      key('select', nodeParser('SelectCore'))
    )
  )
);

fragmentParser('OrderBy').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeOrderKeyword', WhitespaceLikeParser),
      key('orderKeyword', KeywordParser.ORDER),
      key('whitespaceBeforeByKeyword', WhitespaceLikeParser),
      key('byKeyword', KeywordParser.BY),
      key('orderingTerms', nonEmptyCommaSingleList(nodeParser('OrderingTerm')))
    )
  )
);

fragmentParser('Limit').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeLimitKeyword', WhitespaceLikeParser),
      key('limitKeyword', KeywordParser.LIMIT),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser),
      key('inner', c.oneOf(fragmentParser('Limit_Offset'), fragmentParser('Limit_Expr')))
    )
  )
);

fragmentParser('Limit_Offset').setParser(
  c.keyed({ variant: 'Offset' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOffsetKeyword', WhitespaceLikeParser),
      key('offsetKeyword', KeywordParser.OFFSET),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser)
    )
  )
);

fragmentParser('Limit_Expr').setParser(
  c.keyed({ variant: 'Expr' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeComma', WhitespaceLikeParser), commaParser, key('whitespaceBeforeExpr', WhitespaceLikeParser), key('expr', ExprParser))
  )
);

nodeParser('ConflictClause').setParser(c.apply(fragmentParser('ConflictClause_OnConflict'), (onConflict) => ({ onConflict })));

fragmentParser('ConflictClause_OnConflict').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('onKeyword', KeywordParser.ON),
      key('whitespaceBeforeConflictKeyword', WhitespaceLikeParser),
      key('conflictKeyword', KeywordParser.CONFLICT),
      key('inner', fragmentParser('ConflictClause_OnConflict_Inner'))
    )
  )
);

fragmentParser('ConflictClause_OnConflict_Inner').setParser(
  c.oneOf(
    fragmentParser('ConflictClause_OnConflict_Inner_Rollback'),
    fragmentParser('ConflictClause_OnConflict_Inner_Abort'),
    fragmentParser('ConflictClause_OnConflict_Inner_Fail'),
    fragmentParser('ConflictClause_OnConflict_Inner_Ignore'),
    fragmentParser('ConflictClause_OnConflict_Inner_Replace')
  )
);

fragmentParser('ConflictClause_OnConflict_Inner_Rollback').setParser(
  c.keyed({ variant: 'Rollback' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeRollbackKeyword', WhitespaceLikeParser), key('rollbackKeyword', KeywordParser.ROLLBACK))
  )
);

fragmentParser('ConflictClause_OnConflict_Inner_Abort').setParser(
  c.keyed({ variant: 'Abort' }, (key) => c.keyedPipe(key('whitespaceBeforeAbortKeyword', WhitespaceLikeParser), key('abortKeyword', KeywordParser.ABORT)))
);

fragmentParser('ConflictClause_OnConflict_Inner_Fail').setParser(
  c.keyed({ variant: 'Fail' }, (key) => c.keyedPipe(key('whitespaceBeforeFailKeyword', WhitespaceLikeParser), key('failKeyword', KeywordParser.FAIL)))
);

fragmentParser('ConflictClause_OnConflict_Inner_Ignore').setParser(
  c.keyed({ variant: 'Ignore' }, (key) => c.keyedPipe(key('whitespaceBeforeIgnoreKeyword', WhitespaceLikeParser), key('ignoreKeyword', KeywordParser.IGNORE)))
);

fragmentParser('ConflictClause_OnConflict_Inner_Replace').setParser(
  c.keyed({ variant: 'Replace' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeReplaceKeyword', WhitespaceLikeParser), key('replaceKeyword', KeywordParser.REPLACE))
  )
);

nodeParser('CreateIndexStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('createKeyword', KeywordParser.CREATE),
      key('unique', fragmentParser('Unique')),
      key('whitespaceBeforeIndexKeyword', WhitespaceLikeParser),
      key('indexKeyword', KeywordParser.INDEX),
      key('ifNotExists', fragmentParser('IfNotExists')),
      key('whitespaceBeforeIndex', WhitespaceLikeParser),
      key('index', fragmentParser('SchemaIndex')),
      key('whitespaceBeforeOnKeyword', WhitespaceLikeParser),
      key('onKeyword', KeywordParser.ON),
      key('whitespaceBeforeTableName', WhitespaceLikeParser),
      key('tableName', IdentifierParser),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('indexedColumns', nonEmptyCommaSingleList(nodeParser('IndexedColumn'))),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser,
      key('where', fragmentParser('Where'))
    )
  )
);

fragmentParser('Unique').setParser(
  c.applyPipe([WhitespaceLikeParser, KeywordParser.UNIQUE], ([whitespaceBeforeUniqueKeyword, uniqueKeyword]) => ({
    whitespaceBeforeUniqueKeyword,
    uniqueKeyword,
  }))
);

fragmentParser('IfNotExists').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeIfKeyword', WhitespaceLikeParser),
      key('ifKeyword', KeywordParser.IF),
      key('whitespaceBeforeNotKeyword', WhitespaceLikeParser),
      key('notKeyword', KeywordParser.NOT),
      key('whitespaceBeforeExistsKeyword', WhitespaceLikeParser),
      key('existsKeyword', KeywordParser.EXISTS)
    )
  )
);

fragmentParser('SchemaIndex').setParser(c.applyPipe([fragmentParser('SchemaItem_Schema'), IdentifierParser], ([schema, index]) => ({ schema, index })));

fragmentParser('Where').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeWhereKeyword', WhitespaceLikeParser),
      key('whereKeyword', KeywordParser.WHERE),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser)
    )
  )
);

nodeParser('CreateTableStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('createKeyword', KeywordParser.CREATE),
      key('temp', fragmentParser('Temp')),
      key('whitespaceBeforeTableKeyword', WhitespaceLikeParser),
      key('tableKeyword', KeywordParser.TABLE),
      key('ifNotExists', fragmentParser('IfNotExists')),
      key('whitespaceBeforeTable', WhitespaceLikeParser),
      key('table', fragmentParser('SchemaTable')),
      key('definition', fragmentParser('CreateTableStmt_Definition'))
    )
  )
);

fragmentParser('Temp').setParser(c.oneOf(fragmentParser('Temp_Temp'), fragmentParser('Temp_Temporary')));

fragmentParser('Temp_Temp').setParser(
  c.keyed({ variant: 'Temp' }, (key) => c.keyedPipe(key('whitespaceBeforeTempKeyword', WhitespaceLikeParser), key('tempKeyword', KeywordParser.TEMP)))
);

fragmentParser('Temp_Temporary').setParser(
  c.keyed({ variant: 'Temporary' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeTemporaryKeyword', WhitespaceLikeParser), key('temporaryKeyword', KeywordParser.TEMPORARY))
  )
);

fragmentParser('CreateTableStmt_Definition').setParser(c.oneOf(fragmentParser('CreateTable_AsDef'), fragmentParser('CreateTable_ColumnsDef')));

fragmentParser('CreateTable_AsDef').setParser(
  c.keyed({ variant: 'As' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeAsKeyword', WhitespaceLikeParser),
      key('asKeyword', KeywordParser.AS),
      key('whitespaceBeforeSelectStmt', WhitespaceLikeParser),
      key('selectStmt', nodeParser('SelectStmt'))
    )
  )
);

fragmentParser('CreateTable_ColumnsDef').setParser(
  c.keyed({ variant: 'Columns' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('columnDefs', nonEmptyCommaSingleList(nodeParser('ColumnDef'))),
      key('tableConstraints', c.many(fragmentParser('CreateTable_Constraint'))),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser,
      key('withoutRowId', fragmentParser('WithoutRowId'))
    )
  )
);

fragmentParser('CreateTable_Constraint').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeComma', MaybeWhitespaceLikeParser),
      commaParser,
      key('whitespaceBeforeTableConstraint', MaybeWhitespaceLikeParser),
      key('tableConstraint', nodeParser('TableConstraint'))
    )
  )
);

fragmentParser('WithoutRowId').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeWithoutKeyword', WhitespaceLikeParser),
      key('withoutKeyword', KeywordParser.WITHOUT),
      key('whitespaceBeforeRowidKeyword', WhitespaceLikeParser),
      key('rowidKeyword', KeywordParser.ROWID)
    )
  )
);

// TODO: CreateTriggerStmt

// fragmentParser('IdentifierBasic').setParser(
//   c.apply(
//     c.transform(rawIdentifierParser, (result, parentPath) => {
//       if (result.type === 'Failure') {
//         return result;
//       }
//       if (KEYWORDS.includes(result.value.toUpperCase() as any)) {
//         return ParseFailure(result.start, [...parentPath, 'rawIdentifier'], `${result.value} is not a valid identifier because it's a keywork.`);
//       }
//       return result;
//     }),
//     (val) => ({ variant: 'Basic', name: val })
//   )
// );

// fragmentParser('IdentifierBrackets').setParser(
//   c.apply(c.regexp<Ctx>(/^\[.+\]/g), (val) => ({
//     variant: 'Brackets',
//     name: val.slice(1, -1),
//   }))
// );

// fragmentParser('IdentifierDoubleQuote').setParser(
//   c.apply(c.manyBetween(doubleQuoteParser, c.oneOf(notDoubleQuoteParser, doubleDoubleQuoteParser), doubleQuoteParser), ([_open, items, _close]) => ({
//     variant: 'DoubleQuote',
//     name: items.map((v) => (v === DOUBLE_DOUBLE_QUOTE ? DOUBLE_QUOTE : v)).join(''),
//   }))
// );

// fragmentParser('IdentifierBacktick').setParser(
//   c.apply(c.manyBetween(backtickParser, c.oneOf(notBacktickParser, doubleBacktickParser), backtickParser), ([_open, items, _close]) => ({
//     variant: 'Backtick',
//     name: items.map((v) => (v === DOUBLE_BACKTICK ? BACKTICK : v)).join(''),
//   }))
// );

// nodeParser('Identifier').setParser(
//   c.oneOf(
//     fragmentParser('IdentifierBasic'),
//     fragmentParser('IdentifierBrackets'),
//     fragmentParser('IdentifierDoubleQuote'),
//     fragmentParser('IdentifierBacktick')
//   )
// );

// nodeParser('StringLiteral').setParser(
//   c.apply(c.manyBetween(singleQuoteParser, c.oneOf(notSingleQuoteParser, doubleSingleQuoteParser), singleQuoteParser), ([_open, items, _close]) => ({
//     content: items.map((v) => (v === DOUBLE_SINGLE_QUOTE ? SINGLE_QUOTE : v)).join(''),
//   }))
// );

// nodeParser('CommentSyntax').setParser(c.oneOf(fragmentParser('MultilineComment'), fragmentParser('SingleLineComment')));

// nodeParser('BlobLiteral').setParser(
//   c.apply(blobParser, (raw) => ({
//     xCase: raw[0] === 'x' ? 'lowercase' : 'uppercase',
//     content: raw.slice(2, -1),
//   }))
// );

// fragmentParser('Exponent').setParser(
//   c.apply(exponentiationSuffixRawParser, (raw) => {
//     return { raw, value: parseInt(raw.slice(1)) };
//   })
// );

// fragmentParser('NumericLiteralInteger').setParser(
//   c.apply(c.pipe(integerParser, c.maybe(dotParser), c.maybe(fragmentParser('Exponent'))), ([raw, _dot, exponent]) => {
//     return {
//       variant: 'Integer',
//       interger: parseInt(raw, 10),
//       exponent,
//     };
//   })
// );

// fragmentParser('NumericLiteralHex').setParser(
//   c.apply(hexParser, (raw) => ({
//     variant: 'Hex',
//     xCase: raw[1] === 'x' ? 'lowercase' : 'uppercase',
//     value: parseInt(raw.slice(2), 16),
//   }))
// );

// fragmentParser('NumericLiteralFloat').setParser(
//   c.apply(c.pipe(c.maybe(integerParser), dotParser, integerParser, c.maybe(fragmentParser('Exponent'))), ([integral, _dot, fractional, exponent]) => {
//     const raw = [integral ?? '', _dot, fractional, exponent?.raw ?? ''].join('');
//     return {
//       variant: 'Float',
//       integral: mapIfExist(integral, (v) => parseInt(v, 10)),
//       fractional: parseInt(fractional, 10),
//       exponent,
//       value: parseFloat(raw),
//     };
//   })
// );

// nodeParser('NumericLiteral').setParser(
//   c.oneOf(fragmentParser('NumericLiteralInteger'), fragmentParser('NumericLiteralHex'), fragmentParser('NumericLiteralFloat'))
// );

// fragmentParser('ParameterName').setParser(
//   c.apply(c.pipe(parameterRawNameParser, c.many(c.pipe(colonPairParser, parameterRawNameParser)), c.maybe(parameterSuffixParser)), ([name, items, suffix]) => ({
//     name: name + items.map(([colonPair, param]) => colonPair + param).join(''),
//     suffix: mapIfExist(suffix, (v) => v.slice(1, -1)),
//   }))
// );

// fragmentParser('BindParameterIndexed').setParser(c.apply(questionMarkParser, (_raw) => ({ variant: 'Indexed' })));

// fragmentParser('BindParameterNumbered').setParser(
//   c.apply(c.pipe(questionMarkParser, integerParser), ([_questionMark, rawNum]) => ({
//     variant: 'Numbered',
//     number: parseInt(rawNum, 10),
//   }))
// );

// fragmentParser('BindParameterAtNamed').setParser(
//   c.apply(c.pipe(atParser, fragmentParser('ParameterName')), ([_at, { name, suffix }]) => ({
//     variant: 'AtNamed',
//     name,
//     suffix,
//   }))
// );

// fragmentParser('BindParameterColonNamed').setParser(
//   c.apply(c.pipe(colonParser, fragmentParser('ParameterName')), ([_colon, { name, suffix }]) => {
//     return { variant: 'ColonNamed', name, suffix };
//   })
// );

// fragmentParser('BindParameterDollarNamed').setParser(
//   c.apply(c.pipe(dollarParser, fragmentParser('ParameterName')), ([_dollar, { name, suffix }]) => ({
//     variant: 'DollarNamed',
//     name,
//     suffix,
//   }))
// );

// nodeParser('BindParameter').setParser(
//   c.oneOf(
//     fragmentParser('BindParameterIndexed'),
//     fragmentParser('BindParameterNumbered'),
//     fragmentParser('BindParameterAtNamed'),
//     fragmentParser('BindParameterColonNamed'),
//     fragmentParser('BindParameterDollarNamed')
//   )
// );

// nodeParser('Null').setParser(c.apply(KeywordParser.NULL, (_, start, end, ctx) => ctx.createNode<'Null'>('Null', start, end, {})));

// nodeParser('True').setParser(c.apply(KeywordParser.TRUE, (_, start, end, ctx) => ctx.createNode<'True'>('True', start, end, {})));

// nodeParser('False').setParser(c.apply(KeywordParser.FALSE, (_, start, end, ctx) => ctx.createNode<'False'>('False', start, end, {})));

// nodeParser('CurrentTime').setParser(c.apply(KeywordParser.CURRENT_TIME, (_, start, end, ctx) => ctx.createNode<'CurrentTime'>('CurrentTime', start, end, {})));

// nodeParser('CurrentDate').setParser(c.apply(KeywordParser.CURRENT_DATE, (_, start, end, ctx) => ctx.createNode<'CurrentDate'>('CurrentDate', start, end, {})));

// nodeParser('CurrentTimestamp').setParser(
//   c.apply(KeywordParser.CURRENT_TIMESTAMP, (_, start, end, ctx) => ctx.createNode<'CurrentTimestamp'>('CurrentTimestamp', start, end, {}))
// );

// fragmentParser('LiteralValue').setParser(
//   c.oneOf(
//     nodeParser('NumericLiteral'),
//     nodeParser('StringLiteral'),
//     nodeParser('BlobLiteral'),
//     nodeParser('Null'),
//     nodeParser('True'),
//     nodeParser('False'),
//     nodeParser('CurrentTime'),
//     nodeParser('CurrentDate'),
//     nodeParser('CurrentTimestamp')
//   )
// );

// fragmentParser('SqlStmtListItem').setParser(
//   c.apply(
//     c.oneOf(
//       c.pipe(MaybeWlParser, nodeParser('SqlStmt'), MaybeWlParser),
//       c.apply(MaybeWlParser, (v) => ({ whitespaceLike: v }))
//     ),
//     (item) => {
//       if (Array.isArray(item)) {
//         const [whitespaceBefore, stmt, whitespaceAfter] = item;
//         return { variant: 'Stmt', whitespaceBefore, stmt, whitespaceAfter };
//       }
//       if (item.whitespaceLike === undefined || item.whitespaceLike.length === 0) {
//         return { variant: 'Empty' };
//       }
//       return { variant: 'Whitespace', whitespace: item.whitespaceLike };
//     }
//   )
// );

// nodeParser('SqlStmtList').setParser(
//   c.apply(c.pipe(c.manySepBy(fragmentParser('SqlStmtListItem'), semicolonParser), eofParser), ([items]) => {
//     const list = manySepByResultToArray(items);
//     if (list.length === 1 && list[0].variant === 'Empty') {
//       return { items: [] };
//     }
//     return { items: list };
//   })
// );

// fragmentParser('SqlStmtExplain').setParser(
//   c.apply(
//     c.pipe(
//       KeywordParser.EXPLAIN,
//       c.maybe(
//         c.pipe(
//           fragmentParser('WhitespaceLike'),
//           c.pipe(KeywordParser.QUERY, fragmentParser('WhitespaceLike'), KeywordParser.PLAN, fragmentParser('WhitespaceLike'))
//         )
//       ),
//       MaybeWlParser
//     ),
//     ([_explain, queryPlan, whitespaceAfter]) => ({
//       queryPlan: mapIfExist(
//         queryPlan,
//         ([queryWhitespace, [_query, planWhitespace, _plan]]): Complete<Fragment<'SqlStmtExplain'>['queryPlan']> => ({
//           queryWhitespace,
//           planWhitespace,
//         })
//       ),
//       whitespaceAfter,
//     })
//   )
// );

// nodeParser('SqlStmt').setParser(
//   c.apply(
//     c.pipe(
//       c.maybe(fragmentParser('SqlStmtExplain')),
//       c.oneOf<Node<'SqlStmt'>['stmt'], Ctx>(
//         nodeParser('AnalyzeStmt'),
//         nodeParser('AttachStmt'),
//         nodeParser('BeginStmt'),
//         nodeParser('CommitStmt'),
//         nodeParser('CreateIndexStmt'),
//         nodeParser('CreateTableStmt')
//         // nodeParser('CreateTriggerStmt'),
//         // nodeParser('CreateViewStmt'),
//         // nodeParser('CreateVirtualTableStmt'),
//         // nodeParser('DeleteStmt'),
//         // nodeParser('DeleteStmtLimited'),
//         // nodeParser('DetachStmt'),
//         // nodeParser('DropIndexStmt'),
//         // nodeParser('DropTableStmt'),
//         // nodeParser('DropTriggerStmt'),
//         // nodeParser('DropViewStmt'),
//         // nodeParser('InsertStmt'),
//         // nodeParser('PragmaStmt'),
//         // nodeParser('ReindexStmt'),
//         // nodeParser('ReleaseStmt'),
//         // nodeParser('RollbackStmt'),
//         // nodeParser('SavepointStmt'),
//         // nodeParser('SelectStmt'),
//         // nodeParser('UpdateStmt'),
//         // nodeParser('UpdateStmtLimited'),
//         // nodeParser('VacuumStmt')
//       )
//     ),
//     ([explain, stmt]) => {
//       return { explain, stmt };
//     }
//   )
// );

// fragmentParser('BeginStmtMode').setParser(
//   c.apply(c.pipe(WLParser, c.oneOf(KeywordParser.DEFERRED, KeywordParser.IMMEDIATE, KeywordParser.EXCLUSIVE)), ([whitespace, keyword]) => {
//     if (keyword === 'DEFERRED') {
//       return { variant: 'Deferred', deferredWhitespace: whitespace };
//     }
//     if (keyword === 'EXCLUSIVE') {
//       return { variant: 'Exclusive', exclusiveWhitespace: whitespace };
//     }
//     return { variant: 'Immediate', immediateWhitespace: whitespace };
//   })
// );

// nodeParser('BeginStmt').setParser(
//   c.apply(
//     c.pipe(KeywordParser.BEGIN, c.maybe(fragmentParser('BeginStmtMode')), c.maybe(c.pipe(WLParser, KeywordParser.TRANSACTION))),
//     ([_begin, mode, transaction]) => ({
//       mode,
//       transaction: mapIfExist(transaction, ([transactionWhitespace, _transaction]) => ({ transactionWhitespace })),
//     })
//   )
// );

// nodeParser('CommitStmt').setParser(
//   c.apply(c.pipe(c.oneOf(KeywordParser.COMMIT, KeywordParser.END), c.maybe(c.pipe(WLParser, KeywordParser.TRANSACTION))), ([action, transaction]) => ({
//     action: action === 'COMMIT' ? { variant: 'Commit' } : { variant: 'End' },
//     transaction: mapIfExist(transaction, ([transactionWhitespace, _transaction]) => ({ transactionWhitespace })),
//   }))
// );

// fragmentParser('IfNotExists').setParser(
//   c.apply(
//     c.pipe(WLParser, KeywordParser.IF, WLParser, KeywordParser.NOT, WLParser, KeywordParser.EXISTS),
//     ([ifWhitespace, _if, notWhitespace, _not, existsWhitespace, _exists]) => ({
//       ifWhitespace,
//       notWhitespace,
//       existsWhitespace,
//     })
//   )
// );

// fragmentParser('SchemaItemTarget').setParser(
//   c.oneOf(
//     c.apply(
//       c.pipe(nodeParser('Identifier'), MaybeWlParser, dotParser, MaybeWlParser, nodeParser('Identifier')),
//       ([schemaName, dotWhitespace, _dot, itemNameWhitespace, itemName]) => ({
//         variant: 'WithSchema',
//         schemaName,
//         dotWhitespace,
//         itemNameWhitespace,
//         itemName,
//       })
//     ),
//     c.apply(nodeParser('Identifier'), (itemName) => ({ variant: 'WithoutSchema', itemName }))
//   )
// );

// fragmentParser('Where').setParser(
//   c.apply(c.pipe(MaybeWlParser, KeywordParser.WHERE, WLParser, fragmentParser('Expr')), ([whereWhitespace, _where, exprWhitespace, expr]) => ({
//     whereWhitespace,
//     expr,
//     exprWhitespace,
//   }))
// );

// nodeParser('SingleTypeName').setParser(c.apply(typeNameItemParser, (type) => ({ type })));

// nodeParser('SignedNumber').setParser(
//   c.apply(
//     c.pipe(
//       c.maybe(
//         c.apply(c.pipe(c.oneOf(plusParser, dashParser), MaybeWlParser), ([sign, whitespaceAfter]): Node<'SignedNumber'>['sign'] => ({
//           variant: sign === '+' ? 'Plus' : 'Minus',
//           whitespaceAfter,
//         }))
//       ),
//       nodeParser('NumericLiteral')
//     ),
//     ([sign, numericLiteral]) => ({ sign, numericLiteral })
//   )
// );

// nodeParser('ColumnConstraint').setParser(
//   c.keyed((key) =>
//     c.keyedPipe(
//       key(
//         'constraintName',
//         c.maybe(
//           c.apply(
//             c.pipe(KeywordParser.CONSTRAINT, WLParser, nodeParser('Identifier'), WLParser),
//             ([_constraint, constraintWhitespaceAfter, name, whitespaceAfter]) => ({ constraintWhitespaceAfter, name, whitespaceAfter })
//           )
//         )
//       ),
//       key('constraint', fragmentParser('ColumnConstraintConstraint'))
//     )
//   )
// );

// nodeParser('TypeName').setParser(
//   c.apply(
//     c.pipe(
//       nonEmptyListSepBy(nodeParser('SingleTypeName'), WLParser),
//       c.maybe(
//         c.apply(
//           c.pipe(
//             MaybeWlParser,
//             openParentParser,
//             MaybeWlParser,
//             nodeParser('SignedNumber'),
//             c.maybe(
//               c.apply(c.pipe(MaybeWlParser, commaParser, MaybeWlParser, nodeParser('SignedNumber')), ([commaWhitespace, _comma, secondWhitespace, second]) => ({
//                 commaWhitespace,
//                 secondWhitespace,
//                 second,
//               }))
//             ),
//             MaybeWlParser,
//             closeParentParser
//           ),
//           ([openParentWhitespace, _open, firstWhitespace, first, second, closeParentWhitespace, _close]): Node<'TypeName'>['size'] => ({
//             openParentWhitespace,
//             firstWhitespace,
//             first,
//             second,
//             closeParentWhitespace,
//           })
//         )
//       )
//     ),
//     ([names, size]) => ({ names, size })
//   )
// );

// nodeParser('ColumnDef').setParser(
//   c.apply(
//     c.pipe(
//       nodeParser('Identifier'),
//       c.maybe(c.apply(c.pipe(WLParser, nodeParser('TypeName')), ([typeNameWhitespace, typeName]) => ({ typeNameWhitespace, typeName }))),
//       c.many(
//         c.apply(c.pipe(WLParser, nodeParser('ColumnConstraint')), ([columnConstraintWhitespace, columnConstraint]) => ({
//           columnConstraintWhitespace,
//           columnConstraint,
//         }))
//       )
//     ),
//     ([columnName, typeName, columnConstraints]) => ({ columnName, typeName, columnConstraints })
//   )
// );

// nodeParser('CreateIndexStmt').setParser(
//   c.keyed((key) =>
//     c.keyedPipe(
//       KeywordParser.CREATE,
//       key(
//         'unique',
//         c.apply(c.maybe(c.pipe(WLParser, KeywordParser.UNIQUE)), (unique) => mapIfExist(unique, ([uniqueWhitespace, _unique]) => ({ uniqueWhitespace })))
//       ),
//       key('indexWhitespace', WLParser),
//       KeywordParser.INDEX,
//       key('ifNotExists', c.maybe(fragmentParser('IfNotExists'))),
//       key('indexTargetWhitespace', WLParser),
//       key('indexTarget', fragmentParser('SchemaItemTarget')),
//       key('onWhitespace', WLParser),
//       KeywordParser.ON,
//       key('tableNameWhitespace', WLParser),
//       key('tableName', nodeParser('Identifier')),
//       key('openParentWhitespace', MaybeWlParser),
//       openParentParser,
//       key('indexedColumns', nonEmptyCommaSingleList(nodeParser('IndexedColumn'))),
//       key('closeParentWhitespace', MaybeWlParser),
//       closeParentParser,
//       key('where', c.maybe(fragmentParser('Where')))
//     )
//   )
// );

// fragmentParser('CreateTableAsDef').setParser(
//   c.apply(c.pipe(WLParser, KeywordParser.AS, WLParser, nodeParser('SelectStmt')), ([asWhitespace, _as, selectStmtWhitespace, selectStmt]) => ({
//     variant: 'As',
//     asWhitespace,
//     selectStmtWhitespace,
//     selectStmt,
//   }))
// );

// fragmentParser('CreateTableColumnsDef').setParser(
//   c.apply(
//     c.pipe(
//       MaybeWlParser,
//       openParentParser,
//       nonEmptyCommaSingleList(nodeParser('ColumnDef')),
//       c.many(fragmentParser('CreateTableConstraintItem')),
//       MaybeWlParser,
//       closeParentParser,
//       c.maybe(c.pipe(MaybeWlParser, KeywordParser.WITHOUT, WLParser, KeywordParser.ROWID))
//     ),
//     ([openParentWhitespace, _open, columnDefs, tableConstraints, closeParentWhitespace, _close, withoutRowId]): Fragment<'CreateTableColumnsDef'> => ({
//       variant: 'Columns',
//       openParentWhitespace,
//       columnDefs,
//       tableConstraints,
//       closeParentWhitespace,
//       withoutRowId: mapIfExist(withoutRowId, ([withoutWhitespace, _without, rowidWhitespace, _rowid]) => ({ withoutWhitespace, rowidWhitespace })),
//     })
//   )
// );

// nodeParser('CreateTableStmt').setParser(
//   c.keyed((key) =>
//     c.keyedPipe(
//       KeywordParser.CREATE,
//       key(
//         'temp',
//         c.maybe(
//           c.apply(c.pipe(WLParser, c.oneOf(KeywordParser.TEMP, KeywordParser.TEMPORARY)), ([whitespace, keyword]) => ({
//             whitespace,
//             variant: keyword === 'TEMP' ? 'Temp' : 'Temporary',
//           }))
//         )
//       ),
//       key('tableWhitespace', WLParser),
//       KeywordParser.TABLE,
//       key('ifNotExists', c.maybe(fragmentParser('IfNotExists'))),
//       key('tableTargetWhitespace', WLParser),
//       key('tableTarget', fragmentParser('SchemaItemTarget')),
//       key('definition', c.oneOf(fragmentParser('CreateTableAsDef'), fragmentParser('CreateTableColumnsDef')))
//     )
//   )
// );

// nodeParser('FilterClause').setParser(
//   c.apply(
//     c.pipe(
//       KeywordParser.FILTER,
//       MaybeWlParser,
//       openParentParser,
//       MaybeWlParser,
//       KeywordParser.WHERE,
//       WLParser,
//       fragmentParser('Expr'),
//       MaybeWlParser,
//       closeParentParser
//     ),
//     ([_filter, openParentWhitespace, _open, whereWhitespace, _where, exprWhitespace, expr, closeParentWhitespace, _close]) => ({
//       openParentWhitespace,
//       whereWhitespace,
//       exprWhitespace,
//       expr,
//       closeParentWhitespace,
//     })
//   )
// );

// nodeParser('OverClause').setParser(
//   c.apply(
//     c.pipe(
//       KeywordParser.OVER,
//       c.oneOf(
//         c.apply(c.pipe(WLParser, nodeParser('Identifier')), ([windowNameWhitespace, windowName]): Node<'OverClause'>['inner'] => ({
//           variant: 'WindowName',
//           windowNameWhitespace,
//           windowName,
//         })),
//         c.apply(
//           c.pipe(MaybeWlParser, openParentParser, MaybeWlParser, closeParentParser),
//           ([openParentWhitespace, _open, closeParentWhitespace, _close]): Node<'OverClause'>['inner'] => {
//             return { variant: 'EmptyParenthesis', openParentWhitespace, closeParentWhitespace };
//           }
//         ),
//         c.transformSuccess(
//           c.pipe(
//             MaybeWlParser,
//             openParentParser,
//             c.maybe(c.pipe(MaybeWlParser, nodeParser('Identifier'))),
//             c.maybe(c.pipe(MaybeWlParser, fragmentParser('OverClausePartitionBy'))),
//             c.maybe(c.pipe(MaybeWlParser, fragmentParser('OverClauseOrderBy'))),
//             c.maybe(c.pipe(MaybeWlParser, nodeParser('FrameSpec'))),
//             MaybeWlParser,
//             closeParentParser
//           ),
//           (res, parentPath): ParseResult<Node<'OverClause'>['inner']> => {
//             const [openParentWhitespace, _open, baseWindowName, partitionBy, orderBy, frameSpec, closeParentWhitespace, _close] = res.value;
//             const inner: Fragment<'OverClauseInner'> = {
//               baseWindowName: mapIfExist(baseWindowName, ([baseWindowNameWhitespace, baseWindowName]) => ({ baseWindowNameWhitespace, baseWindowName })),
//               partitionBy: mapIfExist(partitionBy, ([partitionWhitespace, { byWhitespace, exprs }]) => ({ partitionWhitespace, byWhitespace, exprs })),
//               orderBy: mapIfExist(orderBy, ([orderWhitespace, { byWhitespace, orderingTerms }]) => ({ orderWhitespace, byWhitespace, orderingTerms })),
//               frameSpec: mapIfExist(frameSpec, ([frameSpecWhitespace, frameSpec]) => ({ frameSpecWhitespace, frameSpec })),
//             };
//             if (Object.values(inner).filter((v) => v !== undefined).length === 0) {
//               return ParseFailure(res.start, [...parentPath, 'OverClauseInner'], 'OverClauseInner is empty (EmptyParenthesis variant should parse)');
//             }
//             const data: Node<'OverClause'>['inner'] = {
//               variant: 'Window',
//               openParentWhitespace,
//               inner: inner as any,
//               closeParentWhitespace,
//             };
//             return ParseSuccess(res.start, res.rest, data);
//           }
//         )
//       )
//     ),
//     ([_over, inner]) => ({ inner })
//   )
// );

// fragmentParser('CollationName').setParser(
//   c.apply(
//     c.pipe(WLParser, KeywordParser.COLLATE, WLParser, nodeParser('Identifier')),
//     ([collateWhitespace, _collate, collationNameWhitespace, collationName]) => ({
//       collateWhitespace,
//       collationName,
//       collationNameWhitespace,
//     })
//   )
// );

// fragmentParser('IndexedColumnOrder').setParser(
//   c.apply(c.pipe(WLParser, c.oneOf(KeywordParser.ASC, KeywordParser.DESC)), ([whitespace, order]) => {
//     return order === 'ASC' ? { variant: 'Asc', ascWhitespace: whitespace } : { variant: 'Desc', descWhitespace: whitespace };
//   })
// );

// nodeParser('IndexedColumn').setParser(
//   c.apply(
//     c.pipe(c.oneOf(fragmentParser('Expr'), nodeParser('Identifier')), c.maybe(fragmentParser('CollationName')), c.maybe(fragmentParser('IndexedColumnOrder'))),
//     ([columnOrExp, collate, order]): Complete<NodeData['IndexedColumn']> => ({
//       column: columnOrExp.kind === 'Identifier' ? { variant: 'Name', columnName: columnOrExp } : { variant: 'Expr', expr: columnOrExp },
//       collate,
//       order,
//     })
//   )
// );

// nodeParser('BitwiseNegation').setParser(
//   c.apply(
//     c.pipe(tildeParser, MaybeWlParser, fragmentParser('ExprBase')),
//     ([_tilde, exprWhitespace, expr]): Complete<NodeData['BitwiseNegation']> => ({ expr, exprWhitespace })
//   )
// );

// nodeParser('Plus').setParser(
//   c.apply(c.pipe(plusParser, MaybeWlParser, fragmentParser('ExprBase')), ([_plus, exprWhitespace, expr]) => ({ expr, exprWhitespace }))
// );

// nodeParser('Minus').setParser(
//   c.apply(c.pipe(dashParser, MaybeWlParser, fragmentParser('ExprBase')), ([_minus, exprWhitespace, expr]) => ({ expr, exprWhitespace }))
// );

// nodeParser('Column').setParser(
//   c.apply(
//     c.oneOf(c.pipe(fragmentParser('SchemaItemTarget'), MaybeWlParser, dotParser, MaybeWlParser, nodeParser('Identifier')), nodeParser('Identifier')),
//     (items) => {
//       if (Array.isArray(items)) {
//         const [tableTarget, dotWhitespace, _dot, columnNameWhitespace, columnName] = items;
//         return { variant: 'ColumnWithTable', tableTarget, dotWhitespace, columnNameWhitespace, columnName };
//       }
//       return { variant: 'ColumnWithoutTable', columnName: items };
//     }
//   )
// );

// fragmentParser('SelectExists').setParser(
//   c.apply(c.pipe(c.maybe(c.pipe(KeywordParser.NOT, WLParser)), KeywordParser.EXISTS, MaybeWlParser), ([not, _exists, whitespaceAfter]) => ({
//     not: mapIfExist(not, ([_not, whitespaceAfter]) => ({ whitespaceAfter })),
//     whitespaceAfter,
//   }))
// );

// nodeParser('Select').setParser(
//   c.apply(
//     c.pipe(c.maybe(fragmentParser('SelectExists')), openParentParser, MaybeWlParser, nodeParser('SelectStmt'), MaybeWlParser, closeParentParser),
//     ([exists, _openParent, selectStmtWhitespace, selectStmt, closeParentWhitespace, _closeParent]) => {
//       return { exists, selectStmtWhitespace, selectStmt, closeParentWhitespace };
//     }
//   )
// );

// nodeParser('FunctionInvocation').setParser(
//   c.apply(
//     c.pipe(
//       nodeParser('Identifier'),
//       MaybeWlParser,
//       openParentParser,
//       c.maybe(
//         c.oneOf(
//           c.apply(c.pipe(MaybeWlParser, starParser), ([starWhitespace, _star]): NodeData['FunctionInvocation']['parameters'] => ({
//             variant: 'Star',
//             starWhitespace,
//           })),
//           c.apply(
//             c.pipe(
//               c.maybe(c.apply(c.pipe(MaybeWlParser, KeywordParser.DISTINCT), ([distinctWhitespace, _distinct]) => ({ distinctWhitespace }))),
//               nonEmptyCommaSingleList(fragmentParser('Expr'))
//             ),
//             ([distinct, exprs]): NodeData['FunctionInvocation']['parameters'] => ({ variant: 'Parameters', distinct, exprs })
//           )
//         )
//       ),
//       MaybeWlParser,
//       closeParentParser,
//       c.maybe(
//         c.oneOf(
//           c.apply(
//             c.pipe(MaybeWlParser, nodeParser('FilterClause'), c.maybe(c.pipe(WLParser, nodeParser('OverClause')))),
//             ([filterClauseWhitespace, filterClause, over]) => ({
//               filterClause: { filterClauseWhitespace, filterClause },
//               overClause: mapIfExist(over, ([overClauseWhitespace, overClause]) => ({ overClauseWhitespace, overClause })),
//             })
//           ),
//           c.apply(c.pipe(MaybeWlParser, nodeParser('OverClause')), ([overClauseWhitespace, overClause]) => ({
//             filterClause: undefined,
//             overClause: { overClauseWhitespace, overClause },
//           }))
//         )
//       )
//     ),
//     ([functionName, openParentWhitespace, _open, parameters, closeParentWhitespace, _close, filterOver]) => {
//       return {
//         functionName,
//         openParentWhitespace,
//         parameters,
//         closeParentWhitespace,
//         filterClause: filterOver?.filterClause,
//         overClause: filterOver?.overClause,
//       };
//     }
//   )
// );

// nodeParser('Parenthesis').setParser(
//   c.apply(
//     c.pipe(openParentParser, nonEmptyCommaSingleList(fragmentParser('Expr')), MaybeWlParser, closeParentParser),
//     ([_open, exprs, closeParentWhitespace, _close]): Complete<NodeData['Parenthesis']> => ({ exprs, closeParentWhitespace })
//   )
// );

// nodeParser('CastAs').setParser(
//   c.apply(
//     c.pipe(
//       KeywordParser.CAST,
//       MaybeWlParser,
//       openParentParser,
//       MaybeWlParser,
//       fragmentParser('Expr'),
//       WLParser,
//       KeywordParser.AS,
//       WLParser,
//       nodeParser('TypeName'),
//       MaybeWlParser,
//       closeParentParser
//     ),
//     ([_cast, openParentWhitespace, _open, exprWhitespace, expr, asWhitespace, _as, typeNameWhitespace, typeName, closeParentWhitespace, _close]) => ({
//       openParentWhitespace,
//       exprWhitespace,
//       expr,
//       asWhitespace,
//       typeNameWhitespace,
//       typeName,
//       closeParentWhitespace,
//     })
//   )
// );

// fragmentParser('CaseItem').setParser(
//   c.apply(
//     c.pipe(WLParser, KeywordParser.WHEN, WLParser, fragmentParser('Expr'), WLParser, KeywordParser.THEN, WLParser, fragmentParser('Expr')),
//     ([whenWhitespace, _when, whenExprWhitespace, whenExpr, thenWhitespace, _then, thenExprWhitespace, thenExpr]) => ({
//       whenWhitespace,
//       whenExprWhitespace,
//       whenExpr,
//       thenWhitespace,
//       thenExprWhitespace,
//       thenExpr,
//     })
//   )
// );

// nodeParser('Case').setParser(
//   c.apply(
//     c.pipe(
//       KeywordParser.CASE,
//       c.maybe(c.apply(c.pipe(WLParser, fragmentParser('Expr')), ([exprWhitespace, expr]): NodeData['Case']['expr'] => ({ exprWhitespace, expr }))),
//       nonEmptyList(fragmentParser('CaseItem')),
//       c.maybe(
//         c.apply(
//           c.pipe(WLParser, KeywordParser.ELSE, WLParser, fragmentParser('Expr')),
//           ([elseWhitespace, _else, exprWhitespace, expr]): NodeData['Case']['else'] => ({ elseWhitespace, exprWhitespace, expr })
//         )
//       ),
//       WLParser,
//       KeywordParser.END
//     ),
//     ([_case, expr, cases, elseVal, endWhitespace, _end]) => ({ expr, cases, else: elseVal, endWhitespace })
//   )
// );

// nodeParser('RaiseFunction').setParser(
//   c.apply(
//     c.pipe(
//       KeywordParser.RAISE,
//       MaybeWlParser,
//       openParentParser,
//       MaybeWlParser,
//       c.apply(
//         c.oneOf(
//           c.pipe(KeywordParser.IGNORE),
//           c.pipe(KeywordParser.ROLLBACK, MaybeWlParser, commaParser, MaybeWlParser, nodeParser('StringLiteral')),
//           c.pipe(KeywordParser.ABORT, MaybeWlParser, commaParser, MaybeWlParser, nodeParser('StringLiteral')),
//           c.pipe(KeywordParser.FAIL, MaybeWlParser, commaParser, MaybeWlParser, nodeParser('StringLiteral'))
//         ),
//         (data): NodeData['RaiseFunction']['inner'] => {
//           if (data[0] === 'IGNORE') {
//             return { variant: 'Ignore' };
//           }
//           const [keyword, commaWhitespace, _comma, errorMessageWhitespace, errorMessage] = data;
//           return {
//             variant: keyword === 'ROLLBACK' ? 'Rollback' : keyword === 'ABORT' ? 'Abort' : 'Fail',
//             commaWhitespace,
//             errorMessageWhitespace,
//             errorMessage,
//           };
//         }
//       ),
//       MaybeWlParser,
//       closeParentParser
//     ),
//     ([_raise, opentParentWhitespace, _open, innerWhitespace, inner, closeParentWhitespace]) => ({
//       opentParentWhitespace,
//       innerWhitespace,
//       inner,
//       closeParentWhitespace,
//     })
//   )
// );

// fragmentParser('ExprBase').setParser(
//   c.oneOf(
//     fragmentParser('LiteralValue'),
//     nodeParser('BitwiseNegation'),
//     nodeParser('Plus'),
//     nodeParser('Minus'),
//     nodeParser('BindParameter'),
//     nodeParser('Column'),
//     nodeParser('Select'),
//     nodeParser('FunctionInvocation'),
//     nodeParser('Parenthesis'),
//     nodeParser('CastAs'),
//     nodeParser('Case'),
//     nodeParser('RaiseFunction')
//   )
// );

// fragmentParser('ExprChainItemCollate').setParser(
//   c.apply(
//     c.pipe(WLParser, KeywordParser.COLLATE, WLParser, nodeParser('Identifier')),
//     ([collateWhitespace, _collate, collationNameWhitespace, collationName]) => ({
//       variant: 'Collate',
//       collateWhitespace,
//       collationNameWhitespace,
//       collationName,
//     })
//   )
// );

// fragmentParser('ExprChainItemConcatenate').setParser(exprChainItemOpExprParser('Concatenate', concatenateParser, WLParser));
// fragmentParser('ExprChainItemMultiply').setParser(exprChainItemOpExprParser('Multiply', starParser, MaybeWlParser));
// fragmentParser('ExprChainItemDivide').setParser(exprChainItemOpExprParser('Divide', slashParser, MaybeWlParser));
// fragmentParser('ExprChainItemModulo').setParser(exprChainItemOpExprParser('Modulo', percentParser, MaybeWlParser));
// fragmentParser('ExprChainItemAdd').setParser(exprChainItemOpExprParser('Add', plusParser, MaybeWlParser));
// fragmentParser('ExprChainItemSubtract').setParser(exprChainItemOpExprParser('Subtract', dashParser, MaybeWlParser));
// fragmentParser('ExprChainItemBitwiseAnd').setParser(exprChainItemOpExprParser('BitwiseAnd', ampersandParser, MaybeWlParser));
// fragmentParser('ExprChainItemBitwiseOr').setParser(exprChainItemOpExprParser('BitwiseOr', pipeParser, MaybeWlParser));
// fragmentParser('ExprChainItemBitwiseShiftLeft').setParser(exprChainItemOpExprParser('BitwiseShiftLeft', bitwiseShiftLeftParser, MaybeWlParser));
// fragmentParser('ExprChainItemBitwiseShiftRight').setParser(exprChainItemOpExprParser('BitwiseShiftRight', bitwiseShiftRightParser, MaybeWlParser));
// fragmentParser('ExprChainItemEscape').setParser(exprChainItemOpExprParser('Escape', KeywordParser.ESCAPE, WLParser));
// fragmentParser('ExprChainItemGreaterThan').setParser(exprChainItemOpExprParser('GreaterThan', greaterThanParser, MaybeWlParser));
// fragmentParser('ExprChainItemLowerThan').setParser(exprChainItemOpExprParser('LowerThan', lowerThanParser, MaybeWlParser));
// fragmentParser('ExprChainItemGreaterOrEqualThan').setParser(exprChainItemOpExprParser('GreaterOrEqualThan', greaterThanOrEqualParser, MaybeWlParser));
// fragmentParser('ExprChainItemLowerOrEqualThan').setParser(exprChainItemOpExprParser('LowerOrEqualThan', lowerThanOrEqualParser, MaybeWlParser));
// fragmentParser('ExprChainItemEqual').setParser(
//   c.apply(
//     c.pipe(MaybeWlParser, c.oneOf(equalParser, doubleEqualParser), MaybeWlParser, fragmentParser('ExprBase')),
//     ([operatorWhitespace, operator, exprWhitespace, expr]) => ({ variant: 'Equal', operatorWhitespace, operator, exprWhitespace, expr })
//   )
// );
// fragmentParser('ExprChainItemDifferent').setParser(
//   c.apply(
//     c.pipe(MaybeWlParser, c.oneOf(differentParser, notEqualParser), MaybeWlParser, fragmentParser('ExprBase')),
//     ([operatorWhitespace, operator, exprWhitespace, expr]) => ({ variant: 'Different', operatorWhitespace, operator, exprWhitespace, expr })
//   )
// );
// fragmentParser('ExprChainItemIs').setParser(exprChainItemOpExprParser('Is', KeywordParser.IS, WLParser));
// fragmentParser('ExprChainItemIsNot').setParser(
//   c.apply(
//     c.pipe(WLParser, KeywordParser.IS, WLParser, KeywordParser.NOT, WLParser, fragmentParser('ExprBase')),
//     ([isWhitespace, _is, notWhitespace, _not, exprWhitespace, expr]) => ({ variant: 'IsNot', isWhitespace, notWhitespace, exprWhitespace, expr })
//   )
// );
// fragmentParser('ExprChainItemNotNull').setParser(
//   c.apply(c.pipe(WLParser, KeywordParser.NOTNULL), ([notNullWhitespace, _notNull]) => ({ variant: 'NotNull', notNullWhitespace }))
// );
// fragmentParser('ExprChainItemNot_Null').setParser(
//   c.apply(c.pipe(WLParser, KeywordParser.NOT, WLParser, KeywordParser.NULL), ([notNullWhitespace, _not, nullWhitespace, _null]) => ({
//     variant: 'Not_Null',
//     notNullWhitespace,
//     nullWhitespace,
//   }))
// );
// fragmentParser('ExprChainItemNot').setParser(c.apply(c.pipe(WLParser, KeywordParser.NOT), ([notWhitespace, _not]) => ({ variant: 'Not', notWhitespace })));
// fragmentParser('ExprChainItemAnd').setParser(exprChainItemOpExprParser('And', KeywordParser.AND, WLParser));
// fragmentParser('ExprChainItemOr').setParser(exprChainItemOpExprParser('Or', KeywordParser.OR, WLParser));
// fragmentParser('ExprChainItemIsNull').setParser(
//   c.apply(c.pipe(WLParser, KeywordParser.ISNULL), ([isNullWhitespace, _isNull]) => ({ variant: 'IsNull', isNullWhitespace }))
// );
// fragmentParser('ExprChainItemBetween').setParser(exprChainItemMaybeNotOpExprParser('Between', KeywordParser.BETWEEN));
// fragmentParser('ExprChainItemMatch').setParser(exprChainItemMaybeNotOpExprParser('Match', KeywordParser.MATCH));
// fragmentParser('ExprChainItemLike').setParser(exprChainItemMaybeNotOpExprParser('Like', KeywordParser.LIKE));
// fragmentParser('ExprChainItemRegexp').setParser(exprChainItemMaybeNotOpExprParser('Regexp', KeywordParser.REGEXP));
// fragmentParser('ExprChainItemGlob').setParser(exprChainItemMaybeNotOpExprParser('Glob', KeywordParser.GLOB));

// fragmentParser('InValuesList').setParser(
//   c.apply(
//     c.pipe(
//       MaybeWlParser,
//       openParentParser,
//       c.maybe(
//         c.oneOf(
//           c.apply(nonEmptyCommaSingleList(fragmentParser('Expr')), (exprs): Fragment<'InValuesList'>['items'] => ({ variant: 'Exprs', exprs })),
//           c.apply(c.pipe(MaybeWlParser, nodeParser('SelectStmt')), ([selectStmtWhitespace, selectStmt]): Fragment<'InValuesList'>['items'] => {
//             return { variant: 'Select', selectStmtWhitespace, selectStmt };
//           })
//         )
//       ),
//       MaybeWlParser,
//       closeParentParser
//     ),
//     ([openParentWhitespace, _open, items, closeParentWhitespace, _close]) => ({ variant: 'List', openParentWhitespace, items, closeParentWhitespace })
//   )
// );

// fragmentParser('InValuesTableName').setParser(
//   c.apply(c.pipe(WLParser, fragmentParser('SchemaItemTarget')), ([tableTargetWhitespace, tableTarget]) => ({
//     variant: 'TableName',
//     tableTargetWhitespace,
//     tableTarget,
//   }))
// );

// fragmentParser('InValueTableFunctionInvocation').setParser(
//   c.apply(
//     c.pipe(
//       WLParser,
//       fragmentParser('SchemaItemTarget'),
//       MaybeWlParser,
//       openParentParser,
//       c.maybe(nonEmptyCommaSingleList(fragmentParser('Expr'))),
//       MaybeWlParser,
//       closeParentParser
//     ),
//     ([functionTargetWhitespace, functionTarget, openParentWhitespace, _open, parameters, closeParentWhitespace, _close]) => ({
//       variant: 'TableFunctionInvocation',
//       functionTargetWhitespace,
//       functionTarget,
//       openParentWhitespace,
//       parameters,
//       closeParentWhitespace,
//     })
//   )
// );

// fragmentParser('InValues').setParser(
//   c.oneOf(fragmentParser('InValuesList'), fragmentParser('InValuesTableName'), fragmentParser('InValueTableFunctionInvocation'))
// );

// fragmentParser('ExprChainItemIn').setParser(
//   c.apply(
//     c.pipe(
//       c.maybe(c.apply(c.pipe(WLParser, KeywordParser.NOT), ([notWhitespace, _not]) => ({ notWhitespace }))),
//       WLParser,
//       KeywordParser.IN,
//       fragmentParser('InValues')
//     ),
//     ([not, inWhitespace, _in, values]) => ({ variant: 'In', not, inWhitespace, values })
//   )
// );

// fragmentParser('ExprChainItem').setParser(
//   c.oneOf<Fragment<'ExprChainItem'>, Ctx>(
//     fragmentParser('ExprChainItemCollate'),
//     fragmentParser('ExprChainItemConcatenate'),
//     fragmentParser('ExprChainItemMultiply'),
//     fragmentParser('ExprChainItemDivide'),
//     fragmentParser('ExprChainItemModulo'),
//     fragmentParser('ExprChainItemAdd'),
//     fragmentParser('ExprChainItemSubtract'),
//     fragmentParser('ExprChainItemBitwiseAnd'),
//     fragmentParser('ExprChainItemBitwiseOr'),
//     fragmentParser('ExprChainItemBitwiseShiftLeft'),
//     fragmentParser('ExprChainItemBitwiseShiftRight'),
//     fragmentParser('ExprChainItemEscape'),
//     fragmentParser('ExprChainItemGreaterThan'),
//     fragmentParser('ExprChainItemLowerThan'),
//     fragmentParser('ExprChainItemGreaterOrEqualThan'),
//     fragmentParser('ExprChainItemLowerOrEqualThan'),
//     fragmentParser('ExprChainItemEqual'),
//     fragmentParser('ExprChainItemDifferent'),
//     fragmentParser('ExprChainItemIs'),
//     fragmentParser('ExprChainItemIsNot'),
//     fragmentParser('ExprChainItemBetween'),
//     fragmentParser('ExprChainItemIn'),
//     fragmentParser('ExprChainItemMatch'),
//     fragmentParser('ExprChainItemLike'),
//     fragmentParser('ExprChainItemRegexp'),
//     fragmentParser('ExprChainItemGlob'),
//     fragmentParser('ExprChainItemIsNull'),
//     fragmentParser('ExprChainItemNotNull'),
//     fragmentParser('ExprChainItemNot_Null'),
//     fragmentParser('ExprChainItemNot'),
//     fragmentParser('ExprChainItemAnd'),
//     fragmentParser('ExprChainItemOr')
//   )
// );

// type ExprPart =
//   | { variant: 'Expr'; expr: Fragment<'Expr'>; _result: ParseResultSuccess<any> }
//   | (Fragment<'ExprChainItem'> & { _result: ParseResultSuccess<any> });

// fragmentParser('Expr').setParser(
//   c.transformSuccess(
//     c.pipeResults(fragmentParser('ExprBase'), c.manyResults(fragmentParser('ExprChainItem'), { allowEmpty: true })),
//     (result, parentPath, ctx) => {
//       const [firstRes, itemsRes] = result.value;
//       const items = itemsRes.value.map((r): ExprPart => ({ ...r.value, _result: r }));
//       const first = firstRes.value;
//       const parts: Array<ExprPart> = [{ variant: 'Expr', expr: first, _result: firstRes }, ...items];
//       const isResolved = () => parts.length === 1 && parts[0].variant === 'Expr';
//       while (isResolved() === false) {
//         const partToMerge = findHighestPrecedencePart(parts);
//         const partToMergeIndex = parts.indexOf(partToMerge);
//         if (partToMergeIndex === 0) {
//           return ParseFailure(partToMerge._result.start, parentPath, 'First item has highest precedence');
//         }
//         const mergeWith = parts[partToMergeIndex - 1];
//         const merged = mergeParts(mergeWith, partToMerge, parentPath, ctx);
//         if (merged.type === 'Failure') {
//           return merged;
//         }
//         parts.splice(partToMergeIndex - 1, 2, merged.part);
//       }
//       if (parts.length === 1 && parts[0].variant === 'Expr') {
//         return ParseSuccess(result.start, result.rest, parts[0].expr);
//       }
//       throw new Error('Oops');
//     }
//   )
// );

nodeParser('Whitespace').setParser(c.apply(whitespaceRawParser, (content) => ({ content })));

// Functions

function createContext(): Ctx {
  const ranges: Ranges = new Map();
  return {
    ranges,
    createNode<K extends NodeKind>(kind: K, start: number, end: number, data: NodeData[K]): Node<K> {
      const node: Node<K> = { kind, ...data } as any;
      ranges.set(node, { start, end });
      return node;
    },
  };
}

function createExact<T extends string>(str: T): Parser<T, Ctx> {
  return c.exact<T, Ctx>(str);
}

function createRegexp(name: string, reg: RegExp): Parser<string, Ctx> {
  return c.named(`Regexp(${name})`, c.regexp<Ctx>(reg));
}

function createKeyword<T extends string>(str: T): Parser<T, Ctx> {
  return c.keyword<T, Ctx>(str);
}

function mapIfExist<T, U>(val: T | undefined | null, mapper: (val: T) => U): U | undefined {
  return val === undefined || val == null ? undefined : mapper(val);
}

function expectNever(val: never): never {
  throw new Error(`Unexpected never ${val}`);
}

function nonEmptyList<T>(itemParser: Parser<T, Ctx>): Parser<NonEmptyList<T>, Ctx> {
  const parser = c.many(itemParser, { allowEmpty: false });
  return {
    parse: (parentPath, input, parent, ctx) => {
      const path = [...parentPath, 'NonEmptyList'];
      const next = parser.parse(path, input, parent, ctx);
      if (next.type === 'Failure') {
        return next;
      }
      const result: NonEmptyList<T> = { head: next.value[0], tail: next.value.slice(1) };
      return ParseSuccess(input.position, next.rest, result);
    },
  };
}

function nonEmptyListSepBy<T, Sep>(itemParser: Parser<T, Ctx>, sepParser: Parser<Sep, Ctx>): Parser<NonEmptyListSepBy<T, Sep>, Ctx> {
  const parser = c.manySepBy(itemParser, sepParser, { allowEmpty: false, allowTrailing: false });
  return {
    parse: (parentPath, input, parent, ctx) => {
      const path = [...parentPath, 'NonEmptyListSepBy'];
      const next = parser.parse(path, input, parent, ctx);
      if (next.type === 'Failure') {
        return next;
      }
      if (next.value === null) {
        return ParseFailure(input.position, path, 'Empty not allowed', next.ifError);
      }
      const result: NonEmptyListSepBy<T, Sep> = { head: next.value.head, tail: next.value.tail };
      return ParseSuccess(input.position, next.rest, result);
    },
  };
}

function nonEmptyCommaList<T>(itemParser: Parser<T, Ctx>): Parser<NonEmptyCommaList<T>, Ctx> {
  return nonEmptyListSepBy(
    itemParser,
    c.apply(c.pipe(MaybeWhitespaceLikeParser, commaParser), ([whitespaceBeforeComma]) => ({ whitespaceBeforeComma }))
  );
}

function nonEmptyCommaSingleList<T>(itemParser: Parser<T, Ctx>): Parser<NonEmptyCommaListSingle<T>, Ctx> {
  return nonEmptyListSepBy(
    c.apply(c.pipe(MaybeWhitespaceLikeParser, itemParser), ([whitespaceBeforeItem, item]) => ({ whitespaceBeforeItem, item })),
    c.apply(c.pipe(MaybeWhitespaceLikeParser, commaParser), ([whitespaceBeforeComma]) => ({ whitespaceBeforeComma }))
  );
}

function manySepByResultToArray<T>(result: c.ManySepByResult<T, any>): Array<T> {
  if (result === null) {
    return [];
  }
  return [result.head, ...result.tail.map((v) => v.item)];
}

// function exprChainItemOpExprParser<Variant extends string>(
//   variant: Variant,
//   opParser: Parser<string, Ctx>,
//   wlParser: Parser<Fragment<'WhitespaceLike'> | undefined, Ctx>
// ): Parser<ExprChain_Item_OpExpr<Variant>, Ctx> {
//   return c.apply(
//     c.pipe(wlParser, opParser, wlParser, fragmentParser('ExprBase')),
//     ([whitespaceBeforeOperator, _op, whitespaceBeforeExpr, expr]): ExprChain_Item_OpExpr<Variant> => ({
//       variant,
//       whitespaceBeforeOperator,
//       whitespaceBeforeExpr,
//       expr,
//     })
//   );
// }

// function exprChainItemMaybeNotOpExprParser<Variant extends string>(
//   variant: Variant,
//   opParser: Parser<string, Ctx>
// ): Parser<ExprChain_Item_MaybeNotOpExpr<Variant>, Ctx> {
//   return c.apply(
//     c.pipe(WhitespaceLikeParser, opParser, c.maybe(fragmentParser('Not')), WhitespaceLikeParser, fragmentParser('ExprBase')),
//     ([whitespaceBeforeOperator, _op, not, whitespaceBeforeExpr, expr]): ExprChain_Item_MaybeNotOpExpr<Variant> => ({
//       variant,
//       whitespaceBeforeOperator,
//       not,
//       whitespaceBeforeExpr,
//       expr,
//     })
//   );
// }

// function mergeParts(left: ExprPart, right: ExprPart, parentPath: Array<string>, ctx: Ctx): { type: 'Success'; part: ExprPart } | ParseResultFailure {
//   const start = left._result.start;
//   const end = right._result.end;
//   const rest = right._result.rest;
//   if (left.variant === 'Collate' || left.variant === 'In' || left.variant === 'IsNull' || left.variant === 'NotNull' || left.variant === 'Not_Null') {
//     return ParseFailure(start, parentPath, `Unexpected ${left.variant}`);
//   }
//   if (left.variant === 'Not') {
//     if (right.variant !== 'Expr') {
//       return ParseFailure(right._result.start, parentPath, 'Expecting Expression');
//     }
//     const expr = ctx.createNode('Not', start, end, {
//       expr: right.expr as any,
//       exprWhitespace: left.notWhitespace,
//     });
//     return { type: 'Success', part: { variant: 'Expr', expr, _result: ParseSuccess(start, rest, expr) } };
//   }
//   if (right.variant === 'Escape') {
//     if (left.variant !== 'Like') {
//       return ParseFailure(right._result.start, parentPath, 'Unexpected Escape');
//     }
//     if (left.escape) {
//       return ParseFailure(right._result.start, parentPath, 'Unexpected Escape');
//     }
//     const escapeNode = ctx.createNode('Escape', right._result.start, right._result.end, {
//       exprWhitespace: right.exprWhitespace,
//       expr: right.expr,
//     });
//     const updateLikePart: Fragment<'ExprChainItemLike'> = {
//       ...left,
//       escape: { escapeWhitespace: right.opWhitespace, escape: escapeNode },
//     };
//     return {
//       type: 'Success',
//       part: { ...updateLikePart, _result: ParseSuccess(start, rest, updateLikePart) },
//     };
//   }
//   if (left.variant === 'Between' && right.variant === 'And' && left.and === undefined) {
//     const updateBetweenPart: Fragment<'ExprChainItemBetween'> = {
//       ...left,
//       and: right,
//     };
//     return {
//       type: 'Success',
//       part: { ...updateBetweenPart, _result: ParseSuccess(start, rest, updateBetweenPart) },
//     };
//   }
//   const expr = mergePartWithExpr(left.expr, right, start, end, parentPath, ctx);
//   return {
//     type: 'Success',
//     part: {
//       ...left,
//       expr: expr as any,
//       _result: ParseSuccess(start, rest, expr),
//     },
//   };
// }

// function mergePartWithExpr(
//   leftExpr: any,
//   part: ExprPart,
//   start: number,
//   end: number,
//   parentPath: Array<string>,
//   ctx: Ctx
// ): Fragment<'ExprP01'> | ParseResultFailure {
//   if (part.variant === 'Expr' || part.variant === 'Collate' || part.variant === 'Escape' || part.variant === 'Not') {
//     return ParseFailure(part._result.start, parentPath, `Unexpected ${part.variant}`);
//   }
//   if (
//     part.variant === 'Concatenate' ||
//     part.variant === 'Multiply' ||
//     part.variant === 'Divide' ||
//     part.variant === 'Modulo' ||
//     part.variant === 'Add' ||
//     part.variant === 'Subtract' ||
//     part.variant === 'BitwiseAnd' ||
//     part.variant === 'BitwiseOr' ||
//     part.variant === 'BitwiseShiftLeft' ||
//     part.variant === 'BitwiseShiftRight' ||
//     part.variant === 'GreaterThan' ||
//     part.variant === 'LowerThan' ||
//     part.variant === 'GreaterOrEqualThan' ||
//     part.variant === 'LowerOrEqualThan' ||
//     part.variant === 'Is' ||
//     part.variant === 'And' ||
//     part.variant === 'Or' ||
//     false
//   ) {
//     return ctx.createNode(part.variant, start, end, {
//       leftExpr,
//       operatorWhitespace: part.opWhitespace,
//       rightExprWhitespace: part.exprWhitespace,
//       rightExpr: part.expr,
//     });
//   }
//   if (part.variant === 'Equal' || part.variant === 'Different') {
//     return ctx.createNode(part.variant, start, end, {
//       leftExpr,
//       operatorWhitespace: part.operatorWhitespace,
//       operator: part.operator,
//       rightExprWhitespace: part.exprWhitespace,
//       rightExpr: part.expr,
//     });
//   }
//   if (part.variant === 'Match' || part.variant === 'Glob' || part.variant === 'Regexp') {
//     return ctx.createNode(part.variant, start, end, {
//       leftExpr,
//       not: part.not,
//       opWhitespace: part.opWhitespace,
//       rightExprWhitespace: part.exprWhitespace,
//       rightExpr: part.expr,
//     });
//   }
//   if (part.variant === 'IsNot') {
//     return ctx.createNode('IsNot', start, end, {
//       leftExpr,
//       isWhitespace: part.isWhitespace,
//       notWhitespace: part.notWhitespace,
//       rightWhitespace: part.exprWhitespace,
//       rightExpr: part.expr,
//     });
//   }
//   if (part.variant === 'Between') {
//     if (part.and === undefined) {
//       return ParseFailure(part._result.start, parentPath, `Missing And after Between`);
//     }
//     return ctx.createNode('Between', start, end, {
//       expr: leftExpr,
//       not: part.not,
//       betweenExprWhitespace: part.opWhitespace,
//       betweenWhitespace: part.exprWhitespace,
//       betweenExpr: part.expr,
//       andWhitespace: part.and.opWhitespace,
//       andExprWhitespace: part.and.exprWhitespace,
//       andExpr: part.expr,
//     });
//   }
//   if (part.variant === 'In') {
//     return ctx.createNode('In', start, end, {
//       expr: leftExpr,
//       not: part.not,
//       inWhitespace: part.opWhitespace,
//       values: part.values,
//     });
//   }
//   if (part.variant === 'Like') {
//     return ctx.createNode('Like', start, end, {
//       leftExpr,
//       not: part.not,
//       opWhitespace: part.opWhitespace,
//       rightExprWhitespace: part.exprWhitespace,
//       rightExpr: part.expr,
//       escape: part.escape,
//     });
//   }
//   if (part.variant === 'IsNull') {
//     return ctx.createNode('IsNull', start, end, {
//       expr: leftExpr,
//       isNullWhitespace: part.isNullWhitespace,
//     });
//   }
//   if (part.variant === 'NotNull') {
//     return ctx.createNode('NotNull', start, end, {
//       expr: leftExpr,
//       notNullWhitespace: part.notNullWhitespace,
//     });
//   }
//   if (part.variant === 'Not_Null') {
//     return ctx.createNode('Not_Null', start, end, {
//       expr: leftExpr,
//       notWhitespace: part.notWhitespace,
//       nullWhitespace: part.nullWhitespace,
//     });
//   }
//   return expectNever(part);
// }

// function findHighestPrecedencePart(parts: Array<ExprPart>): ExprPart {
//   let current: { precedence: number; part: ExprPart } = { part: parts[0], precedence: getPartPrecedence(null, parts[0]) };
//   for (let i = 1; i < parts.length; i++) {
//     const part = parts[i];
//     const previousPart = parts[i - 1];
//     const precedence = getPartPrecedence(previousPart, part);
//     if (current === null || precedence > current.precedence) {
//       current = { part, precedence };
//     }
//   }
//   return current.part;
// }

// function getPartPrecedence(previousPart: null | ExprPart, part: ExprPart): number {
//   if (part.variant === 'Expr') {
//     return 0;
//   }
//   if (part.variant === 'And') {
//     if (previousPart && previousPart.variant === 'Between' && previousPart.and === undefined) {
//       return OperatorPrecedence.Between;
//     }
//   }
//   if (part.variant === 'Between' && part.and === undefined) {
//     return 0;
//   }
//   return OperatorPrecedence[part.variant];
// }
