-- original: corruptG.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA page_size=512;
  CREATE TABLE t1(a,b,c);
  INSERT INTO t1(rowid,a,b,c) VALUES(52,'abc','xyz','123');
  CREATE INDEX t1abc ON t1(a,b,c);