-- original: backup4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(x, y, UNIQUE(x, y));
  INSERT INTO t1 VALUES('one', 'two');
  SELECT * FROM t1 WHERE x='one';
  PRAGMA integrity_check
;CREATE TABLE t1(x, y);
    INSERT INTO t1 VALUES('one', 'two')
;SELECT * FROM t1 WHERE x='one';
  PRAGMA integrity_check
;CREATE TABLE t1(a, b);
  CREATE INDEX i1 ON t1(a, b)
;PRAGMA page_size = 4096;
  CREATE TABLE t1(a, b);
  CREATE INDEX i1 ON t1(a, b);