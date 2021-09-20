-- original: vtabB.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(x);
    BEGIN;
    CREATE VIRTUAL TABLE temp.echo_test1 USING echo(t1);
    DROP TABLE echo_test1;
    ROLLBACK
;INSERT INTO t1 VALUES(2);
    INSERT INTO t1 VALUES(3);
    CREATE TABLE t2(y);
    INSERT INTO t2 VALUES(1);
    INSERT INTO t2 VALUES(2);
    CREATE VIRTUAL TABLE echo_t2 USING echo(t2);
    SELECT * FROM t1 WHERE x IN (SELECT rowid FROM t2)
;SELECT rowid FROM echo_t2
;SELECT * FROM t1 WHERE x IN (SELECT rowid FROM t2)
;SELECT * FROM t1 WHERE x IN (SELECT rowid FROM echo_t2)
;SELECT * FROM t1 WHERE x IN (SELECT y FROM t2)
;SELECT * FROM t1 WHERE x IN (SELECT y FROM echo_t2);