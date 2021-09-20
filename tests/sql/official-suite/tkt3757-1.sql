-- original: tkt3757.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(x INTEGER, y INTEGER, z TEXT);
     CREATE INDEX t1i1 ON t1(y,z);
     INSERT INTO t1 VALUES(1,2,'three');
     CREATE TABLE t2(a INTEGER, b TEXT);
     INSERT INTO t2 VALUES(2, 'two');
     ANALYZE;
     SELECT * FROM sqlite_stat1 ORDER BY 1, 2
;DELETE FROM sqlite_stat1;
    INSERT INTO sqlite_stat1 VALUES('t1','t1i1','250000 50000 30');