import * as n from "../Node.ts";
import type { AnyOperator } from "../Operator.ts";
import { OperatorPrecedence } from "../Operator.ts";
import type { NonEmptyArray } from "../Utils.ts";
import { identifier } from "./Expr.ts";
import { nullLiteral } from "./Literal.ts";
import type { ValidTypeName } from "./TypeName.ts";
import { build as buildTypeName } from "./TypeName.ts";

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export function or(leftExpr: Exp, rightExpr: Exp): Node<"Or"> {
  return n.createNode("Or", {
    leftExpr: ensurePrecedence(leftExpr, "Or"),
    rightExpr: ensurePrecedence(rightExpr, "Or"),
  });
}

export function and(leftExpr: Exp, rightExpr: Exp): Node<"And"> {
  return n.createNode("And", {
    leftExpr: ensurePrecedence(leftExpr, "And"),
    rightExpr: ensurePrecedence(rightExpr, "And"),
  });
}

export function not(expr: Exp): Node<"Not"> {
  return n.createNode("Not", { expr: ensurePrecedence(expr, "Not") });
}

export function equal(leftExpr: Exp, rightExpr: Exp): Node<"Equal"> {
  return n.createNode("Equal", {
    operator: "==",
    leftExpr: ensurePrecedence(leftExpr, "Equal"),
    rightExpr: ensurePrecedence(rightExpr, "Equal"),
  });
}

export function different(leftExpr: Exp, rightExpr: Exp): Node<"Different"> {
  return n.createNode("Different", {
    operator: "!=",
    leftExpr: ensurePrecedence(leftExpr, "Different"),
    rightExpr: ensurePrecedence(rightExpr, "Different"),
  });
}

export function is(leftExpr: Exp, rightExpr: Exp): Node<"Is"> {
  return n.createNode("Is", {
    leftExpr: ensurePrecedence(leftExpr, "Is"),
    rightExpr: ensurePrecedence(rightExpr, "Is"),
  });
}

export function isNot(leftExpr: Exp, rightExpr: Exp): Node<"Is"> {
  return n.createNode("Is", {
    not: true,
    leftExpr: ensurePrecedence(leftExpr, "Is"),
    rightExpr: ensurePrecedence(rightExpr, "Is"),
  });
}

export function notBetween(
  expr: Exp,
  betweenExpr: Exp,
  andExpr: Exp,
): Node<"Between"> {
  return n.createNode("Between", {
    expr: ensurePrecedence(expr, "Between"),
    betweenExpr: ensurePrecedence(betweenExpr, "Between"),
    not: true,
    andExpr: ensurePrecedence(andExpr, "Between"),
  });
}

export function between(
  expr: Exp,
  betweenExpr: Exp,
  andExpr: Exp,
): Node<"Between"> {
  return n.createNode("Between", {
    expr: ensurePrecedence(expr, "Between"),
    betweenExpr: ensurePrecedence(betweenExpr, "Between"),
    andExpr: ensurePrecedence(andExpr, "Between"),
  });
}

export function match(leftExpr: Exp, rightExpr: Exp): Node<"Match"> {
  return n.createNode("Match", {
    leftExpr: ensurePrecedence(leftExpr, "Match"),
    rightExpr: ensurePrecedence(rightExpr, "Match"),
  });
}

export function notMatch(leftExpr: Exp, rightExpr: Exp): Node<"Match"> {
  return n.createNode("Match", {
    not: true,
    leftExpr: ensurePrecedence(leftExpr, "Match"),
    rightExpr: ensurePrecedence(rightExpr, "Match"),
  });
}

export function like(leftExpr: Exp, rightExpr: Exp): Node<"Like"> {
  return n.createNode("Like", {
    leftExpr: ensurePrecedence(leftExpr, "Like"),
    rightExpr: ensurePrecedence(rightExpr, "Like"),
  });
}

