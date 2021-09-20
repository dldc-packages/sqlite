-- original: in.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

BEGIN;
    CREATE TABLE t1(a int, b int)
;COMMIT;
    SELECT count(*) FROM t1
;SELECT a FROM t1 WHERE b BETWEEN 10 AND 50 ORDER BY a
;SELECT a FROM t1 WHERE b NOT BETWEEN 10 AND 50 ORDER BY a
;SELECT a FROM t1 WHERE b BETWEEN a AND a*5 ORDER BY a
;SELECT a FROM t1 WHERE b NOT BETWEEN a AND a*5 ORDER BY a
;SELECT a FROM t1 WHERE b BETWEEN a AND a*5 OR b=512 ORDER BY a
;SELECT a+ 100*(a BETWEEN 1 and 3) FROM t1 ORDER BY b
;SELECT a FROM t1 WHERE b IN (8,12,16,24,32) ORDER BY a
;SELECT a FROM t1 WHERE b NOT IN (8,12,16,24,32) ORDER BY a
;SELECT a FROM t1 WHERE b IN (8,12,16,24,32) OR b=512 ORDER BY a
;SELECT a FROM t1 WHERE b NOT IN (8,12,16,24,32) OR b=512 ORDER BY a
;SELECT a+100*(b IN (8,16,24)) FROM t1 ORDER BY b
;SELECT a FROM t1 WHERE b IN (b+8,64)
;SELECT a FROM t1 WHERE b IN (max(5,10,b),20)
;SELECT a FROM t1 WHERE b IN (8*2,64/2) ORDER BY b
;SELECT a FROM t1 WHERE b IN (max(5,10),20)
;SELECT a FROM t1 WHERE min(0,b IN (a,30))
;SELECT a FROM t1
    WHERE b IN (SELECT b FROM t1 WHERE a<5)
    ORDER BY a
;SELECT a FROM t1
    WHERE b IN (SELECT b FROM t1 WHERE a<5) OR b==512
    ORDER BY a
;SELECT a + 100*(b IN (SELECT b FROM t1 WHERE a<5)) FROM t1 ORDER BY b
;UPDATE t1 SET b=b*2 
    WHERE b IN (SELECT b FROM t1 WHERE a>8)
;SELECT b FROM t1 ORDER BY b
;DELETE FROM t1 WHERE b IN (SELECT b FROM t1 WHERE a>8)
;SELECT a FROM t1 ORDER BY a
;DELETE FROM t1 WHERE b NOT IN (SELECT b FROM t1 WHERE a>4)
;SELECT a FROM t1 ORDER BY a
;INSERT INTO t1 VALUES('hello', 'world');
    SELECT * FROM t1
    WHERE a IN (
       'Do','an','IN','with','a','constant','RHS','but','where','the',
       'has','many','elements','We','need','to','test','that',
       'collisions','hash','table','are','resolved','properly',
       'This','in-set','contains','thirty','one','entries','hello')
;CREATE TABLE ta(a INTEGER PRIMARY KEY, b);
    INSERT INTO ta VALUES(1,1);
    INSERT INTO ta VALUES(2,2);
    INSERT INTO ta VALUES(3,3);
    INSERT INTO ta VALUES(4,4);
    INSERT INTO ta VALUES(6,6);
    INSERT INTO ta VALUES(8,8);
    INSERT INTO ta VALUES(10,
       'This is a key that is long enough to require a malloc in the VDBE');
    SELECT * FROM ta WHERE a<10
;CREATE TABLE tb(a INTEGER PRIMARY KEY, b);
    INSERT INTO tb VALUES(1,1);
    INSERT INTO tb VALUES(2,2);
    INSERT INTO tb VALUES(3,3);
    INSERT INTO tb VALUES(5,5);
    INSERT INTO tb VALUES(7,7);
    INSERT INTO tb VALUES(9,9);
    INSERT INTO tb VALUES(11,
       'This is a key that is long enough to require a malloc in the VDBE');
    SELECT * FROM tb WHERE a<10
;SELECT a FROM ta WHERE b IN (SELECT a FROM tb)
;SELECT a FROM ta WHERE b NOT IN (SELECT a FROM tb)
;SELECT a FROM ta WHERE b IN (SELECT b FROM tb)
;SELECT a FROM ta WHERE b NOT IN (SELECT b FROM tb)
;SELECT a FROM ta WHERE a IN (SELECT a FROM tb)
;SELECT a FROM ta WHERE a NOT IN (SELECT a FROM tb)
;SELECT a FROM ta WHERE a IN (SELECT b FROM tb)
;SELECT a FROM ta WHERE a NOT IN (SELECT b FROM tb)
;SELECT a FROM t1 WHERE a IN ()
;SELECT a FROM t1 WHERE a IN (5)
;SELECT a FROM t1 WHERE a NOT IN () ORDER BY a
;SELECT a FROM t1 WHERE a IN (5) AND b IN ()
;SELECT a FROM t1 WHERE a IN (5) AND b NOT IN ()
;SELECT a FROM ta WHERE a IN ()
;SELECT a FROM ta WHERE a NOT IN ()
;SELECT * FROM ta LEFT JOIN tb ON (ta.b=tb.b) WHERE ta.a IN ()
;SELECT b FROM t1 WHERE a IN ('hello','there')
;SELECT b FROM t1 WHERE a IN ("hello",'there')
;CREATE TABLE t4 AS SELECT a FROM tb;
    SELECT * FROM t4
