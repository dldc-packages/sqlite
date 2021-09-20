-- original: triggerC.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA recursive_triggers = on
;CREATE TABLE t1(a, b, c);
    CREATE TABLE log(t, a1, b1, c1, a2, b2, c2);
    CREATE TRIGGER trig1 BEFORE INSERT ON t1 BEGIN
      INSERT INTO log VALUES('before', NULL, NULL, NULL, new.a, new.b, new.c);
    END;
    CREATE TRIGGER trig2 AFTER INSERT ON t1 BEGIN
      INSERT INTO log VALUES('after', NULL, NULL, NULL, new.a, new.b, new.c);
    END;
    CREATE TRIGGER trig3 BEFORE UPDATE ON t1 BEGIN
      INSERT INTO log VALUES('before', old.a,old.b,old.c, new.a,new.b,new.c);
    END;
    CREATE TRIGGER trig4 AFTER UPDATE ON t1 BEGIN
      INSERT INTO log VALUES('after', old.a,old.b,old.c, new.a,new.b,new.c);
    END;

    CREATE TRIGGER trig5 BEFORE DELETE ON t1 BEGIN
      INSERT INTO log VALUES('before', old.a,old.b,old.c, NULL,NULL,NULL);
    END;
    CREATE TRIGGER trig6 AFTER DELETE ON t1 BEGIN
      INSERT INTO log VALUES('after', old.a,old.b,old.c, NULL,NULL,NULL);
    END
;INSERT INTO t1 VALUES('A', 'B', 'C');
    SELECT * FROM log
;SELECT * FROM t1
;DELETE FROM log;
    UPDATE t1 SET a = 'a';
    SELECT * FROM log
;SELECT * FROM t1
;DELETE FROM log;
    DELETE FROM t1;
    SELECT * FROM log
;SELECT * FROM t1
;CREATE TABLE t4(a, b);
    CREATE TRIGGER t4t AFTER DELETE ON t4 BEGIN
      SELECT RAISE(ABORT, 'delete is not supported');
    END
;INSERT INTO t4 VALUES(1, 2)
;SELECT * FROM t4
;CREATE TABLE t5 (a primary key, b, c);
    INSERT INTO t5 values (1, 2, 3);
    CREATE TRIGGER au_tbl AFTER UPDATE ON t5 BEGIN
      UPDATE OR IGNORE t5 SET a = new.a, c = 10;
    END
;CREATE TABLE t6(a INTEGER PRIMARY KEY, b);
    INSERT INTO t6 VALUES(1, 2);
    create trigger r1 after update on t6 for each row begin
      SELECT 1;
    end;
    UPDATE t6 SET a=a
;DROP TABLE t1;
    CREATE TABLE cnt(n);
    INSERT INTO cnt VALUES(0);
    CREATE TABLE t1(a INTEGER PRIMARY KEY, b UNIQUE, c, d, e);
    CREATE INDEX t1cd ON t1(c,d);
    CREATE TRIGGER t1r1 AFTER UPDATE ON t1 BEGIN UPDATE cnt SET n=n+1; END;
    INSERT INTO t1 VALUES(1,2,3,4,5);
    INSERT INTO t1 VALUES(6,7,8,9,10);
    INSERT INTO t1 VALUES(11,12,13,14,15)
;CREATE TABLE t2(a PRIMARY KEY)
;DELETE FROM t2
;CREATE TABLE t3(a, b);
    CREATE TRIGGER t3i AFTER INSERT ON t3 BEGIN
      DELETE FROM t3 WHERE rowid = new.rowid;
    END;
    CREATE TRIGGER t3d AFTER DELETE ON t3 BEGIN
      INSERT INTO t3 VALUES(old.a, old.b);
    END