export function notLike(leftExpr: Exp, rightExpr: Exp): Node<"Like"> {
  return n.createNode("Like", {
    not: true,
    leftExpr: ensurePrecedence(leftExpr, "Like"),
    rightExpr: ensurePrecedence(rightExpr, "Like"),
  });
}

export function glob(leftExpr: Exp, rightExpr: Exp): Node<"Glob"> {
  return n.createNode("Glob", {
    leftExpr: ensurePrecedence(leftExpr, "Glob"),
    rightExpr: ensurePrecedence(rightExpr, "Glob"),
  });
}

export function notGlob(leftExpr: Exp, rightExpr: Exp): Node<"Glob"> {
  return n.createNode("Glob", {
    leftExpr: ensurePrecedence(leftExpr, "Glob"),
    not: true,
    rightExpr: ensurePrecedence(rightExpr, "Glob"),
  });
}

export function regexp(leftExpr: Exp, rightExpr: Exp): Node<"Regexp"> {
  return n.createNode("Regexp", {
    leftExpr: ensurePrecedence(leftExpr, "Regexp"),
    rightExpr: ensurePrecedence(rightExpr, "Regexp"),
  });
}

export function notRegexp(leftExpr: Exp, rightExpr: Exp): Node<"Regexp"> {
  return n.createNode("Regexp", {
    leftExpr: ensurePrecedence(leftExpr, "Regexp"),
    not: true,
    rightExpr: ensurePrecedence(rightExpr, "Regexp"),
  });
}

export function isnull(expr: Exp): Node<"Isnull"> {
  return n.createNode("Isnull", { expr: ensurePrecedence(expr, "Isnull") });
}

export function isNull(expr: Exp): Node<"Is"> {
  return n.createNode("Is", {
    leftExpr: ensurePrecedence(expr, "Is"),
    rightExpr: nullLiteral,
  });
}

export function notnull(expr: Exp): Node<"Notnull"> {
  return n.createNode("Notnull", { expr: ensurePrecedence(expr, "Notnull") });
}

export function notNull(expr: Exp): Node<"NotNull"> {
  return n.createNode("NotNull", { expr: ensurePrecedence(expr, "NotNull") });
}

export function lowerThan(leftExpr: Exp, rightExpr: Exp): Node<"LowerThan"> {
  return n.createNode("LowerThan", {
    leftExpr: ensurePrecedence(leftExpr, "LowerThan"),
    rightExpr: ensurePrecedence(rightExpr, "LowerThan"),
  });
}

export function greaterThan(
  leftExpr: Exp,
  rightExpr: Exp,
): Node<"GreaterThan"> {
  return n.createNode("GreaterThan", {
    leftExpr: ensurePrecedence(leftExpr, "GreaterThan"),
    rightExpr: ensurePrecedence(rightExpr, "GreaterThan"),
  });
}

export function lowerThanOrEqual(
  leftExpr: Exp,
  rightExpr: Exp,
): Node<"LowerThanOrEqual"> {
  return n.createNode("LowerThanOrEqual", {
    leftExpr: ensurePrecedence(leftExpr, "LowerThanOrEqual"),
    rightExpr: ensurePrecedence(rightExpr, "LowerThanOrEqual"),
  });
}

export function greaterThanOrEqual(
  leftExpr: Exp,
  rightExpr: Exp,
): Node<"GreaterThanOrEqual"> {
  return n.createNode("GreaterThanOrEqual", {
    leftExpr: ensurePrecedence(leftExpr, "GreaterThanOrEqual"),
    rightExpr: ensurePrecedence(rightExpr, "GreaterThanOrEqual"),
  });
}

export function bitwiseAnd(leftExpr: Exp, rightExpr: Exp): Node<"BitwiseAnd"> {
  return n.createNode("BitwiseAnd", {
    leftExpr: ensurePrecedence(leftExpr, "BitwiseAnd"),
    rightExpr: ensurePrecedence(rightExpr, "BitwiseAnd"),
  });
}

