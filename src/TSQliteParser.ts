/* eslint-disable no-control-regex */
import * as c from './Combinator';
import { NodeKind, Node, NodeBase, NodeData, NonEmptyList, NonEmptyListSepBy, NonEmptyCommaList, NonEmptyCommaListSingle } from './Node';
import { Complete, Parser, ParseResultFailure, ParseResultSuccess, Rule } from './types';
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

const KEYWORD_RAW_REGEXP = /^[A-Za-z][A-Za-z_]*/g;

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

const NodeParserInternal: { [K in NodeParserKeys]?: NodeRule<K> } = {};

export const NodeParser: { [K in NodeParserKeys]: NodeRule<K> } = NodeParserInternal as any;

export const KeywordParser: { [K in typeof KEYWORDS[number]]: Parser<K, Ctx> } = Object.fromEntries(KEYWORDS.map((k) => [k, createKeyword(k)])) as any;

// prettier-ignore
type NonCompleteNodes = 'CompoundOperator' | 'NumericLiteral' | 'BindParameter' | 'JoinConstraint' | 'JoinOperator' | 'ResultColumn' | 'SelectCore' | 'TableOrSubquery';

interface NodeRule<K extends NodeKind> extends Parser<Node<K>, Ctx> {
  setParser(parser: Parser<K extends NonCompleteNodes ? NodeData[K] : Complete<NodeData[K]>, Ctx>): void;
}

function nodeParser<K extends NodeParserKeys>(kind: K): NodeRule<K> {
  if (NodeParserInternal[kind] === undefined) {
    const innerRule = c.rule<NodeData[K], Ctx>(kind);
    const rule = {
      ...innerRule,
      setParser: (parser: any) => {
        return innerRule.setParser(c.apply(parser, (data, start, end, ctx) => ctx.createNode(kind as any, start, end, data as any)));
      },
    } as NodeRule<K>;
    NodeParserInternal[kind] = rule as any;
  }
  return NodeParserInternal[kind] as any;
}

// prettier-ignore
type VirtualFragments = 'ExprP01' | 'ExprP02' | 'ExprP03' | 'ExprP04' | 'ExprP05' | 'ExprP06' | 'ExprP07' | 'ExprP08' | 'ExprP09' | 'ExprP10' | 'ExprP11' | 'ExprP12' | 'ExprP13' | 'SqlStmtList_Item_Empty';
type FragmentParserKeys = Exclude<FragmentName, VirtualFragments>;

const FragmentParserInternal: { [K in FragmentParserKeys]?: Rule<Fragment<K>, Ctx> } = {};

export const FragmentParser: { [K in FragmentParserKeys]: Rule<Fragment<K>, Ctx> } = FragmentParserInternal as any;

// prettier-ignore
type NonCompleteFragments = 'AggregateFunctionInvocation_Parameters' | 'AlterAction' | 'AnalyzeStmt_Target' | 'ColumnConstraint_Constraint' | 'Direction' | 'LiteralValue' | 'MaybeMaterialized' | 'CompoundSelectStmt_Item' | 'ConflictClause_OnConflict_Inner' | 'Temp' | 'CreateTableStmt_Definition' | 'CreateTriggerStmt_Modifier' | 'CreateTriggerStmt_Action' | 'ExprBase' | 'FunctionInvocation_Parameters' | 'ExprChain_Item' | 'In_Values' | 'In_Values_List_Items' | 'Expr' | 'ForeignKeyClause_Item' | 'ForeignKeyClause_Item_On_Action' | 'FrameSpec_Type' | 'FrameSpec_Inner' | 'FrameSpec_Between_Item' | 'FrameSpec_Exclude' | 'InsertStmt_Method' | 'InsertStmt_Data' | 'PragmaStmt_Value' | 'PragmaValue' | 'ReturningClause_Item' | 'SqlStmtList_Item' | 'SqlStmt_Item' | 'UpdateOr';

interface FragmentRule<K extends FragmentParserKeys> extends Parser<Fragment<K>, Ctx> {
  setParser(parser: Parser<K extends NonCompleteFragments ? Fragment<K> : Complete<Fragment<K>>, Ctx>): void;
}

function fragmentParser<K extends FragmentParserKeys>(kind: K): FragmentRule<K> {
  if (FragmentParserInternal[kind] === undefined) {
    FragmentParserInternal[kind] = c.rule(kind) as any;
  }
  return FragmentParserInternal[kind] as any;
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
    [KeywordParser.WITH, c.maybe(fragmentParser('StmtWith_Recursive')), nonEmptyCommaSingleList(nodeParser('CommonTableExpression')), WhitespaceLikeParser],
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
      key('unique', c.maybe(fragmentParser('Unique'))),
      key('whitespaceBeforeIndexKeyword', WhitespaceLikeParser),
      key('indexKeyword', KeywordParser.INDEX),
      key('ifNotExists', c.maybe(fragmentParser('IfNotExists'))),
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
      key('temp', c.maybe(fragmentParser('Temp'))),
      key('whitespaceBeforeTableKeyword', WhitespaceLikeParser),
      key('tableKeyword', KeywordParser.TABLE),
      key('ifNotExists', c.maybe(fragmentParser('IfNotExists'))),
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

nodeParser('CreateTriggerStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('createKeyword', KeywordParser.CREATE),
      key('temp', c.maybe(fragmentParser('Temp'))),
      key('whitespaceBeforeTriggerKeyword', WhitespaceLikeParser),
      key('triggerKeyword', KeywordParser.TRIGGER),
      key('ifNotExists', c.maybe(fragmentParser('IfNotExists'))),
      key('whitespaceBeforeTrigger', WhitespaceLikeParser),
      key('trigger', fragmentParser('SchemaTrigger')),
      key('modifier', c.maybe(fragmentParser('CreateTriggerStmt_Modifier'))),
      key('action', fragmentParser('CreateTriggerStmt_Action')),
      key('whitespaceBeforeOnKeyword', WhitespaceLikeParser),
      key('onKeyword', KeywordParser.ON),
      key('whitespaceBeforeTableName', WhitespaceLikeParser),
      key('tableName', IdentifierParser),
      key('forEachRow', c.maybe(fragmentParser('CreateTriggerStmt_ForEachRow'))),
      key('when', c.maybe(fragmentParser('CreateTriggerStmt_When'))),
      key('whitespaceBeforeBeginKeyword', WhitespaceLikeParser),
      key('beginKeyword', KeywordParser.BEGIN),
      key('stmts', nonEmptyList(fragmentParser('CreateTriggerStmt_Stmt'))),
      key('whitespaceBeforeEndKeyword', WhitespaceLikeParser),
      key('endKeyword', KeywordParser.END)
    )
  )
);

fragmentParser('SchemaTrigger').setParser(
  c.applyPipe([c.maybe(fragmentParser('SchemaItem_Schema')), IdentifierParser], ([schema, trigger]) => ({ schema, trigger }))
);

fragmentParser('CreateTriggerStmt_Modifier').setParser(
  c.oneOf(
    fragmentParser('CreateTriggerStmt_Modifier_Before'),
    fragmentParser('CreateTriggerStmt_Modifier_After'),
    fragmentParser('CreateTriggerStmt_Modifier_InsteadOf')
  )
);

fragmentParser('CreateTriggerStmt_Modifier_Before').setParser(
  c.keyed({ variant: 'Before' }, (key) => c.keyedPipe(key('whitespaceBeforeBeforeKeyword', WhitespaceLikeParser), key('beforeKeyword', KeywordParser.BEFORE)))
);

fragmentParser('CreateTriggerStmt_Modifier_After').setParser(
  c.keyed({ variant: 'After' }, (key) => c.keyedPipe(key('whitespaceBeforeAfterKeyword', WhitespaceLikeParser), key('afterKeyword', KeywordParser.AFTER)))
);

fragmentParser('CreateTriggerStmt_Modifier_InsteadOf').setParser(
  c.keyed({ variant: 'InsteadOf' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeInsteadKeyword', WhitespaceLikeParser),
      key('insteadKeyword', KeywordParser.INSTEAD),
      key('whitespaceBeforeOfKeyword', WhitespaceLikeParser),
      key('ofKeyword', KeywordParser.OF)
    )
  )
);

fragmentParser('CreateTriggerStmt_Action').setParser(
  c.oneOf(
    fragmentParser('CreateTriggerStmt_Action_Delete'),
    fragmentParser('CreateTriggerStmt_Action_Insert'),
    fragmentParser('CreateTriggerStmt_Action_Update')
  )
);

fragmentParser('CreateTriggerStmt_Action_Delete').setParser(
  c.keyed({ variant: 'Delete' }, (key) => c.keyedPipe(key('whitespaceBeforeDeleteKeyword', WhitespaceLikeParser), key('deleteKeyword', KeywordParser.DELETE)))
);

fragmentParser('CreateTriggerStmt_Action_Insert').setParser(
  c.keyed({ variant: 'Insert' }, (key) => c.keyedPipe(key('whitespaceBeforeInsertKeyword', WhitespaceLikeParser), key('insertKeyword', KeywordParser.INSERT)))
);

fragmentParser('CreateTriggerStmt_Action_Update').setParser(
  c.keyed({ variant: 'Update' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeUpdateKeyword', WhitespaceLikeParser),
      key('updateKeyword', KeywordParser.UPDATE),
      key('of', c.maybe(fragmentParser('CreateTriggerStmt_Action_Update_Of')))
    )
  )
);

fragmentParser('CreateTriggerStmt_Action_Update_Of').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeOfKeyword', WhitespaceLikeParser),
      key('ofKeyword', KeywordParser.OF),
      key('columnNames', nonEmptyCommaSingleList(IdentifierParser))
    )
  )
);

fragmentParser('CreateTriggerStmt_ForEachRow').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeForKeyword', WhitespaceLikeParser),
      key('forKeyword', KeywordParser.FOR),
      key('whitespaceBeforeEachKeyword', WhitespaceLikeParser),
      key('eachKeyword', KeywordParser.EACH),
      key('whitespaceBeforeRowKeyword', WhitespaceLikeParser),
      key('rowKeyword', KeywordParser.ROW)
    )
  )
);

fragmentParser('CreateTriggerStmt_When').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeWhenKeyword', WhitespaceLikeParser),
      key('whenKeyword', KeywordParser.WHEN),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser)
    )
  )
);

fragmentParser('CreateTriggerStmt_Stmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeStmt', WhitespaceLikeParser),
      key('stmt', c.oneOf(nodeParser('UpdateStmt'), nodeParser('InsertStmt'), nodeParser('DeleteStmt'), nodeParser('SelectStmt'))),
      key('whitespaceBeforeSemicolon', WhitespaceLikeParser),
      semicolonParser
    )
  )
);

nodeParser('CreateViewStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('createKeyword', KeywordParser.CREATE),
      key('temp', fragmentParser('Temp')),
      key('whitespaceBeforeViewKeyword', WhitespaceLikeParser),
      key('viewKeyword', KeywordParser.VIEW),
      key('ifNotExists', c.maybe(fragmentParser('IfNotExists'))),
      key('whitespaceBeforeView', WhitespaceLikeParser),
      key('view', fragmentParser('SchemaView')),
      key('columnNames', c.maybe(fragmentParser('ColumnNames'))),
      key('whitespaceBeforeAsKeyword', MaybeWhitespaceLikeParser),
      key('asKeyword', KeywordParser.AS),
      key('whitespaceBeforeAsSelectStmt', WhitespaceLikeParser),
      key('asSelectStmt', nodeParser('SelectStmt'))
    )
  )
);

fragmentParser('SchemaView').setParser(c.applyPipe([c.maybe(fragmentParser('SchemaItem_Schema')), IdentifierParser], ([schema, view]) => ({ schema, view })));

nodeParser('CreateVirtualTableStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('createKeyword', KeywordParser.CREATE),
      key('whitespaceBeforeVirtualKeyword', WhitespaceLikeParser),
      key('virtualKeyword', KeywordParser.VIRTUAL),
      key('whitespaceBeforeTableKeyword', WhitespaceLikeParser),
      key('tableKeyword', KeywordParser.TABLE),
      key('ifNotExists', c.maybe(fragmentParser('IfNotExists'))),
      key('whitespaceBeforeTable', WhitespaceLikeParser),
      key('table', fragmentParser('SchemaTable')),
      key('whitespaceBeforeUsingKeyword', WhitespaceLikeParser),
      key('usingKeyword', KeywordParser.USING),
      key('whitespaceBeforeModuleName', WhitespaceLikeParser),
      key('moduleName', IdentifierParser),
      key('moduleArguments', c.maybe(fragmentParser('ModuleArguments')))
    )
  )
);

fragmentParser('ModuleArguments').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('moduleArguments', nonEmptyCommaSingleList(IdentifierParser)),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

nodeParser('CteTableName').setParser(
  c.keyed((key) => c.keyedPipe(key('tableName', IdentifierParser), key('columnNames', c.maybe(fragmentParser('ColumnNames')))))
);

nodeParser('DeleteStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('with', fragmentParser('StmtWith')),
      key('deleteKeyword', KeywordParser.DELETE),
      key('whitespaceBeforeFromKeyword', WhitespaceLikeParser),
      key('fromKeyword', KeywordParser.FROM),
      key('whitespaceBeforeQualifiedTableName', WhitespaceLikeParser),
      key('qualifiedTableName', nodeParser('QualifiedTableName')),
      key('where', c.maybe(fragmentParser('Where'))),
      key('returningClause', c.maybe(fragmentParser('ReturningClause')))
    )
  )
);

fragmentParser('ReturningClause').setParser(
  c.applyPipe([WhitespaceLikeParser, nodeParser('ReturningClause')], ([whitespaceBeforeReturningClause, returningClause]) => ({
    whitespaceBeforeReturningClause,
    returningClause,
  }))
);

