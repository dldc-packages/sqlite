-- original: crashM.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

ATTACH 'file:test2.db?8_3_names=1' AS aux;

  CREATE TABLE t1(x, y);
  CREATE INDEX t1x ON t1(x);
  CREATE INDEX t1y ON t1(y);

  CREATE TABLE aux.t2(x, y);
  CREATE INDEX aux.t2x ON t2(x);
  CREATE INDEX aux.t2y ON t2(y);

  WITH s(a) AS (
    SELECT 1 UNION ALL SELECT a+1 FROM s WHERE a<1000
  )
  INSERT INTO t1 SELECT a, randomblob(500) FROM s;

  WITH s(a) AS (
    SELECT 1 UNION ALL SELECT a+1 FROM s WHERE a<1000
  )
  INSERT INTO t2 SELECT a, randomblob(500) FROM s;