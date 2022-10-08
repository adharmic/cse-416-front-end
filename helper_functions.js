// Helper functions for map changes

var zoomed = false;

class TwoWayMap {
    constructor(map) {
        this.map = map;
        this.reverseMap = {};
        for (const key in map) {
            const value = map[key];
            this.reverseMap[value] = key;
        }
    }
    get(key) { return this.map[key]; }
    revGet(key) { return this.reverseMap[key]; }
    keys() { return Object.keys(this.map); }
    values() { return Object.keys(this.reverseMap); }
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// Removes all map data and resets to a basic state view
function resetMap() {
    $(function () {
        $('#table').bootstrapTable('destroy');
    });
    var selector = document.getElementsByClassName("selector");
    selector[0].style.display = "none";
    var picker = document.getElementById("plans-picker");
    var radio_list = document.getElementById("picker");
    removeAllChildren(radio_list);
    radio_list.appendChild(plan_base);

    var compare_list = document.getElementById("compare-options");
    removeAllChildren(compare_list);

    // REMOVE PLOTS
    Plotly.purge('sv-chart');
    Plotly.purge('compare-chart');
    Plotly.purge('boxplot-chart');
    picker.style.display = "none";
    document.getElementById("seat-vote").style.display = "none";
    document.getElementById("seawulf").style.display = "none";
    document.getElementById("boxplot").style.display = "none";
    document.getElementById("compare").style.display = "none";
    map.setMinZoom(4);
    map.setMaxZoom(10);
    map.setZoom(4.5);
    map.setMaxBounds(L.latLngBounds(L.latLng(10, -124.7), L.latLng(49.4, -67)));
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    positron.addTo(map);
    reAddStates();
    resetStates();
    map.removeControl(info);
}

function removeSeawulfChart(){
    Plotly.purge('seawulf-chart');
}

// 
function reAddStates() {
    state_layers.forEach(element => {
        element.addTo(map);
    });
}

function resetStates() {
    zoomed = false;
    state_layers.forEach(element => {
        makeVis(element);
    });
}

function resetHighlightDistrict(e) {
    district_data.resetStyle(e.target);
    // district_data.setStyle(style);
    info.update();
}

function highlightFeature(e) {
    if (!zoomed) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.5
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
}

function showDistrict(geojson) {
    if (district_data) {
        map.removeLayer(district_data);
    }
    district_data = L.geoJSON(geojson, {
        style: districtStyle,
        onEachFeature: onEachStateFeature
    }).addTo(map);
}

function resetHighlight(e) {
    if (!zoomed)
        e.target.setStyle(style);
}

function loadStates() {
    // for (const [key, value] of Object.entries(DISTRICTING_STATES.map)) {
    // }
    for (const [key, value] of Object.entries(state_shapes)) {
        state_layers.push(
            L.geoJSON(value, {
                style: {
                    fillColor: '#83466b',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.5,
                    className: key
                }
            })
        )
    }
    state_layers.forEach(element => {
        element.on('mouseover', highlightFeature).on('mouseout', resetHighlight).on('click', zoomToFeature).addTo(map);
    });
}

function displayLoading(loader) {
    loader.classList.add("display");
    loader.style.display = 'block';
}

function hideLoading(loader) {
    loader.classList.remove("display");
    loader.style.display = 'none';
}

// This highlights the layer on hover, also for mobile
function highlightDistrict(e) {
    resetHighlightDistrict(e);
    var layer = e.target;
    layer.setStyle({
        weight: 4,
        color: 'black',
        fillOpacity: 0.5
    });
    info.update(layer.feature.properties);
}


function onEachStateFeature(feature, layer) {
    layer.on({
        mouseover: highlightDistrict,
        mouseout: resetHighlightDistrict,
        click: highlightDistrict
    });
}

function zoomToFeature(e, state = null) {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    info.addTo(map);

    positron.addTo(map);
    var target;
    if (e !== null) {
        target = e.target;
    }
    if (state !== null) {
        target = state_layers[state];
    }
    getState(target.options.style.className);

    var selector = document.getElementsByClassName("selector");
    selector[0].style.display = "block";
    var picker = document.getElementById("plans-picker")
    picker.style.display = "block";
    zoomed = true;
    map.setMinZoom(6.5);
    map.fitBounds(target.getBounds().pad(.5));
    state_layers.forEach(element => {
        makeInvis(element);
    });
    // showDistricts(target.options.style.className);
    var bounds = target.getBounds().pad(.5);
    bounds.extend(L.latLng([bounds.getSouthEast().lat, bounds.getSouthEast().lng + 2.25]));
    map.setMaxBounds(bounds);
}

function loadPlan(id) {
    if (selected_plan != id) {
        queryPlan(id);
        queryBoxWhisker('AFRICAN_AMERICAN', 'African American');
        querySeatShare();
        Plotly.purge('compare-chart');
    }
}

function makeInvis(layer) {
    layer.setStyle({
        opacity: 0,
        fillOpacity: 0
    })
}

function makeVis(layer) {
    layer.setStyle({
        fillColor: '#83466b',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
    })
}

function style(feature) {
    return {
        fillColor: '#83466b',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
    };
}

function districtStyle(feature) {
    return {
        fillColor: getColor(feature.properties.lean),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: .75
    };
}

function getColor(d) {
    return d < -15 ? '#5767ac' :
        d < -5 ? '#a0a9ed' :
            d > 5 ? '#ff9989' :
                d > 15 ? '#fa5a50' :
                    '#eae2ea';
}

function displayCompareOptions() {
    var drop = document.getElementById("compare-options");
    removeAllChildren(drop);
    for (let i = 0; i < available_plans.length; i++) {
        if (i !== selected_plan) {
            var new_plan_option = document.createElement("a");
            new_plan_option.onclick = function () { queryComparePlans(i); };
            new_plan_option.classList.add("dropdown-item");
            new_plan_option.href = "#";
            new_plan_option.innerHTML = available_plans[i][1];
            drop.appendChild(new_plan_option);
        }
    }
}