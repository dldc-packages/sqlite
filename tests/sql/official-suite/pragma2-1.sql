-- original: pragma2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA auto_vacuum=0
;PRAGMA main.cache_size=2000;
  PRAGMA temp.cache_size=2000;
  PRAGMA cache_spill;
  PRAGMA main.cache_spill;
  PRAGMA temp.cache_spill
;PRAGMA cache_spill=OFF;
  PRAGMA cache_spill;
  PRAGMA main.cache_spill;
  PRAGMA temp.cache_spill
;PRAGMA page_size=1024;
  PRAGMA cache_size=50;
  BEGIN;
  CREATE TABLE t1(a INTEGER PRIMARY KEY, b, c, d);
  INSERT INTO t1 VALUES(1, randomblob(400), 1, randomblob(400));
  INSERT INTO t1 SELECT a+1, randomblob(400), a+1, randomblob(400) FROM t1;
  INSERT INTO t1 SELECT a+2, randomblob(400), a+2, randomblob(400) FROM t1;
  INSERT INTO t1 SELECT a+4, randomblob(400), a+4, randomblob(400) FROM t1;
  INSERT INTO t1 SELECT a+8, randomblob(400), a+8, randomblob(400) FROM t1;
  INSERT INTO t1 SELECT a+16, randomblob(400), a+16, randomblob(400) FROM t1;
  INSERT INTO t1 SELECT a+32, randomblob(400), a+32, randomblob(400) FROM t1;
  INSERT INTO t1 SELECT a+64, randomblob(400), a+64, randomblob(400) FROM t1;
  COMMIT;
  ATTACH 'test2.db' AS aux1;
  CREATE TABLE aux1.t2(a INTEGER PRIMARY KEY, b, c, d);
  INSERT INTO t2 SELECT * FROM t1;
  DETACH aux1;
  PRAGMA cache_spill=ON
;BEGIN;
    UPDATE t1 SET c=c+1;
    PRAGMA lock_status
;ROLLBACK;
    PRAGMA cache_spill=OFF;
    PRAGMA Cache_Spill;
    BEGIN;
    UPDATE t1 SET c=c+1;
    PRAGMA lock_status
;ROLLBACK;
    PRAGMA cache_spill=100000;
    PRAGMA cache_spill;
    BEGIN;
    UPDATE t1 SET c=c+1;
    PRAGMA lock_status
;ROLLBACK;
      PRAGMA cache_spill=25;
      PRAGMA main.cache_spill;
      BEGIN;
      UPDATE t1 SET c=c+1;
      PRAGMA lock_status
;ROLLBACK;
      PRAGMA cache_spill(-25);
      PRAGMA main.cache_spill;
      BEGIN;
      UPDATE t1 SET c=c+1;
      PRAGMA lock_status
;ROLLBACK;
  PRAGMA cache_spill=OFF;
  ATTACH 'test2.db' AS aux1;
  PRAGMA aux1.cache_size=50;
  BEGIN;
  UPDATE t2 SET c=c+1;
  PRAGMA lock_status
;COMMIT
;PRAGMA cache_spill=ON; -- Applies to all databases
  BEGIN;
  UPDATE t2 SET c=c-1;
  PRAGMA lock_status
;PRAGMA page_size=16384;
  CREATE TABLE t1(x);
  PRAGMA cache_size=2;
  PRAGMA cache_spill=YES;
  PRAGMA cache_spill
;PRAGMA cache_spill=NO;
  PRAGMA cache_spill
;PRAGMA cache_spill(-51);
  PRAGMA cache_spill;