-- original: hexlit.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(x INT, y REAL);
  INSERT INTO t1 VALUES('1234','4567'),('0x1234','0x4567');
  SELECT typeof(x), x, typeof(y), y, '#' FROM t1 ORDER BY rowid
;SELECT CAST('0x1234' AS INTEGER);