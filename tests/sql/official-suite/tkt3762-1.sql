-- original: tkt3762.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA auto_vacuum=INCREMENTAL;
    PRAGMA page_size=1024;
    PRAGMA cache_size=10;
    CREATE TABLE t1(x);
    INSERT INTO t1 VALUES(zeroblob(900));
    INSERT INTO t1 VALUES(zeroblob(900));
    INSERT INTO t1 SELECT x FROM t1;
    INSERT INTO t1 SELECT x FROM t1;
    INSERT INTO t1 SELECT x FROM t1;
    INSERT INTO t1 SELECT x FROM t1;
    INSERT INTO t1 SELECT x FROM t1;
    INSERT INTO t1 SELECT x FROM t1;
    INSERT INTO t1 SELECT x FROM t1;
    DELETE FROM t1 WHERE rowid>202;
    VACUUM;
    
    BEGIN;
    DELETE FROM t1 WHERE rowid IN (10,11,12) ;
    PRAGMA incremental_vacuum(10);
    UPDATE t1 SET x=zeroblob(900) WHERE rowid BETWEEN 100 AND 110;
    INSERT INTO t1 VALUES(zeroblob(39000));
    SELECT count(*) FROM t1;
    ROLLBACK
;PRAGMA integrity_check;