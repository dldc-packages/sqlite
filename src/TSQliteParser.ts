/* eslint-disable no-control-regex */
import * as c from './Combinator';
import {
  NodeKind,
  Node,
  NodeBase,
  NodeData,
  NODES_OBJ,
  NonEmptyList,
  NonEmptyListSepBy,
  NonEmptyCommaList,
  NonEmptyCommaListSingle,
  FragmentName,
  Fragment,
  FRAGMENTS_OBJ,
  ExprChainItemOpExpr,
  ExprChainItemMaybeNotOpExpr,
} from './Ast';
import { Complete, Parser, ParseResult, ParseResultFailure, ParseResultSuccess, Rule } from './types';
import { TSQliteError } from './TSQliteError';
import { StringReader } from './StringReader';
import { executeParser, failureToStack, ParseFailure, ParseSuccess } from './Parser';
import { KEYWORDS } from './Keyword';
import { OperatorPrecedence } from './Operators';

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
  return parseAdvanced(NodeParser.SqlStmtList, file);
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
const rawIdentifierParser = createRegexp('RawIdentifier', /^[A-Za-z_\u007f-\uffff][0-9A-Za-z_\u007f-\uffff$]+/g);

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

type NodeParserKeys = { [K in NodeKind]: typeof NODES_OBJ[K] extends false ? never : K }[NodeKind];

export const NodeParser: { [K in NodeParserKeys]: NodeRule<K> } = Object.fromEntries(
  Object.keys(NODES_OBJ).map((kind) => {
    const innerRule = c.rule<any, Ctx>(kind);
    const rule: NodeRule<NodeKind> = {
      ...innerRule,
      setParser: (parser: any) => {
        return innerRule.setParser(c.apply(parser, (data, start, end, ctx) => ctx.createNode(kind as any, start, end, data as any)));
      },
    };
    return [kind, rule];
  })
) as any;

type FragmentParserKeys = { [K in FragmentName]: typeof FRAGMENTS_OBJ[K] extends false ? never : K }[FragmentName];

export const FragmentParser: { [K in FragmentParserKeys]: Rule<Fragment<K>, Ctx> } = Object.fromEntries(
  Object.keys(FRAGMENTS_OBJ)
    .map((kind) => {
      if ((FRAGMENTS_OBJ as any)[kind] === false) {
        return [kind, undefined];
      }
      return [kind, c.rule(kind)];
    })
    .filter(([_, v]) => v !== undefined)
) as any;

const WLParser = FragmentParser.WhitespaceLike;
const MaybeWlParser = c.maybe(WLParser);

NodeParser.Whitespace.setParser(c.apply(whitespaceRawParser, (content) => ({ content })));

FragmentParser.WhitespaceLike.setParser(c.many(c.oneOf(NodeParser.Whitespace, NodeParser.CommentSyntax), { allowEmpty: false }));

