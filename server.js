const express = require("express");
const mongoose = require("mongoose");
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

        res.status(200).json({
            message: "SOS Sent Successfully"
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