-- original: tkt-9d68c883.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA page_size = 1024;
    PRAGMA auto_vacuum = 2;
    CREATE TABLE t3(x);
    CREATE TABLE t4(x);
    CREATE TABLE t5(x);
    INSERT INTO t5 VALUES(randomblob(1500));
    CREATE TABLE t7(x);
    CREATE TABLE t8(x)
;BEGIN;
        DELETE FROM t5;
        INSERT INTO t8 VALUES('hello world')
;PRAGMA integrity_check;