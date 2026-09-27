require("dotenv").config();
const mongoose = require("mongoose");

const Location = require("../models/Location");
const Turf = require("../models/Turf");

const locationsData = require("./locations");
const turfsData = require("./turfs");

const isFresh = process.argv.includes("--fresh");

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.\n");

  if (isFresh) {
    console.log("Fresh flag detected - clearing existing locations & turfs...");
    await Promise.all([Location.deleteMany({}), Turf.deleteMany({})]);
  }

  // --- Locations: upsert so re-running the seed never creates duplicates ---
  let locationsInserted = 0;
  for (const loc of locationsData) {
    const result = await Location.updateOne(
      { name: loc.name },
      { $setOnInsert: loc },
      { upsert: true }
    );
    if (result.upsertedCount > 0) locationsInserted++;
  }

  // --- Turfs: only seed if the collection is empty (or --fresh was used) ---
  let turfsInserted = 0;
  const existingTurfCount = await Turf.countDocuments();
  if (existingTurfCount === 0) {
    const created = await Turf.insertMany(turfsData);
    turfsInserted = created.length;
  } else {
    console.log(`Turfs collection already has ${existingTurfCount} documents - skipping (use --fresh to reset).`);
  }

  console.log("--------------------------------------------------");
  console.log(`Locations inserted: ${locationsInserted} (of ${locationsData.length} total)`);
  console.log(`Turfs inserted: ${turfsInserted}`);
  console.log("--------------------------------------------------");
  console.log("\nDatabase seeding completed successfully.");

  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  mongoose.connection.close();
  process.exit(1);
});
