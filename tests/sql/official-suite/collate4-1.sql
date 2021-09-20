-- original: collate4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE collate4t1(a COLLATE NOCASE, b COLLATE TEXT);
    INSERT INTO collate4t1 VALUES( 'a', 'a' );
    INSERT INTO collate4t1 VALUES( 'b', 'b' );
    INSERT INTO collate4t1 VALUES( NULL, NULL );
    INSERT INTO collate4t1 VALUES( 'B', 'B' );
    INSERT INTO collate4t1 VALUES( 'A', 'A' );
    CREATE INDEX collate4i1 ON collate4t1(a);
    CREATE INDEX collate4i2 ON collate4t1(b)
;CREATE TABLE collate4t2(
      a PRIMARY KEY COLLATE NOCASE, 
      b UNIQUE COLLATE TEXT
    );
    INSERT INTO collate4t2 VALUES( 'a', 'a' );
    INSERT INTO collate4t2 VALUES( NULL, NULL );
    INSERT INTO collate4t2 VALUES( 'B', 'B' )
;CREATE TABLE collate4t3(
      b COLLATE TEXT,  
      a COLLATE NOCASE, 
      UNIQUE(a), PRIMARY KEY(b)
    );
    INSERT INTO collate4t3 VALUES( 'a', 'a' );
    INSERT INTO collate4t3 VALUES( NULL, NULL );
    INSERT INTO collate4t3 VALUES( 'B', 'B' )
;CREATE TABLE collate4t4(a COLLATE NOCASE, b COLLATE TEXT);
    INSERT INTO collate4t4 VALUES( 'a', 'a' );
    INSERT INTO collate4t4 VALUES( 'b', 'b' );
    INSERT INTO collate4t4 VALUES( NULL, NULL );
    INSERT INTO collate4t4 VALUES( 'B', 'B' );
    INSERT INTO collate4t4 VALUES( 'A', 'A' );
    CREATE INDEX collate4i3 ON collate4t4(a COLLATE TEXT);
    CREATE INDEX collate4i4 ON collate4t4(b COLLATE NOCASE)
;DROP TABLE collate4t1;
    DROP TABLE collate4t2;
    DROP TABLE collate4t3;
    DROP TABLE collate4t4
;CREATE TABLE collate4t1(a COLLATE NOCASE, b COLLATE TEXT);
    INSERT INTO collate4t1 VALUES( 'a', 'a' );
    INSERT INTO collate4t1 VALUES( 'b', 'b' );
    INSERT INTO collate4t1 VALUES( NULL, NULL );
    INSERT INTO collate4t1 VALUES( 'B', 'B' );
    INSERT INTO collate4t1 VALUES( 'A', 'A' );
    CREATE INDEX collate4i1 ON collate4t1(a, b)
;CREATE TABLE collate4t2(
      a COLLATE NOCASE, 
      b COLLATE TEXT, 
      PRIMARY KEY(a, b)
    );
    INSERT INTO collate4t2 VALUES( 'a', 'a' );
    INSERT INTO collate4t2 VALUES( NULL, NULL );
    INSERT INTO collate4t2 VALUES( 'B', 'B' )
;CREATE TABLE collate4t3(a COLLATE NOCASE, b COLLATE TEXT);
    INSERT INTO collate4t3 VALUES( 'a', 'a' );
    INSERT INTO collate4t3 VALUES( 'b', 'b' );
    INSERT INTO collate4t3 VALUES( NULL, NULL );
    INSERT INTO collate4t3 VALUES( 'B', 'B' );
    INSERT INTO collate4t3 VALUES( 'A', 'A' );
    CREATE INDEX collate4i2 ON collate4t3(a COLLATE TEXT, b COLLATE NOCASE)
;DROP TABLE collate4t1;
    DROP TABLE collate4t2;
    DROP TABLE collate4t3
