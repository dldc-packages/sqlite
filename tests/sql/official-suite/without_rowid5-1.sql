-- original: without_rowid5.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a PRIMARY KEY,b,c);
  CREATE TABLE t1w(a PRIMARY KEY,b,c) WITHOUT ROWID;
  INSERT INTO t1 VALUES(1565,681,1148),(1429,1190,1619),(425,358,1306);
  INSERT INTO t1w SELECT a,b,c FROM t1;
  SELECT rowid, _rowid_, oid FROM t1 ORDER BY a DESC
;CREATE TABLE IF NOT EXISTS wordcount(
    word TEXT PRIMARY KEY,
    cnt INTEGER
  ) WITHOUT ROWID;
  INSERT INTO wordcount VALUES('one',1)
;CREATE TABLE IF NOT EXISTS wordcount_b(
    word TEXT PRIMARY KEY,
    cnt INTEGER
  ) WITHOUT rowid;
  INSERT INTO wordcount_b VALUES('one',1)
;CREATE TABLE IF NOT EXISTS wordcount_c(
    word TEXT PRIMARY KEY,
    cnt INTEGER
  ) without rowid;
  INSERT INTO wordcount_c VALUES('one',1)
;CREATE TABLE IF NOT EXISTS wordcount_d(
    word TEXT PRIMARY KEY,
    cnt INTEGER
  ) WITHOUT rowid;
  INSERT INTO wordcount_d VALUES('one',1)
;CREATE TABLE ipk(key INTEGER PRIMARY KEY, val TEXT) WITHOUT ROWID;
  INSERT INTO ipk VALUES('rival','bonus'); -- ok to insert non-integer key
  SELECT * FROM ipk
;ROLLBACK
;CREATE TABLE nn(a, b, c, d, e, PRIMARY KEY(c,a,e));
  CREATE TABLE nnw(a, b, c, d, e, PRIMARY KEY(c,a,e)) WITHOUT ROWID;
  INSERT INTO nn VALUES(1,2,3,4,5);
  INSERT INTO nnw VALUES(1,2,3,4,5)
;INSERT INTO nn VALUES(NULL, 3,4,5,6);
  INSERT INTO nn VALUES(3,4,NULL,7,8);
  INSERT INTO nn VALUES(4,5,6,7,NULL);
  SELECT count(*) FROM nn
;SELECT count(*) FROM nnw
;CREATE TABLE b1(a INTEGER PRIMARY KEY, b BLOB) WITHOUT ROWID;
  INSERT INTO b1 VALUES(1,x'0102030405060708090a0b0c0d0e0f');