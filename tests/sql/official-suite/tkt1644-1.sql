-- original: tkt1644.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a);
    INSERT INTO t1 VALUES(1);
    CREATE TABLE t2(b);
    INSERT INTO t2 VALUES(99);
    CREATE TEMP VIEW v1 AS SELECT * FROM t1;
    SELECT * FROM v1
;DROP VIEW v1;
    CREATE TEMP VIEW v1 AS SELECT * FROM t2;
    SELECT * FROM v1
;SELECT * FROM t1
;CREATE TEMP TABLE t1(x)
;SELECT * FROM t1
;CREATE TEMP TABLE temp_t1(a, b)
;DROP TABLE temp_t1
;CREATE TABLE real_t1(a, b);
      CREATE TEMP VIEW temp_v1 AS SELECT * FROM real_t1
;DROP VIEW temp_v1
;CREATE TEMP VIEW temp_v1 AS SELECT * FROM real_t1 LIMIT 10 OFFSET 10
;DROP VIEW temp_v1;