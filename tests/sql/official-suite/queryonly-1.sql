-- original: queryonly.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a);
  INSERT INTO t1 VALUES(123),(456);
  SELECT a FROM t1 ORDER BY a
;PRAGMA query_only
;PRAGMA query_only=ON;
  PRAGMA query_only
;SELECT a FROM t1 ORDER BY a
;PRAGMA query_only
;PRAGMA query_only=OFF;
  PRAGMA query_only
;INSERT INTO t1 VALUES(789);
  SELECT a FROM t1 ORDER BY a
;UPDATE t1 SET a=a+1;
  SELECT a FROM t1 ORDER BY a;