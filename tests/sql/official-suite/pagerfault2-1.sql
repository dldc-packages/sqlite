-- original: pagerfault2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA auto_vacuum = 0;
    PRAGMA journal_mode = DELETE;
    PRAGMA page_size = 1024;
    CREATE TABLE t1(a, b);
    INSERT INTO t1 VALUES(a_string(401), a_string(402))
;INSERT INTO t1 SELECT a_string(401), a_string(402) FROM t1
;BEGIN;
      SELECT * FROM t1;
      INSERT INTO t1 VALUES(5, 6);
      SAVEPOINT abc;
        UPDATE t1 SET a = a||'x' WHERE rowid<3700
;UPDATE t1 SET a = a||'x' WHERE rowid>=3700 AND rowid<=4200
;ROLLBACK TO abc
;DELETE FROM t1
;PRAGMA cache_size = 20;
    BEGIN;
      INSERT INTO t1 VALUES(a_string(401), a_string(402));
      SAVEPOINT abc
;INSERT INTO t1 VALUES (a_string(2000000), a_string(2500000));