nodeParser('DeleteStmtLimited').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('with', c.maybe(fragmentParser('StmtWith'))),
      key('deleteKeyword', KeywordParser.DELETE),
      key('whitespaceBeforeFromKeyword', WhitespaceLikeParser),
      key('fromKeyword', KeywordParser.FROM),
      key('whitespaceBeforeQualifiedTableName', WhitespaceLikeParser),
      key('qualifiedTableName', nodeParser('QualifiedTableName')),
      key('where', c.maybe(fragmentParser('Where'))),
      key('returningClause', c.maybe(fragmentParser('ReturningClause'))),
      key('orderBy', c.maybe(fragmentParser('OrderBy'))),
      key('limit', c.maybe(fragmentParser('Limit')))
    )
  )
);

nodeParser('DetachStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('detachKeyword', KeywordParser.DETACH),
      key('database', c.maybe(fragmentParser('DetachStmt_Database'))),
      key('whitespaceBeforeSchemeName', WhitespaceLikeParser),
      key('schemeName', IdentifierParser)
    )
  )
);

fragmentParser('DetachStmt_Database').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeDatabaseKeyword', WhitespaceLikeParser), key('databaseKeyword', KeywordParser.DATABASE)))
);

nodeParser('DropIndexStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('dropKeyword', KeywordParser.DROP),
      key('whitespaceBeforeIndexKeyword', WhitespaceLikeParser),
      key('indexKeyword', KeywordParser.INDEX),
      key('ifExists', c.maybe(fragmentParser('IfExists'))),
      key('whitespaceBeforeIndex', WhitespaceLikeParser),
      key('index', fragmentParser('SchemaIndex'))
    )
  )
);

fragmentParser('IfExists').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeIfKeyword', WhitespaceLikeParser),
      key('ifKeyword', KeywordParser.IF),
      key('whitespaceBeforeExistsKeyword', WhitespaceLikeParser),
      key('existsKeyword', KeywordParser.EXISTS)
    )
  )
);

nodeParser('DropTableStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('dropKeyword', KeywordParser.DROP),
      key('whitespaceBeforeTableKeyword', WhitespaceLikeParser),
      key('tableKeyword', KeywordParser.TABLE),
      key('ifExists', c.maybe(fragmentParser('IfExists'))),
      key('whitespaceBeforeTable', WhitespaceLikeParser),
      key('table', fragmentParser('SchemaTable'))
    )
  )
);

nodeParser('DropTriggerStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('dropKeyword', KeywordParser.DROP),
      key('whitespaceBeforeTriggerKeyword', WhitespaceLikeParser),
      key('triggerKeyword', KeywordParser.TRIGGER),
      key('ifExists', c.maybe(fragmentParser('IfExists'))),
      key('whitespaceBeforeTrigger', WhitespaceLikeParser),
      key('trigger', fragmentParser('SchemaTrigger'))
    )
  )
);

nodeParser('DropViewStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('dropKeyword', KeywordParser.DROP),
      key('whitespaceBeforeViewKeyword', WhitespaceLikeParser),
      key('viewKeyword', KeywordParser.VIEW),
      key('ifExists', c.maybe(fragmentParser('IfExists'))),
      key('whitespaceBeforeView', WhitespaceLikeParser),
      key('view', fragmentParser('SchemaView'))
    )
  )
);

// Expr

fragmentParser('ExprBase').setParser(
  c.oneOf(
    fragmentParser('LiteralValue'),
    nodeParser('Identifier'),
    nodeParser('BitwiseNegation'),
    nodeParser('Plus'),
    nodeParser('Minus'),
    nodeParser('BindParameter'),
    nodeParser('Column'),
    nodeParser('Select'),
    nodeParser('FunctionInvocation'),
    nodeParser('Parenthesis'),
    nodeParser('CastAs'),
    nodeParser('Case'),
    nodeParser('RaiseFunction')
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

nodeParser('NumericLiteral').setParser(
  c.oneOf(fragmentParser('NumericLiteral_Integer'), fragmentParser('NumericLiteral_Float'), fragmentParser('NumericLiteral_Hex'))
);

fragmentParser('NumericLiteral_Integer').setParser(
  c.applyPipe([integerParser, c.maybe(dotParser), c.maybe(fragmentParser('Exponent'))], ([raw, _dot, exponent]) => {
    return {
      variant: 'Integer',
      interger: parseInt(raw, 10),
      exponent,
    };
  })
);

fragmentParser('Exponent').setParser(
  c.apply(exponentiationSuffixRawParser, (raw) => {
    return { raw, value: parseInt(raw.slice(1)) };
  })
);

fragmentParser('NumericLiteral_Float').setParser(
  c.applyPipe([c.maybe(integerParser), dotParser, integerParser, c.maybe(fragmentParser('Exponent'))], ([integral, _dot, fractional, exponent]) => {
    const raw = [integral ?? '', _dot, fractional, exponent?.raw ?? ''].join('');
    return {
      variant: 'Float',
      integral: mapIfExist(integral, (v) => parseInt(v, 10)),
      fractional: parseInt(fractional, 10),
      exponent,
      value: parseFloat(raw),
    };
  })
);

fragmentParser('NumericLiteral_Hex').setParser(
  c.apply(hexParser, (raw) => ({
    variant: 'Hex',
    xCase: raw[1] === 'x' ? 'lowercase' : 'uppercase',
    value: parseInt(raw.slice(2), 16),
  }))
);

nodeParser('StringLiteral').setParser(
  c.apply(c.manyBetween(singleQuoteParser, c.oneOf(notSingleQuoteParser, doubleSingleQuoteParser), singleQuoteParser), ([_open, items, _close]) => ({
    content: items.map((v) => (v === DOUBLE_SINGLE_QUOTE ? SINGLE_QUOTE : v)).join(''),
  }))
);

nodeParser('BlobLiteral').setParser(
  c.apply(blobParser, (raw) => ({
    xCase: raw[0] === 'x' ? 'lowercase' : 'uppercase',
    content: raw.slice(2, -1),
  }))
);

nodeParser('Null').setParser(c.apply(KeywordParser.NULL, (nullKeyword) => ({ nullKeyword })));

nodeParser('True').setParser(c.apply(KeywordParser.TRUE, (trueKeyword) => ({ trueKeyword })));

nodeParser('False').setParser(c.apply(KeywordParser.FALSE, (falseKeyword) => ({ falseKeyword })));

nodeParser('CurrentTime').setParser(c.apply(KeywordParser.CURRENT_TIME, (currentTimeKeyword) => ({ currentTimeKeyword })));

nodeParser('CurrentDate').setParser(c.apply(KeywordParser.CURRENT_DATE, (currentDateKeyword) => ({ currentDateKeyword })));

nodeParser('CurrentTimestamp').setParser(c.apply(KeywordParser.CURRENT_TIMESTAMP, (currentTimestampKeyword) => ({ currentTimestampKeyword })));

nodeParser('Identifier').setParser(
  c.oneOf(
    fragmentParser('Identifier_Basic'),
    fragmentParser('Identifier_Brackets'),
    fragmentParser('Identifier_DoubleQuote'),
    fragmentParser('Identifier_Backtick')
  )
);

fragmentParser('Identifier_Basic').setParser(
  c.apply(
    c.transform(rawIdentifierParser, (result, parentPath) => {
      if (result.type === 'Failure') {
        return result;
      }
      if (KEYWORDS.includes(result.value.toUpperCase() as any)) {
        return ParseFailure(result.start, [...parentPath, 'rawIdentifier'], `${result.value} is not a valid identifier because it's a keywork.`);
      }
      return result;
    }),
    (val) => ({ variant: 'Basic', name: val })
  )
);

fragmentParser('Identifier_Brackets').setParser(
  c.apply(c.regexp<Ctx>(/^\[.+\]/g), (val) => ({
    variant: 'Brackets',
    name: val.slice(1, -1),
  }))
);

fragmentParser('Identifier_DoubleQuote').setParser(
  c.apply(c.manyBetween(doubleQuoteParser, c.oneOf(notDoubleQuoteParser, doubleDoubleQuoteParser), doubleQuoteParser), ([_open, items, _close]) => ({
    variant: 'DoubleQuote',
    name: items.map((v) => (v === DOUBLE_DOUBLE_QUOTE ? DOUBLE_QUOTE : v)).join(''),
  }))
);

fragmentParser('Identifier_Backtick').setParser(
  c.apply(c.manyBetween(backtickParser, c.oneOf(notBacktickParser, doubleBacktickParser), backtickParser), ([_open, items, _close]) => ({
    variant: 'Backtick',
    name: items.map((v) => (v === DOUBLE_BACKTICK ? BACKTICK : v)).join(''),
  }))
);

nodeParser('BitwiseNegation').setParser(
  c.applyPipe(
    [tildeParser, MaybeWhitespaceLikeParser, fragmentParser('ExprBase')],
    ([_tilde, whitespaceBeforeExpr, expr]): Complete<NodeData['BitwiseNegation']> => ({ whitespaceBeforeExpr, expr })
  )
);

nodeParser('Plus').setParser(
  c.applyPipe([plusParser, MaybeWhitespaceLikeParser, fragmentParser('ExprBase')], ([_plus, whitespaceBeforeExpr, expr]) => ({ whitespaceBeforeExpr, expr }))
);

nodeParser('Minus').setParser(
  c.applyPipe([dashParser, MaybeWhitespaceLikeParser, fragmentParser('ExprBase')], ([_minus, whitespaceBeforeExpr, expr]) => ({ whitespaceBeforeExpr, expr }))
);

nodeParser('BindParameter').setParser(
  c.oneOf(
    fragmentParser('BindParameter_Indexed'),
    fragmentParser('BindParameter_Numbered'),
    fragmentParser('BindParameter_AtNamed'),
    fragmentParser('BindParameter_ColonNamed'),
    fragmentParser('BindParameter_DollarNamed')
  )
);

fragmentParser('BindParameter_Indexed').setParser(c.apply(questionMarkParser, (_raw) => ({ variant: 'Indexed' })));

fragmentParser('BindParameter_Numbered').setParser(
  c.apply(c.pipe(questionMarkParser, integerParser), ([_questionMark, rawNum]) => ({
    variant: 'Numbered',
    number: parseInt(rawNum, 10),
  }))
);

fragmentParser('BindParameter_AtNamed').setParser(
  c.apply(c.pipe(atParser, fragmentParser('ParameterName')), ([_at, { name, suffix }]) => ({
    variant: 'AtNamed',
    name,
    suffix,
  }))
);

fragmentParser('ParameterName').setParser(
  c.apply(c.pipe(parameterRawNameParser, c.many(c.pipe(colonPairParser, parameterRawNameParser)), c.maybe(parameterSuffixParser)), ([name, items, suffix]) => ({
    name: name + items.map(([colonPair, param]) => colonPair + param).join(''),
    suffix: mapIfExist(suffix, (v) => v.slice(1, -1)),
  }))
);

fragmentParser('BindParameter_ColonNamed').setParser(
  c.apply(c.pipe(colonParser, fragmentParser('ParameterName')), ([_colon, { name, suffix }]) => {
    return { variant: 'ColonNamed', name, suffix };
  })
);

fragmentParser('BindParameter_DollarNamed').setParser(
  c.apply(c.pipe(dollarParser, fragmentParser('ParameterName')), ([_dollar, { name, suffix }]) => ({
    variant: 'DollarNamed',
    name,
    suffix,
  }))
);

nodeParser('Column').setParser(c.keyed((key) => c.keyedPipe(key('table', c.maybe(fragmentParser('Column_Table'))), key('columnName', IdentifierParser))));

fragmentParser('Column_Table').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('table', fragmentParser('SchemaTable')),
      key('whitespaceBeforeDot', MaybeWhitespaceLikeParser),
      dotParser,
      key('whitespaceAfter', MaybeWhitespaceLikeParser)
    )
  )
);

nodeParser('Select').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('exists', fragmentParser('Select_Exists')),
      key('whitespaceBeforeSelectStmt', WhitespaceLikeParser),
      key('selectStmt', nodeParser('SelectStmt')),
      key('whitespaceBeforeCloseParent', WhitespaceLikeParser)
    )
  )
);

fragmentParser('Select_Exists').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('not', fragmentParser('Select_Exists_Not')),
      key('existsKeyword', KeywordParser.EXISTS),
      key('whitespaceAfterExistsKeyword', WhitespaceLikeParser)
    )
  )
);

fragmentParser('Select_Exists_Not').setParser(
  c.keyed((key) => c.keyedPipe(key('notKeyword', KeywordParser.NOT), key('whitespaceAfterNotKeyword', WhitespaceLikeParser)))
);

nodeParser('FunctionInvocation').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('functionName', IdentifierParser),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('parameters', c.maybe(fragmentParser('FunctionInvocation_Parameters'))),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser,
      key('filterClause', c.maybe(fragmentParser('FilterClauseWithWhitespace'))),
      key('overClause', c.maybe(fragmentParser('OverClauseWithWhitespace')))
    )
  )
);

fragmentParser('FunctionInvocation_Parameters').setParser(
  c.oneOf(fragmentParser('FunctionInvocation_Parameters_Star'), fragmentParser('FunctionInvocation_Parameters_Exprs'))
);

fragmentParser('FunctionInvocation_Parameters_Star').setParser(
  c.keyed({ variant: 'Star' }, (key) => c.keyedPipe(key('whitespaceBeforeStar', MaybeWhitespaceLikeParser), starParser))
);

fragmentParser('FunctionInvocation_Parameters_Exprs').setParser(
  c.keyed({ variant: 'Exprs' }, (key) =>
    c.keyedPipe(key('distinct', fragmentParser('FunctionInvocation_Parameters_Distinct')), key('exprs', nonEmptyCommaSingleList(ExprParser)))
  )
);

fragmentParser('FunctionInvocation_Parameters_Distinct').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeDistinctKeyword', WhitespaceLikeParser), key('distinctKeyword', KeywordParser.DISTINCT)))
);

