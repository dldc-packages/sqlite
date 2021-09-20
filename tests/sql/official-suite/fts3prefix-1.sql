-- original: fts3prefix.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

DROP TABLE IF EXISTS fts3check1;
      DROP TABLE IF EXISTS fts3check2
;CREATE VIRTUAL TABLE fts3check1 USING fts4term(sub_tbl, 0)
;CREATE VIRTUAL TABLE fts3check2 USING fts4term(sub_tbl, sub_iIndex)
;DROP TABLE IF EXISTS temp.terms;
      DROP TABLE IF EXISTS temp.prefixes;
      CREATE TEMP TABLE terms AS SELECT * FROM fts3check1;
      CREATE TEMP TABLE prefixes AS SELECT * FROM fts3check2;
      CREATE INDEX temp.idx ON prefixes(term);
      DROP TABLE fts3check1;
      DROP TABLE fts3check2
;SELECT term, docid, col, pos FROM temp.terms
;DROP TABLE temp.prefixes
;DROP TABLE temp.terms
;CREATE VIRTUAL TABLE t1 USING fts4(prefix='1,3,6');

  CREATE VIRTUAL TABLE p1 USING fts4term(t1, 1);
  CREATE VIRTUAL TABLE p2 USING fts4term(t1, 2);
  CREATE VIRTUAL TABLE p3 USING fts4term(t1, 3);
  CREATE VIRTUAL TABLE terms USING fts4term(t1)
;INSERT INTO t1 VALUES('sqlite mysql firebird')
;SELECT term FROM p1
;SELECT term FROM p2
;SELECT term FROM p3
;SELECT term FROM terms
;INSERT INTO t1 VALUES('FTS3 and FTS4 are an SQLite virtual table modules');
  INSERT INTO t1 VALUES('that allows users to perform full-text searches on');
  INSERT INTO t1 VALUES('a set of documents. The most common (and');
  INSERT INTO t1 VALUES('effective) way to describe full-text searches is');
  INSERT INTO t1 VALUES('"what Google, Yahoo and Altavista do with');
  INSERT INTO t1 VALUES('documents placed on the World Wide Web". Users');
  INSERT INTO t1 VALUES('input a term, or series of terms, perhaps');
  INSERT INTO t1 VALUES('connected by a binary operator or grouped together');
  INSERT INTO t1 VALUES('into a phrase, and the full-text query system');
  INSERT INTO t1 VALUES('finds the set of documents that best matches those');
  INSERT INTO t1 VALUES('terms considering the operators and groupings the');
  INSERT INTO t1 VALUES('user has specified. This article describes the');
  INSERT INTO t1 VALUES('deployment and usage of FTS3 and FTS4.');
  INSERT INTO t1 VALUES('FTS1 and FTS2 are obsolete full-text search');
  INSERT INTO t1 VALUES('modules for SQLite. There are known issues with');
  INSERT INTO t1 VALUES('these older modules and their use should be');
  INSERT INTO t1 VALUES('avoided. Portions of the original FTS3 code were');
  INSERT INTO t1 VALUES('contributed to the SQLite project by Scott Hess of');
  INSERT INTO t1 VALUES('Google. It is now developed and maintained as part');
  INSERT INTO t1 VALUES('of SQLite. ')
