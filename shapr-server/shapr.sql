CREATE DATABASE shapr;

CREATE TABLE conversiontx (
    id varchar(32) primary key DEFAULT md5(random()::text),
    status smallint not null,
	target_type varchar(10) not null,
    input_file varchar(255),
    output_file varchar(255),
    created_at timestamptz not null,
	finished_at timestamptz,
    user_id bigint not null 
);

CREATE UNIQUE INDEX conversion_idx ON conversiontx (id);
CREATE INDEX user_conversion_idx ON conversiontx (user_id);

-- status codes: 0: waiting, 1: in-progress, 2: completed, 3: failed