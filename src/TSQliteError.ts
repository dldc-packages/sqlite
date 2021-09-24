import { stackToString } from './Parser';
import { StringReader } from './StringReader';
import { Stack } from './types';

export class TSQliteError extends Error {
  constructor(message: string) {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }

  public static ParsingError: typeof ParsingError;
  public static NotEOF: typeof NotEOF;
  public static UnexpectedError: typeof TSQliteUnexpectedError;
  public static ParserNotImplemented: typeof ParserNotImplemented;
  // public static NotImplementedError: typeof DocsyNotImplementedError;
  // public static CannotTransformValueError: typeof DocsyCannotTransformValueError;
  // public static MissingGlobalError: typeof DocsyMissingGlobalError;
  // public static CannotResolveInjectError: typeof DocsyCannotResolveInjectError;
  // public static CannotResolveNodeError: typeof DocsyCannotResolveNodeError;
  // public static MissingJsxFunctionError: typeof DocsyMissingJsxFunctionError;
  // public static CannotSerializeNodeError: typeof DocsyCannotSerializeNodeError;
}

class TSQliteUnexpectedError extends TSQliteError {
  constructor(message: string) {
    super(`Unexpected: ${message}`);
  }
}

class ParsingError extends TSQliteError {
  constructor(public parsingStack: Stack) {
    super(`Parsing error:\n${stackToString(parsingStack, 2)}`);
  }
}

class NotEOF extends TSQliteError {
  constructor(public rest: StringReader) {
    super(
      `Expectinf EOF but rest: ${(() => {
        const restText = rest.peek(Infinity);
        if (restText.length < 20) {
          return `"${restText}"`;
        }
        return `"${restText.slice(0, 17)}..."`;
      })()}`
    );
  }
}

class ParserNotImplemented extends TSQliteError {
  constructor(public parserName: string) {
    super(`Cannot get parser rule "${parserName}": no parser defined !`);
  }
}

TSQliteError.ParsingError = ParsingError;
TSQliteError.NotEOF = NotEOF;
TSQliteError.UnexpectedError = TSQliteUnexpectedError;
TSQliteError.ParserNotImplemented = ParserNotImplemented;
