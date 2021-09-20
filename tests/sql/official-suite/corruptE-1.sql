-- original: corruptE.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA auto_vacuum = 0;
    PRAGMA legacy_file_format=1;
    BEGIN;
    CREATE TABLE t1(x,y);
    INSERT INTO t1 VALUES(1,1);
    INSERT OR IGNORE INTO t1 SELECT x*2,y FROM t1;
    INSERT OR IGNORE INTO t1 SELECT x*3,y FROM t1;
    INSERT OR IGNORE INTO t1 SELECT x*5,y FROM t1;
    INSERT OR IGNORE INTO t1 SELECT x*7,y FROM t1;
    INSERT OR IGNORE INTO t1 SELECT x*11,y FROM t1;
    INSERT OR IGNORE INTO t1 SELECT x*13,y FROM t1;
    INSERT OR IGNORE INTO t1 SELECT x*17,y FROM t1;
    INSERT OR IGNORE INTO t1 SELECT x*19,y FROM t1;
    CREATE INDEX t1i1 ON t1(x);
    CREATE TABLE t2 AS SELECT x,2 as y FROM t1 WHERE rowid%5!=0 ORDER BY rowid;
    COMMIT;