import * as n from "../Node.ts";

type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export function integer(
  integer: number,
  exponent?: number,
): Node<"NumericLiteral"> {
  return n.createNode("NumericLiteral", {
    variant: "Integer",
    integer: Math.floor(integer),
    exponent: exponent === undefined ? undefined : {
      e: "e",
      sign: exponent < 0 ? "-" : undefined,
      number: Math.abs(Math.floor(exponent)),
    },
  });
}

export function hexadecimal(hexadecimal: string): Node<"NumericLiteral"> {
  return n.createNode("NumericLiteral", {
    variant: "Hexadecimal",
    value: parseInt(hexadecimal, 16),
    zeroX: "0x",
  });
}

export function float(
  integral: number,
  fractional: number,
  exponent?: number,
): Node<"NumericLiteral"> {
  return n.createNode("NumericLiteral", {
    variant: "Float",
    integral: Math.floor(integral),
    fractional: fractional,
    exponent: exponent === undefined ? undefined : {
      e: "e",
      sign: exponent < 0 ? "-" : undefined,
      number: Math.abs(Math.floor(exponent)),
    },
  });
}

export function string(
  content: string | Node<"StringLiteral">,
): Node<"StringLiteral"> {
  if (typeof content !== "string") {
    return content;
  }
  return n.createNode("StringLiteral", { content });
}

export function blob(content: string): Node<"BlobLiteral"> {
  return n.createNode("BlobLiteral", { content, x: "x" });
}

export const nullLiteral: Node<"Null"> = n.createNode("Null", {});

export const trueLiteral: Node<"True"> = n.createNode("True", {});

export const falseLiteral: Node<"False"> = n.createNode("False", {});

export const current_Time: Node<"Current_Time"> = n.createNode(
  "Current_Time",
  {},
);

export const current_Date: Node<"Current_Date"> = n.createNode(
  "Current_Date",
  {},
);

export const current_Timestamp: Node<"Current_Timestamp"> = n.createNode(
  "Current_Timestamp",
  {},
);

export function literal(val: null | number | string | boolean): n.LiteralValue {
  if (val === true) {
    return trueLiteral;
  }
  if (val === false) {
    return falseLiteral;
  }
  if (val === null) {
    return nullLiteral;
  }
  if (typeof val === "number") {
    const isInt = Math.floor(val) === val;
    if (isInt) {
      return integer(val);
    }
    const integral = Math.floor(val);
    const fractional = parseInt((val - integral).toString().slice(2));
    return float(integral, fractional);
  }
  if (typeof val === "string") {
    return string(val);
  }
  throw new Error(`Invalid literal: ${val as any}`);
}
