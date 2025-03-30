// Cloudflare Worker script to proxy API requests to Succinct Stats API
// This handles CORS issues by acting as a middleware

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS headers for development and production
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:5173', // Development
    // 'Access-Control-Allow-Origin': 'https://yourproductiondomain.com', // Uncomment for production
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
  
  // Get URL parameters - ignoring path for more reliable operation
  const url = new URL(request.url)
  const username = url.searchParams.get('username')
  
  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
  
  try {
    // Fetch data from the actual API
    const apiUrl = `https://www.succinct-stats.xyz/api/leaderboard?action=getByUsername&username=${username}`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Return the response with CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
} 
