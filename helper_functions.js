var zoomed = false;

function resetMap() {
    var selector = document.getElementsByClassName("selector");
    selector[0].style.display = "none";
    var picker = document.getElementById("plans-picker")
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

}

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

function highlightFeature(e) {
    if (!zoomed) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
}

function showDistricts(id) {
    // L.geoJSON(districts).addTo(map);
    var gump = L.geoJSON(districts, {
        filter: function (feature) {
            return (feature.properties.STATE === id);
        }
    }).addTo(map);
}

function resetHighlight(e) {
    if (!zoomed)
        e.target.setStyle(style);
}

function loadStates() {
    DISTRICTING_STATES.forEach(element => {
        state_layers.push(
            L.geoJSON(states, {
                style: {
                    fillColor: '#800026',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    className: element
                },
                filter: function (feature) {
                    return (feature.properties.STATE === element);
                }
            })
        )
    });
}

function zoomToFeature(e) {
    var selector = document.getElementsByClassName("selector");
    selector[0].style.display = "block";
    var picker = document.getElementById("plans-picker")
    picker.style.display = "block";
    zoomed = true;
    map.setMinZoom(6.5);
    map.fitBounds(e.target.getBounds().pad(.5));
    // map.setMinZoom(map.getZoom());
    state_layers.forEach(element => {
        // element.setOpacity(.5);
        makeInvis(element);
    });
    showDistricts(e.target.options.style.className);
    var bounds = e.target.getBounds().pad(.5);
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
        fillOpacity: 0.7
    })
}

function style(feature) {
    return {
        fillColor: '#800026',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        className: feature.properties.GEO_ID
    };
}