-- original: fts3tok1.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts3tokenize(simple);
  CREATE VIRTUAL TABLE t2 USING fts3tokenize();
  CREATE VIRTUAL TABLE t3 USING fts3tokenize(simple, '', 'xyz ')
;SELECT token FROM t3 WHERE input = '1x2x3x'
;SELECT token FROM t1 WHERE input = '1x2x3x'
;SELECT token FROM t3 WHERE input = '1''2x3x'
;SELECT token FROM t3 WHERE input = ''
;SELECT token FROM t3 WHERE input = NULL
;SELECT * FROM t3 WHERE input = 123
;SELECT * FROM t1 WHERE input = 'a b c' AND token = 'b'
;SELECT * FROM t1 WHERE token = 'b' AND input = 'a b c'
;SELECT * FROM t1 WHERE input < 'b' AND input = 'a b c'
;CREATE TABLE c1(x);
  INSERT INTO c1(x) VALUES('a b c');
  INSERT INTO c1(x) VALUES('d e f')
;SELECT * FROM c1, t1 WHERE input = x AND c1.rowid=t1.rowid;