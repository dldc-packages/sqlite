-- original: fts3defer.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts4;
  BEGIN;
    INSERT INTO t1 VALUES('this is a dog');
    INSERT INTO t1 VALUES('an instance of a phrase');
    INSERT INTO t1 VALUES('an instance of a longer phrase');
    INSERT INTO t1 VALUES(sub_aaa);
  COMMIT
;SELECT count(*) FROM t1_segments WHERE length(block)>10000;
  UPDATE t1_segments 
    SET block = zeroblob(length(block)) 
    WHERE length(block)>10000
;DROP TABLE t1
;INSERT INTO t1 VALUES('')
;CREATE VIRTUAL TABLE t1 USING FTS3
;INSERT INTO t1 VALUES(sub_doc)
;CREATE VIRTUAL TABLE t1 USING FTS4
;INSERT INTO t1 VALUES(sub_doc)
;CREATE VIRTUAL TABLE t1 USING FTS4
;INSERT INTO t1 VALUES(sub_doc)
;CREATE VIRTUAL TABLE t1 USING FTS4
;INSERT INTO t1 VALUES(sub_doc)
;INSERT INTO t1(t1) VALUES('optimize')
;CREATE VIRTUAL TABLE t1 USING FTS4(matchinfo=fts3)
;INSERT INTO t1 VALUES(sub_doc)
;DROP TABLE IF EXISTS t1
;SELECT count(*) FROM t1_segments WHERE length(block)>10000
;CREATE VIRTUAL TABLE x1 USING fts4(a, b);
  INSERT INTO x1 VALUES('a b c', 'd e f');
  INSERT INTO x1 SELECT * FROM x1;
  INSERT INTO x1 SELECT * FROM x1;
  INSERT INTO x1 SELECT * FROM x1;
  INSERT INTO x1 SELECT * FROM x1
;SELECT count(*) FROM x1 WHERE x1 MATCH '"d e f"'
;CREATE VIRTUAL TABLE x2 USING FTS4(x);
  BEGIN;
  INSERT INTO x2 VALUES('m m m m m m m m m m m m m m m m m m m m m m m m m m');
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 SELECT * FROM x2;
  INSERT INTO x2 VALUES('a b c d e f g h i j k l m n o p q r s t u v w x y m');
  COMMIT
;SELECT * FROM x2 WHERE x2 MATCH 'a b c d e f g h i j k l m n o p q r s';