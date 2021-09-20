-- original: analyze4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a,b);
    CREATE INDEX t1a ON t1(a);
    CREATE INDEX t1b ON t1(b);
    INSERT INTO t1 VALUES(1,NULL);
    INSERT INTO t1 SELECT a+1, b FROM t1;
    INSERT INTO t1 SELECT a+2, b FROM t1;
    INSERT INTO t1 SELECT a+4, b FROM t1;
    INSERT INTO t1 SELECT a+8, b FROM t1;
    INSERT INTO t1 SELECT a+16, b FROM t1;
    INSERT INTO t1 SELECT a+32, b FROM t1;
    INSERT INTO t1 SELECT a+64, b FROM t1;
    ANALYZE
;EXPLAIN QUERY PLAN SELECT * FROM t1 WHERE a=5 AND b IS NULL
;SELECT idx, stat FROM sqlite_stat1 WHERE tbl='t1' ORDER BY idx
;UPDATE t1 SET b='x' WHERE a%2;
    ANALYZE;
    SELECT idx, stat FROM sqlite_stat1 WHERE tbl='t1' ORDER BY idx
;UPDATE t1 SET b=NULL;
    ALTER TABLE t1 ADD COLUMN c;
    ALTER TABLE t1 ADD COLUMN d;
    UPDATE t1 SET c=a/4, d=a/2;
    CREATE INDEX t1bcd ON t1(b,c,d);
    CREATE INDEX t1cdb ON t1(c,d,b);
    CREATE INDEX t1cbd ON t1(c,b,d);
    ANALYZE;
    SELECT idx, stat FROM sqlite_stat1 WHERE tbl='t1' ORDER BY idx
;CREATE TABLE t2(
      x INTEGER PRIMARY KEY,
      a TEXT COLLATE nocase,
      b TEXT COLLATE rtrim,
      c TEXT COLLATE binary
    );
    CREATE INDEX t2a ON t2(a);
    CREATE INDEX t2b ON t2(b);
    CREATE INDEX t2c ON t2(c);
    CREATE INDEX t2c2 ON t2(c COLLATE nocase);
    CREATE INDEX t2c3 ON t2(c COLLATE rtrim);
    INSERT INTO t2 VALUES(1, 'abc', 'abc', 'abc');
    INSERT INTO t2 VALUES(2, 'abC', 'abC', 'abC');
    INSERT INTO t2 VALUES(3, 'abc ', 'abc ', 'abc ');
    INSERT INTO t2 VALUES(4, 'abC ', 'abC ', 'abC ');
    INSERT INTO t2 VALUES(5, 'aBc', 'aBc', 'aBc');
    INSERT INTO t2 VALUES(6, 'aBC', 'aBC', 'aBC');
    INSERT INTO t2 VALUES(7, 'aBc ', 'aBc ', 'aBc ');
    INSERT INTO t2 VALUES(8, 'aBC ', 'aBC ', 'aBC ');
    ANALYZE;
    SELECT idx, stat FROM sqlite_stat1 WHERE tbl='t2' ORDER BY idx;