;SELECT * FROM t3
;SELECT * FROM t3b
;SELECT count(*), max(x), min(x) FROM t3b
;SELECT count(*), max(x), min(x) FROM t3b
;SELECT count(*), max(x), min(x) FROM t3b
;SELECT count(*), max(x), min(x) FROM t3b
;SELECT count(*), max(x), min(x) FROM t3b
;SELECT count(*), max(x), min(x) FROM t3b
;CREATE TABLE log(t);
    CREATE TABLE t4(a TEXT,b INTEGER,c REAL);
    CREATE TRIGGER t4bi BEFORE INSERT ON t4 BEGIN
      INSERT INTO log VALUES(new.rowid || ' ' || typeof(new.rowid) || ' ' ||
                             new.a     || ' ' || typeof(new.a)     || ' ' ||
                             new.b     || ' ' || typeof(new.b)     || ' ' ||
                             new.c     || ' ' || typeof(new.c)
      );
    END;
    CREATE TRIGGER t4ai AFTER INSERT ON t4 BEGIN
      INSERT INTO log VALUES(new.rowid || ' ' || typeof(new.rowid) || ' ' ||
                             new.a     || ' ' || typeof(new.a)     || ' ' ||
                             new.b     || ' ' || typeof(new.b)     || ' ' ||
                             new.c     || ' ' || typeof(new.c)
      );
    END;
    CREATE TRIGGER t4bd BEFORE DELETE ON t4 BEGIN
      INSERT INTO log VALUES(old.rowid || ' ' || typeof(old.rowid) || ' ' ||
                             old.a     || ' ' || typeof(old.a)     || ' ' ||
                             old.b     || ' ' || typeof(old.b)     || ' ' ||
                             old.c     || ' ' || typeof(old.c)
      );
    END;
    CREATE TRIGGER t4ad AFTER DELETE ON t4 BEGIN
      INSERT INTO log VALUES(old.rowid || ' ' || typeof(old.rowid) || ' ' ||
                             old.a     || ' ' || typeof(old.a)     || ' ' ||
                             old.b     || ' ' || typeof(old.b)     || ' ' ||
                             old.c     || ' ' || typeof(old.c)
      );
    END;
    CREATE TRIGGER t4bu BEFORE UPDATE ON t4 BEGIN
      INSERT INTO log VALUES(old.rowid || ' ' || typeof(old.rowid) || ' ' ||
                             old.a     || ' ' || typeof(old.a)     || ' ' ||
                             old.b     || ' ' || typeof(old.b)     || ' ' ||
                             old.c     || ' ' || typeof(old.c)
      );
      INSERT INTO log VALUES(new.rowid || ' ' || typeof(new.rowid) || ' ' ||
                             new.a     || ' ' || typeof(new.a)     || ' ' ||
                             new.b     || ' ' || typeof(new.b)     || ' ' ||
                             new.c     || ' ' || typeof(new.c)
      );
    END;
    CREATE TRIGGER t4au AFTER UPDATE ON t4 BEGIN
      INSERT INTO log VALUES(old.rowid || ' ' || typeof(old.rowid) || ' ' ||
                             old.a     || ' ' || typeof(old.a)     || ' ' ||
                             old.b     || ' ' || typeof(old.b)     || ' ' ||
                             old.c     || ' ' || typeof(old.c)
      );
      INSERT INTO log VALUES(new.rowid || ' ' || typeof(new.rowid) || ' ' ||
                             new.a     || ' ' || typeof(new.a)     || ' ' ||
                             new.b     || ' ' || typeof(new.b)     || ' ' ||
                             new.c     || ' ' || typeof(new.c)
      );
    END
;DROP TABLE IF EXISTS t5;
    CREATE TABLE t5(a INTEGER PRIMARY KEY, b);
    CREATE UNIQUE INDEX t5i ON t5(b);
    INSERT INTO t5 VALUES(1, 'a');
    INSERT INTO t5 VALUES(2, 'b');
    INSERT INTO t5 VALUES(3, 'c');

    CREATE TABLE t5g(a, b, c);
    CREATE TRIGGER t5t BEFORE DELETE ON t5 BEGIN
      INSERT INTO t5g VALUES(old.a, old.b, (SELECT count(*) FROM t5));
    END
;DROP TRIGGER t5t;
    CREATE TRIGGER t5t AFTER DELETE ON t5 BEGIN
      INSERT INTO t5g VALUES(old.a, old.b, (SELECT count(*) FROM t5));
    END
