// Quick debug script to test admin page access
console.log("Testing admin page access...");

const testUrls = [
  "http://localhost:8080/admin",
  "http://localhost:8080/admin/pending-posts", 
  "http://localhost:8080/admin/approved-posts"
];

async function testUrl(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`✅ ${url} - Status: ${response.status}`);
      return true;
    } else {
      console.log(`❌ ${url} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${url} - Error: ${error.message}`);
    return false;
  }
}

// Test each URL
testUrls.forEach(testUrl);

console.log("Debug complete - check for errors above");