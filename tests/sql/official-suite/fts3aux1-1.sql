-- original: fts3aux1.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING fts4;
  INSERT INTO t1 VALUES('one two three four');
  INSERT INTO t1 VALUES('three four five six');
  INSERT INTO t1 VALUES('one three five seven');

  CREATE VIRTUAL TABLE terms USING fts4aux(t1);
  SELECT term, documents, occurrences FROM terms WHERE col = '*'
;INSERT INTO t1 VALUES('one one one three three three');
  SELECT term, documents, occurrences FROM terms WHERE col = '*'
;DELETE FROM t1
;SELECT term, documents, occurrences FROM terms WHERE col = '*'
;INSERT INTO t1 VALUES('a b a b a b a');
  INSERT INTO t1 SELECT * FROM t1;
  INSERT INTO t1 SELECT * FROM t1;
  INSERT INTO t1 SELECT * FROM t1;
  INSERT INTO t1 SELECT * FROM t1;
  INSERT INTO t1 SELECT * FROM t1;
  INSERT INTO t1 SELECT * FROM t1;
  INSERT INTO t1 SELECT * FROM t1;
  INSERT INTO t1 SELECT * FROM t1;
  SELECT term, documents, occurrences FROM terms WHERE col = '*'
;DROP TABLE t1;
  DROP TABLE terms;

  CREATE VIRTUAL TABLE x1 USING fts4(x);
  INSERT INTO x1(x1) VALUES('nodesize=24');
  CREATE VIRTUAL TABLE terms USING fts4aux(x1);

  CREATE VIEW terms_v AS 
  SELECT term, documents, occurrences FROM terms WHERE col = '*';

  INSERT INTO x1 VALUES('braes brag bragged bragger bragging');
  INSERT INTO x1 VALUES('brags braid braided braiding braids');
  INSERT INTO x1 VALUES('brain brainchild brained braining brains');
  INSERT INTO x1 VALUES('brainstem brainstems brainstorm brainstorms')
;EXPLAIN QUERY PLAN SELECT * FROM terms WHERE term='braid'
;EXPLAIN QUERY PLAN SELECT * FROM terms WHERE +term='braid'
;SELECT * FROM terms_v WHERE rec('cnt', term) AND term='braid'
;SELECT * FROM terms_v WHERE rec('cnt', term) AND +term='braid'
;SELECT * FROM terms_v WHERE rec('cnt', term) AND term='breakfast'
;SELECT * FROM terms_v WHERE rec('cnt', term) AND +term='breakfast'
;SELECT * FROM terms_v WHERE term='braid'
;SELECT * FROM terms_v WHERE +term='braid'
;SELECT * FROM terms_v WHERE term='breakfast'
;SELECT * FROM terms_v WHERE +term='breakfast'
;SELECT * FROM terms_v WHERE term='cba'
;SELECT * FROM terms_v WHERE +term='cba'
;SELECT * FROM terms_v WHERE term='abc'
;SELECT * FROM terms_v WHERE +term='abc'
;SELECT * FROM terms WHERE term=NULL
;EXPLAIN QUERY PLAN SELECT * FROM terms WHERE term>'brain'
;EXPLAIN QUERY PLAN SELECT * FROM terms WHERE +term>'brain'
;EXPLAIN QUERY PLAN SELECT * FROM terms WHERE term<'brain'
;EXPLAIN QUERY PLAN SELECT * FROM terms WHERE +term<'brain'
;EXPLAIN QUERY PLAN SELECT * FROM terms WHERE term BETWEEN 'brags' AND 'brain'
;EXPLAIN QUERY PLAN SELECT * FROM terms WHERE +term BETWEEN 'brags' AND 'brain'
;SELECT * FROM terms WHERE rec('cnt', term) AND term>'brain'
;SELECT * FROM terms WHERE rec('cnt', term) AND +term>'brain'
;SELECT term, documents, occurrences FROM terms_v WHERE term>'brain'
;SELECT term, documents, occurrences FROM terms_v WHERE +term>'brain'
;SELECT term, documents, occurrences FROM terms_v WHERE term>='brain'
;SELECT term, documents, occurrences FROM terms_v WHERE +term>='brain'
;SELECT term, documents, occurrences FROM terms_v WHERE term>='abc'
;SELECT term, documents, occurrences FROM terms_v WHERE +term>='abc'
;SELECT term, documents, occurrences FROM terms_v WHERE term>='brainstorms'
;SELECT term, documents, occurrences FROM terms_v WHERE term>='brainstorms'
;SELECT * FROM terms_v WHERE term>'brainstorms'
;SELECT * FROM terms_v WHERE term>'brainstorms'
;SELECT * FROM terms_v WHERE term>'cba'
;SELECT * FROM terms_v WHERE term>'cba'
;SELECT * FROM terms WHERE rec('cnt', term) AND term<'brain'
;SELECT * FROM terms WHERE rec('cnt', term) AND +term<'brain'
;SELECT term, documents, occurrences FROM terms_v WHERE term<'brain'
;SELECT term, documents, occurrences FROM terms_v WHERE +term<'brain'
;SELECT term, documents, occurrences FROM terms_v WHERE term<='brain'
;SELECT term, documents, occurrences FROM terms_v WHERE +term<='brain'
;SELECT term, documents, occurrences FROM terms 
    WHERE rec('cnt', term) AND term BETWEEN 'brags' AND 'brain'
