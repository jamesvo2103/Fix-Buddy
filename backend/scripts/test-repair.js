// backend/test-repair.js
import runAgent from '../agent/orchestrator.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const testImagePath = join(__dirname, 'test-image.jpg'); // your broken-table photo

async function main() {
      console.log('🚀 Starting Fix-Buddy image-first test...');
      try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');

            // Use a short, domain-anchored description that matches the image
            const description = 'Photo shows a wooden table with a cracked leg joint and a loose corner bracket.';

            const imageBase64 = await fs.readFile(testImagePath, { encoding: 'base64' });
            const payload = {
                  userId: '656789abcdef123456789abc',   // any test ObjectId string is fine
                  description,                          // keep this brief & image-aligned
                  imageBase64: `data:image/jpeg;base64,${imageBase64}`,
                  experience: 'beginner',
                  tools: ['screwdriver', 'wood glue', 'clamps']
            };

            console.log('\n🖼️ Running diagnosis (image-first)...');
            const result = await runAgent(payload);

            console.log('\nDiagnosis Result:');
            console.log('Item:', result.itemName);
            console.log('Issues:', result.issues);
            console.log('Safety:', result.diagnosis.safety);
            console.log('Tools:', result.diagnosis.tools);
            console.log('Steps:', result.diagnosis.steps);
            console.log('Tutorials:', result.tutorials);

      } catch (e) {
            console.error('❌ Test failed:', e);
      } finally {
            await mongoose.disconnect();
            console.log('\nDisconnected from MongoDB');
      }
}

main();
