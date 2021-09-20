-- original: vtab4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE treal(a PRIMARY KEY, b, c);
    CREATE VIRTUAL TABLE techo USING echo(treal)
;INSERT INTO techo VALUES(1, 2, 3)
;UPDATE techo SET a = 2
;DELETE FROM techo
;BEGIN;
    INSERT INTO techo VALUES(1, 2, 3);
    INSERT INTO techo VALUES(4, 5, 6);
    INSERT INTO techo VALUES(7, 8, 9);
    COMMIT
;CREATE TABLE sreal(a, b, c UNIQUE);
    CREATE VIRTUAL TABLE secho USING echo(sreal)
;BEGIN;
    INSERT INTO secho SELECT * FROM techo;
    DELETE FROM techo;
    COMMIT
;SELECT * FROM secho
;SELECT * FROM techo
;BEGIN;
    INSERT INTO techo SELECT * FROM secho;
    DELETE FROM secho;
    ROLLBACK
;SELECT * FROM secho
;SELECT * FROM techo;