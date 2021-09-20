-- original: count.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

SELECT count(*) FROM sqlite_master
;DROP TABLE IF EXISTS t1;
      CREATE TABLE t1(a, b)
;SELECT count(*) FROM t1
;INSERT INTO t1 VALUES(1, 2);
      INSERT INTO t1 VALUES(3, 4);
      SELECT count(*) FROM t1
;INSERT INTO t1 SELECT * FROM t1;          --   4
      INSERT INTO t1 SELECT * FROM t1;          --   8
      INSERT INTO t1 SELECT * FROM t1;          --  16
      INSERT INTO t1 SELECT * FROM t1;          --  32
      INSERT INTO t1 SELECT * FROM t1;          --  64
      INSERT INTO t1 SELECT * FROM t1;          -- 128
      INSERT INTO t1 SELECT * FROM t1;          -- 256
      SELECT count(*) FROM t1
;INSERT INTO t1 SELECT * FROM t1;          --  512
      INSERT INTO t1 SELECT * FROM t1;          -- 1024
      INSERT INTO t1 SELECT * FROM t1;          -- 2048
      INSERT INTO t1 SELECT * FROM t1;          -- 4096
      SELECT count(*) FROM t1
;BEGIN;
      INSERT INTO t1 SELECT * FROM t1;          --  8192
      INSERT INTO t1 SELECT * FROM t1;          -- 16384
      INSERT INTO t1 SELECT * FROM t1;          -- 32768
      INSERT INTO t1 SELECT * FROM t1;          -- 65536
      COMMIT;
      SELECT count(*) FROM t1
;CREATE TABLE t2(a, b)
;CREATE VIEW v1 AS SELECT 1 AS a
;CREATE VIRTUAL TABLE techo USING echo(t1)
;CREATE TABLE t3(a, b);
    SELECT a FROM (SELECT count(*) AS a FROM t3) WHERE a==0
;SELECT a FROM (SELECT count(*) AS a FROM t3) WHERE a==1
;CREATE TABLE t4(a, b);
    INSERT INTO t4 VALUES('a', 'b');
    CREATE INDEX t4i1 ON t4(b, a);
    SELECT count(*) FROM t4
;CREATE INDEX t4i2 ON t4(b);
    SELECT count(*) FROM t4
;DROP INDEX t4i1;
    CREATE INDEX t4i1 ON t4(b, a);
    SELECT count(*) FROM t4
;CREATE TABLE t5(a TEXT PRIMARY KEY, b VARCHAR(50)) WITHOUT ROWID;
  INSERT INTO t5 VALUES('bison','jazz');
  SELECT count(*) FROM t5;