;DELETE FROM t1 WHERE docid%2
;INSERT INTO t1(t1) VALUES('optimize')
;CREATE VIRTUAL TABLE t2 USING fts4(prefix='1,2,3');
  INSERT INTO t2 VALUES('On 12 September the wind direction turned and');
  INSERT INTO t2 VALUES('William''s fleet sailed. A storm blew up and the');
  INSERT INTO t2 VALUES('fleet was forced to take shelter at');
  INSERT INTO t2 VALUES('Saint-Valery-sur-Somme and again wait for the wind');
  INSERT INTO t2 VALUES('to change. On 27 September the Norman fleet');
  INSERT INTO t2 VALUES('finally set sail, landing in England at Pevensey');
  INSERT INTO t2 VALUES('Bay (Sussex) on 28 September. William then moved');
  INSERT INTO t2 VALUES('to Hastings, a few miles to the east, where he');
  INSERT INTO t2 VALUES('built a prefabricated wooden castle for a base of');
  INSERT INTO t2 VALUES('operations. From there, he ravaged the hinterland');
  INSERT INTO t2 VALUES('and waited for Harold''s return from the north.');
  INSERT INTO t2 VALUES('On 12 September the wind direction turned and');
  INSERT INTO t2 VALUES('William''s fleet sailed. A storm blew up and the');
  INSERT INTO t2 VALUES('fleet was forced to take shelter at');
  INSERT INTO t2 VALUES('Saint-Valery-sur-Somme and again wait for the wind');
  INSERT INTO t2 VALUES('to change. On 27 September the Norman fleet');
  INSERT INTO t2 VALUES('finally set sail, landing in England at Pevensey');
  INSERT INTO t2 VALUES('Bay (Sussex) on 28 September. William then moved');
  INSERT INTO t2 VALUES('to Hastings, a few miles to the east, where he');
  INSERT INTO t2 VALUES('built a prefabricated wooden castle for a base of');
  INSERT INTO t2 VALUES('operations. From there, he ravaged the hinterland');
  INSERT INTO t2 VALUES('and waited for Harold''s return from the north.')
;SELECT optimize(t2) FROM t2 LIMIT 1
;CREATE VIRTUAL TABLE t3 USING fts4(prefix="1,4");
  INSERT INTO t3 VALUES('one two three');
  INSERT INTO t3 VALUES('four five six');
  INSERT INTO t3 VALUES('seven eight nine')
;SELECT * FROM t3 WHERE t3 MATCH 'f*'
;SELECT * FROM t3 WHERE t3 MATCH 'four*'
;SELECT * FROM t3 WHERE t3 MATCH 's*'
;SELECT * FROM t3 WHERE t3 MATCH 'sev*'
;SELECT * FROM t3 WHERE t3 MATCH 'one*'
;CREATE VIRTUAL TABLE t1 USING fts4(prefix=0);
  CREATE VIRTUAL TABLE t2 USING fts4;
  INSERT INTO t1 VALUES('Twas Mulga Bill, from Eaglehawk, ');
  INSERT INTO t2 VALUES('Twas Mulga Bill, from Eaglehawk, ')
;SELECT md5sum(quote(root)) FROM t1_segdir
;SELECT md5sum(quote(root)) FROM t2_segdir
;CREATE VIRTUAL TABLE t1 USING fts4(prefix="1,0,2");
  CREATE VIRTUAL TABLE t2 USING fts4(prefix="1,2");
  INSERT INTO t1 VALUES('that caught the cycling craze;');
  INSERT INTO t2 VALUES('that caught the cycling craze;')
;SELECT md5sum(quote(root)) FROM t1_segdir
;SELECT md5sum(quote(root)) FROM t2_segdir
;CREATE VIRTUAL TABLE t1 USING fts4(prefix="1,3,2");
  CREATE VIRTUAL TABLE t2 USING fts4(prefix="1,2");
  INSERT INTO t1 VALUES('He turned away the good old horse');
  INSERT INTO t2 VALUES('He turned away the good old horse')
;SELECT md5sum(quote(root)) FROM t1_segdir
;SELECT md5sum(quote(root)) FROM t2_segdir
;CREATE VIRTUAL TABLE t1 USING fts4(prefix="1,600,2");
  CREATE VIRTUAL TABLE t2 USING fts4(prefix="1,2");
  INSERT INTO t1 VALUES('that served him many days;');
  INSERT INTO t2 VALUES('that served him many days;')
;SELECT md5sum(quote(root)) FROM t1_segdir
;SELECT md5sum(quote(root)) FROM t2_segdir
;SELECT md5sum(quote(root)) FROM t1_segdir
;SELECT md5sum(quote(root)) FROM t2_segdir
;SELECT docid FROM t6 WHERE t6 MATCH '"a* b"'
;SELECT docid FROM t6 WHERE t6 MATCH 'a*'
;SELECT docid FROM t6 WHERE t6 MATCH 'a* b';