fragmentParser('OverClauseWithWhitespace').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeOverClause', WhitespaceLikeParser), key('overClause', nodeParser('OverClause'))))
);

nodeParser('Parenthesis').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      openParentParser,
      key('exprs', nonEmptyCommaSingleList(ExprParser)),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

nodeParser('CastAs').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('castKeyword', KeywordParser.CAST),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('whitespaceBeforeExpr', MaybeWhitespaceLikeParser),
      key('expr', ExprParser),
      key('whitespaceBeforeAsKeyword', WhitespaceLikeParser),
      key('asKeyword', KeywordParser.AS),
      key('whitespaceBeforeTypeName', WhitespaceLikeParser),
      key('typeName', nodeParser('TypeName')),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

nodeParser('Case').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('caseKeyword', KeywordParser.CASE),
      key('expr', c.maybe(fragmentParser('Case_Expr'))),
      key('cases', nonEmptyList(fragmentParser('Case_Item'))),
      key('else', c.maybe(fragmentParser('Case_Else'))),
      key('whitespaceBeforeEndKeyword', WhitespaceLikeParser),
      key('endKeyword', KeywordParser.END)
    )
  )
);

fragmentParser('Case_Expr').setParser(c.keyed((key) => c.keyedPipe(key('whitespaceBeforeExpr', WhitespaceLikeParser), key('expr', ExprParser))));

fragmentParser('Case_Item').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeWhenKeyword', WhitespaceLikeParser),
      key('whenKeyword', KeywordParser.WHEN),
      key('whitespaceBeforeWhenExpr', WhitespaceLikeParser),
      key('whenExpr', ExprParser),
      key('whitespaceBeforeThenKeyword', WhitespaceLikeParser),
      key('thenKeyword', KeywordParser.THEN),
      key('whitespaceBeforeThenExpr', WhitespaceLikeParser),
      key('thenExpr', ExprParser)
    )
  )
);

fragmentParser('Case_Else').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeElseKeyword', WhitespaceLikeParser),
      key('elseKeyword', KeywordParser.ELSE),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser)
    )
  )
);

fragmentParser('ExprChain_Item').setParser(
  c.oneOf<Fragment<'ExprChain_Item'>, Ctx>(
    fragmentParser('ExprChain_Item_Collate'),
    fragmentParser('ExprChain_Item_Concatenate'),
    fragmentParser('ExprChain_Item_Multiply'),
    fragmentParser('ExprChain_Item_Divide'),
    fragmentParser('ExprChain_Item_Modulo'),
    fragmentParser('ExprChain_Item_Add'),
    fragmentParser('ExprChain_Item_Subtract'),
    fragmentParser('ExprChain_Item_BitwiseAnd'),
    fragmentParser('ExprChain_Item_BitwiseOr'),
    fragmentParser('ExprChain_Item_BitwiseShiftLeft'),
    fragmentParser('ExprChain_Item_BitwiseShiftRight'),
    fragmentParser('ExprChain_Item_Escape'),
    fragmentParser('ExprChain_Item_GreaterThan'),
    fragmentParser('ExprChain_Item_LowerThan'),
    fragmentParser('ExprChain_Item_GreaterOrEqualThan'),
    fragmentParser('ExprChain_Item_LowerOrEqualThan'),
    fragmentParser('ExprChain_Item_Equal'),
    fragmentParser('ExprChain_Item_Different'),
    fragmentParser('ExprChain_Item_Is'),
    fragmentParser('ExprChain_Item_IsNot'),
    fragmentParser('ExprChain_Item_Between'),
    fragmentParser('ExprChain_Item_In'),
    fragmentParser('ExprChain_Item_Match'),
    fragmentParser('ExprChain_Item_Like'),
    fragmentParser('ExprChain_Item_Regexp'),
    fragmentParser('ExprChain_Item_Glob'),
    fragmentParser('ExprChain_Item_Isnull'),
    fragmentParser('ExprChain_Item_Notnull'),
    fragmentParser('ExprChain_Item_NotNull'),
    fragmentParser('ExprChain_Item_Not'),
    fragmentParser('ExprChain_Item_And'),
    fragmentParser('ExprChain_Item_Or')
  )
);

fragmentParser('ExprChain_Item_Collate').setParser(
  c.keyed({ variant: 'Collate' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeCollateKeyword', WhitespaceLikeParser),
      key('collateKeyword', KeywordParser.COLLATE),
      key('whitespaceBeforeCollationName', MaybeWhitespaceLikeParser),
      key('collationName', IdentifierParser)
    )
  )
);

