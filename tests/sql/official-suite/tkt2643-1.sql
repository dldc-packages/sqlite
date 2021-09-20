-- original: tkt2643.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a INTEGER PRIMARY KEY, b UNIQUE, c);
    INSERT INTO t1 VALUES(1,2,3);
    INSERT INTO t1 VALUES(2,3,4);
    ANALYZE
;CREATE INDEX i1 ON t1(c);
    SELECT count(*) FROM t1 WHERE c IS NOT NULL;