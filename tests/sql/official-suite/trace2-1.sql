-- original: trace2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE x1 USING fts4;
    INSERT INTO x1 VALUES('Cloudy, with a high near 16');
    INSERT INTO x1 VALUES('Wind chill values as low as -13');