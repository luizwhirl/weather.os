export default async (req, context) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  
  const API_KEY = Netlify.env.get('GNEWS_API_KEY');

  if (!q) {
    return new Response("Faltou a cidade na busca", { status: 400 });
  }

  try {
    const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=pt&country=br&max=3&apikey=${API_KEY}`;
    
    const response = await fetch(gnewsUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Falha ao buscar notícias' }), { status: 500 });
  }
};