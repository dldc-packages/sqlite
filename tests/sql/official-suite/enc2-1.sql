-- original: enc2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

SELECT * FROM t1
;INSERT INTO t1 VALUES('two', 'II', 2)
;SELECT * FROM t1
;INSERT INTO t1 VALUES('three','III',3);
    INSERT INTO t1 VALUES('four','IV',4);
    INSERT INTO t1 VALUES('five','V',5)
;SELECT * FROM t1
;SELECT * FROM t1 WHERE a = 'one'
;SELECT * FROM t1 WHERE a = 'four'
;SELECT * FROM t1 WHERE a IN ('one', 'two')
;PRAGMA encoding
;PRAGMA encoding
;PRAGMA encoding=UTF8
;PRAGMA encoding
;PRAGMA encoding=UTF16le
;PRAGMA encoding
;PRAGMA encoding=UTF16be
;PRAGMA encoding
;PRAGMA encoding = 'UTF-8'
;CREATE TABLE abc(a, b, c)
;PRAGMA encoding = 'UTF-16'
;CREATE TABLE abc(a, b, c)
;CREATE TABLE t5(a);
    INSERT INTO t5 VALUES('one');
    INSERT INTO t5 VALUES('two');
    INSERT INTO t5 VALUES('five');
    INSERT INTO t5 VALUES('three');
    INSERT INTO t5 VALUES('four')
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;pragma encoding = 'UTF-16LE'
;CREATE TABLE t5(a);
    INSERT INTO t5 VALUES('one');
    INSERT INTO t5 VALUES('two');
    INSERT INTO t5 VALUES('five');
    INSERT INTO t5 VALUES('three');
    INSERT INTO t5 VALUES('four')
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;pragma encoding = 'UTF-16BE'
;CREATE TABLE t5(a);
    INSERT INTO t5 VALUES('one');
    INSERT INTO t5 VALUES('two');
    INSERT INTO t5 VALUES('five');
    INSERT INTO t5 VALUES('three');
    INSERT INTO t5 VALUES('four')
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;SELECT * FROM t5 ORDER BY 1 COLLATE test_collate
;CREATE TABLE t1(a varchar collate test_collate)
;pragma encoding = 'UTF-8'
;CREATE TABLE t5(a);
    INSERT INTO t5 VALUES('one')
;SELECT test_function('sqlite')
;SELECT test_function('sqlite')
;SELECT test_function('sqlite')
;pragma encoding = 'UTF-16LE'
;CREATE TABLE t5(a);
    INSERT INTO t5 VALUES('sqlite')
;SELECT test_function('sqlite')
;SELECT test_function('sqlite')
;SELECT test_function('sqlite')
;pragma encoding = 'UTF-16BE'
;CREATE TABLE t5(a);
    INSERT INTO t5 VALUES('sqlite')
;SELECT test_function('sqlite')
;SELECT test_function('sqlite')
;SELECT test_function('sqlite')
;PRAGMA encoding = 'UTF-16';
    SELECT * FROM sqlite_master
;PRAGMA encoding
;PRAGMA encoding = 'UTF-8';
    CREATE TABLE abc(a, b, c)
;SELECT * FROM sqlite_master
;PRAGMA encoding
;PRAGMA encoding = 'UTF-8';
    PRAGMA encoding
;PRAGMA encoding = 'UTF-16le';
    PRAGMA encoding
;SELECT * FROM sqlite_master;
    PRAGMA encoding = 'UTF-8';
    PRAGMA encoding
;PRAGMA encoding = 'UTF-16le';
    CREATE TABLE abc(a, b, c);
    PRAGMA encoding
;PRAGMA encoding = 'UTF-8';
    PRAGMA encoding
;PRAGMA encoding=UTF16;
    CREATE TABLE t1(a);
    PRAGMA encoding=UTF8;
    CREATE TABLE t2(b)
;SELECT name FROM sqlite_master;