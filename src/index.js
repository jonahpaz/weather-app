import "./styles.css";

//Remember to import local images to use them
//import odinImage from "./odin.png";

//This is for having dist in another branch.
// git add dist -f && git commit -m "Deployment commit"
// git subtree push --prefix dist origin gh-pages
// git checkout main

const img = document.querySelector('img');
const button = document.querySelector('button');
const input = document.querySelector('input');
const weatherDiv = document.querySelector('.weather');
const form = document.querySelector('form');

async function getWeather() {
    try {
        const weatherQuery = input.value;
        const weatherUrl = getWeatherUrl(weatherQuery);
        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const responseJson = await response.json();
        console.log(responseJson);
        updateWeather(responseJson);
        getImage(responseJson.currentConditions.icon);
    }
    catch {
        error => console.error(error);
    }
}
async function getImage(imageQuery) {
    try {
        const imageUrl = getImageUrl(imageQuery);
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const responseJson = await response.json();
        img.src = responseJson.data.images.original.url;
    }
    catch {
        error => console.error(error);
    }
}
function updateWeather(responseJson) {
    weatherDiv.innerHTML = `
        <h1 class="title">${responseJson.resolvedAddress}</h1>
        <ul class="feel">
            <li class="temp">
                <span class="right">${responseJson.currentConditions.temp}° F</span>
            </li>
            <li class="humidity">
                <span class="left">Humidity:</span>
                <span class="right">${responseJson.currentConditions.humidity}%</span>
            </li>
            <li class="feelslike">
                <span class="left">Feels like:</span>
                <span class="right">${responseJson.currentConditions.feelslike}° F</span>
            </li>
        </ul>
        <ul class="time">
            <li class="time">
                <span class="right">${responseJson.currentConditions.datetime}</span>
            </li>
            <li class="sunrise">
                <span class="left">Sunrise:</span>
                <span class="right">${responseJson.currentConditions.sunrise}</span>
            </li>
            <li class="sunset">
                <span class="left">Sunset:</span>
                <span class="right">${responseJson.currentConditions.sunset}</span>
            </li>
        </ul>
        <div class="description">${responseJson.description}</div>
    `;
}

function getImageUrl(weather) {
    const imageUrl = `https://api.giphy.com/v1/gifs/translate?api_key=EP1aADGgpN1C27awcTWFa4mQuZmATmft&s=${weather}`;
    return imageUrl;
}
function getWeatherUrl(city) {
    const weatherUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=XMNV8RNJA4KBVDP2D565KXSWJ`;
    return weatherUrl;
}

input.value = 'Tokyo';
getWeather();
button.addEventListener('click', getWeather);
form.addEventListener('submit', (e) => e.preventDefault());

