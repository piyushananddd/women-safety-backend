const mongoose = require("mongoose");

const dangerZoneSchema = new mongoose.Schema({

  area: String,

  latitude: Number,

  longitude: Number,

  dangerLevel: String,

  unsafeAfter: String,

  lightLevel: String,

  harassmentReports: Number

});

module.exports = mongoose.model("DangerZone", dangerZoneSchema);