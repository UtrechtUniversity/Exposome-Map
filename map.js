var map = L.map('map').setView([52.3784, 4.9009], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

//overlay layers
// var layerName1 = 'EXPANSE_map_prototype:OZOB25_MAV_XX_02_13_v2';

// var wmsLayer1 = new L.TileLayer.WMS(geoServerUrl, {
//     layers: layerName1,
//     format: 'image/png',
//     transparent: true,
//     attribution: ""
// }).setOpacity(1).addTo(map);


var geoServerUrl = 'http://127.0.0.1:8080/geoserver/EXPANSE_map_prototype/wms';
// Add event listener for the show on map button. When clicked, it will print the info of the window item selected.
document.getElementById("showOnMapBtn").addEventListener("click", function() {
    if (window.selectedItem) {
        console.log("Show on map clicked for:", window.selectedItem);
        var storename = window.selectedItem.store;
        console.log("Store name:", storename);

        if (window.currentProductLayer) {
            map.removeLayer(window.currentProductLayer);
        }

        window.currentProductLayer = L.tileLayer.wms(geoServerUrl, {
            layers: `EXPANSE_map_prototype:${storename}`,
            format: 'image/png',
            version: '1.1.0',
            transparent: true,
            attribution: "",
            styles: "NO2B100_AAV"
        }).addTo(map);

        var requestUrl = `${geoServerUrl}?service=WMS&version=1.1.0&request=GetMap&layers=EXPANSE_map_prototype%3A${storename}&bbox=3770675.0%2C2927525.0%2C4081900.0%2C3192300.0&width=768&height=653&srs=EPSG%3A3035&styles=NO2B100_AAV&format=image%2Fgeotiff`;
        console.log("Request URL:", requestUrl);
                        fetch(requestUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('No network response');
                }
                return response.blob();
            })
    }
});


window.addEventListener("itemSelected", e => {
  const selected = e.detail;
  console.log("New item selected:", selected);

  // Example: update map or details panel
//   updateMap(selected);
});

// window.addEventListener("itemSelected", e => {
//   const item = e.detail; // This is the same object stored in window.selectedItem
//   console.log("New item selected:", item.description, item);
// });



// //click function to fetch data of active layer
// map.on('click', function(e) {
//     if (activeLayers.size > 0) {
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