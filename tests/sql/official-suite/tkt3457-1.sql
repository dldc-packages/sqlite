-- original: tkt3457.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a, b, c);
    INSERT INTO t1 VALUES(1, 2, 3);
    BEGIN;
    INSERT INTO t1 VALUES(4, 5, 6);