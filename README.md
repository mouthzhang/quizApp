# quizApp
Quiz app for CEGEG077 Web and Mobile GIS Assignment by ucesbz0, Ubuntu server number 92

code adapted from https://www.htmlgoodies.com51.524579/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html is used in appActivity.js to calculate the distance, this is for to judge whether if it satisfy the range of proximity alert

Template I am using for testing comes from https://getmdl.io/templates/index.html, thank you for you help.

Firstly, to start the Phone Gap server, "phonegap serve" or "phonegap serve &" under /quizApp.
Then start communicate with the data base by "node httpServer.js" or "node httpServer.js &" under /questionserver
After all these steps, the app should be good to go.

The index.html, mainly is the appearance of the app with few script which is more detailed in appactivity.js. 
The index.html has some style settings for the pop up window, the colour of the font, the button appearance and the map display size. The displaying text, the outside link and the connection to other web page is in the <body>.
There is also a pop up window example in the index.html which can let the future question from the points follow the same style.



<script> app.initialise is in /quizApp/www/js/index.js, which is for start the app and get the id of the phone.
<script> trackLocation is to track the user location in real time which is in /quizApp/www/js/appActivity.js
<script> loadQuestions is also in /quizApp/www/js/appActivity.js, this is to load the question from server to the phone.
  
The code in /quizApp/www/js/appActivity.js is a series of procedures which allows the quiz app to be functional.
From tracking user location, showing on the map, calculate the distance from user to POI and whether the if it satisfy the alert setting.
It also gets the questions from server, puts the questions in presentable form and order, judges if the answers are correct.

/quizApp/www/js/uploadData.js 
