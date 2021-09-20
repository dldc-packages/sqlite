-- original: cache.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA auto_vacuum=OFF;
    CREATE TABLE abc(a, b, c);
    INSERT INTO abc VALUES(1, 2, 3)
;SELECT * FROM abc
;PRAGMA auto_vacuum=OFF;
  PRAGMA journal_mode=DELETE;
  CREATE TABLE t1(a, b);
  CREATE TABLE t2(c, d);
  INSERT INTO t1 VALUES('x', 'y');
  INSERT INTO t2 VALUES('i', 'j')
;PRAGMA cache_size = 1;
  BEGIN;
    INSERT INTO t1 VALUES(1, 2);
    PRAGMA lock_status
;INSERT INTO t2 VALUES(1, 2);
    PRAGMA lock_status
;SELECT * FROM t1 UNION SELECT * FROM t2
;PRAGMA cache_size = 0;
  BEGIN;
    INSERT INTO t1 VALUES(1, 2);
    PRAGMA lock_status
;INSERT INTO t2 VALUES(1, 2);
    PRAGMA lock_status
;SELECT * FROM t1 UNION SELECT * FROM t2;