export function bitwiseOr(leftExpr: Exp, rightExpr: Exp): Node<"BitwiseOr"> {
  return n.createNode("BitwiseOr", {
    leftExpr: ensurePrecedence(leftExpr, "BitwiseOr"),
    rightExpr: ensurePrecedence(rightExpr, "BitwiseOr"),
  });
}

export function bitwiseShiftLeft(
  leftExpr: Exp,
  rightExpr: Exp,
): Node<"BitwiseShiftLeft"> {
  return n.createNode("BitwiseShiftLeft", {
    leftExpr: ensurePrecedence(leftExpr, "BitwiseShiftLeft"),
    rightExpr: ensurePrecedence(rightExpr, "BitwiseShiftLeft"),
  });
}

export function bitwiseShiftRight(
  leftExpr: Exp,
  rightExpr: Exp,
): Node<"BitwiseShiftRight"> {
  return n.createNode("BitwiseShiftRight", {
    leftExpr: ensurePrecedence(leftExpr, "BitwiseShiftRight"),
    rightExpr: ensurePrecedence(rightExpr, "BitwiseShiftRight"),
  });
}

export function add(leftExpr: Exp, rightExpr: Exp): Node<"Add"> {
  return n.createNode("Add", {
    leftExpr: ensurePrecedence(leftExpr, "Add"),
    rightExpr: ensurePrecedence(rightExpr, "Add"),
  });
}

export function subtract(leftExpr: Exp, rightExpr: Exp): Node<"Subtract"> {
  return n.createNode("Subtract", {
    leftExpr: ensurePrecedence(leftExpr, "Subtract"),
    rightExpr: ensurePrecedence(rightExpr, "Subtract"),
  });
}

export function multiply(leftExpr: Exp, rightExpr: Exp): Node<"Multiply"> {
  return n.createNode("Multiply", {
    leftExpr: ensurePrecedence(leftExpr, "Multiply"),
    rightExpr: ensurePrecedence(rightExpr, "Multiply"),
  });
}

export function divide(leftExpr: Exp, rightExpr: Exp): Node<"Divide"> {
  return n.createNode("Divide", {
    leftExpr: ensurePrecedence(leftExpr, "Divide"),
    rightExpr: ensurePrecedence(rightExpr, "Divide"),
  });
}

export function modulo(leftExpr: Exp, rightExpr: Exp): Node<"Modulo"> {
  return n.createNode("Modulo", {
    leftExpr: ensurePrecedence(leftExpr, "Modulo"),
    rightExpr: ensurePrecedence(rightExpr, "Modulo"),
  });
}

export function concatenate(
  leftExpr: Exp,
  rightExpr: Exp,
): Node<"Concatenate"> {
  return n.createNode("Concatenate", {
    leftExpr: ensurePrecedence(leftExpr, "Concatenate"),
    rightExpr: ensurePrecedence(rightExpr, "Concatenate"),
  });
}

export function collate(
  expr: Exp,
  collationName: string | Id,
): Node<"Collate"> {
  return n.createNode("Collate", {
    expr: ensurePrecedence(expr, "Collate"),
    collationName: identifier(collationName),
  });
}

export function bitwiseNegation(expr: Exp): Node<"BitwiseNegation"> {
  return n.createNode("BitwiseNegation", {
    expr: ensurePrecedence(expr, "BitwiseNegation"),
  });
}

export function plus(expr: Exp): Node<"Plus"> {
  return n.createNode("Plus", { expr: ensurePrecedence(expr, "Plus") });
}

export function minus(expr: Exp): Node<"Minus"> {
  return n.createNode("Minus", { expr: ensurePrecedence(expr, "Minus") });
}

export function exists(selectStmt: Node<"SelectStmt">): Node<"Exists"> {
  return n.createNode("Exists", { selectStmt, exists: true });
}

export function notExists(selectStmt: Node<"SelectStmt">): Node<"NotExists"> {
  return n.createNode("NotExists", { selectStmt });
}

