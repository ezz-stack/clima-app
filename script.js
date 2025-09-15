const apiKey = "683a77a7ac63b15a32e6d7019910fbc7";


const searchBox = document.getElementById("city-input");

const errorMessage = document.querySelector(".error-message");

const weatherDisplay = document.querySelector(".weather-display");

const mainWeatherIcon = document.querySelector(".main-weather-icon");

const loadingSpinner = document.querySelector(".loading-spinner");

const searchHistoryContainer = document.querySelector(".search-history");

const historyList = document.querySelector(".history-list");

const tempToggle = document.getElementById('temp-unit');


// Elementos para mostrar los datos

const cityElement = document.querySelector(".city");

const tempElement = document.querySelector(".temp");

const humidityElement = document.querySelector(".humidity");

const pressureElement = document.querySelector(".pressure");

const windElement = document.querySelector(".wind");

const forecastHoursContainer = document.querySelector(".forecast-hours");


// Elementos del selector de días

const daySpans = document.querySelectorAll(".nav-date");

const arrowLeft = document.querySelector(".left-arrow");

const arrowRight = document.querySelector(".right-arrow");


let forecastData = [];

let currentIndex = 0;

let isCelsius = true;


// --- Funciones del historial de búsqueda ---

function saveToHistory(city) {

    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];

    history = history.filter(item => item.toLowerCase() !== city.toLowerCase());

    history.unshift(city);

    if (history.length > 5) {

        history.pop();

    }

    localStorage.setItem('weatherHistory', JSON.stringify(history));

    displayHistory();

}


function displayHistory() {

    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];

    if (history.length > 0) {

        historyList.innerHTML = '';

        history.forEach(city => {

            const historyItem = document.createElement('div');

            historyItem.classList.add('history-item');

            historyItem.textContent = city;

            historyItem.addEventListener('click', () => {

                searchBox.value = city;

                getWeatherData(city);

            });

            historyList.appendChild(historyItem);

        });

        searchHistoryContainer.style.display = 'block';

    } else {

        searchHistoryContainer.style.display = 'none';

    }

}


// --- Event Listeners ---

searchBox.addEventListener("keypress", (event) => {

    if (event.key === "Enter" && searchBox.value.trim() !== "") {

        getWeatherData(searchBox.value);

    }

});


daySpans.forEach(span => {

    span.addEventListener("click", (event) => {

        const index = parseInt(event.target.dataset.index);

        currentIndex = index;

        updateDaySelector();

        updateUI();

    });

});


arrowLeft.addEventListener("click", () => {

    if (currentIndex > 0) {

        currentIndex--;

        updateDaySelector();

        updateUI();

    }

});


arrowRight.addEventListener("click", () => {

    if (currentIndex < 4) {

        currentIndex++;

        updateDaySelector();

        updateUI();

    }

});


tempToggle.addEventListener('change', () => {

    isCelsius = !tempToggle.checked;

    updateUI();

});


// --- Funciones de Lógica ---

async function getWeatherData(query, isLocation = false) {

    loadingSpinner.style.display = "block";

    weatherDisplay.style.display = "none";

    errorMessage.style.display = "none";

   

    try {

        let apiUrl;

        if (isLocation) {

            apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${query.latitude}&lon=${query.longitude}&appid=${apiKey}&units=metric&lang=es`;

        } else {

            apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${apiKey}&units=metric&lang=es`;

        }


        const response = await fetch(apiUrl);

       

        if (response.status === 404) {

            errorMessage.style.display = "block";

            loadingSpinner.style.display = "none";

            return;

        }


        const data = await response.json();

        forecastData = data.list;


        currentIndex = 0;

       

        cityElement.innerHTML = data.city.name;

        updateDaySelector();

        updateUI();

        saveToHistory(data.city.name);


        errorMessage.style.display = "none";

        loadingSpinner.style.display = "none";

        weatherDisplay.style.display = "block";


    } catch (error) {

        console.error("Error al obtener los datos del clima:", error);

        errorMessage.style.display = "block";

        loadingSpinner.style.display = "none";

        weatherDisplay.style.display = "none";

    }

}


