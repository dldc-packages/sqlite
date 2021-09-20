-- original: e_update.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

ATTACH 'test.db2' AS aux;
  CREATE TABLE t1(a, b);
  CREATE TABLE t2(a, b, c);
  CREATE TABLE t3(a, b UNIQUE);
  CREATE TABLE t6(x, y);
  CREATE INDEX i1 ON t1(a);

  CREATE TEMP TABLE t4(x, y);
  CREATE TEMP TABLE t6(x, y);

  CREATE TABLE aux.t1(a, b);
  CREATE TABLE aux.t5(a, b)
;INSERT INTO main.t1 VALUES(1, 'i');
  INSERT INTO main.t1 VALUES(2, 'ii');
  INSERT INTO main.t1 VALUES(3, 'iii');

  INSERT INTO aux.t1 VALUES(1, 'I');
  INSERT INTO aux.t1 VALUES(2, 'II');
  INSERT INTO aux.t1 VALUES(3, 'III')
;DELETE FROM main.t1;
  INSERT INTO main.t1 VALUES(1, 'i');
  INSERT INTO main.t1 VALUES(2, 'ii');
  INSERT INTO main.t1 VALUES(3, 'iii')
;DELETE FROM main.t1;
  INSERT INTO main.t1 VALUES(NULL, '');
  INSERT INTO main.t1 VALUES(1, 'i');
  INSERT INTO main.t1 VALUES(2, 'ii');
  INSERT INTO main.t1 VALUES(3, 'iii')
;DELETE FROM main.t1;
  INSERT INTO main.t1 VALUES(NULL, '');
  INSERT INTO main.t1 VALUES(1, 'i');
  INSERT INTO main.t1 VALUES(2, 'ii');
  INSERT INTO main.t1 VALUES(3, 'iii')
;INSERT INTO t2(rowid, a, b, c) VALUES(1,  3, 1, 4);
  INSERT INTO t2(rowid, a, b, c) VALUES(2,  1, 5, 9);
  INSERT INTO t2(rowid, a, b, c) VALUES(3,  2, 6, 5)
;DELETE FROM t2;
  INSERT INTO t2(rowid, a, b, c) VALUES(1,  3, 1, 4);
  INSERT INTO t2(rowid, a, b, c) VALUES(2,  1, 5, 9);
  INSERT INTO t2(rowid, a, b, c) VALUES(3,  2, 6, 5)
;DELETE FROM t3;
  INSERT INTO t3 VALUES(1, 'one');
  INSERT INTO t3 VALUES(2, 'two');
  INSERT INTO t3 VALUES(3, 'three');
  INSERT INTO t3 VALUES(4, 'four')
;DROP TRIGGER tr1;
  DROP TRIGGER aux.tr1
;SELECT 'main', tbl_name FROM main.sqlite_master WHERE type = 'table';
  SELECT 'temp', tbl_name FROM sqlite_temp_master WHERE type = 'table';
  SELECT 'aux', tbl_name FROM aux.sqlite_master WHERE type = 'table'
;DELETE FROM main.t6;
  DELETE FROM temp.t6;
  INSERT INTO main.t6 VALUES(1, 2);
  INSERT INTO temp.t6 VALUES(1, 2);

  CREATE TRIGGER temp.tr1 AFTER INSERT ON t4 BEGIN
    UPDATE t6 SET x=x+1;
  END;

  INSERT INTO t4 VALUES(1, 2);
  SELECT * FROM main.t6;
  SELECT * FROM temp.t6
;DELETE FROM main.t1;
  DELETE FROM aux.t1;
  INSERT INTO main.t1 VALUES(1, 2);
  INSERT INTO aux.t1 VALUES(1, 2);

  CREATE TRIGGER temp.tr2 AFTER DELETE ON t4 BEGIN
    UPDATE t1 SET a=a+1;
  END;

  DELETE FROM t4;
  SELECT * FROM main.t1;
  SELECT * FROM aux.t1
;DELETE FROM aux.t5;
  INSERT INTO aux.t5 VALUES(1, 2);

  INSERT INTO t4 VALUES('x', 'y');
  CREATE TRIGGER temp.tr3 AFTER UPDATE ON t4 BEGIN
    UPDATE t5 SET a=a+1;
  END;

  UPDATE t4 SET x=10;
  SELECT * FROM aux.t5
;CREATE TABLE t7(q, r, s);
  INSERT INTO t7 VALUES(1, 'one',   'X');
  INSERT INTO t7 VALUES(2, 'two',   'X');
  INSERT INTO t7 VALUES(3, 'three', 'X');
  INSERT INTO t7 VALUES(4, 'four',  'X');
  INSERT INTO t7 VALUES(5, 'five',  'X');
  INSERT INTO t7 VALUES(6, 'six',   'X');
  INSERT INTO t7 VALUES(7, 'seven', 'X');
  INSERT INTO t7 VALUES(8, 'eight', 'X');
  INSERT INTO t7 VALUES(9, 'nine',  'X');
  INSERT INTO t7 VALUES(10, 'ten',  'X')
;CREATE TABLE t8(x);
  CREATE TRIGGER tr7 BEFORE UPDATE ON t7 BEGIN
    INSERT INTO t8 VALUES(old.q);
  END;