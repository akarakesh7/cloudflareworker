// Simplified Cloudflare Worker that ignores path and focuses on just the username parameter

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS headers with localhost allowed
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
  
  // Get URL parameters
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
    // Fetch from the original API
    const apiUrl = `https://www.succinct-stats.xyz/api/leaderboard?action=getByUsername&username=${username}`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Return with CORS headers
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
