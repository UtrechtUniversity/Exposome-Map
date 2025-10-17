var map = L.map('map').setView([47.58, 6.06], 6);
window.currentDisplayedLayer = null;
map.createPane('basemaps');

var geoserverURL = "http://127.0.0.1:8080/geoserver/EXPANSE_map_prototype/wms";
var geoserver_workspace = "EXPANSE_map_prototype";

var slider = document.getElementById("opacity-slider");
var opacityValue = parseFloat(slider.value);

window.dateParameter = null;

// Basemap options
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a>OpenStreetMap</a> contributors',
    isBasemap: true,
    pane: 'basemaps'
});
var darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a>OpenStreetMap</a> contributors &copy; <a>CARTO</a>',
    isBasemap: true,
    pane: 'basemaps'
});
var lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a>OpenStreetMap</a> contributors &copy; <a>CARTO</a>',
    isBasemap: true,
    pane: 'basemaps'
});

// Add baselayers to selection control
map.getPane('basemaps').style.zIndex = 200;
map.getPane('basemaps').style.pointerEvents = 'none';

var baseLayers = {
    "OpenStreetMap": osmLayer,
    "Dark background": darkLayer,
    "Light background": lightLayer
};
L.control.layers(baseLayers, {}, {collapsed: false}).addTo(map);

// Keep basemaps always at the back
map.on('baselayerchange', function(e) {
    if (e.layer.options && e.layer.options.isBasemap) {
        e.layer.getPane().style.zIndex = 100;
    }
});

// Default basemap
osmLayer.addTo(map);
osmLayer.bringToBack();



// Prepare dates to be used as parameters for WMS requests
function selectDateCleanup(dateStr) {
    console.log("Selected date string:", dateStr);
    var length = String(dateStr).length;
    var monthMap = {
    "Jan": "01",
    "Feb": "02",
    "Mar": "03",
    "Apr": "04",
    "May": "05",
    "Jun": "06",
    "Jul": "07",
    "Aug": "08",
    "Sep": "09",
    "Oct": "10",
    "Nov": "11",
    "Dec": "12"
    };
    if (length === 4) { // Yearly, add day and month
        window.dateParameter = dateStr + "-01-01" + "T00:00:00.000Z"; // January 1 of that year
        // Ex: 2024-01-01T00:00:00.000Z
    }
    else if (length === 8) { // Monthly, add day and convert month number
        var month = dateStr.substring(0, 3);

        month = monthMap[month];
        // Add month to the year part
        window.dateParameter = dateStr.substring(4, 8) + "-" + month + "-01" + "T00:00:00.000Z"; // 1st day of that month
        // Ex: 2024-12-01T00:00:00.000Z
    }
    else {
        var day = dateStr.substring(0, 2);
        var month = dateStr.substring(3, 6);
        month = monthMap[month];
        var year = dateStr.substring(7, 11);
        window.dateParameter = year + "-" + month + "-" + day + "T00:00:00.000Z";
        // Ex: 2024-12-15T00:00:00.000Z
    }
}

// Add event listener for the show on map button. When clicked, it will fetch the selected layer
document.getElementById("showOnMapBtn").addEventListener("click", function() {
    if (window.selectedItem) {        
        var layerName = window.selectedItem.geoserver_layer;
        console.log("Layer name:", layerName);
        var style = window.selectedItem.geoserver_style;
        console.log("Style:", style);
        
        selectDateCleanup(window.selectedDate)

        console.log("Date parameter for WMS request:", window.dateParameter);

        if (window.currentDisplayedLayer) {
            map.removeLayer(window.currentDisplayedLayer);
        }
        console.log("Current Opacity value:", opacityValue);
        window.currentDisplayedLayer = L.tileLayer.wms(geoserverURL, {
            layers: `${geoserver_workspace}:${layerName}`,
            TIME: window.dateParameter,
            format: 'image/png',
            version: '1.1.0',
            transparent: true,
            attribution: "",
            styles: style,
            pane: 'overlayPane'
        }).addTo(map).setOpacity(opacityValue).bringToFront();

        // Update map label
        var mapLabel = document.getElementById("map-label");
        mapLabel.innerHTML = `<strong> ${window.selectedItem.Description} ${window.selectedDate}</strong>`;
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
    var x = Math.round(point.x);
    var y = Math.round(point.y);

    var requestURL = `${geoserverURL}?request=GetFeatureInfo&service=WMS&version=1.1.0&layers=${layerName}&query_layers=${layerName}&info_format=text/plain&x=${x}&y=${y}&width=${map.getSize().x}&height=${map.getSize().y}&bbox=${bbox}&srs=EPSG%3A3857`;
    console.log("GetFeatureInfo URL: ", requestURL);
});

// Opacity slider control

slider.addEventListener("input", function() {
    opacityValue = parseFloat(slider.value);
    if (window.currentDisplayedLayer) {
        window.currentDisplayedLayer.setOpacity(opacityValue);
    }
});


//     if (activeLayer.size > 0) {
//         var point = map.latLngToContainerPoint(e.latlng);


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