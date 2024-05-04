import * as n from "../Node.ts";
import { arrayToNonEmptyArray } from "../Utils.ts";
import { identifier } from "./Expr.ts";

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export function aggregateFunctionInvocation(
  name: string,
  args: { distinct?: boolean; params: Exp | Exp[] } | "*",
  filterClause?: Node<"FilterClause">,
): Node<"AggregateFunctionInvocation"> {
  if (args === "*") {
    return n.createNode("AggregateFunctionInvocation", {
      aggregateFunc: identifier(name),
      parameters: { variant: "Star" },
      filterClause,
    });
  }
  const distinct = args.distinct === true ? true : undefined;
  const argsArr = arrayToNonEmptyArray(
    Array.isArray(args.params) ? args.params : [args.params],
  );
  return n.createNode("AggregateFunctionInvocation", {
    aggregateFunc: identifier(name),
    parameters: { variant: "Exprs", distinct, exprs: argsArr },
    filterClause,
  });
}

export interface AggregateFunctionParams<Expr = Exp[]> {
  distinct?: boolean;
  params: Expr;
}

type AFI = Node<"AggregateFunctionInvocation">;

export function avg(options: AggregateFunctionParams<Exp>): AFI {
  return aggregateFunctionInvocation("avg", options);
}

export function count(options: AggregateFunctionParams<Exp>): AFI {
  return aggregateFunctionInvocation("count", options);
}

export function group_concat(
  options: AggregateFunctionParams<Exp | [x: Exp, y: Exp]>,
): AFI {
  return aggregateFunctionInvocation("group_concat", options);
}

export function max(options: AggregateFunctionParams<Exp>): AFI {
  return aggregateFunctionInvocation("max", options);
}

export function min(options: AggregateFunctionParams<Exp>): AFI {
  return aggregateFunctionInvocation("min", options);
}

export function sum(options: AggregateFunctionParams<Exp>): AFI {
  return aggregateFunctionInvocation("sum", options);
}

export function total(options: AggregateFunctionParams<Exp>): AFI {
  return aggregateFunctionInvocation("total", options);
}

// JSON

export function json_group_array(options: AggregateFunctionParams<Exp>): AFI {
  return aggregateFunctionInvocation("json_group_array", options);
}

export function json_group_object(
  options: AggregateFunctionParams<[name: Exp, value: Exp]>,
): AFI {
  return aggregateFunctionInvocation("json_group_object", options);
}
