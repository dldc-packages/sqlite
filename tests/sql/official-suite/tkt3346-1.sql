-- original: tkt3346.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a,b);
   INSERT INTO t1 VALUES(2,'bob');
   INSERT INTO t1 VALUES(1,'alice');
   INSERT INTO t1 VALUES(3,'claire');
   SELECT *, ( SELECT y FROM (SELECT x.b='alice' AS y) )
     FROM ( SELECT * FROM t1 ) AS x
;SELECT b FROM (SELECT * FROM t1) AS x
     WHERE (SELECT y FROM (SELECT x.b='alice' AS y))=0
;SELECT b FROM (SELECT * FROM t1 ORDER BY a) AS x
     WHERE (SELECT y FROM (SELECT a||b y FROM t1 WHERE t1.b=x.b))=(x.a||x.b)
;SELECT b FROM (SELECT * FROM t1 ORDER BY a) AS x
     WHERE (SELECT y FROM (SELECT a||b y FROM t1 WHERE t1.b=x.b))=('2'||x.b);