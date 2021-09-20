-- original: corrupt.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

BEGIN;
    CREATE TABLE t1(x);
    INSERT INTO t1 VALUES(randstr(100,100));
    INSERT INTO t1 VALUES(randstr(90,90));
    INSERT INTO t1 VALUES(randstr(80,80));
    INSERT INTO t1 SELECT x || randstr(5,5) FROM t1;
    INSERT INTO t1 SELECT x || randstr(6,6) FROM t1;
    INSERT INTO t1 SELECT x || randstr(7,7) FROM t1;
    INSERT INTO t1 SELECT x || randstr(8,8) FROM t1;
    INSERT INTO t1 VALUES(randstr(3000,3000));
    INSERT INTO t1 SELECT x || randstr(9,9) FROM t1;
    INSERT INTO t1 SELECT x || randstr(10,10) FROM t1;
    INSERT INTO t1 SELECT x || randstr(11,11) FROM t1;
    INSERT INTO t1 SELECT x || randstr(12,12) FROM t1;
    CREATE INDEX t1i1 ON t1(x);
    CREATE TABLE t2 AS SELECT * FROM t1;
    DELETE FROM t2 WHERE rowid%5!=0;
    COMMIT
;SELECT rootpage FROM sqlite_master WHERE name = 't1i1'
;SELECT rootpage FROM sqlite_master WHERE name = 't1'
;PRAGMA schema_version
;PRAGMA page_size = 1024;
    CREATE TABLE t1(a INTEGER PRIMARY KEY, b TEXT)
;INSERT INTO t1 VALUES(sub_i, sub_text)
;CREATE INDEX i1 ON t1(b)
;PRAGMA page_size = 1024
;PRAGMA page_size = 1024; CREATE TABLE t1(x)
;INSERT INTO t1 VALUES( randomblob(10) )
;DELETE FROM t1 WHERE rowid=1
;PRAGMA page_size = 1024; CREATE TABLE t1(x)
;INSERT INTO t1 VALUES(X'000100020003000400050006000700080009000A')
;UPDATE t1 SET x = X'870400020003000400050006000700080009000A' 
      WHERE rowid = 10
;PRAGMA page_size = 1024;
    PRAGMA secure_delete = on;
    PRAGMA auto_vacuum = 0;
    CREATE TABLE t1(x INTEGER PRIMARY KEY, y);
    INSERT INTO t1 VALUES(5, randomblob(1900))
;PRAGMA page_size = 1024;
    PRAGMA secure_delete = on;
    PRAGMA auto_vacuum = 0;
    CREATE TABLE t1(x INTEGER PRIMARY KEY, y);
    INSERT INTO t1 VALUES(5, randomblob(900));
    INSERT INTO t1 VALUES(6, randomblob(900));