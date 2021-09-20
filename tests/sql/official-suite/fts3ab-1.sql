-- original: fts3ab.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts3(english,spanish,german)
;SELECT rowid FROM t1 WHERE english MATCH 'one'
;SELECT rowid FROM t1 WHERE spanish MATCH 'one'
;SELECT rowid FROM t1 WHERE german MATCH 'one'
;SELECT rowid FROM t1 WHERE t1 MATCH 'one'
;SELECT rowid FROM t1 WHERE t1 MATCH 'one dos drei'
;SELECT english, spanish, german FROM t1 WHERE rowid=1
;SELECT rowid FROM t1 WHERE t1 MATCH '"one un"'
;CREATE VIRTUAL TABLE t4 USING fts3([norm],'plusone',"invert")
;SELECT rowid FROM t4 WHERE t4 MATCH 'norm:one'
;SELECT rowid FROM t4 WHERE norm MATCH 'one'
;SELECT rowid FROM t4 WHERE t4 MATCH 'one'
;SELECT rowid FROM t4 WHERE t4 MATCH 'plusone:one'
;SELECT rowid FROM t4 WHERE plusone MATCH 'one'
;SELECT rowid FROM t4 WHERE t4 MATCH 'norm:one plusone:two'
;SELECT rowid FROM t4 WHERE t4 MATCH 'norm:one two'
;SELECT rowid FROM t4 WHERE t4 MATCH 'plusone:two norm:one'
;SELECT rowid FROM t4 WHERE t4 MATCH 'two norm:one';