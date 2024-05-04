import * as n from "../Node.ts";

type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export type ValidTypeName = "NULL" | "INTEGER" | "REAL" | "TEXT" | "BLOB";

export function build(type: ValidTypeName): Node<"TypeName">;
export function build(type: string): Node<"TypeName">;
export function build(type: Node<"TypeName">): Node<"TypeName">;
export function build(type: string | Node<"TypeName">): Node<"TypeName"> {
  if (typeof type !== "string") {
    return type;
  }
  return n.createNode("TypeName", {
    name: [type],
  });
}