fragmentParser('ExprChain_Item_Concatenate').setParser(
  c.keyed({ variant: 'Concatenate' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      concatenateParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Multiply').setParser(
  c.keyed({ variant: 'Multiply' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      starParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Divide').setParser(
  c.keyed({ variant: 'Divide' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      slashParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Modulo').setParser(
  c.keyed({ variant: 'Modulo' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      percentParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Add').setParser(
  c.keyed({ variant: 'Add' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      plusParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Subtract').setParser(
  c.keyed({ variant: 'Subtract' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      dashParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_BitwiseAnd').setParser(
  c.keyed({ variant: 'BitwiseAnd' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      ampersandParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_BitwiseOr').setParser(
  c.keyed({ variant: 'BitwiseOr' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      pipeParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_BitwiseShiftLeft').setParser(
  c.keyed({ variant: 'BitwiseShiftLeft' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      bitwiseShiftLeftParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_BitwiseShiftRight').setParser(
  c.keyed({ variant: 'BitwiseShiftRight' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      bitwiseShiftRightParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_GreaterThan').setParser(
  c.keyed({ variant: 'GreaterThan' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      greaterThanParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_LowerThan').setParser(
  c.keyed({ variant: 'LowerThan' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      lowerThanParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_GreaterOrEqualThan').setParser(
  c.keyed({ variant: 'GreaterOrEqualThan' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      greaterThanOrEqualParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_LowerOrEqualThan').setParser(
  c.keyed({ variant: 'LowerOrEqualThan' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      lowerThanOrEqualParser,
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Equal').setParser(
  c.keyed({ variant: 'Equal' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      key('operator', c.oneOf(equalParser, doubleEqualParser)),
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Different').setParser(
  c.keyed({ variant: 'Different' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOperator', MaybeWhitespaceLikeParser),
      key('operator', c.oneOf(differentParser, notEqualParser)),
      key('whitespaceBeforeRightExpr', MaybeWhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Is').setParser(
  c.keyed({ variant: 'Is' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeIsKeyword', WhitespaceLikeParser),
      key('isKeyword', KeywordParser.IS),
      key('whitespaceBeforeRightExpr', WhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_IsNot').setParser(
  c.keyed({ variant: 'IsNot' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeIsKeyword', WhitespaceLikeParser),
      key('isKeyword', KeywordParser.IS),
      key('whitespaceBeforeNotKeyword', WhitespaceLikeParser),
      key('notKeyword', KeywordParser.NOT),
      key('whitespaceBeforeRightExpr', WhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Between').setParser(
  c.keyed({ variant: 'Between', and: undefined }, (key) =>
    c.keyedPipe(
      key('not', c.maybe(fragmentParser('Not'))),
      key('whitespaceBeforeBetweenKeyword', WhitespaceLikeParser),
      key('betweenKeyword', KeywordParser.BETWEEN),
      key('whitespaceBeforeBetweenExpr', WhitespaceLikeParser),
      key('betweenExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('Not').setParser(c.keyed((key) => c.keyedPipe(key('whitespaceBeforeNotKeyword', WhitespaceLikeParser), key('notKeyword', KeywordParser.NOT))));

fragmentParser('ExprChain_Item_In').setParser(
  c.keyed({ variant: 'In' }, (key) =>
    c.keyedPipe(
      key('not', c.maybe(fragmentParser('Not'))),
      key('whitespaceBeforeInKeyword', WhitespaceLikeParser),
      key('inKeyword', KeywordParser.IN),
      key('values', fragmentParser('In_Values'))
    )
  )
);

fragmentParser('In_Values').setParser(
  c.oneOf(fragmentParser('In_Values_List'), fragmentParser('In_Values_TableName'), fragmentParser('In_Value_TableFunctionInvocation'))
);

fragmentParser('In_Values_List').setParser(
  c.keyed({ variant: 'List' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('items', c.maybe(fragmentParser('In_Values_List_Items'))),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('In_Values_List_Items').setParser(c.oneOf(fragmentParser('In_Values_List_Items_Select'), fragmentParser('In_Values_List_Items_Exprs')));

fragmentParser('In_Values_List_Items_Select').setParser(
  c.keyed({ variant: 'Select' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeSelectStmt', MaybeWhitespaceLikeParser), key('selectStmt', nodeParser('SelectStmt')))
  )
);

fragmentParser('In_Values_List_Items_Exprs').setParser(c.apply(nonEmptyCommaSingleList(ExprParser), (exprs) => ({ variant: 'Exprs', exprs })));

fragmentParser('In_Values_TableName').setParser(
  c.keyed({ variant: 'TableName' }, (key) => c.keyedPipe(key('whitespaceBeforeTable', MaybeWhitespaceLikeParser), key('table', fragmentParser('SchemaTable'))))
);

fragmentParser('In_Value_TableFunctionInvocation').setParser(
  c.keyed({ variant: 'TableFunctionInvocation' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeFunction', WhitespaceLikeParser),
      key('function', fragmentParser('SchemaFunction')),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('parameters', nonEmptyCommaSingleList(ExprParser)),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('SchemaFunction').setParser(
  c.applyPipe([c.maybe(fragmentParser('SchemaItem_Schema')), IdentifierParser], ([schema, functionName]) => ({ schema, function: functionName }))
);

fragmentParser('ExprChain_Item_Like').setParser(
  c.keyed({ variant: 'Like', escape: undefined }, (key) =>
    c.keyedPipe(
      key('not', c.maybe(fragmentParser('Not'))),
      key('whitespaceBeforeLikeKeyword', WhitespaceLikeParser),
      key('likeKeyword', KeywordParser.LIKE),
      key('whitespaceBeforeRightExpr', WhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Escape').setParser(
  c.keyed({ variant: 'Escape' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeEscapeKeyword', WhitespaceLikeParser),
      key('escapeKeyword', KeywordParser.ESCAPE),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Glob').setParser(
  c.keyed({ variant: 'Glob' }, (key) =>
    c.keyedPipe(
      key('not', c.maybe(fragmentParser('Not'))),
      key('whitespaceBeforeGlobKeyword', WhitespaceLikeParser),
      key('globKeyword', KeywordParser.GLOB),
      key('whitespaceBeforeRightExpr', WhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Regexp').setParser(
  c.keyed({ variant: 'Regexp' }, (key) =>
    c.keyedPipe(
      key('not', c.maybe(fragmentParser('Not'))),
      key('whitespaceBeforeRegexpKeyword', WhitespaceLikeParser),
      key('regexpKeyword', KeywordParser.REGEXP),
      key('whitespaceBeforeRightExpr', WhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Match').setParser(
  c.keyed({ variant: 'Match' }, (key) =>
    c.keyedPipe(
      key('not', c.maybe(fragmentParser('Not'))),
      key('whitespaceBeforeMatchKeyword', WhitespaceLikeParser),
      key('matchKeyword', KeywordParser.MATCH),
      key('whitespaceBeforeRightExpr', WhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Isnull').setParser(
  c.keyed({ variant: 'Isnull' }, (key) => c.keyedPipe(key('whitespaceBeforeIsnullKeyword', WhitespaceLikeParser), key('isnullKeyword', KeywordParser.ISNULL)))
);

fragmentParser('ExprChain_Item_Notnull').setParser(
  c.keyed({ variant: 'Notnull' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeNotnullKeyword', WhitespaceLikeParser), key('notnullKeyword', KeywordParser.NOTNULL))
  )
);

fragmentParser('ExprChain_Item_NotNull').setParser(
  c.keyed({ variant: 'NotNull' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeNotKeyword', WhitespaceLikeParser),
      key('notKeyword', KeywordParser.NOT),
      key('whitespaceBeforeNullKeyword', WhitespaceLikeParser),
      key('nullKeyword', KeywordParser.NULL)
    )
  )
);

fragmentParser('ExprChain_Item_Not').setParser(
  c.keyed({ variant: 'Not' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeNotKeyword', WhitespaceLikeParser),
      key('notKeyword', KeywordParser.NOT),
      key('whitespaceBeforeRightExpr', WhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_And').setParser(
  c.keyed({ variant: 'And' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeAndKeyword', WhitespaceLikeParser),
      key('andKeyword', KeywordParser.AND),
      key('whitespaceBeforeRightExpr', WhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

fragmentParser('ExprChain_Item_Or').setParser(
  c.keyed({ variant: 'Or' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOrKeyword', WhitespaceLikeParser),
      key('orKeyword', KeywordParser.OR),
      key('whitespaceBeforeRightExpr', WhitespaceLikeParser),
      key('rightExpr', fragmentParser('ExprBase'))
    )
  )
);

type ExprPart =
  | { variant: 'Expr'; expr: Fragment<'Expr'>; _result: ParseResultSuccess<any> }
  | (Fragment<'ExprChain_Item'> & { _result: ParseResultSuccess<any> });

fragmentParser('Expr').setParser(
  c.transformSuccess(
    c.pipeResults(fragmentParser('ExprBase'), c.manyResults(fragmentParser('ExprChain_Item'), { allowEmpty: true })),
    (result, parentPath, ctx) => {
      const [firstRes, itemsRes] = result.value;
      const items = itemsRes.value.map((r): ExprPart => ({ ...r.value, _result: r }));
      const first = firstRes.value;
      const parts: Array<ExprPart> = [{ variant: 'Expr', expr: first, _result: firstRes }, ...items];
      const isResolved = () => parts.length === 1 && parts[0].variant === 'Expr';
      while (isResolved() === false) {
        const partToMerge = findHighestPrecedencePart(parts);
        const partToMergeIndex = parts.indexOf(partToMerge);
        if (partToMergeIndex === 0) {
          return ParseFailure(partToMerge._result.start, parentPath, 'First item has highest precedence ?');
        }
        const mergeWith = parts[partToMergeIndex - 1];
        const merged = mergeParts(mergeWith, partToMerge, parentPath, ctx);
        if (merged.type === 'Failure') {
          return merged;
        }
        parts.splice(partToMergeIndex - 1, 2, merged.part);
      }
      if (parts.length === 1 && parts[0].variant === 'Expr') {
        return ParseSuccess(result.start, result.rest, parts[0].expr);
      }
      throw new Error('Oops');
    }
  )
);

nodeParser('FactoredSelectStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('with', c.maybe(fragmentParser('StmtWith'))),
      key('firstSelect', nodeParser('SelectCore')),
      key('compoundSelects', c.many(fragmentParser('FactoredSelectStmt_CompoundSelectsItem'))),
      key('orderBy', c.maybe(fragmentParser('OrderBy'))),
      key('limit', c.maybe(fragmentParser('Limit')))
    )
  )
);

fragmentParser('FactoredSelectStmt_CompoundSelectsItem').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeCompoundOperator', WhitespaceLikeParser),
      key('compoundOperator', nodeParser('CompoundOperator')),
      key('whitespaceBeforeSelect', WhitespaceLikeParser),
      key('select', nodeParser('SelectCore'))
    )
  )
);

nodeParser('FilterClause').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('filterKeyword', KeywordParser.FILTER),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('whitespaceBeforeWhereKeyword', MaybeWhitespaceLikeParser),
      key('whereKeyword', KeywordParser.WHERE),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

nodeParser('ForeignKeyClause').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('referencesKeyword', KeywordParser.REFERENCES),
      key('whitespaceBeforeForeignTable', WhitespaceLikeParser),
      key('foreignTable', IdentifierParser),
      key('columnNames', c.maybe(fragmentParser('ColumnNames'))),
      key('items', c.many(fragmentParser('ForeignKeyClause_Item'))),
      key('deferrable', c.maybe(fragmentParser('ForeignKeyClause_Deferrable')))
    )
  )
);

fragmentParser('ForeignKeyClause_Item').setParser(c.oneOf(fragmentParser('ForeignKeyClause_Item_On'), fragmentParser('ForeignKeyClause_Item_Match')));

fragmentParser('ForeignKeyClause_Item_On').setParser(
  c.keyed({ variant: 'On' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOnKeyword', WhitespaceLikeParser),
      key('onKeyword', KeywordParser.ON),
      key('event', c.oneOf(fragmentParser('ForeignKeyClause_Item_On_Event_Delete'), fragmentParser('ForeignKeyClause_Item_On_Event_Update'))),
      key('action', fragmentParser('ForeignKeyClause_Item_On_Action'))
    )
  )
);

fragmentParser('ForeignKeyClause_Item_On_Event_Delete').setParser(
  c.keyed({ variant: 'Delete' }, (key) => c.keyedPipe(key('whitespaceBeforeDeleteKeyword', WhitespaceLikeParser), key('deleteKeyword', KeywordParser.DELETE)))
);

fragmentParser('ForeignKeyClause_Item_On_Event_Update').setParser(
  c.keyed({ variant: 'Update' }, (key) => c.keyedPipe(key('whitespaceBeforeUpdateKeyword', WhitespaceLikeParser), key('updateKeyword', KeywordParser.UPDATE)))
);

fragmentParser('ForeignKeyClause_Item_On_Action').setParser(
  c.oneOf(
    fragmentParser('ForeignKeyClause_Item_On_Action_SetNull'),
    fragmentParser('ForeignKeyClause_Item_On_Action_SetDefault'),
    fragmentParser('ForeignKeyClause_Item_On_Action_Cascade'),
    fragmentParser('ForeignKeyClause_Item_On_Action_Restrict'),
    fragmentParser('ForeignKeyClause_Item_On_Action_NoAction')
  )
);

fragmentParser('ForeignKeyClause_Item_On_Action_SetNull').setParser(
  c.keyed({ variant: 'SetNull' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeSetKeyword', WhitespaceLikeParser),
      key('setKeyword', KeywordParser.SET),
      key('whitespaceBeforeNullKeyword', WhitespaceLikeParser),
      key('nullKeyword', KeywordParser.NULL)
    )
  )
);

fragmentParser('ForeignKeyClause_Item_On_Action_SetDefault').setParser(
  c.keyed({ variant: 'SetDefault' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeSetKeyword', WhitespaceLikeParser),
      key('setKeyword', KeywordParser.SET),
      key('whitespaceBeforeDefaultKeyword', WhitespaceLikeParser),
      key('defaultKeyword', KeywordParser.DEFAULT)
    )
  )
);

fragmentParser('ForeignKeyClause_Item_On_Action_Cascade').setParser(
  c.keyed({ variant: 'Cascade' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeCascadeKeyword', WhitespaceLikeParser), key('cascadeKeyword', KeywordParser.CASCADE))
  )
);

fragmentParser('ForeignKeyClause_Item_On_Action_Restrict').setParser(
  c.keyed({ variant: 'Restrict' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeRestrictKeyword', WhitespaceLikeParser), key('restrictKeyword', KeywordParser.RESTRICT))
  )
);

fragmentParser('ForeignKeyClause_Item_On_Action_NoAction').setParser(
  c.keyed({ variant: 'NoAction' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeNoKeyword', WhitespaceLikeParser),
      key('noKeyword', KeywordParser.NO),
      key('whitespaceBeforeActionKeyword', WhitespaceLikeParser),
      key('actionKeyword', KeywordParser.ACTION)
    )
  )
);

fragmentParser('ForeignKeyClause_Item_Match').setParser(
  c.keyed({ variant: 'Match' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeMatchKeyword', WhitespaceLikeParser),
      key('matchKeyword', KeywordParser.MATCH),
      key('whitespaceBeforeName', WhitespaceLikeParser),
      key('name', IdentifierParser)
    )
  )
);

fragmentParser('ForeignKeyClause_Deferrable').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('not', c.maybe(fragmentParser('Not'))),
      key('whitespaceBeforeDeferrableKeyword', WhitespaceLikeParser),
      key('deferrableKeyword', KeywordParser.DEFERRABLE),
      key(
        'initially',
        c.oneOf(fragmentParser('ForeignKeyClause_Deferrable_Initially_Deferred'), fragmentParser('ForeignKeyClause_Deferrable_Initially_Immediate'))
      )
    )
  )
);

fragmentParser('ForeignKeyClause_Deferrable_Initially_Deferred').setParser(
  c.keyed({ variant: 'Deferred' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeInitiallyKeyword', WhitespaceLikeParser),
      key('initiallyKeyword', KeywordParser.INITIALLY),
      key('whitespaceBeforeDeferredKeyword', WhitespaceLikeParser),
      key('deferredKeyword', KeywordParser.DEFERRED)
    )
  )
);

fragmentParser('ForeignKeyClause_Deferrable_Initially_Immediate').setParser(
  c.keyed({ variant: 'Immediate' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeInitiallyKeyword', WhitespaceLikeParser),
      key('initiallyKeyword', KeywordParser.INITIALLY),
      key('whitespaceBeforeImmediateKeyword', WhitespaceLikeParser),
      key('immediateKeyword', KeywordParser.IMMEDIATE)
    )
  )
);

nodeParser('FrameSpec').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('type', fragmentParser('FrameSpec_Type')),
      key('inner', fragmentParser('FrameSpec_Inner')),
      key('exclude', c.maybe(fragmentParser('FrameSpec_Exclude')))
    )
  )
);

fragmentParser('FrameSpec_Type').setParser(
  c.oneOf(fragmentParser('FrameSpec_Type_Range'), fragmentParser('FrameSpec_Type_Rows'), fragmentParser('FrameSpec_Type_Groups'))
);

fragmentParser('FrameSpec_Type_Range').setParser(c.apply(KeywordParser.RANGE, (rangeKeyword) => ({ variant: 'Range', rangeKeyword })));

fragmentParser('FrameSpec_Type_Rows').setParser(c.apply(KeywordParser.ROWS, (rowsKeyword) => ({ variant: 'Rows', rowsKeyword })));

fragmentParser('FrameSpec_Type_Groups').setParser(c.apply(KeywordParser.GROUPS, (groupsKeyword) => ({ variant: 'Groups', groupsKeyword })));

fragmentParser('FrameSpec_Inner').setParser(
  c.oneOf(
    fragmentParser('FrameSpec_Inner_Between'),
    fragmentParser('FrameSpec_Inner_UnboundedPreceding'),
    fragmentParser('FrameSpec_Inner_Preceding'),
    fragmentParser('FrameSpec_Inner_CurrentRow')
  )
);

fragmentParser('FrameSpec_Inner_Between').setParser(
  c.keyed({ variant: 'Between' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeBetweenKeyword', WhitespaceLikeParser),
      key('betweenKeyword', KeywordParser.BETWEEN),
      key('left', fragmentParser('FrameSpec_Between_Item')),
      key('whitespaceBeforeAndKeyword', WhitespaceLikeParser),
      key('andKeyword', KeywordParser.AND),
      key('right', fragmentParser('FrameSpec_Between_Item'))
    )
  )
);

fragmentParser('FrameSpec_Between_Item').setParser(
  c.oneOf(
    fragmentParser('FrameSpec_Between_Item_UnboundedPreceding'),
    fragmentParser('FrameSpec_Between_Item_Preceding'),
    fragmentParser('FrameSpec_Between_Item_CurrentRow'),
    fragmentParser('FrameSpec_Between_Item_Following')
  )
);

fragmentParser('FrameSpec_Between_Item_UnboundedPreceding').setParser(
  c.keyed({ variant: 'UnboundedPreceding' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeUnboundedKeyword', WhitespaceLikeParser),
      key('unboundedKeyword', KeywordParser.UNBOUNDED),
      key('whitespaceBeforePrecedingKeyword', WhitespaceLikeParser),
      key('precedingKeyword', KeywordParser.PRECEDING)
    )
  )
);

fragmentParser('FrameSpec_Between_Item_Preceding').setParser(
  c.keyed({ variant: 'Preceding' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser),
      key('whitespaceBeforePrecedingKeyword', WhitespaceLikeParser),
      key('precedingKeyword', KeywordParser.PRECEDING)
    )
  )
);

fragmentParser('FrameSpec_Between_Item_CurrentRow').setParser(
  c.keyed({ variant: 'CurrentRow' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeCurrentKeyword', WhitespaceLikeParser),
      key('currentKeyword', KeywordParser.CURRENT),
      key('whitespaceBeforeRowKeyword', WhitespaceLikeParser),
      key('rowKeyword', KeywordParser.ROW)
    )
  )
);

fragmentParser('FrameSpec_Between_Item_Following').setParser(
  c.keyed({ variant: 'Following' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser),
      key('whitespaceBeforeFollowingKeyword', WhitespaceLikeParser),
      key('followingKeyword', KeywordParser.FOLLOWING)
    )
  )
);

fragmentParser('FrameSpec_Inner_UnboundedPreceding').setParser(
  c.keyed({ variant: 'UnboundedPreceding' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeUnboundedKeyword', WhitespaceLikeParser),
      key('unboundedKeyword', KeywordParser.UNBOUNDED),
      key('whitespaceBeforePrecedingKeyword', WhitespaceLikeParser),
      key('precedingKeyword', KeywordParser.PRECEDING)
    )
  )
);

fragmentParser('FrameSpec_Inner_Preceding').setParser(
  c.keyed({ variant: 'Preceding' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser),
      key('whitespaceBeforePrecedingKeyword', WhitespaceLikeParser),
      key('precedingKeyword', KeywordParser.PRECEDING)
    )
  )
);

fragmentParser('FrameSpec_Inner_CurrentRow').setParser(
  c.keyed({ variant: 'CurrentRow' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeCurrentKeyword', WhitespaceLikeParser),
      key('currentKeyword', KeywordParser.CURRENT),
      key('whitespaceBeforeRowKeyword', WhitespaceLikeParser),
      key('rowKeyword', KeywordParser.ROW)
    )
  )
);

fragmentParser('FrameSpec_Exclude').setParser(
  c.oneOf(
    fragmentParser('FrameSpec_Exclude_NoOther'),
    fragmentParser('FrameSpec_Exclude_CurrentRow'),
    fragmentParser('FrameSpec_Exclude_Group'),
    fragmentParser('FrameSpec_Exclude_Ties')
  )
);

fragmentParser('FrameSpec_Exclude_NoOther').setParser(
  c.keyed({ variant: 'NoOther' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeExcludeKeyword', WhitespaceLikeParser),
      key('excludeKeyword', KeywordParser.EXCLUDE),
      key('whitespaceBeforeNoKeyword', WhitespaceLikeParser),
      key('noKeyword', KeywordParser.NO),
      key('whitespaceBeforeOthersKeyword', WhitespaceLikeParser),
      key('othersKeyword', KeywordParser.OTHERS)
    )
  )
);

fragmentParser('FrameSpec_Exclude_CurrentRow').setParser(
  c.keyed({ variant: 'CurrentRow' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeExcludeKeyword', WhitespaceLikeParser),
      key('excludeKeyword', KeywordParser.EXCLUDE),
      key('whitespaceBeforeCurrentKeyword', WhitespaceLikeParser),
      key('currentKeyword', KeywordParser.CURRENT),
      key('whitespaceBeforeRowKeyword', WhitespaceLikeParser),
      key('rowKeyword', KeywordParser.ROW)
    )
  )
);

fragmentParser('FrameSpec_Exclude_Group').setParser(
  c.keyed({ variant: 'Group' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeExcludeKeyword', WhitespaceLikeParser),
      key('excludeKeyword', KeywordParser.EXCLUDE),
      key('whitespaceBeforeGroupKeyword', WhitespaceLikeParser),
      key('groupKeyword', KeywordParser.GROUP)
    )
  )
);

fragmentParser('FrameSpec_Exclude_Ties').setParser(
  c.keyed({ variant: 'Ties' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeExcludeKeyword', WhitespaceLikeParser),
      key('excludeKeyword', KeywordParser.EXCLUDE),
      key('whitespaceBeforeTiesKeyword', WhitespaceLikeParser),
      key('tiesKeyword', KeywordParser.TIES)
    )
  )
);

nodeParser('IndexedColumn').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('column', fragmentParser('IndexedColumn_Column')),
      key('collate', c.maybe(fragmentParser('CollationName'))),
      key('direction', c.maybe(fragmentParser('Direction')))
    )
  )
);

fragmentParser('IndexedColumn_Column').setParser(c.oneOf(fragmentParser('IndexedColumn_Column_Name'), fragmentParser('IndexedColumn_Column_Expr')));

fragmentParser('IndexedColumn_Column_Name').setParser(c.apply(IdentifierParser, (columnName) => ({ variant: 'Name', columnName })));

fragmentParser('IndexedColumn_Column_Expr').setParser(c.apply(ExprParser, (expr) => ({ variant: 'Expr', expr })));

fragmentParser('CollationName').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeCollateKeyword', WhitespaceLikeParser),
      key('collateKeyword', KeywordParser.COLLATE),
      key('whitespaceBeforeCollationName', WhitespaceLikeParser),
      key('collationName', IdentifierParser)
    )
  )
);

nodeParser('InsertStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('with', c.maybe(fragmentParser('StmtWith'))),
      key('method', fragmentParser('InsertStmt_Method')),
      key('whitespaceBeforeIntoKeyword', WhitespaceLikeParser),
      key('intoKeyword', KeywordParser.INTO),
      key('whitespaceBeforeTable', WhitespaceLikeParser),
      key('table', fragmentParser('SchemaTable')),
      key('alias', c.maybe(fragmentParser('InsertStmt_Alias'))),
      key('columnNames', c.maybe(fragmentParser('ColumnNames'))),
      key('data', fragmentParser('InsertStmt_Data')),
      key('returningClause', c.maybe(fragmentParser('ReturningClause')))
    )
  )
);

fragmentParser('InsertStmt_Method').setParser(c.oneOf(fragmentParser('InsertStmt_Method_ReplaceInto'), fragmentParser('InsertStmt_Method_InsertInto')));

fragmentParser('InsertStmt_Method_ReplaceInto').setParser(c.apply(KeywordParser.REPLACE, (replaceKeyword) => ({ variant: 'ReplaceInto', replaceKeyword })));

fragmentParser('InsertStmt_Method_InsertInto').setParser(
  c.keyed({ variant: 'InsertInto' }, (key) =>
    c.keyedPipe(key('insertKeyword', KeywordParser.INSERT), key('or', c.maybe(fragmentParser('InsertStmt_Method_InsertInto_Or'))))
  )
);

fragmentParser('InsertStmt_Method_InsertInto_Or').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeOrKeyword', WhitespaceLikeParser),
      key('orKeyword', KeywordParser.OR),
      key(
        'action',
        c.oneOf(
          fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Abort'),
          fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Fail'),
          fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Ignore'),
          fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Replace'),
          fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Rollback')
        )
      )
    )
  )
);

fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Abort').setParser(
  c.keyed({ variant: 'Abort' }, (key) => c.keyedPipe(key('whitespaceBeforeAbortKeyword', WhitespaceLikeParser), key('abortKeyword', KeywordParser.ABORT)))
);

fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Fail').setParser(
  c.keyed({ variant: 'Fail' }, (key) => c.keyedPipe(key('whitespaceBeforeFailKeyword', WhitespaceLikeParser), key('failKeyword', KeywordParser.FAIL)))
);

fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Ignore').setParser(
  c.keyed({ variant: 'Ignore' }, (key) => c.keyedPipe(key('whitespaceBeforeIgnoreKeyword', WhitespaceLikeParser), key('ignoreKeyword', KeywordParser.IGNORE)))
);

fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Replace').setParser(
  c.keyed({ variant: 'Replace' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeReplaceKeyword', WhitespaceLikeParser), key('replaceKeyword', KeywordParser.REPLACE))
  )
);

fragmentParser('InsertStmt_Method_InsertInto_Or_Action_Rollback').setParser(
  c.keyed({ variant: 'Rollback' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeRollbackKeyword', WhitespaceLikeParser), key('rollbackKeyword', KeywordParser.ROLLBACK))
  )
);

fragmentParser('InsertStmt_Alias').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeAsKeyword', WhitespaceLikeParser),
      key('asKeyword', KeywordParser.AS),
      key('whitespaceBeforeAlias', WhitespaceLikeParser),
      key('alias', IdentifierParser)
    )
  )
);

fragmentParser('InsertStmt_Data').setParser(
  c.oneOf(fragmentParser('InsertStmt_Data_Values'), fragmentParser('InsertStmt_Data_Select'), fragmentParser('InsertStmt_Data_DefaultValues'))
);

fragmentParser('InsertStmt_Data_Values').setParser(
  c.keyed({ variant: 'Values' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeValuesKeyword', WhitespaceLikeParser),
      key('valuesKeyword', KeywordParser.VALUES),
      key('rows', nonEmptyCommaList(fragmentParser('InsertStmt_Data_Values_Row'))),
      key('upsertClause', fragmentParser('InsertStmt_Data_UpsertClause'))
    )
  )
);

fragmentParser('InsertStmt_Data_Values_Row').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeOpenParent', WhitespaceLikeParser),
      openParentParser,
      key('exprs', nonEmptyCommaSingleList(ExprParser)),
      key('whitespaceBeforeCloseParent', WhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('InsertStmt_Data_UpsertClause').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeUpsertClause', WhitespaceLikeParser), key('upsertClause', nodeParser('UpsertClause'))))
);

fragmentParser('InsertStmt_Data_Select').setParser(
  c.keyed({ variant: 'Select' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeSelectStmt', WhitespaceLikeParser),
      key('selectStmt', nodeParser('SelectStmt')),
      key('upsertClause', fragmentParser('InsertStmt_Data_UpsertClause'))
    )
  )
);

fragmentParser('InsertStmt_Data_DefaultValues').setParser(
  c.keyed({ variant: 'DefaultValues' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeDefaultKeyword', WhitespaceLikeParser),
      key('defaultKeyword', KeywordParser.DEFAULT),
      key('whitespaceBeforeValuesKeyword', WhitespaceLikeParser),
      key('valuesKeyword', KeywordParser.VALUES)
    )
  )
);

nodeParser('JoinClause').setParser(
  c.keyed((key) => c.keyedPipe(key('tableOrSubquery', nodeParser('TableOrSubquery')), key('join', c.maybe(c.many(fragmentParser('JoinClause_JoinItem'))))))
);

fragmentParser('JoinClause_JoinItem').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeJoinOperator', WhitespaceLikeParser),
      key('joinOperator', nodeParser('JoinOperator')),
      key('whitespaceBeforeTableOrSubquery', WhitespaceLikeParser),
      key('tableOrSubquery', nodeParser('TableOrSubquery')),
      key('joinConstraint', c.maybe(fragmentParser('JoinClause_JoinItem_JoinConstraint')))
    )
  )
);

fragmentParser('JoinClause_JoinItem_JoinConstraint').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeJoinConstraint', WhitespaceLikeParser), key('joinConstraint', nodeParser('JoinConstraint'))))
);

nodeParser('JoinConstraint').setParser(c.oneOf(fragmentParser('JoinConstraint_On'), fragmentParser('JoinConstraint_Using')));

fragmentParser('JoinConstraint_On').setParser(
  c.keyed({ variant: 'On' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOnKeyword', WhitespaceLikeParser),
      key('onKeyword', KeywordParser.ON),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser)
    )
  )
);

fragmentParser('JoinConstraint_Using').setParser(
  c.keyed({ variant: 'Using' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeUsingKeyword', WhitespaceLikeParser),
      key('usingKeyword', KeywordParser.USING),
      key('whitespaceBeforeOpenParent', WhitespaceLikeParser),
      key('columnNames', nonEmptyCommaSingleList(IdentifierParser)),
      key('whitespaceBeforeCloseParent', WhitespaceLikeParser)
    )
  )
);

nodeParser('JoinOperator').setParser(c.oneOf(fragmentParser('JoinOperator_Comma'), fragmentParser('JoinOperator_Join')));

fragmentParser('JoinOperator_Comma').setParser(c.apply(commaParser, () => ({ variant: 'Comma' })));

fragmentParser('JoinOperator_Join').setParser(
  c.keyed({ variant: 'Join' }, (key) =>
    c.keyedPipe(
      key('natural', c.maybe(fragmentParser('JoinOperator_Join_Natural'))),
      key('join', c.oneOf(fragmentParser('JoinOperator_Join_Left'), fragmentParser('JoinOperator_Join_Inner'), fragmentParser('JoinOperator_Join_Cross'))),
      key('joinKeyword', KeywordParser.JOIN)
    )
  )
);

fragmentParser('JoinOperator_Join_Natural').setParser(
  c.keyed((key) => c.keyedPipe(key('naturalKeyword', KeywordParser.NATURAL), key('whitespaceAfterNaturalKeyword', WhitespaceLikeParser)))
);

fragmentParser('JoinOperator_Join_Left').setParser(
  c.keyed({ variant: 'Left' }, (key) =>
    c.keyedPipe(
      key('leftKeyword', KeywordParser.LEFT),
      key('whitespaceAfterLeftKeyword', WhitespaceLikeParser),
      key('outer', c.maybe(fragmentParser('JoinOperator_Join_Left_Outer')))
    )
  )
);

fragmentParser('JoinOperator_Join_Left_Outer').setParser(
  c.keyed((key) => c.keyedPipe(key('outerKeyword', KeywordParser.OUTER), key('whitespaceAfterOuterKeyword', WhitespaceLikeParser)))
);

fragmentParser('JoinOperator_Join_Inner').setParser(
  c.keyed({ variant: 'Inner' }, (key) => c.keyedPipe(key('innerKeyword', KeywordParser.INNER), key('whitespaceAfterInnerKeyword', WhitespaceLikeParser)))
);

fragmentParser('JoinOperator_Join_Cross').setParser(
  c.keyed({ variant: 'Cross' }, (key) => c.keyedPipe(key('crossKeyword', KeywordParser.CROSS), key('whitespaceAfterCrossKeyword', WhitespaceLikeParser)))
);

nodeParser('OrderingTerm').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('expr', ExprParser),
      key('collate', c.maybe(fragmentParser('CollationName'))),
      key('direction', c.maybe(fragmentParser('Direction'))),
      key('nulls', c.maybe(c.oneOf(fragmentParser('OrderingTerm_NullsFirst'), fragmentParser('OrderingTerm_NullsLast'))))
    )
  )
);

fragmentParser('OrderingTerm_NullsFirst').setParser(
  c.keyed({ variant: 'NullsFirst' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeNullsKeyword', WhitespaceLikeParser),
      key('nullsKeyword', KeywordParser.NULLS),
      key('whitespaceBeforeFirstKeyword', WhitespaceLikeParser),
      key('firstKeyword', KeywordParser.FIRST)
    )
  )
);

fragmentParser('OrderingTerm_NullsLast').setParser(
  c.keyed({ variant: 'NullsLast' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeNullsKeyword', WhitespaceLikeParser),
      key('nullsKeyword', KeywordParser.NULLS),
      key('whitespaceBeforeLastKeyword', WhitespaceLikeParser),
      key('lastKeyword', KeywordParser.LAST)
    )
  )
);

nodeParser('OverClause').setParser(
  c.keyed((key) =>
    c.keyedPipe(key('overKeyword', KeywordParser.OVER), key('window', c.oneOf(fragmentParser('OverClause_WindowName'), fragmentParser('OverClause_Window'))))
  )
);

fragmentParser('OverClause_WindowName').setParser(
  c.keyed({ variant: 'WindowName' }, (key) => c.keyedPipe(key('whitespaceBeforeWindowName', WhitespaceLikeParser), key('windowName', IdentifierParser)))
);

fragmentParser('OverClause_Window').setParser(
  c.keyed({ variant: 'Window' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('baseWindowName', c.maybe(fragmentParser('OverClause_BaseWindowName'))),
      key('partitionBy', c.maybe(fragmentParser('OverClause_PartitionBy'))),
      key('orderBy', c.maybe(fragmentParser('OverClause_OrderBy'))),
      key('frameSpec', c.maybe(fragmentParser('OverClause_FrameSpec'))),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('OverClause_BaseWindowName').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeBaseWindowName', WhitespaceLikeParser), key('baseWindowName', IdentifierParser)))
);

fragmentParser('OverClause_PartitionBy').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforePartitionKeyword', WhitespaceLikeParser),
      key('partitionKeyword', KeywordParser.PARTITION),
      key('whitespaceBeforeByKeyword', WhitespaceLikeParser),
      key('byKeyword', KeywordParser.BY),
      key('exprs', nonEmptyCommaSingleList(ExprParser))
    )
  )
);

fragmentParser('OverClause_OrderBy').setParser(
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

fragmentParser('OverClause_FrameSpec').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeFrameSpec', WhitespaceLikeParser), key('frameSpec', nodeParser('FrameSpec'))))
);

nodeParser('PragmaStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('pragmaKeyword', KeywordParser.PRAGMA),
      key('whitespaceBeforePragma', WhitespaceLikeParser),
      key('pragma', fragmentParser('SchemaPragma')),
      key('value', fragmentParser('PragmaStmt_Value'))
    )
  )
);

fragmentParser('SchemaPragma').setParser(
  c.applyPipe([c.maybe(fragmentParser('SchemaItem_Schema')), IdentifierParser], ([schema, pragma]) => ({ schema, pragma }))
);

fragmentParser('PragmaStmt_Value').setParser(c.oneOf(fragmentParser('PragmaStmt_Value_Equal'), fragmentParser('PragmaStmt_Value_Call')));

fragmentParser('PragmaStmt_Value_Equal').setParser(
  c.keyed({ variant: 'Equal' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeEqual', MaybeWhitespaceLikeParser),
      equalParser,
      key('whitespaceBeforePragmaValue', MaybeWhitespaceLikeParser),
      key('pragmaValue', fragmentParser('PragmaValue'))
    )
  )
);

fragmentParser('PragmaStmt_Value_Call').setParser(
  c.keyed({ variant: 'Call' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('whitespaceBeforePragmaValue', MaybeWhitespaceLikeParser),
      key('pragmaValue', fragmentParser('PragmaValue')),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('PragmaValue').setParser(c.oneOf(nodeParser('SignedNumber'), nodeParser('StringLiteral')));

nodeParser('QualifiedTableName').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('table', fragmentParser('SchemaTable')),
      key('alias', c.maybe(fragmentParser('QualifiedTableName_Alias'))),
      key('inner', c.maybe(c.oneOf(fragmentParser('QualifiedTableName_IndexedBy'), fragmentParser('QualifiedTableName_NotIndexed'))))
    )
  )
);

fragmentParser('QualifiedTableName_Alias').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeAsKeyword', WhitespaceLikeParser),
      key('asKeyword', KeywordParser.AS),
      key('whitespaceBeforeAlias', WhitespaceLikeParser),
      key('alias', IdentifierParser)
    )
  )
);

fragmentParser('QualifiedTableName_IndexedBy').setParser(
  c.keyed({ variant: 'IndexedBy' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeIndexedKeyword', WhitespaceLikeParser),
      key('indexedKeyword', KeywordParser.INDEXED),
      key('whitespaceBeforeByKeyword', WhitespaceLikeParser),
      key('byKeyword', KeywordParser.BY),
      key('whitespaceBeforeIndexName', WhitespaceLikeParser),
      key('indexName', IdentifierParser)
    )
  )
);

fragmentParser('QualifiedTableName_NotIndexed').setParser(
  c.keyed({ variant: 'NotIndexed' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeNotKeyword', WhitespaceLikeParser),
      key('notKeyword', KeywordParser.NOT),
      key('whitespaceBeforeIndexedKeyword', WhitespaceLikeParser),
      key('indexedKeyword', KeywordParser.INDEXED)
    )
  )
);

nodeParser('RaiseFunction').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('raiseKeyword', KeywordParser.RAISE),
      key('whitespaceBeforeOpentParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key(
        'inner',
        c.oneOf(
          fragmentParser('RaiseFunction_Ignore'),
          fragmentParser('RaiseFunction_Rollback'),
          fragmentParser('RaiseFunction_Abort'),
          fragmentParser('RaiseFunction_Fail')
        )
      ),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('RaiseFunction_Ignore').setParser(
  c.keyed({ variant: 'Ignore' }, (key) => c.keyedPipe(key('whitespaceBeforeIgnoreKeyword', WhitespaceLikeParser), key('ignoreKeyword', KeywordParser.IGNORE)))
);

fragmentParser('RaiseFunction_Rollback').setParser(
  c.keyed({ variant: 'Rollback' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeRollbackKeyword', WhitespaceLikeParser),
      key('rollbackKeyword', KeywordParser.ROLLBACK),
      key('whitespaceBeforeComma', MaybeWhitespaceLikeParser),
      commaParser,
      key('whitespaceBeforeErrorMessage', MaybeWhitespaceLikeParser),
      key('errorMessage', nodeParser('StringLiteral'))
    )
  )
);

fragmentParser('RaiseFunction_Abort').setParser(
  c.keyed({ variant: 'Abort' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeAbortKeyword', WhitespaceLikeParser),
      key('abortKeyword', KeywordParser.ABORT),
      key('whitespaceBeforeComma', MaybeWhitespaceLikeParser),
      commaParser,
      key('whitespaceBeforeErrorMessage', MaybeWhitespaceLikeParser),
      key('errorMessage', nodeParser('StringLiteral'))
    )
  )
);

fragmentParser('RaiseFunction_Fail').setParser(
  c.keyed({ variant: 'Fail' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeFailKeyword', WhitespaceLikeParser),
      key('failKeyword', KeywordParser.FAIL),
      key('whitespaceBeforeComma', MaybeWhitespaceLikeParser),
      commaParser,
      key('whitespaceBeforeErrorMessage', MaybeWhitespaceLikeParser),
      key('errorMessage', nodeParser('StringLiteral'))
    )
  )
);

// SKIP RecursiveCte for now

nodeParser('ReindexStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('reindexKeyword', KeywordParser.REINDEX),
      key('target', c.oneOf(fragmentParser('ReindexStmt_CollationName'), fragmentParser('ReindexStmt_TableOrIndex')))
    )
  )
);

fragmentParser('ReindexStmt_CollationName').setParser(
  c.keyed({ variant: 'CollationName' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeCollationName', WhitespaceLikeParser), key('collationName', IdentifierParser))
  )
);

fragmentParser('ReindexStmt_TableOrIndex').setParser(
  c.keyed({ variant: 'TableOrIndex' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeTableOrIndex', WhitespaceLikeParser), key('tableOrIndex', fragmentParser('SchemaTableOrIndex')))
  )
);

fragmentParser('SchemaTableOrIndex').setParser(
  c.applyPipe([c.maybe(fragmentParser('SchemaItem_Schema')), IdentifierParser], ([schema, tableOrIndex]) => ({ schema, tableOrIndex }))
);

nodeParser('ReleaseStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('releaseKeyword', KeywordParser.RELEASE),
      key('savepoint', c.maybe(fragmentParser('Savepoint'))),
      key('whitespaceBeforeSavepointName', WhitespaceLikeParser),
      key('savepointName', IdentifierParser)
    )
  )
);

fragmentParser('Savepoint').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeSavepointKeyword', WhitespaceLikeParser), key('savepointKeyword', KeywordParser.SAVEPOINT)))
);

nodeParser('ResultColumn').setParser(
  c.oneOf(fragmentParser('ResultColumn_Star'), fragmentParser('ResultColumn_TableStar'), fragmentParser('ResultColumn_Expr'))
);

fragmentParser('ResultColumn_Star').setParser(c.apply(starParser, () => ({ variant: 'Star' })));

fragmentParser('ResultColumn_TableStar').setParser(
  c.keyed({ variant: 'TableStar' }, (key) =>
    c.keyedPipe(
      key('tableName', IdentifierParser),
      key('whitespaceBeforeDot', MaybeWhitespaceLikeParser),
      dotParser,
      key('whitespaceBeforeStar', MaybeWhitespaceLikeParser),
      starParser
    )
  )
);

fragmentParser('ResultColumn_Expr').setParser(
  c.keyed({ variant: 'Expr' }, (key) => c.keyedPipe(key('expr', ExprParser), key('alias', c.maybe(fragmentParser('ResultColumn_Expr_Alias')))))
);

fragmentParser('ResultColumn_Expr_Alias').setParser(
  c.keyed((key) =>
    c.keyedPipe(key('as', c.maybe(fragmentParser('As'))), key('whitespaceBeforeColumnAlias', WhitespaceLikeParser), key('columnAlias', IdentifierParser))
  )
);

fragmentParser('As').setParser(c.keyed((key) => c.keyedPipe(key('whitespaceBeforeAsKeyword', WhitespaceLikeParser), key('asKeyword', KeywordParser.AS))));

nodeParser('ReturningClause').setParser(
  c.keyed((key) => c.keyedPipe(key('returningKeyword', KeywordParser.RETURNING), key('items', nonEmptyCommaList(fragmentParser('ReturningClause_Item')))))
);

fragmentParser('ReturningClause_Item').setParser(c.oneOf(fragmentParser('ReturningClause_Item_Star'), fragmentParser('ReturningClause_Item_Expr')));

fragmentParser('ReturningClause_Item_Star').setParser(
  c.keyed({ variant: 'Star' }, (key) => c.keyedPipe(key('whitespaceBeforeStar', MaybeWhitespaceLikeParser), starParser))
);

fragmentParser('ReturningClause_Item_Expr').setParser(
  c.keyed({ variant: 'Expr' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser),
      key('alias', c.maybe(fragmentParser('ReturningClause_Item_Expr_Alias')))
    )
  )
);

fragmentParser('ReturningClause_Item_Expr_Alias').setParser(
  c.keyed((key) =>
    c.keyedPipe(key('as', c.maybe(fragmentParser('As'))), key('whitespaceBeforeColumnAlias', WhitespaceLikeParser), key('columnAlias', IdentifierParser))
  )
);

nodeParser('RollbackStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('rollbackKeyword', KeywordParser.ROLLBACK),
      key('transaction', c.maybe(fragmentParser('RollbackStmt_Transaction'))),
      key('to', c.maybe(fragmentParser('RollbackStmt_To')))
    )
  )
);

fragmentParser('RollbackStmt_Transaction').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeTransactionKeyword', WhitespaceLikeParser), key('transactionKeyword', KeywordParser.TRANSACTION)))
);

fragmentParser('RollbackStmt_To').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeToKeyword', WhitespaceLikeParser),
      key('toKeyword', KeywordParser.TO),
      key('savepoint', c.maybe(fragmentParser('Savepoint'))),
      key('whitespaceBeforeSavepointName', WhitespaceLikeParser),
      key('savepointName', IdentifierParser)
    )
  )
);

nodeParser('SavepointStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('savepointKeyword', KeywordParser.SAVEPOINT),
      key('whitespaceBeforeSavepointName', WhitespaceLikeParser),
      key('savepointName', IdentifierParser)
    )
  )
);

nodeParser('SelectCore').setParser(c.oneOf(fragmentParser('SelectCore_Select'), fragmentParser('SelectCore_Values')));

fragmentParser('SelectCore_Select').setParser(
  c.keyed({ variant: 'Select' }, (key) =>
    c.keyedPipe(
      key('selectKeyword', KeywordParser.SELECT),
      key('distinct', c.maybe(c.oneOf(fragmentParser('SelectCore_Select_Distinct'), fragmentParser('SelectCore_Select_All')))),
      key('resultColumns', nonEmptyCommaSingleList(nodeParser('ResultColumn'))),
      key('from', c.maybe(fragmentParser('SelectCore_Select_From'))),
      key('where', c.maybe(fragmentParser('Where'))),
      key('groupBy', c.maybe(fragmentParser('SelectCore_Select_GroupBy'))),
      key('window', c.maybe(fragmentParser('SelectCore_Select_Window')))
    )
  )
);

fragmentParser('SelectCore_Select_Distinct').setParser(
  c.keyed({ variant: 'Distinct' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeDistinctKeyword', WhitespaceLikeParser), key('distinctKeyword', KeywordParser.DISTINCT))
  )
);

fragmentParser('SelectCore_Select_All').setParser(
  c.keyed({ variant: 'All' }, (key) => c.keyedPipe(key('whitespaceBeforeAllKeyword', WhitespaceLikeParser), key('allKeyword', KeywordParser.DISTINCT)))
);

fragmentParser('SelectCore_Select_From').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeFromKeyword', WhitespaceLikeParser),
      key('fromKeyword', KeywordParser.FROM),
      key('inner', c.oneOf(fragmentParser('SelectCore_Select_From_TableOrSubquery'), fragmentParser('SelectCore_Select_From_Join')))
    )
  )
);

fragmentParser('SelectCore_Select_From_TableOrSubquery').setParser(
  c.apply(nonEmptyCommaSingleList(nodeParser('TableOrSubquery')), (tableOrSubqueries) => ({ variant: 'TableOrSubquery', tableOrSubqueries }))
);

fragmentParser('SelectCore_Select_From_Join').setParser(
  c.keyed({ variant: 'Join' }, (key) => c.keyedPipe(key('whitespaceBeforeJoinClause', WhitespaceLikeParser), key('joinClause', nodeParser('JoinClause'))))
);

fragmentParser('SelectCore_Select_GroupBy').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeGroupKeyword', WhitespaceLikeParser),
      key('groupKeyword', KeywordParser.GROUP),
      key('whitespaceBeforeByKeyword', WhitespaceLikeParser),
      key('byKeyword', KeywordParser.BY),
      key('exprs', nonEmptyCommaSingleList(ExprParser)),
      key('having', c.maybe(fragmentParser('SelectCore_Select_GroupBy_Having')))
    )
  )
);

fragmentParser('SelectCore_Select_GroupBy_Having').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeHavingKeyword', WhitespaceLikeParser),
      key('havingKeyword', KeywordParser.HAVING),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', ExprParser)
    )
  )
);

fragmentParser('SelectCore_Select_Window').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeWindowKeyword', WhitespaceLikeParser),
      key('windowKeyword', KeywordParser.WINDOW),
      key('windows', nonEmptyCommaList(fragmentParser('SelectCore_Select_Window_Item')))
    )
  )
);

fragmentParser('SelectCore_Select_Window_Item').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeWindowName', WhitespaceLikeParser),
      key('windowName', IdentifierParser),
      key('whitespaceBeforeAsKeyword', WhitespaceLikeParser),
      key('asKeyword', KeywordParser.AS),
      key('whitespaceBeforeWindowDefn', WhitespaceLikeParser),
      key('windowDefn', nodeParser('WindowDefn'))
    )
  )
);

fragmentParser('SelectCore_Values').setParser(
  c.keyed({ variant: 'Values' }, (key) =>
    c.keyedPipe(key('valuesKeyword', KeywordParser.VALUES), key('values', nonEmptyCommaList(fragmentParser('SelectCore_Values_Item'))))
  )
);

fragmentParser('SelectCore_Values_Item').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('items', nonEmptyCommaSingleList(ExprParser)),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

nodeParser('SelectStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('with', c.maybe(fragmentParser('StmtWith'))),
      key('select', nodeParser('SelectCore')),
      key('compoundSelects', c.maybe(c.many(fragmentParser('SelectStmt_CompoundSelectsItem')))),
      key('orderBy', c.maybe(fragmentParser('OrderBy'))),
      key('limit', c.maybe(fragmentParser('Limit')))
    )
  )
);

