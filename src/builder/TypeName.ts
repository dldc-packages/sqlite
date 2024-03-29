import * as n from '../Node';

type Node<K extends n.NodeKind = n.NodeKind> = n.Node<K>;

export type ValidTypeName = 'NULL' | 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB';

export function TypeName(type: ValidTypeName): Node<'TypeName'>;
export function TypeName(type: string): Node<'TypeName'>;
export function TypeName(type: Node<'TypeName'>): Node<'TypeName'>;
export function TypeName(type: string | Node<'TypeName'>): Node<'TypeName'> {
  if (typeof type !== 'string') {
    return type;
  }
  return n.createNode('TypeName', {
    name: [type],
  });
}
