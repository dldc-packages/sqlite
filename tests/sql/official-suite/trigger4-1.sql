-- original: trigger4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

create table test1(id integer primary key,a);
    create table test2(id integer,b);
    create view test as
      select test1.id as id,a as a,b as b
      from test1 join test2 on test2.id =  test1.id;
    create trigger I_test instead of insert on test
      begin
        insert into test1 (id,a) values (NEW.id,NEW.a);
        insert into test2 (id,b) values (NEW.id,NEW.b);
      end;
    insert into test values(1,2,3);
    select * from test1
;select * from test2
;insert into test values(4,5,6);
    select * from test1
;select * from test2
;create trigger U_test instead of update on test
      begin
        update test1 set a=NEW.a where id=NEW.id;
        update test2 set b=NEW.b where id=NEW.id;
      end;
    update test set a=22 where id=1;
    select * from test1
;select * from test2
;update test set b=66 where id=4;
    select * from test1
;select * from test2
;select * from test1
;create table test2(id,b);
    insert into test values(7,8,9);
    select * from test1
;select * from test2
;update test set b=99 where id=7;
    select * from test2
;create table tbl(a integer primary key, b integer);
	create view vw as select * from tbl;
	create trigger t_del_tbl instead of delete on vw for each row begin
	  delete from tbl where a = old.a;
	end;
	create trigger t_upd_tbl instead of update on vw for each row begin
	  update tbl set a=new.a, b=new.b where a = old.a;
	end;
	create trigger t_ins_tbl instead of insert on vw for each row begin
	  insert into tbl values (new.a,new.b);
	end;
	insert into tbl values(101,1001);
	insert into tbl values(102,1002);
	insert into tbl select a+2, b+2 from tbl;
	insert into tbl select a+4, b+4 from tbl;
	insert into tbl select a+8, b+8 from tbl;
	insert into tbl select a+16, b+16 from tbl;
	insert into tbl select a+32, b+32 from tbl;
	insert into tbl select a+64, b+64 from tbl;
	select count(*) from vw
;select a, b from vw where a<103 or a>226 order by a
;select * from vw
;select count(*) from vw
;select a, b from vw where a<=102 or a>=227 order by a;