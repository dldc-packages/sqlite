-- original: vtab8.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t2244(a, b);
    CREATE VIRTUAL TABLE t2244e USING echo(t2244);
    INSERT INTO t2244 VALUES('AA', 'BB');
    INSERT INTO t2244 VALUES('CC', 'DD');
    SELECT rowid, * FROM t2244e
;SELECT * FROM t2244e WHERE rowid = 10
;UPDATE t2244e SET a = 'hello world' WHERE 0;
    SELECT rowid, * FROM t2244e
;CREATE TABLE t2250(a, b);
    INSERT INTO t2250 VALUES(10, 20);
    CREATE VIRTUAL TABLE t2250e USING echo(t2250);
    select max(rowid) from t2250;
    select max(rowid) from t2250e
;CREATE TABLE t2260a_real(a, b);
    CREATE TABLE t2260b_real(a, b);

    CREATE INDEX i2260 ON t2260a_real(a);
    CREATE INDEX i2260x ON t2260b_real(a);

    CREATE VIRTUAL TABLE t2260a USING echo(t2260a_real);
    CREATE VIRTUAL TABLE t2260b USING echo(t2260b_real);

    SELECT * FROM t2260a, t2260b WHERE t2260a.a = t2260b.a AND t2260a.a > 101;