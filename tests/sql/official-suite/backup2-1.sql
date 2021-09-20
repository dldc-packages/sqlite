-- original: backup2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(x);
    INSERT INTO t1 VALUES(randstr(8000,8000));
    INSERT INTO t1 VALUES(randstr(8000,8000));
    INSERT INTO t1 VALUES(randstr(8000,8000));
    INSERT INTO t1 VALUES(randstr(8000,8000));
    INSERT INTO t1 VALUES(randstr(8000,8000));
    CREATE VIEW v1 AS SELECT substr(x,10,10) FROM t1;
    CREATE TABLE t2(a,b);
    INSERT INTO t2 VALUES(1,2);
    INSERT INTO t2 VALUES(2,4);
    INSERT INTO t2 SELECT a+2, (a+2)*2 FROM t2;
    INSERT INTO t2 SELECT a+4, (a+4)*2 FROM t2;
    INSERT INTO t2 SELECT a+8, (a+8)*2 FROM t2;
    INSERT INTO t2 SELECT a+16, (a+16)*2 FROM t2;
    INSERT INTO t2 SELECT a+32, (a+32)*2 FROM t2;
    INSERT INTO t2 SELECT a+64, (a+64)*2 FROM t2;
    INSERT INTO t2 SELECT a+128, (a+128)*2 FROM t2;
    CREATE INDEX t2i1 ON t2(a,b);
    CREATE TRIGGER r1 AFTER INSERT ON t2 BEGIN
      SELECT 'hello';
    END;
    ANALYZE;
    PRAGMA integrity_check
;BEGIN EXCLUSIVE
;ROLLBACK;