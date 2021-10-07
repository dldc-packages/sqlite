import { Expr, Identifier, Node, NonEmptyCommaList, NonEmptyCommaListSingle } from './Node';

type FragmentData = {
  WhitespaceLike: Array<Node<'Whitespace'> | Node<'CommentSyntax'>>;
  AggregateFunctionInvocation_Parameters: Fragment<'AggregateFunctionInvocation_Parameters_Star' | 'AggregateFunctionInvocation_Parameters_Exprs'>;
  AggregateFunctionInvocation_Parameters_Star: {
    variant: 'Star';
    whitespaceBeforeStar?: WhitespaceLike;
  };
  AggregateFunctionInvocation_Parameters_Exprs: {
    variant: 'Exprs';
    distinct?: Fragment<'AggregateFunctionInvocation_Parameters_Exprs_Distinct'>;
    exprs: NonEmptyCommaListSingle<Expr>;
  };
  AggregateFunctionInvocation_Parameters_Exprs_Distinct: {
    whitespaceBeforeDistinctKeyword?: WhitespaceLike;
    distinctKeyword?: string;
  };
  FilterClauseWithWhitespace: {
    whitespaceBefore?: WhitespaceLike;
    filterClause: Node<'FilterClause'>;
  };
  SchemaTable: {
    schema?: Fragment<'SchemaItem_Schema'>;
    table: Identifier;
  };
  SchemaItem_Schema: {
    schemaName: Identifier;
    whitespaceBeforeDot?: WhitespaceLike;
    whitespaceAfterDot?: WhitespaceLike;
  };
  AlterAction: Fragment<'AlterAction_RenameTo' | 'AlterAction_RenameColumn' | 'AlterAction_AddColumn' | 'AlterAction_DropColumn'>;
  AlterAction_RenameTo: {
    variant: 'RenameTo';
    renameKeyword?: string;
    whitespaceBeforeToKeyword?: WhitespaceLike;
    toKeyword?: string;
    whitespaceBeforeNewTableName?: WhitespaceLike;
    newTableName: Identifier;
  };
  AlterAction_RenameColumn: {
    variant: 'RenameColumn';
    renameKeyword?: string;
    column?: Fragment<'AlterTableStmt_Column'>;
    whitespaceBeforeColumnName?: WhitespaceLike;
    columnName: Identifier;
    whitespaceBeforeToKeyword?: WhitespaceLike;
    toKeyword?: string;
    whitespaceBeforeNewColumnName?: WhitespaceLike;
    newColumnName: Identifier;
  };
  AlterTableStmt_Column: {
    whitespaceBeforeColumnKeyword?: WhitespaceLike;
    columnKeyword?: string;
  };
  AlterAction_AddColumn: {
    variant: 'AddColumn';
    addKeyword?: string;
    column?: Fragment<'AlterTableStmt_Column'>;
    whitespaceBeforeColumnDef?: WhitespaceLike;
    columnDef: Node<'ColumnDef'>;
  };
  AlterAction_DropColumn: {
    variant: 'DropColumn';
    dropKeyword?: string;
    column?: Fragment<'AlterTableStmt_Column'>;
    whitespaceBeforeColumnName?: WhitespaceLike;
    columnName: Identifier;
  };
  AnalyzeStmt_Target: Fragment<'AnalyzeStmt_Target_Single' | 'AnalyzeStmt_Target_WithSchema'>;
  AnalyzeStmt_Target_Single: {
    variant: 'Single';
    whitespaceBeforeName?: WhitespaceLike;
    name: Identifier;
  };
  AnalyzeStmt_Target_WithSchema: {
    variant: 'WithSchema';
    whitespaceBeforeSchemaName?: WhitespaceLike;
    schemaName: Identifier;
    whitespaceBeforeDot?: WhitespaceLike;
    whitespaceBeforeIndexOrTableName?: WhitespaceLike;
    indexOrTableName: Identifier;
  };
  AttachStmt_Database: {
    whitespaceBeforeDatabaseKeyword?: WhitespaceLike;
    databaseKeyword?: string;
  };
  BeginStmt_Deferred: {
    variant: 'Deferred';
    whitespaceBeforeDeferredKeyword?: WhitespaceLike;
    deferredKeyword?: string;
  };
  BeginStmt_Immediate: {
    variant: 'Immediate';
    whitespaceBeforeImmediateKeyword?: WhitespaceLike;
    immediateKeyword?: string;
  };
  BeginStmt_Exclusive: {
    variant: 'Exclusive';
    whitespaceBeforeExclusiveKeyword?: WhitespaceLike;
    exclusiveKeyword?: string;
  };
  BeginStmt_Transaction: {
    whitespaceBeforeTransactionKeyword?: WhitespaceLike;
    transactionKeyword?: string;
  };
  ColumnConstraint_Name: {
    constraintKeyword?: string;
    whitespaceBeforeName?: WhitespaceLike;
    name: Identifier;
    whitespaceAfterName?: WhitespaceLike;
  };
  ColumnConstraint_Constraint: Fragment<
    | 'ColumnConstraint_Constraint_PrimaryKey'
    | 'ColumnConstraint_Constraint_NotNull'
    | 'ColumnConstraint_Constraint_Unique'
    | 'ColumnConstraint_Constraint_Check'
    | 'ColumnConstraint_Constraint_DefaultExpr'
    | 'ColumnConstraint_Constraint_DefaultLiteralValue'
    | 'ColumnConstraint_Constraint_DefaultSignedNumber'
    | 'ColumnConstraint_Constraint_Collate'
    | 'ColumnConstraint_Constraint_ForeignKey'
    | 'ColumnConstraint_Constraint_As'
  >;
  ColumnConstraint_Constraint_PrimaryKey: {
    variant: 'PrimaryKey';
    primaryKeyword?: string;
    whitespaceBeforeKeyKeyword?: WhitespaceLike;
    keyKeyword?: string;
    direction?: Fragment<'Direction'>;
    whitespaceBeforeConflictClause?: WhitespaceLike;
    conflictClause: Node<'ConflictClause'>;
    autoincrement?: Fragment<'Autoincrement'>;
  };
  Direction: Fragment<'Direction_Asc' | 'Direction_Desc'>;
  Direction_Asc: {
    variant: 'Asc';
    whitespaceBeforeAscKeyword?: WhitespaceLike;
    ascKeyword?: string;
  };
  Direction_Desc: {
    variant: 'Desc';
    whitespaceBeforeDescKeyword?: WhitespaceLike;
    descKeyword?: string;
  };
  Autoincrement: {
    whitespaceBeforeAutoincrementKeyword?: WhitespaceLike;
    autoincrementKeyword?: string;
  };
  ColumnConstraint_Constraint_NotNull: {
    variant: 'NotNull';
    notKeyword?: string;
    whitespaceBeforeNullKeyword?: WhitespaceLike;
    nullKeyword?: string;
    whitespaceBeforeConflictClause?: WhitespaceLike;
    conflictClause: Node<'ConflictClause'>;
  };
  ColumnConstraint_Constraint_Unique: {
    variant: 'Unique';
    uniqueKeyword?: string;
    whitespaceBeforeConflictClause?: WhitespaceLike;
    conflictClause: Node<'ConflictClause'>;
  };
  ColumnConstraint_Constraint_Check: {
    variant: 'Check';
    checkKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  ColumnConstraint_Constraint_DefaultExpr: {
    variant: 'DefaultExpr';
    defaultKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  ColumnConstraint_Constraint_DefaultLiteralValue: {
    variant: 'DefaultLiteralValue';
    defaultKeyword?: string;
    whitespaceBeforeLiteralValue?: WhitespaceLike;
    literalValue: Fragment<'LiteralValue'>;
  };
  LiteralValue: Node<'NumericLiteral' | 'StringLiteral' | 'BlobLiteral' | 'Null' | 'True' | 'False' | 'CurrentTime' | 'CurrentDate' | 'CurrentTimestamp'>;
  ColumnConstraint_Constraint_DefaultSignedNumber: {
    variant: 'DefaultSignedNumber';
    defaultKeyword?: string;
    whitespaceBeforeSignedNumber?: WhitespaceLike;
    signedNumber: Node<'SignedNumber'>;
  };
  ColumnConstraint_Constraint_Collate: {
    variant: 'Collate';
    collateKeyword?: string;
    whitespaceBeforeCollationName?: WhitespaceLike;
    collationName: Identifier;
  };
  ColumnConstraint_Constraint_ForeignKey: {
    variant: 'ForeignKey';
    foreignKeyClause: Node<'ForeignKeyClause'>;
  };
  ColumnConstraint_Constraint_As: {
    variant: 'As';
    generatedAlways?: Fragment<'GeneratedAlways'>;
    asKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    mode?: Fragment<'ColumnConstraint_Constraint_As_Stored' | 'ColumnConstraint_Constraint_As_Virtual'>;
  };
  GeneratedAlways: {
    generatedKeyword?: string;
    whitespaceBeforeAlwaysKeyword?: WhitespaceLike;
    alwaysKeyword?: string;
    whitespaceAfterAlwaysKeyword?: WhitespaceLike;
  };
  ColumnConstraint_Constraint_As_Stored: {
    variant: 'Stored';
    whitespaceBeforeStoredKeyword?: WhitespaceLike;
    storedKeyword?: string;
  };
  ColumnConstraint_Constraint_As_Virtual: {
    variant: 'Virtual';
    whitespaceBeforeVirtualKeyword?: WhitespaceLike;
    virtualKeyword?: string;
  };
  ColumnDef_TypeName: {
    whitespaceBeforeTypeName?: WhitespaceLike;
    typeName: Node<'TypeName'>;
  };
  ColumnDef_ColumnConstraint: {
    whitespaceBeforeColumnConstraint?: WhitespaceLike;
    columnConstraint: Node<'ColumnConstraint'>;
  };
  Comment_SingleLine: {
    variant: 'SingleLine';
    content: string;
    close: 'NewLine' | 'EndOfFile';
  };
  Comment_Multiline: {
    variant: 'Multiline';
    content: string;
  };
  CommitStmt_Action_Commit: {
    variant: 'Commit';
    commitKeyword?: string;
  };
  CommitStmt_Action_End: {
    variant: 'End';
    endKeyword?: string;
  };
  CommitStmt_Transaction: {
    whitespaceBeforeTransactionKeyword?: WhitespaceLike;
    transactionKeyword?: string;
  };
  ColumnNames: {
    whitespaceBeforeOpenParent?: WhitespaceLike;
    columnNames: NonEmptyCommaListSingle<Identifier>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  MaybeMaterialized: Fragment<'Materialized' | 'NotMaterialized'>;
  Materialized: {
    variant: 'Materialized';
    whitespaceBeforeMaterializedKeyword?: WhitespaceLike;
    materializedKeyword?: string;
  };
  NotMaterialized: {
    variant: 'NotMaterialized';
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
    whitespaceBeforeMaterializedKeyword?: WhitespaceLike;
    materializedKeyword?: string;
  };
  CompoundOperator_Union: {
    variant: 'Union';
    unionKeyword?: string;
  };
  CompoundOperator_UnionAll: {
    variant: 'UnionAll';
    unionKeyword?: string;
    whitespaceBeforeAllKeyword?: WhitespaceLike;
    allKeyword?: string;
  };
  CompoundOperator_Intersect: {
    variant: 'Intersect';
    intersectKeyword?: string;
  };
  CompoundOperator_Except: {
    variant: 'Except';
    exceptKeyword?: string;
  };
  StmtWith: {
    withKeyword?: string;
    recursive?: Fragment<'StmtWith_Recursive'>;
    commonTableExpressions: NonEmptyCommaListSingle<Node<'CommonTableExpression'>>;
    whitespaceAfter?: WhitespaceLike;
  };
  StmtWith_Recursive: {
    recursiveKeyword?: string;
    whitespaceBeforeRecursiveKeyword?: WhitespaceLike;
  };
  CompoundSelectStmt_Item: Fragment<
    'CompoundSelectStmt_Item_Union' | 'CompoundSelectStmt_Item_UnionAll' | 'CompoundSelectStmt_Item_Intersect' | 'CompoundSelectStmt_Item_Except'
  >;
  CompoundSelectStmt_Item_Union: {
    variant: 'Union';
    whitespaceBeforeUnionKeyword?: WhitespaceLike;
    unionKeyword?: string;
    whitespaceBeforeSelect?: WhitespaceLike;
    select: Node<'SelectCore'>;
  };
  CompoundSelectStmt_Item_UnionAll: {
    variant: 'UnionAll';
    whitespaceBeforeUnionKeyword?: WhitespaceLike;
    unionKeyword?: string;
    whitespaceBeforeAllKeyword?: WhitespaceLike;
    allKeyword?: string;
    whitespaceBeforeSelect?: WhitespaceLike;
    select: Node<'SelectCore'>;
  };
  CompoundSelectStmt_Item_Intersect: {
    variant: 'Intersect';
    whitespaceBeforeIntersectKeyword?: WhitespaceLike;
    intersectKeyword?: string;
    whitespaceBeforeSelect?: WhitespaceLike;
    select: Node<'SelectCore'>;
  };
  CompoundSelectStmt_Item_Except: {
    variant: 'Except';
    whitespaceBeforeExceptKeyword?: WhitespaceLike;
    exceptKeyword?: string;
    whitespaceBeforeSelect?: WhitespaceLike;
    select: Node<'SelectCore'>;
  };
  OrderBy: {
    whitespaceBeforeOrderKeyword?: WhitespaceLike;
    orderKeyword?: string;
    whitespaceBeforeByKeyword?: WhitespaceLike;
    byKeyword?: string;
    orderingTerms: NonEmptyCommaListSingle<Node<'OrderingTerm'>>;
  };
  Limit: {
    whitespaceBeforeLimitKeyword?: WhitespaceLike;
    limitKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    inner?: Fragment<'Limit_Offset' | 'Limit_Expr'>;
  };
  Limit_Offset: {
    variant: 'Offset';
    whitespaceBeforeOffsetKeyword?: WhitespaceLike;
    offsetKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
  };
  Limit_Expr: {
    variant: 'Expr';
    whitespaceBeforeComma?: WhitespaceLike;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
  };
  ConflictClause_OnConflict: {
    onKeyword?: string;
    whitespaceBeforeConflictKeyword?: WhitespaceLike;
    conflictKeyword?: string;
    inner: Fragment<'ConflictClause_OnConflict_Inner'>;
  };
  ConflictClause_OnConflict_Inner: Fragment<
    | 'ConflictClause_OnConflict_Inner_Rollback'
    | 'ConflictClause_OnConflict_Inner_Abort'
    | 'ConflictClause_OnConflict_Inner_Fail'
    | 'ConflictClause_OnConflict_Inner_Ignore'
    | 'ConflictClause_OnConflict_Inner_Replace'
  >;
  ConflictClause_OnConflict_Inner_Rollback: {
    variant: 'Rollback';
    whitespaceBeforeRollbackKeyword?: WhitespaceLike;
    rollbackKeyword?: string;
  };
  ConflictClause_OnConflict_Inner_Abort: {
    variant: 'Abort';
    whitespaceBeforeAbortKeyword?: WhitespaceLike;
    abortKeyword?: string;
  };
  ConflictClause_OnConflict_Inner_Fail: {
    variant: 'Fail';
    whitespaceBeforeFailKeyword?: WhitespaceLike;
    failKeyword?: string;
  };
  ConflictClause_OnConflict_Inner_Ignore: {
    variant: 'Ignore';
    whitespaceBeforeIgnoreKeyword?: WhitespaceLike;
    ignoreKeyword?: string;
  };
  ConflictClause_OnConflict_Inner_Replace: {
    variant: 'Replace';
    whitespaceBeforeReplaceKeyword?: WhitespaceLike;
    replaceKeyword?: string;
  };
  Unique: {
    whitespaceBeforeUniqueKeyword?: WhitespaceLike;
    uniqueKeyword?: string;
  };
  IfNotExists: {
    whitespaceBeforeIfKeyword?: WhitespaceLike;
    ifKeyword?: string;
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
    whitespaceBeforeExistsKeyword?: WhitespaceLike;
    existsKeyword?: string;
  };
  SchemaIndex: {
    schema?: Fragment<'SchemaItem_Schema'>;
    index: Identifier;
  };
  Where: {
    whitespaceBeforeWhereKeyword?: WhitespaceLike;
    whereKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
  };
  Temp: Fragment<'Temp_Temp' | 'Temp_Temporary'>;
  Temp_Temp: {
    variant: 'Temp';
    whitespaceBeforeTempKeyword?: WhitespaceLike;
    tempKeyword?: string;
  };
  Temp_Temporary: {
    variant: 'Temporary';
    whitespaceBeforeTemporaryKeyword?: WhitespaceLike;
    temporaryKeyword?: string;
  };
  CreateTableStmt_Definition: Fragment<'CreateTable_AsDef' | 'CreateTable_ColumnsDef'>;
  CreateTable_AsDef: {
    variant: 'As';
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    whitespaceBeforeSelectStmt?: WhitespaceLike;
    selectStmt: Node<'SelectStmt'>;
  };
  CreateTable_ColumnsDef: {
    variant: 'Columns';
    whitespaceBeforeOpenParent?: WhitespaceLike;
    columnDefs: NonEmptyCommaListSingle<Node<'ColumnDef'>>;
    tableConstraints?: Array<Fragment<'CreateTable_Constraint'>>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    withoutRowId?: Fragment<'WithoutRowId'>;
  };
  CreateTable_Constraint: {
    whitespaceBeforeComma?: WhitespaceLike;
    whitespaceBeforeTableConstraint?: WhitespaceLike;
    tableConstraint: Node<'TableConstraint'>;
  };
  WithoutRowId: {
    whitespaceBeforeWithoutKeyword?: WhitespaceLike;
    withoutKeyword?: string;
    whitespaceBeforeRowidKeyword?: WhitespaceLike;
    rowidKeyword?: string;
  };
  SchemaTrigger: {
    schema?: Fragment<'SchemaItem_Schema'>;
    trigger: Identifier;
  };
  CreateTriggerStmt_Modifier: Fragment<'CreateTriggerStmt_Modifier_Before' | 'CreateTriggerStmt_Modifier_After' | 'CreateTriggerStmt_Modifier_InsteadOf'>;
  CreateTriggerStmt_Modifier_Before: {
    variant: 'Before';
    whitespaceBeforeBeforeKeyword?: WhitespaceLike;
    beforeKeyword?: string;
  };
  CreateTriggerStmt_Modifier_After: {
    variant: 'After';
    whitespaceBeforeAfterKeyword?: WhitespaceLike;
    afterKeyword?: string;
  };
  CreateTriggerStmt_Modifier_InsteadOf: {
    variant: 'InsteadOf';
    whitespaceBeforeInsteadKeyword?: WhitespaceLike;
    insteadKeyword?: string;
    whitespaceBeforeOfKeyword?: WhitespaceLike;
    ofKeyword?: string;
  };
  CreateTriggerStmt_Action: Fragment<'CreateTriggerStmt_Action_Delete' | 'CreateTriggerStmt_Action_Insert' | 'CreateTriggerStmt_Action_Update'>;
  CreateTriggerStmt_Action_Delete: {
    variant: 'Delete';
    whitespaceBeforeDeleteKeyword?: WhitespaceLike;
    deleteKeyword?: string;
  };
  CreateTriggerStmt_Action_Insert: {
    variant: 'Insert';
    whitespaceBeforeInsertKeyword?: WhitespaceLike;
    insertKeyword?: string;
  };
  CreateTriggerStmt_Action_Update: {
    variant: 'Update';
    whitespaceBeforeUpdateKeyword?: WhitespaceLike;
    updateKeyword?: string;
    of?: Fragment<'CreateTriggerStmt_Action_Update_Of'>;
  };
  CreateTriggerStmt_Action_Update_Of: {
    whitespaceBeforeOfKeyword?: WhitespaceLike;
    ofKeywpord?: string;
    columnNames: NonEmptyCommaListSingle<Identifier>;
  };
  CreateTriggerStmt_ForEachRow: {
    whitespaceBeforeForKeyword?: WhitespaceLike;
    forKeyword?: string;
    whitespaceBeforeEachKeyword?: WhitespaceLike;
    eachKeyword?: string;
    whitespaceBeforeRowKeyword?: WhitespaceLike;
    rowKeyword?: string;
  };
  CreateTriggerStmt_When: {
    whitespaceBeforeWhenKeyword?: WhitespaceLike;
    whenKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
  };
  CreateTriggerStmt_Stmt: {
    whitespaceBeforeStmt?: WhitespaceLike;
    stmt: Node<'UpdateStmt' | 'InsertStmt' | 'DeleteStmt' | 'SelectStmt'>;
    whitespaceBeforeSemicolon?: WhitespaceLike;
  };
  SchemaView: {
    schema?: Fragment<'SchemaItem_Schema'>;
    view: Identifier;
  };
  ModuleArguments: {
    whitespaceBeforeOpenParent?: WhitespaceLike;
    moduleArguments: NonEmptyCommaListSingle<Identifier>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  ReturningClause: {
    whitespaceBeforeReturningClause?: WhitespaceLike;
    returningClause: Node<'ReturningClause'>;
  };
  DetachStmt_Database: {
    whitespaceBeforeDatabaseKeyword?: WhitespaceLike;
    databaseKeyword?: string;
  };
  IfExists: {
    whitespaceBeforeIfKeyword?: WhitespaceLike;
    ifKeyword?: string;
    whitespaceBeforeExistsKeyword?: WhitespaceLike;
    existsKeyword?: string;
  };
  // Expr Parts
  Select_Exists: {
    not?: Fragment<'Select_Exists_Not'>;
    existsKeyword?: string;
    whitespaceAfterExistsKeyword?: WhitespaceLike;
  };
  Select_Exists_Not: {
    notKeyword?: string;
    whitespaceAfterNotKeyword?: WhitespaceLike;
  };
  FunctionInvocation_Parameters: Fragment<'FunctionInvocation_Parameters_Star' | 'FunctionInvocation_Parameters_Exprs'>;
  FunctionInvocation_Parameters_Star: {
    variant: 'Star';
    whitespaceBeforeStar?: WhitespaceLike;
  };
  FunctionInvocation_Parameters_Exprs: {
    variant: 'Exprs';
    distinct?: Fragment<'FunctionInvocation_Parameters_Distinct'>;
    exprs: NonEmptyCommaListSingle<Expr>;
  };
  FunctionInvocation_Parameters_Distinct: {
    whitespaceBeforeDistinctKeyword?: WhitespaceLike;
    distinctKeyword?: string;
  };
  OverClauseWithWhitespace: {
    whitespaceBeforeOverClause?: WhitespaceLike;
    overClause: Node<'OverClause'>;
  };
  Case_Expr: {
    whitespaceBefore?: WhitespaceLike;
    expr?: Expr;
  };
  Case_Item: {
    whitespaceBeforeWhenKeyword?: WhitespaceLike;
    whenKeyword?: string;
    whitespaceBeforeWhenExpr?: WhitespaceLike;
    whenExpr: Expr;
    whitespaceBeforeThenKeyword?: WhitespaceLike;
    thenKeyword?: string;
    whitespaceBeforeThenExpr?: WhitespaceLike;
    thenExpr: Expr;
  };
  Case_Else: {
    whitespaceBeforeElseKeyword?: WhitespaceLike;
    elseKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
  };
  Identifier_Basic: {
    variant: 'Basic';
    name: string;
  };
  Identifier_Brackets: {
    variant: 'Brackets';
    name: string;
  };
  Identifier_DoubleQuote: {
    variant: 'DoubleQuote';
    name: string;
  };
  Identifier_Backtick: {
    variant: 'Backtick';
    name: string;
  };
  NumericLiteral_Integer: {
    variant: 'Integer';
    interger: number;
    exponent?: Fragment<'Exponent'>;
  };
  Exponent: {
    raw: string;
    value: number;
  };
  NumericLiteral_Float: {
    variant: 'Float';
    value: number;
    integral?: number;
    fractional: number;
    exponent?: Fragment<'Exponent'>;
  };
  NumericLiteral_Hex: {
    variant: 'Hex';
    value: number;
    xCase: 'lowercase' | 'uppercase';
  };
  BindParameter_Indexed: {
    variant: 'Indexed';
  };
  BindParameter_Numbered: {
    variant: 'Numbered';
    number: number;
  };
  BindParameter_AtNamed: {
    variant: 'AtNamed';
    name: string;
    suffix?: string;
  };
  BindParameter_ColonNamed: {
    variant: 'ColonNamed';
    name: string;
    suffix?: string;
  };
  BindParameter_DollarNamed: {
    variant: 'DollarNamed';
    name: string;
    suffix?: string;
  };
  Between_Not: {
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
  };
  In_Not: {
    whitespaceBeforeNot?: WhitespaceLike;
  };
  In_Values: Fragment<'In_Values_List' | 'In_Values_TableName' | 'In_Value_TableFunctionInvocation'>;
  In_Values_List: {
    variant: 'List';
    whitespaceBeforeOpenParent?: WhitespaceLike;
    items?: Fragment<'In_Values_List_Items'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  In_Values_List_Items: Fragment<'In_Values_List_Items_Select' | 'In_Values_List_Items_Exprs'>;
  In_Values_List_Items_Select: {
    variant: 'Select';
    whitespaceBeforeSelectStmt?: WhitespaceLike;
    selectStmt: Node<'SelectStmt'>;
  };
  In_Values_List_Items_Exprs: {
    variant: 'Exprs';
    exprs: NonEmptyCommaListSingle<Expr>;
  };
  In_Values_TableName: {
    variant: 'TableName';
    whitespaceBeforeTable?: WhitespaceLike;
    table: Fragment<'SchemaTable'>;
  };
  In_Value_TableFunctionInvocation: {
    variant: 'TableFunctionInvocation';
    whitespaceBeforeFunction?: WhitespaceLike;
    function: Fragment<'SchemaFunction'>;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    parameters?: NonEmptyCommaListSingle<Expr>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  SchemaFunction: {
    schema?: Fragment<'SchemaItem_Schema'>;
    function: Identifier;
  };
  Not: {
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
  };
  Like_Escape: {
    whitespaceBeforeEscape?: WhitespaceLike;
    escape: Node<'Escape'>;
  };
  // Used for parsing Expr
  ExprBase:
    | Fragment<'LiteralValue'>
    | Node<
        | 'BitwiseNegation'
        | 'Plus'
        | 'Minus'
        | 'BindParameter'
        | 'Column'
        | 'Select'
        | 'FunctionInvocation'
        | 'Parenthesis'
        | 'CastAs'
        | 'Case'
        | 'RaiseFunction'
      >;
  ExprChain_Item: Fragment<
    | 'ExprChain_Item_Collate'
    | 'ExprChain_Item_Concatenate'
    | 'ExprChain_Item_Multiply'
    | 'ExprChain_Item_Divide'
    | 'ExprChain_Item_Modulo'
    | 'ExprChain_Item_Add'
    | 'ExprChain_Item_Subtract'
    | 'ExprChain_Item_BitwiseAnd'
    | 'ExprChain_Item_BitwiseOr'
    | 'ExprChain_Item_BitwiseShiftLeft'
    | 'ExprChain_Item_BitwiseShiftRight'
    | 'ExprChain_Item_Escape'
    | 'ExprChain_Item_GreaterThan'
    | 'ExprChain_Item_LowerThan'
    | 'ExprChain_Item_GreaterOrEqualThan'
    | 'ExprChain_Item_LowerOrEqualThan'
    | 'ExprChain_Item_Equal'
    | 'ExprChain_Item_Different'
    | 'ExprChain_Item_Is'
    | 'ExprChain_Item_IsNot'
    | 'ExprChain_Item_Between'
    | 'ExprChain_Item_In'
    | 'ExprChain_Item_Match'
    | 'ExprChain_Item_Like'
    | 'ExprChain_Item_Regexp'
    | 'ExprChain_Item_Glob'
    | 'ExprChain_Item_Isnull'
    | 'ExprChain_Item_Notnull'
    | 'ExprChain_Item_NotNull'
    | 'ExprChain_Item_Not'
    | 'ExprChain_Item_And'
    | 'ExprChain_Item_Or'
  >;
  ExprChain_Item_Collate: {
    variant: 'Collate';
    whitespaceBeforeCollateKeyword?: WhitespaceLike;
    collateKeyword?: string;
    whitespaceBeforeCollationName?: WhitespaceLike;
    collationName: Identifier;
  };
  ExprChain_Item_Concatenate: {
    variant: 'Concatenate';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Multiply: {
    variant: 'Multiply';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Divide: {
    variant: 'Divide';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Modulo: {
    variant: 'Modulo';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Add: {
    variant: 'Add';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Subtract: {
    variant: 'Subtract';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_BitwiseAnd: {
    variant: 'BitwiseAnd';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_BitwiseOr: {
    variant: 'BitwiseOr';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_BitwiseShiftLeft: {
    variant: 'BitwiseShiftLeft';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_BitwiseShiftRight: {
    variant: 'BitwiseShiftRight';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_GreaterThan: {
    variant: 'GreaterThan';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_LowerThan: {
    variant: 'LowerThan';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_GreaterOrEqualThan: {
    variant: 'GreaterOrEqualThan';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_LowerOrEqualThan: {
    variant: 'LowerOrEqualThan';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Equal: {
    variant: 'Equal';
    operator: '==' | '=';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Different: {
    variant: 'Different';
    operator: '!=' | '<>';
    whitespaceBeforeOperator?: WhitespaceLike;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Is: {
    variant: 'Is';
    whitespaceBeforeIsKeyword?: WhitespaceLike;
    isKeyword?: string;
    whitespaceBeforeRight?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_IsNot: {
    variant: 'IsNot';
    whitespaceBeforeIsKeyword?: WhitespaceLike;
    isKeyword?: string;
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
    whitespaceBeforeRight?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Between: {
    variant: 'Between';
    not?: Fragment<'Between_Not'>;
    whitespaceBeforeBetweenKeyword?: WhitespaceLike;
    betweenKeyword?: string;
    whitespaceBeforeBetweenExpr?: WhitespaceLike;
    betweenExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_In: {
    variant: 'In';
    not?: Fragment<'In_Not'>;
    whitespaceBeforeInKeyword?: WhitespaceLike;
    inKeyword?: string;
    values: Fragment<'In_Values'>;
  };
  ExprChain_Item_Like: {
    variant: 'Like';
    not?: Fragment<'Not'>;
    whitespaceBeforeLikeKeyword?: WhitespaceLike;
    likeKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Escape: {
    variant: 'Escape';
    whitespaceBeforeEscapeKeyword?: WhitespaceLike;
    escapeKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Glob: {
    variant: 'Glob';
    not?: Fragment<'Not'>;
    whitespaceBeforeGlobKeyword?: WhitespaceLike;
    globKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Regexp: {
    variant: 'Regexp';
    not?: Fragment<'Not'>;
    whitespaceBeforeRegexpKeyword?: WhitespaceLike;
    regexpKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Match: {
    variant: 'Match';
    not?: Fragment<'Not'>;
    whitespaceBeforeMatchKeyword?: WhitespaceLike;
    matchKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Isnull: {
    variant: 'Isnull';
    whitespaceBeforeIsnullKeyword?: WhitespaceLike;
    isnullKeyword?: string;
  };
  ExprChain_Item_Notnull: {
    variant: 'Notnull';
    whitespaceBeforeNotnullKeyword?: WhitespaceLike;
    notnullKeyword?: string;
  };
  ExprChain_Item_NotNull: {
    variant: 'NotNull';
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
    whitespaceBeforeNullKeyword?: WhitespaceLike;
    nullKeyword?: string;
  };
  ExprChain_Item_Not: {
    variant: 'Not';
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Fragment<'ExprBase'>;
  };
  // used both for AND and BETWEEN AND
  ExprChain_Item_And: {
    variant: 'And';
    whitespaceBeforeAndKeyword?: WhitespaceLike;
    andKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  ExprChain_Item_Or: {
    variant: 'Or';
    whitespaceBeforeOrKeyword?: WhitespaceLike;
    orKeyword?: string;
    whitespaceBeforeRightExpr?: WhitespaceLike;
    rightExpr: Fragment<'ExprBase'>;
  };
  // Expr END
  FactoredSelectStmt_CompoundSelectsItem: {
    whitespaceBeforeCompoundOperator?: WhitespaceLike;
    compoundOperator: Node<'CompoundOperator'>;
    whitespaceBeforeSelect?: WhitespaceLike;
    select: Node<'SelectCore'>;
  };
  ForeignKeyClause_Item: Fragment<'ForeignKeyClause_Item_On' | 'ForeignKeyClause_Item_Match'>;
  ForeignKeyClause_Item_On: {
    variant: 'On';
    whitespaceBeforeOnKeyword?: WhitespaceLike;
    onKeyword?: string;
    event: Fragment<'ForeignKeyClause_Item_On_Event_Delete' | 'ForeignKeyClause_Item_On_Event_Update'>;
    action: Fragment<'ForeignKeyClause_Item_On_Action'>;
  };
  ForeignKeyClause_Item_On_Event_Delete: {
    variant: 'Delete';
    whitespaceBeforeDeleteKeyword?: WhitespaceLike;
    deleteKeyword?: string;
  };
  ForeignKeyClause_Item_On_Event_Update: {
    variant: 'Update';
    whitespaceBeforeUpdateKeyword?: WhitespaceLike;
    updateKeyword?: string;
  };
  ForeignKeyClause_Item_On_Action: Fragment<
    | 'ForeignKeyClause_Item_On_Action_SetNull'
    | 'ForeignKeyClause_Item_On_Action_SetDefault'
    | 'ForeignKeyClause_Item_On_Action_Cascade'
    | 'ForeignKeyClause_Item_On_Action_Restrict'
    | 'ForeignKeyClause_Item_On_Action_NoAction'
  >;
  ForeignKeyClause_Item_On_Action_SetNull: {
    variant: 'SetNull';
    whitespaceBeforeSetKeyword?: WhitespaceLike;
    setKeyword?: string;
    whitespaceBeforeNullKeyword?: WhitespaceLike;
    nullKeyword?: string;
  };
  ForeignKeyClause_Item_On_Action_SetDefault: {
    variant: 'SetDefault';
    whitespaceBeforeSetKeyword?: WhitespaceLike;
    setKeyword?: string;
    whitespaceBeforeDefaultKeyword?: WhitespaceLike;
    defaultKeyword?: string;
  };
  ForeignKeyClause_Item_On_Action_Cascade: {
    variant: 'Cascade';
    whitespaceBeforeCascadeKeyword?: WhitespaceLike;
    cascadeKeyword?: string;
  };
  ForeignKeyClause_Item_On_Action_Restrict: {
    variant: 'Restrict';
    whitespaceBeforeRestrictKeyword?: WhitespaceLike;
    restrictKeyword?: string;
  };
  ForeignKeyClause_Item_On_Action_NoAction: {
    variant: 'NoAction';
    whitespaceBeforeNoKeyword?: WhitespaceLike;
    noKeyword?: string;
    whitespaceBeforeActionKeyword?: WhitespaceLike;
    actionKeyword?: string;
  };
  ForeignKeyClause_Item_Match: {
    variant: 'Match';
    whitespaceBeforeMatchKeyword?: WhitespaceLike;
    matchKeyword?: string;
    whitespaceBeforeName?: WhitespaceLike;
    name: Identifier;
  };
  ForeignKeyClause_Deferrable: {
    not?: Fragment<'Not'>;
    whitespaceBeforeDeferrableKeyword?: WhitespaceLike;
    deferrableKeyword?: string;
    initially?: Fragment<'ForeignKeyClause_Deferrable_Initially_Deferred' | 'ForeignKeyClause_Deferrable_Initially_Immediate'>;
  };
  ForeignKeyClause_Deferrable_Initially_Deferred: {
    variant: 'Deferred';
    whitespaceBeforeInitiallyKeyword?: WhitespaceLike;
    initiallyKeyword?: string;
    whitespaceBeforeDeferredKeyword?: WhitespaceLike;
    deferredKeyword?: string;
  };
  ForeignKeyClause_Deferrable_Initially_Immediate: {
    variant: 'Immediate';
    whitespaceBeforeInitiallyKeyword?: WhitespaceLike;
    initiallyKeyword?: string;
    whitespaceBeforeImmediateKeyword?: WhitespaceLike;
    immediateKeyword?: string;
  };
  FrameSpec_Type: Fragment<'FrameSpec_Type_Range' | 'FrameSpec_Type_Rows' | 'FrameSpec_Type_Groups'>;
  FrameSpec_Type_Range: {
    variant: 'Range';
    rangeKeyword?: string;
  };
  FrameSpec_Type_Rows: {
    variant: 'Rows';
    rowsKeyword?: string;
  };
  FrameSpec_Type_Groups: {
    variant: 'Groups';
    groupsKeyword?: string;
  };
  FrameSpec_Inner: Fragment<'FrameSpec_Inner_Between' | 'FrameSpec_Inner_UnboundedPreceding' | 'FrameSpec_Inner_Preceding' | 'FrameSpec_Inner_CurrentRow'>;
  FrameSpec_Inner_Between: {
    variant: 'Between';
    betweenKeyword?: string;
    whitespaceBeforeBetweenKeyword?: WhitespaceLike;
    left: Fragment<'FrameSpec_Between_Item'>;
    whitespaceBeforeAndKeyword?: WhitespaceLike;
    andKeyword?: string;
    right: Fragment<'FrameSpec_Between_Item'>;
  };
  FrameSpec_Between_Item: Fragment<
    'FrameSpec_Between_Item_UnboundedPreceding' | 'FrameSpec_Between_Item_Preceding' | 'FrameSpec_Between_Item_CurrentRow' | 'FrameSpec_Between_Item_Following'
  >;
  FrameSpec_Between_Item_UnboundedPreceding: {
    varient: 'UnboundedPreceding';
    whitespaceBeforeUnboundedKeyword?: WhitespaceLike;
    unboundedKeyword?: string;
    whitespaceBeforePrecedingKeyword?: WhitespaceLike;
    precedingKeyword?: string;
  };
  FrameSpec_Between_Item_Preceding: {
    varient: 'Preceding';
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforePrecedingKeyword?: WhitespaceLike;
    precedingKeyword?: string;
  };
  FrameSpec_Between_Item_CurrentRow: {
    varient: 'CurrentRow';
    whitespaceBeforeCurrentKeyword?: WhitespaceLike;
    currentKeyword?: string;
    whitespaceBeforeRowKeyword?: WhitespaceLike;
    rowKeyword?: string;
  };
  FrameSpec_Between_Item_Following: {
    varient: 'Following';
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforeFollowingKeyword?: WhitespaceLike;
    followingKeyword?: string;
  };
  FrameSpec_Inner_UnboundedPreceding: {
    variant: 'UnboundedPreceding';
    whitespaceBeforeUnboundedKeyword?: WhitespaceLike;
    unboundedKeyword?: string;
    whitespaceBeforePrecedingKeyword?: WhitespaceLike;
    precedingKeyword?: string;
  };
  FrameSpec_Inner_Preceding: {
    variant: 'Preceding';
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforePrecedingKeyword?: WhitespaceLike;
    precedingKeyword?: string;
  };
  FrameSpec_Inner_CurrentRow: {
    variant: 'CurrentRow';
    whitespaceBeforeCurrentKeyword?: WhitespaceLike;
    currentKeyword?: string;
    whitespaceBeforeRowKeyword?: WhitespaceLike;
    rowKeyword?: string;
  };
  FrameSpec_Exclude: Fragment<'FrameSpec_Exclude_NoOther' | 'FrameSpec_Exclude_CurrentRow' | 'FrameSpec_Exclude_Group' | 'FrameSpec_Exclude_Ties'>;
  FrameSpec_Exclude_NoOther: {
    variant: 'NoOther';
    whitespaceBeforeExcludeKeyword?: WhitespaceLike;
    excludeKeyword?: string;
    whitespaceBeforeNoKeyword?: WhitespaceLike;
    noKeyword?: string;
    whitespaceBeforeOtherKeyword?: WhitespaceLike;
    otherKeyword?: string;
  };
  FrameSpec_Exclude_CurrentRow: {
    variant: 'CurrentRow';
    whitespaceBeforeExcludeKeyword?: WhitespaceLike;
    excludeKeyword?: string;
    whitespaceBeforeCurrentKeyword?: WhitespaceLike;
    currentKeyword?: string;
    whitespaceBeforeRowKeyword?: WhitespaceLike;
    rowKeyword?: string;
  };
  FrameSpec_Exclude_Group: {
    variant: 'Group';
    whitespaceBeforeExcludeKeyword?: WhitespaceLike;
    excludeKeyword?: string;
    whitespaceBeforeGroupKeyword?: WhitespaceLike;
    groupKeyword?: string;
  };
  FrameSpec_Exclude_Ties: {
    variant: 'Ties';
    whitespaceBeforeExcludeKeyword?: WhitespaceLike;
    excludeKeyword?: string;
    whitespaceBeforeTiesKeyword?: WhitespaceLike;
    tiesKeyword?: string;
  };
  IndexedColumn_Column: Fragment<'IndexedColumn_Column_Name' | 'IndexedColumn_Column_Expr'>;
  IndexedColumn_Column_Name: {
    variant: 'Name';
    columnName: Identifier;
  };
  IndexedColumn_Column_Expr: {
    variant: 'Expr';
    expr: Expr;
  };
  CollationName: {
    whitespaceBeforeCollateKeyword?: WhitespaceLike;
    collateKeyword?: string;
    whitespaceBeforeCollationName?: WhitespaceLike;
    collationName: Identifier;
  };
  InsertStmt_Method: Fragment<'InsertStmt_Method_ReplaceInto' | 'InsertStmt_Method_InsertInto'>;
  InsertStmt_Method_ReplaceInto: {
    variant: 'ReplaceInto';
    replaceKeyword?: string;
  };
  InsertStmt_Method_InsertInto: {
    variant: 'InsertInto';
    insertKeyword?: string;
    or?: Fragment<'InsertStmt_Method_InsertInto_Or'>;
  };
  InsertStmt_Method_InsertInto_Or: {
    whitespaceBeforeOrKeyword?: WhitespaceLike;
    orKeyword?: string;
    action: Fragment<
      | 'InsertStmt_Method_InsertInto_Or_Action_Abort'
      | 'InsertStmt_Method_InsertInto_Or_Action_Fail'
      | 'InsertStmt_Method_InsertInto_Or_Action_Ignore'
      | 'InsertStmt_Method_InsertInto_Or_Action_Replace'
      | 'InsertStmt_Method_InsertInto_Or_Action_Rollback'
    >;
  };
  InsertStmt_Method_InsertInto_Or_Action_Abort: {
    variant: 'Abort';
    whitespaceBeforeAbortKeyword?: WhitespaceLike;
    abortKeyword?: string;
  };
  InsertStmt_Method_InsertInto_Or_Action_Fail: {
    variant: 'Fail';
    whitespaceBeforeFailKeyword?: WhitespaceLike;
    failKeyword?: string;
  };
  InsertStmt_Method_InsertInto_Or_Action_Ignore: {
    variant: 'Ignore';
    whitespaceBeforeIgnoreKeyword?: WhitespaceLike;
    ignoreKeyword?: string;
  };
  InsertStmt_Method_InsertInto_Or_Action_Replace: {
    variant: 'Replace';
    whitespaceBeforeReplaceKeyword?: WhitespaceLike;
    replaceKeyword?: string;
  };
  InsertStmt_Method_InsertInto_Or_Action_Rollback: {
    variant: 'Rollback';
    whitespaceBeforeRollbackKeyword?: WhitespaceLike;
    rollbackKeyword?: string;
  };
  InsertStmt_Alias: {
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    whitespaceBeforeAlias?: WhitespaceLike;
    alias: Identifier;
  };
  InsertStmt_Data: Fragment<'InsertStmt_Data_Values' | 'InsertStmt_Data_Select' | 'InsertStmt_Data_DefaultValues'>;
  InsertStmt_Data_Values: {
    variant: 'Values';
    whitespaceBeforeValuesKeyword?: WhitespaceLike;
    valuesKeyword?: string;
    rows: NonEmptyCommaList<Fragment<'InsertStmt_Data_Values_Row'>>;
    upsertClause?: Fragment<'InsertStmt_Data_UpsertClause'>;
  };
  InsertStmt_Data_Values_Row: {
    whitespaceBeforeOpenParent?: WhitespaceLike;
    exprs: NonEmptyCommaListSingle<Expr>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  InsertStmt_Data_UpsertClause: {
    whitespaceBeforeUpsertClause?: WhitespaceLike;
    upsertClause: Node<'UpsertClause'>;
  };
  InsertStmt_Data_Select: {
    variant: 'Select';
    whitespaceBeforeSelectStmt?: WhitespaceLike;
    selectStmt: Node<'SelectStmt'>;
    upsertClause?: Fragment<'InsertStmt_Data_UpsertClause'>;
  };
  InsertStmt_Data_DefaultValues: {
    variant: 'DefaultValues';
    whitespaceBeforeDefaultKeyword?: WhitespaceLike;
    defaultKeyword?: string;
    whitespaceBeforeValuesKeyword?: WhitespaceLike;
    valuesKeyword?: string;
  };
  JoinClause_JoinItem: {
    whitespaceBeforeJoinOperator?: WhitespaceLike;
    joinOperator: Node<'JoinOperator'>;
    whitespaceBeforeTableOrSubquery?: WhitespaceLike;
    tableOrSubquery: Node<'TableOrSubquery'>;
    // allow empty here instead of in JoinConstraint
    joinConstraint?: Fragment<'JoinClause_JoinItem_JoinConstraint'>;
  };
  JoinClause_JoinItem_JoinConstraint: {
    whitespaceBeforeJoinConstraint?: WhitespaceLike;
    joinConstraint: Node<'JoinConstraint'>;
  };
  JoinConstraint_On: {
    variant: 'On';
    whitespaceBeforeOnKeyword?: WhitespaceLike;
    onKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
  };
  JoinConstraint_Using: {
    variant: 'Using';
    whitespaceBeforeUsingKeyword?: WhitespaceLike;
    usingKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    columnNames: NonEmptyCommaListSingle<Identifier>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  JoinOperator_Comma: {
    variant: 'Comma';
  };
  JoinOperator_Join: {
    variant: 'Join';
    natural?: Fragment<'JoinOperator_Join_Natural'>;
    join: Fragment<'JoinOperator_Join_Left' | 'JoinOperator_Join_Inner' | 'JoinOperator_Join_Cross'>;
    joinKeyword?: string;
  };
  JoinOperator_Join_Natural: {
    naturalKeyword?: string;
    whitespaceAfterNaturalKeyword?: WhitespaceLike;
  };
  JoinOperator_Join_Left: {
    variant: 'Left';
    leftKeyword?: string;
    whitespaceAfterLeftKeyword?: WhitespaceLike;
    outer?: Fragment<'JoinOperator_Join_Left_Outer'>;
  };
  JoinOperator_Join_Left_Outer: {
    outerKeyword?: string;
    whitespaceAfterOuterKeyword?: WhitespaceLike;
  };
  JoinOperator_Join_Inner: {
    variant: 'Inner';
    innerKeyword?: string;
    whitespaceAfterInnerKeyword?: WhitespaceLike;
  };
  JoinOperator_Join_Cross: {
    variant: 'Cross';
    crossKeyword?: string;
    whitespaceAfterCrossKeyword?: WhitespaceLike;
  };
  OrderingTerm_NullsFirst: {
    variant: 'NullsFirst';
    whitespaceBeforeNullsKeyword?: WhitespaceLike;
    nullsKeyword?: string;
    whitespaceBeforeFirstKeyword?: WhitespaceLike;
    firstKeyword?: string;
  };
  OrderingTerm_NullsLast: {
    variant: 'NullsLast';
    whitespaceBeforeNullsKeyword?: WhitespaceLike;
    nullsKeyword?: string;
    whitespaceBeforeLastKeyword?: WhitespaceLike;
    lastKeyword?: string;
  };
  OverClause_WindowName: {
    variant: 'WindowName';
    whitespaceBeforeWindowName?: WhitespaceLike;
    windowName: Identifier;
  };
  OverClause_Window: {
    variant: 'Window';
    whitespaceBeforeOpenParent?: WhitespaceLike;
    baseWindowName?: Fragment<'OverClause_BaseWindowName'>;
    partitionBy?: Fragment<'OverClause_PartitionBy'>;
    orderBy?: Fragment<'OverClause_OrderBy'>;
    frameSpec?: Fragment<'OverClause_FrameSpec'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  OverClause_BaseWindowName: {
    whitespaceBeforeBaseWindowName?: WhitespaceLike;
    baseWindowName: Identifier;
  };
  OverClause_PartitionBy: {
    whitespaceBeforePartitionKeyword?: WhitespaceLike;
    partitionKeyword?: string;
    whitespaceBeforeByKeyword?: WhitespaceLike;
    byKeyword?: string;
    exprs: NonEmptyCommaListSingle<Expr>;
  };
  OverClause_OrderBy: {
    whitespaceBeforeOrderKeyword?: WhitespaceLike;
    orderKeyword?: string;
    whitespaceBeforeByKeyword?: WhitespaceLike;
    byKeyword?: string;
    orderingTerms: NonEmptyCommaListSingle<Node<'OrderingTerm'>>;
  };
  OverClause_FrameSpec: {
    whitespaceBeforeFrameSpec?: WhitespaceLike;
    frameSpec: Node<'FrameSpec'>;
  };
  SchemaPragma: {
    schema?: Fragment<'SchemaItem_Schema'>;
    pragma: Identifier;
  };
  PragmaStmt_Value: Fragment<'PragmaStmt_Value_Equal' | 'PragmaStmt_Value_Call'>;
  PragmaStmt_Value_Equal: {
    variant: 'Equal';
    whitespaceBeforeEqual?: WhitespaceLike;
    whitespaceBeforePragmaValue?: WhitespaceLike;
    pragmaValue: Fragment<'PragmaValue'>;
  };
  PragmaStmt_Value_Call: {
    variant: 'Call';
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforePragmaValue?: WhitespaceLike;
    pragmaValue: Fragment<'PragmaValue'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  // Doc also include 'SignedLiteral' but what is a signedLiteral ??
  PragmaValue: Node<'SignedNumber' | 'StringLiteral'>;
  QualifiedTableName_Alias: {
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    whitespaceBeforeAlias?: WhitespaceLike;
    alias: Identifier;
  };
  QualifiedTableName_IndexedBy: {
    variant: 'IndexedBy';
    whitespaceBeforeIndexedKeyword?: WhitespaceLike;
    indexedKeyword?: string;
    whitespaceBeforeByKeyword?: WhitespaceLike;
    byKeyword?: string;
    whitespaceBeforeIndexName?: WhitespaceLike;
    indexName: Identifier;
  };
  QualifiedTableName_NotIndexed: {
    variant: 'NotIndexed';
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
    whitespaceBeforeIndexedKeyword?: WhitespaceLike;
    indexedKeyword?: string;
  };
  RaiseFunction_Ignore: {
    variant: 'Ignore';
    whitespaceBeforeIgnoreKeyword?: WhitespaceLike;
    ignoreKeyword?: string;
  };
  RaiseFunction_Rollback: {
    variant: 'Rollback';
    whitespaceBeforeRollbackKeyword?: WhitespaceLike;
    rollbackKeyword?: string;
    whitespaceBeforeComma?: WhitespaceLike;
    whitespaceBeforeErrorMessage?: WhitespaceLike;
    errorMessage: Node<'StringLiteral'>;
  };
  RaiseFunction_Abort: {
    variant: 'Abort';
    whitespaceBeforeAbortKeyword?: WhitespaceLike;
    abortKeyword?: string;
    whitespaceBeforeComma?: WhitespaceLike;
    whitespaceBeforeErrorMessage?: WhitespaceLike;
    errorMessage: Node<'StringLiteral'>;
  };
  RaiseFunction_Fail: {
    variant: 'Fail';
    whitespaceBeforeFailKeyword?: WhitespaceLike;
    failKeyword?: string;
    whitespaceBeforeComma?: WhitespaceLike;
    whitespaceBeforeErrorMessage?: WhitespaceLike;
    errorMessage: Node<'StringLiteral'>;
  };
  RecursiveCte_Union: {
    variant: 'Union';
    whitespaceBeforeUnionKeyword?: WhitespaceLike;
    unionKeyword?: string;
  };
  RecursiveCte_UnionAll: {
    variant: 'UnionAll';
    whitespaceBeforeUnionKeyword?: WhitespaceLike;
    unionKeyword?: string;
    whitespaceBeforeAllKeyword?: WhitespaceLike;
    allKeyword?: string;
  };
  ReindexStmt_CollationName: {
    variant: 'CollationName';
    whitespaceBeforeCollationName?: WhitespaceLike;
    collationName: Identifier;
  };
  ReindexStmt_Table: {
    variant: 'Table';
    whitespaceBeforeTable?: WhitespaceLike;
    table: Fragment<'SchemaTable'>;
  };
  ReindexStmt_Index: {
    variant: 'Index';
    whitespaceBeforeIndex?: WhitespaceLike;
    index: Fragment<'SchemaIndex'>;
  };
  Savepoint: {
    whitespaceBeforeSavepointKeyword?: WhitespaceLike;
    savepointKeyword?: string;
  };
  ResultColumn_Star: {
    variant: 'Star';
  };
  ResultColumn_TableStar: {
    variant: 'TableStar';
    tableName: Identifier;
    whitespaceBeforeDot?: WhitespaceLike;
    whitespaceBeforeStar?: WhitespaceLike;
  };
  ResultColumn_Expr: {
    variant: 'Expr';
    expr: Expr;
    alias?: Fragment<'ResultColumn_Expr_Alias'>;
  };
  ResultColumn_Expr_Alias: {
    as?: Fragment<'As'>;
    whitespaceBeforeColumnAlias?: WhitespaceLike;
    columnAlias: Identifier;
  };
  As: {
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
  };
  ReturningClause_Item: Fragment<'ReturningClause_Item_Star' | 'ReturningClause_Item_Expr'>;
  ReturningClause_Item_Star: {
    variant: 'Star';
    whitespaceBeforeStar?: WhitespaceLike;
  };
  ReturningClause_Item_Expr: {
    variant: 'Expr';
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    alias?: Fragment<'ReturningClause_Item_Expr_Alias'>;
  };
  ReturningClause_Item_Expr_Alias: {
    as?: Fragment<'As'>;
    whitespaceBeforeColumnAlias?: WhitespaceLike;
    columnAlias: Identifier;
  };
  RollbackStmt_Transaction: {
    whitespaceBeforeTransactionKeyword?: WhitespaceLike;
    transactionKeyword?: string;
  };
  RollbackStmt_To: {
    whitespaceBeforeToKeyword?: WhitespaceLike;
    toKeyword?: string;
    savepoint?: Fragment<'Savepoint'>;
    whitespaceBeforeSavepointName?: WhitespaceLike;
    savepointName: Identifier;
  };
  SelectCore_Select: {
    variant: 'Select';
    selectKeyword?: string;
    distinct?: Fragment<'SelectCore_Select_Distinct' | 'SelectCore_Select_All'>;
    resultColumns: NonEmptyCommaListSingle<Node<'ResultColumn'>>;
    from?: Fragment<'SelectCore_Select_From'>;
    where?: Fragment<'Where'>;
    groupBy?: Fragment<'SelectCore_Select_GroupBy'>;
    window?: Fragment<'SelectCore_Select_Window'>;
  };
  SelectCore_Select_Distinct: {
    variant: 'Distinct';
    whitespaceBeforeDistinctKeyword?: WhitespaceLike;
    distinctKeyword?: string;
  };
  SelectCore_Select_All: {
    variant: 'All';
    whitespaceBeforeAllKeyword?: WhitespaceLike;
    allKeyword?: string;
  };
  SelectCore_Select_From: {
    fromKeyword?: string;
    whitespaceBeforeFromKeyword?: WhitespaceLike;
    inner: Fragment<'SelectCore_Select_From_TableOrSubquery' | 'SelectCore_Select_From_Join'>;
  };
  SelectCore_Select_From_TableOrSubquery: {
    variant: 'TableOrSubquery';
    tableOrSubqueries: NonEmptyCommaListSingle<Node<'TableOrSubquery'>>;
  };
  SelectCore_Select_From_Join: {
    variant: 'Join';
    whitespaceBeforeJoinClause?: WhitespaceLike;
    joinClause: Node<'JoinClause'>;
  };
  SelectCore_Select_GroupBy: {
    whitespaceBeforeGroupKeyword?: WhitespaceLike;
    groupKeyword?: string;
    whitespaceBeforeByKeyword?: WhitespaceLike;
    byKeyword?: string;
    exprs: NonEmptyCommaListSingle<Expr>;
    having?: Fragment<'SelectCore_Select_GroupBy_Having'>;
  };
  SelectCore_Select_GroupBy_Having: {
    whitespaceBeforeHavingKeyword?: WhitespaceLike;
    havingKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
  };
  SelectCore_Select_Window: {
    whitespaceBeforeWindowKeyword?: WhitespaceLike;
    windowKeyword?: string;
    windows: NonEmptyCommaList<Fragment<'SelectCore_Select_Window_Item'>>;
  };
  SelectCore_Select_Window_Item: {
    whitespaceBeforeWindowName?: WhitespaceLike;
    windowName: Identifier;
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    whitespaceBeforeWindowDefn?: WhitespaceLike;
    windowDefn: Node<'WindowDefn'>;
  };
  SelectCore_Values: {
    variant: 'Values';
    valuesKeyword?: string;
    values: NonEmptyCommaList<Fragment<'SelectCore_Values_Item'>>;
  };
  SelectCore_Values_Item: {
    whitespaceBeforeOpenParent?: WhitespaceLike;
    items: NonEmptyCommaListSingle<Expr>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  SelectStmt_CompoundSelectsItem: {
    whitespaceBeforeCompoundOperator?: WhitespaceLike;
    compoundOperator: Node<'CompoundOperator'>;
    whitespaceBeforeSelect?: WhitespaceLike;
    select: Node<'SelectCore'>;
  };
  SignedNumber_Sign: {
    variant: 'Plus' | 'Minus';
    whitespaceAfterSign?: WhitespaceLike;
  };
  SimpleFunctionInvocation_Star: {
    variant: 'Star';
    whitespaceBeforeStar?: WhitespaceLike;
  };
  SimpleFunctionInvocation_Exprs: {
    variant: 'Exprs';
    exprs: NonEmptyCommaListSingle<Expr>;
  };
  SqlStmt_Explain: {
    explainKeyword?: string;
    queryPlan?: Fragment<'SqlStmt_Explain_QueryPlan'>;
    whitespaceAfter?: WhitespaceLike;
  };
  SqlStmt_Explain_QueryPlan: {
    whitespaceBeforeQueryKeyword?: WhitespaceLike;
    queryKeyword?: string;
    whitespaceBeforePlanKeyword?: WhitespaceLike;
    planKeyword?: string;
  };
  SqlStmt_Item: Node<
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
  SqlStmtList_Item: Fragment<'SqlStmtList_Item_Empty' | 'SqlStmtList_Item_Whitespace' | 'SqlStmtList_Item_Stmt'>;
  SqlStmtList_Item_Empty: {
    variant: 'Empty';
  };
  SqlStmtList_Item_Whitespace: {
    variant: 'Whitespace';
    whitespace?: WhitespaceLike;
  };
  SqlStmtList_Item_Stmt: {
    variant: 'Stmt';
    whitespaceBeforeStmt?: WhitespaceLike;
    stmt: Node<'SqlStmt'>;
    whitespaceAfterStmt?: WhitespaceLike;
  };
  TableConstraint_ConstraintName: {
    constraintKeyword?: string;
    whitespaceBeforeConstraintName?: WhitespaceLike;
    constraintName: Identifier;
    whitespaceAfterConstraintName?: WhitespaceLike;
  };
  TableConstraint_PrimaryKey: {
    variant: 'PrimaryKey';
    primaryKeyword?: string;
    whitespaceBeforeKeyKeyword?: WhitespaceLike;
    keyKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    indexedColumns: NonEmptyCommaListSingle<Node<'IndexedColumn'>>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    whitespaceBeforeConflictClause?: WhitespaceLike;
    conflictClause: Node<'ConflictClause'>;
  };
  TableConstraint_Unique: {
    variant: 'Unique';
    uniqueKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    indexedColumns: NonEmptyCommaListSingle<Node<'IndexedColumn'>>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    whitespaceBeforeConflictClause?: WhitespaceLike;
    conflictClause: Node<'ConflictClause'>;
  };
  TableConstraint_Check: {
    variant: 'Check';
    checkKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  TableConstraint_ForeignKey: {
    variant: 'ForeignKey';
    foreignKeyword?: string;
    whitespaceBeforeKeyKeyword?: WhitespaceLike;
    keyKeyword?: string;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    columnNames: NonEmptyCommaListSingle<Identifier>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    whitespaceBeforeForeignKeyClause?: WhitespaceLike;
    foreignKeyClause: Node<'ForeignKeyClause'>;
  };
  TableOrSubquery_Table: {
    variant: 'Table';
    table: Fragment<'SchemaTable'>;
    alias?: Fragment<'TableOrSubquery_Alias'>;
    index?: Fragment<'TableOrSubquery_Table_IndexedBy' | 'TableOrSubquery_Table_NotIndexed'>;
  };
  TableOrSubquery_Alias: {
    as?: Fragment<'As'>;
    whitespaceBeforeTableAlias?: WhitespaceLike;
    tableAlias: Identifier;
  };
  TableOrSubquery_Table_IndexedBy: {
    variant: 'IndexedBy';
    whitespaceBeforeIndexedKeyword?: WhitespaceLike;
    indexedKeyword?: string;
    whitespaceBeforeByKeyword?: WhitespaceLike;
    byKeyword?: string;
    whitespaceBeforeIndexName?: WhitespaceLike;
    indexName: Identifier;
  };
  TableOrSubquery_Table_NotIndexed: {
    variant: 'NotIndexed';
    whitespaceBeforeIndexedKeyword?: WhitespaceLike;
    indexedKeyword?: string;
    whitespaceBeforeNotKeyword?: WhitespaceLike;
    notKeyword?: string;
  };
  TableOrSubquery_TableFunctionInvocation: {
    variant: 'TableFunctionInvocation';
    function: Fragment<'SchemaFunction'>;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    parameters: NonEmptyCommaListSingle<Expr>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    alias?: Fragment<'TableOrSubquery_Alias'>;
  };
  TableOrSubquery_Select: {
    variant: 'Select';
    whitespaceBeforeSelectStmt?: WhitespaceLike;
    selectStmt: Node<'SelectStmt'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    alias?: Fragment<'TableOrSubquery_Alias'>;
  };
  TableOrSubquery_TableOrSubqueries: {
    variant: 'TableOrSubqueries';
    tableOrSubqueries: NonEmptyCommaListSingle<Node<'TableOrSubquery'>>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  TableOrSubquery_Join: {
    variant: 'Join';
    whitespaceBeforeJoinClause?: WhitespaceLike;
    joinClause: Node<'JoinClause'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  TypeName_Size: {
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeFirst?: WhitespaceLike;
    first: Node<'SignedNumber'>;
    second?: Fragment<'TypeName_Size_SecondNumber'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  TypeName_Size_SecondNumber: {
    whitespaceBeforeComma?: WhitespaceLike;
    whitespaceBeforeSecond?: WhitespaceLike;
    number: Node<'SignedNumber'>;
  };
  UpdateOr: Fragment<'UpdateOr_Abort' | 'UpdateOr_Fail' | 'UpdateOr_Ignore' | 'UpdateOr_Replace' | 'UpdateOr_Rollback'>;
  UpdateOr_Abort: {
    variant: 'Abort';
    whitespaceBeforeOrKeyword?: WhitespaceLike;
    orKeyword?: string;
    whitespaceBeforeAbortKeyword?: WhitespaceLike;
    abortKeyword?: string;
  };
  UpdateOr_Fail: {
    variant: 'Fail';
    whitespaceBeforeOrKeyword?: WhitespaceLike;
    orKeyword?: string;
    whitespaceBeforeFailKeyword?: WhitespaceLike;
    failKeyword?: string;
  };
  UpdateOr_Ignore: {
    variant: 'Ignore';
    whitespaceBeforeOrKeyword?: WhitespaceLike;
    orKeyword?: string;
    whitespaceBeforeIgnoreKeyword?: WhitespaceLike;
    ignoreKeyword?: string;
  };
  UpdateOr_Replace: {
    variant: 'Replace';
    whitespaceBeforeOrKeyword?: WhitespaceLike;
    orKeyword?: string;
    whitespaceBeforeReplaceKeyword?: WhitespaceLike;
    replaceKeyword?: string;
  };
  UpdateOr_Rollback: {
    variant: 'Rollback';
    whitespaceBeforeOrKeyword?: WhitespaceLike;
    orKeyword?: string;
    whitespaceBeforeRollbackKeyword?: WhitespaceLike;
    rollbackKeyword?: string;
  };
  UpdateSetItems: NonEmptyCommaList<Fragment<'UpdateSetItems_ColumnName' | 'UpdateSetItems_ColumnNameList'>>;
  UpdateSetItems_ColumnName: {
    variant: 'ColumnName';
    whitespaceBeforeColumnName?: WhitespaceLike;
    columnName: Identifier;
    whitespaceBeforeEqual?: WhitespaceLike;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
  };
  UpdateSetItems_ColumnNameList: {
    variant: 'ColumnNameList';
    whitespaceBeforeColumnNameList?: WhitespaceLike;
    columnNameList: Node<'ColumnNameList'>;
    whitespaceBeforeEqual?: WhitespaceLike;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
  };
  UpdateFrom: {
    whitespaceBeforeFromKeyword?: WhitespaceLike;
    fromKeyword?: string;
    inner: Fragment<'UpdateFrom_TableOrSubquery' | 'UpdateFrom_JoinClause'>;
  };
  UpdateFrom_TableOrSubquery: {
    variant: 'TableOrSubquery';
    tableOrSubqueries: NonEmptyCommaListSingle<Node<'TableOrSubquery'>>;
  };
  UpdateFrom_JoinClause: {
    variant: 'JoinClause';
    whitespaceBeforeJoinClause?: WhitespaceLike;
    joinClause: Node<'JoinClause'>;
  };
  UpdateStmt_LimitedWhere: {
    whitespaceBeforeWhereKeyword?: WhitespaceLike;
    whereKeyword?: string;
    whitespaceBeforeExpr?: WhitespaceLike;
    expr: Expr;
    returningClause?: Fragment<'ReturningClause'>;
  };
  UpsertClause_Item: {
    onKeyword?: string;
    whitespaceBeforeConflictKeyword?: WhitespaceLike;
    conflictKeyword?: string;
    target?: Fragment<'UpsertClause_Item_Target'>;
    whitespaceBeforeDoKeyword?: WhitespaceLike;
    doKeyword?: string;
    inner: Fragment<'UpsertClause_Item_Nothing' | 'UpsertClause_Item_UpdateSet'>;
  };
  UpsertClause_Item_Target: {
    whitespaceBeforeOpenParent?: WhitespaceLike;
    indexedColumns: NonEmptyCommaListSingle<Node<'IndexedColumn'>>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
    where?: Fragment<'Where'>;
  };
  UpsertClause_Item_Nothing: {
    variant: 'Nothing';
    whitespaceBeforeNothingKeyword?: WhitespaceLike;
    nothingKeyword?: string;
  };
  UpsertClause_Item_UpdateSet: {
    variant: 'UpdateSet';
    whitespaceBeforeUpdateKeyword?: WhitespaceLike;
    updateKeyword?: string;
    whitespaceBeforeSetKeyword?: WhitespaceLike;
    setKeyword?: string;
    setItems: Fragment<'UpdateSetItems'>;
    where?: Fragment<'Where'>;
  };
  VacuumStmt_SchemaName: {
    whitespaceBeforeSchemaName?: WhitespaceLike;
    schemaName: Identifier;
  };
  VacuumStmt_Into: {
    whitespaceBeforeIntoKeyword?: WhitespaceLike;
    intoKeyword?: string;
    whitespaceBeforeFilename?: WhitespaceLike;
    filename: Node<'StringLiteral'>;
  };
  WindowDefn_BaseWindowName: {
    whitespaceBeforeBaseWindowName?: WhitespaceLike;
    baseWindowName: Identifier;
  };
  WindowDefn_PartitionBy: {
    whitespaceBeforePartitionKeyword?: WhitespaceLike;
    partitionKeyword?: string;
    whitespaceBeforeByKeyword?: WhitespaceLike;
    byKeyword?: string;
    whitespaceBeforeExprs?: WhitespaceLike;
    exprs: NonEmptyCommaListSingle<Expr>;
  };
  WindowDefn_FrameSpec: {
    whitespaceBeforeFrameSpec?: WhitespaceLike;
    frameSpec: Node<'FrameSpec'>;
  };
  WindowFunctionInvocation_Parameters: Fragment<'WindowFunctionInvocation_Parameters_Star' | 'WindowFunctionInvocation_Parameters_Exprs'>;
  WindowFunctionInvocation_Parameters_Star: {
    variant: 'Star';
    whitespaceBeforeStar?: WhitespaceLike;
  };
  WindowFunctionInvocation_Parameters_Exprs: {
    variant: 'Exprs';
    exprs: NonEmptyCommaListSingle<Expr>;
  };
  WindowFunctionInvocation_FilterClause: {
    whitespaceBeforeFilterClause?: WhitespaceLike;
    filterClause: Node<'FilterClause'>;
  };
  WindowFunctionInvocation_Over: {
    whitespaceBeforeOverKeyword?: WhitespaceLike;
    overKeyword?: string;
    inner: Fragment<'WindowFunctionInvocation_Over_WindowDefn' | 'WindowFunctionInvocation_Over_WindowName'>;
  };
  WindowFunctionInvocation_Over_WindowDefn: {
    variant: 'WindowDefn';
    whitespaceBeforeWindowDefn?: WhitespaceLike;
    windowDefn: Node<'WindowDefn'>;
  };
  WindowFunctionInvocation_Over_WindowName: {
    variant: 'WindowName';
    whitespaceBeforeWindowName?: WhitespaceLike;
    windowName: Identifier;
  };
  WithClause_Recursive: {
    whitespaceBeforeRecursiveKeyword?: WhitespaceLike;
    recursiveKeyword?: string;
  };
  WithClause_Item: {
    whitespaceBeforeCteTableName?: WhitespaceLike;
    cteTableName: Node<'CteTableName'>;
    whitespaceBeforeAsKeyword?: WhitespaceLike;
    asKeyword?: string;
    materialized?: Fragment<'MaybeMaterialized'>;
    whitespaceBeforeOpenParent?: WhitespaceLike;
    whitespaceBeforeSelect?: WhitespaceLike;
    select: Node<'SelectStmt'>;
    whitespaceBeforeCloseParent?: WhitespaceLike;
  };
  // Used for typing to enforce Precedence with types
  Expr: Fragment<'ExprP01'>;
  ExprP01: Fragment<'ExprP02'> | Node<'Or'>;
  ExprP02: Fragment<'ExprP03'> | Node<'And'>;
  ExprP03: Fragment<'ExprP04'> | Node<'Not'>;
  ExprP04:
    | Fragment<'ExprP05'>
    | Node<'Equal' | 'Different' | 'Is' | 'IsNot' | 'Between' | 'In' | 'Match' | 'Like' | 'Glob' | 'Regexp' | 'Isnull' | 'Notnull' | 'NotNull'>;
  ExprP05: Fragment<'ExprP06'> | Node<'LowerThan' | 'GreaterThan' | 'LowerOrEqualThan' | 'GreaterOrEqualThan'>;
  ExprP06: Fragment<'ExprP07'> | Node<'Escape'>;
  ExprP07: Fragment<'ExprP08'> | Node<'BitwiseAnd' | 'BitwiseOr' | 'BitwiseShiftLeft' | 'BitwiseShiftRight'>;
  ExprP08: Fragment<'ExprP09'> | Node<'Add' | 'Subtract'>;
  ExprP09: Fragment<'ExprP10'> | Node<'Multiply' | 'Divide' | 'Modulo'>;
  ExprP10: Fragment<'ExprP11'> | Node<'Concatenate'>;
  ExprP11: Fragment<'ExprP12'> | Node<'Collate'>;
  ExprP12: Fragment<'ExprP13'> | Node<'BitwiseNegation' | 'Plus' | 'Minus'>;
  ExprP13: Fragment<'LiteralValue'> | Node<'BindParameter' | 'Column' | 'Select' | 'FunctionInvocation' | 'Parenthesis' | 'CastAs' | 'Case' | 'RaiseFunction'>;
};

export type FragmentName = keyof FragmentData;

export type Fragment<K extends FragmentName> = FragmentData[K];

export type WhitespaceLike = Fragment<'WhitespaceLike'>;
