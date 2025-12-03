const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locateBtn = document.getElementById('locate-btn');
const statusMsg = document.getElementById('status-msg');
const weatherData = document.getElementById('weather-data');
const systemClock = document.getElementById('system-clock');

function playStaticEffect() {
    document.body.style.textShadow = "-2px 0 red, 2px 0 blue";
    setTimeout(() => {
        document.body.style.textShadow = "none";
    }, 200);
}

setInterval(() => {
    const now = new Date();
    systemClock.textContent = now.toLocaleTimeString('pt-BR');
}, 1000);

const weatherCodes = {
    0: 'Céu Limpo',
    1: 'Predom. Limpo', 2: 'Parcial. Nublado', 3: 'Nublado',
    45: 'Nevoeiro', 48: 'Nevoeiro Gelo',
    51: 'Garoa Leve', 53: 'Garoa Mod.', 55: 'Garoa Densa',
    61: 'Chuva Fraca', 63: 'Chuva Mod.', 65: 'Chuva Forte',
    80: 'Pancadas Chuva', 95: 'Trovoada', 96: 'Trovoada c/ Granizo'
};

async function fetchWeather(lat, lon, locationName) {
    statusMsg.style.display = 'block';
    weatherData.style.display = 'none';
    statusMsg.textContent = "BAIXANDO DADOS DO SATÉLITE...";
    
    playStaticEffect();

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
        const data = await response.json();

        if (data.current_weather) {
            updateDisplay(data.current_weather, locationName);
        } else {
            throw new Error("Dados incompletos");
        }
    } catch (error) {
        statusMsg.textContent = "ERRO DE CONEXÃO. TENTE NOVAMENTE.";
        console.error(error);
    }
}

function updateDisplay(weather, name) {
    statusMsg.style.display = 'none';
    weatherData.style.display = 'block';
    
    document.getElementById('city-name').classList.add('blink');
    setTimeout(() => document.getElementById('city-name').classList.remove('blink'), 500);

    document.getElementById('city-name').textContent = name;
    document.getElementById('temp').textContent = `${Math.round(weather.temperature)}°C`;
    document.getElementById('wind').textContent = `${weather.windspeed} km/h`;
    
    const code = weather.weathercode;
    document.getElementById('condition').textContent = weatherCodes[code] || "Desconhecido";
}

locateBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        statusMsg.style.display = 'block';
        statusMsg.textContent = "RASTREANDO POSIÇÃO ATUAL...";
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeather(lat, lon, "SUA LOCALIZAÇÃO");
            },
            (error) => {
                statusMsg.textContent = "ERRO NO GPS: " + error.message;
            }
        );
    } else {
        alert("Geolocalização não suportada neste navegador.");
    }
});

async function searchCity(cityName) {
    statusMsg.style.display = 'block';
    statusMsg.textContent = "BUSCANDO COORDENADAS...";
    
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=pt&format=json`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            fetchWeather(result.latitude, result.longitude, result.name);
        } else {
            statusMsg.textContent = "ERRO 404: LOCAL NÃO ENCONTRADO";
        }
    } catch (error) {
        statusMsg.textContent = "ERRO DE COMUNICAÇÃO";
    }
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) searchCity(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value;
        if (city) searchCity(city);
    }
});

statusMsg.textContent = "AGUARDANDO INPUT DO USUÁRIO...";