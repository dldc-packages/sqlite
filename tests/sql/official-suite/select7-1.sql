-- original: select7.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

create temp table t1(x);
      insert into t1 values('amx');
      insert into t1 values('anx');
      insert into t1 values('amy');
      insert into t1 values('bmy');
      select * from t1 where x like 'a__'
        intersect select * from t1 where x like '_m_'
        intersect select * from t1 where x like '__x'
;CREATE TABLE x(id integer primary key, a TEXT NULL);
    INSERT INTO x (a) VALUES ('first');
    CREATE TABLE tempx(id integer primary key, a TEXT NULL);
    INSERT INTO tempx (a) VALUES ('t-first');
    CREATE VIEW tv1 AS SELECT x.id, tx.id FROM x JOIN tempx tx ON tx.id=x.id;
    CREATE VIEW tv1b AS SELECT x.id, tx.id FROM x JOIN tempx tx on tx.id=x.id;
    CREATE VIEW tv2 AS SELECT * FROM tv1 UNION SELECT * FROM tv1b;
    SELECT * FROM tv2
;SELECT * FROM sqlite_master ORDER BY name
;CREATE TABLE IF NOT EXISTS photo(pk integer primary key, x);
      CREATE TABLE IF NOT EXISTS tag(pk integer primary key, fk int, name);
    
      SELECT P.pk from PHOTO P WHERE NOT EXISTS ( 
           SELECT T2.pk from TAG T2 WHERE T2.fk = P.pk 
           EXCEPT 
           SELECT T3.pk from TAG T3 WHERE T3.fk = P.pk AND T3.name LIKE '%foo%'
      )
;INSERT INTO photo VALUES(1,1);
      INSERT INTO photo VALUES(2,2);
      INSERT INTO photo VALUES(3,3);
      INSERT INTO tag VALUES(11,1,'one');
      INSERT INTO tag VALUES(12,1,'two');
      INSERT INTO tag VALUES(21,1,'one-b');
      SELECT P.pk from PHOTO P WHERE NOT EXISTS ( 
           SELECT T2.pk from TAG T2 WHERE T2.fk = P.pk 
           EXCEPT 
           SELECT T3.pk from TAG T3 WHERE T3.fk = P.pk AND T3.name LIKE '%foo%'
      )
;CREATE TABLE t3(a REAL);
    INSERT INTO t3 VALUES(44.0);
    INSERT INTO t3 VALUES(56.0)
;pragma vdbe_trace = 0;
    SELECT (CASE WHEN a=0 THEN 0 ELSE (a + 25) / 50 END) AS categ, count(*)
    FROM t3 GROUP BY categ
;CREATE TABLE t4(a REAL);
    INSERT INTO t4 VALUES( 2.0 );
    INSERT INTO t4 VALUES( 3.0 )
;SELECT (CASE WHEN a=0 THEN 'zero' ELSE a/2 END) AS t FROM t4 GROUP BY t
;SELECT a=0, typeof(a) FROM t4
;SELECT a=0, typeof(a) FROM t4 GROUP BY a
;CREATE TABLE t5(a TEXT, b INT);
    INSERT INTO t5 VALUES(123, 456);
    SELECT typeof(a), a FROM t5 GROUP BY a HAVING a<b
;CREATE TABLE t01(x, y);
  CREATE TABLE t02(x, y);