fragmentParser('SelectStmt_CompoundSelectsItem').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeCompoundOperator', WhitespaceLikeParser),
      key('compoundOperator', nodeParser('CompoundOperator')),
      key('whitespaceBeforeSelect', WhitespaceLikeParser),
      key('select', nodeParser('SelectCore'))
    )
  )
);

nodeParser('SignedNumber').setParser(
  c.keyed((key) => c.keyedPipe(key('sign', c.maybe(fragmentParser('SignedNumber_Sign'))), key('numericLiteral', nodeParser('NumericLiteral'))))
);

fragmentParser('SignedNumber_Sign').setParser(
  c.applyPipe([c.oneOf(plusParser, dashParser), MaybeWhitespaceLikeParser], ([sign, whitespaceAfterSign]) => ({
    variant: sign === '+' ? 'Plus' : 'Minus',
    whitespaceAfterSign,
  }))
);

nodeParser('SqlStmt').setParser(
  c.keyed((key) => c.keyedPipe(key('explain', c.maybe(fragmentParser('SqlStmt_Explain'))), key('stmt', fragmentParser('SqlStmt_Item'))))
);

fragmentParser('SqlStmt_Explain').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('explainKeyword', KeywordParser.EXPLAIN),
      key('queryPlan', c.maybe(fragmentParser('SqlStmt_Explain_QueryPlan'))),
      key('whitespaceAfter', WhitespaceLikeParser)
    )
  )
);

