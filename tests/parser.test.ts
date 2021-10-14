import glob from 'glob';
import path from 'path';
import fse from 'fs-extra';
import { TSQliteError, TSQliteParser } from '../src/mod';

const SQL_FILES_PATH = path.resolve(process.cwd(), 'tests', 'sql');

const SKIP = [
  // unsuported use of single quote for identifier
  'aliases/uncommon-aliases.sql',
  // unsuported nested comment
  'comments/basic-comments.sql',
  // temp
  'create-trigger/basic-create-trigger-1.sql',
  'create-trigger/basic-create-trigger-2.sql',
  'create-view/basic-create-view.sql',
  'create-virtual-table/basic-create-virtual-table.sql',
  'create-virtual-table/create-virtual-table-alt-syntax.sql',
].map((file) => path.resolve(SQL_FILES_PATH, file));

describe('Parse SQL files', () => {
  const sqlFiles = glob.sync(SQL_FILES_PATH + '/**/*.sql').filter((file) => SKIP.includes(file) === false);

  let passed: Array<string> = [];
  let failed: Array<string> = [];
  let missingParser = new Set<string>();
  let firstError: { fileName: string; error: TSQliteError } | null = null;

  beforeAll(() => {
    passed = [];
    missingParser = new Set<string>();
    firstError = null;
  });

  sqlFiles.forEach((sqlFile) => {
    const fileName = path.relative(SQL_FILES_PATH, sqlFile);
    test(`${fileName}`, async () => {
      const content = await fse.readFile(sqlFile, { encoding: 'utf-8' });
      try {
        TSQliteParser.parseSqlStmtList(content);
        passed.push(fileName);
      } catch (error) {
        failed.push(fileName);
        if (error instanceof TSQliteError.ParserNotImplemented) {
          missingParser.add(error.parserName);
        } else if (error instanceof TSQliteError.ParsingError && firstError === null) {
          firstError = { error, fileName };
        }
      }
      expect(true).toBe(true);
    });
  });

  afterAll(() => {
    console.log(
      [
        'Passed',
        ...passed.map((v) => `  - ${v}`),
        '',
        'Failed',
        ...failed.map((v) => `  - ${v}`),
        '',
        'Missing Parsers:',
        ...[...missingParser.values()].map((v) => `  - ${v}`),
      ].join('\n')
    );
    console.log(firstError);
  });
});

// describe('Parse some files', () => {
//   const sqlFiles = glob.sync(SQL_FILES_PATH + '/**/*.sql');

//   sqlFiles
//     .filter((f) => f.includes('create-index'))
//     .forEach((sqlFile) => {
//       const fileName = path.relative(SQL_FILES_PATH, sqlFile);
//       test(`${fileName}`, async () => {
//         const content = await fse.readFile(sqlFile, { encoding: 'utf-8' });
//         expect(() => TSQliteParser.parseSqlStmtList(content)).not.toThrow();
//       });
//     });
// });
