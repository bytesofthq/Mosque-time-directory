const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Hadith = require('../models/Hadith');

const importHadith = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mosque-directory';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const filePath = path.join(__dirname, '../data/sahih_bukhari.json');
    if (!fs.existsSync(filePath)) {
      console.error(`Error: Hadith JSON file not found at ${filePath}`);
      process.exit(1);
    }

    console.log('Reading Hadith JSON file...');
    const content = fs.readFileSync(filePath, 'utf8');
    const volumes = JSON.parse(content);
    let flattened = [];

    volumes.forEach(volume => {
      if (volume.books) {
        volume.books.forEach(book => {
          if (book.hadiths) {
            book.hadiths.forEach(hadith => {
              const text = (hadith.text || '').trim();
              const lower = text.toLowerCase();
              if (text.length >= 25 && 
                  !lower.includes('same as above') && 
                  !lower.includes('see hadith') && 
                  !lower.includes('impossible to translate') &&
                  !lower.includes('from the prophet the same as above')) {
                flattened.push({
                  volumeName: volume.name,
                  bookName: book.name,
                  info: hadith.info || '',
                  by: hadith.by || '',
                  text: text
                });
              }
            });
          }
        });
      }
    });

    console.log(`Clearing existing Hadiths in MongoDB...`);
    await Hadith.deleteMany({});
    console.log(`Existing Hadiths cleared.`);

    console.log(`Importing ${flattened.length} Hadiths into MongoDB...`);
    const result = await Hadith.insertMany(flattened);
    console.log(`Successfully imported ${result.length} Hadiths into MongoDB.`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
};

importHadith();
