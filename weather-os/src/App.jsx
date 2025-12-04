// weather-os/src/App.jsx

import React, { useState, useEffect } from 'react';
import './index.css';

const weatherCodes = {
  0: 'Céu Limpo',
  1: 'Predom. Limpo', 2: 'Parcial. Nublado', 3: 'Nublado',
  45: 'Nevoeiro', 48: 'Nevoeiro Gelo',
  51: 'Garoa Leve', 53: 'Garoa Mod.', 55: 'Garoa Densa',
  61: 'Chuva Fraca', 63: 'Chuva Mod.', 65: 'Chuva Forte',
  80: 'Pancadas Chuva', 95: 'Trovoada', 96: 'Trovoada c/ Granizo'
};

function App() {
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [statusMsg, setStatusMsg] = useState('AGUARDANDO INPUT DO USUÁRIO...');
  const [time, setTime] = useState('00:00:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async (lat, lon, locationName) => {
    setLoading(true);
    setStatusMsg("BAIXANDO DADOS DO SATÉLITE...");
    setWeatherData(null);

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
      const data = await response.json();

      if (data.current_weather) {
        setWeatherData({
          name: locationName,
          temp: Math.round(data.current_weather.temperature),
          wind: data.current_weather.windspeed,
          code: data.current_weather.weathercode
        });
        setStatusMsg('');
      } else {
        setStatusMsg("DADOS INCOMPLETOS");
      }
    } catch (error) {
      setStatusMsg("ERRO DE CONEXÃO. TENTE NOVAMENTE.");
    } finally {
      setLoading(false);
    }
  };

  const searchCity = async () => {
    if (!query) return;
    setLoading(true);
    setStatusMsg("BUSCANDO COORDENADAS...");
    
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=pt&format=json`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        fetchWeather(result.latitude, result.longitude, result.name);
      } else {
        setStatusMsg("ERRO 404: LOCAL NÃO ENCONTRADO");
        setWeatherData(null);
      }
    } catch (error) {
      setStatusMsg("ERRO DE COMUNICAÇÃO");
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setStatusMsg("RASTREANDO POSIÇÃO ATUAL...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude, "SUA LOCALIZAÇÃO");
        },
        (error) => {
          setLoading(false);
          setStatusMsg("ERRO NO GPS: " + error.message);
        }
      );
    } else {
      alert("Geolocalização não suportada.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      searchCity();
    }
  };

  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glow-cyan">
            <feGaussianBlur stdDeviation="4 1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="3 1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div id="tv-background"></div>
      <div id="tv-vignette"></div>

      <div className="main-container">
        <div className="screen">
          <div className="interference-line"></div>
          
          <div className="screen-header">
            <span className="blink">REC ●</span>
            <span>{time}</span>
          </div>

          <div className="content-wrapper">
            <h1 className="site-title">[WEATHER.OS]</h1>
            
            <div className="search-box">
              <span className="prompt">{'>'} INSERIR LOCAL:</span>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma cidade..." 
                autoComplete="off"
              />
              <button onClick={searchCity}>
                <i className="fas fa-search"></i>
              </button>
            </div>
            
            <div className="divider">--------------------------------</div>

            <div className="weather-panel">
              {(loading || !weatherData) && (
                <div className="loading-text">{statusMsg}</div>
              )}
              
              {!loading && weatherData && (
                <div id="weather-data">
                  <h2 className="glitch-text">{weatherData.name}</h2>
                  <div className="weather-grid">
                    <div className="stat-box">
                      <span className="label">TEMP</span>
                      <span className="value">{weatherData.temp}°C</span>
                    </div>
                    <div className="stat-box">
                      <span className="label">COND</span>
                      <span className="value">
                        {weatherCodes[weatherData.code] || "Desconhecido"}
                      </span>
                    </div>
                    <div className="stat-box">
                      <span className="label">VENTO</span>
                      <span className="value">{weatherData.wind} km/h</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="footer-msg">
              <button onClick={handleLocate} className="retro-btn">
                [ DETECTAR COORDENADAS ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;