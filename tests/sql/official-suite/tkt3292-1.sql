-- original: tkt3292.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA legacy_file_format=OFF;
    CREATE TABLE t1(a INTEGER PRIMARY KEY, b INT);
    INSERT INTO t1 VALUES(0, 1);
    INSERT INTO t1 VALUES(1, 1);
    INSERT INTO t1 VALUES(2, 1);
    CREATE INDEX i1 ON t1(b);
    SELECT * FROM t1 WHERE b>=1
;INSERT INTO t1 VALUES(3, 0);
    INSERT INTO t1 VALUES(4, 2);
    SELECT * FROM t1 WHERE b>=1
;CREATE TABLE t2(a INTEGER PRIMARY KEY, b, c, d);
    INSERT INTO t2 VALUES(0, 1, 'hello', x'012345');
    INSERT INTO t2 VALUES(1, 1, 'hello', x'012345');
    INSERT INTO t2 VALUES(2, 1, 'hello', x'012345');
    CREATE INDEX i2 ON t2(b,c,d);
    SELECT a FROM t2 WHERE b=1 AND c='hello' AND d>=x'012345'
;INSERT INTO t2 VALUES(3, 1, 'hello', x'012344');
    INSERT INTO t2 VALUES(4, 1, 'hello', x'012346');
    SELECT a FROM t2 WHERE b=1 AND c='hello' AND d>=x'012345';