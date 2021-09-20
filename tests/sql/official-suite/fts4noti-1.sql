-- original: fts4noti.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE cc(a, b, c)
;DROP TABLE t1
;SELECT name FROM sqlite_master
;DROP TABLE t1
;CREATE VIRTUAL TABLE t2 USING fts4(x, y, notindexed=x)
;INSERT INTO t2 VALUES(1, 'x y z');
    INSERT INTO t2 VALUES(2, sub_v1);
    INSERT INTO t2 VALUES(3, sub_v2);
    INSERT INTO t2 VALUES(4, sub_v2);
    INSERT INTO t2 VALUES(5, sub_v2);
    INSERT INTO t2 VALUES(6, sub_v2)
;SELECT x FROM t2 WHERE t2 MATCH '2'
;SELECT x FROM t2 WHERE t2 MATCH '1'
;SELECT x FROM t2 WHERE t2 MATCH 'x'
;SELECT x FROM t2 WHERE t2 MATCH 'x 1'
;DROP TABLE t2
;CREATE VIRTUAL TABLE t2 USING fts4(poi, addr, notindexed=poi);
  INSERT INTO t2 VALUES(114, 'x x x');
  INSERT INTO t2 VALUES(X'1234', 'y y y');
  INSERT INTO t2 VALUES(NULL, 'z z z');
  INSERT INTO t2 VALUES(113.2, 'w w w');
  INSERT INTO t2 VALUES('poi', 'v v v')
;SELECT typeof(poi) FROM t2 WHERE t2 MATCH 'x'
;SELECT typeof(poi) FROM t2 WHERE t2 MATCH 'y'
;SELECT typeof(poi) FROM t2 WHERE t2 MATCH 'z'
;SELECT typeof(poi) FROM t2 WHERE t2 MATCH 'w'
;SELECT typeof(poi) FROM t2 WHERE t2 MATCH 'v'
;DROP TABLE t2
;CREATE VIRTUAL TABLE t2 USING fts4(
      notindexed="three", one, two, three, notindexed="one",
  );
  INSERT INTO t2 VALUES('a', 'b', 'c');
  INSERT INTO t2 VALUES('c', 'a', 'b');
  INSERT INTO t2 VALUES('b', 'c', 'a')
;SELECT docid FROM t2 WHERE t2 MATCH 'a'
;SELECT docid FROM t2 WHERE t2 MATCH 'b'
;SELECT docid FROM t2 WHERE t2 MATCH 'c'
;DROP TABLE t2
;CREATE VIRTUAL TABLE t1 USING fts4(
    poiCategory, poiCategoryId, notindexed=poiCategoryId
  );
  INSERT INTO t1(poiCategory, poiCategoryId) values ("Restaurant", 6021)
;SELECT * FROM t1 WHERE t1 MATCH 'restaurant'
;SELECT * FROM t1 WHERE t1 MATCH 're*'
;SELECT * FROM t1 WHERE t1 MATCH '6021'
;SELECT * FROM t1 WHERE t1 MATCH '60*'
;DROP TABLE t1;
  CREATE VIRTUAL TABLE t1 USING fts4(
    poiCategory, poiCategoryId, notindexed=poiCategory
  );
  INSERT INTO t1(poiCategory, poiCategoryId) values ("Restaurant", 6021)
;SELECT * FROM t1 WHERE t1 MATCH 'restaurant'
;SELECT * FROM t1 WHERE t1 MATCH 're*'
;SELECT * FROM t1 WHERE t1 MATCH '6021'
;SELECT * FROM t1 WHERE t1 MATCH '60*'
;DROP TABLE t1;
  CREATE VIRTUAL TABLE t1 USING fts4(abc, ab, a, notindexed=abc);
  CREATE VIRTUAL TABLE t2 USING fts4(a, ab, abc, notindexed=abc);

  INSERT INTO t1 VALUES('no', 'yes', 'yep');
  INSERT INTO t2 VALUES('yep', 'yes', 'no');

  SELECT count(*) FROM t1 WHERE t1 MATCH 'no';
  SELECT count(*) FROM t1 WHERE t1 MATCH 'yes';
  SELECT count(*) FROM t1 WHERE t1 MATCH 'yep';

  SELECT count(*) FROM t2 WHERE t2 MATCH 'no';
  SELECT count(*) FROM t2 WHERE t2 MATCH 'yes';
  SELECT count(*) FROM t2 WHERE t2 MATCH 'yep';