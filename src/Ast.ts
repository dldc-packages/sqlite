export type NonEmptyList<T> = { head: T; tail: Array<T> };

export type NonEmptyListSepBy<T, Sep> = { head: T; tail: Array<{ sep: Sep; item: T }> };

export type NonEmptyCommaList<T> = NonEmptyListSepBy<T, { commaWhitespace?: WL }>;

export type NonEmptyCommaListSingle<T> = NonEmptyCommaList<{ whitespaceBefore?: WL; item: T }>;

export type ExprChainItemOpExpr<Variant extends string> = {
  variant: Variant;
  opWhitespace?: WL;
  exprWhitespace?: WL;
  expr: Fragment<'ExprBase'>;
};

export type ExprChainItemMaybeNotOpExpr<Variant extends string> = {
  variant: Variant;
  opWhitespace?: WL;
  not?: { notWhitespace?: WL };
  exprWhitespace?: WL;
  expr: Fragment<'ExprBase'>;
};

export type AtLeastOneKey<T extends Record<string, any>> = { [K in keyof T]: Omit<T, K> & Required<Pick<T, K>> }[keyof T];

type Fragments = {
  LiteralValue: LiteralValue;
  WhitespaceLike: Array<Node<'Whitespace'> | Node<'CommentSyntax'>>;
  SqlStmtListItem:
    | { variant: 'Empty' }
    | { variant: 'Whitespace'; whitespace?: WL }
    | { variant: 'Stmt'; whitespaceBefore?: WL; stmt: Node<'SqlStmt'>; whitespaceAfter?: WL };
  Exponent: { raw: string; value: number };
  StmtWith: {
    recursive?: { recursiveWhitespace?: WL };
    commonTableExpressions: NonEmptyCommaListSingle<Node<'CommonTableExpression'>>;
    whitespaceAfter?: WL;
  };
  OrderBy: {
    orderWhitespace?: WL;
    byWhitespace?: WL;
    orderingTerms: NonEmptyCommaListSingle<Node<'OrderingTerm'>>;
  };
  Limit: {
    limitWhitespace?: WL;
    exprWhitespace?: WL;
    expr: Expr;
    inner?:
      | { variant: 'Offset'; offsetWhitespace?: WL; exprWhitespace?: WL; expr: Expr }
      | { variant: 'Expr'; commaWhitespace?: WL; exprWhitespace?: WL; expr: Expr };
  };
  AggregateFunctionInvocationParamters:
    | { variant: 'Star'; starWhitespace?: WL }
    | {
        variant: 'Exprs';
        distinct?: { distinctWhitespace?: WL };
        exprs: NonEmptyCommaListSingle<Expr>;
      };
  AlterTableStmtAction:
    | {
        variant: 'RenameTo';
        toWhitespace?: WL;
        newTableNameWhitespace?: WL;
        newTableName: Identifier;
      }
    | {
        variant: 'RenameColumn';
        column?: { columnWhitespace?: WL };
        columnNameWhitespace?: WL;
        columnName: Identifier;
        toWhitespace?: WL;
        newColumnNameWhitespace?: WL;
        newColumnName: Identifier;
      }
    | {
        variant: 'AddColumn';
        column?: { columnWhitespace?: WL };
        columnDefWhitespace?: WL;
        columnDef: Node<'ColumnDef'>;
      }
    | {
        variant: 'DropColumn';
        column?: { columnWhitespace?: WL };
        columnNameWhitespace?: WL;
        columnName: Identifier;
      };
  AnalyzeStmtInner:
    | {
        variant: 'Single';
        schemaTableOtIndexNameWhitespace?: WL;
        schemaTableOtIndexName: Identifier;
      }
    | {
        variant: 'WithSchema';
        schemaNameWhitespace?: WL;
        schemaName: Identifier;
        dotWhitespace?: WL;
        indexOrTableNameWhitespace?: WL;
        indexOrTableName: Identifier;
      };
  BeginStmtMode:
    | { variant: 'Deferred'; deferredWhitespace?: WL }
    | { variant: 'Immediate'; immediateWhitespace?: WL }
    | { variant: 'Exclusive'; exclusiveWhitespace?: WL };
  ColumnConstraintConstraint:
    | {
        variant: 'PrimaryKey';
        keyWhitespace?: WL;
        direction?: { variant: 'Asc'; ascWhitespace?: WL } | { variant: 'Decs'; descWhitespace?: WL };
        conflictClauseWhitespace?: WL;
        conflictClause: Node<'ConflictClause'>;
        autoincrement?: { autoincrementWhitespace?: WL };
      }
    | { variant: 'NotNull'; nullWhitespace?: WL; conflictClauseWhitespace?: WL; conflictClause: Node<'ConflictClause'> }
    | { variant: 'Unique'; conflictClauseWhitespace?: WL; conflictClause: Node<'ConflictClause'> }
    | { variant: 'Check'; openParentWhitespace?: WL; exprWhitespace?: WL; expr: Expr; closeParentWhitespace?: WL }
    | {
        variant: 'Default';
        inner:
          | { variant: 'Expr'; openParentWhitespace?: WL; exprWhitespace?: WL; expr: Expr; closeParentWhitespace?: WL }
          | { variant: 'LiteralValue'; literalValueWhitespace?: WL; literalValue: Fragment<'LiteralValue'> }
          | { variant: 'SignedNumber'; signedNumberWhitespace?: WL; signedNumber: Node<'SignedNumber'> };
      }
    | {
        variant: 'Collate';
        collationNameWhitespace?: WL;
        collationName: Identifier;
      }
    | {
        variant: 'ForeignKey';
        foreignKeyClause: Node<'ForeignKeyClause'>;
      }
    | {
        variant: 'As';
        generatedAlways?: { alwaysWhitespace?: WL };
        openParentWhitespace?: WL;
        exprWhitespace?: WL;
        expr: Expr;
        closeParentWhitespace?: WL;
        mode?: { variant: 'Stored'; storedWhitespace?: WL } | { variant: 'Virtual'; virtualWhitespace?: WL };
      };
  SqlStmtExplain: {
    queryPlan?: { queryWhitespace?: WL; planWhitespace?: WL };
    whitespaceAfter?: WL;
  };
  IfNotExists: {
    ifWhitespace?: WL;
    notWhitespace?: WL;
    existsWhitespace?: WL;
  };
  IndexedColumnOrder: { variant: 'Asc'; ascWhitespace?: WL } | { variant: 'Desc'; descWhitespace?: WL };
  CollationName: {
    collateWhitespace?: WL;
    collationNameWhitespace?: WL;
    collationName: Identifier;
  };
  FrameSpecBetweenItem:
    | { varient: 'UnboundedPreceding'; unboundedWhitespace?: WL; precedingWhitespace?: WL }
    | { varient: 'Preceding'; exprWhitespace?: WL; expr: Expr; precedingWhitespace?: WL }
    | { varient: 'CurrentRow'; currentWhitespace?: WL; rowWhitespace?: WL }
    | { varient: 'Following'; exprWhitespace?: WL; expr: Expr; followingWhitespace?: WL };
  UpdateSetItems: NonEmptyCommaList<
    | { variant: 'ColumnName'; columnNameWhitespace?: WL; columnName: Identifier; equalWhitespace?: WL; exprWhitespace?: WL; expr: Expr }
    | {
        variant: 'ColumnNameList';
        columnNameListWhitespace?: WL;
        columnNameList: Node<'ColumnNameList'>;
        equalWhitespace?: WL;
        exprWhitespace?: WL;
        expr: Expr;
      }
  >;
  UpdateFrom: {
    fromWhitespace?: WL;
    inner:
      | {
          variant: 'TableOrSubquery';
          tableOrSubqueries: NonEmptyCommaListSingle<Node<'TableOrSubquery'>>;
        }
      | { variant: 'JoinClause'; joinClauseWhitespace?: WL; joinClause: Node<'JoinClause'> };
  };
  UpdateOr: {
    orWhitespace?: WL;
    inner:
      | { variant: 'Abort'; abortWhitespace?: WL }
      | { variant: 'Fail'; failWhitespace?: WL }
      | { variant: 'Ignore'; ignoreWhitespace?: WL }
      | { variant: 'Replace'; replaceWhitespace?: WL }
      | { variant: 'Rollback'; rollbackWhitespace?: WL };
  };
  SchemaItemTarget: {
    schema?: { schemaName: Identifier; dotWhitespace?: WL; whitespaceAfter?: WL };
    itemName: Identifier;
  };
  Where: {
    whereWhitespace?: WL;
    exprWhitespace?: WL;
    expr: Expr;
  };
  OverClausePartitionBy: { byWhitespace?: WL; exprs: NonEmptyCommaListSingle<Expr> };
  OverClauseOrderBy: { byWhitespace?: WL; orderingTerms: NonEmptyCommaListSingle<Node<'OrderingTerm'>> };
  OverClauseInner: {
    baseWindowName?: { baseWindowNameWhitespace?: WL; baseWindowName: Identifier };
    partitionBy?: { partitionWhitespace?: WL; byWhitespace?: WL; exprs: NonEmptyCommaListSingle<Expr> };
    orderBy?: { orderWhitespace?: WL; byWhitespace?: WL; orderingTerms: NonEmptyCommaListSingle<Node<'OrderingTerm'>> };
    frameSpec?: { frameSpecWhitespace?: WL; frameSpec: Node<'FrameSpec'> };
  };
  // Expr
  SelectExists: {
    not?: { whitespaceAfter?: WL };
    whitespaceAfter?: WL;
  };
  CaseItem: { whenWhitespace?: WL; whenExprWhitespace?: WL; whenExpr: Expr; thenWhitespace?: WL; thenExprWhitespace?: WL; thenExpr: Expr };
  IdentifierBasic: { variant: 'Basic'; name: string };
  IdentifierBrackets: { variant: 'Brackets'; name: string };
  IdentifierDoubleQuote: { variant: 'DoubleQuote'; name: string };
  IdentifierBacktick: { variant: 'Backtick'; name: string };
  SingleLineComment: { variant: 'SingleLine'; content: string; close: 'NewLine' | 'EOF' };
  MultilineComment: { variant: 'Multiline'; content: string };
  NumericLiteralInteger: { variant: 'Integer'; interger: number; exponent?: Fragment<'Exponent'> };
  NumericLiteralFloat: { variant: 'Float'; value: number; integral?: number; fractional: number; exponent?: Fragment<'Exponent'> };
  NumericLiteralHex: { variant: 'Hex'; value: number; xCase: 'lowercase' | 'uppercase' };
  ParameterName: { name: string; suffix: string | undefined };
  BindParameterIndexed: { variant: 'Indexed' };
  BindParameterNumbered: { variant: 'Numbered'; number: number };
  BindParameterAtNamed: { variant: 'AtNamed'; name: string; suffix?: string };
  BindParameterColonNamed: { variant: 'ColonNamed'; name: string; suffix?: string };
  BindParameterDollarNamed: { variant: 'DollarNamed'; name: string; suffix?: string };
  InValues: Fragment<'InValuesList' | 'InValuesTableName' | 'InValueTableFunctionInvocation'>;
  InValuesList: {
    variant: 'List';
    openParentWhitespace?: WL;
    items?: { variant: 'Select'; selectStmtWhitespace?: WL; selectStmt: Node<'SelectStmt'> } | { variant: 'Exprs'; exprs: NonEmptyCommaListSingle<Expr> };
    closeParentWhitespace?: WL;
  };
  InValuesTableName: {
    variant: 'TableName';
    tableTargetWhitespace?: WL;
    tableTarget: Fragment<'SchemaItemTarget'>;
  };
  InValueTableFunctionInvocation: {
    variant: 'TableFunctionInvocation';
    functionTargetWhitespace?: WL;
    functionTarget: Fragment<'SchemaItemTarget'>;
    openParentWhitespace?: WL;
    parameters?: NonEmptyCommaListSingle<Expr>;
    closeParentWhitespace?: WL;
  };
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

  ExprChainItemCollate: { variant: 'Collate'; collateWhitespace?: WL; collationNameWhitespace?: WL; collationName: Identifier };
  ExprChainItemConcatenate: ExprChainItemOpExpr<'Concatenate'>;
  ExprChainItemMultiply: ExprChainItemOpExpr<'Multiply'>;
  ExprChainItemDivide: ExprChainItemOpExpr<'Divide'>;
  ExprChainItemModulo: ExprChainItemOpExpr<'Modulo'>;
  ExprChainItemAdd: ExprChainItemOpExpr<'Add'>;
  ExprChainItemSubtract: ExprChainItemOpExpr<'Subtract'>;
  ExprChainItemBitwiseAnd: ExprChainItemOpExpr<'BitwiseAnd'>;
  ExprChainItemBitwiseOr: ExprChainItemOpExpr<'BitwiseOr'>;
  ExprChainItemBitwiseShiftLeft: ExprChainItemOpExpr<'BitwiseShiftLeft'>;
  ExprChainItemBitwiseShiftRight: ExprChainItemOpExpr<'BitwiseShiftRight'>;
  ExprChainItemEscape: ExprChainItemOpExpr<'Escape'>;
  ExprChainItemGreaterThan: ExprChainItemOpExpr<'GreaterThan'>;
  ExprChainItemLowerThan: ExprChainItemOpExpr<'LowerThan'>;
  ExprChainItemGreaterOrEqualThan: ExprChainItemOpExpr<'GreaterOrEqualThan'>;
  ExprChainItemLowerOrEqualThan: ExprChainItemOpExpr<'LowerOrEqualThan'>;
  ExprChainItemEqual: { variant: 'Equal'; operator: '==' | '='; operatorWhitespace?: WL; exprWhitespace?: WL; expr: Fragment<'ExprBase'> };
  ExprChainItemDifferent: { variant: 'Different'; operator: '!=' | '<>'; operatorWhitespace?: WL; exprWhitespace?: WL; expr: Fragment<'ExprBase'> };
  ExprChainItemIs: ExprChainItemOpExpr<'Is'>;
  ExprChainItemIsNot: { variant: 'IsNot'; isWhitespace?: WL; notWhitespace?: WL; exprWhitespace?: WL; expr: Fragment<'ExprBase'> };
  ExprChainItemBetween: ExprChainItemMaybeNotOpExpr<'Between'> & { and?: Fragment<'ExprChainItemAnd'> };
  ExprChainItemIn: { variant: 'In'; not?: { notWhitespace?: WL }; opWhitespace?: WL; values: Fragment<'InValues'> };
  ExprChainItemMatch: ExprChainItemMaybeNotOpExpr<'Match'>;
  ExprChainItemLike: ExprChainItemMaybeNotOpExpr<'Like'> & { escape?: { escapeWhitespace?: WL; escape: Node<'Escape'> } };
  ExprChainItemRegexp: ExprChainItemMaybeNotOpExpr<'Regexp'>;
  ExprChainItemGlob: ExprChainItemMaybeNotOpExpr<'Glob'>;
  ExprChainItemIsNull: { variant: 'IsNull'; isNullWhitespace?: WL };
  ExprChainItemNotNull: { variant: 'NotNull'; notNullWhitespace?: WL };
  ExprChainItemNot_Null: { variant: 'Not_Null'; notWhitespace?: WL; nullWhitespace?: WL };
  ExprChainItemNot: { variant: 'Not'; notWhitespace?: WL };
  ExprChainItemAnd: ExprChainItemOpExpr<'And'>; // used both for AND and BETWEEN AND
  ExprChainItemOr: ExprChainItemOpExpr<'Or'>;

  ExprChainItem: Fragment<
    | 'ExprChainItemCollate'
    | 'ExprChainItemConcatenate'
    | 'ExprChainItemMultiply'
    | 'ExprChainItemDivide'
    | 'ExprChainItemModulo'
    | 'ExprChainItemAdd'
    | 'ExprChainItemSubtract'
    | 'ExprChainItemBitwiseAnd'
    | 'ExprChainItemBitwiseOr'
    | 'ExprChainItemBitwiseShiftLeft'
    | 'ExprChainItemBitwiseShiftRight'
    | 'ExprChainItemEscape'
    | 'ExprChainItemGreaterThan'
    | 'ExprChainItemLowerThan'
    | 'ExprChainItemGreaterOrEqualThan'
    | 'ExprChainItemLowerOrEqualThan'
    | 'ExprChainItemEqual'
    | 'ExprChainItemDifferent'
    | 'ExprChainItemIs'
    | 'ExprChainItemIsNot'
    | 'ExprChainItemBetween'
    | 'ExprChainItemIn'
    | 'ExprChainItemMatch'
    | 'ExprChainItemLike'
    | 'ExprChainItemRegexp'
    | 'ExprChainItemGlob'
    | 'ExprChainItemIsNull'
    | 'ExprChainItemNotNull'
    | 'ExprChainItemNot_Null'
    | 'ExprChainItemNot'
    | 'ExprChainItemAnd'
    | 'ExprChainItemOr'
  >;
  Expr: Fragment<'ExprP01'>;
  ExprP01: Fragment<'ExprP02'> | Node<'Or'>;
  ExprP02: Fragment<'ExprP03'> | Node<'And'>;
  ExprP03: Fragment<'ExprP04'> | Node<'Not'>;
  ExprP04:
    | Fragment<'ExprP05'>
    | Node<'Equal' | 'Different' | 'Is' | 'IsNot' | 'Between' | 'In' | 'Match' | 'Like' | 'Glob' | 'Regexp' | 'IsNull' | 'NotNull' | 'Not_Null'>;
  ExprP05: Fragment<'ExprP06'> | Node<'LowerThan' | 'GreaterThan' | 'LowerOrEqualThan' | 'GreaterOrEqualThan'>;
  ExprP06: Fragment<'ExprP07'> | Node<'Escape'>;
  ExprP07: Fragment<'ExprP08'> | Node<'BitwiseAnd' | 'BitwiseOr' | 'BitwiseShiftLeft' | 'BitwiseShiftRight'>;
  ExprP08: Fragment<'ExprP09'> | Node<'Add' | 'Subtract'>;
  ExprP09: Fragment<'ExprP10'> | Node<'Multiply' | 'Divide' | 'Modulo'>;
  ExprP10: Fragment<'ExprP11'> | Node<'Concatenate'>;
  ExprP11: Fragment<'ExprP12'> | Node<'Collate'>;
  ExprP12: Fragment<'ExprP13'> | Node<'BitwiseNegation' | 'Plus' | 'Minus'>;
  ExprP13: LiteralValue | Node<'BindParameter' | 'Column' | 'Select' | 'FunctionInvocation' | 'Parenthesis' | 'CastAs' | 'Case' | 'RaiseFunction'>;
};

