-- original: tkt-4ef7e3cfca.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE w(a);
  CREATE TABLE x(a);
  CREATE TABLE y(a);
  CREATE TABLE z(a);

  INSERT INTO x(a) VALUES(5);
  INSERT INTO y(a) VALUES(10);

  CREATE TRIGGER t AFTER INSERT ON w BEGIN
    INSERT INTO z
    SELECT (SELECT x.a +y.a FROM y) FROM x;
  END;
  INSERT INTO w VALUES('incorrect')
;SELECT * FROM z
;CREATE TABLE w(a);
  CREATE TABLE x(b);
  CREATE TABLE y(a);
  CREATE TABLE z(a);

  INSERT INTO x(b) VALUES(5);
  INSERT INTO y(a) VALUES(10);

  CREATE TRIGGER t AFTER INSERT ON w BEGIN
    INSERT INTO z
    SELECT (SELECT x.b +y.a FROM y) FROM x;
  END;
  INSERT INTO w VALUES('assert')
;SELECT * FROM z;