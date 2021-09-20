-- original: tkt-4dd95f6943.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(x);
  INSERT INTO t1 VALUES (3), (4), (2), (1), (5), (6)
;CREATE TABLE t2(x, y);
  INSERT INTO t2 VALUES (5, 3), (5, 4), (5, 2), (5, 1), (5, 5), (5, 6);
  INSERT INTO t2 VALUES (1, 3), (1, 4), (1, 2), (1, 1), (1, 5), (1, 6);
  INSERT INTO t2 VALUES (3, 3), (3, 4), (3, 2), (3, 1), (3, 5), (3, 6);
  INSERT INTO t2 VALUES (2, 3), (2, 4), (2, 2), (2, 1), (2, 5), (2, 6);
  INSERT INTO t2 VALUES (4, 3), (4, 4), (4, 2), (4, 1), (4, 5), (4, 6);
  INSERT INTO t2 VALUES (6, 3), (6, 4), (6, 2), (6, 1), (6, 5), (6, 6);

  CREATE TABLE t3(a, b);
  INSERT INTO t3 VALUES (2, 2), (4, 4), (5, 5);
  CREATE UNIQUE INDEX t3i1 ON t3(a ASC);
  CREATE UNIQUE INDEX t3i2 ON t3(b DESC)
;CREATE TABLE t7(x);
  INSERT INTO t7 VALUES (1), (2), (3);
  CREATE INDEX i7 ON t7(x);

  CREATE TABLE t8(y);
  INSERT INTO t8 VALUES (1), (2), (3);