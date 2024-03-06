require('dotenv').config();
const express = require("express")
const nodemailer = require("nodemailer")
const fs = require("fs")
const path = require("path")
const handlebars = require("handlebars")
const qrcode = require("qrcode")
const {google} = require("googleapis")
const app = express()

app.listen(200, () => console.log("port 200"))

// first of all, we should fill out credentials.json file ( of course after creating the .env file and fill it with the necessary information ) 
// Read and parse JSON file
const jsonFilePath = './credentials.json'
let credentials = JSON.parse(fs.readFileSync(jsonFilePath))

// Add dotenv variables to the credentials object
credentials.type = "service_account"
credentials.project_id = process.env.PROJECT_ID
credentials.private_key_id = process.env.PRIVATE_KEY_ID
// Properly parse private key to handle newline characters
credentials.private_key = process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
credentials.client_email = process.env.CLIENT_EMAIL
credentials.client_id = process.env.CLIENT_ID
credentials.auth_uri = "https://accounts.google.com/o/oauth2/auth"
credentials.token_uri = "https://oauth2.googleapis.com/token"
credentials.auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
credentials.client_x509_cert_url = "https://www.googleapis.com/robot/v1/metadata/x509/acceptation%40acceptation-404617.iam.gserviceaccount.com"
credentials.universe_domain = "googleapis.com"

// Write back to JSON file
try {
  fs.writeFileSync(jsonFilePath, JSON.stringify(credentials, null, 5));
  console.log('Credentials file updated.')
} catch (error) {
  console.log("this is the error : ", error);
}


const htmlFile = fs.readFileSync(path.join(__dirname, "public", "template.html"), "utf-8") // reading the html template
const template = handlebars.compile(htmlFile) // we use handlebars to pass participant's attributes as parameters for dynamic html content

// in my spreadsheet, i used the colones : nom, prenom, email
async function sendMail(participant){
  data = {
    nom : participant.nom, 
    prenom : participant.prenom 
  }
  // passing the data as arguments in the html template
  const personalizedhtml = template(data)
  const contenuQr = JSON.stringify(participant)
  qrcode.toFile('codeQR.png', contenuQr, function (err) {
    if (err) throw err;
    console.log("QR code generated successfully");
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '', // here you should add the sender's email
      pass: ''  // here you should add the password of the sender's email
    }
  })

  //note that the email sender should allow access to less secure applications ( go to you google account parameters => security => Access to less secure applications ) 

  const mailOptions = {
    from: '', // here you should add your actual email sender
    to: participant.email,
    subject: 'Email sender', 
    html: personalizedhtml,
    attachments: [{
        filename: 'codeQR.png',
        path: 'codeQR.png'
    }]
  }
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error with sending the mail : ", error);
      } else {
        console.log(`Sent mail to : ${participant.nom} ${participant.prenom} avec ${participant.email}`);
        resolve()
      }
    })
  })
}

async function sendEmails() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
  });
  const client = await auth.getClient()
  const googleSheets = google.sheets({ version: 'v4', auth : client})
  const spreadsheetID = "" // here you should add the id of your spreadsheet, it is the part of the spreadsheet's link between /d/ and /
  // note that you should share your spreadsheet with the client email : "acceptation@acceptation-404617.iam.gserviceaccount.com" as an editor
  let row = 2
  while (true) {
    const res = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId : spreadsheetID,
      range: `Feuille 1!A${row}:C${row}` // Accessing the range from cell A1 to cell B10 in the tab 'Feuille 1'
      //so in your case you should replace this with the actual range that you need in your row, the general syntax is "Tab name!Start of range:End of range"
    });
    if(res.data.values != undefined){
      const values = res.data.values[0]
      const nom = values[0];
      const prenom = values[1];
      const email = values[2];

      const participant = {
        nom: nom,
        prenom: prenom,
        email: email
      }
      try {
        await sendMail(participant)
        fs.appendFile(path.join(__dirname, "public", "success.txt"), `${nom} ${prenom}, ${email}\n`, (err) => {
            if (err) {
              console.error("Error append to file success.txt : ", err);
            } else {
              console.log("Success append to file sucsess.txt");
            }})
      } catch (error) {
        console.log("Here is the error that led to failed.txt : ", error)
        fs.appendFile(path.join(__dirname, "public", "failed.txt"), `${nom} ${prenom}, ${email}\n`, (err) => {
            if (err) {
              console.error("Error append to file failed.txt : ", err);
            } else {
              console.log("Success append to file failed.txt");
            }})
      }
      row++
    }else {
       console.log("End of the spreadsheet")
       break
    }
  }
}

sendEmails()


