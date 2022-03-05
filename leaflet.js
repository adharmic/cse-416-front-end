

var selector = document.getElementsByClassName("selector");
selector[0].style.display = "none";

const DISTRICTING_STATES = ["32", "22"]

const states = state_data.features.filter(function (entry) {
    return DISTRICTING_STATES.includes(entry.properties.STATE);
});

var map = L.map('map', {
    minZoom: 4,
    maxZoom: 10,
    zoom: 4.5,
    maxBounds: L.latLngBounds(L.latLng(10, -124.7), L.latLng(49.4, -67)),
    zoomSnap: .5
});
map.removeControl(map.zoomControl);

var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>';

var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: cartodbAttribution
}).addTo(map);

var state_layers = [];

var district_layers = [];

loadStates();

console.log(state_layers);

state_layers.forEach(element => {
    element.on('mouseover', highlightFeature).on('mouseout', resetHighlight).on('click', zoomToFeature).addTo(map);
});

// L.geoJSON(states).on('mouseover', highlightFeature).addTo(map);

map.setView([0, 0], 0);