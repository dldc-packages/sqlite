import { expect, test, vi } from "vite-plus/test";
import type { Ast } from "@dldc/sqlite";
import { builder as b, Utils } from "@dldc/sqlite";

test("Travers Select using builder", () => {
  const node = b.SelectStmt.build({
    from: b.SelectStmt.FromJoin(
      b.SelectStmt.Table("users"),
      b.SelectStmt.JoinOperator("Left"),
      b.SelectStmt.Table("posts"),
      b.SelectStmt.OnJoinConstraint(
        b.Operations.equal(
          b.Expr.columnFromString("users.id"),
          b.Expr.columnFromString("posts.user_id"),
        ),
      ),
    ),
    resultColumns: [b.ResultColumn.columnFromString("users.id"), b.ResultColumn.TableStar("users")],
    where: b.Operations.equal(b.Expr.columnFromString("users.name"), b.Literal.literal("azerty")),
  });

  const nodeKinds: Array<Ast.NodeKind> = [];

  const onNode = vi.fn((node: Ast.Node) => {
    nodeKinds.push(node.kind);
    return null;
  });

  Utils.traverse(node, onNode);

  expect(onNode).toHaveBeenCalledTimes(27);
  expect(nodeKinds).toEqual([
    "SelectStmt",
    "SelectCore",
    "ResultColumn",
    "Column",
    "Identifier",
    "Identifier",
    "ResultColumn",
    "Identifier",
    "JoinClause",
    "TableOrSubquery",
    "Identifier",
    "JoinOperator",
    "TableOrSubquery",
    "Identifier",
    "JoinConstraint",
    "Equal",
    "Column",
    "Identifier",
    "Identifier",
    "Column",
    "Identifier",
    "Identifier",
    "Equal",
    "Column",
    "Identifier",
    "Identifier",
    "StringLiteral",
  ]);
});
