// Proxy Image API Endpoint
// This handles CORS issues by proxying image requests through the server

export async function proxyImage(url: string): Promise<Response> {
  try {
    // Validate URL
    if (!url || !url.startsWith('http')) {
      return new Response('Invalid URL', { status: 400 });
    }

    // Fetch the image from the original source
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://ufsbd34.fr/',
        'Origin': 'https://ufsbd34.fr',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      return new Response(`Image not found: ${response.status}`, { 
        status: response.status 
      });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Referer, User-Agent',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Vary': 'Origin'
      }
    });

  } catch (error) {
    console.error('Proxy image error:', error);
    return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500 
    });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function handleCORSRequest(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Referer, User-Agent',
      'Access-Control-Max-Age': '86400'
    }
  });
}