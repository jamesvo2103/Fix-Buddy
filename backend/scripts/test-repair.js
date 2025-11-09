// backend/scripts/test-repair.js
import runAgent from '../agents/orchestrator.js'; // <-- ❗️ UPDATED PATH
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') }); // Ensure .env is found from scripts/

const __dirname = dirname(fileURLToPath(import.meta.url));
const testImagePath = join(__dirname, '../test-image.jpg'); // Path is now relative from scripts/

async function main() {
  console.log('🚀 Starting Fix-Buddy image-first test...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Use a vague, realistic description to test the AI's image analysis
    const description = 'My wooden table leg is broken.'; // <-- ✨ IMPROVED DESCRIPTION

    const imageBase64 = await fs.readFile(testImagePath, { encoding: 'base64' });
    const payload = {
      // NOTE: For a real test, create a user in your DB and use their actual ObjectId
      userId: '672f77e6e5a10065606448e1', // Use a valid ObjectId format
      description,
      imageBase64: `data:image/jpeg;base64,${imageBase64}`,
      experience: 'beginner',
      tools: ['screwdriver'] // Intentionally provide a partial list
    };

    console.log('\n🖼️ Running diagnosis (image-first)...');
    const result = await runAgent(payload);

    console.log('\n✅ Diagnosis Complete!');
    console.log('---------------------------');
    console.log('Item:', result.itemName);
    console.log('Issues:', result.issues);
    console.log('Safety:', result.diagnosis.safety);
    console.log('Tools:', result.diagnosis.tools);
    console.log('Steps:', result.diagnosis.steps.slice(0, 3)); // Log first 3 steps
    console.log('Tutorials:', result.tutorials);

  } catch (e) {
    console.error('❌ Test failed:', e);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

main();