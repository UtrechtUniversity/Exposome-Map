var map = L.map('map').setView([47.58, 6.06], 6);
var activeLayer = null;
var geoserverURL = "http://127.0.0.1:8080/geoserver/EXPANSE_map_prototype/wms";
var geoserver_workspace = "EXPANSE_map_prototype";

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Basemap options
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a>OpenStreetMap</a> contributors',
});
var darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a>OpenStreetMap</a> contributors &copy; <a>CARTO</a>',
    isBasemap: true
});
var lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a>OpenStreetMap</a> contributors &copy; <a>CARTO</a>',
    isBasemap: true
});

// Add baselayers to selection control
var baseLayers = {
    "OpenStreetMap": osmLayer,
    "Dark background": darkLayer,
    "Light background": lightLayer
};
L.control.layers(baseLayers).addTo(map);

// Add event listener for the show on map button. When clicked, it will fetch the selected layer
document.getElementById("showOnMapBtn").addEventListener("click", function() {
    if (window.selectedItem) {        
        var layerName = window.selectedItem.geoserver_layer;
        console.log("Layer name:", layerName);
        var style = window.selectedItem.geoserver_style;
        console.log("Style:", style);
        
        var date = window.selectedDate;
        console.log("Selected date:", date);

        if (window.currentDisplayedLayer) {
            map.removeLayer(window.currentDisplayedLayer);
        }
        window.currentDisplayedLayer = L.tileLayer.wms(geoserverURL, {
            layers: `${geoserver_workspace}:${layerName}`,
            format: 'image/png',
            version: '1.1.0',
            transparent: true,
            attribution: "",
            styles: style
        }).addTo(map);

        // Update map label
        var mapLabel = document.getElementById("map-label");
        console.log("Map label:", window.selectedItem);
        mapLabel.innerHTML = `<strong> ${window.selectedItem.Description} ${date || 'N/A'}</strong>`;
    }
});

map.on('click', function(e) {
    if (!window.selectedItem) {
        console.warn("No layer selected");
        return;
    }
    var layerName = window.currentDisplayedLayer.options.layers;
    console.log("Layer name:", layerName);
    var bbox = map.getBounds().toBBoxString();
    var point = map.latLngToContainerPoint(e.latlng);

    var requestURL = `${geoserverURL}?request=GetFeatureInfo&service=WMS&version=1.1.0&layers=${layerName}&query_layers=${layerName}&info_format=text/plain&x=${point.x}&y=${point.y}&width=${map.getSize().x}&height=${map.getSize().y}&bbox=${bbox}&srs=EPSG:4326`;
    console.log("GetFeatureInfo URL: ", requestURL);
});


//     if (activeLayer.size > 0) {
//         var point = map.latLngToContainerPoint(e.latlng);
//         var x = Math.round(point.x);
//         var y = Math.round(point.y);

//         //request data for active layer(skip basemaps)
//         activeLayers.forEach(function(layer) {
//             if (layer.options.isBasemap) {
//                 return;
//             }

//             var layerName = layer.options.layers;
//             var bbox = map.getBounds().toBBoxString();

//             var requestUrl = `${geoServerUrl}?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=${layerName}&query_layers=${layerName}&INFO_FORMAT=application/json&x=${x}&y=${y}&SRS=EPSG:4326&WIDTH=${map.getSize().x}&HEIGHT=${map.getSize().y}&bbox=${bbox}&_=${Date.now()}`;

//             fetch(requestUrl)
//                 .then(response => {
//                     if (!response.ok) {
//                         throw new Error('No network response');
//                     }
//                     return response.json();
//                 })
//                 .catch(error => {
//                     // console.error('Fetch error:', error);
//                 });
//         });
//     }
// });