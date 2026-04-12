import fs from "fs";
import path from "path";
import env from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import Location from "../models/Location.js";

const filePath = path.resolve(process.cwd(), "../database/12-04-2026/locations.csv");

const run = async () => {
  try {
    await connectDB();

    const data = fs.readFileSync(filePath, "utf-8");
    const lines = data.split("\n").filter((l) => l.trim().length > 0);

    const locationsToInsert = [];

    for (const line of lines) {
      // Use regex to parse: UUID, Area, Quoted JSON array string, Timestamp, NULL, NULL, NULL, isActive
      const match = line.match(/^([^,]+),([^,]+),"\[(.*?)\]",([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)$/);
      
      if (!match) {
        console.warn("Could not parse line:", line);
        continue;
      }

      const [, uuid, area, coloniesStrRaw, createdAt, createdBy, updatedAt, updatedBy, isActive] = match;

      // Extract colony names from ""Name"" strings
      // Since there are typos like ""Name1""""Name2"", we just extract everything between "" ""
      const colonies = [];
      const colonyRegex = /""([^""]+)""/g;
      let colMatch;
      while ((colMatch = colonyRegex.exec(coloniesStrRaw)) !== null) {
        colonies.push(colMatch[1]);
      }

      locationsToInsert.push({
        area,
        colonies,
        isActive: isActive.trim() === "1",
        createdAt: new Date(createdAt),
      });
    }

    // Clear existing to avoid duplicates if re-run
    await Location.deleteMany({});
    console.log(`Deleted existing locations`);

    await Location.insertMany(locationsToInsert);
    console.log(`Successfully migrated ${locationsToInsert.length} locations`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await disconnectDB();
  }
};

run();
