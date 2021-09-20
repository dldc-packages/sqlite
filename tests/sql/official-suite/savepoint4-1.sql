-- original: savepoint4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

SELECT count(*), md5sum(x) FROM t1
;PRAGMA cache_size=10;
    BEGIN;
    CREATE TABLE t1(x TEXT);
    INSERT INTO t1 VALUES(randstr(10,400));
    INSERT INTO t1 VALUES(randstr(10,400));
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    COMMIT;
    SELECT count(*) FROM t1
;DELETE FROM t1 WHERE random()%10==0;
      INSERT INTO t1 SELECT randstr(10,10)||x FROM t1 WHERE random()%9==0
;PRAGMA cache_size=10;
    DROP TABLE IF EXISTS t1;
    BEGIN;
    CREATE TABLE t1(x TEXT);
    CREATE INDEX i1 ON t1(x);
    INSERT INTO t1 VALUES(randstr(10,400));
    INSERT INTO t1 VALUES(randstr(10,400));
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    INSERT INTO t1 SELECT randstr(10,400) FROM t1;
    COMMIT;
    SELECT count(*) FROM t1
;DELETE FROM t1 WHERE random()%10==0;
      INSERT INTO t1 SELECT randstr(10,10)||x FROM t1 WHERE random()%9==0;