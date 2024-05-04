import * as n from "../Node.ts";
import { arrayToNonEmptyArray } from "../Utils.ts";
import { identifier } from "./Expr.ts";

type Id = n.Identifier;
type Exp = n.Expr;
type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export function simpleFunctionInvocation(
  name: string,
  ...args: Exp[]
): Node<"SimpleFunctionInvocation"> {
  return n.createNode("SimpleFunctionInvocation", {
    simpleFunc: identifier(name),
    parameters: args.length === 0
      ? undefined
      : { variant: "Exprs", exprs: arrayToNonEmptyArray(args) },
  });
}

// ScalarFunctions
// https://www.sqlite.org/lang_corefunc.html

type SFI = Node<"SimpleFunctionInvocation">;

export function abs(x: Exp): SFI {
  return simpleFunctionInvocation("abs", x);
}

export function changes(): SFI {
  return simpleFunctionInvocation("changes");
}

export function char(x1: Exp, x2: Exp, ...xn: Exp[]): SFI {
  return simpleFunctionInvocation("char", x1, x2, ...xn);
}

export function coalesce(x: Exp, y: Exp, ...yn: Exp[]): SFI {
  return simpleFunctionInvocation("coalesce", x, y, ...yn);
}

export function format(format: Exp, ...args: Exp[]): SFI {
  return simpleFunctionInvocation("format", format, ...args);
}

export function glob(x: Exp, y: Exp): SFI {
  return simpleFunctionInvocation("glob", x, y);
}

export function hex(x: Exp): SFI {
  return simpleFunctionInvocation("hex", x);
}

export function ifnull(x: Exp, y: Exp): SFI {
  return simpleFunctionInvocation("ifnull", x, y);
}

export function iif(x: Exp, y: Exp, z: Exp): SFI {
  return simpleFunctionInvocation("iif", x, y, z);
}

export function instr(x: Exp, y: Exp): SFI {
  return simpleFunctionInvocation("instr", x, y);
}

export function last_insert_rowid(): SFI {
  return simpleFunctionInvocation("last_insert_rowid");
}

export function length(x: Exp): SFI {
  return simpleFunctionInvocation("length", x);
}

export function like(x: Exp, y: Exp, z?: Exp): SFI {
  return z
    ? simpleFunctionInvocation("like", x, y, z)
    : simpleFunctionInvocation("like", x, y);
}

export function likelihood(x: Exp, y: Exp): SFI {
  return simpleFunctionInvocation("likelihood", x, y);
}

export function likely(x: Exp): SFI {
  return simpleFunctionInvocation("likely", x);
}

export function load_extension(x: Exp, y?: Exp): SFI {
  return y
    ? simpleFunctionInvocation("load_extension", x, y)
    : simpleFunctionInvocation("load_extension", x);
}

export function lower(x: Exp): SFI {
  return simpleFunctionInvocation("lower", x);
}

export function ltrim(
  x: Exp,
  y?: Exp,
): SFI {
  return (y
    ? simpleFunctionInvocation("ltrim", x, y)
    : simpleFunctionInvocation("ltrim", x));
}

export function max(x: Exp, y: Exp, ...yn: Exp[]): SFI {
  return simpleFunctionInvocation("max", x, y, ...yn);
}

export function min(x: Exp, y: Exp, ...yn: Exp[]): SFI {
  return simpleFunctionInvocation("min", x, y, ...yn);
}

export function nullif(x: Exp, y: Exp): SFI {
  return simpleFunctionInvocation("nullif", x, y);
}

export function printf(format: Exp, ...args: Exp[]): SFI {
  return simpleFunctionInvocation("printf", format, ...args);
}

export function quote(x: Exp): SFI {
  return simpleFunctionInvocation("quote", x);
}

export function random(): SFI {
  return simpleFunctionInvocation("random");
}

export function randomblob(n: Exp): SFI {
  return simpleFunctionInvocation("randomblob", n);
}

export function replace(x: Exp, y: Exp, z: Exp): SFI {
  return simpleFunctionInvocation("replace", x, y, z);
}

export function round(
  x: Exp,
  y?: Exp,
): SFI {
  return (y
    ? simpleFunctionInvocation("round", x, y)
    : simpleFunctionInvocation("round", x));
}

