#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateCover } = require('./generate');

// Sample covers data - edit this or load from JSON/CSV
const covers = [
  {
    imagePath: 'images/strat-player.jpg',
    guitarName: 'FENDER STRATOCASTER',
    subtitle: 'The One That Started Everything',
    issueNumber: '01'
  },
  {
    imagePath: 'images/les-paul.jpg',
    guitarName: 'GIBSON LES PAUL',
    subtitle: 'When Rock Found Its Voice',
    issueNumber: '02'
  },
  {
    imagePath: 'images/tele.jpg',
    guitarName: 'FENDER TELECASTER',
    subtitle: 'The Working Musician\'s Best Friend',
    issueNumber: '03'
  }
  // Add more covers here...
];

async function generateBatch(dataFile) {
  let data = covers;

  // Load from JSON file if provided
  if (dataFile && fs.existsSync(dataFile)) {
    data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(`📁 Loaded ${data.length} covers from ${dataFile}`);
  }

  // Create output directory
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log(`\n🎸 Generating ${data.length} covers...\n`);

  for (let i = 0; i < data.length; i++) {
    const cover = data[i];
    const outputPath = path.join(outputDir, `cover_${cover.issueNumber || i + 1}_${cover.guitarName.replace(/\s+/g, '_')}.png`);

    try {
      await generateCover({
        ...cover,
        year: cover.year || new Date().getFullYear(),
        outputPath
      });
      console.log(`  [${i + 1}/${data.length}] ✅ ${cover.guitarName}`);
    } catch (error) {
      console.log(`  [${i + 1}/${data.length}] ❌ ${cover.guitarName}: ${error.message}`);
    }
  }

  console.log(`\n✨ Done! Covers saved to: ${outputDir}\n`);
}

// CLI
const dataFile = process.argv[2];
generateBatch(dataFile).catch(console.error);
