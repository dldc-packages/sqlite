-- original: e_insert.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE a1(a, b);
  CREATE TABLE a2(a, b, c DEFAULT 'xyz');
  CREATE TABLE a3(x DEFAULT 1.0, y DEFAULT 'string', z);
  CREATE TABLE a4(c UNIQUE, d)
;INSERT INTO a1 VALUES('x', 'y')
;INSERT INTO a4 VALUES(1, 'a');
  INSERT INTO a4 VALUES(2, 'a');
  INSERT INTO a4 VALUES(3, 'a');