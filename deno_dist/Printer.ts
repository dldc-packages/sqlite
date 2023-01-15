import { Keywords } from './Keyword.ts';
import { Node, NodeKind } from './Node.ts';
import { BinaryOperator, UnaryOperator } from './Operator.ts';
import { join, joiner, mapMaybe, mapUnionString, mapVariants, NonEmptyArray } from './Utils.ts';

function printList<T>(list: NonEmptyArray<T>, printer: (item: T) => string, sep: string = ', '): string {
  return joiner(sep, ...list.map(printer));
}

function printNodeList(list: NonEmptyArray<Node>, sep: string = ', '): string {
  return printList(list, printNode, sep);
}

export function printNode(node: Node): string {
  return (NodePrinter as any)[node.kind](node);
}

// shorter alias
function p(node: Node): string {
  return printNode(node);
}

function parent(inner: string | null | undefined): string {
  return `(${inner ?? ''})`;
}

const NodePrinter: { [K in NodeKind]: (node: Node<K>) => string } = {
  AggregateFunctionInvocation: ({ aggregateFunc, parameters, filterClause }) => {
    return join.space(
      p(aggregateFunc),
      parent(
        mapMaybe(parameters, (params) =>
          mapVariants(params, {
            Exprs: ({ distinct, exprs }) => join.space(distinct && Keywords.DISTINCT, printNodeList(exprs)),
            Star: () => '*',
          })
        )
      ),
      mapMaybe(filterClause, p)
    );
  },
  AlterTableStmt: ({ schema, table, action }) => {
    return join.space(
      Keywords.ALTER,
      Keywords.TABLE,
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(table)
      ),
      mapVariants(action, {
        RenameTo: ({ newTableName }) => join.space(Keywords.RENAME, Keywords.TO, p(newTableName)),
        RenameColumn: ({ column, columnName, newColumnName }) =>
          join.space(Keywords.RENAME, column && Keywords.COLUMN, p(columnName), Keywords.TO, p(newColumnName)),
        AddColumn: ({ column, columnDef }) => join.space(Keywords.ADD, column && Keywords.COLUMN, p(columnDef)),
        DropColumn: ({ column, columnName }) => join.space(Keywords.DROP, column && Keywords.COLUMN, p(columnName)),
      })
    );
  },
  AnalyzeStmt: ({ target }) => {
    return join.space(
      Keywords.ANALYZE,
      mapMaybe(target, (t) =>
        mapVariants(t, {
          Single: ({ name }) => p(name),
          WithSchema: ({ schemaName, indexOrTableName }) => join.all(p(schemaName), '.', p(indexOrTableName)),
        })
      )
    );
  },
  AttachStmt: ({ database, expr, schemaName }) => {
    return join.space(Keywords.ATTACH, database && Keywords.DATABASE, p(expr), Keywords.AS, p(schemaName));
  },
  BeginStmt: ({ mode, transaction }) => {
    return join.space(
      Keywords.BEGIN,
      mode &&
        mapUnionString(mode, {
          Deferred: Keywords.DEFERRED,
          Immediate: Keywords.IMMEDIATE,
          Exclusive: Keywords.EXCLUSIVE,
        }),
      transaction && Keywords.TRANSACTION
    );
  },
  ColumnConstraint: ({ constraintName, constraint }) => {
    return join.space(
      mapMaybe(constraintName, p),
      mapVariants(constraint, {
        PrimaryKey: ({ direction, conflictClause, autoincrement }) =>
          join.space(
            Keywords.PRIMARY,
            Keywords.KEY,
            direction && mapUnionString(direction, { Asc: Keywords.ASC, Desc: Keywords.DESC }),
            mapMaybe(conflictClause, p),
            autoincrement && Keywords.AUTOINCREMENT
          ),
        NotNull: ({ conflictClause }) => join.space(Keywords.NOT, Keywords.NULL, mapMaybe(conflictClause, p)),
        Unique: ({ conflictClause }) => join.space(Keywords.UNIQUE, mapMaybe(conflictClause, p)),
        Check: ({ expr }) => join.space(Keywords.CHECK, parent(p(expr))),
        DefaultExpr: ({ expr }) => join.space(Keywords.DEFAULT, parent(p(expr))),
        DefaultLiteralValue: ({ literalValue }) => join.space(Keywords.DEFAULT, p(literalValue)),
        DefaultSignedNumber: ({ signedNumber }) => join.space(Keywords.DEFAULT, p(signedNumber)),
        Collate: ({ collationName }) => join.space(Keywords.COLLATE, p(collationName)),
        ForeignKey: ({ foreignKeyClause }) => p(foreignKeyClause),
        As: ({ generatedAlways, expr, mode }) =>
          join.space(
            generatedAlways && join.space(Keywords.GENERATED, Keywords.ALWAYS),
            Keywords.AS,
            parent(p(expr)),
            mode &&
              mapUnionString(mode, {
                Stored: Keywords.STORED,
                Virtual: Keywords.VIRTUAL,
              })
          ),
      })
    );
  },
  ColumnDef: ({ columnName, typeName, columnConstraints }) => {
    return join.space(
      p(columnName),
      typeName && p(typeName),
      mapMaybe(columnConstraints, (cols) => printNodeList(cols, ' '))
    );
  },
  ColumnNameList: ({ columnNames }) => {
    return parent(printNodeList(columnNames));
  },
  CommentSyntax: (node) => {
    // TODO: Check that content does not break comment syntax and escape it
    return mapVariants(node, {
      SingleLine: ({ content, close }) => `--${content}${mapUnionString(close, { EndOfFile: '', NewLine: '\n' })}`,
      Multiline: ({ content }) => `/*${content}*/`,
    });
  },
  CommitStmt: ({ action, transaction }) => {
    return join.space(mapUnionString(action, { Commit: Keywords.COMMIT, End: Keywords.END }), transaction && Keywords.TRANSACTION);
  },
  CommonTableExpression: ({ tableName, columnNames, materialized, select }) => {
    return join.space(
      p(tableName),
      mapMaybe(columnNames, (cols) => parent(printNodeList(cols))),
      Keywords.AS,
      mapMaybe(materialized, (m) =>
        mapUnionString(m, {
          Materialized: Keywords.MATERIALIZED,
          NotMaterialized: join.space(Keywords.NOT, Keywords.MATERIALIZED),
        })
      ),
      parent(p(select))
    );
  },
  CompoundOperator: (node) => {
    return mapUnionString(node.variant, {
      Union: Keywords.UNION,
      UnionAll: join.space(Keywords.UNION, Keywords.ALL),
      Intersect: Keywords.INTERSECT,
      Except: Keywords.EXCEPT,
    });
  },
  CompoundSelectStmt: ({ with: withPart, select, compoundSelects, orderBy, limit }) => {
    return join.space(
      mapMaybe(withPart, ({ recursive, commonTableExpressions }) =>
        join.space(Keywords.WITH, recursive && Keywords.RECURSIVE, printNodeList(commonTableExpressions))
      ),
      p(select),
      mapMaybe(compoundSelects, (cs) =>
        printList(
          cs,
          ({ operator, select }) =>
            join.space(
              mapMaybe(operator, (o) =>
                mapUnionString(o, {
                  Union: Keywords.UNION,
                  UnionAll: join.space(Keywords.UNION, Keywords.ALL),
                  Intersect: Keywords.INTERSECT,
                  Except: Keywords.EXCEPT,
                })
              ),
              p(select)
            ),
          ' '
        )
      ),
      mapMaybe(orderBy, (o) => join.space(Keywords.ORDER, Keywords.BY, printNodeList(o))),
      mapMaybe(limit, ({ expr, offset }) =>
        join.space(
          Keywords.LIMIT,
          join.all(
            p(expr),
            mapMaybe(offset, ({ separator, expr }) =>
              mapUnionString(separator, {
                Comma: join.space(',', p(expr)),
                Offset: ' ' + join.space(Keywords.OFFSET, p(expr)),
              })
            )
          )
        )
      )
    );
  },
  ConflictClause: ({ onConflict }) => {
    return join.space(
      mapMaybe(onConflict, (oc) =>
        join.space(
          Keywords.ON,
          Keywords.CONFLICT,
          mapUnionString(oc, {
            Rollback: Keywords.ROLLBACK,
            Abort: Keywords.ABORT,
            Fail: Keywords.FAIL,
            Ignore: Keywords.IGNORE,
            Replace: Keywords.REPLACE,
          })
        )
      )
    );
  },
  CreateIndexStmt: ({ unique, ifNotExists, schema, index, tableName, indexedColumns, where }) => {
    return join.space(
      Keywords.CREATE,
      unique && Keywords.UNIQUE,
      ifNotExists && join.space(Keywords.IF, Keywords.NOT, Keywords.EXISTS),
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(index)
      ),
      Keywords.ON,
      p(tableName),
      parent(printNodeList(indexedColumns)),
      where && join.space(Keywords.WHERE, p(where))
    );
  },
  CreateTableStmt: ({ temp, ifNotExists, schema, table, definition }) => {
    return join.space(
      Keywords.CREATE,
      temp && mapUnionString(temp, { Temporary: Keywords.TEMPORARY, Temp: Keywords.TEMP }),
      Keywords.TABLE,
      ifNotExists && join.space(Keywords.IF, Keywords.NOT, Keywords.EXISTS),
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(table)
      ),
      mapVariants(definition, {
        As: ({ selectStmt }) => join.space(Keywords.AS, p(selectStmt)),
        Columns: ({ columnDefs, tableConstraints, tableOptions }) =>
          join.space(parent(join.comma(printNodeList(columnDefs), tableConstraints && printNodeList(tableConstraints))), tableOptions && p(tableOptions)),
      })
    );
  },
  CreateTriggerStmt: ({ temp, ifNotExists, schema, trigger, modifier, action, tableName, forEachRow, when, stmts }) => {
    return join.space(
      Keywords.CREATE,
      temp && mapUnionString(temp, { Temporary: Keywords.TEMPORARY, Temp: Keywords.TEMP }),
      Keywords.TRIGGER,
      ifNotExists && join.space(Keywords.IF, Keywords.NOT, Keywords.EXISTS),
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(trigger)
      ),
      mapMaybe(modifier, (m) =>
        mapUnionString(m, {
          Before: Keywords.BEFORE,
          After: Keywords.AFTER,
          InsteadOf: join.space(Keywords.INSTEAD, Keywords.OF),
        })
      ),
      mapVariants(action, {
        Delete: () => Keywords.DELETE,
        Insert: () => Keywords.INSERT,
        Update: ({ of: ofPart }) =>
          join.space(
            Keywords.UPDATE,
            mapMaybe(ofPart, (p) => join.space(Keywords.OF, printNodeList(p)))
          ),
      }),
      Keywords.ON,
      p(tableName),
      forEachRow && join.space(Keywords.FOR, Keywords.EACH, Keywords.ROW),
      when && join.space(Keywords.WHEN, p(when)),
      Keywords.BEGIN,
      printNodeList(stmts, '; '),
      Keywords.END
    );
  },
  CreateViewStmt: ({ temp, ifNotExists, schema, view, columnNames, asSelectStmt }) => {
    return join.space(
      Keywords.CREATE,
      temp && mapUnionString(temp, { Temporary: Keywords.TEMPORARY, Temp: Keywords.TEMP }),
      Keywords.VIEW,
      ifNotExists && join.space(Keywords.IF, Keywords.NOT, Keywords.EXISTS),
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(view)
      ),
      columnNames && parent(printNodeList(columnNames)),
      Keywords.AS,
      p(asSelectStmt)
    );
  },
  CreateVirtualTableStmt: ({ ifNotExists, schema, table, moduleName, moduleArguments }) => {
    return join.space(
      Keywords.CREATE,
      Keywords.VIRTUAL,
      Keywords.TABLE,
      ifNotExists && join.space(Keywords.IF, Keywords.NOT, Keywords.EXISTS),
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(table)
      ),
      Keywords.USING,
      p(moduleName),
      mapMaybe(moduleArguments, (a) => parent(printNodeList(a)))
    );
  },
  CteTableName: ({ tableName, columnNames }) => {
    return join.space(p(tableName), columnNames && parent(printNodeList(columnNames)));
  },
  DeleteStmt: ({ with: withPart, qualifiedTableName, where, returningClause }) => {
    return join.space(
      mapMaybe(withPart, ({ recursive, commonTableExpressions }) =>
        join.space(Keywords.WITH, recursive && Keywords.RECURSIVE, printNodeList(commonTableExpressions))
      ),
      Keywords.DELETE,
      Keywords.FROM,
      p(qualifiedTableName),
      where && join.space(Keywords.WHERE, p(where)),
      returningClause && p(returningClause)
    );
  },
  DeleteStmtLimited: ({ with: withPart, qualifiedTableName, where, returningClause, orderBy, limit }) => {
    return join.space(
      mapMaybe(withPart, ({ recursive, commonTableExpressions }) =>
        join.space(Keywords.WITH, recursive && Keywords.RECURSIVE, printNodeList(commonTableExpressions))
      ),
      Keywords.DELETE,
      Keywords.FROM,
      p(qualifiedTableName),
      where && join.space(Keywords.WHERE, p(where)),
      returningClause && p(returningClause),
      orderBy && join.space(Keywords.ORDER, Keywords.BY, printNodeList(orderBy)),
      mapMaybe(limit, ({ expr, offset }) =>
        join.space(
          Keywords.LIMIT,
          join.all(
            p(expr),
            mapMaybe(offset, ({ separator, expr }) =>
              mapUnionString(separator, {
                Comma: join.space(',', p(expr)),
                Offset: ' ' + join.space(Keywords.OFFSET, p(expr)),
              })
            )
          )
        )
      )
    );
  },
  DetachStmt: ({ database, schemeName }) => {
    return join.space(Keywords.DETACH, database && Keywords.DATABASE, p(schemeName));
  },
  DropIndexStmt: ({ ifExists, schema, index }) => {
    return join.space(
      Keywords.DROP,
      Keywords.INDEX,
      ifExists && join.space(Keywords.IF, Keywords.EXISTS),
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(index)
      )
    );
  },
  DropTableStmt: ({ ifExists, schema, table }) => {
    return join.space(
      Keywords.DROP,
      Keywords.TABLE,
      ifExists && join.space(Keywords.IF, Keywords.EXISTS),
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(table)
      )
    );
  },
  DropTriggerStmt: ({ ifExists, schema, trigger }) => {
    return join.space(
      Keywords.DROP,
      Keywords.TRIGGER,
      ifExists && join.space(Keywords.IF, Keywords.EXISTS),
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(trigger)
      )
    );
  },
  DropViewStmt: ({ ifExists, schema, view }) => {
    return join.space(
      Keywords.DROP,
      Keywords.VIEW,
      ifExists && join.space(Keywords.IF, Keywords.EXISTS),
      join.all(
        mapMaybe(schema, (sch) => join.all(p(sch), '.')),
        p(view)
      )
    );
  },
  Or: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.OR, p(rightExpr)),
  And: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.AND, p(rightExpr)),
  Not: ({ expr }) => join.space(Keywords.NOT, p(expr)),
  Equal: ({ leftExpr, operator, rightExpr }) => join.space(p(leftExpr), operator, p(rightExpr)),
  Different: ({ leftExpr, operator, rightExpr }) => join.space(p(leftExpr), operator, p(rightExpr)),
  Is: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.IS, p(rightExpr)),
  IsNot: ({ leftExpr, rightExpr }) => {
    return join.space(p(leftExpr), Keywords.IS, Keywords.NOT, p(rightExpr));
  },
  NotBetween: ({ expr, betweenExpr, andExpr }) => join.space(p(expr), Keywords.NOT, Keywords.BETWEEN, p(betweenExpr), Keywords.AND, p(andExpr)),
  Between: ({ expr, betweenExpr, andExpr }) => join.space(p(expr), Keywords.BETWEEN, p(betweenExpr), Keywords.AND, p(andExpr)),
  In: ({ expr, values }) => {
    return join.space(
      p(expr),
      Keywords.IN,
      mapVariants(values, {
        List: ({ items }) => parent(items && printNodeList(items)),
        Select: ({ selectStmt }) => parent(p(selectStmt)),
        TableName: ({ schema, table }) =>
          join.all(
            mapMaybe(schema, (sch) => join.all(p(sch), '.')),
            p(table)
          ),
        TableFunctionInvocation: ({ schema, functionName, parameters }) =>
          join.all(
            mapMaybe(schema, (sch) => join.all(p(sch), '.')),
            p(functionName),
            parent(parameters && printNodeList(parameters))
          ),
      })
    );
  },
  NotIn: ({ expr, values }) => {
    return join.space(
      p(expr),
      Keywords.NOT,
      Keywords.IN,
      mapVariants(values, {
        List: ({ items }) => parent(items && printNodeList(items)),
        Select: ({ selectStmt }) => parent(p(selectStmt)),
        TableName: ({ schema, table }) =>
          join.all(
            mapMaybe(schema, (sch) => join.all(p(sch), '.')),
            p(table)
          ),
        TableFunctionInvocation: ({ schema, functionName, parameters }) =>
          join.all(
            mapMaybe(schema, (sch) => join.all(p(sch), '.')),
            p(functionName),
            parent(parameters && printNodeList(parameters))
          ),
      })
    );
  },
  Match: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.MATCH, p(rightExpr)),
  NotMatch: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.NOT, Keywords.MATCH, p(rightExpr)),
  Like: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.LIKE, p(rightExpr)),
  NotLike: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.NOT, Keywords.LIKE, p(rightExpr)),
  Glob: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.GLOB, p(rightExpr)),
  NotGlob: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.NOT, Keywords.GLOB, p(rightExpr)),
  Regexp: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.REGEXP, p(rightExpr)),
  NotRegexp: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), Keywords.NOT, Keywords.REGEXP, p(rightExpr)),
  Isnull: ({ expr }) => join.space(p(expr), Keywords.ISNULL),
  Notnull: ({ expr }) => join.space(p(expr), Keywords.NOTNULL),
  NotNull: ({ expr }) => join.space(p(expr), Keywords.NOT, Keywords.NULL),
  LowerThan: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.LowerThan, p(rightExpr)),
  GreaterThan: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.GreaterThan, p(rightExpr)),
  LowerThanOrEqual: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.LowerThanOrEqual, p(rightExpr)),
  GreaterThanOrEqual: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.GreaterThanOrEqual, p(rightExpr)),
  BitwiseAnd: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.BitwiseAnd, p(rightExpr)),
  BitwiseOr: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.BitwiseOr, p(rightExpr)),
  BitwiseShiftLeft: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.BitwiseShiftLeft, p(rightExpr)),
  BitwiseShiftRight: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.BitwiseShiftRight, p(rightExpr)),
  Add: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.Add, p(rightExpr)),
  Subtract: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.Subtract, p(rightExpr)),
  Multiply: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.Multiply, p(rightExpr)),
  Divide: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.Divide, p(rightExpr)),
  Modulo: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.Modulo, p(rightExpr)),
  Concatenate: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.Concatenate, p(rightExpr)),
  Extract: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.Extract, p(rightExpr)),
  ExtractJson: ({ leftExpr, rightExpr }) => join.space(p(leftExpr), BinaryOperator.ExtractJson, p(rightExpr)),
  Collate: ({ expr, collationName }) => join.space(p(expr), Keywords.COLLATE, p(collationName)),
  BitwiseNegation: ({ expr }) => join.space(UnaryOperator.BitwiseNegation, p(expr)),
  Plus: ({ expr }) => join.space(UnaryOperator.Plus, p(expr)),
  Minus: ({ expr }) => join.space(UnaryOperator.Minus, p(expr)),
  NumericLiteral: (node) => {
    // TODO make sure numbers are safe integers
    return mapVariants(node, {
      Integer: ({ integer, exponent }) =>
        join.all(
          integer.toFixed(0),
          mapMaybe(exponent, ({ e, sign, number }) => join.all(e, sign, number.toFixed(0)))
        ),
      Hexadecimal: ({ zeroX, value }) => join.all(zeroX, value.toString(16)),
      Float: ({ integral, fractional, exponent }) =>
        join.all(
          mapMaybe(integral, (i) => i.toFixed(0)),
          '.',
          fractional.toFixed(0),
          mapMaybe(exponent, ({ e, sign, number }) => join.all(e, sign, number.toFixed(0)))
        ),
    });
  },
  StringLiteral: ({ content }) => {
    return `'${content.replace(/'/g, "''")}'`;
  },
  BlobLiteral: ({ x, content }) => {
    return `${x}'${content}'`;
  },
  Null: () => Keywords.NULL,
  True: () => Keywords.TRUE,
  False: () => Keywords.FALSE,
  Current_Time: () => join.space(Keywords.CURRENT_TIME),
  Current_Date: () => join.space(Keywords.CURRENT_DATE),
  Current_Timestamp: () => join.space(Keywords.CURRENT_TIMESTAMP),
  Identifier: (node) => {
    switch (node.variant) {
      case 'Basic':
        return node.name;
      case 'Backtick':
        return '`' + node.name + '`';
      // case 'Brackets': return node.name;
      // case 'DoubleQuote': return node.name;
      default:
        throw new Error('Unexpected variant');
    }
  },
  BindParameter: (node) => {
    return mapVariants(node, {
      Indexed: () => '?',
      Numbered: ({ number }) => `?${number.toFixed(0)}`,
      AtNamed: ({ name, suffix }) =>
        join.all(
          '@',
          name,
          mapMaybe(suffix, (s) => `::(${s})`)
        ),
      ColonNamed: ({ name, suffix }) =>
        join.all(
          ':',
          name,
          mapMaybe(suffix, (s) => `::(${s})`)
        ),
      DollarNamed: ({ name, suffix }) =>
        join.all(
          '$',
          name,
          mapMaybe(suffix, (s) => `::(${s})`)
        ),
    });
  },
  Column: ({ table, columnName }) => {
    return join.all(
      mapMaybe(table, ({ name, schema }) =>
        join.all(
          mapMaybe(schema, (s) => join.all(p(s), '.')),
          p(name),
          '.'
        )
      ),
      p(columnName)
    );
  },
  Exists: ({ exists, selectStmt }) => {
    return join.space(exists && Keywords.EXISTS, p(selectStmt));
  },
  NotExists: ({ selectStmt }) => {
    return join.space(Keywords.NOT, Keywords.EXISTS, p(selectStmt));
  },
  FunctionInvocation: ({ functionName, parameters, filterClause, overClause }) => {
    return join.space(
      join.all(
        p(functionName),
        parent(
          mapMaybe(parameters, (params) =>
            mapVariants(params, {
              Exprs: ({ distinct, exprs }) => join.space(distinct && Keywords.DISTINCT, printNodeList(exprs)),
              Star: () => '*',
            })
          )
        )
      ),
      filterClause && p(filterClause),
      overClause && p(overClause)
    );
  },
  Parenthesis: ({ exprs }) => {
    return parent(printNodeList(exprs));
  },
  CastAs: ({ expr, typeName }) => {
    return join.space(Keywords.CAST, parent(join.space(p(expr), Keywords.AS, p(typeName))));
  },
  Case: ({ expr, cases, else: elsePart }) => {
    return join.space(
      Keywords.CASE,
      expr && p(expr),
      Keywords.WHEN,
      printList(cases, ({ whenExpr, thenExpr }) => join.space(Keywords.WHEN, p(whenExpr), Keywords.THEN, p(thenExpr))),
      elsePart && join.space(Keywords.ELSE, p(elsePart)),
      Keywords.END
    );
  },
  FactoredSelectStmt: ({ with: withPart, firstSelect, compoundSelects, orderBy, limit }) => {
    return join.space(
      mapMaybe(withPart, ({ recursive, commonTableExpressions }) =>
        join.space(Keywords.WITH, recursive && Keywords.RECURSIVE, printNodeList(commonTableExpressions))
      ),
      p(firstSelect),
      compoundSelects && printList(compoundSelects, ({ compoundOperator, select }) => join.space(p(compoundOperator), p(select))),
      orderBy && join.space(Keywords.ORDER, Keywords.BY, printNodeList(orderBy)),
      mapMaybe(limit, ({ expr, offset }) =>
        join.space(
          Keywords.LIMIT,
          join.all(
            p(expr),
            mapMaybe(offset, ({ separator, expr }) =>
              mapUnionString(separator, {
                Comma: join.space(',', p(expr)),
                Offset: ' ' + join.space(Keywords.OFFSET, p(expr)),
              })
            )
          )
        )
      )
    );
  },
  FilterClause: ({ expr }) => {
    return join.space(Keywords.FILTER, parent(join.space(Keywords.WHERE, p(expr))));
  },
  ForeignKeyClause: ({ foreignTable, columnNames, constraints, deferrable }) => {
    return join.space(
      Keywords.REFERENCES,
      p(foreignTable),
      columnNames && parent(printNodeList(columnNames)),
      constraints &&
        printList(constraints, (c) =>
          mapVariants(c, {
            On: ({ action, event }) =>
              join.space(
                Keywords.ON,
                mapUnionString(event, {
                  Delete: Keywords.DELETE,
                  Update: Keywords.UPDATE,
                }),
                mapUnionString(action, {
                  SetNull: join.space(Keywords.SET, Keywords.NULL),
                  SetDefault: join.space(Keywords.SET, Keywords.DEFAULT),
                  Cascade: Keywords.CASCADE,
                  Restrict: Keywords.RESTRICT,
                  NoAction: join.space(Keywords.NO, Keywords.ACTION),
                })
              ),
            Match: ({ name }) => join.space(Keywords.MATCH, p(name)),
          })
        ),
      mapMaybe(deferrable, ({ not, initially }) =>
        join.space(
          not && Keywords.NOT,
          Keywords.DEFERRABLE,
          initially &&
            join.space(
              Keywords.INITIALLY,
              mapUnionString(initially, {
                Immediate: Keywords.IMMEDIATE,
                Deferred: Keywords.DEFERRED,
              })
            )
        )
      )
    );
  },
  FrameSpec: ({ type, inner, exclude }) => {
    return join.space(
      mapUnionString(type, {
        Range: Keywords.RANGE,
        Rows: Keywords.ROWS,
        Groups: Keywords.GROUPS,
      }),
      mapVariants(inner, {
        Between: ({ left, right }) =>
          join.space(
            Keywords.BETWEEN,
            mapVariants(left, {
              UnboundedPreceding: () => join.space(Keywords.UNBOUNDED, Keywords.PRECEDING),
              Preceding: ({ expr }) => join.space(p(expr), Keywords.PRECEDING),
              CurrentRow: () => join.space(Keywords.CURRENT, Keywords.ROW),
              Following: ({ expr }) => join.space(p(expr), Keywords.FOLLOWING),
            }),
            Keywords.AND,
            mapVariants(right, {
              UnboundedPreceding: () => join.space(Keywords.UNBOUNDED, Keywords.PRECEDING),
              Preceding: ({ expr }) => join.space(p(expr), Keywords.PRECEDING),
              CurrentRow: () => join.space(Keywords.CURRENT, Keywords.ROW),
              Following: ({ expr }) => join.space(p(expr), Keywords.FOLLOWING),
            })
          ),
        UnboundedPreceding: () => join.space(Keywords.UNBOUNDED, Keywords.PRECEDING),
        Preceding: ({ expr }) => join.space(p(expr), Keywords.PRECEDING),
        CurrentRow: () => join.space(Keywords.CURRENT, Keywords.ROW),
      }),
      exclude &&
        join.space(
          Keywords.EXCLUDE,
          mapUnionString(exclude, {
            NoOther: join.space(Keywords.NO, Keywords.OTHERS),
            CurrentRow: join.space(Keywords.CURRENT, Keywords.ROW),
            Group: Keywords.GROUP,
            Ties: Keywords.TIES,
          })
        )
    );
  },
  IndexedColumn: ({ column, collate, direction }) => {
    return join.space(
      mapVariants(column, {
        Name: ({ name }) => p(name),
        Expr: ({ expr }) => p(expr),
      }),
      collate && join.space(Keywords.COLLATE, p(collate)),
      direction && mapUnionString(direction, { Asc: Keywords.ASC, Desc: Keywords.DESC })
    );
  },
  InsertStmt: ({ with: withPart, method, schema, table, alias, columnNames, data, returningClause }) => {
    return join.space(
      mapMaybe(withPart, ({ recursive, commonTableExpressions }) =>
        join.space(Keywords.WITH, recursive && Keywords.RECURSIVE, printNodeList(commonTableExpressions))
      ),
      mapVariants(method, {
        ReplaceInto: () => join.space(Keywords.REPLACE, Keywords.INTO),
        InsertInto: ({ or }) =>
          join.space(
            Keywords.INSERT,
            or &&
              join.space(
                Keywords.OR,
                mapUnionString(or, {
                  Abort: Keywords.ABORT,
                  Fail: Keywords.FAIL,
                  Ignore: Keywords.IGNORE,
                  Replace: Keywords.REPLACE,
                  Rollback: Keywords.ROLLBACK,
                })
              ),
            Keywords.INTO,
            join.all(schema && join.space(p(schema), '.'), p(table)),
            alias && join.space(Keywords.AS, p(alias)),
            columnNames && parent(printNodeList(columnNames)),
            mapVariants(data, {
              Values: ({ rows, upsertClause }) =>
                join.space(
                  Keywords.VALUES,
                  printList(rows, (row) => parent(printNodeList(row))),
                  upsertClause && p(upsertClause)
                ),
              Select: ({ selectStmt, upsertClause }) => join.space(p(selectStmt), upsertClause && p(upsertClause)),
              DefaultValues: () => join.space(Keywords.DEFAULT, Keywords.VALUES),
            }),
            returningClause && p(returningClause)
          ),
      })
    );
  },
  JoinClause: ({ tableOrSubquery, joins }) => {
    return join.space(
      p(tableOrSubquery),
      joins &&
        printList(joins, ({ joinOperator, tableOrSubquery, joinConstraint }) => join.space(p(joinOperator), p(tableOrSubquery), mapMaybe(joinConstraint, p)))
    );
  },
  JoinConstraint: (node) => {
    return mapVariants(node, {
      On: ({ expr }) => join.space(Keywords.ON, p(expr)),
      Using: ({ columnNames }) => join.space(Keywords.USING, parent(printNodeList(columnNames))),
    });
  },
  JoinOperator: (node) => {
    return mapVariants(node, {
      Comma: () => ',',
      Join: ({ join: joinPart, natural }) =>
        join.space(
          natural && Keywords.NATURAL,
          joinPart &&
            mapUnionString(joinPart, {
              LeftOuter: join.space(Keywords.LEFT, Keywords.OUTER),
              Left: Keywords.LEFT,
              Inner: Keywords.INNER,
              Cross: Keywords.CROSS,
            }),
          Keywords.JOIN
        ),
    });
  },
  OrderingTerm: ({ expr, collate, direction, nulls }) => {
    return join.space(
      p(expr),
      collate && join.space(Keywords.COLLATE, p(collate)),
      direction && mapUnionString(direction, { Asc: Keywords.ASC, Desc: Keywords.DESC }),
      nulls && join.space(Keywords.NULLS, mapUnionString(nulls, { First: Keywords.FIRST, Last: Keywords.LAST }))
    );
  },
  OverClause: (node) => {
    return join.space(
      Keywords.OVER,
      mapVariants(node, {
        WindowName: ({ windowName }) => p(windowName),
        Window: ({ baseWindowName, partitionBy, orderBy, frameSpec }) =>
          parent(
            join.space(
              baseWindowName && p(baseWindowName),
              partitionBy && join.space(Keywords.PARTITION, Keywords.BY, printNodeList(partitionBy)),
              orderBy && join.space(Keywords.ORDER, Keywords.BY, printNodeList(orderBy)),
              frameSpec && p(frameSpec)
            )
          ),
      })
    );
  },
  PragmaStmt: ({ schema, pragma, value }) => {
    return join.space(
      Keywords.PRAGMA,
      join.all(
        schema && join.space(p(schema), '.'),
        p(pragma),
        value &&
          mapVariants(value, {
            Call: ({ pragmaValue }) => parent(p(pragmaValue)),
            Equal: ({ pragmaValue }) => ' ' + join.space('=', p(pragmaValue)),
          })
      )
    );
  },
  QualifiedTableName: ({ schema, table, alias, inner }) => {
    return join.space(
      join.all(schema && join.space(p(schema), '.'), p(table)),
      alias && join.space(Keywords.AS, p(alias)),
      inner &&
        mapVariants(inner, {
          IndexedBy: ({ indexName }) => join.space(Keywords.INDEXED, Keywords.BY, p(indexName)),
          NotIndexed: () => join.space(Keywords.NOT, Keywords.INDEXED),
        })
    );
  },
  RaiseFunction: (node) => {
    return join.space(
      Keywords.RAISE,
      parent(
        mapVariants(node, {
          Ignore: () => Keywords.IGNORE,
          Rollback: ({ errorMessage }) => join.comma(Keywords.ROLLBACK, p(errorMessage)),
          Abort: ({ errorMessage }) => join.comma(Keywords.ABORT, p(errorMessage)),
          Fail: ({ errorMessage }) => join.comma(Keywords.FAIL, p(errorMessage)),
        })
      )
    );
  },
  RecursiveCte: ({ cteTableName, initialSelect, union, recursiveSelect }) => {
    return join.space(
      p(cteTableName),
      Keywords.AS,
      parent(
        join.space(
          p(initialSelect),
          mapUnionString(union, {
            Union: Keywords.UNION,
            UnionAll: join.space(Keywords.UNION, Keywords.ALL),
          }),
          p(recursiveSelect)
        )
      )
    );
  },
  ReindexStmt: (node) => {
    return join.space(
      Keywords.REINDEX,
      mapVariants(node, {
        Reindex: () => '',
        CollationName: ({ collationName }) => p(collationName),
        TableOrIndex: ({ schema, tableOrIndex }) => join.all(schema && join.space(p(schema), '.'), p(tableOrIndex)),
      })
    );
  },
  ReleaseStmt: ({ savepoint, savepointName }) => {
    return join.space(Keywords.RELEASE, savepoint && Keywords.SAVEPOINT, p(savepointName));
  },
  ResultColumn: (node) => {
    return mapVariants(node, {
      Star: () => '*',
      TableStar: ({ tableName }) => join.all(p(tableName), '.', '*'),
      Expr: ({ expr, alias }) =>
        join.space(
          p(expr),
          mapMaybe(alias, ({ as: asPart, name }) => join.space(asPart && Keywords.AS, p(name)))
        ),
    });
  },
  ReturningClause: ({ items }) => {
    return join.space(
      Keywords.RETURNING,
      printList(items, (item) =>
        mapVariants(item, {
          Star: () => '*',
          Expr: ({ expr, alias }) =>
            join.space(
              p(expr),
              mapMaybe(alias, ({ as: asPart, name }) => join.space(asPart && Keywords.AS, p(name)))
            ),
        })
      )
    );
  },
  RollbackStmt: ({ transaction, to }) => {
    return join.space(
      Keywords.ROLLBACK,
      transaction && Keywords.TRANSACTION,
      mapMaybe(to, ({ savepoint, savepointName }) => join.space(Keywords.TO, savepoint && Keywords.SAVEPOINT, p(savepointName)))
    );
  },
  SavepointStmt: ({ savepointName }) => {
    return join.space(Keywords.SAVEPOINT, p(savepointName));
  },
  SelectCore: (node) => {
    return mapVariants(node, {
      Select: ({ distinct, resultColumns, from, where, groupBy, window }) =>
        join.space(
          Keywords.SELECT,
          distinct && mapUnionString(distinct, { Distinct: Keywords.DISTINCT, All: Keywords.ALL }),
          printNodeList(resultColumns),
          mapMaybe(from, (from) =>
            join.space(
              Keywords.FROM,
              mapVariants(from, {
                TablesOrSubqueries: ({ tablesOrSubqueries }) => printNodeList(tablesOrSubqueries),
                Join: ({ joinClause }) => p(joinClause),
              })
            )
          ),
          where && join.space(Keywords.WHERE, p(where)),
          mapMaybe(groupBy, ({ exprs, having }) =>
            join.space(Keywords.GROUP, Keywords.BY, printNodeList(exprs), having && join.space(Keywords.HAVING, p(having)))
          ),
          mapMaybe(window, (items) =>
            join.space(
              Keywords.WINDOW,
              printList(items, ({ windowName, windowDefn }) => join.space(p(windowName), Keywords.AS, p(windowDefn)))
            )
          )
        ),
      Values: ({ values }) =>
        join.space(
          Keywords.VALUES,
          printList(values, (items) => printNodeList(items))
        ),
    });
  },
  SelectStmt: ({ with: withPart, select, compoundSelects, orderBy, limit }) => {
    return join.space(
      mapMaybe(withPart, ({ recursive, commonTableExpressions }) =>
        join.space(Keywords.WITH, recursive && Keywords.RECURSIVE, printNodeList(commonTableExpressions))
      ),
      p(select),
      compoundSelects && printList(compoundSelects, ({ compoundOperator, select }) => join.space(p(compoundOperator), p(select))),
      orderBy && join.space(Keywords.ORDER, Keywords.BY, printNodeList(orderBy)),
      mapMaybe(limit, ({ expr, offset }) =>
        join.space(
          Keywords.LIMIT,
          join.all(
            p(expr),
            mapMaybe(offset, ({ separator, expr }) =>
              mapUnionString(separator, {
                Comma: join.space(',', p(expr)),
                Offset: ' ' + join.space(Keywords.OFFSET, p(expr)),
              })
            )
          )
        )
      )
    );
  },
  SignedNumber: ({ sign, numericLiteral }) => {
    return join.all(sign && mapUnionString(sign, { Plus: '+', Minus: '-' }), p(numericLiteral));
  },
  SimpleFunctionInvocation: ({ simpleFunc, parameters }) => {
    return join.space(
      p(simpleFunc),
      parent(
        parameters &&
          mapVariants(parameters, {
            Star: () => '*',
            Exprs: ({ exprs }) => printNodeList(exprs),
          })
      )
    );
  },
  SimpleSelectStmt: ({ with: withPart, select, orderBy, limit }) => {
    return join.space(
      mapMaybe(withPart, ({ recursive, commonTableExpressions }) =>
        join.space(Keywords.WITH, recursive && Keywords.RECURSIVE, printNodeList(commonTableExpressions))
      ),
      p(select),
      orderBy && join.space(Keywords.ORDER, Keywords.BY, printNodeList(orderBy)),
      mapMaybe(limit, ({ expr, offset }) =>
        join.space(
          Keywords.LIMIT,
          join.all(
            p(expr),
            mapMaybe(offset, ({ separator, expr }) =>
              mapUnionString(separator, {
                Comma: join.space(',', p(expr)),
                Offset: ' ' + join.space(Keywords.OFFSET, p(expr)),
              })
            )
          )
        )
      )
    );
  },
  SqlStmt: ({ explain, stmt }) => {
    return join.space(
      explain &&
        mapUnionString(explain, {
          Explain: Keywords.EXPLAIN,
          ExplainQueryPlan: join.space(Keywords.EXPLAIN, Keywords.QUERY, Keywords.PLAN),
        }),
      p(stmt)
    );
  },
  SqlStmtList: ({ items }) => {
    return items
      ? printList(
          items,
          (item) =>
            mapVariants(item, {
              Empty: () => '',
              Stmt: ({ stmt }) => p(stmt),
            }),
          '; '
        )
      : '';
  },
  TableConstraint: ({ constraintName, inner }) => {
    return join.space(
      constraintName && join.space(Keywords.CONSTRAINT, p(constraintName)),
      mapVariants(inner, {
        PrimaryKey: ({ indexedColumns, conflictClause }) =>
          join.space(Keywords.PRIMARY, Keywords.KEY, parent(printNodeList(indexedColumns)), mapMaybe(conflictClause, p)),
        Unique: ({ indexedColumns, conflictClause }) => join.space(Keywords.UNIQUE, parent(printNodeList(indexedColumns)), mapMaybe(conflictClause, p)),
        Check: ({ expr }) => join.space(Keywords.CHECK, parent(p(expr))),
        ForeignKey: ({ columnNames, foreignKeyClause }) => join.space(Keywords.FOREIGN, Keywords.KEY, parent(printNodeList(columnNames)), p(foreignKeyClause)),
      })
    );
  },
  TableOptions: ({ options }) => {
    return printList(options, (option) =>
      mapVariants(option, {
        Strict: () => Keywords.STRICT,
        WithoutRowid: () => join.space(Keywords.WITHOUT, Keywords.ROWID),
      })
    );
  },
  TableOrSubquery: (node) => {
    return mapVariants(node, {
      Table: ({ schema, table, alias, index }) =>
        join.space(
          join.all(schema && join.space(p(schema), '.'), p(table)),
          mapMaybe(alias, ({ as: asPart, tableAlias }) => join.space(asPart && Keywords.AS, p(tableAlias))),
          index &&
            mapVariants(index, {
              IndexedBy: ({ indexName }) => join.space(Keywords.INDEXED, Keywords.BY, p(indexName)),
              NotIndexed: () => join.space(Keywords.NOT, Keywords.INDEXED),
            })
        ),
      TableFunctionInvocation: ({ schema, function: func, parameters, alias }) =>
        join.space(
          join.all(schema && join.space(p(schema), '.'), p(func), parent(printNodeList(parameters))),
          mapMaybe(alias, ({ as: asPart, tableAlias }) => join.space(asPart && Keywords.AS, p(tableAlias)))
        ),
      Select: ({ selectStmt, alias }) =>
        join.space(
          parent(p(selectStmt)),
          mapMaybe(alias, ({ as: asPart, tableAlias }) => join.space(asPart && Keywords.AS, p(tableAlias)))
        ),
      TableOrSubqueries: ({ tableOrSubqueries }) => parent(printNodeList(tableOrSubqueries)),
      Join: ({ joinClause }) => parent(p(joinClause)),
    });
  },
  TypeName: ({ name, size }) => {
    return join.space(
      printList(name, (v) => v, ' '),
      mapMaybe(size, ({ first, second }) => parent(join.all(p(first), second && join.all(', ', p(second)))))
    );
  },
  UpdateStmt: ({ with: withPart, or, qualifiedTableName, setItems, from, where, returningClause }) => {
    return join.space(
      mapMaybe(withPart, ({ recursive, commonTableExpressions }) =>
        join.space(Keywords.WITH, recursive && Keywords.RECURSIVE, printNodeList(commonTableExpressions))
      ),
      Keywords.UPDATE,
      or &&
        join.space(
          Keywords.OR,
          mapUnionString(or, {
            Abort: Keywords.ABORT,
            Fail: Keywords.FAIL,
            Ignore: Keywords.IGNORE,
            Replace: Keywords.REPLACE,
            Rollback: Keywords.ROLLBACK,
          })
        ),
      p(qualifiedTableName),
      Keywords.SET,
      printList(setItems, (item) =>
        mapVariants(item, {
          ColumnName: ({ columnName, expr }) => join.space(p(columnName), '=', p(expr)),
          ColumnNameList: ({ columnNameList, expr }) => join.space(p(columnNameList), '=', p(expr)),
        })
      ),
      from &&
        join.space(
          Keywords.FROM,
          mapVariants(from, {
            TableOrSubquery: ({ tableOrSubqueries }) => printNodeList(tableOrSubqueries),
            JoinClause: ({ joinClause }) => p(joinClause),
          })
        ),
      where && join.space(Keywords.WHERE, p(where)),
      returningClause && p(returningClause)
    );
  },
  UpdateStmtLimited: ({ with: withPart, or, qualifiedTableName, setItems, from, where, orderBy, limit }) => {
    return join.space(
      mapMaybe(withPart, ({ recursive, commonTableExpressions }) =>
        join.space(Keywords.WITH, recursive && Keywords.RECURSIVE, printNodeList(commonTableExpressions))
      ),
      Keywords.UPDATE,
      or &&
        join.space(
          Keywords.OR,
          mapUnionString(or, {
            Abort: Keywords.ABORT,
            Fail: Keywords.FAIL,
            Ignore: Keywords.IGNORE,
            Replace: Keywords.REPLACE,
            Rollback: Keywords.ROLLBACK,
          })
        ),
      p(qualifiedTableName),
      Keywords.SET,
      printList(setItems, (item) =>
        mapVariants(item, {
          ColumnName: ({ columnName, expr }) => join.space(p(columnName), '=', p(expr)),
          ColumnNameList: ({ columnNameList, expr }) => join.space(p(columnNameList), '=', p(expr)),
        })
      ),
      from &&
        join.space(
          Keywords.FROM,
          mapVariants(from, {
            TableOrSubquery: ({ tableOrSubqueries }) => printNodeList(tableOrSubqueries),
            JoinClause: ({ joinClause }) => p(joinClause),
          })
        ),
      mapMaybe(where, ({ expr, returningClause }) => join.space(Keywords.WHERE, p(expr), returningClause && p(returningClause))),
      mapMaybe(orderBy, (o) => join.space(Keywords.ORDER, Keywords.BY, printNodeList(o))),
      mapMaybe(limit, ({ expr, offset }) =>
        join.space(
          Keywords.LIMIT,
          join.all(
            p(expr),
            mapMaybe(offset, ({ separator, expr }) =>
              mapUnionString(separator, {
                Comma: join.space(',', p(expr)),
                Offset: ' ' + join.space(Keywords.OFFSET, p(expr)),
              })
            )
          )
        )
      )
    );
  },
  UpsertClause: ({ items }) => {
    return printList(items, ({ target, inner }) =>
      join.space(
        Keywords.ON,
        Keywords.CONFLICT,
        mapMaybe(target, ({ indexedColumns, where }) => join.space(parent(printNodeList(indexedColumns)), where && join.space(Keywords.WHERE, p(where)))),
        Keywords.DO,
        mapVariants(inner, {
          Nothing: () => Keywords.NOTHING,
          UpdateSet: ({ setItems, where }) =>
            join.space(
              Keywords.UPDATE,
              Keywords.SET,
              printList(setItems, (item) =>
                mapVariants(item, {
                  ColumnName: ({ columnName, expr }) => join.space(p(columnName), '=', p(expr)),
                  ColumnNameList: ({ columnNameList, expr }) => join.space(p(columnNameList), '=', p(expr)),
                })
              ),
              where && join.space(Keywords.WHERE, p(where))
            ),
        })
      )
    );
  },
  VacuumStmt: ({ schemaName, into }) => {
    return join.space(Keywords.VACUUM, schemaName && p(schemaName), into && join.space(Keywords.INTO, p(into)));
  },
  WindowDefn: ({ baseWindowName, partitionBy, orderBy, frameSpec }) => {
    return parent(
      join.space(
        baseWindowName && p(baseWindowName),
        partitionBy && join.space(Keywords.PARTITION, Keywords.BY, printNodeList(partitionBy)),
        orderBy && join.space(Keywords.ORDER, Keywords.BY, printNodeList(orderBy)),
        frameSpec && p(frameSpec)
      )
    );
  },
  WindowFunctionInvocation: ({ windowFunc, parameters, filterClause, over }) => {
    return join.space(
      p(windowFunc),
      parent(
        parameters &&
          mapVariants(parameters, {
            Star: () => '*',
            Exprs: ({ exprs }) => printNodeList(exprs),
          })
      ),
      filterClause && p(filterClause),
      Keywords.OVER,
      mapVariants(over, {
        WindowDefn: ({ windowDefn }) => p(windowDefn),
        WindowName: ({ windowName }) => p(windowName),
      })
    );
  },
  WithClause: ({ recursive, items }) => {
    return join.space(
      Keywords.WITH,
      recursive && Keywords.RECURSIVE,
      printList(items, ({ cteTableName, materialized, select }) =>
        join.space(
          p(cteTableName),
          Keywords.AS,
          materialized &&
            mapUnionString(materialized, {
              Materialized: Keywords.MATERIALIZED,
              NotMaterialized: join.space(Keywords.NOT, Keywords.MATERIALIZED),
            }),
          parent(p(select))
        )
      )
    );
  },
};
