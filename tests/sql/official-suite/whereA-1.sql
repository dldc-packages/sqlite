-- original: whereA.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a INTEGER PRIMARY KEY, b UNIQUE, c);
    INSERT INTO t1 VALUES(1,2,3);
    INSERT INTO t1 values(2,'hello','world');
    INSERT INTO t1 VALUES(3,4.53,NULL);
    SELECT * FROM t1
;PRAGMA reverse_unordered_selects=1;
    SELECT * FROM t1
;PRAGMA reverse_unordered_selects=1;
    SELECT * FROM t1
;PRAGMA reverse_unordered_selects=1;
    SELECT * FROM t1 ORDER BY rowid
;VACUUM;
    SELECT * FROM t1 ORDER BY rowid
;PRAGMA reverse_unordered_selects
;PRAGMA reverse_unordered_selects=1;
    VACUUM;
    SELECT * FROM t1
;SELECT * FROM t1 WHERE b=2 AND a IS NULL
;SELECT * FROM t1 WHERE b=2 AND a IS NOT NULL
;PRAGMA reverse_unordered_selects=0;
    SELECT * FROM t1 WHERE a>0
;PRAGMA reverse_unordered_selects=1;
    SELECT * FROM t1 WHERE a>0
;PRAGMA reverse_unordered_selects=1;
    SELECT * FROM t1 WHERE a>0 ORDER BY rowid
;PRAGMA reverse_unordered_selects=0;
    SELECT * FROM t1 WHERE b>0
;PRAGMA reverse_unordered_selects=1;
    SELECT * FROM t1 WHERE b>0
;PRAGMA reverse_unordered_selects=1;
    SELECT * FROM t1 WHERE b>0 ORDER BY b
;CREATE TABLE t2(x);
    INSERT INTO t2 VALUES(1);
    INSERT INTO t2 VALUES(2);
    SELECT x FROM t2
;CREATE INDEX t2x ON t2(x)
;DROP INDEX t2x;