;PRAGMA automatic_index=OFF;
    CREATE TABLE collate4t1(a COLLATE NOCASE);
    CREATE TABLE collate4t2(b COLLATE TEXT);

    INSERT INTO collate4t1 VALUES('a');
    INSERT INTO collate4t1 VALUES('A');
    INSERT INTO collate4t1 VALUES('b');
    INSERT INTO collate4t1 VALUES('B');
    INSERT INTO collate4t1 VALUES('c');
    INSERT INTO collate4t1 VALUES('C');
    INSERT INTO collate4t1 VALUES('d');
    INSERT INTO collate4t1 VALUES('D');
    INSERT INTO collate4t1 VALUES('e');
    INSERT INTO collate4t1 VALUES('D');

    INSERT INTO collate4t2 VALUES('A');
    INSERT INTO collate4t2 VALUES('Z')
;CREATE INDEX collate4i1 ON collate4t1(a)
;DROP INDEX collate4i1;
    CREATE INDEX collate4i1 ON collate4t1(a COLLATE TEXT)
;DROP INDEX collate4i1;
      CREATE INDEX collate4i1 ON collate4t1(a)
;DROP INDEX collate4i1;
      CREATE INDEX collate4i1 ON collate4t1(a COLLATE TEXT)
;DROP TABLE collate4t1;
    DROP TABLE collate4t2
;CREATE TABLE collate4t1(a COLLATE nocase, b COLLATE text, c);
    CREATE TABLE collate4t2(a COLLATE nocase, b COLLATE text, c COLLATE TEXT);

    INSERT INTO collate4t1 VALUES('0', '0', '0');
    INSERT INTO collate4t1 VALUES('0', '0', '1');
    INSERT INTO collate4t1 VALUES('0', '1', '0');
    INSERT INTO collate4t1 VALUES('0', '1', '1');
    INSERT INTO collate4t1 VALUES('1', '0', '0');
    INSERT INTO collate4t1 VALUES('1', '0', '1');
    INSERT INTO collate4t1 VALUES('1', '1', '0');
    INSERT INTO collate4t1 VALUES('1', '1', '1');
    insert into collate4t2 SELECT * FROM collate4t1
;CREATE INDEX collate4i1 ON collate4t1(a, b, c)
;DROP INDEX collate4i1;
    CREATE INDEX collate4i1 ON collate4t1(a, b, c COLLATE text)
;DROP TABLE collate4t1;
    DROP TABLE collate4t2
;CREATE TABLE collate4t1(a PRIMARY KEY COLLATE NOCASE)
;SELECT * FROM collate4t1
;DROP TABLE collate4t1;
    CREATE TABLE collate4t1(a COLLATE NOCASE UNIQUE)
;SELECT * FROM collate4t1
;DROP TABLE collate4t1;
    CREATE TABLE collate4t1(a);
    CREATE UNIQUE INDEX collate4i1 ON collate4t1(a COLLATE NOCASE)
;SELECT * FROM collate4t1
;DROP TABLE collate4t1
;CREATE TABLE collate4t1(a COLLATE TEXT);
    INSERT INTO collate4t1 VALUES('2');
    INSERT INTO collate4t1 VALUES('10');
    INSERT INTO collate4t1 VALUES('20');
    INSERT INTO collate4t1 VALUES('104')
;CREATE INDEX collate4i1 ON collate4t1(a)
;DROP INDEX collate4i1;
    CREATE INDEX collate4i1 ON collate4t1(a COLLATE NUMERIC)
;DROP TABLE collate4t1
;CREATE TABLE collate4t1(a COLLATE TEXT, b COLLATE NUMERIC);
    INSERT INTO collate4t1 VALUES('11', '101');
    INSERT INTO collate4t1 VALUES('101', '11')
;SELECT max(a, b) FROM collate4t1
;SELECT max(b, a) FROM collate4t1
;SELECT max(a, '101') FROM collate4t1
;SELECT max('101', a) FROM collate4t1
;SELECT max(b, '101') FROM collate4t1
;SELECT max('101', b) FROM collate4t1
;DROP TABLE collate4t1
;CREATE TABLE collate4t1(a INTEGER PRIMARY KEY);
    INSERT INTO collate4t1 VALUES(101);
    INSERT INTO collate4t1 VALUES(10);
    INSERT INTO collate4t1 VALUES(15);