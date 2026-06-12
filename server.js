const express = require("express");
const mongoose = require("mongoose");
const twilio = require("twilio");
const DangerZone = require("./models/DangerZone");

require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const sosSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SOS = mongoose.model("SOS", sosSchema);


app.post("/sos", async (req, res) => {

  try {

    const { latitude, longitude } = req.body;

    const newSOS = new SOS({
      latitude,
      longitude
    });

    await newSOS.save();

    const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    await client.messages.create({
      body: `🚨 EMERGENCY SOS ALERT!\n\nUser needs help.\nLocation: ${locationLink}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_PHONE_NUMBER
    });
    await client.calls.create({
  twiml: '<Response><Say>Emergency Alert. A user has triggered SOS. Please check immediately.</Say></Response>',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: process.env.MY_PHONE_NUMBER
});

    res.status(200).json({
      message: "SOS Sent Successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message
    });

  }

});

app.post("/analyze-route", async (req, res) => {

  try {

    const { startPoint, destination } = req.body;

    const zones = await DangerZone.find();

    let dangerScore = 20;

    let threatLevel = "SAFE";

    zones.forEach((zone) => {

      if (zone.dangerLevel === "HIGH") {
        dangerScore += 30;
      }

      if (zone.lightLevel === "LOW") {
        dangerScore += 20;
      }

      if (zone.harassmentReports > 10) {
        dangerScore += 20;
      }

    });

    const hour = new Date().getHours();

    if (hour >= 22 || hour <= 5) {
      dangerScore += 20;
    }

    if (dangerScore > 70) {
      threatLevel = "HIGH";
    }
    else if (dangerScore > 40) {
      threatLevel = "MODERATE";
    }

    res.json({
      startPoint,
      destination,
      dangerScore,
      threatLevel,
      safeRoute: dangerScore < 70
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message
    });

  }

});


// app.get("/add-danger-zones", async (req, res) => {

//   await DangerZone.insertMany([

//     {
//       area: "Clock Tower",
//       latitude: 30.3256,
//       longitude: 78.0437,
//       dangerLevel: "HIGH",
//       unsafeAfter: "10PM",
//       lightLevel: "LOW",
//       harassmentReports: 18
//     },

//     {
//       area: "ISBT Area",
//       latitude: 30.2880,
//       longitude: 78.0400,
//       dangerLevel: "MODERATE",
//       unsafeAfter: "11PM",
//       lightLevel: "MEDIUM",
//       harassmentReports: 9
//     },

//     {
//       area: "Rajpur Road",
//       latitude: 30.3752,
//       longitude: 78.0780,
//       dangerLevel: "LOW",
//       unsafeAfter: "12AM",
//       lightLevel: "GOOD",
//       harassmentReports: 2
//     }

//   ]);

//   res.send("Danger Zones Added");

// });


app.post("/analyze-route", async (req, res) => {

  try {

    const { startPoint, destination } = req.body;

    const dangerScore = Math.floor(Math.random() * 100);

    let safetyLevel = "";
    let recommendation = "";

    if (dangerScore < 30) {
      safetyLevel = "SAFE";
      recommendation = "Recommended safe route";
    } 
    
    else if (dangerScore < 70) {
      safetyLevel = "MODERATE";
      recommendation = "Travel carefully";
    } 
    
    else {
      safetyLevel = "DANGEROUS";
      recommendation = "Avoid this route at night";
    }

    res.json({
      startPoint,
      destination,
      dangerScore,
      safetyLevel,
      recommendation
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});