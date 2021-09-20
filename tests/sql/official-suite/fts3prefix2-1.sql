-- original: fts3prefix2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA page_size = 512
;CREATE VIRTUAL TABLE t1 USING fts4(x, prefix="2,3");

  BEGIN;
    INSERT INTO t1 VALUES('T TX T TX T TX T TX T TX');
    INSERT INTO t1 SELECT * FROM t1;                       -- 2
    INSERT INTO t1 SELECT * FROM t1;                       -- 4
    INSERT INTO t1 SELECT * FROM t1;                       -- 8
    INSERT INTO t1 SELECT * FROM t1;                       -- 16
    INSERT INTO t1 SELECT * FROM t1;                       -- 32
    INSERT INTO t1 SELECT * FROM t1;                       -- 64
    INSERT INTO t1 SELECT * FROM t1;                       -- 128
    INSERT INTO t1 SELECT * FROM t1;                       -- 256
    INSERT INTO t1 SELECT * FROM t1;                       -- 512
    INSERT INTO t1 SELECT * FROM t1;                       -- 1024
    INSERT INTO t1 SELECT * FROM t1;                       -- 2048
  COMMIT
;INSERT INTO t1 SELECT * FROM t1 LIMIT 10;
  INSERT INTO t1 SELECT * FROM t1 LIMIT 10;
  INSERT INTO t1 SELECT * FROM t1 LIMIT 10;
  DELETE FROM t1 WHERE docid > 5
;SELECT * FROM t1 WHERE t1 MATCH 'T*';