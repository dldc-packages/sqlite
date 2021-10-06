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

export const KeywordParser: { [K in typeof KEYWORDS[number]]: Parser<K, Ctx> } = Object.fromEntries(KEYWORDS.map((k) => [k, createKeyword(k)])) as any;

interface NodeRule<K extends NodeKind> extends Parser<Node<K>, Ctx> {
  setParser(parser: Parser<NodeData[K], Ctx>): void;
}

// prettier-ignore
type VirtualNodes ='Add' | 'And' | 'Between' | 'BitwiseOr' | 'BitwiseShiftLeft' | 'BitwiseShiftRight' | 'Collate' | 'Concatenate' | 'Different' | 'Divide' | 'Equal' | 'Escape' | 'Glob' | 'GreaterOrEqualThan' | 'GreaterThan' | 'In' | 'Is' | 'IsNot' | 'IsNull' | 'Like' | 'LowerOrEqualThan' | 'LowerThan' | 'Match' | 'Modulo' | 'Multiply' | 'Not_Null' | 'Not' | 'NotNull' | 'Or' | 'Regexp' | 'Subtract';
type NodeParserKeys = Exclude<NodeKind, VirtualNodes>;

export const NodeParser: { [K in NodeParserKeys]?: NodeRule<K> } = {};

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

function fragmentParser<K extends FragmentParserKeys>(kind: K): Rule<Fragment<K>, Ctx> {
  if (FragmentParser[kind] === undefined) {
    FragmentParser[kind] = c.rule(kind) as any;
  }
  return FragmentParser[kind] as any;
}

const WhitespaceLikeParser = fragmentParser('WhitespaceLike');
const MaybeWhitespaceLikeParser = c.maybe(WhitespaceLikeParser);
const IdentifierParser = nodeParser('Identifier');

nodeParser('AggregateFunctionInvocation').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('aggregateFunc', IdentifierParser),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      openParentParser,
      key('parameters', c.maybe(fragmentParser('AggregateFunctionInvocation_Paramters'))),
      key('whitespaceBeforeCloseParent', MaybeWhitespaceLikeParser),
      closeParentParser,
      key('filterClause', c.maybe(fragmentParser('FilterClauseWithWhitespace')))
    )
  )
);

fragmentParser('WhitespaceLike').setParser(c.many(c.oneOf(nodeParser('Whitespace'), nodeParser('CommentSyntax')), { allowEmpty: false }));

fragmentParser('AggregateFunctionInvocation_Paramters').setParser(
  c.oneOf(fragmentParser('AggregateFunctionInvocation_Paramters_Star'), fragmentParser('AggregateFunctionInvocation_Paramters_Exprs'))
);

fragmentParser('AggregateFunctionInvocation_Paramters_Star').setParser(
  c.apply(c.pipe(MaybeWhitespaceLikeParser, starParser), ([whitespaceBeforeStar, _star]) => ({ variant: 'Star', whitespaceBeforeStar }))
);

fragmentParser('AggregateFunctionInvocation_Paramters_Exprs').setParser(
  c.apply(
    c.pipe(c.maybe(fragmentParser('AggregateFunctionInvocation_Paramters_Exprs_Distinct')), nonEmptyCommaSingleList(fragmentParser('Expr'))),
    ([distinct, exprs]) => ({ variant: 'Exprs', distinct, exprs })
  )
);

fragmentParser('AggregateFunctionInvocation_Paramters_Exprs_Distinct').setParser(
  c.apply(c.pipe(MaybeWhitespaceLikeParser, KeywordParser.DISTINCT), ([whitespaceBeforeDistinctKeyword, distinctKeyword]) => ({
    whitespaceBeforeDistinctKeyword,
    distinctKeyword,
  }))
);

fragmentParser('FilterClauseWithWhitespace').setParser(
  c.apply(c.pipe(MaybeWhitespaceLikeParser, nodeParser('FilterClause')), ([whitespaceBefore, filterClause]) => ({ whitespaceBefore, filterClause }))
);

