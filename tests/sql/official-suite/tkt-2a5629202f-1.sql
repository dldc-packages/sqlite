-- original: tkt-2a5629202f.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t8(b TEXT, c TEXT);
  INSERT INTO t8 VALUES('a',  'one');
  INSERT INTO t8 VALUES('b',  'two');
  INSERT INTO t8 VALUES(NULL, 'three');
  INSERT INTO t8 VALUES(NULL, 'four')
;SELECT coalesce(b, 'null') || '/' || c FROM t8 x ORDER BY x.b, x.c
;CREATE UNIQUE INDEX i1 ON t8(b);
  SELECT coalesce(b, 'null') || '/' || c FROM t8 x ORDER BY x.b, x.c
;DROP INDEX i1;
  CREATE UNIQUE INDEX i1 ON t8(b, c);
  SELECT coalesce(b, 'null') || '/' || c FROM t8 x ORDER BY x.b, x.c
;CREATE TABLE t2(a, b NOT NULL, c);
  CREATE UNIQUE INDEX t2ab ON t2(a, b);
  CREATE UNIQUE INDEX t2ba ON t2(b, a);