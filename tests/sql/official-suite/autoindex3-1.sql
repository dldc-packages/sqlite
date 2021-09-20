-- original: autoindex3.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a,b,x);
  CREATE TABLE t2(c,d,y);
  CREATE INDEX t1b ON t1(b);
  CREATE INDEX t2d ON t2(d);
  ANALYZE sqlite_master;
  INSERT INTO sqlite_stat1 VALUES('t1','t1b','10000 500');
  INSERT INTO sqlite_stat1 VALUES('t2','t2d','10000 500');
  ANALYZE sqlite_master;
  EXPLAIN QUERY PLAN SELECT * FROM t1, t2 WHERE d=b
;EXPLAIN QUERY PLAN SELECT * FROM t1, t2 WHERE d>b AND x=y
;EXPLAIN QUERY PLAN SELECT * FROM t1, t2 WHERE d<b AND x=y
;EXPLAIN QUERY PLAN SELECT * FROM t1, t2 WHERE d IS NULL AND x=y
;EXPLAIN QUERY PLAN SELECT * FROM t1, t2 WHERE d IN (5,b) AND x=y
;CREATE TABLE v(b, d, e);
  CREATE TABLE u(a, b, c);
  ANALYZE sqlite_master;
  INSERT INTO "sqlite_stat1" VALUES('u','uab','40000 400 1');
  INSERT INTO "sqlite_stat1" VALUES('v','vbde','40000 400 1 1');
  INSERT INTO "sqlite_stat1" VALUES('v','ve','40000 21');

  CREATE INDEX uab on u(a, b);
  CREATE INDEX ve on v(e);
  CREATE INDEX vbde on v(b,d,e);

  DROP TABLE IF EXISTS sqlite_stat4;
  ANALYZE sqlite_master
;select count(*) from u, v where u.b = v.b and v.e > 34;