;SELECT term, documents, occurrences FROM terms 
    WHERE rec('cnt', term) AND +term BETWEEN 'brags' AND 'brain'
;SELECT term, documents, occurrences FROM terms_v 
  WHERE rec('cnt', term) AND term BETWEEN 'brags' AND 'brain'
;SELECT term, documents, occurrences FROM terms_v 
  WHERE rec('cnt', term) AND +term BETWEEN 'brags' AND 'brain'
;SELECT term, documents, occurrences FROM terms_v 
  WHERE rec('cnt', term) AND term > 'brags' AND term < 'brain'
;SELECT term, documents, occurrences FROM terms_v 
  WHERE rec('cnt', term) AND +term > 'brags' AND +term < 'brain'
;CREATE VIRTUAL TABLE t2 USING fts4
;CREATE VIRTUAL TABLE terms3 USING fts4aux(does_not_exist)
;CREATE VIRTUAL TABLE x1 USING fts4(x);
  CREATE VIRTUAL TABLE terms USING fts4aux(x1);
  CREATE TABLE x2(y);
  CREATE TABLE x3(y);
  CREATE INDEX i1 ON x3(y);

  INSERT INTO x1 VALUES('a b c d e');
  INSERT INTO x1 VALUES('f g h i j');
  INSERT INTO x1 VALUES('k k l l a');

  INSERT INTO x2 SELECT term FROM terms WHERE col = '*';
  INSERT INTO x3 SELECT term FROM terms WHERE col = '*'
;CREATE VIRTUAL TABLE "abc '!' def" USING fts4(x, y);
  INSERT INTO "abc '!' def" VALUES('XX', 'YY');

  CREATE VIRTUAL TABLE terms3 USING fts4aux("abc '!' def");
  SELECT * FROM terms3
;CREATE VIRTUAL TABLE "%%^^%%" USING fts4aux('abc ''!'' def');
  SELECT * FROM "%%^^%%"
;CREATE VIRTUAL TABLE ft1 USING fts4(x, y);
  INSERT INTO ft1 VALUES('a b', 'c d');
  INSERT INTO ft1 VALUES('e e', 'c d');
  INSERT INTO ft1 VALUES('a a', 'b b');
  CREATE VIRTUAL TABLE temp.aux1 USING fts4aux(main, ft1);
  SELECT * FROM aux1
;ATTACH 'test.db2' AS att;
  CREATE VIRTUAL TABLE att.ft1 USING fts4(x, y);
  INSERT INTO att.ft1 VALUES('v w', 'x y');
  INSERT INTO att.ft1 VALUES('z z', 'x y');
  INSERT INTO att.ft1 VALUES('v v', 'w w');
  CREATE VIRTUAL TABLE temp.aux2 USING fts4aux(att, ft1);
  SELECT * FROM aux2
;DETACH att;