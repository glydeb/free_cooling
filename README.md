#Free Cooling

### By Glydewell Burdick
### 6/6/2016 | Version 1.0

## Application Overview
Free cooling is a full stack web application and associated hardware (hereafter, *the device*) that will serve as an aid to taking advantage of times when opening a window will make an indoor space more comfortable.

The heart of the application will be the server.  Every half-hour, the server will activate and run a set of tasks.  It will first retrieve all the registered devices from the database, and send out requests to forecast.io for each latitude and longitude.  It will also poll each device for its indoor conditions.  It will store the current indoor and outdoor conditions and forecasts in the database.

After that is complete, it will run another query that gets the latest information for each device, which will then be evaluated for a recommendation.  That recommendation will be compared to the last result, and if they are different, it will call the alert function.  The alert function will check if the user allows alerts and if they are not blacked out, and if it passes those tests, a text message will be sent.

When a user visits the status page, a similar process will be run for the device associated with the page.  The device will be polled and current outdoor conditions/forecast retrieved, new information stored in the database.  The latest data will be displayed, along with a recommendation.  No alert will be sent.


## Application Features
### Welcome Page
On the user’s first time to the site, the user will be prompted for the street address, City, State & ZIP code of the device (only ZIP will be required), and information required to access the device (photon ID & user key), and an email and phone number to deliver alerts to, as well as ‘dark times’ where alerts will not be delivered.  The device’s latitude and longitude will be queried from Google Maps API. This information will be stored in an  SQL database.  Once the information is confirmed as stored, the user will be given a link to the main page.

There will be a link to retrieve a lost/forgotten link.

### Status/History Display
This page will display the latest known conditions at the device and outside, along with a recommendation on whether windows should be open or closed, and why (too hot, too cold, too humid, raining, windy).

There will also be a table of up to 100 of the most recent readings.  As a stretch goal, there will be an export history button, with time/date bounds.

There will also be a link to the Manage Device page.

### The Device
The device will store the latest outdoor temperature and humidity data from the API, as well as a temperature range and a humidity range provided by the server.  It will monitor indoor (space) conditions, and if they go outside the range, it will flash a red LED.

### Manage Device
On page load, the page will display the device settings.  The user can edit settings for alerts, location, device/user settings, enable/cancel alerts and remove the device from service.

###Heroku scheduler:
To manage scheduled jobs run:
heroku addons:open scheduler
Use `heroku addons:docs scheduler` to view documentation.
