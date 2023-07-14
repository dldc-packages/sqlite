import type { NonEmptyArray, Variants } from './Utils';

export function createNode<K extends NodeKind>(kind: K, data: NodeData[K]): Node<K> {
  const node: Node<K> = { kind, ...data } as any;
  return node;
}

export interface NodeData {
  AggregateFunctionInvocation: {
    aggregateFunc: Identifier;
    // (
    parameters?: Variants<{
      Star: {};
      Exprs: {
        distinct?: true;
        exprs: NonEmptyArray<Expr>;
      };
    }>;
    // )
    filterClause?: Node<'FilterClause'>;
  };
  AlterTableStmt: {
    // ALTER TABLE
    schemaName?: Identifier;
    tableName: Identifier;
    action: Variants<{
      RenameTo: {
        // RENAME TO
        newTableName: Identifier;
      };
      RenameColumn: {
        // RENAME
        column?: true;
        columnName: Identifier;
        // TO
        newColumnName: Identifier;
      };
      AddColumn: {
        // ADD
        column?: true;
        columnDef: Node<'ColumnDef'>;
      };
      DropColumn: {
        // DROP
        column?: true;
        columnName: Identifier;
      };
    }>;
  };
  AnalyzeStmt: {
    // ANALYZE
    target?: Variants<{
      Schema: {
        schemaName: Identifier;
      };
      IndexOrTable: {
        schemaName?: Identifier;
        indexOrTableName: Identifier;
      };
    }>;
  };
  AttachStmt: {
    // ATTACH
    database?: true;
    expr: Expr;
    // AS
    schemaName: Identifier;
  };
  BeginStmt: {
    // BEGIN
    mode?: 'Deferred' | 'Immediate' | 'Exclusive';
    transaction?: true;
  };
  ColumnConstraint: {
    constraintName?: /* CONSTRAINT */ Identifier;
    constraint: Variants<{
      PrimaryKey: {
        // PRIMARY KEY
        direction?: 'Asc' | 'Desc';
        conflictClause?: Node<'ConflictClause'>;
        autoincrement?: true;
      };
      NotNull: {
        // NOT NULL
        conflictClause?: Node<'ConflictClause'>;
      };
      Unique: {
        // UNIQUE
        conflictClause?: Node<'ConflictClause'>;
      };
      Check: {
        // CHECK (
        expr: Expr;
        // )
      };
      // Note: DEFAULT splitted in 3 variants
      DefaultExpr: {
        // DEFAULT (
        expr: Expr;
        // )
      };
      DefaultLiteralValue: {
        // DEFAULT
        literalValue: LiteralValue;
      };
      DefaultSignedNumber: {
        // DEFAULT
        signedNumber: Node<'SignedNumber'>;
      };
      Collate: {
        // COLLATE
        collationName: Identifier;
      };
      ForeignKey: {
        foreignKeyClause: Node<'ForeignKeyClause'>;
      };
      As: {
        generatedAlways?: true;
        expr: Expr;
        mode?: 'Stored' | 'Virtual';
      };
    }>;
  };
  ColumnDef: {
    columnName: Identifier;
    typeName?: Node<'TypeName'>;
    columnConstraints?: NonEmptyArray<Node<'ColumnConstraint'>>;
  };
  ColumnNameList: {
    // (
    columnNames: NonEmptyArray<Identifier>;
    // )
  };
  CommentSyntax: Variants<{
    SingleLine: {
      // --
      content: string;
      close: 'NewLine' | 'EndOfFile';
    };
    Multiline: {
      // /*
      content: string;
      // */
    };
  }>;
  CommitStmt: {
    action: 'Commit' | 'End';
    transaction?: true;
  };
  CommonTableExpression: {
    tableName: Identifier;
    columnNames?: /* ( */ NonEmptyArray<Identifier>; // )
    // AS
    materialized?: 'Materialized' | 'NotMaterialized';
    // (
    select: Node<'SelectStmt'>;
    // )
  };
  CompoundOperator: {
    variant: 'Union' | 'UnionAll' | 'Except' | 'Intersect';
  };
  CompoundSelectStmt: {
    with?: {
      // WITH
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    select: Node<'SelectCore'>;
    compoundSelects: NonEmptyArray<{
      operator: 'Union' | 'UnionAll' | 'Except' | 'Intersect';
      select: Node<'SelectCore'>;
    }>;
    orderBy?: /* ORDER BY */ NonEmptyArray<Node<'OrderingTerm'>>;
    limit?: {
      // LIMIT
      expr: Expr;
      offset?: { separator: 'Comma' | 'Offset'; expr: Expr };
    };
  };
  // Note: ConflictClause is made optional when used instead of allowing empty object
  ConflictClause: {
    // ON CONFLICT
    onConflict: 'Rollback' | 'Abort' | 'Fail' | 'Ignore' | 'Replace';
  };
  CreateIndexStmt: {
    // CREATE
    unique?: true;
    // INDEX
    ifNotExists?: true;
    schemaName?: Identifier;
    indexName: Identifier;
    tableName: Identifier;
    // (
    indexedColumns: NonEmptyArray<Node<'IndexedColumn'>>;
    // )
    where?: Expr;
  };
  CreateTableStmt: {
    // CREATE
    temp?: 'Temp' | 'Temporary';
    // TABLE
    ifNotExists?: true;
    schemaName?: Identifier;
    tableName: Identifier;
    definition: Variants<{
      As: {
        // AS
        selectStmt: Node<'SelectStmt'>;
      };
      Columns: {
        // (
        columnDefs: NonEmptyArray<Node<'ColumnDef'>>;
        tableConstraints?: NonEmptyArray<Node<'TableConstraint'>>;
        // )
        tableOptions?: Node<'TableOptions'>;
      };
    }>;
  };
  CreateTriggerStmt: {
    // CREATE
    temp?: 'Temp' | 'Temporary';
    // TRIGGER
    ifNotExists?: true;
    schemaName?: Identifier;
    triggerName: Identifier;
    modifier?: 'Before' | 'After' | 'InsteadOf';
    action: Variants<{
      Delete: {
        // DELETE
      };
      Insert: {
        // INSERT
      };
      Update: {
        // UPDATE
        of?: NonEmptyArray<Identifier>;
      };
    }>;
    // ON
    tableName: Identifier;
    forEachRow?: true;
    when?: Expr;
    // BEGIN
    stmts: NonEmptyArray<Node<'UpdateStmt' | 'InsertStmt' | 'DeleteStmt' | 'SelectStmt'> /* ; */>;
    // END
  };
  CreateViewStmt: {
    // CREATE
    temp?: 'Temp' | 'Temporary';
    // VIEW
    ifNotExists?: true;
    schemaName?: Identifier;
    viewName: Identifier;
    columnNames?: /* ( */ NonEmptyArray<Identifier>; // )
    // AS
    asSelectStmt: Node<'SelectStmt'>;
  };
  CreateVirtualTableStmt: {
    // CREATE VIRTUAL TABLE
    ifNotExists?: true;
    schemaName?: Identifier;
    tableName: Identifier;
    // USING
    moduleName: Identifier;
    moduleArguments?: /* ( */ NonEmptyArray<Identifier>; // )
  };
  CteTableName: {
    tableName: Identifier;
    columnNames?: /* ( */ NonEmptyArray<Identifier>; // )
  };
  DeleteStmt: {
    with?: {
      // WITH
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    // DELETE FROM
    qualifiedTableName: Node<'QualifiedTableName'>;
    where?: Expr;
    returningClause?: Node<'ReturningClause'>;
  };
  DeleteStmtLimited: {
    with?: {
      // WITH
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    // DELETE FROM
    qualifiedTableName: Node<'QualifiedTableName'>;
    where?: Expr;
    returningClause?: Node<'ReturningClause'>;
    orderBy?: /* ORDER BY */ NonEmptyArray<Node<'OrderingTerm'>>;
    limit?: {
      // LIMIT
      expr: Expr;
      offset?: { separator: 'Comma' | 'Offset'; expr: Expr };
    };
  };
  DetachStmt: {
    // DETACH
    database?: true;
    schemeName: Identifier;
  };
  DropIndexStmt: {
    // DROP INDEX
    ifExists?: true;
    schemaName?: Identifier;
    indexName: Identifier;
  };
  DropTableStmt: {
    // DROP TABLE
    ifExists?: true;
    schemaName?: Identifier;
    tableName: Identifier;
  };
  DropTriggerStmt: {
    // DROP TRIGGER
    ifExists?: true;
    schemaName?: Identifier;
    triggerName: Identifier;
  };
  DropViewStmt: {
    // DROP VIEW
    ifExists?: true;
    schemaName?: Identifier;
    viewName: Identifier;
  };
  // Expr (https://www.sqlite.org/lang_expr.html)
  // Expr -- LiteralValue (https://www.sqlite.org/syntax/literal-value.html)
  NumericLiteral: Variants<{
    Integer: {
      integer: number;
      exponent?: { e: 'e' | 'E'; sign?: '+' | '-'; number: number };
    };
    Hexadecimal: { zeroX: '0x' | '0X'; value: number };
    Float: {
      integral?: number;
      fractional: number;
      exponent?: { e: 'e' | 'E'; sign?: '+' | '-'; number: number };
    };
  }>;
  StringLiteral: { content: string };
  BlobLiteral: { content: string; x: 'x' | 'X' };
  Null: {};
  True: {};
  False: {};
  Current_Time: {};
  Current_Date: {};
  Current_Timestamp: {};
  Identifier: {
    variant: 'Basic' | 'Brackets' | 'DoubleQuote' | 'Backtick';
    name: string;
  };
  // Expr -- End of LiteralValue
  BindParameter: Variants<{
    Indexed: {};
    Numbered: { number: number };
    AtNamed: { name: string; suffix?: string };
    ColonNamed: { name: string; suffix?: string };
    DollarNamed: { name: string; suffix?: string };
  }>;
  // Expr -- Operators in precedence order (lowest to highest)
  Or: {
    leftExpr: Expr;
    // OR
    rightExpr: Expr;
  };
  And: {
    leftExpr: Expr;
    // AND
    rightExpr: Expr;
  };
  Not: {
    // NOT
    expr: Expr;
  };
  Equal: {
    leftExpr: Expr;
    operator: '==' | '=';
    rightExpr: Expr;
  };
  Different: {
    leftExpr: Expr;
    operator: '!=' | '<>';
    rightExpr: Expr;
  };
  Is: {
    leftExpr: Expr;
    // IS
    not?: true;
    rightExpr: Expr;
  };
  IsDistinctFrom: {
    leftExpr: Expr;
    // IS
    not?: true;
    // DISTINCT FROM
    rightExpr: Expr;
  };
  Between: {
    expr: Expr;
    not?: true;
    // BETWEEN
    betweenExpr: Expr;
    // AND
    andExpr: Expr;
  };
  In: {
    expr: Expr;
    not?: true;
    // IN
    values: Variants<{
      List: {
        // (
        items?: NonEmptyArray<Expr>;
        // )
      };
      Select: {
        // (
        selectStmt: Node<'SelectStmt'>;
        // )
      };
      TableName: {
        schemaName?: Identifier;
        tableName: Identifier;
      };
      TableFunctionInvocation: {
        schemaName?: Identifier;
        functionName: Identifier;
        // (
        parameters?: NonEmptyArray<Expr>;
        // )
      };
    }>;
  };
  Match: {
    leftExpr: Expr;
    not?: true;
    // MATCH
    rightExpr: Expr;
  };
  Like: {
    leftExpr: Expr;
    not?: true;
    // LIKE
    rightExpr: Expr;
    escape?: Expr;
  };
  Glob: {
    leftExpr: Expr;
    not?: true;
    // GLOB
    rightExpr: Expr;
  };
  Regexp: {
    leftExpr: Expr;
    not?: true;
    // REGEXP
    rightExpr: Expr;
  };
  Isnull: {
    expr: Expr;
    // ISNULL
  };
  Notnull: {
    expr: Expr;
    // NOTNULL
  };
  NotNull: {
    expr: Expr;
    // NOT NULL
  };
  LowerThan: {
    leftExpr: Expr;
    // <
    rightExpr: Expr;
  };
  GreaterThan: {
    leftExpr: Expr;
    // >
    rightExpr: Expr;
  };
  LowerThanOrEqual: {
    leftExpr: Expr;
    // <=
    rightExpr: Expr;
  };
  GreaterThanOrEqual: {
    leftExpr: Expr;
    // >=
    rightExpr: Expr;
  };
  // Escape is part of Like, not a separate node
  BitwiseAnd: {
    leftExpr: Expr;
    // &
    rightExpr: Expr;
  };
  BitwiseOr: {
    leftExpr: Expr;
    // |
    rightExpr: Expr;
  };
  BitwiseShiftLeft: {
    leftExpr: Expr;
    // <<
    rightExpr: Expr;
  };
  BitwiseShiftRight: {
    leftExpr: Expr;
    // >>
    rightExpr: Expr;
  };
  Add: {
    leftExpr: Expr;
    // +
    rightExpr: Expr;
  };
  Subtract: {
    leftExpr: Expr;
    // -
    rightExpr: Expr;
  };
  Multiply: {
    leftExpr: Expr;
    // *
    rightExpr: Expr;
  };
  Divide: {
    leftExpr: Expr;
    // /
    rightExpr: Expr;
  };
  Modulo: {
    leftExpr: Expr;
    // %
    rightExpr: Expr;
  };
  Concatenate: {
    leftExpr: Expr;
    // ||
    rightExpr: Expr;
  };
  ExtractJson: {
    leftExpr: Expr;
    // ->
    rightExpr: Expr;
  };
  Extract: {
    leftExpr: Expr;
    // ->>
    rightExpr: Expr;
  };
  Collate: {
    expr: Expr;
    // COLLATE
    collationName: Identifier;
  };
  BitwiseNegation: {
    // ~
    expr: Expr;
  };
  Plus: {
    // +
    expr: Expr;
  };
  Minus: {
    // -
    expr: Expr;
  };
  // Expr -- Remainning Expr
  Column: {
    table?: { name: Identifier; schema?: Identifier };
    columnName: Identifier;
  };
  Exists: { exists?: true; selectStmt: Node<'SelectStmt'> };
  NotExists: { selectStmt: Node<'SelectStmt'> };
  // FunctionInvocation is not a node but the union of all function invocations (simple, aggregate, window)
  Parenthesis: {
    // (
    exprs: NonEmptyArray<Expr>;
    // )
  };
  CastAs: {
    // CAST
    expr: Expr;
    // AS
    typeName: Node<'TypeName'>;
  };
  Case: {
    // CASE
    expr?: Expr;
    cases: NonEmptyArray<{
      // WHEN
      whenExpr: Expr;
      // THEN
      thenExpr: Expr;
    }>;
    else?: /* ELSE */ Expr;
    // END
  };
  // RaiseFunction is a node
  // End of Expr
  FactoredSelectStmt: {
    with?: {
      // WITH
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    firstSelect: Node<'SelectCore'>;
    compoundSelects?: NonEmptyArray<{
      compoundOperator: Node<'CompoundOperator'>;
      select: Node<'SelectCore'>;
    }>;
    orderBy?: /* ORDER BY */ NonEmptyArray<Node<'OrderingTerm'>>;
    limit?: {
      // LIMIT
      expr: Expr;
      offset?: { separator: 'Comma' | 'Offset'; expr: Expr };
    };
  };
  FilterClause: {
    // FILTER
    // (
    // WHERE
    expr: Expr;
    // )
  };
  ForeignKeyClause: {
    // REFERENCES
    foreignTable: Identifier;
    columnNames?: /* ( */ NonEmptyArray<Identifier>; // )
    constraints?: NonEmptyArray<
      Variants<{
        On: {
          // ON
          event: 'Delete' | 'Update';
          action: 'SetNull' | 'SetDefault' | 'Cascade' | 'Restrict' | 'NoAction';
        };
        Match: {
          // MATCH
          name: Identifier;
        };
      }>
    >;
    deferrable?: {
      // DEFERRABLE
      not?: true;
      initially?: 'Deferred' | 'Immediate';
    };
  };
  FrameSpec: {
    type: 'Range' | 'Rows' | 'Groups';
    inner: Variants<{
      Between: {
        // BETWEEN
        left: Variants<{
          UnboundedPreceding: {};
          Preceding: { expr: Expr };
          CurrentRow: {};
          Following: { expr: Expr };
        }>;
        // AND
        right: Variants<{
          UnboundedPreceding: {};
          Preceding: { expr: Expr };
          CurrentRow: {};
          Following: { expr: Expr };
        }>;
      };
      UnboundedPreceding: {};
      Preceding: { expr: Expr };
      CurrentRow: {};
    }>;
    exclude?: 'NoOther' | 'CurrentRow' | 'Group' | 'Ties';
  };
  IndexedColumn: {
    column: Variants<{
      Name: { name: Identifier };
      Expr: { expr: Expr };
    }>;
    collate?: Identifier;
    direction?: 'Asc' | 'Desc';
  };
  InsertStmt: {
    with?: {
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    method: Variants<{
      ReplaceInto: {
        // REPLACE
      };
      InsertInto: {
        // INSERT
        or?: 'Abort' | 'Fail' | 'Ignore' | 'Replace' | 'Rollback';
      };
    }>;
    // INTO
    schemaName?: Identifier;
    tableName: Identifier;
    alias?: /* AS */ Identifier;
    columnNames?: /* ( */ NonEmptyArray<Identifier>; // )
    data: Variants<{
      Values: {
        // VALUES
        rows: NonEmptyArray</* ( */ NonEmptyArray<Expr> /* ) */>;
        upsertClause?: Node<'UpsertClause'>;
      };
      Select: {
        selectStmt: Node<'SelectStmt'>;
        upsertClause?: Node<'UpsertClause'>;
      };
      DefaultValues: {
        // DEFAULT VALUES
      };
    }>;
    returningClause?: Node<'ReturningClause'>;
  };
  JoinClause: {
    tableOrSubquery: Node<'TableOrSubquery'>;
    joins?: NonEmptyArray<{
      joinOperator: Node<'JoinOperator'>;
      tableOrSubquery: Node<'TableOrSubquery'>;
      joinConstraint?: Node<'JoinConstraint'>;
    }>;
  };
  JoinConstraint: Variants<{
    On: {
      // ON
      expr: Expr;
    };
    Using: {
      // USING
      // (
      columnNames: NonEmptyArray<Identifier>;
      // )
    };
  }>;
  JoinOperator: Variants<{
    Comma: {};
    Join: {
      natural?: true;
      join?: 'Left' | 'Right' | 'Full';
      outer?: true;
      // JOIN
    };
    InnerJoin: {
      natural?: true;
      // INNER
      // JOIN
    };
    CrossJoin: {
      // CROSS
      // JOIN
    };
  }>;
  // LiteralValue is defined in Expr section
  // NumericLiteral is defined in Expr section
  OrderingTerm: {
    expr: Expr;
    collate?: Identifier;
    direction?: 'Asc' | 'Desc';
    nulls?: 'First' | 'Last';
  };
  OverClause: Variants<{
    // OVER
    WindowName: { windowName: Identifier };
    Window: {
      baseWindowName?: Identifier;
      partitionBy?: NonEmptyArray<Expr>;
      orderBy?: NonEmptyArray<Node<'OrderingTerm'>>;
      frameSpec?: Node<'FrameSpec'>;
    };
  }>;
  PragmaStmt: {
    schemaName?: Identifier;
    pragmaName: Identifier;
    value?: Variants<{
      Equal: { pragmaValue: PragmaValue };
      Call: { pragmaValue: PragmaValue };
    }>;
  };
  // PragmaValue is not a node because it's just an alias
  QualifiedTableName: {
    schemaName?: Identifier;
    tableName: Identifier;
    alias?: Identifier;
    indexed?: Variants<{
      IndexedBy: { indexName: Identifier };
      NotIndexed: {};
    }>;
  };
  RaiseFunction: Variants<{
    // RAISE (
    Ignore: {};
    Rollback: { errorMessage: Node<'StringLiteral'> };
    Abort: { errorMessage: Node<'StringLiteral'> };
    Fail: { errorMessage: Node<'StringLiteral'> };
    // )
  }>;
  RecursiveCte: {
    cteTableName: Node<'CteTableName'>;
    // AS (
    // TODO: Fix this type
    initialSelect: any;
    union: 'Union' | 'UnionAll';
    // TODO: Fix this type
    recursiveSelect: any;
    // )
  };
  ReindexStmt: {
    // REINDEX
    value?: Variants<{
      CollationName: { collationName: Identifier };
      Table: { schemaName?: Identifier; tableName: Identifier };
      Index: { schemaName?: Identifier; indexName: Identifier };
    }>;
  };
  ReleaseStmt: {
    savepoint?: true;
    savepointName: Identifier;
  };
  ResultColumn: Variants<{
    Star: {};
    TableStar: { tableName: Identifier };
    Expr: { expr: Expr; alias?: { as?: true; columnName: Identifier } };
  }>;
  ReturningClause: {
    // RETURNING
    items: NonEmptyArray<
      Variants<{
        Star: {};
        Expr: {
          expr: Expr;
          alias?: { as?: true; name: Identifier };
        };
      }>
    >;
  };
  RollbackStmt: {
    // ROLLBACK
    transaction?: true;
    to?: {
      // TO
      savepoint?: true;
      savepointName: Identifier;
    };
  };
  SavepointStmt: {
    // SAVEPOINT
    savepointName: Identifier;
  };
  SelectCore: Variants<{
    Select: {
      // SELECT
      distinct?: 'Distinct' | 'All';
      resultColumns: NonEmptyArray<Node<'ResultColumn'>>;
      from?: Variants<{
        TablesOrSubqueries: { tablesOrSubqueries: NonEmptyArray<Node<'TableOrSubquery'>> };
        Join: { joinClause: Node<'JoinClause'> };
      }>;
      where?: Expr;
      groupBy?: { exprs: NonEmptyArray<Expr>; having?: Expr };
      window?: NonEmptyArray<{ windowName: Identifier; windowDefn: Node<'WindowDefn'> }>;
    };
    Values: {
      // VALUES
      values: NonEmptyArray<NonEmptyArray<Expr>>;
    };
  }>;
  SelectStmt: {
    with?: {
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    select: Node<'SelectCore'>;
    compoundSelects?: NonEmptyArray<{
      compoundOperator: Node<'CompoundOperator'>;
      select: Node<'SelectCore'>;
    }>;
    orderBy?: NonEmptyArray<Node<'OrderingTerm'>>;
    limit?: {
      expr: Expr;
      offset?: { separator: 'Comma' | 'Offset'; expr: Expr };
    };
  };
  SignedNumber: {
    sign?: 'Plus' | 'Minus';
    numericLiteral: Node<'NumericLiteral'>;
  };
  SimpleFunctionInvocation: {
    simpleFunc: Identifier;
    parameters?: Variants<{
      Star: {};
      Exprs: { exprs: NonEmptyArray<Expr> };
    }>;
  };
  SimpleSelectStmt: {
    with?: {
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    select: Node<'SelectCore'>;
    orderBy?: NonEmptyArray<Node<'OrderingTerm'>>;
    limit?: {
      expr: Expr;
      offset?: { separator: 'Comma' | 'Offset'; expr: Expr };
    };
  };
  SqlStmt: {
    explain?: 'Explain' | 'ExplainQueryPlan';
    stmt: Node<
      | 'AnalyzeStmt'
      | 'AttachStmt'
      | 'BeginStmt'
      | 'CommitStmt'
      | 'CreateIndexStmt'
      | 'CreateTableStmt'
      | 'CreateTriggerStmt'
      | 'CreateViewStmt'
      | 'CreateVirtualTableStmt'
      | 'DeleteStmt'
      | 'DeleteStmtLimited'
      | 'DetachStmt'
      | 'DropIndexStmt'
      | 'DropTableStmt'
      | 'DropTriggerStmt'
      | 'DropViewStmt'
      | 'InsertStmt'
      | 'PragmaStmt'
      | 'ReindexStmt'
      | 'ReleaseStmt'
      | 'RollbackStmt'
      | 'SavepointStmt'
      | 'SelectStmt'
      | 'UpdateStmt'
      | 'UpdateStmtLimited'
      | 'VacuumStmt'
    >;
  };
  SqlStmtList: {
    items: NonEmptyArray<
      Variants<{
        Empty: {};
        Stmt: { stmt: Node<'SqlStmt'> };
      }>
    >;
  };
  TableConstraint: {
    constraintName?: /* CONSTRAINT */ Identifier;
    inner: Variants<{
      PrimaryKey: {
        // PRIMARY KEY
        indexedColumns: NonEmptyArray<Node<'IndexedColumn'>>;
        conflictClause?: Node<'ConflictClause'>;
      };
      Unique: {
        indexedColumns: NonEmptyArray<Node<'IndexedColumn'>>;
        conflictClause?: Node<'ConflictClause'>;
      };
      Check: { expr: Expr };
      ForeignKey: {
        columnNames: NonEmptyArray<Identifier>;
        foreignKeyClause: Node<'ForeignKeyClause'>;
      };
    }>;
  };
  TableOptions: {
    options: NonEmptyArray<{ variant: 'Strict' | 'WithoutRowid' }>;
  };
  TableOrSubquery: Variants<{
    Table: {
      schemaName?: Identifier;
      tableName: Identifier;
      alias?: { as?: true; tableAlias: Identifier };
      index?: Variants<{
        IndexedBy: { indexName: Identifier };
        NotIndexed: {};
      }>;
    };
    TableFunctionInvocation: {
      schemaName?: Identifier;
      tableFunctionName: Identifier;
      parameters: NonEmptyArray<Expr>;
      alias?: { as?: true; tableAlias: Identifier };
    };
    Select: {
      selectStmt: Node<'SelectStmt'>;
      alias?: { as?: true; tableAlias: Identifier };
    };
    TableOrSubqueries: { tableOrSubqueries: NonEmptyArray<Node<'TableOrSubquery'>> };
    Join: { joinClause: Node<'JoinClause'> };
  }>;
  TypeName: {
    name: NonEmptyArray<string>;
    size?: { first: Node<'SignedNumber'>; second?: Node<'SignedNumber'> };
  };
  UpdateStmt: {
    with?: {
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    // UPDATE
    or?: 'Abort' | 'Fail' | 'Ignore' | 'Replace' | 'Rollback';
    qualifiedTableName: Node<'QualifiedTableName'>;
    setItems: NonEmptyArray<
      Variants<{
        ColumnName: { columnName: Identifier; expr: Expr };
        ColumnNameList: { columnNameList: Node<'ColumnNameList'>; expr: Expr };
      }>
    >;
    from?: Variants<{
      TableOrSubquery: { tableOrSubqueries: NonEmptyArray<Node<'TableOrSubquery'>> };
      JoinClause: { joinClause: Node<'JoinClause'> };
    }>;
    where?: Expr;
    returningClause?: Node<'ReturningClause'>;
  };
  UpdateStmtLimited: {
    with?: {
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    or?: 'Abort' | 'Fail' | 'Ignore' | 'Replace' | 'Rollback';
    qualifiedTableName: Node<'QualifiedTableName'>;
    setItems: NonEmptyArray<
      Variants<{
        ColumnName: { columnName: Identifier; expr: Expr };
        ColumnNameList: { columnNameList: Node<'ColumnNameList'>; expr: Expr };
      }>
    >;
    from?: Variants<{
      TableOrSubquery: { tableOrSubqueries: NonEmptyArray<Node<'TableOrSubquery'>> };
      JoinClause: { joinClause: Node<'JoinClause'> };
    }>;
    where?: {
      expr: Expr;
      returningClause?: Node<'ReturningClause'>;
    };
    orderBy?: NonEmptyArray<Node<'OrderingTerm'>>;
    limit?: {
      expr: Expr;
      offset?: { separator: 'Comma' | 'Offset'; expr: Expr };
    };
  };
  UpsertClause: {
    items: NonEmptyArray<{
      target?: { indexedColumns: NonEmptyArray<Node<'IndexedColumn'>>; where?: Expr };
      inner: Variants<{
        Nothing: {};
        UpdateSet: {
          setItems: NonEmptyArray<
            Variants<{
              ColumnName: { columnName: Identifier; expr: Expr };
              ColumnNameList: { columnNameList: Node<'ColumnNameList'>; expr: Expr };
            }>
          >;
          where?: Expr;
        };
      }>;
    }>;
  };
  VacuumStmt: {
    schemaName?: Identifier;
    into?: Identifier;
  };
  WindowDefn: {
    baseWindowName?: Identifier;
    partitionBy?: NonEmptyArray<Expr>;
    orderBy?: NonEmptyArray<Node<'OrderingTerm'>>;
    frameSpec?: Node<'FrameSpec'>;
  };
  WindowFunctionInvocation: {
    windowFunc: Identifier;
    parameters?: Variants<{
      Star: {};
      Exprs: { exprs: NonEmptyArray<Expr> };
    }>;
    filterClause?: Node<'FilterClause'>;
    over: Variants<{
      WindowDefn: { windowDefn: Node<'WindowDefn'> };
      WindowName: { windowName: Identifier };
    }>;
  };
  WithClause: {
    recursive?: true;
    items: NonEmptyArray<{
      cteTableName: Node<'CteTableName'>;
      materialized?: 'Materialized' | 'NotMaterialized';
      select: Node<'SelectStmt'>;
    }>;
  };
}

export type NodeKind = keyof NodeData;

export type NodeBase<K extends NodeKind = NodeKind> = { kind: K };

export type NodeDataFull = { [K in keyof NodeData]: NodeData[K] & NodeBase<K> };

export type Node<K extends NodeKind = NodeKind> = NodeDataFull[K];

export type LiteralValue = Node<
  | 'NumericLiteral'
  | 'StringLiteral'
  | 'BlobLiteral'
  | 'Null'
  | 'True'
  | 'False'
  | 'Current_Time'
  | 'Current_Date'
  | 'Current_Timestamp'
>;

export type FunctionInvocation = Node<
  'SimpleFunctionInvocation' | 'AggregateFunctionInvocation' | 'WindowFunctionInvocation'
>;

// Type aliases
export type Expr =
  | LiteralValue
  | FunctionInvocation
  | Node<
      | 'Or'
      | 'And'
      | 'Not'
      | 'Equal'
      | 'Different'
      | 'Is'
      | 'IsDistinctFrom'
      | 'Between'
      | 'In'
      | 'Match'
      | 'Like'
      | 'Glob'
      | 'Regexp'
      | 'Isnull'
      | 'Notnull'
      | 'NotNull'
      | 'LowerThan'
      | 'GreaterThan'
      | 'LowerThanOrEqual'
      | 'GreaterThanOrEqual'
      | 'BitwiseAnd'
      | 'BitwiseOr'
      | 'BitwiseShiftLeft'
      | 'BitwiseShiftRight'
      | 'Add'
      | 'Subtract'
      | 'Multiply'
      | 'Divide'
      | 'Modulo'
      | 'Concatenate'
      | 'Extract'
      | 'ExtractJson'
      | 'Collate'
      | 'BitwiseNegation'
      | 'Plus'
      | 'Minus'
      | 'Identifier'
      | 'BindParameter'
      | 'Column'
      | 'Exists'
      | 'NotExists'
      | 'Parenthesis'
      | 'CastAs'
      | 'Case'
      | 'RaiseFunction'
    >;

export type Identifier = Node<'Identifier'>;

// Doc also include 'SignedLiteral' but what is a signedLiteral ??
export type PragmaValue = Node<'SignedNumber' | 'StringLiteral'>;

const NODES_OBJ: { [K in NodeKind]: null } = {
  Add: null,
  AggregateFunctionInvocation: null,
  AlterTableStmt: null,
  AnalyzeStmt: null,
  And: null,
  AttachStmt: null,
  BeginStmt: null,
  Between: null,
  BindParameter: null,
  BitwiseAnd: null,
  BitwiseNegation: null,
  BitwiseOr: null,
  BitwiseShiftLeft: null,
  BitwiseShiftRight: null,
  BlobLiteral: null,
  Case: null,
  CastAs: null,
  Collate: null,
  Column: null,
  ColumnConstraint: null,
  ColumnDef: null,
  ColumnNameList: null,
  CommentSyntax: null,
  CommitStmt: null,
  CommonTableExpression: null,
  CompoundOperator: null,
  CompoundSelectStmt: null,
  Concatenate: null,
  ConflictClause: null,
  CreateIndexStmt: null,
  CreateTableStmt: null,
  CreateTriggerStmt: null,
  CreateViewStmt: null,
  CreateVirtualTableStmt: null,
  CteTableName: null,
  Current_Date: null,
  Current_Time: null,
  Current_Timestamp: null,
  DeleteStmt: null,
  DeleteStmtLimited: null,
  DetachStmt: null,
  Different: null,
  Divide: null,
  DropIndexStmt: null,
  DropTableStmt: null,
  DropTriggerStmt: null,
  DropViewStmt: null,
  Equal: null,
  Exists: null,
  Extract: null,
  ExtractJson: null,
  FactoredSelectStmt: null,
  False: null,
  FilterClause: null,
  ForeignKeyClause: null,
  FrameSpec: null,
  Glob: null,
  GreaterThan: null,
  GreaterThanOrEqual: null,
  Identifier: null,
  In: null,
  IndexedColumn: null,
  InsertStmt: null,
  Is: null,
  IsDistinctFrom: null,
  Isnull: null,
  JoinClause: null,
  JoinConstraint: null,
  JoinOperator: null,
  Like: null,
  LowerThan: null,
  LowerThanOrEqual: null,
  Match: null,
  Minus: null,
  Modulo: null,
  Multiply: null,
  Not: null,
  NotExists: null,
  Notnull: null,
  NotNull: null,
  Null: null,
  NumericLiteral: null,
  Or: null,
  OrderingTerm: null,
  OverClause: null,
  Parenthesis: null,
  Plus: null,
  PragmaStmt: null,
  QualifiedTableName: null,
  RaiseFunction: null,
  RecursiveCte: null,
  Regexp: null,
  ReindexStmt: null,
  ReleaseStmt: null,
  ResultColumn: null,
  ReturningClause: null,
  RollbackStmt: null,
  SavepointStmt: null,
  SelectCore: null,
  SelectStmt: null,
  SignedNumber: null,
  SimpleFunctionInvocation: null,
  SimpleSelectStmt: null,
  SqlStmt: null,
  SqlStmtList: null,
  StringLiteral: null,
  Subtract: null,
  TableConstraint: null,
  TableOptions: null,
  TableOrSubquery: null,
  True: null,
  TypeName: null,
  UpdateStmt: null,
  UpdateStmtLimited: null,
  UpsertClause: null,
  VacuumStmt: null,
  WindowDefn: null,
  WindowFunctionInvocation: null,
  WithClause: null,
};

const NODES = Object.keys(NODES_OBJ) as Array<NodeKind>;

export function isValidNodeKind(kind: unknown): boolean {
  return Boolean(kind && typeof kind === 'string' && NODES.includes(kind as any));
}