export function parenthesis(
  first: Exp,
  ...other: Array<Exp>
): Node<"Parenthesis"> {
  return n.createNode("Parenthesis", { exprs: [first, ...other] });
}

export function castAs(
  expr: Exp,
  typeName: Node<"TypeName"> | ValidTypeName,
): Node<"CastAs"> {
  return n.createNode("CastAs", {
    expr,
    typeName: typeof typeName === "string" ? buildTypeName(typeName) : typeName,
  });
}

export function caseOperation(
  expr: Exp | null,
  cases: NonEmptyArray<{ whenExpr: Exp; thenExpr: Exp }>,
  elseExpr?: Exp,
): Node<"Case"> {
  return n.createNode("Case", {
    expr: expr ?? undefined,
    cases,
    else: elseExpr,
  });
}

export function inList(expr: Exp, items?: NonEmptyArray<Exp>): Node<"In"> {
  return n.createNode("In", {
    expr: ensurePrecedence(expr, "In"),
    values: { variant: "List", items },
  });
}

export function inSelect(
  expr: Exp,
  selectStmt: Node<"SelectStmt">,
): Node<"In"> {
  return n.createNode("In", {
    expr: ensurePrecedence(expr, "In"),
    values: { variant: "Select", selectStmt },
  });
}

export function inTableName(
  expr: Exp,
  table: string | Id,
  schema?: string | Id,
): Node<"In"> {
  return n.createNode("In", {
    expr: ensurePrecedence(expr, "In"),
    values: {
      variant: "TableName",
      tableName: identifier(table),
      schemaName: schema ? identifier(schema) : undefined,
    },
  });
}

export function inTableFunctionInvocation(
  expr: Exp,
  functionName: string | Id,
  parameters?: NonEmptyArray<Exp>,
  schema?: string | Id,
): Node<"In"> {
  return n.createNode("In", {
    expr: ensurePrecedence(expr, "In"),
    values: {
      variant: "TableFunctionInvocation",
      functionName: identifier(functionName),
      parameters,
      schemaName: schema ? identifier(schema) : undefined,
    },
  });
}

export function notInList(expr: Exp, items?: NonEmptyArray<Exp>): Node<"In"> {
  return n.createNode("In", {
    expr: ensurePrecedence(expr, "In"),
    not: true,
    values: { variant: "List", items },
  });
}

export function notInSelect(
  expr: Exp,
  selectStmt: Node<"SelectStmt">,
): Node<"In"> {
  return n.createNode("In", {
    expr: ensurePrecedence(expr, "In"),
    not: true,
    values: { variant: "Select", selectStmt },
  });
}

export function notInTableName(
  expr: Exp,
  table: string | Id,
  schema?: string | Id,
): Node<"In"> {
  return n.createNode("In", {
    expr: ensurePrecedence(expr, "In"),
    not: true,
    values: {
      variant: "TableName",
      tableName: identifier(table),
      schemaName: schema ? identifier(schema) : undefined,
    },
  });
}

export function notInTableFunctionInvocation(
  expr: Exp,
  functionName: string | Id,
  parameters?: NonEmptyArray<Exp>,
  schema?: string | Id,
): Node<"In"> {
  return n.createNode("In", {
    expr: ensurePrecedence(expr, "In"),
    not: true,
    values: {
      variant: "TableFunctionInvocation",
      functionName: identifier(functionName),
      parameters,
      schemaName: schema ? identifier(schema) : undefined,
    },
  });
}

export function ensurePrecedence(expr: Exp, parentOperator: AnyOperator): Exp {
  const expPrec = getPrecedence(expr);
  const parentPrec = OperatorPrecedence[parentOperator];
  if (expPrec === null) {
    return expr;
  }
  if (expPrec <= parentPrec) {
    return parenthesis(expr);
  }
  return expr;
}

export function getPrecedence(expr: Exp): number | null {
  return OperatorPrecedence[expr.kind as AnyOperator] ?? null;
}
