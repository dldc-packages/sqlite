-- original: fts1n.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts1(a, b, c);
    INSERT INTO t1(a, b, c) VALUES('one three four', 'one four', 'one two');
    SELECT a, b, c FROM t1 WHERE c MATCH 'two'
;SELECT a, b, c FROM t1 WHERE c MATCH 'two';
    CREATE TABLE t3(a, b, c);
    SELECT a, b, c FROM t1 WHERE  c  MATCH 'two';