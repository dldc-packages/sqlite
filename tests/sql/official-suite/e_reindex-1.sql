-- original: e_reindex.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a, b);
  CREATE INDEX i1 ON t1(a, b);
  CREATE INDEX i2 ON t1(b, a)
;INSERT INTO t1 VALUES(1, 2);
  INSERT INTO t1 VALUES(3, 4);
  INSERT INTO t1 VALUES(5, 6);

  CREATE TABLE saved(a,b,c,d,e);
  INSERT INTO saved SELECT * FROM sqlite_master WHERE type = 'index';
  PRAGMA writable_schema = 1;
  DELETE FROM sqlite_master WHERE type = 'index'
;DELETE FROM t1 WHERE a = 3;
  INSERT INTO t1 VALUES(7, 8);
  INSERT INTO t1 VALUES(9, 10);
  PRAGMA writable_schema = 1;
  INSERT INTO sqlite_master SELECT * FROM saved;
  DROP TABLE saved
;PRAGMA integrity_check
;REINDEX;
  PRAGMA integrity_check
;ATTACH 'test.db2' AS aux;

  CREATE TABLE t1(x);
  CREATE INDEX i1_a ON t1(x COLLATE collA);
  CREATE INDEX i1_b ON t1(x COLLATE collB);
  INSERT INTO t1 VALUES('one');
  INSERT INTO t1 VALUES('two');
  INSERT INTO t1 VALUES('three');
  INSERT INTO t1 VALUES('four');
  INSERT INTO t1 VALUES('five');
  INSERT INTO t1 VALUES('six');
  INSERT INTO t1 VALUES('seven');
  INSERT INTO t1 VALUES('eight');

  CREATE TABLE t2(x);
  CREATE INDEX i2_a ON t2(x COLLATE collA);
  CREATE INDEX i2_b ON t2(x COLLATE collB);
  INSERT INTO t2 SELECT x FROM t1;

  CREATE TABLE aux.t1(x);
  CREATE INDEX aux.i1_a ON t1(x COLLATE collA);
  CREATE INDEX aux.i1_b ON t1(x COLLATE collB);
  INSERT INTO aux.t1 SELECT x FROM main.t1
;REINDEX
;REINDEX collA
;REINDEX collB
;REINDEX t1
;REINDEX aux.t1
;REINDEX t2
;REINDEX i1_a
;REINDEX i2_b
;REINDEX aux.i1_b
;REINDEX i1_b
;REINDEX i2_a
;REINDEX aux.i1_a
;CREATE TABLE collA(x);
  CREATE INDEX icolla_a ON collA(x COLLATE collA);
  CREATE INDEX icolla_b ON collA(x COLLATE collB);

  INSERT INTO collA SELECT x FROM t1
;REINDEX collA
;REINDEX main.collA
;REINDEX main.collA;