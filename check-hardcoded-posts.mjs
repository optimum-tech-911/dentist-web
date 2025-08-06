#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function searchInFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Look for hardcoded post data
    const patterns = [
      /const.*posts.*=.*\[/g,
      /const.*pending.*=.*\[/g,
      /mock.*posts/g,
      /test.*posts/g,
      /dummy.*posts/g,
      /sample.*posts/g,
      /hardcoded.*posts/g,
      /posts.*=.*\[/g,
      /pending.*=.*\[/g
    ];
    
    let found = false;
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        console.log(`🔍 Found pattern in ${filePath}:`);
        console.log(`   Pattern: ${pattern.source}`);
        found = true;
      }
    });
    
    // Look for specific post-like objects
    const postPatterns = [
      /title.*:.*["'].*["']/g,
      /content.*:.*["'].*["']/g,
      /author_email.*:.*["'].*["']/g,
      /status.*:.*["']pending["']/g
    ];
    
    postPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`📝 Found post-like data in ${filePath}:`);
        matches.forEach(match => {
          console.log(`   ${match}`);
        });
        found = true;
      }
    });
    
    return found;
  } catch (error) {
    return false;
  }
}

function searchDirectory(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  let found = false;
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        if (searchDirectory(fullPath, extensions)) {
          found = true;
        }
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        if (searchInFile(fullPath)) {
          found = true;
        }
      }
    }
  } catch (error) {
    // Directory might not exist or be accessible
  }
  
  return found;
}

console.log('🔍 SEARCHING FOR HARDCODED POST DATA...');
console.log('Looking in .tsx, .ts, .js, .jsx files...\n');

const found = searchDirectory('.', ['.tsx', '.ts', '.js', '.jsx']);

if (!found) {
  console.log('✅ No hardcoded post data found in the codebase');
} else {
  console.log('\n✅ Search completed');
}