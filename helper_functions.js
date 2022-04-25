// Helper functions for map changes

var zoomed = false;

var district_data;

class TwoWayMap {
    constructor(map) {
       this.map = map;
       this.reverseMap = {};
       for(const key in map) {
          const value = map[key];
          this.reverseMap[value] = key;   
       }
    }
    get(key) { return this.map[key]; }
    revGet(key) { return this.reverseMap[key]; }
    keys() {return Object.keys(this.map);}
    values() {return Object.keys(this.reverseMap);}
}

// Removes all map data and resets to a basic state view
function resetMap() {
    $(function () {
        $('#table').bootstrapTable('destroy');
    });
    var selector = document.getElementsByClassName("selector");
    selector[0].style.display = "none";
    var picker = document.getElementById("plans-picker");
    picker.style.display = "none";
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
    district_data.setStyle(style);
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

function showDistricts(id) {
    district_data = L.geoJSON(districts, {
        style: style,
        onEachFeature: onEachStateFeature,
        filter: function (feature) {
            return (feature.properties.STATE === DISTRICTING_STATES.revGet(id));
        }
    }).addTo(map);
}

function resetHighlight(e) {
    if (!zoomed)
        e.target.setStyle(style);
}

function loadStates() {
    for(const [key, value] of Object.entries(DISTRICTING_STATES.map)) {
        state_layers.push(
            L.geoJSON(states, {
                style: {
                    fillColor: '#800026',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.5,
                    className: value
                },
                filter: function (feature) {
                    return (feature.properties.STATE === key);
                }
            })
        )
    }
    // DISTRICTING_STATES.forEach(element => {
    //     state_layers.push(
    //         L.geoJSON(states, {
    //             style: {
    //                 fillColor: '#800026',
    //                 weight: 2,
    //                 opacity: 1,
    //                 color: 'white',
    //                 dashArray: '3',
    //                 fillOpacity: 0.5,
    //                 className: element
    //             },
    //             filter: function (feature) {
    //                 return (feature.properties.STATE === element);
    //             }
    //         })
    //     )
    // });
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

// TODO: extricate fetch requests into separate js file for handling server connections
function zoomToFeature(e, state = null) {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    info.addTo(map);
    document.getElementById("default-plan").click();
    positron.addTo(map);
    var target;
    if (e !== null) {
        target = e.target;
    }
    if (state !== null) {
        target = state_layers[state];
    }
    // DETERMINES WHICH DATA TO GET
    getState(target.options.style.className);
    
    var selector = document.getElementsByClassName("selector");
    selector[0].style.display = "block";
    var picker = document.getElementById("plans-picker")
    picker.style.display = "block";
    zoomed = true;
    map.setMinZoom(6.5);
    map.fitBounds(target.getBounds().pad(.5));
    // map.setMinZoom(map.getZoom());
    state_layers.forEach(element => {
        // element.setOpacity(.5);
        makeInvis(element);
    });
    showDistricts(target.options.style.className);
    var bounds = target.getBounds().pad(.5);
    bounds.extend(L.latLng([bounds.getSouthEast().lat, bounds.getSouthEast().lng + 2.25]));
    // console.log(bounds);
    // bounds.include(L.latLng([bounds.getSouthWest().lat, bounds.getSouthWest().lon]));
    map.setMaxBounds(bounds);
}

function makeInvis(layer) {
    layer.setStyle({
        opacity: 0,
        fillOpacity: 0
    })
}

function makeVis(layer) {
    layer.setStyle({
        fillColor: '#800026',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
    })
}

function style(feature) {
    return {
        fillColor: '#800026',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5,
        className: feature.properties.GEO_ID
    };
}