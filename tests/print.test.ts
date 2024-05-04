import { expect } from "$std/expect/mod.ts";
import { Ast, builder as b, printNode } from "../mod.ts";

Deno.test("Print AlterTableStmt", () => {
  const node = Ast.createNode("AlterTableStmt", {
    tableName: b.Expr.identifier("users"),
    action: {
      variant: "RenameTo",
      newTableName: b.Expr.identifier("users_new"),
    },
  });

  expect(printNode(node)).toBe("ALTER TABLE users RENAME TO users_new");
});

Deno.test("Print Select", () => {
  const node = Ast.createNode("SelectCore", {
    variant: "Select",
    from: {
      variant: "TablesOrSubqueries",
      tablesOrSubqueries: [
        Ast.createNode("TableOrSubquery", {
          variant: "Table",
          tableName: b.Expr.identifier("users"),
        }),
      ],
    },
    resultColumns: [
      Ast.createNode("ResultColumn", {
        variant: "Star",
      }),
    ],
  });

  expect(printNode(node)).toBe("SELECT * FROM users");
});

Deno.test("Print Select using builder", () => {
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
    resultColumns: [
      b.ResultColumn.columnFromString("users.id"),
      b.ResultColumn.TableStar("users"),
    ],
    where: b.Operations.equal(
      b.Expr.columnFromString("users.name"),
      b.Literal.literal("azerty"),
    ),
  });

  expect(printNode(node)).toBe(
    "SELECT users.id, users.* FROM users LEFT JOIN posts ON users.id == posts.user_id WHERE users.name == 'azerty'",
  );
});

Deno.test("Print join of table and subquery", () => {
  const node = b.SelectStmt.build({
    from: b.SelectStmt.FromJoin(
      b.SelectStmt.Table("posts"),
      b.SelectStmt.InnerJoinOperator(),
      // Find user
      b.SelectStmt.Subquery(
        b.SelectStmt.build({
          from: b.SelectStmt.FromTable("users"),
          resultColumns: [b.ResultColumn.Star()],
          where: b.Operations.equal(
            b.Expr.columnFromString("users.name"),
            b.Literal.literal("azerty"),
          ),
        }),
        "users",
      ),
      b.SelectStmt.OnJoinConstraint(
        b.Operations.equal(
          b.Expr.columnFromString("users.id"),
          b.Expr.columnFromString("posts.user_id"),
        ),
      ),
    ),
    resultColumns: [b.ResultColumn.Star()],
  });
  expect(printNode(node)).toBe(
    "SELECT * FROM posts INNER JOIN (SELECT * FROM users WHERE users.name == 'azerty') AS users ON users.id == posts.user_id",
  );
});

Deno.test("CreateTableStmt", () => {
  const node = b.CreateTableStmt.build(
    "users",
    [
      b.CreateTableStmt.ColumnDef("id", b.TypeName.build("TEXT"), [
        b.CreateTableStmt.PrimaryKey(),
      ]),
      b.CreateTableStmt.ColumnDef("name", b.TypeName.build("TEXT")),
      b.CreateTableStmt.ColumnDef("email", b.TypeName.build("TEXT"), [
        b.CreateTableStmt.Unique(),
        b.CreateTableStmt.NotNull(),
      ]),
    ],
    { strict: true, ifNotExists: true },
  );
  expect(printNode(node)).toBe(
    "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE NOT NULL) STRICT",
  );
});

Deno.test("DeleteStmt", () => {
  const node = b.DeleteStmt.build("users", {
    where: b.Operations.equal(
      b.Expr.columnFromString("users.name"),
      b.Literal.literal("azerty"),
    ),
  });
  expect(printNode(node)).toBe(
    "DELETE FROM users WHERE users.name == 'azerty'",
  );
});

Deno.test("UpdateStmt", () => {
  const node = b.UpdateStmt.build("users", {
    setItems: [b.UpdateStmt.ColumnName("foo", b.Literal.literal(42))],
  });
  expect(printNode(node)).toBe("UPDATE users SET foo = 42");
});

Deno.test("AggregateFunctionInvocation", () => {
  const node = b.Aggregate.count({ params: b.Literal.literal(42) });
  expect(printNode(node)).toBe("count(42)");
});

Deno.test("ScalarFunctions", () => {
  const node = b.Functions.abs(b.Literal.literal(42));
  expect(printNode(node)).toBe("abs(42)");
});

Deno.test("Multiple joins", () => {
  const node = b.SelectStmt.build({
    from: b.SelectStmt.FromJoins(
      b.SelectStmt.Table("posts"),
      {
        joinOperator: b.SelectStmt.InnerJoinOperator(),
        tableOrSubquery: b.SelectStmt.Table("users"),
        joinConstraint: b.SelectStmt.OnJoinConstraint(
          b.Operations.equal(
            b.Expr.columnFromString("users.id"),
            b.Expr.columnFromString("posts.user_id"),
          ),
        ),
      },
      {
        joinOperator: b.SelectStmt.InnerJoinOperator(),
        tableOrSubquery: b.SelectStmt.Table("comments"),
        joinConstraint: b.SelectStmt.OnJoinConstraint(
          b.Operations.equal(
            b.Expr.columnFromString("comments.user_id"),
            b.Expr.columnFromString("users.id"),
          ),
        ),
      },
    ),
    resultColumns: [b.ResultColumn.Star()],
  });
  expect(printNode(node)).toBe(
    `SELECT * FROM posts INNER JOIN users ON users.id == posts.user_id INNER JOIN comments ON comments.user_id == users.id`,
  );
});
