export async function handler(event, context) {
  const location = event.queryStringParameters.location;
  
  const API_KEY = process.env.GNEWS_API_KEY;

  if (!location) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Localização não fornecida" }),
    };
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(location)}&lang=pt&country=br&max=3&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Falha ao buscar as notícias." }),
    };
  }
}