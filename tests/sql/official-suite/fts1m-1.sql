-- original: fts1m.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts1(a, b, c);
  INSERT INTO t1(a, b, c) VALUES('one three four', 'one four', 'one four two')
;SELECT rowid, snippet(t1) FROM t1 WHERE c MATCH 'four'
;SELECT rowid, snippet(t1) FROM t1 WHERE b MATCH 'four'
;SELECT rowid, snippet(t1) FROM t1 WHERE a MATCH 'four';