FragmentParser.IdentifierBasic.setParser(
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

FragmentParser.IdentifierBrackets.setParser(
  c.apply(c.regexp<Ctx>(/^\[.+\]/g), (val) => ({
    variant: 'Brackets',
    name: val.slice(1, -1),
  }))
);

FragmentParser.IdentifierDoubleQuote.setParser(
  c.apply(c.manyBetween(doubleQuoteParser, c.oneOf(notDoubleQuoteParser, doubleDoubleQuoteParser), doubleQuoteParser), ([_open, items, _close]) => ({
    variant: 'DoubleQuote',
    name: items.map((v) => (v === DOUBLE_DOUBLE_QUOTE ? DOUBLE_QUOTE : v)).join(''),
  }))
);

FragmentParser.IdentifierBacktick.setParser(
  c.apply(c.manyBetween(backtickParser, c.oneOf(notBacktickParser, doubleBacktickParser), backtickParser), ([_open, items, _close]) => ({
    variant: 'Backtick',
    name: items.map((v) => (v === DOUBLE_BACKTICK ? BACKTICK : v)).join(''),
  }))
);

NodeParser.Identifier.setParser(
  c.oneOf(FragmentParser.IdentifierBasic, FragmentParser.IdentifierBrackets, FragmentParser.IdentifierDoubleQuote, FragmentParser.IdentifierBacktick)
);

NodeParser.StringLiteral.setParser(
  c.apply(c.manyBetween(singleQuoteParser, c.oneOf(notSingleQuoteParser, doubleSingleQuoteParser), singleQuoteParser), ([_open, items, _close]) => ({
    content: items.map((v) => (v === DOUBLE_SINGLE_QUOTE ? SINGLE_QUOTE : v)).join(''),
  }))
);

FragmentParser.MultilineComment.setParser(
  c.apply(c.manyBetween(multilineCommentStartParser, c.oneOf(notStarParser, starParser), multilineCommentEndParser), ([_open, items, _close]) => {
    const content = items.join('');
    return { variant: 'Multiline', content };
  })
);

FragmentParser.SingleLineComment.setParser(
  c.apply(c.pipe(singleLineCommentStart, notNewLineParser, c.oneOf(newLineParser, c.eof())), ([_open, content, close]) => {
    return { variant: 'SingleLine', content, close: close === null ? 'EOF' : 'NewLine' };
  })
);

NodeParser.CommentSyntax.setParser(c.oneOf(FragmentParser.MultilineComment, FragmentParser.SingleLineComment));

NodeParser.BlobLiteral.setParser(
  c.apply(blobParser, (raw) => ({
    xCase: raw[0] === 'x' ? 'lowercase' : 'uppercase',
    content: raw.slice(2, -1),
  }))
);

FragmentParser.Exponent.setParser(
  c.apply(exponentiationSuffixRawParser, (raw) => {
    return { raw, value: parseInt(raw.slice(1)) };
  })
);

FragmentParser.NumericLiteralInteger.setParser(
  c.apply(c.pipe(integerParser, c.maybe(dotParser), c.maybe(FragmentParser.Exponent)), ([raw, _dot, exponent]) => {
    return {
      variant: 'Integer',
      interger: parseInt(raw, 10),
      exponent,
    };
  })
);

FragmentParser.NumericLiteralHex.setParser(
  c.apply(hexParser, (raw) => ({
    variant: 'Hex',
    xCase: raw[1] === 'x' ? 'lowercase' : 'uppercase',
    value: parseInt(raw.slice(2), 16),
  }))
);

FragmentParser.NumericLiteralFloat.setParser(
  c.apply(c.pipe(c.maybe(integerParser), dotParser, integerParser, c.maybe(FragmentParser.Exponent)), ([integral, _dot, fractional, exponent]) => {
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

NodeParser.NumericLiteral.setParser(c.oneOf(FragmentParser.NumericLiteralInteger, FragmentParser.NumericLiteralHex, FragmentParser.NumericLiteralFloat));

FragmentParser.ParameterName.setParser(
  c.apply(c.pipe(parameterRawNameParser, c.many(c.pipe(colonPairParser, parameterRawNameParser)), c.maybe(parameterSuffixParser)), ([name, items, suffix]) => ({
    name: name + items.map(([colonPair, param]) => colonPair + param).join(''),
    suffix: mapIfExist(suffix, (v) => v.slice(1, -1)),
  }))
);

FragmentParser.BindParameterIndexed.setParser(c.apply(questionMarkParser, (_raw) => ({ variant: 'Indexed' })));

FragmentParser.BindParameterNumbered.setParser(
  c.apply(c.pipe(questionMarkParser, integerParser), ([_questionMark, rawNum]) => ({
    variant: 'Numbered',
    number: parseInt(rawNum, 10),
  }))
);

FragmentParser.BindParameterAtNamed.setParser(
  c.apply(c.pipe(atParser, FragmentParser.ParameterName), ([_at, { name, suffix }]) => ({
    variant: 'AtNamed',
    name,
    suffix,
  }))
);

FragmentParser.BindParameterColonNamed.setParser(
  c.apply(c.pipe(colonParser, FragmentParser.ParameterName), ([_colon, { name, suffix }]) => {
    return { variant: 'ColonNamed', name, suffix };
  })
);

FragmentParser.BindParameterDollarNamed.setParser(
  c.apply(c.pipe(dollarParser, FragmentParser.ParameterName), ([_dollar, { name, suffix }]) => ({
    variant: 'DollarNamed',
    name,
    suffix,
  }))
);

NodeParser.BindParameter.setParser(
  c.oneOf(
    FragmentParser.BindParameterIndexed,
    FragmentParser.BindParameterNumbered,
    FragmentParser.BindParameterAtNamed,
    FragmentParser.BindParameterColonNamed,
    FragmentParser.BindParameterDollarNamed
  )
);

NodeParser.Null.setParser(c.apply(KeywordParser.NULL, (_, start, end, ctx) => ctx.createNode<'Null'>('Null', start, end, {})));

NodeParser.True.setParser(c.apply(KeywordParser.TRUE, (_, start, end, ctx) => ctx.createNode<'True'>('True', start, end, {})));

NodeParser.False.setParser(c.apply(KeywordParser.FALSE, (_, start, end, ctx) => ctx.createNode<'False'>('False', start, end, {})));

NodeParser.CurrentTime.setParser(c.apply(KeywordParser.CURRENT_TIME, (_, start, end, ctx) => ctx.createNode<'CurrentTime'>('CurrentTime', start, end, {})));

NodeParser.CurrentDate.setParser(c.apply(KeywordParser.CURRENT_DATE, (_, start, end, ctx) => ctx.createNode<'CurrentDate'>('CurrentDate', start, end, {})));

NodeParser.CurrentTimestamp.setParser(
  c.apply(KeywordParser.CURRENT_TIMESTAMP, (_, start, end, ctx) => ctx.createNode<'CurrentTimestamp'>('CurrentTimestamp', start, end, {}))
);

FragmentParser.LiteralValue.setParser(
  c.oneOf(
    NodeParser.NumericLiteral,
    NodeParser.StringLiteral,
    NodeParser.BlobLiteral,
    NodeParser.Null,
    NodeParser.True,
    NodeParser.False,
    NodeParser.CurrentTime,
    NodeParser.CurrentDate,
    NodeParser.CurrentTimestamp
  )
);

FragmentParser.SqlStmtListItem.setParser(
  c.apply(
    c.oneOf(
      c.pipe(MaybeWlParser, NodeParser.SqlStmt, MaybeWlParser),
      c.apply(MaybeWlParser, (v) => ({ whitespaceLike: v }))
    ),
    (item) => {
      if (Array.isArray(item)) {
        const [whitespaceBefore, stmt, whitespaceAfter] = item;
        return { variant: 'Stmt', whitespaceBefore, stmt, whitespaceAfter };
      }
      if (item.whitespaceLike === undefined || item.whitespaceLike.length === 0) {
        return { variant: 'Empty' };
      }
      return { variant: 'Whitespace', whitespace: item.whitespaceLike };
    }
  )
);

NodeParser.SqlStmtList.setParser(
  c.apply(c.pipe(c.manySepBy(FragmentParser.SqlStmtListItem, semicolonParser), eofParser), ([items]) => {
    const list = manySepByResultToArray(items);
    if (list.length === 1 && list[0].variant === 'Empty') {
      return { items: [] };
    }
    return { items: list };
  })
);

FragmentParser.SqlStmtExplain.setParser(
  c.apply(
    c.pipe(
      KeywordParser.EXPLAIN,
      c.maybe(
        c.pipe(FragmentParser.WhitespaceLike, c.pipe(KeywordParser.QUERY, FragmentParser.WhitespaceLike, KeywordParser.PLAN, FragmentParser.WhitespaceLike))
      ),
      MaybeWlParser
    ),
    ([_explain, queryPlan, whitespaceAfter]) => ({
      queryPlan: mapIfExist(
        queryPlan,
        ([queryWhitespace, [_query, planWhitespace, _plan]]): Complete<Fragment<'SqlStmtExplain'>['queryPlan']> => ({
          queryWhitespace,
          planWhitespace,
        })
      ),
      whitespaceAfter,
    })
  )
);

NodeParser.SqlStmt.setParser(
  c.apply(
    c.pipe(
      c.maybe(FragmentParser.SqlStmtExplain),
      c.oneOf<Node<'SqlStmt'>['stmt'], Ctx>(
        NodeParser.AnalyzeStmt,
        NodeParser.AttachStmt,
        NodeParser.BeginStmt,
        NodeParser.CommitStmt,
        NodeParser.CreateIndexStmt
        // NodeParser.CreateTableStmt,
        // NodeParser.CreateTriggerStmt,
        // NodeParser.CreateViewStmt,
        // NodeParser.CreateVirtualTableStmt,
        // NodeParser.DeleteStmt,
        // NodeParser.DeleteStmtLimited,
        // NodeParser.DetachStmt,
        // NodeParser.DropIndexStmt,
        // NodeParser.DropTableStmt,
        // NodeParser.DropTriggerStmt,
        // NodeParser.DropViewStmt,
        // NodeParser.InsertStmt,
        // NodeParser.PragmaStmt,
        // NodeParser.ReindexStmt,
        // NodeParser.ReleaseStmt,
        // NodeParser.RollbackStmt,
        // NodeParser.SavepointStmt,
        // NodeParser.SelectStmt,
        // NodeParser.UpdateStmt,
        // NodeParser.UpdateStmtLimited,
        // NodeParser.VacuumStmt
      )
    ),
    ([explain, stmt]) => {
      return { explain, stmt };
    }
  )
);

FragmentParser.AnalyzeStmtInner.setParser(
  c.apply(
    c.oneOf(
      c.pipe(WLParser, NodeParser.Identifier, WLParser),
      c.pipe(WLParser, NodeParser.Identifier, MaybeWlParser, dotParser, MaybeWlParser, NodeParser.Identifier, MaybeWlParser)
    ),
    (res) => {
      if (res.length === 3) {
        const [schemaTableOtIndexNameWhitespace, schemaTableOtIndexName] = res;
        return { variant: 'Single', schemaTableOtIndexNameWhitespace, schemaTableOtIndexName };
      }
      const [schemaNameWhitespace, schemaName, dotWhitespace, _dot, indexOrTableNameWhitespace, indexOrTableName] = res;
      return {
        variant: 'WithSchema',
        schemaNameWhitespace,
        schemaName,
        dotWhitespace,
        indexOrTableName,
        indexOrTableNameWhitespace,
      };
    }
  )
);

NodeParser.AnalyzeStmt.setParser(c.apply(c.pipe(KeywordParser.ANALYZE, c.maybe(FragmentParser.AnalyzeStmtInner)), ([_analyze, inner]) => ({ inner })));

NodeParser.AttachStmt.setParser(
  c.apply(
    c.pipe(
      KeywordParser.ATTACH,
      c.maybe(c.pipe(WLParser, KeywordParser.DATABASE)),
      WLParser,
      FragmentParser.Expr,
      WLParser,
      KeywordParser.AS,
      WLParser,
      NodeParser.Identifier
    ),
    ([_attach, database, exprWhitespace, expr, asWhitespace, _as, schemaNameWhitespace, schemaName]) => {
      return {
        database: mapIfExist(database, ([databaseWhitespace, _database]) => ({ databaseWhitespace })),
        exprWhitespace,
        expr,
        asWhitespace,
        schemaNameWhitespace,
        schemaName,
      };
    }
  )
);

FragmentParser.BeginStmtMode.setParser(
  c.apply(c.pipe(WLParser, c.oneOf(KeywordParser.DEFERRED, KeywordParser.IMMEDIATE, KeywordParser.EXCLUSIVE)), ([whitespace, keyword]) => {
    if (keyword === 'DEFERRED') {
      return { variant: 'Deferred', deferredWhitespace: whitespace };
    }
    if (keyword === 'EXCLUSIVE') {
      return { variant: 'Exclusive', exclusiveWhitespace: whitespace };
    }
    return { variant: 'Immediate', immediateWhitespace: whitespace };
  })
);

NodeParser.BeginStmt.setParser(
  c.apply(
    c.pipe(KeywordParser.BEGIN, c.maybe(FragmentParser.BeginStmtMode), c.maybe(c.pipe(WLParser, KeywordParser.TRANSACTION))),
    ([_begin, mode, transaction]) => ({
      mode,
      transaction: mapIfExist(transaction, ([transactionWhitespace, _transaction]) => ({ transactionWhitespace })),
    })
  )
);

NodeParser.CommitStmt.setParser(
  c.apply(c.pipe(c.oneOf(KeywordParser.COMMIT, KeywordParser.END), c.maybe(c.pipe(WLParser, KeywordParser.TRANSACTION))), ([action, transaction]) => ({
    action: action === 'COMMIT' ? { variant: 'Commit' } : { variant: 'End' },
    transaction: mapIfExist(transaction, ([transactionWhitespace, _transaction]) => ({ transactionWhitespace })),
  }))
);

FragmentParser.IfNotExists.setParser(
  c.apply(
    c.pipe(WLParser, KeywordParser.IF, WLParser, KeywordParser.NOT, WLParser, KeywordParser.EXISTS),
    ([ifWhitespace, _if, notWhitespace, _not, existsWhitespace, _exists]) => ({
      ifWhitespace,
      notWhitespace,
      existsWhitespace,
    })
  )
);

FragmentParser.SchemaItemTarget.setParser(
  c.oneOf(
    c.apply(
      c.pipe(NodeParser.Identifier, MaybeWlParser, dotParser, MaybeWlParser, NodeParser.Identifier),
      ([schemaName, dotWhitespace, _dot, itemNameWhitespace, itemName]) => ({
        variant: 'WithSchema',
        schemaName,
        dotWhitespace,
        itemNameWhitespace,
        itemName,
      })
    ),
    c.apply(NodeParser.Identifier, (itemName) => ({ variant: 'WithoutSchema', itemName }))
  )
);

FragmentParser.Where.setParser(
  c.apply(c.pipe(MaybeWlParser, KeywordParser.WHERE, WLParser, FragmentParser.Expr), ([whereWhitespace, _where, exprWhitespace, expr]) => ({
    whereWhitespace,
    expr,
    exprWhitespace,
  }))
);

NodeParser.CreateIndexStmt.setParser(
  c.keyed((key) =>
    c.keyedPipe(
      KeywordParser.CREATE,
      key(
        'unique',
        c.apply(c.maybe(c.pipe(WLParser, KeywordParser.UNIQUE)), (unique) => mapIfExist(unique, ([uniqueWhitespace, _unique]) => ({ uniqueWhitespace })))
      ),
      key('indexWhitespace', WLParser),
      KeywordParser.INDEX,
      key('ifNotExists', c.maybe(FragmentParser.IfNotExists)),
      key('indexTargetWhitespace', WLParser),
      key('indexTarget', FragmentParser.SchemaItemTarget),
      key('onWhitespace', WLParser),
      KeywordParser.ON,
      key('tableNameWhitespace', WLParser),
      key('tableName', NodeParser.Identifier),
      key('openParentWhitespace', MaybeWlParser),
      openParentParser,
      key('indexedColumns', nonEmptyCommaSingleList(NodeParser.IndexedColumn)),
      key('closeParentWhitespace', MaybeWlParser),
      closeParentParser,
      key('where', c.maybe(FragmentParser.Where))
    )
  )
);

NodeParser.FilterClause.setParser(
  c.apply(
    c.pipe(
      KeywordParser.FILTER,
      MaybeWlParser,
      openParentParser,
      MaybeWlParser,
      KeywordParser.WHERE,
      WLParser,
      FragmentParser.Expr,
      MaybeWlParser,
      closeParentParser
    ),
    ([_filter, openParentWhitespace, _open, whereWhitespace, _where, exprWhitespace, expr, closeParentWhitespace, _close]) => ({
      openParentWhitespace,
      whereWhitespace,
      exprWhitespace,
      expr,
      closeParentWhitespace,
    })
  )
);

NodeParser.OverClause.setParser(
  c.apply(
    c.pipe(
      KeywordParser.OVER,
      c.oneOf(
        c.apply(c.pipe(WLParser, NodeParser.Identifier), ([windowNameWhitespace, windowName]): Node<'OverClause'>['inner'] => ({
          variant: 'WindowName',
          windowNameWhitespace,
          windowName,
        })),
        c.apply(
          c.pipe(MaybeWlParser, openParentParser, MaybeWlParser, closeParentParser),
          ([openParentWhitespace, _open, closeParentWhitespace, _close]): Node<'OverClause'>['inner'] => {
            return { variant: 'EmptyParenthesis', openParentWhitespace, closeParentWhitespace };
          }
        ),
        c.transformSuccess(
          c.pipe(
            MaybeWlParser,
            openParentParser,
            c.maybe(c.pipe(MaybeWlParser, NodeParser.Identifier)),
            c.maybe(c.pipe(MaybeWlParser, FragmentParser.OverClausePartitionBy)),
            c.maybe(c.pipe(MaybeWlParser, FragmentParser.OverClauseOrderBy)),
            c.maybe(c.pipe(MaybeWlParser, NodeParser.FrameSpec)),
            MaybeWlParser,
            closeParentParser
          ),
          (res, parentPath): ParseResult<Node<'OverClause'>['inner']> => {
            const [openParentWhitespace, _open, baseWindowName, partitionBy, orderBy, frameSpec, closeParentWhitespace, _close] = res.value;
            const inner: Fragment<'OverClauseInner'> = {
              baseWindowName: mapIfExist(baseWindowName, ([baseWindowNameWhitespace, baseWindowName]) => ({ baseWindowNameWhitespace, baseWindowName })),
              partitionBy: mapIfExist(partitionBy, ([partitionWhitespace, { byWhitespace, exprs }]) => ({ partitionWhitespace, byWhitespace, exprs })),
              orderBy: mapIfExist(orderBy, ([orderWhitespace, { byWhitespace, orderingTerms }]) => ({ orderWhitespace, byWhitespace, orderingTerms })),
              frameSpec: mapIfExist(frameSpec, ([frameSpecWhitespace, frameSpec]) => ({ frameSpecWhitespace, frameSpec })),
            };
            if (Object.values(inner).filter((v) => v !== undefined).length === 0) {
              return ParseFailure(res.start, [...parentPath, 'OverClauseInner'], 'OverClauseInner is empty (EmptyParenthesis variant should parse)');
            }
            const data: Node<'OverClause'>['inner'] = {
              variant: 'Window',
              openParentWhitespace,
              inner: inner as any,
              closeParentWhitespace,
            };
            return ParseSuccess(res.start, res.rest, data);
          }
        )
      )
    ),
    ([_over, inner]) => ({ inner })
  )
);

FragmentParser.CollationName.setParser(
  c.apply(
    c.pipe(WLParser, KeywordParser.COLLATE, WLParser, NodeParser.Identifier),
    ([collateWhitespace, _collate, collationNameWhitespace, collationName]) => ({
      collateWhitespace,
      collationName,
      collationNameWhitespace,
    })
  )
);

FragmentParser.IndexedColumnOrder.setParser(
  c.apply(c.pipe(WLParser, c.oneOf(KeywordParser.ASC, KeywordParser.DESC)), ([whitespace, order]) => {
    return order === 'ASC' ? { variant: 'Asc', ascWhitespace: whitespace } : { variant: 'Desc', descWhitespace: whitespace };
  })
);

NodeParser.IndexedColumn.setParser(
  c.apply(
    c.pipe(c.oneOf(FragmentParser.Expr, NodeParser.Identifier), c.maybe(FragmentParser.CollationName), c.maybe(FragmentParser.IndexedColumnOrder)),
    ([columnOrExp, collate, order]): Complete<NodeData['IndexedColumn']> => ({
      column: columnOrExp.kind === 'Identifier' ? { variant: 'Name', columnName: columnOrExp } : { variant: 'Expr', expr: columnOrExp },
      collate,
      order,
    })
  )
);

NodeParser.BitwiseNegation.setParser(
  c.apply(
    c.pipe(tildeParser, MaybeWlParser, FragmentParser.ExprBase),
    ([_tilde, exprWhitespace, expr]): Complete<NodeData['BitwiseNegation']> => ({ expr, exprWhitespace })
  )
);

NodeParser.Plus.setParser(c.apply(c.pipe(plusParser, MaybeWlParser, FragmentParser.ExprBase), ([_plus, exprWhitespace, expr]) => ({ expr, exprWhitespace })));

NodeParser.Minus.setParser(c.apply(c.pipe(dashParser, MaybeWlParser, FragmentParser.ExprBase), ([_minus, exprWhitespace, expr]) => ({ expr, exprWhitespace })));

NodeParser.Column.setParser(
  c.apply(c.oneOf(c.pipe(FragmentParser.SchemaItemTarget, MaybeWlParser, dotParser, MaybeWlParser, NodeParser.Identifier), NodeParser.Identifier), (items) => {
    if (Array.isArray(items)) {
      const [tableTarget, dotWhitespace, _dot, columnNameWhitespace, columnName] = items;
      return { variant: 'ColumnWithTable', tableTarget, dotWhitespace, columnNameWhitespace, columnName };
    }
    return { variant: 'ColumnWithoutTable', columnName: items };
  })
);

FragmentParser.SelectExists.setParser(
  c.apply(c.pipe(c.maybe(c.pipe(KeywordParser.NOT, WLParser)), KeywordParser.EXISTS, MaybeWlParser), ([not, _exists, whitespaceAfter]) => ({
    not: mapIfExist(not, ([_not, whitespaceAfter]) => ({ whitespaceAfter })),
    whitespaceAfter,
  }))
);

NodeParser.Select.setParser(
  c.apply(
    c.pipe(c.maybe(FragmentParser.SelectExists), openParentParser, MaybeWlParser, NodeParser.SelectStmt, MaybeWlParser, closeParentParser),
    ([exists, _openParent, selectStmtWhitespace, selectStmt, closeParentWhitespace, _closeParent]) => {
      return { exists, selectStmtWhitespace, selectStmt, closeParentWhitespace };
    }
  )
);

NodeParser.FunctionInvocation.setParser(
  c.apply(
    c.pipe(
      NodeParser.Identifier,
      MaybeWlParser,
      openParentParser,
      c.maybe(
        c.oneOf(
          c.apply(c.pipe(MaybeWlParser, starParser), ([starWhitespace, _star]): NodeData['FunctionInvocation']['parameters'] => ({
            variant: 'Star',
            starWhitespace,
          })),
          c.apply(
            c.pipe(
              c.maybe(c.apply(c.pipe(MaybeWlParser, KeywordParser.DISTINCT), ([distinctWhitespace, _distinct]) => ({ distinctWhitespace }))),
              nonEmptyCommaSingleList(FragmentParser.Expr)
            ),
            ([distinct, exprs]): NodeData['FunctionInvocation']['parameters'] => ({ variant: 'Parameters', distinct, exprs })
          )
        )
      ),
      MaybeWlParser,
      closeParentParser,
      c.maybe(
        c.oneOf(
          c.apply(
            c.pipe(MaybeWlParser, NodeParser.FilterClause, c.maybe(c.pipe(WLParser, NodeParser.OverClause))),
            ([filterClauseWhitespace, filterClause, over]) => ({
              filterClause: { filterClauseWhitespace, filterClause },
              overClause: mapIfExist(over, ([overClauseWhitespace, overClause]) => ({ overClauseWhitespace, overClause })),
            })
          ),
          c.apply(c.pipe(MaybeWlParser, NodeParser.OverClause), ([overClauseWhitespace, overClause]) => ({
            filterClause: undefined,
            overClause: { overClauseWhitespace, overClause },
          }))
        )
      )
    ),
    ([functionName, openParentWhitespace, _open, parameters, closeParentWhitespace, _close, filterOver]) => {
      return {
        functionName,
        openParentWhitespace,
        parameters,
        closeParentWhitespace,
        filterClause: filterOver?.filterClause,
        overClause: filterOver?.overClause,
      };
    }
  )
);

NodeParser.Parenthesis.setParser(
  c.apply(
    c.pipe(openParentParser, nonEmptyCommaSingleList(FragmentParser.Expr), MaybeWlParser, closeParentParser),
    ([_open, exprs, closeParentWhitespace, _close]): Complete<NodeData['Parenthesis']> => ({ exprs, closeParentWhitespace })
  )
);

NodeParser.CastAs.setParser(
  c.apply(
    c.pipe(
      KeywordParser.CAST,
      MaybeWlParser,
      openParentParser,
      MaybeWlParser,
      FragmentParser.Expr,
      WLParser,
      KeywordParser.AS,
      WLParser,
      NodeParser.TypeName,
      MaybeWlParser,
      closeParentParser
    ),
    ([_cast, openParentWhitespace, _open, exprWhitespace, expr, asWhitespace, _as, typeNameWhitespace, typeName, closeParentWhitespace, _close]) => ({
      openParentWhitespace,
      exprWhitespace,
      expr,
      asWhitespace,
      typeNameWhitespace,
      typeName,
      closeParentWhitespace,
    })
  )
);

FragmentParser.CaseItem.setParser(
  c.apply(
    c.pipe(WLParser, KeywordParser.WHEN, WLParser, FragmentParser.Expr, WLParser, KeywordParser.THEN, WLParser, FragmentParser.Expr),
    ([whenWhitespace, _when, whenExprWhitespace, whenExpr, thenWhitespace, _then, thenExprWhitespace, thenExpr]) => ({
      whenWhitespace,
      whenExprWhitespace,
      whenExpr,
      thenWhitespace,
      thenExprWhitespace,
      thenExpr,
    })
  )
);

NodeParser.Case.setParser(
  c.apply(
    c.pipe(
      KeywordParser.CASE,
      c.maybe(c.apply(c.pipe(WLParser, FragmentParser.Expr), ([exprWhitespace, expr]): NodeData['Case']['expr'] => ({ exprWhitespace, expr }))),
      nonEmptyList(FragmentParser.CaseItem),
      c.maybe(
        c.apply(
          c.pipe(WLParser, KeywordParser.ELSE, WLParser, FragmentParser.Expr),
          ([elseWhitespace, _else, exprWhitespace, expr]): NodeData['Case']['else'] => ({ elseWhitespace, exprWhitespace, expr })
        )
      ),
      WLParser,
      KeywordParser.END
    ),
    ([_case, expr, cases, elseVal, endWhitespace, _end]) => ({ expr, cases, else: elseVal, endWhitespace })
  )
);

NodeParser.RaiseFunction.setParser(
  c.apply(
    c.pipe(
      KeywordParser.RAISE,
      MaybeWlParser,
      openParentParser,
      MaybeWlParser,
      c.apply(
        c.oneOf(
          c.pipe(KeywordParser.IGNORE),
          c.pipe(KeywordParser.ROLLBACK, MaybeWlParser, commaParser, MaybeWlParser, NodeParser.StringLiteral),
          c.pipe(KeywordParser.ABORT, MaybeWlParser, commaParser, MaybeWlParser, NodeParser.StringLiteral),
          c.pipe(KeywordParser.FAIL, MaybeWlParser, commaParser, MaybeWlParser, NodeParser.StringLiteral)
        ),
        (data): NodeData['RaiseFunction']['inner'] => {
          if (data[0] === 'IGNORE') {
            return { variant: 'Ignore' };
          }
          const [keyword, commaWhitespace, _comma, errorMessageWhitespace, errorMessage] = data;
          return {
            variant: keyword === 'ROLLBACK' ? 'Rollback' : keyword === 'ABORT' ? 'Abort' : 'Fail',
            commaWhitespace,
            errorMessageWhitespace,
            errorMessage,
          };
        }
      ),
      MaybeWlParser,
      closeParentParser
    ),
    ([_raise, opentParentWhitespace, _open, innerWhitespace, inner, closeParentWhitespace]) => ({
      opentParentWhitespace,
      innerWhitespace,
      inner,
      closeParentWhitespace,
    })
  )
);

FragmentParser.ExprBase.setParser(
  c.oneOf(
    FragmentParser.LiteralValue,
    NodeParser.BitwiseNegation,
    NodeParser.Plus,
    NodeParser.Minus,
    NodeParser.BindParameter,
    NodeParser.Column,
    NodeParser.Select,
    NodeParser.FunctionInvocation,
    NodeParser.Parenthesis,
    NodeParser.CastAs,
    NodeParser.Case,
    NodeParser.RaiseFunction
  )
);

FragmentParser.ExprChainItemCollate.setParser(
  c.apply(
    c.pipe(WLParser, KeywordParser.COLLATE, WLParser, NodeParser.Identifier),
    ([collateWhitespace, _collate, collationNameWhitespace, collationName]) => ({
      variant: 'Collate',
      collateWhitespace,
      collationNameWhitespace,
      collationName,
    })
  )
);

FragmentParser.ExprChainItemConcatenate.setParser(exprChainItemOpExprParser('Concatenate', concatenateParser, WLParser));
FragmentParser.ExprChainItemMultiply.setParser(exprChainItemOpExprParser('Multiply', starParser, MaybeWlParser));
FragmentParser.ExprChainItemDivide.setParser(exprChainItemOpExprParser('Divide', slashParser, MaybeWlParser));
FragmentParser.ExprChainItemModulo.setParser(exprChainItemOpExprParser('Modulo', percentParser, MaybeWlParser));
FragmentParser.ExprChainItemAdd.setParser(exprChainItemOpExprParser('Add', plusParser, MaybeWlParser));
FragmentParser.ExprChainItemSubtract.setParser(exprChainItemOpExprParser('Subtract', dashParser, MaybeWlParser));
FragmentParser.ExprChainItemBitwiseAnd.setParser(exprChainItemOpExprParser('BitwiseAnd', ampersandParser, MaybeWlParser));
FragmentParser.ExprChainItemBitwiseOr.setParser(exprChainItemOpExprParser('BitwiseOr', pipeParser, MaybeWlParser));
FragmentParser.ExprChainItemBitwiseShiftLeft.setParser(exprChainItemOpExprParser('BitwiseShiftLeft', bitwiseShiftLeftParser, MaybeWlParser));
FragmentParser.ExprChainItemBitwiseShiftRight.setParser(exprChainItemOpExprParser('BitwiseShiftRight', bitwiseShiftRightParser, MaybeWlParser));
FragmentParser.ExprChainItemEscape.setParser(exprChainItemOpExprParser('Escape', KeywordParser.ESCAPE, WLParser));
FragmentParser.ExprChainItemGreaterThan.setParser(exprChainItemOpExprParser('GreaterThan', greaterThanParser, MaybeWlParser));
FragmentParser.ExprChainItemLowerThan.setParser(exprChainItemOpExprParser('LowerThan', lowerThanParser, MaybeWlParser));
FragmentParser.ExprChainItemGreaterOrEqualThan.setParser(exprChainItemOpExprParser('GreaterOrEqualThan', greaterThanOrEqualParser, MaybeWlParser));
FragmentParser.ExprChainItemLowerOrEqualThan.setParser(exprChainItemOpExprParser('LowerOrEqualThan', lowerThanOrEqualParser, MaybeWlParser));
FragmentParser.ExprChainItemEqual.setParser(
  c.apply(
    c.pipe(MaybeWlParser, c.oneOf(equalParser, doubleEqualParser), MaybeWlParser, FragmentParser.ExprBase),
    ([operatorWhitespace, operator, exprWhitespace, expr]) => ({ variant: 'Equal', operatorWhitespace, operator, exprWhitespace, expr })
  )
);
FragmentParser.ExprChainItemDifferent.setParser(
  c.apply(
    c.pipe(MaybeWlParser, c.oneOf(differentParser, notEqualParser), MaybeWlParser, FragmentParser.ExprBase),
    ([operatorWhitespace, operator, exprWhitespace, expr]) => ({ variant: 'Different', operatorWhitespace, operator, exprWhitespace, expr })
  )
);
FragmentParser.ExprChainItemIs.setParser(exprChainItemOpExprParser('Is', KeywordParser.IS, WLParser));
FragmentParser.ExprChainItemIsNot.setParser(
  c.apply(
    c.pipe(WLParser, KeywordParser.IS, WLParser, KeywordParser.NOT, WLParser, FragmentParser.ExprBase),
    ([isWhitespace, _is, notWhitespace, _not, exprWhitespace, expr]) => ({ variant: 'IsNot', isWhitespace, notWhitespace, exprWhitespace, expr })
  )
);
FragmentParser.ExprChainItemNotNull.setParser(
  c.apply(c.pipe(WLParser, KeywordParser.NOTNULL), ([notNullWhitespace, _notNull]) => ({ variant: 'NotNull', notNullWhitespace }))
);
FragmentParser.ExprChainItemNot_Null.setParser(
  c.apply(c.pipe(WLParser, KeywordParser.NOT, WLParser, KeywordParser.NULL), ([notNullWhitespace, _not, nullWhitespace, _null]) => ({
    variant: 'Not_Null',
    notNullWhitespace,
    nullWhitespace,
  }))
);
FragmentParser.ExprChainItemNot.setParser(c.apply(c.pipe(WLParser, KeywordParser.NOT), ([notWhitespace, _not]) => ({ variant: 'Not', notWhitespace })));
FragmentParser.ExprChainItemAnd.setParser(exprChainItemOpExprParser('And', KeywordParser.AND, WLParser));
FragmentParser.ExprChainItemOr.setParser(exprChainItemOpExprParser('Or', KeywordParser.OR, WLParser));
FragmentParser.ExprChainItemIsNull.setParser(
  c.apply(c.pipe(WLParser, KeywordParser.ISNULL), ([isNullWhitespace, _isNull]) => ({ variant: 'IsNull', isNullWhitespace }))
);
FragmentParser.ExprChainItemBetween.setParser(exprChainItemMaybeNotOpExprParser('Between', KeywordParser.BETWEEN));
FragmentParser.ExprChainItemMatch.setParser(exprChainItemMaybeNotOpExprParser('Match', KeywordParser.MATCH));
FragmentParser.ExprChainItemLike.setParser(exprChainItemMaybeNotOpExprParser('Like', KeywordParser.LIKE));
FragmentParser.ExprChainItemRegexp.setParser(exprChainItemMaybeNotOpExprParser('Regexp', KeywordParser.REGEXP));
FragmentParser.ExprChainItemGlob.setParser(exprChainItemMaybeNotOpExprParser('Glob', KeywordParser.GLOB));

FragmentParser.InValuesList.setParser(
  c.apply(
    c.pipe(
      MaybeWlParser,
      openParentParser,
      c.maybe(
        c.oneOf(
          c.apply(nonEmptyCommaSingleList(FragmentParser.Expr), (exprs): Fragment<'InValuesList'>['items'] => ({ variant: 'Exprs', exprs })),
          c.apply(c.pipe(MaybeWlParser, NodeParser.SelectStmt), ([selectStmtWhitespace, selectStmt]): Fragment<'InValuesList'>['items'] => {
            return { variant: 'Select', selectStmtWhitespace, selectStmt };
          })
        )
      ),
      MaybeWlParser,
      closeParentParser
    ),
    ([openParentWhitespace, _open, items, closeParentWhitespace, _close]) => ({ variant: 'List', openParentWhitespace, items, closeParentWhitespace })
  )
);

FragmentParser.InValuesTableName.setParser(
  c.apply(c.pipe(WLParser, FragmentParser.SchemaItemTarget), ([tableTargetWhitespace, tableTarget]) => ({
    variant: 'TableName',
    tableTargetWhitespace,
    tableTarget,
  }))
);

FragmentParser.InValueTableFunctionInvocation.setParser(
  c.apply(
    c.pipe(
      WLParser,
      FragmentParser.SchemaItemTarget,
      MaybeWlParser,
      openParentParser,
      c.maybe(nonEmptyCommaSingleList(FragmentParser.Expr)),
      MaybeWlParser,
      closeParentParser
    ),
    ([functionTargetWhitespace, functionTarget, openParentWhitespace, _open, parameters, closeParentWhitespace, _close]) => ({
      variant: 'TableFunctionInvocation',
      functionTargetWhitespace,
      functionTarget,
      openParentWhitespace,
      parameters,
      closeParentWhitespace,
    })
  )
);

FragmentParser.InValues.setParser(c.oneOf(FragmentParser.InValuesList, FragmentParser.InValuesTableName, FragmentParser.InValueTableFunctionInvocation));

FragmentParser.ExprChainItemIn.setParser(
  c.apply(
    c.pipe(
      c.maybe(c.apply(c.pipe(WLParser, KeywordParser.NOT), ([notWhitespace, _not]) => ({ notWhitespace }))),
      WLParser,
      KeywordParser.IN,
      FragmentParser.InValues
    ),
    ([not, inWhitespace, _in, values]) => ({ variant: 'In', not, inWhitespace, values })
  )
);

FragmentParser.ExprChainItem.setParser(
  c.oneOf<Fragment<'ExprChainItem'>, Ctx>(
    FragmentParser.ExprChainItemCollate,
    FragmentParser.ExprChainItemConcatenate,
    FragmentParser.ExprChainItemMultiply,
    FragmentParser.ExprChainItemDivide,
    FragmentParser.ExprChainItemModulo,
    FragmentParser.ExprChainItemAdd,
    FragmentParser.ExprChainItemSubtract,
    FragmentParser.ExprChainItemBitwiseAnd,
    FragmentParser.ExprChainItemBitwiseOr,
    FragmentParser.ExprChainItemBitwiseShiftLeft,
    FragmentParser.ExprChainItemBitwiseShiftRight,
    FragmentParser.ExprChainItemEscape,
    FragmentParser.ExprChainItemGreaterThan,
    FragmentParser.ExprChainItemLowerThan,
    FragmentParser.ExprChainItemGreaterOrEqualThan,
    FragmentParser.ExprChainItemLowerOrEqualThan,
    FragmentParser.ExprChainItemEqual,
    FragmentParser.ExprChainItemDifferent,
    FragmentParser.ExprChainItemIs,
    FragmentParser.ExprChainItemIsNot,
    FragmentParser.ExprChainItemBetween,
    FragmentParser.ExprChainItemIn,
    FragmentParser.ExprChainItemMatch,
    FragmentParser.ExprChainItemLike,
    FragmentParser.ExprChainItemRegexp,
    FragmentParser.ExprChainItemGlob,
    FragmentParser.ExprChainItemIsNull,
    FragmentParser.ExprChainItemNotNull,
    FragmentParser.ExprChainItemNot_Null,
    FragmentParser.ExprChainItemNot,
    FragmentParser.ExprChainItemAnd,
    FragmentParser.ExprChainItemOr
  )
);

type ExprPart =
  | { variant: 'Expr'; expr: Fragment<'Expr'>; _result: ParseResultSuccess<any> }
  | (Fragment<'ExprChainItem'> & { _result: ParseResultSuccess<any> });

FragmentParser.Expr.setParser(
  c.transformSuccess(c.pipeResults(FragmentParser.ExprBase, c.manyResults(FragmentParser.ExprChainItem, { allowEmpty: true })), (result, parentPath, ctx) => {
    const [firstRes, itemsRes] = result.value;
    const items = itemsRes.value.map((r): ExprPart => ({ ...r.value, _result: r }));
    const first = firstRes.value;
    const parts: Array<ExprPart> = [{ variant: 'Expr', expr: first, _result: firstRes }, ...items];
    const isResolved = () => parts.length === 1 && parts[0].variant === 'Expr';
    while (isResolved() === false) {
      const partToMerge = findHighestPrecedencePart(parts);
      const partToMergeIndex = parts.indexOf(partToMerge);
      if (partToMergeIndex === 0) {
        return ParseFailure(partToMerge._result.start, parentPath, 'First item has highest precedence');
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
  })
);

function mergeParts(left: ExprPart, right: ExprPart, parentPath: Array<string>, ctx: Ctx): { type: 'Success'; part: ExprPart } | ParseResultFailure {
  const start = left._result.start;
  const end = right._result.end;
  const rest = right._result.rest;
  if (left.variant === 'Collate' || left.variant === 'In' || left.variant === 'IsNull' || left.variant === 'NotNull' || left.variant === 'Not_Null') {
    return ParseFailure(start, parentPath, `Unexpected ${left.variant}`);
  }
  if (left.variant === 'Not') {
    if (right.variant !== 'Expr') {
      return ParseFailure(right._result.start, parentPath, 'Expecting Expression');
    }
    const expr = ctx.createNode('Not', start, end, {
      expr: right.expr as any,
      exprWhitespace: left.notWhitespace,
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
      exprWhitespace: right.exprWhitespace,
      expr: right.expr,
    });
    const updateLikePart: Fragment<'ExprChainItemLike'> = {
      ...left,
      escape: { escapeWhitespace: right.opWhitespace, escape: escapeNode },
    };
    return {
      type: 'Success',
      part: { ...updateLikePart, _result: ParseSuccess(start, rest, updateLikePart) },
    };
  }
  if (left.variant === 'Between' && right.variant === 'And' && left.and === undefined) {
    const updateBetweenPart: Fragment<'ExprChainItemBetween'> = {
      ...left,
      and: right,
    };
    return {
      type: 'Success',
      part: { ...updateBetweenPart, _result: ParseSuccess(start, rest, updateBetweenPart) },
    };
  }
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
    part.variant === 'Is' ||
    part.variant === 'And' ||
    part.variant === 'Or' ||
    false
  ) {
    return ctx.createNode(part.variant, start, end, {
      leftExpr,
      operatorWhitespace: part.opWhitespace,
      rightExprWhitespace: part.exprWhitespace,
      rightExpr: part.expr,
    });
  }
  if (part.variant === 'Equal' || part.variant === 'Different') {
    return ctx.createNode(part.variant, start, end, {
      leftExpr,
      operatorWhitespace: part.operatorWhitespace,
      operator: part.operator,
      rightExprWhitespace: part.exprWhitespace,
      rightExpr: part.expr,
    });
  }
  if (part.variant === 'Match' || part.variant === 'Glob' || part.variant === 'Regexp') {
    return ctx.createNode(part.variant, start, end, {
      leftExpr,
      not: part.not,
      opWhitespace: part.opWhitespace,
      rightExprWhitespace: part.exprWhitespace,
      rightExpr: part.expr,
    });
  }
  if (part.variant === 'IsNot') {
    return ctx.createNode('IsNot', start, end, {
      leftExpr,
      isWhitespace: part.isWhitespace,
      notWhitespace: part.notWhitespace,
      rightWhitespace: part.exprWhitespace,
      rightExpr: part.expr,
    });
  }
  if (part.variant === 'Between') {
    if (part.and === undefined) {
      return ParseFailure(part._result.start, parentPath, `Missing And after Between`);
    }
    return ctx.createNode('Between', start, end, {
      expr: leftExpr,
      not: part.not,
      betweenExprWhitespace: part.opWhitespace,
      betweenWhitespace: part.exprWhitespace,
      betweenExpr: part.expr,
      andWhitespace: part.and.opWhitespace,
      andExprWhitespace: part.and.exprWhitespace,
      andExpr: part.expr,
    });
  }
  if (part.variant === 'In') {
    return ctx.createNode('In', start, end, {
      expr: leftExpr,
      not: part.not,
      inWhitespace: part.opWhitespace,
      values: part.values,
    });
  }
  if (part.variant === 'Like') {
    return ctx.createNode('Like', start, end, {
      leftExpr,
      not: part.not,
      opWhitespace: part.opWhitespace,
      rightExprWhitespace: part.exprWhitespace,
      rightExpr: part.expr,
      escape: part.escape,
    });
  }
  if (part.variant === 'IsNull') {
    return ctx.createNode('IsNull', start, end, {
      expr: leftExpr,
      isNullWhitespace: part.isNullWhitespace,
    });
  }
  if (part.variant === 'NotNull') {
    return ctx.createNode('NotNull', start, end, {
      expr: leftExpr,
      notNullWhitespace: part.notNullWhitespace,
    });
  }
  if (part.variant === 'Not_Null') {
    return ctx.createNode('Not_Null', start, end, {
      expr: leftExpr,
      notWhitespace: part.notWhitespace,
      nullWhitespace: part.nullWhitespace,
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

// @ts-expect-error temp
function nonEmptyCommaList<T>(itemParser: Parser<T, Ctx>): Parser<NonEmptyCommaList<T>, Ctx> {
  return nonEmptyListSepBy(
    itemParser,
    c.apply(c.pipe(MaybeWlParser, commaParser), ([commaWhitespace]) => ({ commaWhitespace }))
  );
}

function nonEmptyCommaSingleList<T>(itemParser: Parser<T, Ctx>): Parser<NonEmptyCommaListSingle<T>, Ctx> {
  return nonEmptyListSepBy(
    c.apply(c.pipe(MaybeWlParser, itemParser), ([whitespaceBefore, item]) => ({ whitespaceBefore, item })),
    c.apply(c.pipe(MaybeWlParser, commaParser), ([commaWhitespace]) => ({ commaWhitespace }))
  );
}

function manySepByResultToArray<T>(result: c.ManySepByResult<T, any>): Array<T> {
  if (result === null) {
    return [];
  }
  return [result.head, ...result.tail.map((v) => v.item)];
}

function exprChainItemOpExprParser<Variant extends string>(
  variant: Variant,
  opParser: Parser<string, Ctx>,
  wlParser: Parser<Fragment<'WhitespaceLike'> | undefined, Ctx>
): Parser<ExprChainItemOpExpr<Variant>, Ctx> {
  return c.apply(
    c.pipe(wlParser, opParser, wlParser, FragmentParser.ExprBase),
    ([opWhitespace, _op, exprWhitespace, expr]): ExprChainItemOpExpr<Variant> => ({ variant, opWhitespace, exprWhitespace, expr })
  );
}

function exprChainItemMaybeNotOpExprParser<Variant extends string>(
  variant: Variant,
  opParser: Parser<string, Ctx>
): Parser<ExprChainItemMaybeNotOpExpr<Variant>, Ctx> {
  return c.apply(
    c.pipe(
      WLParser,
      opParser,
      c.maybe(c.apply(c.pipe(WLParser, KeywordParser.NOT), ([notWhitespace, _not]) => ({ notWhitespace }))),
      WLParser,
      FragmentParser.ExprBase
    ),
    ([opWhitespace, _op, not, exprWhitespace, expr]): ExprChainItemMaybeNotOpExpr<Variant> => ({ variant, opWhitespace, not, exprWhitespace, expr })
  );
}
