--SELECT devices.id, MAX(date_time) as Last_recommended, recommend FROM devices
 --     JOIN conditions ON devices.id = conditions.device_id
 --     JOIN locations ON devices.location_id = locations.id
 --     JOIN phones ON phones.phone_number = devices.phone_number
 --     WHERE allow_alerts = TRUE
 --     GROUP BY devices.id, recommend
 --     ORDER BY devices.id, Last_recommended DESC

UPDATE conditions 
SET recommend = '2016-06-15 22:11:34.858'