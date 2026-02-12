#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  width: 1080,
  height: 1350
};

async function generateCover(options) {
  const {
    imagePath,
    guitarName,
    subtitle,
    issueNumber = '01',
    year = new Date().getFullYear(),
    outputPath
  } = options;

  // Read template
  const templatePath = path.join(__dirname, 'template.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  // Convert image to base64 if it's a local file
  let imageUrl = imagePath;
  if (fs.existsSync(imagePath)) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).slice(1).toLowerCase();
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    imageUrl = `data:image/${mimeType};base64,${base64}`;
  }

  // Replace placeholders
  html = html
    .replace('{{IMAGE_URL}}', imageUrl)
    .replace('{{GUITAR_NAME}}', guitarName)
    .replace('{{SUBTITLE}}', subtitle)
    .replace('{{ISSUE_NUMBER}}', issueNumber)
    .replace('{{YEAR}}', year);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: config.width, height: config.height });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate output filename
  const output = outputPath || `cover_${guitarName.replace(/\s+/g, '_')}_${Date.now()}.png`;

  // Take screenshot
  await page.screenshot({
    path: output,
    type: 'png',
    clip: { x: 0, y: 0, width: config.width, height: config.height }
  });

  await browser.close();

  console.log(`✅ Cover generated: ${output}`);
  return output;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(`
🎸 TWNG Magazine Cover Generator

Usage:
  node generate.js <image> <guitar-name> <subtitle> [issue-number] [year]

Examples:
  node generate.js photo.jpg "FENDER STRATOCASTER" "The One That Started Everything"
  node generate.js photo.jpg "GIBSON LES PAUL" "When Rock Found Its Voice" 02 2026

Arguments:
  image         Path to guitar/person image (JPG, PNG)
  guitar-name   Main headline (e.g., "FENDER STRATOCASTER")
  subtitle      Subtitle text (e.g., "The One That Started Everything")
  issue-number  Optional issue number (default: 01)
  year          Optional year (default: current year)
    `);
    process.exit(1);
  }

  const [imagePath, guitarName, subtitle, issueNumber, year] = args;

  generateCover({
    imagePath,
    guitarName,
    subtitle,
    issueNumber: issueNumber || '01',
    year: year || new Date().getFullYear()
  }).catch(console.error);
}

module.exports = { generateCover };
