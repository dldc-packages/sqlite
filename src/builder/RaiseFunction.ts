import * as n from "../Node.ts";
import { string } from "./Literal.ts";

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export function ignore(): Node<"RaiseFunction"> {
  return n.createNode("RaiseFunction", { variant: "Ignore" });
}

export function rollback(
  errorMessage: Node<"StringLiteral"> | string,
): Node<"RaiseFunction"> {
  return n.createNode("RaiseFunction", {
    variant: "Rollback",
    errorMessage: string(errorMessage),
  });
}

export function abort(
  errorMessage: Node<"StringLiteral"> | string,
): Node<"RaiseFunction"> {
  return n.createNode("RaiseFunction", {
    variant: "Abort",
    errorMessage: string(errorMessage),
  });
}

export function fail(
  errorMessage: Node<"StringLiteral"> | string,
): Node<"RaiseFunction"> {
  return n.createNode("RaiseFunction", {
    variant: "Fail",
    errorMessage: string(errorMessage),
  });
}
