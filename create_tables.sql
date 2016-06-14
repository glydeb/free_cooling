
-- CREATE ANIMALS TABLE --
CREATE TABLE locations (
	id SERIAL PRIMARY KEY,
	street_address varchar(200),
    city varchar(200),
    state varchar(2),
    zip varchar(10),
    latitude numeric,
    longitude numeric
);

CREATE TABLE phones (
	phone_number varchar(13) PRIMARY KEY,
	allow_alerts boolean,
	start_time time,
	end_time time
);

CREATE TABLE devices (
	id varchar(24) PRIMARY KEY,
  hash varchar(24),
	location_id integer REFERENCES locations,
	access_token varchar(40),
	nickname varchar(80),
	phone_number varchar(13),
  email varchar(254)
);

CREATE TABLE conditions (
  date_time date,
  indoor_temp numeric,
  indoor_rh numeric,
  outdoor_temp numeric,
  outdoor_rh numeric,
  precip numeric,
  recommend varchar(6),
  device_id varchar(24) REFERENCES devices
  PRIMARY KEY (date_time, device_id)
);
