-- original: tkt2920.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA page_size=1024;
    PRAGMA max_page_count=40;
    PRAGMA auto_vacuum=0;
    CREATE TABLE filler (fill)
;INSERT INTO filler VALUES(randomblob(1024))
;PRAGMA max_page_count=41
;PRAGMA max_page_count=42;