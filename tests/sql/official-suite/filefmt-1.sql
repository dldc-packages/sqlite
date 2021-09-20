-- original: filefmt.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(x)
;PRAGMA auto_vacuum=OFF
;PRAGMA page_size=sub_pagesize
;CREATE TABLE t1(x)
;PRAGMA page_size=512; CREATE TABLE t1(x)
;PRAGMA page_size = 1024;
  PRAGMA auto_vacuum = 0;
  CREATE TABLE t1(a);
  CREATE INDEX i1 ON t1(a);
  INSERT INTO t1 VALUES(a_string(3000));
  CREATE TABLE t2(a);
  INSERT INTO t2 VALUES(1)
;INSERT INTO t2 VALUES(2)
;PRAGMA page_size = 1024;
  PRAGMA auto_vacuum = 0;
  CREATE TABLE t1(a);
  CREATE INDEX i1 ON t1(a);
  INSERT INTO t1 VALUES(a_string(3000));
  CREATE TABLE t2(a);
  INSERT INTO t2 VALUES(1)
;PRAGMA integrity_check;
  BEGIN;
    INSERT INTO t2 VALUES(2);
    SAVEPOINT a;
      INSERT INTO t2 VALUES(3);
    ROLLBACK TO a
;COMMIT
;PRAGMA auto_vacuum = 1;
  CREATE TABLE t1(a, b)
;SELECT * FROM sqlite_master;
  PRAGMA integrity_check
;PRAGMA auto_vacuum = 1;
  CREATE TABLE t1(x, y);
  CREATE TABLE t2(x, y);

  INSERT INTO t1 VALUES(randomblob(100), randomblob(100));
  INSERT INTO t1 VALUES(randomblob(100), randomblob(100));
  INSERT INTO t1 VALUES(randomblob(100), randomblob(100));
  INSERT INTO t1 VALUES(randomblob(100), randomblob(100));
  INSERT INTO t1 VALUES(randomblob(100), randomblob(100));
  INSERT INTO t1 VALUES(randomblob(100), randomblob(100));

  INSERT INTO t2 SELECT randomblob(100), randomblob(100) FROM t1;
  INSERT INTO t2 SELECT randomblob(100), randomblob(100) FROM t1;
  INSERT INTO t2 SELECT randomblob(100), randomblob(100) FROM t1;
  INSERT INTO t2 SELECT randomblob(100), randomblob(100) FROM t1
;PRAGMA integrity_check;