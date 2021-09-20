-- original: e_changes.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a, b);
  CREATE TABLE t2(x, y, PRIMARY KEY(x, y)) WITHOUT ROWID;
  CREATE INDEX i1 ON t1(a);
  CREATE INDEX i2 ON t2(y)
;INSERT INTO t1 VALUES(-1, -1)
;CREATE TABLE log(x);
  CREATE TABLE p1(one PRIMARY KEY, two);

  CREATE TRIGGER tr_ai AFTER INSERT ON p1 BEGIN
    INSERT INTO log VALUES('insert');
  END;
  CREATE TRIGGER tr_bd BEFORE DELETE ON p1 BEGIN
    INSERT INTO log VALUES('delete');
  END;
  CREATE TRIGGER tr_au AFTER UPDATE ON p1 BEGIN
    INSERT INTO log VALUES('update');
  END
;-- None of the inserts on table log were counted.
  SELECT count(*) FROM log
;DELETE FROM p1;
  INSERT INTO p1 VALUES('a', 'A'), ('b', 'B'), ('c', 'C');

  CREATE TABLE c1(a, b, FOREIGN KEY(a) REFERENCES p1 ON DELETE SET NULL);
  CREATE TABLE c2(a, b, FOREIGN KEY(a) REFERENCES p1 ON DELETE SET DEFAULT);
  CREATE TABLE c3(a, b, FOREIGN KEY(a) REFERENCES p1 ON DELETE CASCADE);
  INSERT INTO c1 VALUES('a', 'aaa');
  INSERT INTO c2 VALUES('b', 'bbb');
  INSERT INTO c3 VALUES('c', 'ccc');

  INSERT INTO p1 VALUES('d', 'D'), ('e', 'E'), ('f', 'F');
  CREATE TABLE c4(a, b, FOREIGN KEY(a) REFERENCES p1 ON UPDATE SET NULL);
  CREATE TABLE c5(a, b, FOREIGN KEY(a) REFERENCES p1 ON UPDATE SET DEFAULT);
  CREATE TABLE c6(a, b, FOREIGN KEY(a) REFERENCES p1 ON UPDATE CASCADE);
  INSERT INTO c4 VALUES('d', 'aaa');
  INSERT INTO c5 VALUES('e', 'bbb');
  INSERT INTO c6 VALUES('f', 'ccc');

  PRAGMA foreign_keys = ON
;SELECT * FROM c1;
  SELECT * FROM c2;
  SELECT * FROM c3
;SELECT * FROM c4;
  SELECT * FROM c5;
  SELECT * FROM c6
;CREATE TABLE r1(a UNIQUE, b UNIQUE);
  INSERT INTO r1 VALUES('i', 'i');
  INSERT INTO r1 VALUES('ii', 'ii');
  INSERT INTO r1 VALUES('iii', 'iii');
  INSERT INTO r1 VALUES('iv', 'iv');
  INSERT INTO r1 VALUES('v', 'v');
  INSERT INTO r1 VALUES('vi', 'vi');
  INSERT INTO r1 VALUES('vii', 'vii')
;SELECT * FROM r1 ORDER BY a
;CREATE TABLE log(log);
  CREATE TABLE t1(x, y);
  INSERT INTO t1 VALUES(1, 2);
  INSERT INTO t1 VALUES(3, 4);
  INSERT INTO t1 VALUES(5, 6);

  CREATE VIEW v1 AS SELECT * FROM t1;
  CREATE TRIGGER v1_i INSTEAD OF INSERT ON v1 BEGIN
    INSERT INTO log VALUES('insert');
  END;
  CREATE TRIGGER v1_u INSTEAD OF UPDATE ON v1 BEGIN
    INSERT INTO log VALUES('update'), ('update');
  END;
  CREATE TRIGGER v1_d INSTEAD OF DELETE ON v1 BEGIN
    INSERT INTO log VALUES('delete'), ('delete'), ('delete');
  END
