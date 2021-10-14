import { Fragment, WhitespaceLike } from './Fragment';

export type NonEmptyList<T> = { head: T; tail: Array<T> };

export type NonEmptyListSepBy<T, Sep> = { head: T; tail: Array<{ sep: Sep; item: T }> };

export type NonEmptyCommaList<T> = NonEmptyListSepBy<T, { whitespaceBeforeComma?: WhitespaceLike }>;

// List of single item, sep by comma with whitespace before each item and comma
export type NonEmptyCommaListSingle<T> = NonEmptyCommaList<{ whitespaceBeforeItem?: WhitespaceLike; item: T }>;

export type NodeData = {
  AggregateFunctionInvocation: {
    aggregateFunc: Identifier;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    parameters?: Fragment<'AggregateFunctionInvocation_Parameters'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    filterClause?: Fragment<'FilterClauseWithWhitespace'>;
  };
  AlterTableStmt: {
    alterKeyword?: string;
    whitespaceBeforeTableKeyword?: WhitespaceLike;
    tableKeyword?: string;
    whitespaceBeforeTable?: WhitespaceLike;
    table: Fragment<'SchemaTable'>;
    whitespaceBeforeAction?: WhitespaceLike;
    action: Fragment<'AlterAction'>;
  };
  AnalyzeStmt: {
    analyzeKeyword?: string;
    target?: Fragment<'AnalyzeStmt_Target'>;
  };
  AttachStmt: {
    attachKeyword?: string;
    database?: Fragment<'AttachStmt_Database'>;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    whitespaceBeforeSchemaName?: WhitespaceLike;
    schemaName: Identifier;
  };
  BeginStmt: {
    beginKeyword?: string;
    mode?: Fragment<'BeginStmt_Deferred' | 'BeginStmt_Immediate' | 'BeginStmt_Exclusive'>;
    transaction?: Fragment<'BeginStmt_Transaction'>;
  };
  ColumnConstraint: {
    constraintName?: Fragment<'ColumnConstraint_Name'>;
    constraint: Fragment<'ColumnConstraint_Constraint'>;
  };
  ColumnDef: {
    columnName: Identifier;
    typeName?: Fragment<'ColumnDef_TypeName'>;
    columnConstraints?: Array<Fragment<'ColumnDef_ColumnConstraint'>>;
  };
  ColumnNameList: {
    columnNames: NonEmptyCommaListSingle<Identifier>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  CommentSyntax: Fragment<'Comment_Multiline' | 'Comment_SingleLine'>;
  CommitStmt: {
    action: Fragment<'CommitStmt_Action_Commit' | 'CommitStmt_Action_End'>;
    transaction?: Fragment<'CommitStmt_Transaction'>;
  };
  CommonTableExpression: {
    tableName: Identifier;
    columnNames?: Fragment<'ColumnNames'>;
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    materialized?: Fragment<'MaybeMaterialized'>;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeSelect?: WhitespaceLike;
    select: Node<'SelectStmt'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  CompoundOperator: Fragment<'CompoundOperator_Union' | 'CompoundOperator_UnionAll' | 'CompoundOperator_Intersect' | 'CompoundOperator_Except'>;
  CompoundSelectStmt: {
    with?: Fragment<'StmtWith'>;
    select: Node<'SelectCore'>;
    compoundSelects: NonEmptyList<Fragment<'CompoundSelectStmt_Item'>>;
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  ConflictClause: {
    onConflict?: Fragment<'ConflictClause_OnConflict'>;
  };
  CreateIndexStmt: {
    createKeyword?: string;
    unique?: Fragment<'Unique'>;
    whitespaceBeforeIndexKeyword?: WhitespaceLike;
    indexKeyword?: string;
    ifNotExists?: Fragment<'IfNotExists'>;
    whitespaceBeforeIndex?: WhitespaceLike;
    index: Fragment<'SchemaIndex'>;
    whitespaceBeforeOnKeyword?: WhitespaceLike;
    onKeyword?: string;
    whitespaceBeforeTableName?: WhitespaceLike;
    tableName: Identifier;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    indexedColumns: NonEmptyCommaListSingle<Node<'IndexedColumn'>>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    where?: Fragment<'Where'>;
  };
  CreateTableStmt: {
    createKeyword?: string;
    temp?: Fragment<'Temp'>;
    whitespaceBeforeTableKeyword?: WhitespaceLike;
    tableKeyword?: string;
    ifNotExists?: Fragment<'IfNotExists'>;
    whitespaceBeforeTable?: WhitespaceLike;
    table: Fragment<'SchemaTable'>;
    definition: Fragment<'CreateTableStmt_Definition'>;
  };
  CreateTriggerStmt: {
    createKeyword?: string;
    temp?: Fragment<'Temp'>;
    whitespaceBeforeTriggerKeyword?: WhitespaceLike;
    triggerKeyword?: string;
    ifNotExists?: Fragment<'IfNotExists'>;
    whitespaceBeforeTrigger?: WhitespaceLike;
    trigger: Fragment<'SchemaTrigger'>;
    modifier?: Fragment<'CreateTriggerStmt_Modifier'>;
    action: Fragment<'CreateTriggerStmt_Action'>;
    whitespaceBeforeOnKeyword?: WhitespaceLike;
    onKeyword?: string;
    whitespaceBeforeTableName?: WhitespaceLike;
    tableName: Identifier;
    forEachRow?: Fragment<'CreateTriggerStmt_ForEachRow'>;
    when?: Fragment<'CreateTriggerStmt_When'>;
    whitespaceBeforeBeginKeyword?: WhitespaceLike;
    beginKeyword?: string;
    stmts: NonEmptyList<Fragment<'CreateTriggerStmt_Stmt'>>;
    whitespaceBeforeEndKeyword?: WhitespaceLike;
    endKeyword?: string;
  };
  CreateViewStmt: {
    createKeyword?: string;
    temp?: Fragment<'Temp'>;
    whitespaceBeforeViewKeyword?: WhitespaceLike;
    viewKeyword?: string;
    ifNotExists?: Fragment<'IfNotExists'>;
    whitespaceBeforeView?: WhitespaceLike;
    view: Fragment<'SchemaView'>;
    columnNames?: Fragment<'ColumnNames'>;
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    whitespaceBeforeAsSelectStmt?: WhitespaceLike;
    asSelectStmt: Node<'SelectStmt'>;
  };
  CreateVirtualTableStmt: {
    createKeyword?: string;
    whitespaceBeforeVirtualKeyword?: WhitespaceLike;
    virtualKeyword?: string;
    whitespaceBeforeTableKeyword?: WhitespaceLike;
    tableKeyword?: string;
    ifNotExists?: Fragment<'IfNotExists'>;
    whitespaceBeforeTable?: WhitespaceLike;
    table: Fragment<'SchemaTable'>;
    whitespaceBeforeUsingKeyword?: WhitespaceLike;
    usingKeyword?: string;
    whitespaceBeforeModuleName?: WhitespaceLike;
    moduleName: Identifier;
    moduleArguments?: Fragment<'ModuleArguments'>;
  };
  CteTableName: {
    tableName: Identifier;
    columnNames?: Fragment<'ColumnNames'>;
  };
  DeleteStmt: {
    with?: Fragment<'StmtWith'>;
    deleteKeyword?: string;
    whitespaceBeforeFromKeyword?: WhitespaceLike;
    fromKeyword?: string;
    whitespaceBeforeQualifiedTableName?: WhitespaceLike;
    qualifiedTableName: Node<'QualifiedTableName'>;
    where?: Fragment<'Where'>;
    returningClause?: Fragment<'ReturningClause'>;
  };
  DeleteStmtLimited: {
    with?: Fragment<'StmtWith'>;
    deleteKeyword?: string;
    whitespaceBeforeFromKeyword?: WhitespaceLike;
    fromKeyword?: string;
    whitespaceBeforeQualifiedTableName?: WhitespaceLike;
    qualifiedTableName: Node<'QualifiedTableName'>;
    where?: Fragment<'Where'>;
    returningClause?: Fragment<'ReturningClause'>;
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  DetachStmt: {
    detachKeyword?: string;
    database?: Fragment<'DetachStmt_Database'>;
    whitespaceBeforeSchemeName?: WhitespaceLike;
    schemeName: Identifier;
  };
  DropIndexStmt: {
    dropKeyword?: string;
    whitespaceBeforeIndexKeyword?: WhitespaceLike;
    indexKeyword?: string;
    ifExists?: Fragment<'IfExists'>;
    whitespaceBeforeIndex?: WhitespaceLike;
    index: Fragment<'SchemaIndex'>;
  };
  DropTableStmt: {
    dropKeyword?: string;
    whitespaceBeforeTableKeyword?: WhitespaceLike;
    tableKeyword?: string;
    ifExists?: Fragment<'IfExists'>;
    whitespaceBeforeTable?: WhitespaceLike;
    table: Fragment<'SchemaTable'>;
  };
  DropTriggerStmt: {
    dropKeyword?: string;
    whitespaceBeforeTriggerKeyword?: WhitespaceLike;
    triggerKeyword?: string;
    ifExists?: Fragment<'IfExists'>;
    whitespaceBeforeTrigger?: WhitespaceLike;
    trigger: Fragment<'SchemaTrigger'>;
  };
  DropViewStmt: {
    dropKeyword?: string;
    whitespaceBeforeViewKeyword?: WhitespaceLike;
    viewKeyword?: string;
    ifExists?: Fragment<'IfExists'>;
    whitespaceBeforeView?: WhitespaceLike;
    view: Fragment<'SchemaView'>;
  };
  // Expr
  Or: {
    leftExpr: Fragment<'ExprP01'>;
    whitespaceBeforeOrKeyword?: WhitespaceLike;
    orKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP01'>;
  };
  And: {
    leftExpr: Fragment<'ExprP02'>;
    whitespaceBeforeAndKeyword?: WhitespaceLike;
    andKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP02'>;
  };
  Not: {
    notKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Fragment<'ExprP03'>;
  };
  Equal: {
    leftExpr: Fragment<'ExprP04'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    operator: '==' | '=';
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP04'>;
  };
  Different: {
    leftExpr: Fragment<'ExprP04'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    operator: '!=' | '<>';
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP04'>;
  };
  Is: {
    leftExpr: Fragment<'ExprP04'>;
    whitespaceBeforeIsKeyword?: WhitespaceLike;
    isKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP04'>;
  };
  IsNot: {
    leftExpr: Fragment<'ExprP04'>;
    whitespaceBeforeIsKeyword?: WhitespaceLike;
    isKeyword?: string;
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP04'>;
  };
  Between: {
    expr: Fragment<'ExprP04'>;
    not?: Fragment<'Not'>;
    whitespaceBeforeBetweenKeyword?: WhitespaceLike;
    betweenKeyword?: string;
    whitespaceBeforeBetweenExpr?: WhitespaceLike;
    betweenExpr: Fragment<'ExprP04'>;
    whitespaceBeforeAndKeyword?: WhitespaceLike;
    andKeyword?: string;
    whitespaceBeforeAndExpr?: WhitespaceLike;
    andExpr: Fragment<'ExprP04'>;
  };
  In: {
    expr: Fragment<'ExprP04'>;
    not?: Fragment<'Not'>;
    whitespaceBeforeInKeyword?: WhitespaceLike;
    inKeyword?: string;
    values: Fragment<'In_Values'>;
  };
  Match: {
    leftExpr: Fragment<'ExprP04'>;
    not?: Fragment<'Not'>;
    whitespaceBeforeMatchKeyword?: WhitespaceLike;
    matchKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP04'>;
  };
  Like: {
    leftExpr: Fragment<'ExprP04'>;
    not?: Fragment<'Not'>;
    whitespaceBeforeLikeKeyword?: WhitespaceLike;
    likeKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP04'>;
    escape?: Fragment<'Like_Escape'>;
  };
  Glob: {
    leftExpr: Fragment<'ExprP04'>;
    not?: Fragment<'Not'>;
    whitespaceBeforeGlobKeyword?: WhitespaceLike;
    globKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP04'>;
  };
  Regexp: {
    leftExpr: Fragment<'ExprP04'>;
    not?: Fragment<'Not'>;
    whitespaceBeforeRegexpKeyword?: WhitespaceLike;
    regexpKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP04'>;
  };
  Isnull: {
    expr: Fragment<'ExprP04'>;
    whitespaceBeforeIsnullKeyword?: WhitespaceLike;
    isnullKeyword?: string;
  };
  Notnull: {
    expr: Fragment<'ExprP04'>;
    whitespaceBeforeNotnullKeyword?: WhitespaceLike;
    notnullKeyword?: string;
  };
  NotNull: {
    expr: Fragment<'ExprP04'>;
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
    whitespaceBeforeNullKeyword?: WhitespaceLike;
    nullKeyword?: string;
  };
  LowerThan: {
    leftExpr: Fragment<'ExprP05'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP05'>;
  };
  GreaterThan: {
    leftExpr: Fragment<'ExprP05'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP05'>;
  };
  LowerOrEqualThan: {
    leftExpr: Fragment<'ExprP05'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP05'>;
  };
  GreaterOrEqualThan: {
    leftExpr: Fragment<'ExprP05'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP05'>;
  };
  Escape: {
    escapeKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Fragment<'ExprP06'>;
  };
  BitwiseAnd: {
    leftExpr: Fragment<'ExprP07'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP07'>;
  };
  BitwiseOr: {
    leftExpr: Fragment<'ExprP07'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP07'>;
  };
  BitwiseShiftLeft: {
    leftExpr: Fragment<'ExprP07'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP07'>;
  };
  BitwiseShiftRight: {
    leftExpr: Fragment<'ExprP07'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP07'>;
  };
  Add: {
    leftExpr: Fragment<'ExprP08'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP08'>;
  };
  Subtract: {
    leftExpr: Fragment<'ExprP08'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP08'>;
  };
  Multiply: {
    leftExpr: Fragment<'ExprP09'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP09'>;
  };
  Divide: {
    leftExpr: Fragment<'ExprP09'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP09'>;
  };
  Modulo: {
    leftExpr: Fragment<'ExprP09'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP09'>;
  };
  Concatenate: {
    leftExpr: Fragment<'ExprP10'>;
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprP10'>;
  };
  Collate: {
    expr: Fragment<'ExprP11'>;
    whitespaceBeforeCollateKeyword?: WhitespaceLike;
    collateKeyword?: string;
    whitespaceBeforeCollationName?: WhitespaceLike;
    collationName: Identifier;
  };
  BitwiseNegation: {
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Fragment<'ExprP12'>;
  };
  Plus: {
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Fragment<'ExprP12'>;
  };
  Minus: {
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Fragment<'ExprP12'>;
  };
  NumericLiteral: Fragment<'NumericLiteral_Integer' | 'NumericLiteral_Float' | 'NumericLiteral_Hex'>;
  StringLiteral: {
    content: string;
  };
  BlobLiteral: {
    content: string;
    xCase: 'lowercase' | 'uppercase';
  };
  Null: {
    nullKeyword?: string;
  };
  True: {
    trueKeyword?: string;
  };
  False: {
    falseKeyword?: string;
  };
  CurrentTime: {
    currentTimeKeyword?: string;
  };
  CurrentDate: {
    currentDateKeyword?: string;
  };
  CurrentTimestamp: {
    currentTimestampKeyword?: string;
  };
  Identifier: Fragment<'Identifier_Basic' | 'Identifier_Brackets' | 'Identifier_DoubleQuote' | 'Identifier_Backtick'>;
  BindParameter: Fragment<
    'BindParameter_Indexed' | 'BindParameter_Numbered' | 'BindParameter_AtNamed' | 'BindParameter_ColonNamed' | 'BindParameter_DollarNamed'
  >;
  Column: {
    table?: Fragment<'Column_Table'>;
    columnName: Identifier;
  };
  Select: {
    exists?: Fragment<'Select_Exists'>;
    whitespaceBeforeSelectStmt?: WhitespaceLike;
    selectStmt: Node<'SelectStmt'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  FunctionInvocation: {
    functionName: Identifier;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    parameters?: Fragment<'FunctionInvocation_Parameters'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    filterClause?: Fragment<'FilterClauseWithWhitespace'>;
    overClause?: Fragment<'OverClauseWithWhitespace'>;
  };
  Parenthesis: {
    exprs: NonEmptyCommaListSingle<Expr>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  CastAs: {
    castKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    whitespaceBeforeTypeName?: WhitespaceLike;
    typeName: Node<'TypeName'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  Case: {
    caseKeyword?: string;
    expr?: Fragment<'Case_Expr'>;
    cases: NonEmptyList<Fragment<'Case_Item'>>;
    else?: Fragment<'Case_Else'>;
    whitespaceBeforeEndKeyword?: WhitespaceLike;
    endKeyword?: string;
  };
  // Expr END
  FactoredSelectStmt: {
    with?: Fragment<'StmtWith'>;
    firstSelect: Node<'SelectCore'>;
    compoundSelects?: Array<Fragment<'FactoredSelectStmt_CompoundSelectsItem'>>;
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  FilterClause: {
    filterKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeWhereKeyword?: WhitespaceLike;
    whereKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  ForeignKeyClause: {
    referencesKeyword?: string;
    whitespaceBeforeForeignTable?: WhitespaceLike;
    foreignTable: Identifier;
    columnNames?: Fragment<'ColumnNames'>;
    items: Array<Fragment<'ForeignKeyClause_Item'>>;
    deferrable?: Fragment<'ForeignKeyClause_Deferrable'>;
  };
  FrameSpec: {
    type: Fragment<'FrameSpec_Type'>;
    inner: Fragment<'FrameSpec_Inner'>;
    exclude?: Fragment<'FrameSpec_Exclude'>;
  };
  IndexedColumn: {
    column: Fragment<'IndexedColumn_Column'>;
    collate?: Fragment<'CollationName'>;
    direction?: Fragment<'Direction'>;
  };
  InsertStmt: {
    with?: Fragment<'StmtWith'>;
    method: Fragment<'InsertStmt_Method'>;
    whitespaceBeforeIntoKeyword?: WhitespaceLike;
    intoKeyword?: string;
    whitespaceBeforeTable?: WhitespaceLike;
    table: Fragment<'SchemaTable'>;
    alias?: Fragment<'InsertStmt_Alias'>;
    columnNames?: Fragment<'ColumnNames'>;
    data: Fragment<'InsertStmt_Data'>;
    returningClause?: Fragment<'ReturningClause'>;
  };
  JoinClause: {
    tableOrSubquery: Node<'TableOrSubquery'>;
    join?: Array<Fragment<'JoinClause_JoinItem'>>;
  };
  JoinConstraint: Fragment<'JoinConstraint_On' | 'JoinConstraint_Using'>;
  JoinOperator: Fragment<'JoinOperator_Comma' | 'JoinOperator_Join'>;
  OrderingTerm: {
    expr: Expr;
    collate?: Fragment<'CollationName'>;
    direction?: Fragment<'Direction'>;
    nulls?: Fragment<'OrderingTerm_NullsFirst' | 'OrderingTerm_NullsLast'>;
  };
  OverClause: {
    overKeyword?: string;
    window: Fragment<'OverClause_WindowName' | 'OverClause_Window'>;
  };
  PragmaStmt: {
    pragmaKeyword?: string;
    whitespaceBeforePragma?: WhitespaceLike;
    pragma: Fragment<'SchemaPragma'>;
    value?: Fragment<'PragmaStmt_Value'>;
  };
  // PragmaValue is a fragment because it's just an alias
  QualifiedTableName: {
    table: Fragment<'SchemaTable'>;
    alias?: Fragment<'QualifiedTableName_Alias'>;
    inner?: Fragment<'QualifiedTableName_IndexedBy' | 'QualifiedTableName_NotIndexed'>;
  };
  RaiseFunction: {
    raiseKeyword?: string;
    whitespaceBeforeOpentParent?: WhitespaceLike;
    inner: Fragment<'RaiseFunction_Ignore' | 'RaiseFunction_Rollback' | 'RaiseFunction_Abort' | 'RaiseFunction_Fail'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  RecursiveCte: {
    cteTableName: Node<'CteTableName'>;
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeInitialSelect?: WhitespaceLike;
    // TODO: Fix this type
    initialSelect: any;
    union: Fragment<'RecursiveCte_Union' | 'RecursiveCte_UnionAll'>;
    whitespaceBeforeRecursiveSelect?: WhitespaceLike;
    // TODO: Fix this type
    recursiveSelect: any;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  ReindexStmt: {
    reindexKeyword?: string;
    target?: Fragment<'ReindexStmt_CollationName' | 'ReindexStmt_TableOrIndex'>;
  };
  ReleaseStmt: {
    releaseKeyword?: string;
    savepoint?: Fragment<'Savepoint'>;
    whitespaceBeforeSavepointName?: WhitespaceLike;
    savepointName: Identifier;
  };
  ResultColumn: Fragment<'ResultColumn_Star' | 'ResultColumn_TableStar' | 'ResultColumn_Expr'>;
  ReturningClause: {
    returningKeyword?: string;
    items: NonEmptyCommaList<Fragment<'ReturningClause_Item'>>;
  };
  RollbackStmt: {
    rollbackKeyword?: string;
    transaction?: Fragment<'RollbackStmt_Transaction'>;
    to?: Fragment<'RollbackStmt_To'>;
  };
  SavepointStmt: {
    savepointKeyword?: string;
    whitespaceBeforeSavepointName?: WhitespaceLike;
    savepointName: Identifier;
  };
  SelectCore: Fragment<'SelectCore_Select' | 'SelectCore_Values'>;
  SelectStmt: {
    with?: Fragment<'StmtWith'>;
    select: Node<'SelectCore'>;
    compoundSelects?: Array<Fragment<'SelectStmt_CompoundSelectsItem'>>;
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  SignedNumber: {
    sign?: Fragment<'SignedNumber_Sign'>;
    numericLiteral: Node<'NumericLiteral'>;
  };
  SimpleFunctionInvocation: {
    simpleFunc: Identifier;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    parameters?: Fragment<'SimpleFunctionInvocation_Star' | 'SimpleFunctionInvocation_Exprs'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  SimpleSelectStmt: {
    with?: Fragment<'StmtWith'>;
    selects: Node<'SelectCore'>;
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  SqlStmt: {
    explain?: Fragment<'SqlStmt_Explain'>;
    stmt: Fragment<'SqlStmt_Item'>;
  };
  SqlStmtList: {
    items: Array<Fragment<'SqlStmtList_Item'>>;
  };
  TableConstraint: {
    constraintName?: Fragment<'TableConstraint_ConstraintName'>;
    inner: Fragment<'TableConstraint_PrimaryKey' | 'TableConstraint_Unique' | 'TableConstraint_Check' | 'TableConstraint_ForeignKey'>;
  };
  TableOrSubquery: Fragment<
    | 'TableOrSubquery_Table'
    | 'TableOrSubquery_TableFunctionInvocation'
    | 'TableOrSubquery_Select'
    | 'TableOrSubquery_TableOrSubqueries'
    | 'TableOrSubquery_Join'
  >;
  TypeName: {
    name: Fragment<'TypeName_Name'>;
    size?: Fragment<'TypeName_Size'>;
  };
  UpdateStmt: {
    with?: Fragment<'StmtWith'>;
    updateKeyword?: string;
    or?: Fragment<'UpdateOr'>;
    whitespaceBeforeQualifiedTableName?: WhitespaceLike;
    qualifiedTableName: Node<'QualifiedTableName'>;
    whitespaceBeforeSetKeyword?: WhitespaceLike;
    setKeyword?: string;
    setItems: NonEmptyCommaList<Fragment<'UpdateSetItems'>>;
    from?: Fragment<'UpdateFrom'>;
    where?: Fragment<'Where'>;
    returningClause?: Fragment<'ReturningClause'>;
  };
  UpdateStmtLimited: {
    with?: Fragment<'StmtWith'>;
    updateKeyword?: string;
    or?: Fragment<'UpdateOr'>;
    whitespaceBeforeQualifiedTableName?: WhitespaceLike;
    qualifiedTableName: Node<'QualifiedTableName'>;
    whitespaceBeforeSet?: WhitespaceLike;
    setItems: Fragment<'UpdateSetItems'>;
    from?: Fragment<'UpdateFrom'>;
    where?: Fragment<'UpdateStmt_LimitedWhere'>;
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  UpsertClause: {
    items: NonEmptyList<Fragment<'UpsertClause_Item'>>;
  };
  VacuumStmt: {
    vacuumKeyword?: string;
    schemaName?: Fragment<'VacuumStmt_SchemaName'>;
    into?: Fragment<'VacuumStmt_Into'>;
  };
  WindowDefn: {
    baseWindowName?: Fragment<'WindowDefn_BaseWindowName'>;
    partitionBy?: Fragment<'WindowDefn_PartitionBy'>;
    orderBy?: Fragment<'OrderBy'>;
    frameSpec?: Fragment<'WindowDefn_FrameSpec'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  WindowFunctionInvocation: {
    windowFunc: Identifier;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    parameters?: Fragment<'WindowFunctionInvocation_Parameters'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    filterClause?: Fragment<'WindowFunctionInvocation_FilterClause'>;
    whitespaceBeforeOver?: WhitespaceLike;
    over: Fragment<'WindowFunctionInvocation_Over'>;
  };
  WithClause: {
    recursive?: Fragment<'WithClause_Recursive'>;
    items: NonEmptyCommaList<Fragment<'WithClause_Item'>>;
  };
  Whitespace: {
    content: string;
  };
};

export type NodeKind = keyof NodeData;

export type NodeBase<K extends NodeKind = NodeKind> = { kind: K };

export type NodeDataFull = { [K in keyof NodeData]: NodeData[K] & NodeBase<K> };

export type Node<K extends NodeKind = NodeKind> = NodeDataFull[K];

// Type aliases
export type Expr = Fragment<'Expr'>;
export type Identifier = Node<'Identifier'>;
