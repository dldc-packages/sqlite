-- original: fts2g.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts2(content);
  INSERT INTO t1 (rowid, content) VALUES(1, 'this is a test');
  INSERT INTO t1 (rowid, content) VALUES(2, 'also a test')
;SELECT rowid FROM t1 WHERE t1 MATCH 'something'
;SELECT rowid FROM t1 WHERE t1 MATCH '-this something'
;SELECT rowid FROM t1 WHERE t1 MATCH 'this -something'
;SELECT rowid FROM t1 WHERE t1 MATCH '"this something"'
;SELECT rowid FROM t1 WHERE t1 MATCH '"something is"'
;SELECT rowid FROM t1 WHERE t1 MATCH 'something OR this'
;SELECT rowid FROM t1 WHERE t1 MATCH 'this OR something'
;SELECT rowid FROM t1 WHERE t1 MATCH 'something this'
;SELECT rowid FROM t1 WHERE t1 MATCH 'this something'
;SELECT rowid FROM t1 WHERE t1 MATCH 'this OR also'
;SELECT rowid FROM t1 WHERE t1 MATCH 'also OR this'
;SELECT rowid FROM t1 WHERE t1 MATCH 'something OR nothing';