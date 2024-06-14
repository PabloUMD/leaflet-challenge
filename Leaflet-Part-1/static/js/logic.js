// Create the map object with a center and zoom level.
var myMap = L.map("map", {
  center: [37.7749, -122.4194],
  zoom: 3
});

// Add tile layers (the background map images) to our map.
var streetmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(myMap);

var darkmap = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; <a href='https://carto.com/attributions'>CARTO</a>"
});

var satellite = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
});

// Use these links to get the GeoJSON data.
var earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

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

// Perform a GET request to the earthquake data URL
d3.json(earthquakeLink).then(function(data) {
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakes = L.geoJSON(data, {
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
  });

  // Perform a GET request to the tectonic plates data URL
  d3.json(tectonicPlatesLink).then(function(plateData) {
    var tectonicPlates = L.geoJSON(plateData, {
      style: function(feature) {
        return {
          color: "orange",
          weight: 2
        };
      }
    });

    // Create base maps
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap,
      "Satellite": satellite
    };

    // Create overlay maps
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Add the earthquake layer to the map by default
    earthquakes.addTo(myMap);
    // Add the tectonic plates layer to the map by default
    tectonicPlates.addTo(myMap);

    // Create a legend
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend"),
        depth = [0, 10, 30, 50, 70, 90],
        labels = [];

      // loop through our depth intervals and generate a label with a colored square for each interval
      for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
          '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' +
          depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
      }

      return div;
    };

    legend.addTo(myMap);
  });
});

  