fragmentParser('SqlStmt_Explain_QueryPlan').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeQueryKeyword', WhitespaceLikeParser),
      key('queryKeyword', KeywordParser.QUERY),
      key('whitespaceBeforePlanKeyword', WhitespaceLikeParser),
      key('planKeyword', KeywordParser.PLAN)
    )
  )
);

fragmentParser('SqlStmt_Item').setParser(
  c.oneOf<Fragment<'SqlStmt_Item'>, Ctx>(
    nodeParser('AnalyzeStmt'),
    nodeParser('AttachStmt'),
    nodeParser('BeginStmt'),
    nodeParser('CommitStmt'),
    nodeParser('CreateIndexStmt'),
    nodeParser('CreateTableStmt'),
    nodeParser('CreateTriggerStmt'),
    nodeParser('CreateViewStmt'),
    nodeParser('CreateVirtualTableStmt'),
    nodeParser('DeleteStmt'),
    nodeParser('DeleteStmtLimited'),
    nodeParser('DetachStmt'),
    nodeParser('DropIndexStmt'),
    nodeParser('DropTableStmt'),
    nodeParser('DropTriggerStmt'),
    nodeParser('DropViewStmt'),
    nodeParser('InsertStmt'),
    nodeParser('PragmaStmt'),
    nodeParser('ReindexStmt'),
    nodeParser('ReleaseStmt'),
    nodeParser('RollbackStmt'),
    nodeParser('SavepointStmt'),
    nodeParser('SelectStmt'),
    nodeParser('UpdateStmt'),
    nodeParser('UpdateStmtLimited'),
    nodeParser('VacuumStmt')
  )
);