;CREATE TABLE t1(a INTEGER PRIMARY KEY, b);
  CREATE TABLE t2(x);
  INSERT INTO t1 VALUES(1, NULL);
  INSERT INTO t1 VALUES(2, NULL);
  INSERT INTO t1 VALUES(3, NULL);
  CREATE TRIGGER AFTER UPDATE ON t1 BEGIN
    INSERT INTO t2 VALUES('a'), ('b'), ('c');
    SELECT my_changes('trigger');
  END
;INSERT INTO t2 VALUES('a'), ('b');
  UPDATE t1 SET b = my_changes('update');
  SELECT * FROM t1
;CREATE TABLE t1(a, b);
  CREATE TABLE log(x);
  INSERT INTO t1 VALUES(1, 0);
  INSERT INTO t1 VALUES(2, 0);
  INSERT INTO t1 VALUES(3, 0);
  CREATE TRIGGER t1_a_u AFTER UPDATE ON t1 BEGIN
    INSERT INTO log VALUES(old.b || ' -> ' || new.b || ' c = ' || changes() );
  END;
  CREATE TABLE t2(a);
  INSERT INTO t2 VALUES(1), (2), (3);
  UPDATE t1 SET b = changes()
;SELECT * FROM t1
;SELECT * FROM log
;CREATE TABLE t1(a, b);
  CREATE TABLE t2(a, b);
  CREATE TABLE t3(a, b);
  CREATE TABLE log(x);

  CREATE TRIGGER t1_i BEFORE INSERT ON t1 BEGIN
    INSERT INTO t2 VALUES(new.a, new.b), (new.a, new.b);
    INSERT INTO log VALUES('t2->' || changes());
  END;

  CREATE TRIGGER t2_i AFTER INSERT ON t2 BEGIN
    INSERT INTO t3 VALUES(new.a, new.b), (new.a, new.b), (new.a, new.b);
    INSERT INTO log VALUES('t3->' || changes());
  END;

  CREATE TRIGGER t1_u AFTER UPDATE ON t1 BEGIN
    UPDATE t2 SET b=new.b WHERE a=old.a;
    INSERT INTO log VALUES('t2->' || changes());
  END;

  CREATE TRIGGER t2_u BEFORE UPDATE ON t2 BEGIN
    UPDATE t3 SET b=new.b WHERE a=old.a;
    INSERT INTO log VALUES('t3->' || changes());
  END;

  CREATE TRIGGER t1_d AFTER DELETE ON t1 BEGIN
    DELETE FROM t2 WHERE a=old.a AND b=old.b;
    INSERT INTO log VALUES('t2->' || changes());
  END;

  CREATE TRIGGER t2_d BEFORE DELETE ON t2 BEGIN
    DELETE FROM t3 WHERE a=old.a AND b=old.b;
    INSERT INTO log VALUES('t3->' || changes());
  END
;CREATE TABLE q1(t);
  CREATE TABLE q2(u, v);
  CREATE TABLE q3(w);

  CREATE TRIGGER q2_insert BEFORE INSERT ON q2 BEGIN

    /* changes() returns value from previous I/U/D in callers context */
    INSERT INTO q1 VALUES('1:' || changes());

    /* changes() returns value of previous I/U/D in this context */
    INSERT INTO q3 VALUES(changes()), (2), (3);
    INSERT INTO q1 VALUES('2:' || changes());
    INSERT INTO q3 VALUES(changes() + 3), (changes()+4);
    SELECT 'this does not affect things!';
    INSERT INTO q1 VALUES('3:' || changes());
    UPDATE q3 SET w = w+10 WHERE w%2;
    INSERT INTO q1 VALUES('4:' || changes());
    DELETE FROM q3;
    INSERT INTO q1 VALUES('5:' || changes());
  END
;INSERT INTO q2 VALUES('x', 'y');
  SELECT * FROM q1
;DELETE FROM q1;
  INSERT INTO q2 VALUES('x', 'y');
  SELECT * FROM q1;