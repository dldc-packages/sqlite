-- original: quota.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA page_size=1024;
    PRAGMA auto_vacuum=OFF;
    PRAGMA journal_mode=DELETE
;CREATE TABLE t1(a, b);
    INSERT INTO t1 VALUES(1, randomblob(1100));
    INSERT INTO t1 VALUES(2, randomblob(1100))
;INSERT INTO t1 VALUES(3, randomblob(1100))
;PRAGMA page_size = 1024;
    PRAGMA journal_mode = delete;
    PRAGMA auto_vacuum = off;
    CREATE TABLE t1(a PRIMARY KEY, b);
    INSERT INTO t1 VALUES(1, 'one')
;CREATE TABLE t2(a, b)
;CREATE TABLE t3(a, b)
;PRAGMA page_size = 1024;
      PRAGMA journal_mode = delete;
      PRAGMA auto_vacuum = off;
      CREATE TABLE t1(a, b)
;INSERT INTO t1 VALUES('x', 'y')
;INSERT INTO t1 VALUES('v', 'w')
;INSERT INTO t1 VALUES('t', 'u')
;INSERT INTO t1 VALUES('r', 's')
;INSERT INTO t1 VALUES(randomblob(500), randomblob(500))
;INSERT INTO t1 VALUES(randomblob(500), randomblob(500))
;INSERT INTO t1 VALUES(randomblob(500), randomblob(500))
;INSERT INTO t1 VALUES(randomblob(500), randomblob(500))
;CREATE TABLE t2(x); INSERT INTO t2 VALUES('tab-t2')
;SELECT * FROM t2
;CREATE TABLE t1(x);
     INSERT INTO t1 VALUES(randomblob(5000))
;CREATE TABLE t1(x);
     INSERT INTO t1 VALUES(randomblob(5000))
;SELECT count(*) FROM sqlite_master
;PRAGMA auto_vacuum = 1;
    PRAGMA page_size = 1024;
    CREATE TABLE t1(a, b);
    INSERT INTO t1 VALUES(10, zeroblob(1200))
;DELETE FROM t1;