import { Plugin } from 'vite';

export function proxyImagePlugin(): Plugin {
  return {
    name: 'proxy-image',
    configureServer(server) {
      // Handle proxy image requests
      server.middlewares.use('/api/proxy-image', async (req, res, next) => {
        try {
          const url = req.url?.split('?url=')[1];
          
          if (!url) {
            res.statusCode = 400;
            res.end('Missing URL parameter');
            return;
          }

          const decodedUrl = decodeURIComponent(url);
          
          // Fetch the image
          const response = await fetch(decodedUrl, {
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
            res.statusCode = response.status;
            res.end(`Image not found: ${response.status}`);
            return;
          }

          // Get image data
          const imageBuffer = await response.arrayBuffer();
          const contentType = response.headers.get('content-type') || 'image/jpeg';

          // Set headers
          res.setHeader('Content-Type', contentType);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Referer, User-Agent');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.setHeader('Vary', 'Origin');

          // Send the image
          res.end(Buffer.from(imageBuffer));

        } catch (error) {
          console.error('Proxy image error:', error);
          res.statusCode = 500;
          res.end(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      // Handle CORS preflight requests
      server.middlewares.use('/api/proxy-image', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Referer, User-Agent');
          res.setHeader('Access-Control-Max-Age', '86400');
          res.statusCode = 200;
          res.end();
          return;
        }
        next();
      });
    }
  };
}