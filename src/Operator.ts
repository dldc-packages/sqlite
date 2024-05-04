import { mapObject } from "./internal/utils.ts";

export type UnaryOperator = keyof typeof UnaryOperator;
export type UnaryOperatorRaw = (typeof UnaryOperator)[UnaryOperator];

export const UnaryOperator = {
  BitwiseNegation: "~",
  Plus: "+",
  Minus: "-",
} as const;

export type BinaryOperator = keyof typeof BinaryOperatorsInternal;
export type BinaryOperatorRaw =
  (typeof BinaryOperatorsInternal)[BinaryOperator][number];

const BinaryOperatorsInternal = {
  Concatenate: ["||"],
  ExtractJson: ["->"],
  Extract: ["->>"],
  Multiply: ["*"],
  Divide: ["/"],
  Modulo: ["%"],
  Add: ["+"],
  Subtract: ["-"],
  BitwiseAnd: ["&"],
  BitwiseOr: ["|"],
  BitwiseShiftLeft: ["<<"],
  BitwiseShiftRight: [">>"],
  GreaterThan: [">"],
  LowerThan: ["<"],
  GreaterThanOrEqual: [">="],
  LowerThanOrEqual: ["<="],
  Equal: ["==", "="],
  Different: ["!=", "<>"],
} as const;

export const BinaryOperator: {
  [K in BinaryOperator]: (typeof BinaryOperatorsInternal)[K][0];
} = mapObject(
  BinaryOperatorsInternal,
  (_key, [val]) => val,
);

export type OtherOperators =
  | "Collate"
  | "Escape"
  | "Is"
  | "IsNot"
  | "Between"
  | "In"
  | "Match"
  | "Like"
  | "Regexp"
  | "Glob"
  | "Isnull"
  | "Notnull"
  | "NotNull"
  | "Not"
  | "And"
  | "Or";

export type AnyOperator = UnaryOperator | BinaryOperator | OtherOperators;

export const OperatorPrecedence: Record<AnyOperator, number> = {
  Or: 0,

  And: 1,

  Not: 2,

  Equal: 3,
  Different: 3,
  Is: 3,
  IsNot: 3,
  Between: 3,
  In: 3,
  Match: 3,
  Like: 3,
  Regexp: 3,
  Glob: 3,
  Isnull: 3,
  Notnull: 3,
  NotNull: 3,

  GreaterThan: 4,
  LowerThan: 4,
  GreaterThanOrEqual: 4,
  LowerThanOrEqual: 4,

  Escape: 5,

  BitwiseAnd: 6,
  BitwiseOr: 6,
  BitwiseShiftLeft: 6,
  BitwiseShiftRight: 6,

  Add: 7,
  Subtract: 7,

  Multiply: 8,
  Divide: 8,
  Modulo: 8,

  Concatenate: 9,
  ExtractJson: 9,
  Extract: 9,

  Collate: 10,

  BitwiseNegation: 11,
  Plus: 11,
  Minus: 11,
};
