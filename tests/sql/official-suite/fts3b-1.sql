-- original: fts3b.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts3(c);
  INSERT INTO t1 (c) VALUES('this is a test');
  INSERT INTO t1 (c) VALUES('that was a test');
  INSERT INTO t1 (c) VALUES('this is fun');
  DELETE FROM t1 WHERE c = 'that was a test'
;SELECT rowid FROM t1 WHERE c MATCH 'this'
;VACUUM
;SELECT rowid FROM t1 WHERE c MATCH 'this'
;CREATE VIRTUAL TABLE t2 USING fts3(c)
;BEGIN
;INSERT INTO t2 (c) VALUES (sub_text)
;COMMIT;
      BEGIN
;COMMIT
;SELECT rowid FROM t2 WHERE c MATCH 'lorem'
;VACUUM
;SELECT rowid FROM t2 WHERE c MATCH 'lorem'
;CREATE VIRTUAL TABLE t3 USING fts3(c);
  INSERT INTO t3 (c) VALUES('this is a test');
  INSERT INTO t3 (c) VALUES('that was a test');
  INSERT INTO t3 (c) VALUES('this is fun');
  DELETE FROM t3 WHERE c = 'that was a test'
;SELECT snippet(t3) FROM t3 WHERE t3 MATCH 'test'
;SELECT * FROM t3 WHERE rowid = 1
;INSERT INTO t3 VALUES ('another test')
;CREATE VIRTUAL TABLE t4 USING fts3(c);
  INSERT INTO t4 (c) VALUES('this is a test');
  INSERT INTO t4 (c) VALUES('that was a test');
  INSERT INTO t4 (c) VALUES('this is fun');
  DELETE FROM t4 WHERE c = 'that was a test'
;SELECT rowid FROM t4 WHERE rowid <> docid
;SELECT * FROM t4 WHERE rowid = 1
;SELECT docid, * FROM t4 WHERE rowid = 1
;SELECT docid, * FROM t4 WHERE docid = 1
;INSERT INTO t4 VALUES ('another test')
;INSERT INTO t4 (docid, c) VALUES (10, 'yet another test');
    SELECT * FROM t4 WHERE docid = 10
;INSERT INTO t4 (docid, c) VALUES (12, 'still testing');
    SELECT * FROM t4 WHERE docid = 12
;SELECT docid FROM t4 WHERE t4 MATCH 'testing'
;UPDATE t4 SET docid = 14 WHERE docid = 12;
    SELECT docid FROM t4 WHERE t4 MATCH 'testing'
;SELECT * FROM t4 WHERE rowid = 14
;SELECT * FROM t4 WHERE rowid = 12
;SELECT docid FROM t4 WHERE t4 MATCH 'still';