-- original: fts3matchinfo.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts4(matchinfo=fts3);
  SELECT name FROM sqlite_master WHERE type = 'table'
;INSERT INTO t1(content) VALUES('I wandered lonely as a cloud');
  INSERT INTO t1(content) VALUES('That floats on high o''er vales and hills,');
  INSERT INTO t1(content) VALUES('When all at once I saw a crowd,');
  INSERT INTO t1(content) VALUES('A host, of golden daffodils,');
  SELECT mit(matchinfo(t1)) FROM t1 WHERE t1 MATCH 'I'
;CREATE VIRTUAL TABLE t2 USING fts4;
  INSERT INTO t2 SELECT * FROM t1;
  SELECT mit(matchinfo(t2)) FROM t2 WHERE t2 MATCH 'I'
;CREATE VIRTUAL TABLE t3 USING fts3(mtchinfo=fts3);
  INSERT INTO t3(mtchinfo) VALUES('Beside the lake, beneath the trees');
  SELECT mtchinfo FROM t3
;CREATE VIRTUAL TABLE xx USING FTS4
;SELECT * FROM xx WHERE xx MATCH 'abc'
;SELECT * FROM xx WHERE xx MATCH 'a b c'
;CREATE VIRTUAL TABLE t4 USING fts4(x, y);
  INSERT INTO t4 VALUES('a b c d e', 'f g h i j');
  INSERT INTO t4 VALUES('f g h i j', 'a b c d e')
;CREATE VIRTUAL TABLE t5 USING fts4;
  INSERT INTO t5 VALUES('a a a a a');
  INSERT INTO t5 VALUES('a b a b a');
  INSERT INTO t5 VALUES('c b c b c');
  INSERT INTO t5 VALUES('x x x x x')
;INSERT INTO t5(t5) VALUES('optimize')
;UPDATE t5_segments 
    SET block = zeroblob(length(block)) 
    WHERE length(block)>10000
;CREATE VIRTUAL TABLE t6 USING fts4(a, b, c);
  INSERT INTO t6 VALUES('a', 'b', 'c')
;CREATE VIRTUAL TABLE t7 USING fts3(a, b);
  INSERT INTO t7 VALUES('u v w', 'x y z');

  CREATE VIRTUAL TABLE t8 USING fts4(a, b, matchinfo=fts3);
  INSERT INTO t8 VALUES('u v w', 'x y z')
;CREATE VIRTUAL TABLE t9 USING fts4;
  INSERT INTO t9 VALUES(
    'this record is used to try to dectect corruption'
  );
  SELECT offsets(t9) FROM t9 WHERE t9 MATCH 'to'
;CREATE VIRTUAL TABLE t10 USING fts4;
  INSERT INTO t10 VALUES('first record');
  INSERT INTO t10 VALUES('second record')
;SELECT typeof(matchinfo(t10)), length(matchinfo(t10)) FROM t10
;SELECT typeof(matchinfo(t10)), length(matchinfo(t10)) FROM t10 WHERE docid=1
;SELECT typeof(matchinfo(t10)), length(matchinfo(t10)) 
  FROM t10 WHERE t10 MATCH 'record'
;CREATE VIRTUAL TABLE t11 USING fts4;
  INSERT INTO t11(t11) VALUES('nodesize=24');
  INSERT INTO t11 VALUES('quitealongstringoftext');
  INSERT INTO t11 VALUES('anotherquitealongstringoftext');
  INSERT INTO t11 VALUES('athirdlongstringoftext');
  INSERT INTO t11 VALUES('andonemoreforgoodluck')
;INSERT INTO t11 VALUES('')
;INSERT INTO t11(t11) VALUES('optimize')
;SELECT mit(matchinfo(t11, 'nxa')) FROM t11 WHERE t11 MATCH 'a*'
;UPDATE t11_stat SET value = X'0000'
;UPDATE t11_stat SET value = X'00'
;UPDATE t11_stat SET value = NULL
;CREATE VIRTUAL TABLE t12 USING fts4;
  INSERT INTO t12 VALUES('a b c d');
  SELECT mit(matchinfo(t12, 'x')) FROM t12 WHERE t12 MATCH 'a NEAR/1 d OR a'
;INSERT INTO t12 VALUES('a d c d');
  SELECT mit(matchinfo(t12, 'x')) FROM t12 WHERE t12 MATCH 'a NEAR/1 d OR a'
;INSERT INTO t12 VALUES('a d d a');
  SELECT mit(matchinfo(t12, 'x')) FROM t12 WHERE t12 MATCH 'a NEAR/1 d OR a'
;CREATE VIRTUAL TABLE ft2 USING fts4;
  INSERT INTO ft2 VALUES('a b c d e');
  INSERT INTO ft2 VALUES('f a b c d');
  SELECT snippet(ft2, '[', ']', '', -1, 1) FROM ft2 WHERE ft2 MATCH 'c'
;DROP TABLE t10;
  CREATE VIRTUAL TABLE t10 USING fts4(idx, value);
  INSERT INTO t10 values (1, 'one'),(2, 'two'),(3, 'three');
  SELECT docId, t10.*
    FROM t10
    JOIN (SELECT 1 AS idx UNION SELECT 2 UNION SELECT 3) AS x
   WHERE t10 MATCH x.idx
     AND matchinfo(t10) not null
   GROUP BY docId
   ORDER BY 1
;CREATE VIRTUAL TABLE tt USING fts3(x, y);
  INSERT INTO tt VALUES('c d a c d d', 'e a g b d a');   -- 1
  INSERT INTO tt VALUES('c c g a e b', 'c g d g e c');   -- 2
  INSERT INTO tt VALUES('b e f d e g', 'b a c b c g');   -- 3
  INSERT INTO tt VALUES('a c f f g d', 'd b f d e g');   -- 4
  INSERT INTO tt VALUES('g a c f c f', 'd g g b c c');   -- 5
  INSERT INTO tt VALUES('g a c e b b', 'd b f b g g');   -- 6
  INSERT INTO tt VALUES('f d a a f c', 'e e a d c f');   -- 7
  INSERT INTO tt VALUES('a c b b g f', 'a b a e d f');   -- 8
  INSERT INTO tt VALUES('b a f e c c', 'f d b b a b');   -- 9
  INSERT INTO tt VALUES('f d c e a c', 'f a f a a f');   -- 10
;INSERT INTO tt (rowid, c4, c45) VALUES(1, 'abc', 'abc');
  SELECT mit(matchinfo(tt, 'b')) FROM tt WHERE tt MATCH 'abc';