export type NodeData = {
  AggregateFunctionInvocation: {
    aggregateFunc: Identifier;
    openParentWhitespace?: WL;
    parameters?: Fragment<'AggregateFunctionInvocationParamters'>;
    closeParentWhitespace?: WL;
    filterClause?: { filterClauseWhitespace?: WL; filterClause: Node<'FilterClause'> };
  };
  AlterTableStmt: {
    tableWhitespace?: WL;
    tableTargetWhitespace?: WL;
    tableTarget: Fragment<'SchemaItemTarget'>;
    actionWhitespace?: WL;
    action: Fragment<'AlterTableStmtAction'>;
  };
  AnalyzeStmt: { inner?: Fragment<'AnalyzeStmtInner'> };
  AttachStmt: {
    database?: { databaseWhitespace?: WL };
    exprWhitespace?: WL;
    expr: Expr;
    asWhitespace?: WL;
    schemaNameWhitespace?: WL;
    schemaName: Identifier;
  };
  BeginStmt: { mode?: Fragment<'BeginStmtMode'>; transaction?: { transactionWhitespace?: WL } };
  ColumnConstraint: {
    constraintName?: { name: Identifier; nameWhitespace?: WL };
    constraintWhitespace?: WL;
    constraint: Fragment<'ColumnConstraintConstraint'>;
  };
  ColumnDef: {
    columnName: Identifier;
    typeName?: { typeNameWhitespace?: WL; typeName: Node<'TypeName'> };
    columnConstraints?: Array<{ columnConstraintWhitespace?: WL; columnConstraint: Node<'ColumnConstraint'> }>;
  };
  ColumnNameList: { columnNames: NonEmptyCommaListSingle<Identifier>; closeParentWhitespace?: WL };
  CommentSyntax: Fragment<'MultilineComment' | 'SingleLineComment'>;
  CommitStmt: { action: { variant: 'Commit' } | { variant: 'End' }; transaction?: { transactionWhitespace?: WL } };
  CommonTableExpression: {
    tableName: Identifier;
    columnNames?: {
      openParentWhitespace?: WL;
      columnNames: NonEmptyCommaListSingle<Identifier>;
      closeParentWhitespace?: WL;
    };
    asWhitespace?: WL;
    materialized?: { not?: { notWhitespace?: WL }; materializedWhitespace?: WL };
    openParentWhitespace?: WL;
    selectWhitespace?: WL;
    select: Node<'SelectStmt'>;
    closeParentWhitespace?: WL;
  };
  CompoundOperator: { variant: 'Union' } | { variant: 'UnionAll'; allWhitespace?: WL } | { variant: 'Intersect' } | { variant: 'Except' };
  CompoundSelectStmt: {
    with?: Fragment<'StmtWith'>;
    select: Node<'SelectCore'>;
    compoundSelects: NonEmptyList<
      | { variant: 'Union'; unionWhitespace?: WL; selectWhitespace?: WL; select: Node<'SelectCore'> }
      | { variant: 'UnionAll'; unionWhitespace?: WL; allWhitespace?: WL; selectWhitespace?: WL; select: Node<'SelectCore'> }
      | { variant: 'Intersect'; intersectWhitespace?: WL; selectWhitespace?: WL; select: Node<'SelectCore'> }
      | { variant: 'Except'; exceptWhitespace?: WL; selectWhitespace?: WL; select: Node<'SelectCore'> }
    >;
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  ConflictClause: {
    onConflict?: {
      conflictWhitespace?: WL;
      inner:
        | { variant: 'Rollback'; rollbackWhitespace?: WL }
        | { variant: 'Abort'; abortWhitespace?: WL }
        | { variant: 'Fail'; failWhitespace?: WL }
        | { variant: 'Ignore'; ignoreWhitespace?: WL }
        | { variant: 'Replace'; replaceWhitespace?: WL };
    };
  };
  CreateIndexStmt: {
    unique?: { uniqueWhitespace?: WL };
    indexWhitespace?: WL;
    ifNotExists?: Fragment<'IfNotExists'>;
    indexTargetWhitespace?: WL;
    indexTarget: Fragment<'SchemaItemTarget'>;
    onWhitespace?: WL;
    tableNameWhitespace?: WL;
    tableName: Identifier;
    openParentWhitespace?: WL;
    indexedColumns: NonEmptyCommaListSingle<Node<'IndexedColumn'>>;
    closeParentWhitespace?: WL;
    where?: Fragment<'Where'>;
  };
  CreateTableStmt: {
    temp?: { variant: 'Temp'; tempWhitespace?: WL } | { variant: 'Temporary'; temporaryWhitespace?: WL };
    tableWhitespace?: WL;
    ifNotExists?: Fragment<'IfNotExists'>;
    tableTargetWhitespace?: WL;
    tableTarget: Fragment<'SchemaItemTarget'>;
    definition:
      | { variant: 'As'; asWhitespace?: WL; selectStmtWhitespace?: WL; selectStmt: Node<'SelectStmt'> }
      | {
          variant: 'Columns';
          openParentWhitespace?: WL;
          columnDefs: NonEmptyCommaListSingle<Node<'ColumnDef'>>;
          tableConstraints?: Array<{ commaWhitespace?: WL; tableConstraintWhitespace?: WL; tableConstraint: Node<'TableConstraint'> }>;
          closeParentWhitespace?: WL;
          withoutRowId?: { withoutWhitespace?: WL; rowidWhitespace?: WL };
        };
  };
  CreateTriggerStmt: {
    temp?: { variant: 'Temp'; tempWhitespace?: WL } | { variant: 'Temporary'; temporaryWhitespace?: WL };
    triggerWhitespace?: WL;
    ifNotExists?: Fragment<'IfNotExists'>;
    triggerTargetWhitespace?: WL;
    triggerTarget: Fragment<'SchemaItemTarget'>;
    modifier?:
      | { variant: 'Before'; beforeWhitespace?: WL }
      | { variant: 'After'; afterWhitespace?: WL }
      | { variant: 'InsteadOf'; insteadWhitespace?: WL; ofWhitespace?: WL };
    action:
      | { variant: 'Delete'; deleteWhitespace?: WL }
      | { variant: 'Insert'; insertWhitespace?: WL }
      | {
          variant: 'Update';
          updateWhitespace?: WL;
          of?: { ofWhitespace?: WL; columnNames: NonEmptyCommaListSingle<Identifier> };
        };
    onWhitespace?: WL;
    tableNameWhitespace?: WL;
    tableName: Identifier;
    forEachRow?: { forWhitespace?: WL; eachWhitespace?: WL; rowWhitespace?: WL };
    when?: { whenWhitespace?: WL; exprWhitespace?: WL; expr: Expr };
    beginWhitespace?: WL;
    stmts: NonEmptyList<{ stmtWhitespace?: WL; stmt: Node<'UpdateStmt' | 'InsertStmt' | 'DeleteStmt' | 'SelectStmt'>; semicolonWhitespace?: WL }>;
    endWhitespace?: WL;
  };
  CreateViewStmt: {
    temp?: { variant: 'Temp'; tempWhitespace?: WL } | { variant: 'Temporary'; temporaryWhitespace?: WL };
    viewWhitespace?: WL;
    ifNotExists?: Fragment<'IfNotExists'>;
    viewTargetWhitespace?: WL;
    viewTarget: Fragment<'SchemaItemTarget'>;
    columnNames?: {
      openParentWhitespace?: WL;
      columnNames: NonEmptyCommaListSingle<Identifier>;
      closeParentWhitespace?: WL;
    };
    asWhitespace?: WL;
    asselectStmtWhitespace?: WL;
    asselectStmt: Node<'SelectStmt'>;
  };
  CreateVirtualTableStmt: {
    virtualWhitespace?: WL;
    tableWhitespace?: WL;
    ifNotExists?: Fragment<'IfNotExists'>;
    tableTargetWhitespace?: WL;
    tableTarget: Fragment<'SchemaItemTarget'>;
    usingWhitespace?: WL;
    moduleNameWhitespace?: WL;
    moduleName: Identifier;
    moduleArguments?: {
      openParentWhitespace?: WL;
      moduleArguments: NonEmptyCommaListSingle<Identifier>;
      closeParentWhitespace?: WL;
    };
  };
  CteTableName: {
    tableName: Identifier;
    columnNames?: {
      openParentWhitespace?: WL;
      columnNames: NonEmptyCommaListSingle<Identifier>;
      closeParentWhitespace?: WL;
    };
  };
  DeleteStmt: {
    with?: Fragment<'StmtWith'>;
    fromWhitespace?: WL;
    qualifiedTableNameWhitespace?: WL;
    qualifiedTableName: Node<'QualifiedTableName'>;
    where?: Fragment<'Where'>;
    returningClause?: { returningClauseWhitespace?: WL; returningClause: Node<'ReturningClause'> };
  };
  DeleteStmtLimited: {
    with?: Fragment<'StmtWith'>;
    fromWhitespace?: WL;
    qualifiedTableNameWhitespace?: WL;
    qualifiedTableName: Node<'QualifiedTableName'>;
    where?: Fragment<'Where'>;
    returningClause?: { returningClauseWhitespace?: WL; returningClause: Node<'ReturningClause'> };
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  DetachStmt: { database?: { databaseWhitespace?: WL }; schemeNameWhitespace?: WL; schemeName: Identifier };
  DropIndexStmt: {
    indexWhitespace?: WL;
    ifExists?: { ifWhitespace?: WL; existsWhitespace?: WL };
    indexTargetWhitespace?: WL;
    indexTarget: Fragment<'SchemaItemTarget'>;
  };
  DropTableStmt: {
    tableWhitespace?: WL;
    ifExists?: { ifWhitespace?: WL; existsWhitespace?: WL };
    tableTargetWhitespace?: WL;
    tableTarget: Fragment<'SchemaItemTarget'>;
  };
  DropTriggerStmt: {
    triggerWhitespace?: WL;
    ifExists?: { ifWhitespace?: WL; existsWhitespace?: WL };
    triggerTargetWhitespace?: WL;
    triggerTarget: Fragment<'SchemaItemTarget'>;
  };
  DropViewStmt: {
    viewWhitespace?: WL;
    ifExists?: { ifWhitespace?: WL; existsWhitespace?: WL };
    viewTargetWhitespace?: WL;
    viewTarget: Fragment<'SchemaItemTarget'>;
  };
  FactoredSelectStmt: {
    with?: Fragment<'StmtWith'>;
    firstSelect: Node<'SelectCore'>;
    compoundSelects?: Array<{
      compoundOperatorWhitespace?: WL;
      compoundOperator: Node<'CompoundOperator'>;
      selectWhitespace?: WL;
      select: Node<'SelectCore'>;
    }>;
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  FilterClause: { openParentWhitespace?: WL; whereWhitespace?: WL; exprWhitespace?: WL; expr: Expr; closeParentWhitespace?: WL };
  ForeignKeyClause: {
    foreignTableWhitespace?: WL;
    foreignTable: Identifier;
    columnNames?: {
      openParentWhitespace?: WL;
      columnsNames: NonEmptyCommaListSingle<Identifier>;
      closeParentWhitespace?: WL;
    };
    items: Array<
      | {
          variant: 'On';
          onWhitespace?: WL;
          event: { variant: 'Delete'; deleteWhitespace?: WL } | { varient: 'Update'; updateWhitespace?: WL };
          action:
            | { variant: 'SetNull'; setWhitespace?: WL; nullWhitespace?: WL }
            | { variant: 'SetDefault'; setWhitespace?: WL; defaultWhitespace?: WL }
            | { variant: 'Cascade'; cascadeWhitespace?: WL }
            | { variant: 'Restrict'; restrictWhitespace?: WL }
            | { variant: 'NoAction'; noWhitespace?: WL; actionWhitespace?: WL };
        }
      | { variant: 'Match'; matchWhitespace?: WL; nameWhitespace?: WL; name: Identifier }
    >;
    deferrable?: {
      not?: { notWhitespace?: WL };
      deferrableWhitespace?: WL;
      initially?: { initiallyWhitespace?: WL; inner: { variant: 'Deferred'; deferredWhitespace?: WL } | { variant: 'Immediate'; immediateWhitespace?: WL } };
    };
  };
  FrameSpec: {
    type: { variant: 'Range' } | { variant: 'Rows' } | { variant: 'Groups' };
    inner:
      | { varient: 'Between'; betweenWhitespace?: WL; left: Fragment<'FrameSpecBetweenItem'>; andWhitespace?: WL; right: Fragment<'FrameSpecBetweenItem'> }
      | { varient: 'UnboundedPreceding'; unboundedWhitespace?: WL; precedingWhitespace?: WL }
      | { varient: 'Preceding'; exprWhitespace?: WL; expr: Expr; precedingWhitespace?: WL }
      | { varient: 'CurrentRow'; currentWhitespace?: WL; rowWhitespace?: WL };
    exclude?: {
      excludeWhitespace?: WL;
      inner:
        | { variant: 'NoOther'; noWhitespace?: WL; otherWhitespace?: WL }
        | { variant: 'CurrentRow'; currentWhitespace?: WL; rowWhitespace?: WL }
        | { variant: 'Group'; groupWhitespace?: WL }
        | { variant: 'Ties'; tiesWhitespace?: WL };
    };
  };
  IndexedColumn: {
    column: { variant: 'Name'; columnName: Identifier } | { variant: 'Expr'; expr: Expr };
    collate?: Fragment<'CollationName'>;
    order?: Fragment<'IndexedColumnOrder'>;
  };
  InsertStmt: {
    with?: Fragment<'StmtWith'>;
    method:
      | { variant: 'ReplaceInto'; replaceWhitespace?: WL; intoWhitespace?: WL }
      | {
          variant: 'InsertInto';
          insertWhitespace?: WL;
          or?: {
            orWhitespace?: WL;
            inner:
              | { variant: 'Abort'; abortWhitespace?: WL }
              | { variant: 'Fail'; failWhitespace?: WL }
              | { variant: 'Ignore'; ignoreWhitespace?: WL }
              | { variant: 'Replace'; replaceWhitespace?: WL }
              | { variant: 'Rollback'; rollbackWhitespace?: WL };
          };
          intoWhitespace?: WL;
        };
    tableTargetWhitespace?: WL;
    tableTarget: Fragment<'SchemaItemTarget'>;
    alias?: { asWhitespace?: WL; aliasWhitespace?: WL; alias: Identifier };
    columnNames?: {
      openParentWhitespace?: WL;
      columnNames: NonEmptyCommaListSingle<Identifier>;
      closeParentWhitespace?: WL;
    };
    values:
      | {
          variant: 'Values';
          valuesWhitespace?: WL;
          values: NonEmptyCommaList<{
            openParentWhitespace?: WL;
            exprs: NonEmptyCommaListSingle<Expr>;
            closeParentWhitespace?: WL;
          }>;
          upsertClause?: { upsertClauseWhitespace?: WL; upsertClause: Node<'UpsertClause'> };
        }
      | {
          variant: 'Select';
          selectStmtWhitespace?: WL;
          selectStmt: Node<'SelectStmt'>;
          upsertClause?: { upsertClauseWhitespace?: WL; upsertClause: Node<'UpsertClause'> };
        }
      | { variant: 'DefaultValues'; defaultWhitespace?: WL; valuesWhitespace?: WL };
    returningClause?: { returningClauseWhitespace?: WL; returningClause: Node<'ReturningClause'> };
  };
  JoinClause: {
    tableOrSubquery: Node<'TableOrSubquery'>;
    join?: NonEmptyList<{
      joinOperatorWhitespace?: WL;
      joinOperator: Node<'JoinOperator'>;
      tableOrSubqueryWhitespace?: WL;
      tableOrSubquery: Node<'TableOrSubquery'>;
      joinConstraintWhitespace?: WL;
      joinConstraint: Node<'JoinConstraint'>;
    }>;
  };
  JoinConstraint:
    | { variant: 'Empty' }
    | { variant: 'On'; onWhitespace?: WL; exprWhitespace?: WL; expr: Expr }
    | {
        variant: 'Using';
        usingWhitespace?: WL;
        openParentWhitespace?: WL;
        columnNames: NonEmptyCommaListSingle<Identifier>;
        closeParentWhitespace?: WL;
      };
  JoinOperator:
    | { variant: 'Comma' }
    | {
        variant: 'Join';
        natural?: { whitespaceAfter?: WL };
        joinType:
          | { variant: 'Left'; whitespaceAfter?: WL; outer?: { whitespaceAfter?: WL } }
          | { variant: 'Inner'; whitespaceAfter?: WL }
          | { variant: 'Cross'; whitespaceAfter?: WL };
      };
  OrderingTerm: {
    expr: Expr;
    collate?: Fragment<'CollationName'>;
    order?: { variant: 'Asc'; ascWhitespace?: WL } | { variant: 'Desc'; descWhitespace?: WL };
    nulls?: { variant: 'NullsFirst'; nullsWhitespace?: WL; firstWhitespace?: WL } | { variant: 'NullsLast'; nullsWhitespace?: WL; lastWhitespace?: WL };
  };
  OverClause: {
    inner:
      | { variant: 'WindowName'; windowNameWhitespace?: WL; windowName: Identifier }
      | { variant: 'EmptyParenthesis'; openParentWhitespace?: WL; closeParentWhitespace?: WL }
      | {
          variant: 'Window';
          openParentWhitespace?: WL;
          inner: AtLeastOneKey<Fragment<'OverClauseInner'>>;
          closeParentWhitespace?: WL;
        };
  };
  PragmaStmt: {
    pragmaTargetWhitespace?: WL;
    pragmaTarget: Fragment<'SchemaItemTarget'>;
    inner?:
      | { variant: 'Equal'; equalWhitespace?: WL; pragmaValueWhitespace?: WL; pragmaValue: Node<'PragmaValue'> }
      | { variant: 'Call'; openParentWhitespace?: WL; pragmaValueWhitespace?: WL; pragmaValue: Node<'PragmaValue'>; closeParentWhitespace?: WL };
  };
  PragmaValue: { value: Node<'SignedNumber' | 'StringLiteral'> }; // | 'SignedLiteral' What is a signedLiteral ??
  QualifiedTableName: {
    tableTarget: Fragment<'SchemaItemTarget'>;
    alias?: { asWhitespace?: WL; aliasWhitespace?: WL; alias: Identifier };
    inner?:
      | { variant: 'IndexedBy'; indexedWhitespace?: WL; byWhitespace?: WL; indexNameWhitespace?: WL; indexName: Identifier }
      | { variant: 'NotIndexed'; notWhitespace?: WL; indexedWhitespace?: WL };
  };
  RaiseFunction: {
    opentParentWhitespace?: WL;
    innerWhitespace?: WL;
    inner:
      | { variant: 'Ignore' }
      | { variant: 'Rollback'; commaWhitespace?: WL; errorMessageWhitespace?: WL; errorMessage: Node<'StringLiteral'> }
      | { variant: 'Abort'; commaWhitespace?: WL; errorMessageWhitespace?: WL; errorMessage: Node<'StringLiteral'> }
      | { variant: 'Fail'; commaWhitespace?: WL; errorMessageWhitespace?: WL; errorMessage: Node<'StringLiteral'> };
    closeParentWhitespace?: WL;
  };
  RecursiveCte: {
    cteTableName: Node<'CteTableName'>;
    asWhitespace?: WL;
    openParentWhitespace?: WL;
    initialSelectWhitespace?: WL;
    // TODO: Fix this type
    initialSelect: any;
    union: { variant: 'Union'; unionWhitespace?: WL } | { variant: 'UnionAll'; unionWhitespace?: WL; allWhitespace?: WL };
    recursiveSelectWhitespace?: WL;
    // TODO: Fix this type
    recursiveSelect: any;
    closeParentWhitespace?: WL;
  };
  ReindexStmt: {
    inner?:
      | { variant: 'CollationName'; collationNameWhitespace?: WL; collationName: Identifier }
      | { variant: 'Table'; tableWhitespace?: WL; tableTarget: Fragment<'SchemaItemTarget'> }
      | { variant: 'Index'; indexWhitespace?: WL; indexTarget: Fragment<'SchemaItemTarget'> };
  };
  ReleaseStmt: { savepoint?: { savepointWhitespace?: WL }; savepointNameWhitespace?: WL; savepointName: Identifier };
  ResultColumn:
    | { variant: 'Star' }
    | { variant: 'TableStar'; tableName: Identifier; dotWhitespace?: WL; starWhitespace?: WL }
    | { variant: 'Expr'; expr: Expr; alias?: { as?: { asWhitespace?: WL }; columnAliasWhitespace?: WL; columnAlias: Identifier } };
  ReturningClause: {
    items: NonEmptyCommaList<
      | { variant: 'Star'; starWhitespace?: WL }
      | { variant: 'Expr'; exprWhitespace?: WL; expr: Expr; alias?: { as?: { asWhitespace?: WL }; columnAliasWhitespace?: WL; columnAlias: Identifier } }
    >;
  };
  RollbackStmt: {
    transaction?: { transactionWhitespace?: WL };
    to?: { toWhitespace?: WL; savepoint?: { savepointWhitespace?: WL }; savepointNameWhitespace?: WL; savepointName: Identifier };
  };
  SavepointStmt: { savepointNameWhitespace?: WL; savepointName: Identifier };
  SelectCore:
    | {
        variant: 'Select';
        distinct?: { variant: 'Distinct'; distinctWhitespace?: WL } | { variant: 'All'; allWhitespace?: WL };
        resultColumns: NonEmptyCommaListSingle<Node<'ResultColumn'>>;
        from?: {
          fromWhitespace?: WL;
          inner:
            | { variant: 'TableOrSubquery'; tableOrSubqueries: NonEmptyCommaListSingle<Node<'TableOrSubquery'>> }
            | { variant: 'Join'; joinClauseWhitespace?: WL; joinClause: Node<'JoinClause'> };
        };
        where?: Fragment<'Where'>;
        groupBy?: {
          groupWhitespace?: WL;
          byWhitespace?: WL;
          exprWhitespace?: WL;
          exprs: NonEmptyCommaListSingle<Expr>;
          having?: { havingWhitespace?: WL; exprWhitespace?: WL; expr: Expr };
        };
        window?: {
          windowWhitespace?: WL;
          windows: NonEmptyCommaList<{ windowNameWhitespace?: WL; windowName: Identifier; asWhitespace?: WL; windowDefn: Node<'WindowDefn'> }>;
        };
      }
    | {
        variant: 'Values';
        values: NonEmptyCommaList<{
          openParentWhitespace?: WL;
          items: NonEmptyCommaListSingle<Expr>;
          closeParentWhitespace?: WL;
        }>;
      };
  SelectStmt: {
    with?: Fragment<'StmtWith'>;
    firstSelect: Node<'SelectCore'>;
    compoundSelects?: Array<{
      compoundOperatorWhitespace?: WL;
      compoundOperator: Node<'CompoundOperator'>;
      selectWhitespace?: WL;
      select: Node<'SelectCore'>;
    }>;
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  SignedNumber: {
    sign?: { variant: 'Plus'; whitespaceAfter?: WL } | { variant: 'Minus'; whitespaceAfter?: WL };
    numericLiteral: Node<'NumericLiteral'>;
  };
  SimpleFunctionInvocation: {
    simpleFunc: Identifier;
    openParentWhitespace?: WL;
    parameters?: { variant: 'Star'; starWhitespace?: WL } | { variant: 'Exprs'; exprs: NonEmptyCommaListSingle<Expr> };
    closeParentWhitespace?: WL;
  };
  SimpleSelectStmt: { with?: Fragment<'StmtWith'>; selects: Node<'SelectCore'>; orderBy?: Fragment<'OrderBy'>; limit?: Fragment<'Limit'> };
  SqlStmt: {
    explain?: Fragment<'SqlStmtExplain'>;
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
  SqlStmtList: { items: Array<Fragment<'SqlStmtListItem'>> };
  TableConstraint: {
    constraintName?: { constraintNameWhitespace?: WL; constraintName: Identifier };
    inner:
      | {
          variant: 'PrimaryKey';
          primaryWhitespace?: WL;
          keyWhitespace?: WL;
          openParentWhitespace?: WL;
          indexedColumns: NonEmptyCommaListSingle<Node<'IndexedColumn'>>;
          closeParentWhitespace?: WL;
          conflictClauseWhitespace?: WL;
          conflictClause: Node<'ConflictClause'>;
        }
      | {
          variant: 'Unique';
          uniqueWhitespace?: WL;
          openParentWhitespace?: WL;
          indexedColumns: NonEmptyCommaListSingle<Node<'IndexedColumn'>>;
          closeParentWhitespace?: WL;
          conflictClauseWhitespace?: WL;
          conflictClause: Node<'ConflictClause'>;
        }
      | { variant: 'Check'; checkWhitespace?: WL; openParentWhitespace?: WL; exprWhitespace?: WL; expr: Expr; closeParentWhitespace?: WL }
      | {
          variant: 'ForeignKey';
          foreignWhitespace?: WL;
          keyWhitespace?: WL;
          openParentWhitespace?: WL;
          columnNames: NonEmptyCommaListSingle<Identifier>;
          closeParentWhitespace?: WL;
          foreignKeyClauseWhitespace?: WL;
          foreignKeyClause: Node<'ForeignKeyClause'>;
        };
  };
  TableOrSubquery:
    | {
        variant: 'Table';
        tableTarget: Fragment<'SchemaItemTarget'>;
        alias?: { as?: { asWhitespace?: WL }; tableAliasWhitespace?: WL; tableAlias: Identifier };
        inner?:
          | { variant: 'NotIndexed'; indexedWhitespace?: WL; notWhitespace?: WL }
          | { variant: 'IndexedBy'; indexedWhitespace?: WL; byWhitespace?: WL; indexNameWhitespace?: WL; indexName: Identifier };
      }
    | {
        variant: 'TableFunctionInvocation';
        functionTarget: Fragment<'SchemaItemTarget'>;
        openParentWhitespace?: WL;
        parameters: NonEmptyCommaListSingle<Expr>;
        closeParentWhitespace?: WL;
        alias?: { as?: { asWhitespace?: WL }; tableAliasWhitespace?: WL; tableAlias: Identifier };
      }
    | {
        variant: 'Select';
        openParentWhitespace?: WL;
        selectStmtWhitespace?: WL;
        selectStmt: Node<'SelectStmt'>;
        closeParentWhitespace?: WL;
        alias?: { as?: { asWhitespace?: WL }; tableAliasWhitespace?: WL; tableAlias: Identifier };
      }
    | {
        variant: 'TableOrSubqueries';
        openParentWhitespace?: WL;
        tableOrSubqueries: NonEmptyCommaListSingle<Node<'TableOrSubquery'>>;
        closeParentWhitespace?: WL;
      }
    | { variant: 'Join'; openParentWhitespace?: WL; joinClauseWhitespace?: WL; joinClause: Node<'JoinClause'>; closeParentWhitespace?: WL };
  TypeName: {
    firstName: Node<'SingleTypeName'>;
    names?: Array<{ nameWhitespace?: WL; name: Node<'SingleTypeName'> }>;
    size?: {
      openParentWhitespace?: WL;
      firstWhitespace?: WL;
      first: Node<'SignedNumber'>;
      second?: { commaWhitespace?: WL; secondWhitespace?: WL; second: Node<'SignedNumber'> };
      closeParentWhitespace?: WL;
    };
  };
  UpdateStmt: {
    with?: Fragment<'StmtWith'>;
    or?: Fragment<'UpdateOr'>;
    qualifiedTableNameWhitespace?: WL;
    qualifiedTableName: Node<'QualifiedTableName'>;
    setWhitespace?: WL;
    setItems: Fragment<'UpdateSetItems'>;
    from?: Fragment<'UpdateFrom'>;
    where?: Fragment<'Where'>;
    returningClause?: { returningClauseWhitespace?: WL; returningClause: Node<'ReturningClause'> };
  };
  UpdateStmtLimited: {
    with?: Fragment<'StmtWith'>;
    or?: Fragment<'UpdateOr'>;
    qualifiedTableNameWhitespace?: WL;
    qualifiedTableName: Node<'QualifiedTableName'>;
    setWhitespace?: WL;
    setItems: Fragment<'UpdateSetItems'>;
    from?: Fragment<'UpdateFrom'>;
    where?: {
      whereWhitespace?: WL;
      exprWhitespace?: WL;
      expr: Expr;
      returningClause?: { returningClauseWhitespace?: WL; returningClause: Node<'ReturningClause'> };
    };
    orderBy?: Fragment<'OrderBy'>;
    limit?: Fragment<'Limit'>;
  };
  UpsertClause: {
    items: NonEmptyList<{
      conflictWhitespace?: WL;
      conflictTarget?: {
        openParentWhitespace?: WL;
        indexedColumns: NonEmptyCommaListSingle<Node<'IndexedColumn'>>;
        closeParentWhitespace?: WL;
        where?: Fragment<'Where'>;
      };
      doWhitespace?: WL;
      inner:
        | { variant: 'Nothing'; nothingWhitespace?: WL }
        | {
            variant: 'UpdateSet';
            updateWhitespace?: WL;
            setWhitespace?: WL;
            setItems: Fragment<'UpdateSetItems'>;
            where?: Fragment<'Where'>;
          };
    }>;
  };
  VacuumStmt: {
    schemaName?: { schemaName: Identifier; schemaNameWhitespace?: WL };
    into?: { intoWhitespace?: WL; filenameWhitespace?: WL; filename: Node<'StringLiteral'> };
  };
  WindowDefn: {
    baseWindowName?: { baseWindowNameWhitespace?: WL; baseWindowName: Identifier };
    partitionBy?: { partitionWhitespace?: WL; byWhitespace?: WL; exprsWhitespace?: WL; exprs: NonEmptyCommaListSingle<Expr> };
    orderBy?: Fragment<'OrderBy'>;
    frameSpec?: { frameSpecWhitespace?: WL; frameSpec: Node<'FrameSpec'> };
    closeParentWhitespace?: WL;
  };
  WindowFunctionInvocation: {
    windowFunc: Identifier;
    openParentWhitespace?: WL;
    parameters?: { variant: 'Star'; starWhitespace?: WL } | { variant: 'Exprs'; exprs: NonEmptyCommaListSingle<Expr> };
    closeParentWhitespace?: WL;
    filterClause?: { filterClauseWhitespace?: WL; filterClause: Node<'FilterClause'> };
    overWhitespace?: WL;
    over:
      | { variant: 'WindowDefn'; windowDefnWhitespace?: WL; windowDefn: Node<'WindowDefn'> }
      | { variant: 'WindowName'; windowNameWhitespace?: WL; windowName: Identifier };
  };
  WithClause: {
    recursive?: { recursiveWhitespace?: WL };
    items: NonEmptyCommaList<{
      cteTableNameWhitespace?: WL;
      cteTableName: Node<'CteTableName'>;
      asWhitespace?: WL;
      materialized?: { variant: 'NotMaterialized'; notWhitespace?: WL; materializedWhitespace?: WL } | { variant: 'Materialized'; materializedWhitespace?: WL };
      openParentWhitespace?: WL;
      selectWhitespace?: WL;
      select: Node<'SelectStmt'>;
      closeParentWhitespace?: WL;
    }>;
  };
  // Not in SQLite diagrams
  // These Node are composed into Expr
  Column: { tableTarget?: Fragment<'SchemaItemTarget'>; columnName: Identifier };
  Select: { exists?: Fragment<'SelectExists'>; selectStmtWhitespace?: WL; selectStmt: Node<'SelectStmt'>; closeParentWhitespace?: WL };
  FunctionInvocation: {
    functionName: Identifier;
    openParentWhitespace?: WL;
    parameters?:
      | { variant: 'Star'; starWhitespace?: WL }
      | { variant: 'Parameters'; distinct?: { distinctWhitespace?: WL }; exprs: NonEmptyCommaListSingle<Expr> };
    closeParentWhitespace?: WL;
    filterClause?: { filterClauseWhitespace?: WL; filterClause: Node<'FilterClause'> };
    overClause?: { overClauseWhitespace?: WL; overClause: Node<'OverClause'> };
  };
  Parenthesis: { exprs: NonEmptyCommaListSingle<Expr>; closeParentWhitespace?: WL };
  CastAs: {
    openParentWhitespace?: WL;
    exprWhitespace?: WL;
    expr: Expr;
    asWhitespace?: WL;
    typeNameWhitespace?: WL;
    typeName: Node<'TypeName'>;
    closeParentWhitespace?: WL;
  };
  Case: {
    expr?: { exprWhitespace?: WL; expr?: Expr };
    cases: NonEmptyList<Fragment<'CaseItem'>>;
    else?: { elseWhitespace?: WL; exprWhitespace?: WL; expr: Expr };
    endWhitespace?: WL;
  };
  // Used to compose LiteralValue
  Null: {};
  True: {};
  False: {};
  CurrentTime: {};
  CurrentDate: {};
  CurrentTimestamp: {};
  // Other
  Identifier: Fragment<'IdentifierBasic' | 'IdentifierBrackets' | 'IdentifierDoubleQuote' | 'IdentifierBacktick'>;
  Whitespace: { content: string };
  StringLiteral: { content: string };
  BlobLiteral: { content: string; xCase: 'lowercase' | 'uppercase' };
  SingleTypeName: { type: string };
  NumericLiteral: Fragment<'NumericLiteralInteger' | 'NumericLiteralFloat' | 'NumericLiteralHex'>;
  BindParameter:
    | { variant: 'Indexed' }
    | { variant: 'Numbered'; number: number }
    | { variant: 'AtNamed'; name: string; suffix?: string }
    | { variant: 'ColonNamed'; name: string; suffix?: string }
    | { variant: 'DollarNamed'; name: string; suffix?: string };

  BitwiseNegation: { exprWhitespace?: WL; expr: Fragment<'ExprP12'> };
  Plus: { exprWhitespace?: WL; expr: Fragment<'ExprP12'> };
  Minus: { exprWhitespace?: WL; expr: Fragment<'ExprP12'> };

  Collate: { expr: Fragment<'ExprP11'>; collateWhitespace?: WL; collationNameWhitespace?: WL; collationName: Identifier };

  Concatenate: { leftExpr: Fragment<'ExprP10'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP10'> };

  Multiply: { leftExpr: Fragment<'ExprP09'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP09'> };
  Divide: { leftExpr: Fragment<'ExprP09'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP09'> };
  Modulo: { leftExpr: Fragment<'ExprP09'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP09'> };

  Add: { leftExpr: Fragment<'ExprP08'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP08'> };
  Subtract: { leftExpr: Fragment<'ExprP08'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP08'> };

  BitwiseAnd: { leftExpr: Fragment<'ExprP07'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP07'> };
  BitwiseOr: { leftExpr: Fragment<'ExprP07'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP07'> };
  BitwiseShiftLeft: { leftExpr: Fragment<'ExprP07'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP07'> };
  BitwiseShiftRight: { leftExpr: Fragment<'ExprP07'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP07'> };

  Escape: { exprWhitespace?: WL; expr: Fragment<'ExprP06'> };

  GreaterThan: { leftExpr: Fragment<'ExprP05'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP05'> };
  LowerThan: { leftExpr: Fragment<'ExprP05'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP05'> };
  GreaterOrEqualThan: { leftExpr: Fragment<'ExprP05'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP05'> };
  LowerOrEqualThan: { leftExpr: Fragment<'ExprP05'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP05'> };

  Equal: { leftExpr: Fragment<'ExprP04'>; operator: '==' | '='; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP04'> };
  Different: { leftExpr: Fragment<'ExprP04'>; operator: '!=' | '<>'; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP04'> };
  Is: { leftExpr: Fragment<'ExprP04'>; isWhitespace?: WL; rightWhitespace?: WL; rightExpr: Fragment<'ExprP04'> };
  IsNot: { leftExpr: Fragment<'ExprP04'>; isWhitespace?: WL; notWhitespace?: WL; rightWhitespace?: WL; rightExpr: Fragment<'ExprP04'> };
  Between: {
    expr: Fragment<'ExprP04'>;
    not?: { notWhitespace?: WL };
    betweenWhitespace?: WL;
    betweenExprWhitespace?: WL;
    betweenExpr: Fragment<'ExprP04'>;
    andWhitespace?: WL;
    andExprWhitespace?: WL;
    andExpr: Fragment<'ExprP04'>;
  };
  In: {
    expr: Fragment<'ExprP04'>;
    not?: { notWhitespace?: WL };
    inWhitespace?: WL;
    values: Fragment<'InValues'>;
  };
  Match: { leftExpr: Fragment<'ExprP04'>; not?: { notWhitespace?: WL }; opWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP04'> };
  Like: {
    leftExpr: Fragment<'ExprP04'>;
    not?: { notWhitespace?: WL };
    opWhitespace?: WL;
    rightExprWhitespace?: WL;
    rightExpr: Fragment<'ExprP04'>;
    escape?: { escapeWhitespace?: WL; escape: Node<'Escape'> };
  };
  Regexp: { leftExpr: Fragment<'ExprP04'>; not?: { notWhitespace?: WL }; opWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP04'> };
  Glob: { leftExpr: Fragment<'ExprP04'>; not?: { notWhitespace?: WL }; opWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP04'> };
  IsNull: { expr: Fragment<'ExprP04'>; isNullWhitespace?: WL };
  NotNull: { expr: Fragment<'ExprP04'>; notNullWhitespace?: WL };
  Not_Null: { expr: Fragment<'ExprP04'>; notWhitespace?: WL; nullWhitespace?: WL };

  Not: { exprWhitespace?: WL; expr: Fragment<'ExprP03'> };

  And: { leftExpr: Fragment<'ExprP02'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP02'> };

  Or: { leftExpr: Fragment<'ExprP01'>; operatorWhitespace?: WL; rightExprWhitespace?: WL; rightExpr: Fragment<'ExprP01'> };
};

function createFragmentsObject<P extends { [K in FragmentName]: boolean }>(data: P): P {
  return data;
}

export const FRAGMENTS_OBJ = createFragmentsObject({
  AggregateFunctionInvocationParamters: true,
  AlterTableStmtAction: true,
  AnalyzeStmtInner: true,
  BeginStmtMode: true,
  BindParameterAtNamed: true,
  BindParameterColonNamed: true,
  BindParameterDollarNamed: true,
  BindParameterIndexed: true,
  BindParameterNumbered: true,
  CollationName: true,
  ColumnConstraintConstraint: true,
  Exponent: true,
  Expr: true,
  FrameSpecBetweenItem: true,
  IdentifierBacktick: true,
  IdentifierBasic: true,
  IdentifierBrackets: true,
  IdentifierDoubleQuote: true,
  IfNotExists: true,
  IndexedColumnOrder: true,
  Limit: true,
  LiteralValue: true,
  MultilineComment: true,
  NumericLiteralFloat: true,
  NumericLiteralHex: true,
  NumericLiteralInteger: true,
  OrderBy: true,
  ParameterName: true,
  SchemaItemTarget: true,
  SelectExists: true,
  SingleLineComment: true,
  SqlStmtExplain: true,
  SqlStmtListItem: true,
  StmtWith: true,
  UpdateFrom: true,
  UpdateOr: true,
  UpdateSetItems: true,
  Where: true,
  WhitespaceLike: true,
  ExprP01: false,
  ExprP02: false,
  ExprP03: false,
  ExprP04: false,
  ExprP05: false,
  ExprP06: false,
  ExprP07: false,
  ExprP08: false,
  ExprP09: false,
  ExprP10: false,
  ExprP11: false,
  ExprP12: false,
  ExprP13: false,
  InValues: true,
  InValuesList: true,
  InValueTableFunctionInvocation: true,
  InValuesTableName: true,
  CaseItem: true,
  ExprBase: true,
  ExprChainItem: true,
  ExprChainItemAdd: true,
  ExprChainItemAnd: true,
  ExprChainItemBitwiseAnd: true,
  ExprChainItemBitwiseOr: true,
  ExprChainItemBitwiseShiftLeft: true,
  ExprChainItemBitwiseShiftRight: true,
  ExprChainItemCollate: true,
  ExprChainItemConcatenate: true,
  ExprChainItemDifferent: true,
  ExprChainItemDivide: true,
  ExprChainItemEqual: true,
  ExprChainItemEscape: true,
  ExprChainItemGlob: true,
  ExprChainItemGreaterOrEqualThan: true,
  ExprChainItemGreaterThan: true,
  ExprChainItemIs: true,
  ExprChainItemIsNot: true,
  ExprChainItemIsNull: true,
  ExprChainItemLike: true,
  ExprChainItemLowerOrEqualThan: true,
  ExprChainItemLowerThan: true,
  ExprChainItemMatch: true,
  ExprChainItemModulo: true,
  ExprChainItemMultiply: true,
  ExprChainItemNotNull: true,
  ExprChainItemNot_Null: true,
  ExprChainItemOr: true,
  ExprChainItemRegexp: true,
  ExprChainItemSubtract: true,
  ExprChainItemBetween: true,
  ExprChainItemIn: true,
  ExprChainItemNot: true,
  OverClauseInner: false,
  OverClauseOrderBy: true,
  OverClausePartitionBy: true,
});

function createNodesObject<P extends { [K in NodeKind]: boolean }>(data: P): P {
  return data;
}

export const NODES_OBJ = createNodesObject({
  Add: false,
  AggregateFunctionInvocation: true,
  AlterTableStmt: true,
  AnalyzeStmt: true,
  And: false,
  AttachStmt: true,
  BeginStmt: true,
  Between: false,
  BindParameter: true,
  BitwiseAnd: true,
  BitwiseNegation: true,
  BitwiseOr: false,
  BitwiseShiftLeft: false,
  BitwiseShiftRight: false,
  BlobLiteral: true,
  Case: true,
  CastAs: true,
  Collate: false,
  Column: true,
  ColumnConstraint: true,
  ColumnDef: true,
  ColumnNameList: true,
  CommentSyntax: true,
  CommitStmt: true,
  CommonTableExpression: true,
  CompoundOperator: true,
  CompoundSelectStmt: true,
  Concatenate: false,
  ConflictClause: true,
  CreateIndexStmt: true,
  CreateTableStmt: true,
  CreateTriggerStmt: true,
  CreateViewStmt: true,
  CreateVirtualTableStmt: true,
  CteTableName: true,
  CurrentDate: true,
  CurrentTime: true,
  CurrentTimestamp: true,
  DeleteStmt: true,
  DeleteStmtLimited: true,
  DetachStmt: true,
  Different: false,
  Divide: false,
  DropIndexStmt: true,
  DropTableStmt: true,
  DropTriggerStmt: true,
  DropViewStmt: true,
  Equal: false,
  Escape: false,
  FactoredSelectStmt: true,
  False: true,
  FilterClause: true,
  ForeignKeyClause: true,
  FrameSpec: true,
  FunctionInvocation: true,
  Glob: false,
  GreaterOrEqualThan: false,
  GreaterThan: false,
  Identifier: true,
  In: false,
  IndexedColumn: true,
  InsertStmt: true,
  Is: false,
  IsNot: false,
  IsNull: false,
  JoinClause: true,
  JoinConstraint: true,
  JoinOperator: true,
  Like: false,
  LowerOrEqualThan: false,
  LowerThan: false,
  Match: false,
  Minus: true,
  Modulo: false,
  Multiply: false,
  Not_Null: false,
  Not: false,
  NotNull: false,
  Null: true,
  NumericLiteral: true,
  Or: false,
  OrderingTerm: true,
  OverClause: true,
  Parenthesis: true,
  Plus: true,
  PragmaStmt: true,
  PragmaValue: true,
  QualifiedTableName: true,
  RaiseFunction: true,
  RecursiveCte: true,
  Regexp: false,
  ReindexStmt: true,
  ReleaseStmt: true,
  ResultColumn: true,
  ReturningClause: true,
  RollbackStmt: true,
  SavepointStmt: true,
  Select: true,
  SelectCore: true,
  SelectStmt: true,
  SignedNumber: true,
  SimpleFunctionInvocation: true,
  SimpleSelectStmt: true,
  SingleTypeName: true,
  SqlStmt: true,
  SqlStmtList: true,
  StringLiteral: true,
  Subtract: false,
  TableConstraint: true,
  TableOrSubquery: true,
  True: true,
  TypeName: true,
  UpdateStmt: true,
  UpdateStmtLimited: true,
  UpsertClause: true,
  VacuumStmt: true,
  Whitespace: true,
  WindowDefn: true,
  WindowFunctionInvocation: true,
  WithClause: true,
});

export type FragmentName = keyof Fragments;

export type Fragment<K extends FragmentName> = Fragments[K];

export type NodeKind = keyof NodeData;

export type NodeBase<K extends NodeKind = NodeKind> = { kind: K };

export type NodeDataFull = { [K in keyof NodeData]: NodeData[K] & NodeBase<K> };

export type Node<K extends NodeKind = NodeKind> = NodeDataFull[K];

export const NODES = Object.keys(NODES_OBJ) as Array<NodeKind>;

export function isValidNodeKind(kind: unknown): boolean {
  return Boolean(kind && typeof kind === 'string' && NODES.includes(kind as any));
}

type WL = Fragment<'WhitespaceLike'>;

export const LiteralValue = combine(
  'NumericLiteral',
  'StringLiteral',
  'BlobLiteral',
  'Null',
  'True',
  'False',
  'CurrentTime',
  'CurrentDate',
  'CurrentTimestamp'
);
export type LiteralValue = typeof LiteralValue['__type'];

// const Expr = combine(
//   ...LiteralValue.kinds,
//   'BindParameter',
//   'Column',
//   'Select',
//   'BitwiseNegation',
//   'Plus',
//   'Minus',
//   'Concatenate',
//   'Multiply',
//   'Divide',
//   'Modulo',
//   'Add',
//   'Subtract',
//   'BitwiseAnd',
//   'BitwiseOr',
//   'BitwiseShiftLeft',
//   'BitwiseShiftRight',
//   'GreaterThan',
//   'LowerThan',
//   'GreaterOrEqualThan',
//   'LowerOrEqualThan',
//   'Equal',
//   'Different',
//   'FunctionInvocation',
//   'Parenthesis',
//   'CastAs',
//   'Collate',
//   'Match',
//   'Like',
//   'Glob',
//   'Regexp',
//   'IsNull',
//   'NotNull',
//   'Not_Null',
//   'Is',
//   'IsNot',
//   'Between',
//   'In',
//   'Case',
//   'RaiseFunction',
//   'Or',
//   'And'
// );

// Type aliases
export type Expr = Fragment<'Expr'>;
export type Identifier = Node<'Identifier'>;

// function nodeIsOneOf<T extends NodeKind>(node: NodeBase, kinds: ReadonlyArray<T>): node is Node<T> {
//   return kinds.includes(node.kind as any);
// }

// export const NodeIsInternal: { oneOf: typeof nodeIsOneOf } & {
//   [K in NodeKind]: (node: NodeBase) => node is Node<K>;
// } = NODES.reduce<any>(
//   (acc, key) => {
//     acc[key] = (node: Node) => node.kind === key;
//     return acc;
//   },
//   { oneOf: nodeIsOneOf }
// );

// export const NodeIs = {
//   ...NodeIsInternal,
//   LiteralValue,
//   // Expr,
// };

type NodeTypeFromArray<T extends ReadonlyArray<NodeKind>> = Node<T[number]>;

function combine<T extends ReadonlyArray<NodeKind>>(
  ...kinds: T
): {
  (node: NodeBase): node is NodeTypeFromArray<T>;
  kinds: T;
  __type: NodeTypeFromArray<T>;
} {
  const fn = ((node: Node) => kinds.includes(node.kind)) as any;
  fn.kinds = kinds;
  return fn;
}
