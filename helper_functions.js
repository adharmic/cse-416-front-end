var zoomed = false;

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
            console.log(feature.properties.STATE);
            return (feature.properties.STATE === id);
        }
    }).addTo(map);
    console.log(id);
}

function resetHighlight(e) {
    if (!zoomed)
        e.target.setStyle(style);
}

function zoomToFeature(e) {
    zoomed = true;
    map.setMinZoom(6.5);
    map.fitBounds(e.target.getBounds());
    console.log(e.target);
    console.log(e.target.options.style.className);
    // map.setMinZoom(map.getZoom());
    state_layers.forEach(element => {
        // element.setOpacity(.5);
        makeInvis(element);
        console.log(element);
    });
    showDistricts(e.target.options.style.className);
}

function makeInvis(layer) {
    layer.setStyle({
        opacity: 0,
        fillOpacity: 0
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