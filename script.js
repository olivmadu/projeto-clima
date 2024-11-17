const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city");
const resultDiv = document.getElementById("weather-result");
const toggleThemeButton = document.getElementById("toggle-theme");
const getLocationButton = document.getElementById("get-location");
const chartCanvas = document.getElementById("temperatureChart");

const API_KEY = "ea879c38b67b905b4a2fe1f8ff710d22"; 
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Alternar o tema
toggleThemeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Buscar o clima por cidade
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value;
  if (!city) return;
  await getWeatherByCity(city);
});

// Buscar o clima pela localização do usuário
getLocationButton.addEventListener("click", async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await getWeatherByCoordinates(latitude, longitude);
    }, () => {
      resultDiv.innerHTML = `<p style="color: red;">Permissão de localização negada.</p>`;
    });
  }
});

// Função para buscar o clima por cidade
async function getWeatherByCity(city) {
  try {
    const response = await fetch(`${API_URL}?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`);
    if (!response.ok) throw new Error("Cidade não encontrada");
    const data = await response.json();
    renderWeatherData(data);
    await getForecast(city);
  } catch (error) {
    resultDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
}

// Função para buscar o clima por coordenada
async function getWeatherByCoordinates(lat, lon) {
  try {
    const response = await fetch(`${API_URL}?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`);
    if (!response.ok) throw new Error("Clima não encontrado");
    const data = await response.json();
    renderWeatherData(data);
  } catch (error) {
    resultDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
}

// Renderizar dados
function renderWeatherData(data) {
  const { name, main, weather, wind, sys } = data;
  const temperature = main.temp;
  const description = weather[0].description;
  const icon = weather[0].icon;
  const humidity = main.humidity;
  const windSpeed = wind.speed;
  const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString("pt-BR");
  const sunset = new Date(sys.sunset * 1000).toLocaleTimeString("pt-BR");

  resultDiv.innerHTML = `
    <h2>${name}</h2>
    <p>Temperatura: ${temperature}°C</p>
    <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
    <p>Umidade: ${humidity}%</p>
    <p>Vento: ${windSpeed} km/h</p>
    <p>Nascer do sol: ${sunrise}</p>
    <p>Pôr do sol: ${sunset}</p>
    <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
  `;
}

// Obter previsão
async function getForecast(city) {
  try {
    const response = await fetch(`${FORECAST_URL}?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`);
    if (!response.ok) throw new Error("Previsão não encontrada");
    const data = await response.json();
    renderForecastChart(data);
  } catch (error) {
    console.error(error.message);
  }
}

// Renderizar o gráfico da previsão
function renderForecastChart(data) {
  const labels = [];
  const temperatures = [];

  data.list.slice(0, 5).forEach((item) => {
    labels.push(new Date(item.dt * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    temperatures.push(item.main.temp);
  });

  new Chart(chartCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperatura (°C)",
        data: temperatures,
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2
      }]
    }
  });
}

