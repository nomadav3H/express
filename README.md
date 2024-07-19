# Node.js Web Application

## Overview

This Node.js application provides a basic user authentication system with a dashboard interface. It uses Express.js for routing, `express-session` for session management, and `lowdb` with a JSON file as the database.

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>


2. **Install the dependencies**
 
    ```npm install```


3. ** Run the Test **

   ```npm test```


4.  ** Run the Server***

   ```node app.js```


5. ** Curl Commands for the api (example)**

curl -X POST https://localhost:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"username": "henderson.briggs@geeknet.net", "password": "23derd*334"}'

This will return a jwt token for the api access 

{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbmRlcnNvbi5icmlnZ3NAZ2Vla25ldC5uZXQiLCJpYXQiOjE3MjEzNzcyNjUsImV4cCI6MTcyMTM4MDg2NX0.8f1Z_4Uc-Hba0iUbJZK13hieJRcPub6IONCXG7ajGEE"}

curl -X GET http://localhost:3000/api/dashboard \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbmRlcnNvbi5icmlnZ3NAZ2Vla25ldC5uZXQiLCJpYXQiOjE3MjEzNzcyNjUsImV4cCI6MTcyMTM4MDg2NX0.8f1Z_4Uc-Hba0iUbJZK13hieJRcPub6IONCXG7ajGEE"

This will return a json that looks like this 

{"_id":"5410953eb0e0c0ae25608277","guid":"eab0324c-75ef-49a1-9c49-be2d68f50b96","isActive":false,"balance":"$3,230.56","picture":"http://placehold.it/32x32","age":"34","eyeColor":"green","name":{"first":"Henderson","last":"Briggs"},"company":"GEEKNET","email":"henderson.briggs@geeknet.net","password":"23derd*334","phone":"+1 (936) 451-3590","address":"121 National Drive, Cotopaxi, Michigan, 8240"}

curl -X POST http://localhost:3000/api/update \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbmRlcnNvbi5icmlnZ3NAZ2Vla25ldC5uZXQiLCJpYXQiOjE3MjEzNzcyNjUsImV4cCI6MTcyMTM4MDg2NX0.8f1Z_4Uc-Hba0iUbJZK13hieJRcPub6IONCXG7ajGEE" \
     -H "Content-Type: application/json" \
     -d '{"_id":"5410953eb0e0c0ae25608277","guid":"eab0324c-75ef-49a1-9c49-be2d68f50b96","isActive":false,"balance":"$3,230.56","picture":"http://placehold.it/32x32","age":"99","eyeColor":"green","name":{"first":"Henderson","last":"Briggs"},"company":"GEEKING123","email":"henderson.briggs@geeknet.net","password":"23derd*334","phone":"+1 (936) 451-3590","address":"121 National Drive, Cotopaxi, Michigan, 8240"}'

This command will show the updated data

curl -X GET http://localhost:3000/api/dashboard \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbmRlcnNvbi5icmlnZ3NAZ2Vla25ldC5uZXQiLCJpYXQiOjE3MjEzNzcyNjUsImV4cCI6MTcyMTM4MDg2NX0.8f1Z_4Uc-Hba0iUbJZK13hieJRcPub6IONCXG7ajGEE"


 curl -X GET http://localhost:3000/api/dashboard \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbmRlcnNvbi5icmlnZ3NAZ2Vla25ldC5uZXQiLCJpYXQiOjE3MjEzNzcyNjUsImV4cCI6MTcyMTM4MDg2NX0.8f1Z_4Uc-Hba0iUbJZK13hieJRcPub6IONCXG7ajGEE"
{"_id":"5410953eb0e0c0ae25608277","guid":"eab0324c-75ef-49a1-9c49-be2d68f50b96","isActive":false,"balance":"$3,230.56","picture":"http://placehold.it/32x32","age":"99","eyeColor":"green","name":{"first":"Henderson","last":"Briggs"},"company":"GEEKING123","email":"henderson.briggs@geeknet.net","password":"23derd*334","phone":"+1 (936) 451-3590","address":"121 National Drive, Cotopaxi, Michigan, 8240"}


