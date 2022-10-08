var selector = document.getElementsByClassName("selector");
selector[0].style.display = "none";

var picker = document.getElementById("plans-picker")
picker.style.display = "none";

var map = L.map('map', {
    minZoom: 4,
    maxZoom: 10,
    zoom: 4.5,
    maxBounds: L.latLngBounds(L.latLng(10, -124.7), L.latLng(49.4, -67)),
    zoomSnap: .5
});
map.removeControl(map.zoomControl);

var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>';

var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd'
}).addTo(map);

var state_layers = [];

var district_layers = [];

queryStateShapes();

// L.geoJSON(states).on('mouseover', highlightFeature).addTo(map);

map.setView([0, 0], 0);

// var info = L.control({position: 'topleft'});
// info.onAdd = function (map) {
//   this._div = L.DomUtil.create('div', 'info');
//   return this._div;
// };

// Creates an info box on the map
var info = L.control({ position: 'topleft' });
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

// Edit info box text and variables (such as props.density2010) to match those in your GeoJSON data
info.update = function (props) {
    this._div.innerHTML = '<h6><nobr>District Information:</h6>';

    if(props) {
        new_lean = "R+" + Math.ceil(props.lean);
        if(props.lean <= 0) {
            new_lean = "D+" + Math.ceil(props.lean * -1)
        }
        this._div.innerHTML += ("<b>Political Lean:</b> " + new_lean + 
            "<br /><nobr><b>Total Population:</b> " + props.pop + 
            "<br /><nobr><b>African American Population:</b> " + props.af + 
            "<br /><nobr><b>American Indian Population:</b> " + props.nat + 
            "<br /><nobr><b>Hispanic Latino Population:</b> " + props.his +
            "<br /><nobr><b>Asian Population:</b> " + props.asian + 
            "<br /><nobr><b>Pacific Islander Population:</b> "+ props.pacific +
            "<br /><nobr><b>White Population:</b> " + props.white);
    }
    else {
        this._div.innerHTML += "<nobr> Hover over a district"
    }
}
