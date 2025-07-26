#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment readiness...\n');

// Check 1: Verify dist folder exists and has content
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found. Run "npm run build" first.');
  process.exit(1);
}

const distFiles = fs.readdirSync(distPath);
console.log('✅ dist folder exists with files:', distFiles.length);

// Check 2: Verify index.html exists and has content
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in dist folder.');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');
if (!indexContent.includes('<div id="root">')) {
  console.error('❌ index.html missing root div element.');
  process.exit(1);
}

if (!indexContent.includes('script')) {
  console.error('❌ index.html missing JavaScript script tags.');
  process.exit(1);
}

console.log('✅ index.html is properly structured');

// Check 3: Verify _redirects file exists
const redirectsPath = path.join(distPath, '_redirects');
if (!fs.existsSync(redirectsPath)) {
  console.warn('⚠️  _redirects file not found. SPA routing may not work on some platforms.');
} else {
  const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
  if (!redirectsContent.includes('/*') || !redirectsContent.includes('/index.html')) {
    console.warn('⚠️  _redirects file may not be configured correctly for SPA.');
  } else {
    console.log('✅ _redirects file is configured correctly');
  }
}

// Check 4: Verify assets folder exists
const assetsPath = path.join(distPath, 'assets');
if (!fs.existsSync(assetsPath)) {
  console.error('❌ assets folder not found in dist.');
  process.exit(1);
}

const assetFiles = fs.readdirSync(assetsPath);
const jsFiles = assetFiles.filter(file => file.endsWith('.js'));
const cssFiles = assetFiles.filter(file => file.endsWith('.css'));

if (jsFiles.length === 0) {
  console.error('❌ No JavaScript files found in assets folder.');
  process.exit(1);
}

if (cssFiles.length === 0) {
  console.error('❌ No CSS files found in assets folder.');
  process.exit(1);
}

console.log(`✅ Assets folder contains ${jsFiles.length} JS files and ${cssFiles.length} CSS files`);

// Check 5: Verify package.json scripts
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (!packageJson.scripts || !packageJson.scripts.build) {
    console.warn('⚠️  No build script found in package.json');
  }
  if (!packageJson.scripts.preview) {
    console.warn('⚠️  No preview script found in package.json');
  }
}

// Check 6: Calculate bundle sizes
const totalSize = assetFiles.reduce((total, file) => {
  const filePath = path.join(assetsPath, file);
  const stats = fs.statSync(filePath);
  return total + stats.size;
}, 0);

const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
console.log(`📦 Total bundle size: ${totalSizeMB} MB`);

if (totalSize > 5 * 1024 * 1024) { // 5MB
  console.warn('⚠️  Bundle size is quite large. Consider code splitting.');
}

// Check 7: Deployment recommendations
console.log('\n🚀 Deployment Checklist:');
console.log('- [ ] Run the site locally with "npm run preview" and verify it works');
console.log('- [ ] Check browser console for errors after deployment');
console.log('- [ ] Test the /diagnostic route on your deployed site');
console.log('- [ ] Verify Supabase database is accessible from your domain');
console.log('- [ ] Ensure hosting platform supports SPA routing');

console.log('\n📋 Platform-specific notes:');
console.log('• Cloudflare Pages: Set build output directory to "dist"');
console.log('• Vercel: Should auto-detect settings from package.json');
console.log('• Netlify: Ensure _redirects file is included in deployment');

console.log('\n✅ Deployment verification complete!');
console.log('\n🔗 If you see a white page after deployment:');
console.log('1. Visit your-domain.com/diagnostic');
console.log('2. Check browser console (F12)');
console.log('3. Review DEPLOYMENT_TROUBLESHOOTING.md');