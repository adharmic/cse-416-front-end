
var map = L.map('map', {
    minZoom: 4,
    maxZoom: 5,
    zoom: 4.5,
    maxBounds: L.latLngBounds(L.latLng(24.5, -124.7), L.latLng(49.4, -67)),
    zoomSnap: .5
});

var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>';

var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: cartodbAttribution
}).addTo(map);

map.setView([0, 0], 0);