;PRAGMA recursive_triggers = off
;PRAGMA recursive_triggers = on
;PRAGMA recursive_triggers
;PRAGMA recursive_triggers = off;
    PRAGMA recursive_triggers
;PRAGMA recursive_triggers = on;
    PRAGMA recursive_triggers
;CREATE TABLE t8(x);
    CREATE TABLE t7(a, b);
    INSERT INTO t7 VALUES(1, 2);
    INSERT INTO t7 VALUES(3, 4);
    INSERT INTO t7 VALUES(5, 6);
    CREATE TRIGGER t7t BEFORE UPDATE ON t7 BEGIN
      DELETE FROM t7 WHERE a = 1;
    END;
    CREATE TRIGGER t7ta AFTER UPDATE ON t7 BEGIN
      INSERT INTO t8 VALUES('after fired ' || old.rowid || '->' || new.rowid);
    END
;BEGIN;
      UPDATE t7 SET b=7 WHERE a = 5;
      SELECT * FROM t7;
      SELECT * FROM t8;
    ROLLBACK
;BEGIN;
      UPDATE t7 SET b=7 WHERE a = 1;
      SELECT * FROM t7;
      SELECT * FROM t8;
    ROLLBACK
;DROP TRIGGER t7t;
    CREATE TRIGGER t7t BEFORE UPDATE ON t7 WHEN (old.rowid!=1 OR new.rowid!=8)
    BEGIN
      UPDATE t7 set rowid = 8 WHERE rowid=1;
    END
;BEGIN;
      UPDATE t7 SET b=7 WHERE a = 5;
      SELECT rowid, * FROM t7;
      SELECT * FROM t8;
    ROLLBACK
;BEGIN;
      UPDATE t7 SET b=7 WHERE a = 1;
      SELECT rowid, * FROM t7;
      SELECT * FROM t8;
    ROLLBACK
;DROP TRIGGER t7t;
    DROP TRIGGER t7ta;
    CREATE TRIGGER t7t BEFORE DELETE ON t7 BEGIN
      UPDATE t7 set rowid = 8 WHERE rowid=1;
    END;
    CREATE TRIGGER t7ta AFTER DELETE ON t7 BEGIN
      INSERT INTO t8 VALUES('after fired ' || old.rowid);
    END
;BEGIN;
      DELETE FROM t7 WHERE a = 3;
      SELECT rowid, * FROM t7;
      SELECT * FROM t8;
    ROLLBACK
;BEGIN;
      DELETE FROM t7 WHERE a = 1;
      SELECT rowid, * FROM t7;
      SELECT * FROM t8;
    ROLLBACK
;CREATE TABLE t9(a,b);
    CREATE INDEX t9b ON t9(b);
    INSERT INTO t9 VALUES(1,0);
    INSERT INTO t9 VALUES(2,1);
    INSERT INTO t9 VALUES(3,2);
    INSERT INTO t9 SELECT a+3, a+2 FROM t9;
    INSERT INTO t9 SELECT a+6, a+5 FROM t9;
    SELECT a FROM t9 ORDER BY a
;CREATE TRIGGER t9r1 AFTER DELETE ON t9 BEGIN
      DELETE FROM t9 WHERE b=old.a;
    END;
    DELETE FROM t9 WHERE b=4;
    SELECT a FROM t9 ORDER BY a
;CREATE TABLE t10(a, updatecnt DEFAULT 0);
    CREATE TRIGGER t10_bu BEFORE UPDATE OF a ON t10 BEGIN
      UPDATE t10 SET updatecnt = updatecnt+1 WHERE rowid = old.rowid;
    END;
    INSERT INTO t10(a) VALUES('hello')
;UPDATE t10 SET a = 'world';
    SELECT * FROM t10
;UPDATE t10 SET a = 'tcl', updatecnt = 5;
    SELECT * FROM t10
