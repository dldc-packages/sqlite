-- original: incrcorrupt.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA auto_vacuum = 2;
  CREATE TABLE t1(a PRIMARY KEY, b);

  WITH data(i) AS (
    SELECT 1 UNION ALL SELECT i+1 FROM data
  )
  INSERT INTO t1 SELECT i, randomblob(600) FROM data LIMIT 20;
  PRAGMA page_count
;PRAGMA incremental_vacuum
;PRAGMA auto_vacuum = 1;
  CREATE TABLE t1(a PRIMARY KEY, b);
  WITH data(i) AS (
    SELECT 1 UNION ALL SELECT i+1 FROM data
  )
  INSERT INTO t1 SELECT i, randomblob(600) FROM data LIMIT 20;
  PRAGMA page_count;