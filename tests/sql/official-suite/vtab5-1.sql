-- original: vtab5.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE treal(a VARCHAR(16), b INTEGER, c FLOAT);
    INSERT INTO treal VALUES('a', 'b', 'c');
    CREATE VIRTUAL TABLE techo USING echo(treal)
;SELECT * FROM techo
;INSERT INTO techo VALUES('c', 'd', 'e');
    SELECT * FROM techo
;UPDATE techo SET a = 10;
    SELECT * FROM techo
;DELETE FROM techo WHERE b > 'c';
    SELECT * FROM techo
;DROP TABLE techo;
    DROP TABLE treal
;CREATE TABLE strings(str COLLATE NOCASE);
    INSERT INTO strings VALUES('abc1');
    INSERT INTO strings VALUES('Abc3');
    INSERT INTO strings VALUES('ABc2');
    INSERT INTO strings VALUES('aBc4');
    SELECT str FROM strings ORDER BY 1
;CREATE VIRTUAL TABLE echo_strings USING echo(strings);
    SELECT str FROM echo_strings ORDER BY 1
;SELECT str||'' FROM echo_strings ORDER BY 1;