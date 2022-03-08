export function mapObject<In extends Record<string, any>, Out extends Record<keyof In, any>>(
  obj: In,
  mapper: (key: string, value: In[keyof In]) => Out[keyof In]
): Out {
  return Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, mapper(key, val)])) as any;
}

type Parts = Array<string | null | undefined>;

export function joiner(glue: string, ...parts: Parts): string {
  return parts.filter(Boolean).join(glue);
}

export const join = {
  space: (...parts: Parts): string => joiner(' ', ...parts),
  comma: (...parts: Parts): string => joiner(', ', ...parts),
  all: (...parts: Parts): string => joiner('', ...parts),
};

export function mapMaybe<T, O>(val: T | null | undefined, mapper: (val: T) => O): O | null {
  if (val === null || val === undefined) {
    return null;
  }
  return mapper(val);
}

export type NonEmptyArray<T> = [T, ...T[]];

export type Variants<T extends Record<string, any>> = {
  [K in keyof T]: T[K] & { variant: K };
}[keyof T];

export function mapVariants<T extends { variant: string }, Res>(variant: T, mapper: { [K in T['variant']]: (val: Extract<T, { variant: K }>) => Res }): Res {
  return (mapper as any)[(variant as any).variant](variant);
}

export function mapUnionString<T extends string, Res>(val: T, mapper: { [K in T]: Res }): Res {
  return mapper[val];
}
