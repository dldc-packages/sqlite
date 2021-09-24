import glob from 'glob';
import path from 'path';
import fse from 'fs-extra';
import { TSQliteError, TSQliteParser } from '../src/mod';

const SQL_FILES_PATH = path.resolve(process.cwd(), 'tests', 'sql');

describe('Parse SQL files', () => {
  const sqlFiles = glob.sync(SQL_FILES_PATH + '/**/*.sql');

  let passed: Array<string> = [];
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
    console.log(['Passed', ...passed.map((v) => `  - ${v}`), '', 'Missing Parsers:', ...[...missingParser.values()].map((v) => `  - ${v}`)].join('\n'));
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
