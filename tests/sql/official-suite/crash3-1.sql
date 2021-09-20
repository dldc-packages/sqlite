-- original: crash3.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA page_size = 1024;
        BEGIN;
        CREATE TABLE abc(a, b, c);
        INSERT INTO abc VALUES(1, 2, 3);
        COMMIT
;PRAGMA integrity_check
;SELECT * FROM abc
;BEGIN;
    CREATE TABLE abc(a PRIMARY KEY, b, c);
    CREATE TABLE def(d PRIMARY KEY, e, f);
    PRAGMA default_cache_size = 10;
    INSERT INTO abc VALUES(randstr(10,1000),randstr(10,1000),randstr(10,1000));
    INSERT INTO abc 
      SELECT randstr(10,1000),randstr(10,1000),randstr(10,1000) FROM abc;
    INSERT INTO abc 
      SELECT randstr(10,1000),randstr(10,1000),randstr(10,1000) FROM abc;
    INSERT INTO abc 
      SELECT randstr(10,1000),randstr(10,1000),randstr(10,1000) FROM abc;
    INSERT INTO abc 
      SELECT randstr(10,1000),randstr(10,1000),randstr(10,1000) FROM abc;
    INSERT INTO abc 
      SELECT randstr(10,1000),randstr(10,1000),randstr(10,1000) FROM abc;
    INSERT INTO abc 
      SELECT randstr(10,1000),randstr(10,1000),randstr(10,1000) FROM abc;
    COMMIT
;PRAGMA integrity_check
;PRAGMA integrity_check;