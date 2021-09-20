-- original: insert.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE test1(one int, two int, three int)
;INSERT INTO test1 VALUES(1,2,3)
;SELECT * FROM test1
;INSERT INTO test1 VALUES(4,5,6)
;SELECT * FROM test1 ORDER BY one
;INSERT INTO test1 VALUES(7,8,9)
;SELECT * FROM test1 ORDER BY one
;DELETE FROM test1
;INSERT INTO test1(one,two) VALUES(1,2)
;SELECT * FROM test1 ORDER BY one
;INSERT INTO test1(two,three) VALUES(5,6)
;SELECT * FROM test1 ORDER BY one
;INSERT INTO test1(three,one) VALUES(7,8)
;SELECT * FROM test1 ORDER BY one
;CREATE TABLE test2(
      f1 int default -111, 
      f2 real default +4.32,
      f3 int default +222,
      f4 int default 7.89
    )
;SELECT * from test2
;INSERT INTO test2(f1,f3) VALUES(+10,-10)
;SELECT * FROM test2
;INSERT INTO test2(f2,f4) VALUES(1.23,-3.45)
;SELECT * FROM test2 WHERE f1==-111
;INSERT INTO test2(f1,f2,f4) VALUES(77,+1.23,3.45)
;SELECT * FROM test2 WHERE f1==77
;DROP TABLE test2;
    CREATE TABLE test2(
      f1 int default 111, 
      f2 real default -4.32,
      f3 text default hi,
      f4 text default 'abc-123',
      f5 varchar(10)
    )
;SELECT * from test2
;INSERT INTO test2(f2,f4) VALUES(-2.22,'hi!')
;SELECT * FROM test2
;INSERT INTO test2(f1,f5) VALUES(1,'xyzzy')
;SELECT * FROM test2 ORDER BY f1
;DELETE FROM test2;
    CREATE INDEX index9 ON test2(f1,f2);
    CREATE INDEX indext ON test2(f4,f5);
    SELECT * from test2
;INSERT INTO test2(f2,f4) VALUES(-3.33,'hum')
;SELECT * FROM test2 WHERE f1='111' AND f2=-3.33
;INSERT INTO test2(f1,f2,f5) VALUES(22,-4.44,'wham')
;SELECT * FROM test2 WHERE f1='111' AND f2=-3.33
;SELECT * FROM test2 WHERE f1=22 AND f2=-4.44
;CREATE TABLE t3(a,b,c);
    INSERT INTO t3 VALUES(1+2+3,4,5);
    SELECT * FROM t3
;INSERT INTO t3 VALUES((SELECT max(a) FROM t3)+1,5,6)
;SELECT max(a) FROM t3
;INSERT INTO t3 VALUES(sub_maxa+1,5,6)
;SELECT * FROM t3 ORDER BY a
;INSERT INTO t3 VALUES((SELECT b FROM t3 WHERE a=0),6,7)
;SELECT b FROM t3 WHERE a = 0
;INSERT INTO t3 VALUES(sub_b,6,7)
;SELECT * FROM t3 ORDER BY a
;SELECT b,c FROM t3 WHERE a IS NULL
;INSERT INTO t3 VALUES(min(1,2,3),max(1,2,3),99);
    SELECT * FROM t3 WHERE c=99
;CREATE TEMP TABLE t4(x);
      INSERT INTO t4 VALUES(1);
      SELECT * FROM t4
;INSERT INTO t4 SELECT x+1 FROM t4;
      SELECT * FROM t4
;EXPLAIN INSERT INTO t4 SELECT x+2 FROM t4
;SELECT rootpage FROM sqlite_master WHERE name='test1'
;SELECT rootpage FROM sqlite_temp_master WHERE name='t4'
;INSERT INTO t4 SELECT one FROM test1 WHERE three=7;
      SELECT * FROM t4
;EXPLAIN INSERT INTO t4 SELECT one FROM test1
;CREATE TABLE t1(a INTEGER PRIMARY KEY, b UNIQUE);
      INSERT INTO t1 VALUES(1,2);
      INSERT INTO t1 VALUES(2,3);
      SELECT b FROM t1 WHERE b=2
;REPLACE INTO t1 VALUES(1,4);
      SELECT b FROM t1 WHERE b=2
;UPDATE OR REPLACE t1 SET a=2 WHERE b=4;
      SELECT * FROM t1 WHERE b=4
;SELECT * FROM t1 WHERE b=3
;DROP TABLE t1
;CREATE TABLE t1(a);
    INSERT INTO t1 VALUES(1);
    INSERT INTO t1 VALUES(2);
    CREATE INDEX i1 ON t1(a)
;INSERT INTO t1 SELECT max(a) FROM t1
;SELECT a FROM t1
;INSERT INTO t3 SELECT * FROM (SELECT * FROM t3 UNION ALL SELECT 1,2,3)
;CREATE TABLE t5(x);
    INSERT INTO t5 VALUES(1);
    INSERT INTO t5 VALUES(2);
    INSERT INTO t5 VALUES(3);
    INSERT INTO t5(rowid, x) SELECT nullif(x*2+10,14), x+100 FROM t5;
    SELECT rowid, x FROM t5
;CREATE TABLE t6(x INTEGER PRIMARY KEY, y);
    INSERT INTO t6 VALUES(1,1);
    INSERT INTO t6 VALUES(2,2);
    INSERT INTO t6 VALUES(3,3);
    INSERT INTO t6 SELECT nullif(y*2+10,14), y+100 FROM t6;
    SELECT x, y FROM t6
;CREATE TABLE t10(a,b,c);
      INSERT INTO t10 VALUES(1,2,3), (4,5,6), (7,8,9);
      SELECT * FROM t10
;CREATE TABLE t11a AS SELECT '123456789' AS x;
  CREATE TABLE t11b (a INTEGER PRIMARY KEY, b, c);
  INSERT INTO t11b SELECT x, x, x FROM t11a;
  SELECT quote(a), quote(b), quote(c) FROM t11b
;CREATE TABLE t12a(a,b,c,d,e,f,g);
  INSERT INTO t12a VALUES(101,102,103,104,105,106,107);
  CREATE TABLE t12b(x);
  INSERT INTO t12b(x,rowid,x,x,x,x,x) SELECT * FROM t12a;
  SELECT rowid, x FROM t12b
;CREATE TABLE tab1( value INTEGER);
  INSERT INTO tab1 (value, _rowid_) values( 11, 1);
  INSERT INTO tab1 (value, _rowid_) SELECT 22,999;
  SELECT * FROM tab1
;CREATE TABLE t12c(a, b DEFAULT 'xyzzy', c);
  INSERT INTO t12c(a, rowid, c) SELECT 'one', 999, 'two';
  SELECT * FROM t12c;