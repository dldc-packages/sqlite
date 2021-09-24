export type UnaryOperator = keyof typeof UnaryOperators;
export type UnaryOperatorRaw = typeof UnaryOperators[UnaryOperator];

const UnaryOperators = {
  BitwiseNegation: '~',
  Plus: '+',
  Minus: '-',
} as const;

export type BinaryOperator = keyof typeof BinaryOperators;
export type BinaryOperatorRaw = typeof BinaryOperators[BinaryOperator][number];

const BinaryOperators = {
  Concatenate: ['||'],
  Multiply: ['*'],
  Divide: ['/'],
  Modulo: ['%'],
  Add: ['+'],
  Subtract: ['-'],
  BitwiseAnd: ['&'],
  BitwiseOr: ['|'],
  BitwiseShiftLeft: ['<<'],
  BitwiseShiftRight: ['>>'],
  GreaterThan: ['>'],
  LowerThan: ['<'],
  GreaterOrEqualThan: ['>='],
  LowerOrEqualThan: ['<='],
  Equal: ['==', '='],
  Different: ['!=', '<>'],
} as const;

type OtherOperators =
  | 'Collate'
  | 'Escape'
  | 'Is'
  | 'IsNot'
  | 'Between'
  | 'In'
  | 'Match'
  | 'Like'
  | 'Regexp'
  | 'Glob'
  | 'IsNull'
  | 'NotNull'
  | 'Not_Null'
  | 'Not'
  | 'And'
  | 'Or';

export const OperatorPrecedence: Record<UnaryOperator | BinaryOperator | OtherOperators, number> = {
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
  IsNull: 3,
  NotNull: 3,
  Not_Null: 3,

  GreaterThan: 4,
  LowerThan: 4,
  GreaterOrEqualThan: 4,
  LowerOrEqualThan: 4,

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

  Collate: 10,

  BitwiseNegation: 11,
  Plus: 11,
  Minus: 11,
};
