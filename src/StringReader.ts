import { TSQliteError } from './TSQliteError';

export interface StringReader {
  peek(size?: number): string;
  skip(size?: number): StringReader;
  size: number;
  position: number;
  empty: boolean;
}

interface StringReaderOptions {
  start: number;
  end: number;
}

export function StringReader(input: string): StringReader {
  return StringReaderInternal(input, {
    start: 0,
    end: input.length,
  });
}

function StringReaderInternal(input: string, options: StringReaderOptions): StringReader {
  const size = Math.abs(options.start - options.end);
  const direction = (options.end - options.start) / size; // NaN or 1 or -1
  const position = direction === 1 ? options.start : options.end;
  const empty = size <= 0;

  return {
    peek,
    skip,
    // reverse,
    size,
    position,
    empty,
  };

  function peek(s: number = 1): string {
    const peekSize = Math.min(s, size);
    const result = input.slice(options.start, options.start + direction * peekSize);
    if (s === 1) {
      return result[0] || '';
    }
    return result;
  }

  function skip(s: number = 1): StringReader {
    if (s < 1 || s > size) {
      throw new TSQliteError.UnexpectedError(`Cannot peek ${s} item`);
    }
    const nextStart = options.start + direction * s;
    return StringReaderInternal(input, { start: nextStart, end: options.end });
  }
}