nodeParser('SqlStmtList').setParser(
  c.applyPipe([c.manySepBy(fragmentParser('SqlStmtList_Item'), semicolonParser, { allowEmpty: false }), eofParser], ([items]) => {
    const list = manySepByResultToArray(items);
    if (list.length === 1 && list[0].variant === 'Empty') {
      return { items: [] };
    }
    return { items: list };
  })
);

fragmentParser('SqlStmtList_Item').setParser(
  c.apply(c.maybe(c.oneOf(fragmentParser('SqlStmtList_Item_Whitespace'), fragmentParser('SqlStmtList_Item_Stmt'))), (item) => {
    if (item === undefined) {
      return { variant: 'Empty' };
    }
    return item;
  })
);

fragmentParser('SqlStmtList_Item_Stmt').setParser(
  c.keyed({ variant: 'Stmt' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeStmt', MaybeWhitespaceLikeParser),
      key('stmt', nodeParser('SqlStmt')),
      key('whitespaceAfterStmt', MaybeWhitespaceLikeParser)
    )
  )
);

fragmentParser('SqlStmtList_Item_Whitespace').setParser(c.apply(WhitespaceLikeParser, (whitespace) => ({ variant: 'Whitespace', whitespace })));

// fragmentParser('SqlStmtList_Item').setParser(
//   c.apply(
//     c.oneOf(
//       c.pipe(MaybeWhitespaceLikeParser, nodeParser('SqlStmt'), MaybeWhitespaceLikeParser),
//       c.apply(MaybeWhitespaceLikeParser, (v) => ({ whitespaceLike: v }))
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

nodeParser('TableOrSubquery').setParser(
  c.oneOf(
    fragmentParser('TableOrSubquery_Table'),
    fragmentParser('TableOrSubquery_TableFunctionInvocation'),
    fragmentParser('TableOrSubquery_Select'),
    fragmentParser('TableOrSubquery_TableOrSubqueries'),
    fragmentParser('TableOrSubquery_Join')
  )
);

fragmentParser('TableOrSubquery_Table').setParser(
  c.keyed({ variant: 'Table' }, (key) =>
    c.keyedPipe(
      key('table', fragmentParser('SchemaTable')),
      key('alias', c.maybe(fragmentParser('TableOrSubquery_Alias'))),
      key('index', c.maybe(c.oneOf(fragmentParser('TableOrSubquery_Table_IndexedBy'), fragmentParser('TableOrSubquery_Table_NotIndexed'))))
    )
  )
);

fragmentParser('TableOrSubquery_Alias').setParser(
  c.keyed((key) =>
    c.keyedPipe(key('as', c.maybe(fragmentParser('As'))), key('whitespaceBeforeTableAlias', WhitespaceLikeParser), key('tableAlias', IdentifierParser))
  )
);

fragmentParser('TableOrSubquery_Table_IndexedBy').setParser(
  c.keyed({ variant: 'IndexedBy' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeIndexedKeyword', WhitespaceLikeParser),
      key('indexedKeyword', KeywordParser.INDEXED),
      key('whitespaceBeforeByKeyword', WhitespaceLikeParser),
      key('byKeyword', KeywordParser.BY),
      key('whitespaceBeforeIndexName', WhitespaceLikeParser),
      key('indexName', IdentifierParser)
    )
  )
);

fragmentParser('TableOrSubquery_Table_NotIndexed').setParser(
  c.keyed({ variant: 'NotIndexed' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeNotKeyword', WhitespaceLikeParser),
      key('notKeyword', KeywordParser.NOT),
      key('whitespaceBeforeIndexedKeyword', WhitespaceLikeParser),
      key('indexedKeyword', KeywordParser.INDEXED)
    )
  )
);

fragmentParser('TableOrSubquery_TableFunctionInvocation').setParser(
  c.keyed({ variant: 'TableFunctionInvocation' }, (key) =>
    c.keyedPipe(
      key('function', fragmentParser('SchemaFunction')),
      key('whitespaceBeforeOpenParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('parameters', nonEmptyCommaSingleList(ExprParser)),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser,
      key('alias', c.maybe(fragmentParser('TableOrSubquery_Alias')))
    )
  )
);

fragmentParser('TableOrSubquery_Select').setParser(
  c.keyed({ variant: 'Select' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeSelectStmt', WhitespaceLikeParser),
      key('selectStmt', nodeParser('SelectStmt')),
      key('whitespaceBeforeCloseParent', WhitespaceLikeParser),
      key('alias', c.maybe(fragmentParser('TableOrSubquery_Alias')))
    )
  )
);

fragmentParser('TableOrSubquery_TableOrSubqueries').setParser(
  c.keyed({ variant: 'TableOrSubqueries' }, (key) =>
    c.keyedPipe(
      openParentParser,
      key('tableOrSubqueries', nonEmptyCommaSingleList(nodeParser('TableOrSubquery'))),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

fragmentParser('TableOrSubquery_Join').setParser(
  c.keyed({ variant: 'Join' }, (key) =>
    c.keyedPipe(
      openParentParser,
      key('whitespaceBeforeJoinClause', WhitespaceLikeParser),
      key('joinClause', nodeParser('JoinClause')),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser
    )
  )
);

nodeParser('TypeName').setParser(
  c.keyed((key) => c.keyedPipe(key('name', fragmentParser('TypeName_Name')), key('size', c.maybe(fragmentParser('TypeName_Size')))))
);

fragmentParser('TypeName_Name').setParser(
  c.keyed((key) => c.keyedPipe(key('head', typeNameItemParser), key('tail', c.maybe(c.many(fragmentParser('TypeName_Name_Tail'))))))
);

fragmentParser('TypeName_Name_Tail').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeName', WhitespaceLikeParser), key('name', typeNameItemParser)))
);

nodeParser('UpdateStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('with', c.maybe(fragmentParser('StmtWith'))),
      key('updateKeyword', KeywordParser.UPDATE),
      key('or', c.maybe(fragmentParser('UpdateOr'))),
      key('whitespaceBeforeQualifiedTableName', WhitespaceLikeParser),
      key('qualifiedTableName', nodeParser('QualifiedTableName')),
      key('whitespaceBeforeSetKeyword', WhitespaceLikeParser),
      key('setKeyword', KeywordParser.SET),
      key('setItems', nonEmptyCommaList(fragmentParser('UpdateSetItems'))),
      key('from', c.maybe(fragmentParser('UpdateFrom'))),
      key('where', c.maybe(fragmentParser('Where'))),
      key('returningClause', c.maybe(fragmentParser('ReturningClause')))
    )
  )
);

fragmentParser('UpdateOr').setParser(
  c.oneOf(
    fragmentParser('UpdateOr_Abort'),
    fragmentParser('UpdateOr_Fail'),
    fragmentParser('UpdateOr_Ignore'),
    fragmentParser('UpdateOr_Replace'),
    fragmentParser('UpdateOr_Rollback')
  )
);

fragmentParser('UpdateOr_Abort').setParser(
  c.keyed({ variant: 'Abort' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOrKeyword', WhitespaceLikeParser),
      key('orKeyword', KeywordParser.OR),
      key('whitespaceBeforeAbortKeyword', WhitespaceLikeParser),
      key('abortKeyword', KeywordParser.ABORT)
    )
  )
);

fragmentParser('UpdateOr_Fail').setParser(
  c.keyed({ variant: 'Fail' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOrKeyword', WhitespaceLikeParser),
      key('orKeyword', KeywordParser.OR),
      key('whitespaceBeforeFailKeyword', WhitespaceLikeParser),
      key('failKeyword', KeywordParser.ABORT)
    )
  )
);

fragmentParser('UpdateOr_Ignore').setParser(
  c.keyed({ variant: 'Ignore' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOrKeyword', WhitespaceLikeParser),
      key('orKeyword', KeywordParser.OR),
      key('whitespaceBeforeIgnoreKeyword', WhitespaceLikeParser),
      key('ignoreKeyword', KeywordParser.ABORT)
    )
  )
);

fragmentParser('UpdateOr_Replace').setParser(
  c.keyed({ variant: 'Replace' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOrKeyword', WhitespaceLikeParser),
      key('orKeyword', KeywordParser.OR),
      key('whitespaceBeforeReplaceKeyword', WhitespaceLikeParser),
      key('replaceKeyword', KeywordParser.ABORT)
    )
  )
);

fragmentParser('UpdateOr_Rollback').setParser(
  c.keyed({ variant: 'Rollback' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeOrKeyword', WhitespaceLikeParser),
      key('orKeyword', KeywordParser.OR),
      key('whitespaceBeforeRollbackKeyword', WhitespaceLikeParser),
      key('rollbackKeyword', KeywordParser.ABORT)
    )
  )
);

fragmentParser('UpdateFrom').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeFromKeyword', WhitespaceLikeParser),
      key('fromKeyword', KeywordParser.FROM),
      key('inner', c.oneOf(fragmentParser('UpdateFrom_TableOrSubquery'), fragmentParser('UpdateFrom_JoinClause')))
    )
  )
);

fragmentParser('UpdateFrom_TableOrSubquery').setParser(
  c.apply(nonEmptyCommaSingleList(nodeParser('TableOrSubquery')), (tableOrSubqueries) => ({ variant: 'TableOrSubquery', tableOrSubqueries }))
);

fragmentParser('UpdateFrom_JoinClause').setParser(
  c.keyed({ variant: 'JoinClause' }, (key) => c.keyedPipe(key('whitespaceBeforeJoinClause', WhitespaceLikeParser), key('joinClause', nodeParser('JoinClause'))))
);

nodeParser('UpdateStmtLimited').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('with', c.maybe(fragmentParser('StmtWith'))),
      key('updateKeyword', KeywordParser.UPDATE),
      key('or', c.maybe(fragmentParser('UpdateOr'))),
      key('whitespaceBeforeQualifiedTableName', WhitespaceLikeParser),
      key('qualifiedTableName', nodeParser('QualifiedTableName')),
      key('whitespaceBeforeSet', WhitespaceLikeParser),
      key('setItems', fragmentParser('UpdateSetItems')),
      key('from', fragmentParser('UpdateFrom')),
      key('where', c.maybe(fragmentParser('UpdateStmt_LimitedWhere'))),
      key('orderBy', c.maybe(fragmentParser('OrderBy'))),
      key('limit', c.maybe(fragmentParser('Limit')))
    )
  )
);

fragmentParser('UpdateSetItems').setParser(
  nonEmptyCommaList(c.oneOf(fragmentParser('UpdateSetItems_ColumnName'), fragmentParser('UpdateSetItems_ColumnNameList')))
);

