// create variables for the google map
var map;
var lgInfoWindow;
var markers = [];
var initCenter, initZoom;

// create variables for all places and filtered places
var mapPlaces;
var mapFilteredPlaces;

// resize map div to make the main page display full screen
function sizeMap() {
  // get screen height...
  var screenHeight = $.mobile.getScreenHeight(); // get screen height
  // collect the heights of non .map-content areas...
  var toolbarHeight = $(".toolbar").outerHeight();
  // calculate and set the new map height
  var newMapHeight = (screenHeight - toolbarHeight);
  $(".map-content").height(newMapHeight);
  $(".ui-panel-inner").height(newMapHeight);
  $(".ui-panel").height(newMapHeight);
}

// create listeners for events affecting .ui-content size
$(document).on("pagecontainertransition", function(event) {
  sizeMap();
});
$(window).on("resize", function(event) {
  sizeMap();
});
$(window).on("orientationchange", function(event) {
  sizeMap();
});

// keep the keyboard from popping up on touch devices
$('#map').bind('touchstart', function(e){
  $('#search-mini').blur();
});

// display list button, resize the map
$("#list-panel").click(function() {
  google.maps.event.trigger(map, "resize");
});

// recenter map button
$("#recenter-map").click(function() {
  map.setCenter(initCenter);
  map.setZoom(initZoom);
  google.maps.event.trigger(map, 'resize');
});

// make markers visible
function showMarkers() {
  markers.forEach(function(marker) {
    marker.setMap(map);
  });
  filterMarkers();  // re-apply search filter  
}

// make markers hidden
function hideMarkers() {
  markers.forEach(function(marker) {
    marker.setMap(null);
  });    
}

// execute api get request, pass results to formatInfo
function getInfoApi(marker, api, apiUrl) {
  // make get request & process the response
  var proxyUrl = 'proxy.php';
  apiUrl = proxyUrl + '?apiurl=' + apiUrl;
  $.get(apiUrl).done(function(data, textStatus, jqxhr) {
    formatInfo(marker, api, data, null, textStatus);
  }).fail(function(jqxhr, textStatus, errorThrown) {
    formatInfo(marker, api, null, jqxhr, textStatus);
  });
}

// create url's for api get requests or empty info displays if there's no api data  
function getInfo(marker) {
  marker.googleDisplay = null;
  marker.yelpDisplay = null;
  marker.foursquareDisplay = null;
    
  if (marker.googleId) {
    var apiUrl = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' +
      marker.googleId + '&key=%google_api_key%';
    getInfoApi(marker, 'google', apiUrl);
  } else {
    // no google place id
    var infoMsg = 'No Google Id for this place';
    var formattedInfo = '<br><div>' + infoMsg + '</div><br>';
    marker.googleDisplay = formattedInfo;
  }

  if (marker.yelpId) {
    var apiUrl = 'https://api.yelp.com/v3/businesses/' + marker.yelpId +
      '&header=Authorization:%yelp_api_key%';
    getInfoApi(marker, 'yelp', apiUrl);
  } else {
    // no yelp place id
    var infoMsg = 'No Yelp Id for this place';
    var formattedInfo = '<br><div>' + infoMsg + '</div><br>';
    marker.yelpDisplay = formattedInfo;
  }

  var lat = mapPlaces()[marker.idx].location.lat;
  var lng = mapPlaces()[marker.idx].location.lng;
  var latLng = lat.toFixed(7) + ',' + lng.toFixed(7);
  var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' + latLng + '&v=20180101&client_id=%foursq_client_id%&client_secret=%foursq_client_secret%';
  getInfoApi(marker, 'foursquare', apiUrl);
}

// update info window with selected marker and formatted info, then open
function showInfo(marker) {
  marker.showInfo = marker.showInfo + marker.googleDisplay;
  marker.showInfo = marker.showInfo + marker.yelpDisplay;
  marker.showInfo = marker.showInfo + marker.foursquareDisplay;

  lgInfoWindow.marker = marker;
  lgInfoWindow.setContent(marker.showInfo);
  lgInfoWindow.open(map, marker);
}

// create a new map marker
function addMarker(idx, title, position, googleId, yelpId) {
  var marker = new google.maps.Marker({
    idx: idx,
    title: title,
    position: position,
    googleId: googleId,
    yelpId: yelpId,
    icon: 'images/blue-dot.png',
    map: map,
    animation: null
  });
  
  // initialize marker api info to null
  marker.googleInfo = null;
  marker.yelpInfo = null;
  marker.foursquareInfo = null;

  // add a listener to select this place when clicked
  marker.addListener('click', function() {
    neighborhoodVM.unselectAllPlaces();
    neighborhoodVM.selectPlace(mapPlaces()[this.idx]);
    selectMarker(this);
  });
  markers.push(marker);
}

// create a marker for each place
function addMarkers() {
  mapPlaces().forEach(function(place) {
    addMarker(place.idx, place.name, place.location, place.googleId, place.yelpId);
  });
}

// filter markers when search text changes
function filterMarkers() {
  var showIdx = [];
  mapFilteredPlaces().forEach(function(place) {
    showIdx.push(place.idx);
  });
  markers.forEach(function(marker) {
    if (showIdx.includes(marker.idx)) {
      marker.setMap(map);
    } else {
      marker.setMap(null);
    };      
  });
}

// select a marker 
function selectMarker(marker) {
  if (lgInfoWindow.marker) {
    // make previously selected marker blue again
    lgInfoWindow.marker.setIcon('images/blue-dot.png');
  }
  lgInfoWindow.close();
  if (marker) {
    lgInfoWindow.setContent('');
    marker.setIcon('images/red-dot.png');
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
          marker.setAnimation(null);
      }, 2000);
    };

    // title for info window
    marker.showInfo = '<div style="text-align: center;">' +
      '<strong>' + marker.title + '</strong></div>';
    getInfo(marker);  // add api info to info window
  };
}

function initMap() {
  // instantiate the info window with no content
  lgInfoWindow = new google.maps.InfoWindow({
    content: ''
  });
  // add closeclick listener
  lgInfoWindow.addListener('closeclick', function() {
    neighborhoodVM.unselectAllPlaces();
    lgInfoWindow.marker.setIcon('images/blue-dot.png');
    lgInfoWindow.marker = null;
  });

  // Snazzy Maps: simple_retro_label by Mellissa
  var styles = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#255b6b"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#f1efe8"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#c9dfa7"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#aea87a"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#88c0c4"}]}];

  // instantiate the map object
  initCenter = {lat: 29.539150, lng: -98.664258};
  initZoom = 13;
  map = new google.maps.Map(document.getElementById('map'), {
    center: initCenter,
    zoom: initZoom,
    styles: styles,
    mapTypeControl: true,
    mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU}
  });

  addMarkers();
}
