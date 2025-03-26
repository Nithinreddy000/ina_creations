/**
 * Image Optimization Script
 * 
 * This script processes images in the assets folder and creates optimized versions
 * in different formats (WebP, AVIF) and sizes for responsive usage.
 * 
 * Usage: node image-optimization-script.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const config = {
  inputDir: './src/assets',
  outputDir: './public/optimized-images',
  sizes: {
    sm: 640,
    md: 1024,
    lg: 1440,
    xl: 1920
  },
  quality: {
    webp: 80,
    jpg: 85,
    avif: 65
  }
};

// Ensure output directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Process single image
async function processImage(inputPath, fileName, outputDir) {
  const fileExt = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, fileExt);
  
  // Only process image files
  if (!['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt)) {
    console.log(`Skipping non-image file: ${fileName}`);
    return;
  }
  
  console.log(`Processing: ${fileName}`);
  
  // Create base Sharp instance
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // Process images in different sizes
  for (const [sizeName, width] of Object.entries(config.sizes)) {
    // Skip if image is smaller than target size
    if (metadata.width <= width) continue;
    
    const sizeDir = path.join(outputDir, sizeName);
    ensureDirectoryExists(sizeDir);
    
    // WebP format - best balance of quality and size
    await image
      .resize(width)
      .webp({ quality: config.quality.webp })
      .toFile(path.join(sizeDir, `${baseName}-${sizeName}.webp`));
    
    // Original format
    if (['.jpg', '.jpeg'].includes(fileExt)) {
      await image
        .resize(width)
        .jpeg({ quality: config.quality.jpg, mozjpeg: true })
        .toFile(path.join(sizeDir, `${baseName}-${sizeName}.jpg`));
    } else if (fileExt === '.png') {
      await image
        .resize(width)
        .png({ compressionLevel: 9, palette: true })
        .toFile(path.join(sizeDir, `${baseName}-${sizeName}.png`));
    }
    
    // AVIF format - best compression but slower
    try {
      await image
        .resize(width)
        .avif({ quality: config.quality.avif })
        .toFile(path.join(sizeDir, `${baseName}-${sizeName}.avif`));
    } catch (error) {
      console.warn(`AVIF conversion failed for ${fileName}: ${error.message}`);
    }
  }
  
  // Always create WebP and AVIF of original size for modern browsers
  const originalDir = path.join(outputDir, 'original');
  ensureDirectoryExists(originalDir);
  
  await image
    .webp({ quality: config.quality.webp })
    .toFile(path.join(originalDir, `${baseName}.webp`));
  
  try {
    await image
      .avif({ quality: config.quality.avif })
      .toFile(path.join(originalDir, `${baseName}.avif`));
  } catch (error) {
    console.warn(`AVIF conversion failed for ${fileName}: ${error.message}`);
  }
}

// Process entire directory
async function processDirectory(inputDir, outputDir) {
  ensureDirectoryExists(outputDir);
  
  const items = fs.readdirSync(inputDir, { withFileTypes: true });
  
  for (const item of items) {
    const inputPath = path.join(inputDir, item.name);
    
    if (item.isDirectory()) {
      // Create corresponding output directory
      const subOutputDir = path.join(outputDir, item.name);
      await processDirectory(inputPath, subOutputDir);
    } else {
      // Process file
      await processImage(inputPath, item.name, outputDir);
    }
  }
}

// Main function
async function main() {
  console.log('Starting image optimization...');
  
  try {
    await processDirectory(config.inputDir, config.outputDir);
    console.log('Optimization complete!');
    
    // Instructions for installing Dependencies
    console.log('\nTo use this script, install the required dependencies:');
    console.log('npm install sharp --save-dev');
    
    // Instructions for updating package.json
    console.log('\nAdd this to your package.json scripts:');
    console.log('"optimize-images": "node image-optimization-script.js"');
  } catch (error) {
    console.error('Error during optimization:', error);
  }
}

// Run script
main(); 