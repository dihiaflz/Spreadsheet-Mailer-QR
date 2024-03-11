# How to use the code 
1. Clone the repository to your local machine.
2. Run the command **npm install** to install all the project's dependencies
3. Create in the project's root directory a .env file
4. Fill out the **.env** file with this informations :
     PROJECT_ID=your_project_id
     PRIVATE_KEY_ID=your_private_key_id
     PRIVATE_KEY=your_private_key
     CLIENT_EMAIL=your_client_email
     CLIENT_ID=your_client_id
You should replace your_project_id, your_private_key_id, your_private_key, your_client_email, your_client_id with the realt values
This informations are linked to a specific Google service account, which is usually associated with a specific project in the Google Cloud Platform, and are usually used to authenticate your app to Google services, like the Google Sheets API in your case. If this information is disclosed, it could potentially allow someone to access your project on Google Cloud Platform or use the services associated with that service account, for that reason they should be stored in a .env file .
PS : you can get the file containing this informations by following the steps explained in the first 5 minutes of this youtube vidéo : https://youtu.be/PFJNJQCU_lo?si=Tnzev54GAvpBAPps
( in the end you will obtain a json file, just extract the values of the informations that i mentioned above )
5. Save the changes and run the code using the command **npm start** and everything will be working properly, GOOD LUCK !
