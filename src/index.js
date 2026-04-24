import "./styles.css";
import { format, compareAsc } from "date-fns";

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


async function getWeather(weatherQuery) {
    try {
        // weatherDiv.classList.add('loading');
        // img.classList.add('loading');

        weatherQuery = weatherQuery ? weatherQuery : input.value;
        console.log(weatherQuery);
        const weatherUrl = getWeatherUrl(weatherQuery);
        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const responseJson = await response.json();
        console.log(responseJson);
        updateWeather(responseJson);
        await getImage(responseJson.currentConditions.icon);

        // weatherDiv.classList.remove('loading');
        // img.classList.remove('loading');
    }
    catch(error) {
        console.error(error);
    }
}
async function getLocation() {
    if ( !("geolocation" in navigator) ) return 'Tokyo';

    const position = await getPosition();
    const locationUrl = getLocationUrl(position.coords.latitude, position.coords.longitude);
    const response = await fetch(locationUrl);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const responseJson = await response.json();
    const weatherQuery = responseJson.results[0].components.city;
    return weatherQuery;
}
async function getImage(imageQuery) {
    try {
        const imageUrl = getImageUrl(imageQuery);
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const responseJson = await response.json();
        img.src = responseJson.data.images.original.url;
    }
    catch(error) {
        console.error(error);
    }
}
function updateWeather(responseJson) {
    const formattedDateTime = getFormattedDateTime(responseJson);
    weatherDiv.innerHTML = `
        <h1 class="title">${responseJson.resolvedAddress}</h1>
        <ul class="feel">
            <li class="temp">
                <span class="right">${responseJson.currentConditions.temp}° F</span>
            </li>
            <li>
                <div class="humidity">
                    <span class="left">Humidity:</span>
                    <span class="right">${responseJson.currentConditions.humidity}%</span>
                </div>
                <div class="feelslike">
                    <span class="left">Feels like</span>
                    <span class="right">${responseJson.currentConditions.feelslike}° F</span>
                </div>
            </li>
        </ul>
        <ul class="time">
            <li class="time">
                <span class="right">${formattedDateTime.date}</span>
                <span class="right">${formattedDateTime.time}</span>
            </li>
            <li class="sunrise">
                <span class="left">Sunrise:</span>
                <span class="right">${formattedDateTime.sunrise}</span>
            </li>
            <li class="sunset">
                <span class="left">Sunset:</span>
                <span class="right">${formattedDateTime.sunset}</span>
            </li>
        </ul>
        <div class="description">${responseJson.description}</div>
    `;
    if (responseJson.alerts.length > 0) {
        const alertsDiv = document.createElement('div');
        weatherDiv.appendChild(alertsDiv);
        alertsDiv.classList.add('alerts');
        responseJson.alerts.forEach(alert => {
            alertsDiv.textContent += `${alert.description} `;
        });
    }
}

function getImageUrl(weather) {
    const imageUrl = `https://api.giphy.com/v1/gifs/translate?api_key=EP1aADGgpN1C27awcTWFa4mQuZmATmft&s=${weather}`;
    return imageUrl;
}
function getWeatherUrl(city) {
    const weatherUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=XMNV8RNJA4KBVDP2D565KXSWJ`;
    return weatherUrl;
}
function getLocationUrl(latitude, longitude) {
    const locationUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},+${longitude}&key=d5957b6808c44cadb135d8e17dcc466d&language=en&pretty=1`;
    return locationUrl;
}
function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
function getFormattedDateTime(responseJson) {
    const dateTimeObj = new Date(responseJson.currentConditions.datetimeEpoch);
    const day = format(dateTimeObj, 'cccc');
    const dayNum = format(dateTimeObj, 'do');
    const month = format(dateTimeObj, 'MMM');
    const formattedDate = `${day}, ${dayNum}, ${month}`;
    const formattedTime = format(dateTimeObj, 'p');
    const formattedSunrise = format(new Date('2000-01-01T' + responseJson.currentConditions.sunrise), 'p');
    const formattedSunset = format(new Date('2000-01-01T' + responseJson.currentConditions.sunset), 'p');
    return {
        date: formattedDate, 
        time: formattedTime, 
        sunrise: formattedSunrise, 
        sunset: formattedSunset
    };
}

getLocation()
    .then(weatherQuery => getWeather(weatherQuery))
    .catch(error => {
        console.error(error);
        getWeather('Tokyo');
    });
button.addEventListener('click', () => getWeather());
form.addEventListener('submit', (e) => e.preventDefault());

