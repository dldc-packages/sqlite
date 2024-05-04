import * as n from "../Node.ts";

type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export function indexed(): Node<"BindParameter"> {
  return n.createNode("BindParameter", { variant: "Indexed" });
}

export function numbered(number: number): Node<"BindParameter"> {
  return n.createNode("BindParameter", {
    variant: "Numbered",
    number: Math.abs(Math.floor(number)),
  });
}

export function atNamed(name: string, suffix?: string): Node<"BindParameter"> {
  return n.createNode("BindParameter", { variant: "AtNamed", name, suffix });
}

export function colonNamed(
  name: string,
  suffix?: string,
): Node<"BindParameter"> {
  return n.createNode("BindParameter", {
    variant: "ColonNamed",
    name,
    suffix,
  });
}

export function dollarNamed(
  name: string,
  suffix?: string,
): Node<"BindParameter"> {
  return n.createNode("BindParameter", {
    variant: "DollarNamed",
    name,
    suffix,
  });
}
