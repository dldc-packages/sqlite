-- original: notify3.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a, b); 
    INSERT INTO t1 VALUES('t1 A', 't1 B')
;CREATE TABLE t2(a, b);
    INSERT INTO t2 VALUES('t2 A', 't2 B')
;BEGIN EXCLUSIVE;
    INSERT INTO t2 VALUES('t2 C', 't2 D')
;COMMIT
;SELECT * FROM sqlite_master
;SELECT * FROM sqlite_master
;BEGIN EXCLUSIVE;