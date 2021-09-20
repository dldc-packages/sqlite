-- original: bigsort.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA page_size = 1024;
  CREATE TABLE t1(a, b);
  BEGIN;
  WITH data(x,y) AS (
    SELECT 1, zeroblob(10000)
    UNION ALL
    SELECT x+1, y FROM data WHERE x < 300000
  )
  INSERT INTO t1 SELECT * FROM data;
  COMMIT
;PRAGMA cache_size = 4194304;
  CREATE INDEX i1 ON t1(a, b);