-- original: tkt-3fe897352e.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA encoding=UTF8;
    CREATE TABLE t1(x);
    INSERT INTO t1 VALUES(hex_to_utf16be('D800'));
    SELECT hex(x) FROM t1
;DELETE FROM t1;
    INSERT INTO t1 VALUES(hex_to_utf16le('00D8'));
    SELECT hex(x) FROM t1
;DELETE FROM t1;
    INSERT INTO t1 VALUES(hex_to_utf16be('DFFF'));
    SELECT hex(x) FROM t1
;DELETE FROM t1;
    INSERT INTO t1 VALUES(hex_to_utf16le('FFDF'));
    SELECT hex(x) FROM t1;