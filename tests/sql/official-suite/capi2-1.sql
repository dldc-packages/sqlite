-- original: capi2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a,b,c)
;CREATE UNIQUE INDEX i1 ON t1(a)
;CREATE TABLE a1(message_id, name , UNIQUE(message_id, name) );
    INSERT INTO a1 VALUES(1, 1)
;SELECT * FROM t2 ORDER BY a
;SELECT * FROM t2 ORDER BY a
;SELECT * FROM t2 ORDER BY a
;BEGIN;
    CREATE TABLE t3(x counter);
    INSERT INTO t3 VALUES(1);
    INSERT INTO t3 VALUES(2);
    INSERT INTO t3 SELECT x+2 FROM t3;
    INSERT INTO t3 SELECT x+4 FROM t3;
    INSERT INTO t3 SELECT x+8 FROM t3;
    COMMIT
;BEGIN
;COMMIT
;SELECT * FROM t2
;SELECT * FROM t2
;BEGIN
;SELECT * FROM t1
;SELECT * FROM t1
;INSERT INTO t1 VALUES(2,3,4);
    SELECT * FROM t1
;SELECT count(*) FROM t1
;CREATE TABLE tab1(col1, col2)
;CREATE VIEW view1 AS SELECT * FROM  tab1
;CREATE VIEW view2 AS SELECT * FROM tab1 limit 10 offset 10;