// Función para actualizar el selector de días

function updateDaySelector() {

    const today = new Date();

   

    arrowLeft.style.visibility = currentIndex === 0 ? "hidden" : "visible";

    arrowRight.style.visibility = currentIndex === 4 ? "hidden" : "visible";

   

    daySpans.forEach((span, i) => {

        const date = new Date(today);

        date.setDate(today.getDate() + currentIndex - 1 + i);

        const day = date.getDate();

        const month = date.getMonth() + 1;

        span.textContent = `${month}/${day}`;

        span.classList.remove("current-date");

    });

   

    daySpans[1].classList.add("current-date");

}


// Función para actualizar la interfaz completa

function updateUI() {

    const selectedDate = new Date();

    selectedDate.setDate(selectedDate.getDate() + currentIndex);

    const selectedDay = selectedDate.getDate();


    const currentDayData = forecastData.find(item => {

        const itemDate = new Date(item.dt * 1000);

        return itemDate.getDate() === selectedDay;

    });


    if (!currentDayData) return;


    let temp = currentDayData.main.temp;

    if (!isCelsius) {

        temp = (temp * 9/5) + 32;

    }

   

    tempElement.innerHTML = `${Math.round(temp)}°`;

    humidityElement.innerHTML = `<span>${currentDayData.main.humidity}%</span> Humedad`;

    pressureElement.innerHTML = `<span>${currentDayData.main.pressure}hPa</span> Presión`;

    windElement.innerHTML = `<span>${Math.round(currentDayData.wind.speed)}m/s</span> Viento`;

   

    const weatherMain = currentDayData.weather[0].main;

    mainWeatherIcon.className = 'main-weather-icon';

    switch (weatherMain) {

        case "Clear":

            mainWeatherIcon.classList.add('clear');

            break;

        case "Clouds":

            mainWeatherIcon.classList.add('cloudy');

            break;

        case "Rain":

        case "Drizzle":

            mainWeatherIcon.classList.add('rainy');

            break;

        case "Thunderstorm":

            mainWeatherIcon.classList.add('stormy');

            break;

        case "Snow":

            mainWeatherIcon.classList.add('snowy');

            break;

        case "Mist":

        case "Smoke":

        case "Haze":

        case "Dust":

        case "Fog":

            mainWeatherIcon.classList.add('misty');

            break;

        default:

            mainWeatherIcon.classList.add('default');

            break;

    }


    displayHourlyForecast(selectedDay);

}


// Función para mostrar el pronóstico por hora del día seleccionado

function displayHourlyForecast(selectedDay) {

    forecastHoursContainer.innerHTML = '';

    const now = new Date();

   

    const hourlyDataForDay = forecastData.filter(item => new Date(item.dt * 1000).getDate() === selectedDay);


    for (let i = 0; i < hourlyDataForDay.length; i++) {

        const item = hourlyDataForDay[i];

        if (!item) continue;


        const date = new Date(item.dt * 1000);

        const hour = date.getHours();

       

        const hourItem = document.createElement('div');

        hourItem.classList.add('hour-item');


        const displayTime = hour + 'hs';

       

        const isNow = date.getDate() === now.getDate() && Math.abs(date.getHours() - now.getHours()) < 3;

       

        let temp = item.main.temp;

        if (!isCelsius) {

            temp = (temp * 9/5) + 32;

        }


        hourItem.innerHTML = `

            <span>${Math.round(temp)}°</span>

            <span class="${isNow ? 'now' : ''}">${isNow ? 'NOW' : displayTime}</span>

        `;

        forecastHoursContainer.appendChild(hourItem);

    }

}


// Función para obtener la ubicación automática

function getAutoLocation() {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const { latitude, longitude } = position.coords;

                getWeatherData({ latitude, longitude }, true);

            },

            (error) => {

                console.error("Error al obtener la ubicación:", error);

                getWeatherData("Buenos Aires"); // Valor por defecto si falla

            }

        );

    } else {

        getWeatherData("Buenos Aires"); // Valor por defecto si no hay geolocalización

    }

}


displayHistory();

getAutoLocation(); 