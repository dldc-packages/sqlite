-- original: types2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(
    i1 INTEGER,
    i2 INTEGER,
    n1 NUMERIC,
    n2 NUMERIC,
    t1 TEXT,
    t2 TEXT,
    o1 BLOB,
    o2 BLOB
  );
  INSERT INTO t1 VALUES(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL)
;SELECT sub_e FROM t1
;SELECT 1 FROM t1 WHERE sub_expr
;SELECT 1 FROM t1 WHERE NOT (sub_e)
;CREATE TABLE t2(i INTEGER, n NUMERIC, t TEXT, o XBLOBY);
  CREATE INDEX t2i1 ON t2(i);
  CREATE INDEX t2i2 ON t2(n);
  CREATE INDEX t2i3 ON t2(t);
  CREATE INDEX t2i4 ON t2(o)
;INSERT INTO t2 VALUES(sub_v, sub_v, sub_v, sub_v)
;CREATE TABLE t3(i INTEGER, n NUMERIC, t TEXT, o BLOB);
  INSERT INTO t3 VALUES(1, 1, 1, 1);
  INSERT INTO t3 VALUES(2, 2, 2, 2);
  INSERT INTO t3 VALUES(3, 3, 3, 3);
  INSERT INTO t3 VALUES('1', '1', '1', '1');
  INSERT INTO t3 VALUES('1.0', '1.0', '1.0', '1.0')
;CREATE TABLE t4(i INTEGER, n NUMERIC, t VARCHAR(20), o LARGE BLOB);
  INSERT INTO t4 VALUES(10, 20, 20, 30);