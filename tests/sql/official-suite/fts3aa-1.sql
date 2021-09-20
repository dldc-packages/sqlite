-- original: fts3aa.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts3(content);
  INSERT INTO t1(content) VALUES('one');
  INSERT INTO t1(content) VALUES('two');
  INSERT INTO t1(content) VALUES('one two');
  INSERT INTO t1(content) VALUES('three');
  INSERT INTO t1(content) VALUES('one three');
  INSERT INTO t1(content) VALUES('two three');
  INSERT INTO t1(content) VALUES('one two three');
  INSERT INTO t1(content) VALUES('four');
  INSERT INTO t1(content) VALUES('one four');
  INSERT INTO t1(content) VALUES('two four');
  INSERT INTO t1(content) VALUES('one two four');
  INSERT INTO t1(content) VALUES('three four');
  INSERT INTO t1(content) VALUES('one three four');
  INSERT INTO t1(content) VALUES('two three four');
  INSERT INTO t1(content) VALUES('one two three four');
  INSERT INTO t1(content) VALUES('five');
  INSERT INTO t1(content) VALUES('one five');
  INSERT INTO t1(content) VALUES('two five');
  INSERT INTO t1(content) VALUES('one two five');
  INSERT INTO t1(content) VALUES('three five');
  INSERT INTO t1(content) VALUES('one three five');
  INSERT INTO t1(content) VALUES('two three five');
  INSERT INTO t1(content) VALUES('one two three five');
  INSERT INTO t1(content) VALUES('four five');
  INSERT INTO t1(content) VALUES('one four five');
  INSERT INTO t1(content) VALUES('two four five');
  INSERT INTO t1(content) VALUES('one two four five');
  INSERT INTO t1(content) VALUES('three four five');
  INSERT INTO t1(content) VALUES('one three four five');
  INSERT INTO t1(content) VALUES('two three four five');
  INSERT INTO t1(content) VALUES('one two three four five')
;SELECT rowid FROM t1 WHERE content MATCH 'one'
;SELECT rowid FROM t1 WHERE content MATCH 'one two'
;SELECT rowid FROM t1 WHERE content MATCH 'two one'
;SELECT rowid FROM t1 WHERE content MATCH 'one two three'
;SELECT rowid FROM t1 WHERE content MATCH 'one three two'
;SELECT rowid FROM t1 WHERE content MATCH 'two three one'
;SELECT rowid FROM t1 WHERE content MATCH 'two one three'
;SELECT rowid FROM t1 WHERE content MATCH 'three one two'
;SELECT rowid FROM t1 WHERE content MATCH 'three two one'
;SELECT rowid FROM t1 WHERE content MATCH 'one two THREE'
;SELECT rowid FROM t1 WHERE content MATCH '  ONE    Two   three  '
;SELECT rowid FROM t1 WHERE content MATCH '"one"'
;SELECT rowid FROM t1 WHERE content MATCH '"one two"'
;SELECT rowid FROM t1 WHERE content MATCH '"two one"'
;SELECT rowid FROM t1 WHERE content MATCH '"one two three"'
;SELECT rowid FROM t1 WHERE content MATCH '"one three two"'
;SELECT rowid FROM t1 WHERE content MATCH '"one two three four"'
;SELECT rowid FROM t1 WHERE content MATCH '"one three two four"'
;SELECT rowid FROM t1 WHERE content MATCH '"one three five"'
;SELECT rowid FROM t1 WHERE content MATCH '"one three" five'
;SELECT rowid FROM t1 WHERE content MATCH 'five "one three"'
;SELECT rowid FROM t1 WHERE content MATCH 'five "one three" four'
;SELECT rowid FROM t1 WHERE content MATCH 'five four "one three"'
;SELECT rowid FROM t1 WHERE content MATCH '"one three" four five'
;SELECT rowid FROM t1 WHERE content MATCH 'one'
;SELECT rowid FROM t1 WHERE content MATCH 'one -two'
;SELECT rowid FROM t1 WHERE content MATCH '-two one'
;SELECT rowid FROM t1 WHERE content MATCH 'one OR two'
;SELECT rowid FROM t1 WHERE content MATCH '"one two" OR three'
;SELECT rowid FROM t1 WHERE content MATCH 'three OR "one two"'
;SELECT rowid FROM t1 WHERE content MATCH 'one two OR three'
;SELECT rowid FROM t1 WHERE content MATCH 'three OR two one'
;SELECT rowid FROM t1 WHERE content MATCH 'one two OR three OR four'
;SELECT rowid FROM t1 WHERE content MATCH 'two OR three OR four one'
;INSERT INTO t1(content) VALUES(NULL)
;SELECT content FROM t1 WHERE rowid=sub_rowid
;SELECT rowid FROM t1 WHERE content MATCH NULL
;INSERT INTO t1(rowid, content) VALUES(0, 'four five')
;SELECT content FROM t1 WHERE rowid = 0
;INSERT INTO t1(rowid, content) VALUES(-1, 'three four')
;SELECT content FROM t1 WHERE rowid = -1
;SELECT rowid FROM t1 WHERE t1 MATCH 'four'
;CREATE VIRTUAL TABLE t2 USING fts3(xyz=abc);
  SELECT xyz FROM t2
;CREATE VIRTUAL TABLE t3 USING fts3(tokenize=simple, tokenize=simple);
  SELECT tokenize FROM t3
;SELECT docid FROM t0 WHERE t0 MATCH 'abc'
;SELECT docid FROM t0 WHERE t0 MATCH '"abc abc"'
;COMMIT
;SELECT docid FROM t0 WHERE t0 MATCH 'abc'
;SELECT docid FROM t0 WHERE t0 MATCH '"abc abc"';