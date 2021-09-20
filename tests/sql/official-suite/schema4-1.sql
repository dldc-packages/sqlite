-- original: schema4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE log(x, a, b);
  CREATE TABLE tbl(a, b);

  CREATE TABLE t1(a, b);
  CREATE VIEW v1 AS SELECT * FROM tbl;
  CREATE INDEX i1 ON tbl(a)
;CREATE TRIGGER t1 AFTER INSERT ON tbl BEGIN
    INSERT INTO log VALUES('after insert', new.a, new.b);
  END;
  CREATE TRIGGER v1 AFTER UPDATE ON tbl BEGIN
    INSERT INTO log VALUES('after update', new.a, new.b);
  END;
  CREATE TRIGGER i1 AFTER DELETE ON tbl BEGIN
    INSERT INTO log VALUES('after delete', old.a, old.b);
  END
;INSERT INTO tbl VALUES(1, 2);
  UPDATE tbl SET b=a+b, a=a+1;
  DELETE FROM tbl;

  SELECT x, a, b FROM log
;DELETE FROM log;

  DROP INDEX i1;
  DROP TABLE t1;
  DROP VIEW v1;

  INSERT INTO tbl VALUES(1, 2);
  UPDATE tbl SET b=a+b, a=a+1;
  DELETE FROM tbl;

  SELECT x, a, b FROM log
;DELETE FROM log;
  INSERT INTO tbl VALUES(1, 2);
  UPDATE tbl SET b=a+b, a=a+1;
  DELETE FROM tbl;
  SELECT x, a, b FROM log
;CREATE TABLE t1(a, b);
  CREATE VIEW v1 AS SELECT * FROM tbl;
  CREATE INDEX i1 ON tbl(a)
;DROP TABLE t1;
    CREATE VIRTUAL TABLE t1 USING fts3
;DELETE FROM log;
    DROP TABLE t1;
    INSERT INTO tbl VALUES(1, 2);
    UPDATE tbl SET b=a+b, a=a+1;
    DELETE FROM tbl;
    SELECT x, a, b FROM log
;CREATE TABLE log(x, a, b);
    CREATE TABLE tbl(a, b);
  
    CREATE TABLE t1(a, b);
    CREATE INDEX i1 ON t1(a, b)
;CREATE TRIGGER t1 AFTER INSERT ON tbl BEGIN
      INSERT INTO log VALUES('after insert', new.a, new.b);
    END;
    CREATE TRIGGER i1 AFTER DELETE ON tbl BEGIN
      INSERT INTO log VALUES('after delete', old.a, old.b);
    END
;ALTER TABLE t1 RENAME TO t2
;INSERT INTO tbl VALUES('a', 'b');
    DELETE FROM tbl;
    SELECT * FROM log
;DELETE FROM log;
    INSERT INTO tbl VALUES('c', 'd');
    DELETE FROM tbl;
    SELECT * FROM log
;CREATE TEMP TRIGGER x1 AFTER UPDATE ON tbl BEGIN
      INSERT INTO log VALUES('after update', new.a, new.b);
    END;

    CREATE TEMP TABLE x1(x);
    INSERT INTO x1 VALUES(123)
;select sql from sqlite_temp_master WHERE type='table'
;ALTER TABLE tbl RENAME TO tbl2
;select sql from sqlite_temp_master WHERE type='table'
;DELETE FROM log;
    INSERT INTO tbl2 VALUES('e', 'f');
    UPDATE tbl2 SET a='g', b='h';
    DELETE FROM tbl2;
    SELECT * FROM log
;INSERT INTO x1 VALUES(456);
    SELECT * FROM x1;