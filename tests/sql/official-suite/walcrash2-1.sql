-- original: walcrash2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA page_size = 1024;
    PRAGMA auto_vacuum = off;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    BEGIN;
      CREATE TABLE t1(x);
      CREATE TABLE t2(x);
      CREATE TABLE t3(x);
      CREATE TABLE t4(x);
      CREATE TABLE t5(x);
      CREATE TABLE t6(x);
      CREATE TABLE t7(x);
    COMMIT
;PRAGMA cache_size = 15;
        BEGIN;
          INSERT INTO t1 VALUES(randomblob(900));         --  1 row,  1  page
          INSERT INTO t1 SELECT * FROM t1;                --  2 rows, 3  pages
          INSERT INTO t1 SELECT * FROM t1;                --  4 rows, 5  pages
          INSERT INTO t1 SELECT * FROM t1;                --  8 rows, 9  pages
          INSERT INTO t1 SELECT * FROM t1;                -- 16 rows, 17 pages
          INSERT INTO t1 SELECT * FROM t1 LIMIT 3;        -- 20 rows, 20 pages
;SELECT count(*) FROM t1;