;SELECT b FROM t1 WHERE a IN t4
;SELECT b FROM t1 WHERE a NOT IN t4
;CREATE TABLE t5(
      a INTEGER,
      CHECK( a IN (111,222,333) )
    );
    INSERT INTO t5 VALUES(111);
    SELECT * FROM t5
;CREATE TABLE t6(a,b NUMERIC);
    INSERT INTO t6 VALUES(1,2);
    INSERT INTO t6 VALUES(2,3);
    SELECT * FROM t6 WHERE b IN (2)
;SELECT * FROM t6 WHERE b IN ('2')
;SELECT * FROM t6 WHERE +b IN ('2')
;SELECT * FROM t6 WHERE a IN ('2')
;SELECT * FROM t6 WHERE a IN (2)
;SELECT * FROM t6 WHERE +a IN ('2')
;CREATE TABLE t2(a, b, c);
    CREATE TABLE t3(a, b, c)
;SELECT 
    1 IN (NULL, 1, 2),     -- The value 1 is a member of the set, return true.
    3 IN (NULL, 1, 2),     -- Ambiguous, return NULL.
    1 NOT IN (NULL, 1, 2), -- The value 1 is a member of the set, return false.
    3 NOT IN (NULL, 1, 2)  -- Ambiguous, return NULL.
;CREATE TABLE t7(a, b, c NOT NULL);
    INSERT INTO t7 VALUES(1,    1, 1);
    INSERT INTO t7 VALUES(2,    2, 2);
    INSERT INTO t7 VALUES(3,    3, 3);
    INSERT INTO t7 VALUES(NULL, 4, 4);
    INSERT INTO t7 VALUES(NULL, 5, 5)
;SELECT 2 IN (SELECT a FROM t7)
;SELECT 6 IN (SELECT a FROM t7)
;SELECT 2 IN (SELECT b FROM t7)
;SELECT 6 IN (SELECT b FROM t7)
;SELECT 2 IN (SELECT c FROM t7)
;SELECT 6 IN (SELECT c FROM t7)
;SELECT
      2 NOT IN (SELECT a FROM t7),
      6 NOT IN (SELECT a FROM t7),
      2 NOT IN (SELECT b FROM t7),
      6 NOT IN (SELECT b FROM t7),
      2 NOT IN (SELECT c FROM t7),
      6 NOT IN (SELECT c FROM t7)
;SELECT b IN (
      SELECT inside.a 
      FROM t7 AS inside 
      WHERE inside.b BETWEEN outside.b+1 AND outside.b+2
    )
    FROM t7 AS outside ORDER BY b
;SELECT b NOT IN (
      SELECT inside.a 
      FROM t7 AS inside 
      WHERE inside.b BETWEEN outside.b+1 AND outside.b+2
    )
    FROM t7 AS outside ORDER BY b
;CREATE INDEX i1 ON t7(a);
    CREATE INDEX i2 ON t7(b);
    CREATE INDEX i3 ON t7(c)
;SELECT
      2 IN (SELECT a FROM t7),
      6 IN (SELECT a FROM t7),
      2 IN (SELECT b FROM t7),
      6 IN (SELECT b FROM t7),
      2 IN (SELECT c FROM t7),
      6 IN (SELECT c FROM t7)
;SELECT
      2 NOT IN (SELECT a FROM t7),
      6 NOT IN (SELECT a FROM t7),
      2 NOT IN (SELECT b FROM t7),
      6 NOT IN (SELECT b FROM t7),
      2 NOT IN (SELECT c FROM t7),
      6 NOT IN (SELECT c FROM t7)
;BEGIN TRANSACTION;
    CREATE TABLE a(id INTEGER);
    INSERT INTO a VALUES(1);
    INSERT INTO a VALUES(2);
    INSERT INTO a VALUES(3);
    CREATE TABLE b(id INTEGER);
    INSERT INTO b VALUES(NULL);
    INSERT INTO b VALUES(3);
    INSERT INTO b VALUES(4);
    INSERT INTO b VALUES(5);
    COMMIT;
    SELECT * FROM a WHERE id NOT IN (SELECT id FROM b)
;CREATE INDEX i5 ON b(id);
    SELECT * FROM a WHERE id NOT IN (SELECT id FROM b);