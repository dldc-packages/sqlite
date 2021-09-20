-- original: tkt-fc62af4523.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA cache_size = 10;
    PRAGMA journal_mode = persist;
    CREATE TABLE t1(a UNIQUE, b UNIQUE);
    INSERT INTO t1 SELECT randomblob(200), randomblob(300);
    INSERT INTO t1 SELECT randomblob(200), randomblob(300) FROM t1; --  2
    INSERT INTO t1 SELECT randomblob(200), randomblob(300) FROM t1; --  4
    INSERT INTO t1 SELECT randomblob(200), randomblob(300) FROM t1; --  8
    INSERT INTO t1 SELECT randomblob(200), randomblob(300) FROM t1; -- 16
    INSERT INTO t1 SELECT randomblob(200), randomblob(300) FROM t1; -- 32
    INSERT INTO t1 SELECT randomblob(200), randomblob(300) FROM t1; -- 64
;PRAGMA integrity_check;
    SELECT count(*) FROM t1
;PRAGMA cache_size = 10;
      BEGIN;
        UPDATE t1 SET b = randomblob(400);
        UPDATE t1 SET a = randomblob(201)
;PRAGMA journal_mode = DELETE
;PRAGMA integrity_check;
    SELECT count(*) FROM t1;