// Create the map object with a center and zoom level.
var myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 5
  });
  
  // Add a tile layer (the background map image) to our map.
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
  }).addTo(myMap);
  
  // Use this link to get the GeoJSON data.
  var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  
  // Function to determine marker size based on magnitude
  function markerSize(magnitude) {
    return magnitude * 4;
  }
  
  // Function to determine marker color based on depth
  function markerColor(depth) {
    if (depth > 90) return "#ff5f65";
    else if (depth > 70) return "#fca35d";
    else if (depth > 50) return "#fdb72a";
    else if (depth > 30) return "#f7db11";
    else if (depth > 10) return "#dcf400";
    else return "#a3f600";
  }
  
  // Perform a GET request to the query URL
  d3.json(link).then(function(data) {
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: markerSize(feature.properties.mag),
          fillColor: markerColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
      }
    }).addTo(myMap);
  
    // Create a legend
    var legend = L.control({ position: "bottomright" });
  
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend"),
        depth = [0, 10, 30, 50, 70, 90],
        labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
          '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' +
          depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
      }
  
      return div;
    };
  
    legend.addTo(myMap);
  });
  
  