-- original: vtab3.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE elephant(
      name VARCHAR(32), 
      color VARCHAR(16), 
      age INTEGER, 
      UNIQUE(name, color)
    )
;CREATE VIRTUAL TABLE pachyderm USING echo(elephant)
;DROP TABLE pachyderm
;SELECT name FROM sqlite_master WHERE type = 'table'
;SELECT name FROM sqlite_master WHERE type = 'table'
;SELECT name FROM sqlite_master WHERE type = 'table'
;SELECT name FROM sqlite_master WHERE type = 'table'
;SELECT name FROM sqlite_master WHERE type = 'table';