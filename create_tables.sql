
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
	location_id REFERENCES locations,
	access_token varchar(40),
	nickname varchar(80),
	phone_number varchar(13)
);

CREATE TABLE indoor_conditions (
  date_time date,
  rh numeric,
  temp numeric,
  device_id varchar(24) REFERENCES devices
  PRIMARY KEY (date_time, device_id)
);

CREATE TABLE forecasts (

)
