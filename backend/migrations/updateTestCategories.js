import mongoose from "mongoose";
import Test from "../models/test.model.js";
import dotenv from "dotenv";

dotenv.config();

// Category mapping from old to new
const categoryMapping = {
  "Technical": "Test",
  "Safety": "Test", 
  "Compliance": "Exam",
  "General": "Test",
  "Training": "Exercice",
  "Assessment": "Exam",
  "": "Test", // Empty string default
  null: "Test", // Null default
  undefined: "Test" // Undefined default
};

async function updateTestCategories() {
  try {
    console.log("🔄 Starting test category migration...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all tests with old categories
    const testsToUpdate = await Test.find({
      category: { 
        $nin: ["Test", "Exam", "Rattrapage", "Exercice", "Quiz", "Pré-Test"] 
      }
    });

    console.log(`📊 Found ${testsToUpdate.length} tests with old categories`);

    if (testsToUpdate.length === 0) {
      console.log("✅ No tests need category updates");
      return;
    }

    // Update each test
    let updatedCount = 0;
    for (const test of testsToUpdate) {
      const oldCategory = test.category;
      const newCategory = categoryMapping[oldCategory] || "Test";
      
      console.log(`🔄 Updating test "${test.title}": "${oldCategory}" → "${newCategory}"`);
      
      // Use updateOne to bypass validation temporarily
      await Test.updateOne(
        { _id: test._id },
        { $set: { category: newCategory } }
      );
      
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} tests`);

    // Verify the update
    const remainingOldTests = await Test.find({
      category: { 
        $nin: ["Test", "Exam", "Rattrapage", "Exercice", "Quiz", "Pré-Test"] 
      }
    });

    if (remainingOldTests.length === 0) {
      console.log("✅ All tests now have valid categories");
    } else {
      console.log(`⚠️  ${remainingOldTests.length} tests still have invalid categories:`);
      remainingOldTests.forEach(test => {
        console.log(`   - "${test.title}": "${test.category}"`);
      });
    }

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the migration
updateTestCategories();
