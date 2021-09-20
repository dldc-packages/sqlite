-- original: fts1d.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts1(content, tokenize porter);
    INSERT INTO t1(rowid, content) VALUES(1, 'running and jumping');
    SELECT rowid FROM t1 WHERE content MATCH 'run jump'
;SELECT snippet(t1) FROM t1 WHERE t1 MATCH 'run jump'
;INSERT INTO t1(rowid, content) 
          VALUES(2, 'abcdefghijklmnopqrstuvwyxz');
    SELECT rowid, snippet(t1) FROM t1 WHERE t1 MATCH 'abcdefghijqrstuvwyxz'
;SELECT rowid, snippet(t1) FROM t1 WHERE t1 MATCH 'abcdefghijXXXXqrstuvwyxz'
;INSERT INTO t1(rowid, content) 
          VALUES(3, 'The value is 123456789');
    SELECT rowid, snippet(t1) FROM t1 WHERE t1 MATCH '123789'
;SELECT rowid, snippet(t1) FROM t1 WHERE t1 MATCH '123000000789';