;CREATE TABLE t11(
      c1,   c2,  c3,  c4,  c5,  c6,  c7,  c8,  c9, c10,
      c11, c12, c13, c14, c15, c16, c17, c18, c19, c20,
      c21, c22, c23, c24, c25, c26, c27, c28, c29, c30,
      c31, c32, c33, c34, c35, c36, c37, c38, c39, c40
    );

    CREATE TRIGGER t11_bu BEFORE UPDATE OF c1 ON t11 BEGIN
      UPDATE t11 SET c31 = c31+1, c32=c32+1 WHERE rowid = old.rowid;
    END;

    INSERT INTO t11 VALUES(
      1,   2,  3,  4,  5,  6,  7,  8,  9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      31, 32, 33, 34, 35, 36, 37, 38, 39, 40
    )
;UPDATE t11 SET c4=35, c33=22, c1=5;
    SELECT * FROM t11
;CREATE TABLE log(a, b)
;DELETE FROM log
;CREATE TRIGGER tt1 BEFORE INSERT ON t1 BEGIN 
        INSERT INTO log VALUES(new.a, new.b);
      END;
      INSERT INTO t1 DEFAULT VALUES;
      SELECT * FROM log
;DELETE FROM log
;CREATE TRIGGER tt2 AFTER INSERT ON t1 BEGIN 
        INSERT INTO log VALUES(new.a, new.b);
      END;
      INSERT INTO t1 DEFAULT VALUES;
      SELECT * FROM log
;DROP TRIGGER tt1
;DELETE FROM log
;INSERT INTO t1 DEFAULT VALUES;
      SELECT * FROM log
;DELETE FROM log;
    CREATE TABLE t2(a, b);
    CREATE VIEW v2 AS SELECT * FROM t2;
    CREATE TRIGGER tv2 INSTEAD OF INSERT ON v2 BEGIN
      INSERT INTO log VALUES(new.a, new.b);
    END;
    INSERT INTO v2 DEFAULT VALUES;
    SELECT a, b, a IS NULL, b IS NULL FROM log
;CREATE TABLE t1(a, b);
    INSERT INTO t1 VALUES(1, 2);
    INSERT INTO t1 VALUES(3, 4);
    INSERT INTO t1 VALUES(5, 6);
    CREATE TRIGGER tr1 AFTER INSERT ON t1 BEGIN SELECT 1 ; END ;
    SELECT count(*) FROM sqlite_master
;SELECT * FROM t1
;DROP TRIGGER tr1
;SELECT count(*) FROM sqlite_master
;PRAGMA recursive_triggers = ON;
  CREATE TABLE t12(a, b);
  INSERT INTO t12 VALUES(1, 2);
  CREATE TRIGGER tr12 AFTER UPDATE ON t12 BEGIN
    UPDATE t12 SET a=new.a+1, b=new.b+1;
  END
;PRAGMA recursive_triggers = 1;
  CREATE TABLE node(
      id int not null primary key, 
      pid int not null default 0 references node,
      key varchar not null, 
      path varchar default '',
      unique(pid, key)
      );
  CREATE TRIGGER node_delete_referencing AFTER DELETE ON "node"
    BEGIN
    DELETE FROM "node" WHERE pid = old."id";
  END
;INSERT INTO node(id, pid, key) VALUES(9, 0, 'test');
  INSERT INTO node(id, pid, key) VALUES(90, 9, 'test1');
  INSERT INTO node(id, pid, key) VALUES(900, 90, 'test2');
  DELETE FROM node WHERE id=9;
  SELECT * FROM node
;CREATE TABLE   x1  (x);

  CREATE TABLE   x2  (a, b);
  CREATE TABLE '"x2"'(a, b);

  INSERT INTO x2 VALUES(1, 2);
  INSERT INTO x2 VALUES(3, 4);
  INSERT INTO '"x2"' SELECT * FROM x2;

  CREATE TRIGGER x1ai AFTER INSERT ON x1 BEGIN
    INSERT INTO """x2""" VALUES('x', 'y');
    DELETE FROM """x2""" WHERE a=1;
    UPDATE """x2""" SET b = 11 WHERE a = 3;
  END;

  INSERT INTO x1 VALUES('go!')
;SELECT * FROM x2
;SELECT * FROM """x2""";