-- original: corrupt6.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA auto_vacuum=OFF;
    PRAGMA page_size=1024;
    CREATE TABLE t1(x);
    INSERT INTO t1(x) VALUES('varint32-01234567890123456789012345678901234567890123456789');
    INSERT INTO t1(x) VALUES('varint32-01234567890123456789012345678901234567890123456789');