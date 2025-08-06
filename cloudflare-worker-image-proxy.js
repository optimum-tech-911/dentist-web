// Cloudflare Worker for Image Proxy
// Deploy this in your Cloudflare Workers to fix CORS issues

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Referer, User-Agent',
        'Access-Control-Max-Age': '86400'
      }
    })
  }
  
  // Handle image proxy requests
  if (url.pathname.startsWith('/api/proxy-image')) {
    const targetUrl = url.searchParams.get('url')
    
    if (!targetUrl) {
      return new Response('Missing URL parameter', { status: 400 })
    }
    
    try {
      // Fetch the image from Supabase
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://ufsbd34.fr/',
          'Origin': 'https://ufsbd34.fr'
        }
      })
      
      if (!response.ok) {
        return new Response(`Image not found: ${response.status}`, { 
          status: response.status 
        })
      }
      
      // Get image data
      const imageBuffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'image/jpeg'
      
      // Return image with CORS headers
      return new Response(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Referer, User-Agent',
          'Cache-Control': 'public, max-age=3600',
          'Vary': 'Origin'
        }
      })
      
    } catch (error) {
      console.error('Worker proxy error:', error)
      return new Response(`Proxy error: ${error.message}`, { status: 500 })
    }
  }
  
  // Handle direct Supabase image requests
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.com')) {
    try {
      // Clone the request with proper headers
      const modifiedRequest = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers),
          'Origin': 'https://ufsbd34.fr',
          'Referer': 'https://ufsbd34.fr/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      // Fetch from Supabase
      const response = await fetch(modifiedRequest)
      
      if (!response.ok) {
        return response
      }
      
      // Add CORS headers to the response
      const modifiedResponse = new Response(response.body, response)
      modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')
      modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
      modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Referer, User-Agent')
      modifiedResponse.headers.set('Cache-Control', 'public, max-age=3600')
      modifiedResponse.headers.set('Vary', 'Origin')
      
      return modifiedResponse
      
    } catch (error) {
      console.error('Worker CORS error:', error)
      return new Response(`CORS error: ${error.message}`, { status: 500 })
    }
  }
  
  // For all other requests, pass through
  return fetch(request)
}

// Helper function to check if URL is a Supabase image
function isSupabaseImage(url) {
  return url.includes('supabase.co') || url.includes('supabase.com')
}

// Helper function to add CORS headers
function addCORSHeaders(response) {
  const newResponse = new Response(response.body, response)
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  newResponse.headers.set('Access-Control-Allow-Headers', 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Referer, User-Agent')
  newResponse.headers.set('Cache-Control', 'public, max-age=3600')
  newResponse.headers.set('Vary', 'Origin')
  return newResponse
}