fragmentParser('UpdateSetItems_ColumnName').setParser(
  c.keyed({ variant: 'ColumnName' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeColumnName', WhitespaceLikeParser),
      key('columnName', IdentifierParser),
      key('whitespaceBeforeEqual', MaybeWhitespaceLikeParser),
      equalParser,
      key('whitespaceBeforeExpr', MaybeWhitespaceLikeParser),
      key('expr', ExprParser)
    )
  )
);

fragmentParser('UpdateSetItems_ColumnNameList').setParser(
  c.keyed({ variant: 'ColumnNameList' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeColumnNameList', WhitespaceLikeParser),
      key('columnNameList', nodeParser('ColumnNameList')),
      key('whitespaceBeforeEqual', MaybeWhitespaceLikeParser),
      equalParser,
      key('whitespaceBeforeExpr', MaybeWhitespaceLikeParser),
      key('expr', ExprParser)
    )
  )
);

nodeParser('UpsertClause').setParser(c.apply(nonEmptyList(fragmentParser('UpsertClause_Item')), (items) => ({ items })));

fragmentParser('UpsertClause_Item').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('onKeyword', KeywordParser.ON),
      key('whitespaceBeforeConflictKeyword', WhitespaceLikeParser),
      key('conflictKeyword', KeywordParser.CONFLICT),
      key('target', c.maybe(fragmentParser('UpsertClause_Item_Target'))),
      key('whitespaceBeforeDoKeyword', WhitespaceLikeParser),
      key('doKeyword', KeywordParser.DO),
      key('inner', c.oneOf(fragmentParser('UpsertClause_Item_Nothing'), fragmentParser('UpsertClause_Item_UpdateSet')))
    )
  )
);

fragmentParser('UpsertClause_Item_Target').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeOpenParent', WhitespaceLikeParser),
      openParentParser,
      key('indexedColumns', nonEmptyCommaSingleList(nodeParser('IndexedColumn'))),
      key('whitespaceBeforeCloseParent', WhitespaceLikeParser),
      closeParentParser,
      key('where', c.maybe(fragmentParser('Where')))
    )
  )
);

fragmentParser('UpsertClause_Item_Nothing').setParser(
  c.keyed({ variant: 'Nothing' }, (key) =>
    c.keyedPipe(key('whitespaceBeforeNothingKeyword', WhitespaceLikeParser), key('nothingKeyword', KeywordParser.NOTHING))
  )
);

fragmentParser('UpsertClause_Item_UpdateSet').setParser(
  c.keyed({ variant: 'UpdateSet' }, (key) =>
    c.keyedPipe(
      key('whitespaceBeforeUpdateKeyword', WhitespaceLikeParser),
      key('updateKeyword', KeywordParser.UPDATE),
      key('whitespaceBeforeSetKeyword', WhitespaceLikeParser),
      key('setKeyword', KeywordParser.SET),
      key('setItems', fragmentParser('UpdateSetItems')),
      key('where', c.maybe(fragmentParser('Where')))
    )
  )
);

nodeParser('VacuumStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('vacuumKeyword', KeywordParser.VACUUM),
      key('schemaName', c.maybe(fragmentParser('VacuumStmt_SchemaName'))),
      key('into', c.maybe(fragmentParser('VacuumStmt_Into')))
    )
  )
);

fragmentParser('VacuumStmt_SchemaName').setParser(
  c.keyed((key) => c.keyedPipe(key('whitespaceBeforeSchemaName', WhitespaceLikeParser), key('schemaName', IdentifierParser)))
);

fragmentParser('VacuumStmt_Into').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('whitespaceBeforeIntoKeyword', WhitespaceLikeParser),
      key('intoKeyword', KeywordParser.INTO),
      key('whitespaceBeforeFilename', WhitespaceLikeParser),
      key('filename', nodeParser('StringLiteral'))
    )
  )
);

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

function createKeyword(str: string): Parser<string, Ctx> {
  return c.keyword<Ctx>(KEYWORD_RAW_REGEXP, str);
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

function manySepByResultToArray<T>(result: c.ManySepByResult<T, any>): Array<T> {
  if (result === null) {
    return [];
  }
  return [result.head, ...result.tail.map((v) => v.item)];
}

function nonEmptyCommaSingleList<T>(itemParser: Parser<T, Ctx>): Parser<NonEmptyCommaListSingle<T>, Ctx> {
  return nonEmptyListSepBy(
    c.apply(c.pipe(MaybeWhitespaceLikeParser, itemParser), ([whitespaceBeforeItem, item]) => ({ whitespaceBeforeItem, item })),
    c.apply(c.pipe(MaybeWhitespaceLikeParser, commaParser), ([whitespaceBeforeComma]) => ({ whitespaceBeforeComma }))
  );
}

function mergeParts(left: ExprPart, right: ExprPart, parentPath: Array<string>, ctx: Ctx): { type: 'Success'; part: ExprPart } | ParseResultFailure {
  const start = left._result.start;
  const end = right._result.end;
  const rest = right._result.rest;
  // These operator are expected to be the rigth item
  if (left.variant === 'Collate' || left.variant === 'In' || left.variant === 'Isnull' || left.variant === 'Notnull' || left.variant === 'NotNull') {
    return ParseFailure(start, parentPath, `Unexpected ${left.variant} in left position`);
  }
  if (left.variant === 'Not') {
    if (right.variant !== 'Expr') {
      return ParseFailure(right._result.start, parentPath, 'Expecting Expression');
    }
    const expr = ctx.createNode('Not', start, end, {
      notKeyword: left.notKeyword,
      whitespaceBeforeExpr: left.whitespaceBeforeNotKeyword,
      expr: right.expr as any,
    });
    return { type: 'Success', part: { variant: 'Expr', expr, _result: ParseSuccess(start, rest, expr) } };
  }
  if (right.variant === 'Escape') {
    if (left.variant !== 'Like') {
      return ParseFailure(right._result.start, parentPath, 'Unexpected Escape');
    }
    if (left.escape) {
      return ParseFailure(right._result.start, parentPath, 'Unexpected Escape');
    }
    const escapeNode = ctx.createNode('Escape', right._result.start, right._result.end, {
      escapeKeyword: right.escapeKeyword,
      whitespaceBeforeExpr: right.whitespaceBeforeExpr,
      expr: right.expr,
    });
    const updateLikePart: Fragment<'ExprChain_Item_Like'> = {
      ...left,
      escape: { whitespaceBeforeEscape: right.whitespaceBeforeEscapeKeyword, escape: escapeNode },
    };
    return {
      type: 'Success',
      part: { ...updateLikePart, _result: ParseSuccess(start, rest, updateLikePart) },
    };
  }
  if (left.variant === 'Between' && right.variant === 'And' && left.and === undefined) {
    const updateBetweenPart: Fragment<'ExprChain_Item_Between'> = {
      ...left,
      and: right,
    };
    return {
      type: 'Success',
      part: { ...updateBetweenPart, _result: ParseSuccess(start, rest, updateBetweenPart) },
    };
  }
  if (left.variant === 'Expr') {
    const expr = mergePartWithExpr(left.expr, right, start, end, parentPath, ctx);
    return {
      type: 'Success',
      part: {
        ...left,
        expr: expr as any,
        _result: ParseSuccess(start, rest, expr),
      },
    };
  }
  throw new Error(`Unexpected Left ${left.variant}`);
}

function mergePartWithExpr(
  leftExpr: any,
  part: ExprPart,
  start: number,
  end: number,
  parentPath: Array<string>,
  ctx: Ctx
): Fragment<'ExprP01'> | ParseResultFailure {
  if (part.variant === 'Expr' || part.variant === 'Collate' || part.variant === 'Escape' || part.variant === 'Not') {
    return ParseFailure(part._result.start, parentPath, `Unexpected ${part.variant}`);
  }
  if (
    part.variant === 'Concatenate' ||
    part.variant === 'Multiply' ||
    part.variant === 'Divide' ||
    part.variant === 'Modulo' ||
    part.variant === 'Add' ||
    part.variant === 'Subtract' ||
    part.variant === 'BitwiseAnd' ||
    part.variant === 'BitwiseOr' ||
    part.variant === 'BitwiseShiftLeft' ||
    part.variant === 'BitwiseShiftRight' ||
    part.variant === 'GreaterThan' ||
    part.variant === 'LowerThan' ||
    part.variant === 'GreaterOrEqualThan' ||
    part.variant === 'LowerOrEqualThan' ||
    false
  ) {
    return ctx.createNode(part.variant, start, end, {
      leftExpr,
      whitespaceBeforeOperator: part.whitespaceBeforeOperator,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'Is') {
    return ctx.createNode('Is', start, end, {
      leftExpr,
      whitespaceBeforeIsKeyword: part.whitespaceBeforeIsKeyword,
      isKeyword: part.isKeyword,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'And') {
    return ctx.createNode('And', start, end, {
      leftExpr,
      whitespaceBeforeAndKeyword: part.whitespaceBeforeAndKeyword,
      andKeyword: part.andKeyword,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'Or') {
    return ctx.createNode('Or', start, end, {
      leftExpr,
      whitespaceBeforeOrKeyword: part.whitespaceBeforeOrKeyword,
      orKeyword: part.orKeyword,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'Equal') {
    return ctx.createNode('Equal', start, end, {
      leftExpr,
      whitespaceBeforeOperator: part.whitespaceBeforeOperator,
      operator: part.operator,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'Different') {
    return ctx.createNode('Different', start, end, {
      leftExpr,
      whitespaceBeforeOperator: part.whitespaceBeforeOperator,
      operator: part.operator,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'Match') {
    return ctx.createNode('Match', start, end, {
      leftExpr,
      not: part.not,
      whitespaceBeforeMatchKeyword: part.whitespaceBeforeMatchKeyword,
      matchKeyword: part.matchKeyword,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'Glob') {
    return ctx.createNode('Glob', start, end, {
      leftExpr,
      not: part.not,
      whitespaceBeforeGlobKeyword: part.whitespaceBeforeGlobKeyword,
      globKeyword: part.globKeyword,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'Regexp') {
    return ctx.createNode('Regexp', start, end, {
      leftExpr,
      not: part.not,
      whitespaceBeforeRegexpKeyword: part.whitespaceBeforeRegexpKeyword,
      regexpKeyword: part.regexpKeyword,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'IsNot') {
    return ctx.createNode('IsNot', start, end, {
      leftExpr,
      whitespaceBeforeIsKeyword: part.whitespaceBeforeIsKeyword,
      isKeyword: part.isKeyword,
      whitespaceBeforeNotKeyword: part.whitespaceBeforeNotKeyword,
      notKeyword: part.notKeyword,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
    });
  }
  if (part.variant === 'Between') {
    if (part.and === undefined) {
      return ParseFailure(part._result.start, parentPath, `Missing And after Between`);
    }
    return ctx.createNode('Between', start, end, {
      expr: leftExpr,
      not: part.not,
      whitespaceBeforeBetweenKeyword: part.whitespaceBeforeBetweenKeyword,
      betweenKeyword: part.betweenKeyword,
      whitespaceBeforeBetweenExpr: part.whitespaceBeforeBetweenExpr,
      betweenExpr: part.betweenExpr,
      whitespaceBeforeAndKeyword: part.and.whitespaceBeforeAndKeyword,
      andKeyword: part.and.andKeyword,
      whitespaceBeforeAndExpr: part.and.whitespaceBeforeRightExpr,
      andExpr: part.and.rightExpr,
    });
  }
  if (part.variant === 'In') {
    return ctx.createNode('In', start, end, {
      expr: leftExpr,
      not: part.not,
      whitespaceBeforeInKeyword: part.whitespaceBeforeInKeyword,
      inKeyword: part.inKeyword,
      values: part.values,
    });
  }
  if (part.variant === 'Like') {
    return ctx.createNode('Like', start, end, {
      leftExpr,
      not: part.not,
      whitespaceBeforeLikeKeyword: part.whitespaceBeforeLikeKeyword,
      likeKeyword: part.likeKeyword,
      whitespaceBeforeRightExpr: part.whitespaceBeforeRightExpr,
      rightExpr: part.rightExpr,
      escape: part.escape,
    });
  }
  if (part.variant === 'Isnull') {
    return ctx.createNode('Isnull', start, end, {
      expr: leftExpr,
      whitespaceBeforeIsnullKeyword: part.whitespaceBeforeIsnullKeyword,
      isnullKeyword: part.isnullKeyword,
    });
  }
  if (part.variant === 'Notnull') {
    return ctx.createNode('Notnull', start, end, {
      expr: leftExpr,
      whitespaceBeforeNotnullKeyword: part.whitespaceBeforeNotnullKeyword,
      notnullKeyword: part.notnullKeyword,
    });
  }
  if (part.variant === 'NotNull') {
    return ctx.createNode('NotNull', start, end, {
      expr: leftExpr,
      whitespaceBeforeNotKeyword: part.whitespaceBeforeNotKeyword,
      notKeyword: part.notKeyword,
      whitespaceBeforeNullKeyword: part.whitespaceBeforeNullKeyword,
      nullKeyword: part.nullKeyword,
    });
  }
  return expectNever(part);
}

function findHighestPrecedencePart(parts: Array<ExprPart>): ExprPart {
  let current: { precedence: number; part: ExprPart } = { part: parts[0], precedence: getPartPrecedence(null, parts[0]) };
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const previousPart = parts[i - 1];
    const precedence = getPartPrecedence(previousPart, part);
    if (current === null || precedence > current.precedence) {
      current = { part, precedence };
    }
  }
  return current.part;
}

function getPartPrecedence(previousPart: null | ExprPart, part: ExprPart): number {
  if (part.variant === 'Expr') {
    return 0;
  }
  if (part.variant === 'And') {
    if (previousPart && previousPart.variant === 'Between' && previousPart.and === undefined) {
      return OperatorPrecedence.Between;
    }
  }
  if (part.variant === 'Between' && part.and === undefined) {
    return 0;
  }
  return OperatorPrecedence[part.variant];
}
