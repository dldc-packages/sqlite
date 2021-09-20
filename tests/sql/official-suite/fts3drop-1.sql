-- original: fts3drop.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE f1 USING fts3;
  INSERT INTO f1 VALUES('a b c')
;BEGIN;
    INSERT INTO f1 VALUES('d e f');
    SAVEPOINT one;
      INSERT INTO f1 VALUES('g h i');
      DROP TABLE f1;
    ROLLBACK TO one;
  COMMIT
;SELECT * FROM f1
;BEGIN;
    INSERT INTO f1 VALUES('g h i');
    SAVEPOINT one;
      INSERT INTO f1 VALUES('j k l');
      DROP TABLE f1;
    RELEASE one;
  ROLLBACK
;SELECT * FROM f1;