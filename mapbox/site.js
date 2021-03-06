'use strict';
/* global mapboxgl */

mapboxgl.accessToken = 'pk.eyJ1IjoiczEwNDE3NDgiLCJhIjoiY2traTR3ajBqMDZwYjJucXMxb3dleDY3MiJ9.DXlwHSTcaYXvM1TQiFQH7Q';
var map = new mapboxgl.Map({
  container: 'map',
  attributionControl: {
    position: 'top-left'
  },
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [120.673195,24.121166],
  zoom: 17,
  bearing: -9.47,
  pitch: 45.00
});
map.on('load', function () {
  map.addSource('floorplan', {
      // GeoJSON Data source used in vector tiles, documented at
      // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
      'type': 'geojson',
      'data':
          'https://raw.githubusercontent.com/Liurray/mywebapp/main/mapbox/features.geojson'
  });
  map.addLayer({
      'id': 'room-extrusion',
      'type': 'fill-extrusion',
      'source': 'floorplan',
      'paint': {
          // See the Mapbox Style Specification for details on data expressions.
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

          // Get the fill-extrusion-color from the source 'color' property.
          'fill-extrusion-color': ['get', 'color'],

          // Get fill-extrusion-height from the source 'height' property.
          'fill-extrusion-height': ['get', 'height'],

          // Get fill-extrusion-base from the source 'base_height' property.
          'fill-extrusion-base': ['get', 'base_height'],

          // Make extrusions slightly opaque for see through indoor walls.
          'fill-extrusion-opacity': 0.5
      }
  });
});

var marker;
var delta = 100;
var vConsole = new VConsole();
map.boxZoom.disable();
map.dragPan.disable();
map.doubleClickZoom.disable();
map.scrollZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

var geolocate = new mapboxgl.Geolocate({position: 'top-right' ,trackUserLocation: true});
map.addControl(geolocate);



geolocate.on('geolocate', function(e) {
  // Apparently this get's reset on result :/
  var lng = e.coords.lngitude;
  var lat = e.coords.latitude;
  map.setLngLat([lng,lat]);
      console.log(`position :`+lng +" "+ " "+lat);
  map.setBearing(-9.47);
  map.setPitch(45.00);
});
function easeTo(t) {
  if (marker && t === 1) marker.remove();
  return t * (2 - t);
}

function move(pos, bearing) {
  if (bearing) {
    map.easeTo({
      bearing: pos,
      easing: easeTo
    });
  } else {
    map.panBy(pos, {
      easing: easeTo
    });
  }
}




var compass = document.querySelector('.js-compass');
window.addEventListener('deviceorientation', function (event) {
  var alpha = event.alpha;
  var rotate = 'rotate(' + alpha + 'deg)';
  move(0 - alpha, true); //根據指向方向 0- 指北針的方向 = 目前面向
  compass.style.transform = rotate;
  //console.log(alpha);
})
/*map.on('rotate', function() {
  //監聽
  var rotate = 'rotate(' + alpha + 'deg)';
  compass.style.transform = rotate;
});*/



function buttonStart(b) {
  persist = setInterval(function () {
    goDirection(b[0]);
  }, 20);
}



function createMarker(e) {
  var markerEl = document.createElement('div');
  var dot = document.createElement('div');
  dot.className = 'waypoint-dot';
  var shadow = document.createElement('div');
  shadow.className = 'waypoint-shadow';
  markerEl.appendChild(dot);
  markerEl.appendChild(shadow);
  marker = new mapboxgl.Marker(markerEl).setLngLat(e.lngLat).addTo(map);

  window.setTimeout(function () {
    map.flyTo({
      center: e.lngLat,
      easing: easeTo
    });
  }, 500);
}

map.on('click', createMarker);
map.on('touchstart', createMarker);
map.on('locationfound', function (e) {
  map.fitBounds(e.bounds);

  myLayer.setGeoJSON({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [e.latlng.lng, e.latlng.lat]
    },
    properties: {
      'title': 'Here I am!',
      'marker-color': '#ff8888',
      'marker-symbol': 'star'
    }
  });

  // And hide the geolocation button
  geolocate.parentNode.removeChild(geolocate);
});