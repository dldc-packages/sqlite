-- original: async3.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE abc(a, b, c);
    BEGIN;
    INSERT INTO abc VALUES(1, 2, 3)
;SELECT * FROM abc;