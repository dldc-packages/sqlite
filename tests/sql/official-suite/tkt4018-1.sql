-- original: tkt4018.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a, b);
    BEGIN;
    SELECT * FROM t1
;INSERT INTO t1 VALUES(1, 2)
;BEGIN;
    SELECT * FROM t1 ORDER BY a;