nodeParser('AlterTableStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      KeywordParser.ALTER,
      key('whitespaceBeforeTableKeyword', WhitespaceLikeParser),
      KeywordParser.TABLE,
      key('whitespaceBeforeTable', WhitespaceLikeParser),
      key('table', fragmentParser('SchemaTable')),
      key('whitespaceBeforeAction', WhitespaceLikeParser),
      key('action', fragmentParser('AlterAction'))
    )
  )
);

fragmentParser('SchemaTable').setParser(
  c.apply(c.pipe(c.maybe(fragmentParser('SchemaItem_Schema')), IdentifierParser), ([schema, table]) => ({ schema, table }))
);

fragmentParser('SchemaItem_Schema').setParser(
  c.apply(
    c.pipe(IdentifierParser, MaybeWhitespaceLikeParser, dotParser, MaybeWhitespaceLikeParser),
    ([schemaName, whitespaceBeforeDot, _dot, whitespaceAfter]) => ({ schemaName, whitespaceBeforeDot, whitespaceAfter })
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
  c.apply(
    c.pipe(KeywordParser.RENAME, WhitespaceLikeParser, KeywordParser.TO, WhitespaceLikeParser, IdentifierParser),
    ([_rename, whitespaceBeforeTo, _to, whitespaceBeforeNewTableName, newTableName]) => ({
      variant: 'RenameTo',
      whitespaceBeforeTo,
      whitespaceBeforeNewTableName,
      newTableName,
    })
  )
);

fragmentParser('AlterAction_RenameColumn').setParser(
  c.apply(
    c.pipe(
      KeywordParser.RENAME,
      c.maybe(fragmentParser('AlterTableStmt_Column')),
      WhitespaceLikeParser,
      IdentifierParser,
      WhitespaceLikeParser,
      KeywordParser.TO,
      WhitespaceLikeParser,
      IdentifierParser
    ),
    ([_rename, column, whitespaceBeforeColumnName, columnName, whitespaceBeforeTo, _to, whitespaceBeforeNewColumnName, newColumnName]) => ({
      variant: 'RenameColumn',
      column,
      whitespaceBeforeColumnName,
      columnName,
      whitespaceBeforeTo,
      whitespaceBeforeNewColumnName,
      newColumnName,
    })
  )
);

fragmentParser('AlterTableStmt_Column').setParser(
  c.apply(c.pipe(WhitespaceLikeParser, KeywordParser.COLUMN), ([whitespaceBeforeColumnKeyword, _column]) => ({ whitespaceBeforeColumnKeyword }))
);

fragmentParser('AlterAction_AddColumn').setParser(
  c.apply(
    c.pipe(KeywordParser.ADD, c.maybe(fragmentParser('AlterTableStmt_Column')), WhitespaceLikeParser, nodeParser('ColumnDef')),
    ([_add, column, whitespaceBeforeColumnDef, columnDef]) => ({ variant: 'AddColumn', column, whitespaceBeforeColumnDef, columnDef })
  )
);

fragmentParser('AlterAction_DropColumn').setParser(
  c.apply(
    c.pipe(KeywordParser.DROP, c.maybe(fragmentParser('AlterTableStmt_Column')), WhitespaceLikeParser, IdentifierParser),
    ([_add, column, whitespaceBeforeColumnDef, columnName]) => ({ variant: 'DropColumn', column, whitespaceBeforeColumnDef, columnName })
  )
);

nodeParser('AnalyzeStmt').setParser(
  c.apply(c.pipe(KeywordParser.ANALYZE, c.maybe(fragmentParser('AnalyzeStmt_Target'))), ([_analyze, target]) => ({ target }))
);

fragmentParser('AnalyzeStmt_Target').setParser(c.oneOf(fragmentParser('AnalyzeStmt_Target_Single'), fragmentParser('AnalyzeStmt_Target_WithSchema')));

fragmentParser('AnalyzeStmt_Target_Single').setParser(
  c.apply(c.pipe(WhitespaceLikeParser, IdentifierParser), ([whitespaceBeforeName, name]) => ({ variant: 'Single', whitespaceBeforeName, name }))
);

fragmentParser('AnalyzeStmt_Target_WithSchema').setParser(
  c.apply(
    c.pipe(WhitespaceLikeParser, IdentifierParser, MaybeWhitespaceLikeParser, dotParser, MaybeWhitespaceLikeParser, IdentifierParser),
    ([whitespaceBeforeSchemaName, schemaName, whitespaceBeforeDot, _dot, whitespaceBeforeIndexOrTableName, indexOrTableName]) => ({
      variant: 'WithSchema',
      whitespaceBeforeSchemaName,
      schemaName,
      whitespaceBeforeDot,
      whitespaceBeforeIndexOrTableName,
      indexOrTableName,
    })
  )
);

nodeParser('AttachStmt').setParser(
  c.keyed((key) =>
    c.keyedPipe(
      key('attachKeyword', KeywordParser.ATTACH),
      key('database', c.maybe(fragmentParser('AttachStmt_Database'))),
      key('whitespaceBeforeExpr', WhitespaceLikeParser),
      key('expr', fragmentParser('Expr')),
      key('whitespaceBeforeAsKeyword', WhitespaceLikeParser),
      key('asKeyword', KeywordParser.AS),
      key('whitespaceBeforeSchemaName', WhitespaceLikeParser),
      key('schemaName', IdentifierParser)
    )
  )
);

// nodeParser('Whitespace').setParser(c.apply(whitespaceRawParser, (content) => ({ content })));

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

// fragmentParser('MultilineComment').setParser(
//   c.apply(c.manyBetween(multilineCommentStartParser, c.oneOf(notStarParser, starParser), multilineCommentEndParser), ([_open, items, _close]) => {
//     const content = items.join('');
//     return { variant: 'Multiline', content };
//   })
// );

// fragmentParser('SingleLineComment').setParser(
//   c.apply(c.pipe(singleLineCommentStart, notNewLineParser, c.oneOf(newLineParser, c.eof())), ([_open, content, close]) => {
//     return { variant: 'SingleLine', content, close: close === null ? 'EOF' : 'NewLine' };
//   })
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

// fragmentParser('AnalyzeStmtInner').setParser(
//   c.apply(
//     c.oneOf(
//       c.pipe(WLParser, nodeParser('Identifier'), WLParser),
//       c.pipe(WLParser, nodeParser('Identifier'), MaybeWlParser, dotParser, MaybeWlParser, nodeParser('Identifier'), MaybeWlParser)
//     ),
//     (res) => {
//       if (res.length === 3) {
//         const [schemaTableOtIndexNameWhitespace, schemaTableOtIndexName] = res;
//         return { variant: 'Single', schemaTableOtIndexNameWhitespace, schemaTableOtIndexName };
//       }
//       const [schemaNameWhitespace, schemaName, dotWhitespace, _dot, indexOrTableNameWhitespace, indexOrTableName] = res;
//       return {
//         variant: 'WithSchema',
//         schemaNameWhitespace,
//         schemaName,
//         dotWhitespace,
//         indexOrTableName,
//         indexOrTableNameWhitespace,
//       };
//     }
//   )
// );

// nodeParser('AnalyzeStmt').setParser(c.apply(c.pipe(KeywordParser.ANALYZE, c.maybe(fragmentParser('AnalyzeStmtInner'))), ([_analyze, inner]) => ({ inner })));

// nodeParser('AttachStmt').setParser(
//   c.apply(
//     c.pipe(
//       KeywordParser.ATTACH,
//       c.maybe(c.pipe(WLParser, KeywordParser.DATABASE)),
//       WLParser,
//       fragmentParser('Expr'),
//       WLParser,
//       KeywordParser.AS,
//       WLParser,
//       nodeParser('Identifier')
//     ),
//     ([_attach, database, exprWhitespace, expr, asWhitespace, _as, schemaNameWhitespace, schemaName]) => {
//       return {
//         database: mapIfExist(database, ([databaseWhitespace, _database]) => ({ databaseWhitespace })),
//         exprWhitespace,
//         expr,
//         asWhitespace,
//         schemaNameWhitespace,
//         schemaName,
//       };
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