export function rtrim(
  x: Exp,
  y?: Exp,
): SFI {
  return (y
    ? simpleFunctionInvocation("rtrim", x, y)
    : simpleFunctionInvocation("rtrim", x));
}

export function sign(x: Exp): SFI {
  return simpleFunctionInvocation("sign", x);
}

export function soundex(x: Exp): SFI {
  return simpleFunctionInvocation("soundex", x);
}

export function sqlite_compileoption_get(n: Exp): SFI {
  return simpleFunctionInvocation("sqlite_compileoption_get", n);
}

export function sqlite_compileoption_used(x: Exp): SFI {
  return simpleFunctionInvocation("sqlite_compileoption_used", x);
}

export function sqlite_offset(x: Exp): SFI {
  return simpleFunctionInvocation("sqlite_offset", x);
}

export function sqlite_source_id(): SFI {
  return simpleFunctionInvocation("sqlite_source_id");
}

export function sqlite_version(): SFI {
  return simpleFunctionInvocation("sqlite_version");
}

export function substr(x: Exp, y: Exp, z?: Exp): SFI {
  return z
    ? simpleFunctionInvocation("substr", x, y, z)
    : simpleFunctionInvocation("substr", x, y);
}

export function substring(x: Exp, y: Exp, z?: Exp): SFI {
  return z
    ? simpleFunctionInvocation("substring", x, y, z)
    : simpleFunctionInvocation("substring", x, y);
}

export function total_changes(): SFI {
  return simpleFunctionInvocation("total_changes");
}

export function trim(
  x: Exp,
  y?: Exp,
): SFI {
  return (y
    ? simpleFunctionInvocation("trim", x, y)
    : simpleFunctionInvocation("trim", x));
}

export function typeofFn(x: Exp): SFI {
  return simpleFunctionInvocation("typeof", x);
}

export function unicode(x: Exp): SFI {
  return simpleFunctionInvocation("unicode", x);
}

export function unlikely(x: Exp): SFI {
  return simpleFunctionInvocation("unlikely", x);
}

export function upper(x: Exp): SFI {
  return simpleFunctionInvocation("upper", x);
}

export function zeroblob(n: Exp): SFI {
  return simpleFunctionInvocation("zeroblob", n);
}

// JSON
export function json(x: Exp): SFI {
  return simpleFunctionInvocation("json", x);
}

export function json_array(...valueN: Exp[]): SFI {
  return simpleFunctionInvocation("json_array", ...valueN);
}

export function json_array_length(json: Exp, path?: Exp): SFI {
  return path
    ? simpleFunctionInvocation("json_array_length", json, path)
    : simpleFunctionInvocation("json_array_length", json);
}

export function json_extract(json: Exp, path: Exp, ...pathN: Exp[]): SFI {
  return simpleFunctionInvocation("json_extract", json, path, ...pathN);
}

export function json_insert(
  json: Exp,
  path: Exp,
  value: Exp,
  ...pathValueN: Exp[]
): SFI {
  return simpleFunctionInvocation(
    "json_insert",
    json,
    path,
    value,
    ...pathValueN,
  );
}

export function json_object(...labelValueN: Exp[]): SFI {
  return simpleFunctionInvocation("json_object", ...labelValueN);
}

export function json_patch(json1: Exp, json2: Exp): SFI {
  return simpleFunctionInvocation("json_patch", json1, json2);
}

export function json_remove(json: Exp, path: Exp, ...pathN: Exp[]): SFI {
  return simpleFunctionInvocation("json_remove", json, path, ...pathN);
}

export function json_replace(
  json: Exp,
  path: Exp,
  value: Exp,
  ...pathValueN: Exp[]
): SFI {
  return simpleFunctionInvocation(
    "json_replace",
    json,
    path,
    value,
    ...pathValueN,
  );
}

export function json_set(
  json: Exp,
  path: Exp,
  value: Exp,
  ...pathValueN: Exp[]
): SFI {
  return simpleFunctionInvocation(
    "json_set",
    json,
    path,
    value,
    ...pathValueN,
  );
}

export function json_type(json: Exp, path?: Exp): SFI {
  return path
    ? simpleFunctionInvocation("json_type", json, path)
    : simpleFunctionInvocation("json_type", json);
}

export function json_valid(json: Exp): SFI {
  return simpleFunctionInvocation("json_valid", json);
}

export function json_quote(value: Exp): SFI {
  return simpleFunctionInvocation("json_quote", value);
}
