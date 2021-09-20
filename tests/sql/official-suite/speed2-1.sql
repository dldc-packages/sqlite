-- original: speed2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA page_size=1024;
    PRAGMA cache_size=8192;
    PRAGMA locking_mode=EXCLUSIVE;
    CREATE TABLE t1(a INTEGER, b INTEGER, c TEXT);
    CREATE TABLE t2(a INTEGER, b INTEGER, c TEXT);
    CREATE INDEX i2a ON t2(a);
    CREATE INDEX i2b ON t2(b)
;SELECT name FROM sqlite_master ORDER BY 1
;SELECT c FROM t1 ORDER BY random() LIMIT 50000
;SELECT c FROM t1 ORDER BY random() LIMIT 50000;