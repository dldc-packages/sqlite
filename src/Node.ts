import { Variants, NonEmptyArray } from './Utils';

export function createNode<K extends NodeKind>(kind: K, data: NodeData[K]): Node<K> {
  const node: Node<K> = { kind, ...data } as any;
  return node;
}

export interface NodeData {
  AggregateFunctionInvocation: {
    aggregateFunc: Identifier;
    parameters?: Variants<{
      Star: {};
      Exprs: { distinct?: true; exprs: NonEmptyArray<Expr> };
    }>;
    filterClause?: Node<'FilterClause'>;
  };
  AlterTableStmt: {
    schema?: Identifier;
    table: Identifier;
    action: Variants<{
      RenameTo: {
        newTableName: Identifier;
      };
      RenameColumn: {
        column?: true;
        columnName: Identifier;
        newColumnName: Identifier;
      };
      AddColumn: {
        column?: true;
        columnDef: Node<'ColumnDef'>;
      };
      DropColumn: {
        column?: true;
        columnName: Identifier;
      };
    }>;
  };
  AnalyzeStmt: {
    target?: Variants<{
      Single: {
        name: Identifier;
      };
      WithSchema: {
        schemaName: Identifier;
        indexOrTableName: Identifier;
      };
    }>;
  };
  AttachStmt: {
    database?: true;
    expr: Expr;
    schemaName: Identifier;
  };
  BeginStmt: {
    mode?: 'Deferred' | 'Immediate' | 'Exclusive';
    transaction?: true;
  };
  ColumnConstraint: {
    constraintName?: Identifier;
    constraint: Variants<{
      PrimaryKey: {
        direction?: 'Asc' | 'Desc';
        conflictClause?: Node<'ConflictClause'>;
        autoincrement?: true;
      };
      NotNull: {
        conflictClause?: Node<'ConflictClause'>;
      };
      Unique: {
        conflictClause?: Node<'ConflictClause'>;
      };
      Check: {
        expr: Expr;
      };
      DefaultExpr: {
        expr: Expr;
      };
      DefaultLiteralValue: {
        literalValue: LiteralValue;
      };
      DefaultSignedNumber: {
        signedNumber: Node<'SignedNumber'>;
      };
      Collate: {
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
    columnNames: NonEmptyArray<Identifier>;
  };
  CommentSyntax: Variants<{
    SingleLine: {
      content: string;
      close: 'NewLine' | 'EndOfFile';
    };
    Multiline: {
      content: string;
    };
  }>;
  CommitStmt: {
    action: 'Commit' | 'End';
    transaction?: true;
  };
  CommonTableExpression: {
    tableName: Identifier;
    columnNames?: NonEmptyArray<Identifier>;
    materialized?: 'Materialized' | 'NotMaterialized';
    select: Node<'SelectStmt'>;
  };
  CompoundOperator: {
    variant: 'Union' | 'UnionAll' | 'Except' | 'Intersect';
  };
  CompoundSelectStmt: {
    with?: {
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    select: Node<'SelectCore'>;
    compoundSelects: NonEmptyArray<{
      operator: 'Union' | 'UnionAll' | 'Except' | 'Intersect';
      select: Node<'SelectCore'>;
    }>;
    orderBy?: NonEmptyArray<Node<'OrderingTerm'>>;
    limit?: {
      expr: Expr;
      offset?: { separator: 'Comma' | 'Offset'; expr: Expr };
    };
  };
  // Note conflict is made optional instead of allowing empty object
  ConflictClause: {
    onConflict: 'Rollback' | 'Abort' | 'Fail' | 'Ignore' | 'Replace';
  };
  CreateIndexStmt: {
    unique?: true;
    ifNotExists?: true;
    schema?: Identifier;
    index: Identifier;
    tableName: Identifier;
    indexedColumns: NonEmptyArray<Node<'IndexedColumn'>>;
    where?: Expr;
  };
  CreateTableStmt: {
    temp?: 'Temp' | 'Temporary';
    ifNotExists?: true;
    schema?: Identifier;
    table: Identifier;
    definition: Variants<{
      As: {
        selectStmt: Node<'SelectStmt'>;
      };
      Columns: {
        columnDefs: NonEmptyArray<Node<'ColumnDef'>>;
        tableConstraints?: NonEmptyArray<Node<'TableConstraint'>>;
        tableOptions?: Node<'TableOptions'>;
      };
    }>;
  };
  CreateTriggerStmt: {
    temp?: 'Temp' | 'Temporary';
    ifNotExists?: true;
    schema?: Identifier;
    trigger: Identifier;
    modifier?: 'Before' | 'After' | 'InsteadOf';
    action: Variants<{
      Delete: {};
      Insert: {};
      Update: {
        of?: NonEmptyArray<Identifier>;
      };
    }>;
    tableName: Identifier;
    forEachRow?: true;
    when?: Expr;
    stmts: NonEmptyArray<Node<'UpdateStmt' | 'InsertStmt' | 'DeleteStmt' | 'SelectStmt'>>;
  };
  CreateViewStmt: {
    temp?: 'Temp' | 'Temporary';
    ifNotExists?: true;
    schema?: Identifier;
    view: Identifier;
    columnNames?: NonEmptyArray<Identifier>;
    asSelectStmt: Node<'SelectStmt'>;
  };
  CreateVirtualTableStmt: {
    ifNotExists?: true;
    schema?: Identifier;
    table: Identifier;
    moduleName: Identifier;
    moduleArguments?: NonEmptyArray<Identifier>;
  };
  CteTableName: {
    tableName: Identifier;
    columnNames?: NonEmptyArray<Identifier>;
  };
  DeleteStmt: {
    with?: {
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    qualifiedTableName: Node<'QualifiedTableName'>;
    where?: Expr;
    returningClause?: Node<'ReturningClause'>;
  };
  DeleteStmtLimited: {
    with?: {
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    qualifiedTableName: Node<'QualifiedTableName'>;
    where?: Expr;
    returningClause?: Node<'ReturningClause'>;
    orderBy?: NonEmptyArray<Node<'OrderingTerm'>>;
    limit?: {
      expr: Expr;
      offset?: { separator: 'Comma' | 'Offset'; expr: Expr };
    };
  };
  DetachStmt: {
    database?: true;
    schemeName: Identifier;
  };
  DropIndexStmt: {
    ifExists?: true;
    schema?: Identifier;
    index: Identifier;
  };
  DropTableStmt: {
    ifExists?: true;
    schema?: Identifier;
    table: Identifier;
  };
  DropTriggerStmt: {
    ifExists?: true;
    schema?: Identifier;
    trigger: Identifier;
  };
  DropViewStmt: {
    ifExists?: true;
    schema?: Identifier;
    view: Identifier;
  };
  // Expr
  Or: { leftExpr: Expr; rightExpr: Expr };
  And: { leftExpr: Expr; rightExpr: Expr };
  Not: { expr: Expr };
  Equal: { leftExpr: Expr; operator: '==' | '='; rightExpr: Expr };
  Different: { leftExpr: Expr; operator: '!=' | '<>'; rightExpr: Expr };
  Is: { leftExpr: Expr; rightExpr: Expr };
  IsNot: { leftExpr: Expr; rightExpr: Expr };
  NotBetween: { expr: Expr; betweenExpr: Expr; andExpr: Expr };
  Between: { expr: Expr; betweenExpr: Expr; andExpr: Expr };
  In: {
    expr: Expr;
    values: Variants<{
      List: { items?: NonEmptyArray<Expr> };
      Select: { selectStmt: Node<'SelectStmt'> };
      TableName: { schema?: Identifier; table: Identifier };
      TableFunctionInvocation: {
        schema?: Identifier;
        functionName: Identifier;
        parameters?: NonEmptyArray<Expr>;
      };
    }>;
  };
  NotIn: {
    expr: Expr;
    values: Variants<{
      List: { items?: NonEmptyArray<Expr> };
      Select: { selectStmt: Node<'SelectStmt'> };
      TableName: { schema?: Identifier; table: Identifier };
      TableFunctionInvocation: {
        schema?: Identifier;
        functionName: Identifier;
        parameters?: NonEmptyArray<Expr>;
      };
    }>;
  };
  Match: { leftExpr: Expr; rightExpr: Expr };
  NotMatch: { leftExpr: Expr; rightExpr: Expr };
  Like: { leftExpr: Expr; rightExpr: Expr; escape?: Expr };
  NotLike: { leftExpr: Expr; rightExpr: Expr; escape?: Expr };
  Glob: { leftExpr: Expr; rightExpr: Expr };
  NotGlob: { leftExpr: Expr; rightExpr: Expr };
  Regexp: { leftExpr: Expr; rightExpr: Expr };
  NotRegexp: { leftExpr: Expr; rightExpr: Expr };
  Isnull: { expr: Expr };
  Notnull: { expr: Expr };
  NotNull: { expr: Expr };
  LowerThan: { leftExpr: Expr; rightExpr: Expr };
  GreaterThan: { leftExpr: Expr; rightExpr: Expr };
  LowerThanOrEqual: { leftExpr: Expr; rightExpr: Expr };
  GreaterThanOrEqual: { leftExpr: Expr; rightExpr: Expr };
  BitwiseAnd: { leftExpr: Expr; rightExpr: Expr };
  BitwiseOr: { leftExpr: Expr; rightExpr: Expr };
  BitwiseShiftLeft: { leftExpr: Expr; rightExpr: Expr };
  BitwiseShiftRight: { leftExpr: Expr; rightExpr: Expr };
  Add: { leftExpr: Expr; rightExpr: Expr };
  Subtract: { leftExpr: Expr; rightExpr: Expr };
  Multiply: { leftExpr: Expr; rightExpr: Expr };
  Divide: { leftExpr: Expr; rightExpr: Expr };
  Modulo: { leftExpr: Expr; rightExpr: Expr };
  Concatenate: { leftExpr: Expr; rightExpr: Expr };
  Collate: { expr: Expr; collationName: Identifier };
  BitwiseNegation: { expr: Expr };
  Plus: { expr: Expr };
  Minus: { expr: Expr };
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
  BindParameter: Variants<{
    Indexed: {};
    Numbered: { number: number };
    AtNamed: { name: string; suffix?: string };
    ColonNamed: { name: string; suffix?: string };
    DollarNamed: { name: string; suffix?: string };
  }>;
  Column: {
    table?: { name: Identifier; schema?: Identifier };
    columnName: Identifier;
  };
  Exists: { exists?: true; selectStmt: Node<'SelectStmt'> };
  NotExists: { selectStmt: Node<'SelectStmt'> };
  FunctionInvocation: {
    functionName: Identifier;
    parameters?: Variants<{
      Star: {};
      Exprs: { distinct?: true; exprs: NonEmptyArray<Expr> };
    }>;
    filterClause?: Node<'FilterClause'>;
    overClause?: Node<'OverClause'>;
  };
  Parenthesis: { exprs: NonEmptyArray<Expr> };
  CastAs: { expr: Expr; typeName: Node<'TypeName'> };
  Case: {
    expr?: Expr;
    cases: NonEmptyArray<{ whenExpr: Expr; thenExpr: Expr }>;
    else?: Expr;
  };
  // Expr END
  FactoredSelectStmt: {
    with?: {
      recursive?: true;
      commonTableExpressions: NonEmptyArray<Node<'CommonTableExpression'>>;
    };
    firstSelect: Node<'SelectCore'>;
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
  FilterClause: {
    expr: Expr;
  };
  ForeignKeyClause: {
    foreignTable: Identifier;
    columnNames?: NonEmptyArray<Identifier>;
    constraints?: NonEmptyArray<
      Variants<{
        On: {
          event: 'Delete' | 'Update';
          action: 'SetNull' | 'SetDefault' | 'Cascade' | 'Restrict' | 'NoAction';
        };
        Match: { name: Identifier };
      }>
    >;
    deferrable?: { not?: true; initially?: 'Deferred' | 'Immediate' };
  };
  FrameSpec: {
    type: 'Range' | 'Rows' | 'Groups';
    inner: Variants<{
      Between: {
        left: Variants<{
          UnboundedPreceding: {};
          Preceding: { expr: Expr };
          CurrentRow: {};
          Following: { expr: Expr };
        }>;
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
      ReplaceInto: {};
      InsertInto: { or?: 'Abort' | 'Fail' | 'Ignore' | 'Replace' | 'Rollback' };
    }>;
    schema?: Identifier;
    table: Identifier;
    alias?: Identifier;
    columnNames?: NonEmptyArray<Identifier>;
    data: Variants<{
      Values: {
        rows: NonEmptyArray<NonEmptyArray<Expr>>;
        upsertClause?: Node<'UpsertClause'>;
      };
      Select: {
        selectStmt: Node<'SelectStmt'>;
        upsertClause?: Node<'UpsertClause'>;
      };
      DefaultValues: {};
    }>;
    returningClause?: Node<'ReturningClause'>;
  };
  // TODO:
  JoinClause: {
    tableOrSubquery: Node<'TableOrSubquery'>;
    joins?: NonEmptyArray<{
      joinOperator: Node<'JoinOperator'>;
      tableOrSubquery: Node<'TableOrSubquery'>;
      joinConstraint?: Node<'JoinConstraint'>;
    }>;
  };
  JoinConstraint: Variants<{
    On: { expr: Expr };
    Using: { columnNames: NonEmptyArray<Identifier> };
  }>;
  JoinOperator: Variants<{
    Comma: {};
    Join: {
      natural?: true;
      join?: 'Left' | 'LeftOuter' | 'Inner' | 'Cross';
    };
  }>;
  OrderingTerm: {
    expr: Expr;
    collate?: Identifier;
    direction?: 'Asc' | 'Desc';
    nulls?: 'First' | 'Last';
  };
  OverClause: Variants<{
    WindowName: { windowName: Identifier };
    Window: {
      baseWindowName?: Identifier;
      partitionBy?: NonEmptyArray<Expr>;
      orderBy?: NonEmptyArray<Node<'OrderingTerm'>>;
      frameSpec?: Node<'FrameSpec'>;
    };
  }>;
  PragmaStmt: {
    schema?: Identifier;
    pragma: Identifier;
    value?: Variants<{
      Equal: { pragmaValue: PragmaValue };
      Call: { pragmaValue: PragmaValue };
    }>;
  };
  // PragmaValue is a fragment because it's just an alias
  QualifiedTableName: {
    schema?: Identifier;
    table: Identifier;
    alias?: Identifier;
    inner?: Variants<{
      IndexedBy: { indexName: Identifier };
      NotIndexed: {};
    }>;
  };
  RaiseFunction: Variants<{
    Ignore: {};
    Rollback: { errorMessage: Node<'StringLiteral'> };
    Abort: { errorMessage: Node<'StringLiteral'> };
    Fail: { errorMessage: Node<'StringLiteral'> };
  }>;
  RecursiveCte: {
    cteTableName: Node<'CteTableName'>;
    // TODO: Fix this type
    initialSelect: any;
    union: 'Union' | 'UnionAll';
    // TODO: Fix this type
    recursiveSelect: any;
  };
  ReindexStmt: Variants<{
    Reindex: {};
    CollationName: { collationName: Identifier };
    TableOrIndex: { schema?: Identifier; tableOrIndex: Identifier };
  }>;
  ReleaseStmt: {
    savepoint?: true;
    savepointName: Identifier;
  };
  ResultColumn: Variants<{
    Star: {};
    TableStar: { tableName: Identifier };
    Expr: { expr: Expr; alias?: { as?: true; name: Identifier } };
  }>;
  ReturningClause: {
    items: NonEmptyArray<
      Variants<{
        Star: {};
        Expr: { expr: Expr; alias?: { as?: true; name: Identifier } };
      }>
    >;
  };
  RollbackStmt: {
    transaction?: true;
    to?: { savepoint?: true; savepointName: Identifier };
  };
  SavepointStmt: {
    savepointName: Identifier;
  };
  SelectCore: Variants<{
    Select: {
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
    constraintName?: Identifier;
    inner: Variants<{
      PrimaryKey: {
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
      schema?: Identifier;
      table: Identifier;
      alias?: { as?: true; tableAlias: Identifier };
      index?: Variants<{
        IndexedBy: { indexName: Identifier };
        NotIndexed: {};
      }>;
    };
    TableFunctionInvocation: {
      schema?: Identifier;
      function: Identifier;
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
  'NumericLiteral' | 'StringLiteral' | 'BlobLiteral' | 'Null' | 'True' | 'False' | 'Current_Time' | 'Current_Date' | 'Current_Timestamp'
>;

// Type aliases
export type Expr =
  | LiteralValue
  | Node<
      | 'Or'
      | 'And'
      | 'Not'
      | 'Equal'
      | 'Different'
      | 'Is'
      | 'IsNot'
      | 'NotBetween'
      | 'Between'
      | 'In'
      | 'NotIn'
      | 'Match'
      | 'NotMatch'
      | 'Like'
      | 'NotLike'
      | 'Glob'
      | 'NotGlob'
      | 'Regexp'
      | 'NotRegexp'
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
      | 'Collate'
      | 'BitwiseNegation'
      | 'Plus'
      | 'Minus'
      | 'Identifier'
      | 'BindParameter'
      | 'Column'
      | 'Exists'
      | 'NotExists'
      | 'FunctionInvocation'
      | 'Parenthesis'
      | 'CastAs'
      | 'Case'
      | 'RaiseFunction'
    >;

export type Identifier = Node<'Identifier'>;

// Doc also include 'SignedLiteral' but what is a signedLiteral ??
export type PragmaValue = Node<'SignedNumber' | 'StringLiteral'>;
