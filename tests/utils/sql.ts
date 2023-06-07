import dedent from 'dedent';
import { format as sqlFormet } from 'sql-formatter';

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  return format(dedent(String.raw(strings, ...values)));
}

export function format(conde: string): string {
  return sqlFormet(conde, { language: 'sqlite' });
}
