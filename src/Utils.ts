import type { Node } from './Node';
import { isValidNodeKind } from './Node';
import type { AnyFn } from './internal/utils';

export type NonEmptyArray<T> = [T, ...T[]];

export function arrayToNonEmptyArray<T>(arr: Array<T> | undefined): NonEmptyArray<T> {
  if (arr === undefined || arr.length === 0) {
    throw new Error('Expected non-empty array');
  }
  const [first, ...rest] = arr;
  return [first, ...rest];
}

export function arrayToOptionalNonEmptyArray<T>(arr: Array<T> | undefined): NonEmptyArray<T> | undefined {
  if (arr === undefined || arr.length === 0) {
    return undefined;
  }
  return arrayToNonEmptyArray(arr);
}

export type TraversePath = Array<number | string>;

/**
 * Traverse Node tree, return false to skip children
 *
 * @param node
 * @param onNode
 * @returns
 */
export function traverse(node: Node, onNode: (item: Node, path: TraversePath) => void | false | null): void {
  return traverseInternal(node, []);

  function traverseInternal(item: Node, path: TraversePath) {
    const traverseChildren = onNode(item, path);
    if (traverseChildren === false) {
      return;
    }
    getAllNodeChildren(item).forEach((child) => {
      if (child.node) {
        traverseInternal(child.node, [...path, ...child.path]);
      }
    });
  }
}

export type NodePath = Array<string | number>;

export interface NodeWithPath {
  node: Node | undefined | null;
  path: NodePath;
}

/**
 * Traverse the node data (children object and arrays) but it dos not traverse children nodes
 * @param node
 * @returns
 */
export function getAllNodeChildren(node: Node): Array<NodeWithPath> {
  // Object
  const result: Array<NodeWithPath> = [];
  Object.keys(node).forEach((key) => {
    const value = (node as any)[key];
    result.push(...getAllChildren(value).map((child) => ({ ...child, path: [key, ...child.path] })));
  });
  return result;
}

/**
 * Traverse the node data (children object and arrays) but it dos not traverse children nodes
 * @param node
 * @returns
 */
export function getAllChildren(item: any): Array<NodeWithPath> {
  if (item === null || item === undefined) {
    return [];
  }
  const type = typeof item;
  if (type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint') {
    return [];
  }
  if (isReadonlyArray(item)) {
    const result: Array<NodeWithPath> = [];
    item.forEach((child, index) => {
      result.push(...getAllChildren(child).map((child) => ({ ...child, path: [index, ...child.path] })));
    });
    return result;
  }
  if (item.kind && isValidNodeKind(item.kind)) {
    // is node
    return [{ node: item, path: [] }];
  }
  // Object
  const result: Array<NodeWithPath> = [];
  Object.keys(item).forEach((key) => {
    result.push(...getAllChildren(item[key]).map((child) => ({ ...child, path: [key, ...child.path] })));
  });
  return result;
}

export type NodeContentChildren = Node | ReadonlyArray<Node> | { [key: string]: NodeContentChildren };

function isReadonlyArray(item: any): item is ReadonlyArray<any> {
  return Array.isArray(item);
}

export type Variants<T extends Record<string, any>> = {
  [K in keyof T]: T[K] & { variant: K };
}[keyof T];

export function mapVariants<T extends { variant: string }, Res>(
  variant: T,
  mapper: { [K in T['variant']]: (val: Extract<T, { variant: K }>) => Res },
): Res {
  const mapperVariant = (mapper as any)[(variant as any).variant];
  return (mapperVariant as AnyFn)(variant);
}
