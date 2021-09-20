-- original: hidden.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(__hidden__a, b);
  INSERT INTO t1 VALUES('1');
  INSERT INTO t1(__hidden__a, b) VALUES('x', 'y')
;SELECT * FROM t1
;SELECT __hidden__a, * FROM t1
;CREATE TABLE t4(a, __hidden__b, c);
  INSERT INTO t4 SELECT 1, 2;
  SELECT a, __hidden__b, c FROM t4
;CREATE TABLE t5(__hidden__a, b, c);
  CREATE TABLE t6(__hidden__a, b, c);
  INSERT INTO t6(__hidden__a, b, c) VALUES(1, 2, 3);
  INSERT INTO t6(__hidden__a, b, c) VALUES(4, 5, 6);
  INSERT INTO t6(__hidden__a, b, c) VALUES(7, 8, 9)
;INSERT INTO t5 SELECT * FROM t6;
  SELECT * FROM t5
;SELECT __hidden__a FROM t5
;CREATE TABLE t5a(a, b, __hidden__c);
  CREATE TABLE t6a(a, b, __hidden__c);
  INSERT INTO t6a(a, b, __hidden__c) VALUES(1, 2, 3);
  INSERT INTO t6a(a, b, __hidden__c) VALUES(4, 5, 6);
  INSERT INTO t6a(a, b, __hidden__c) VALUES(7, 8, 9)
;INSERT INTO t5a SELECT * FROM t6a;
  SELECT * FROM t5a
;SELECT __hidden__c FROM t5a
;CREATE TABLE t5b(a, __hidden__b, c);
  CREATE TABLE t6b(a, b, __hidden__c);
  INSERT INTO t6b(a, b, __hidden__c) VALUES(1, 2, 3);
  INSERT INTO t6b(a, b, __hidden__c) VALUES(4, 5, 6);
  INSERT INTO t6b(a, b, __hidden__c) VALUES(7, 8, 9)
;INSERT INTO t5b SELECT * FROM t6b;
  SELECT * FROM t5b
;SELECT __hidden__b FROM t5b
;CREATE TABLE t1(a, __hidden__b, c UNIQUE);
  INSERT INTO t1(a, __hidden__b, c) VALUES(1, 2, 3);
  INSERT INTO t1(a, __hidden__b, c) VALUES(4, 5, 6);
  INSERT INTO t1(a, __hidden__b, c) VALUES(7, 8, 9);
  DELETE FROM t1 WHERE __hidden__b = 5;
  SELECT rowid, a, __hidden__b, c FROM t1
;VACUUM;
  SELECT rowid, a, __hidden__b, c FROM t1;