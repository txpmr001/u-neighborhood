// define, instantiate, and apply knockout bindings for the NeighborhoodVM
function NeighborhoodVM() {
    var self = this;

    // reset the filter when text changes in the search field
    self.setFilter = function(value) {
      self.filter(value);
    };

    // select a single place
    self.selectPlace = function(place) {
      place.isSelected(true);
    };

    // unselect all places
    self.unselectAllPlaces = function() {
      mapPlaces().forEach(function(place) {
        place.isSelected(false);
      });
    };

    // handle click events for places in the list view
    self.clickPlace = function(place) {
      if (place.isSelected()) {
        // switch place from selected to unselected
        self.unselectAllPlaces();  // unselect all places
        selectMarker(null);  // unselect this place marker on the map 
      } else {
        // switch place from unselected to selected
        self.unselectAllPlaces();  // unselect all places
        self.selectPlace(place);  // select this place
        selectMarker(markers[place.idx]);  // select this place marker on the map
      };
    };

    // load places
    self.loadPlaces = function() {
      $.getJSON("places.json").done(function(data, textStatus, jqxhr) {
        data.forEach(function(item) {
          // make list phone number a phone link
          if (item.phone) {
            item.phoneLink = 'tel:' + item.phone;
          } else {
            item.phoneLink = '';
          }
          // add uppercase name and address to the search property
          item.search = item.name.toUpperCase();
          if (item.address) {
            item.search = item.search + ' ' + item.address.toUpperCase();
          }
          item.isSelected = ko.observable(false);  // initially no items are selected
          mapPlaces().push(item);  // all places go here
        });
        self.filter('');  // initial search filter is empty string
      }).fail(function(jqxhr, textStatus, errorThrown) {
        alert('Error loading places data file. (' + errorThrown +
          ') Details in the console.');
      });
    };

    // initialize the view model
    self.initialize = function() {
        mapPlaces = ko.observable([]);  // all places to appear on the map and list
        self.filter = ko.observable(null);  // search term
        // compute filtered places based on search term, making filtered places
        //   equal to all places when there is no search term
        mapFilteredPlaces = ko.computed(function() {
            var filter = self.filter();
            if (filter) {
                filter = filter.toUpperCase();  // searches are case insensitive 
                return mapPlaces().filter(function(i) { return i.search.indexOf(filter) >= 0; });
            } else {
                return mapPlaces();
            };
        });
        mapFilteredPlaces.subscribe(function(newValue) {
            // update map markers when filtered places change
            filterMarkers();
        });
        self.showMarkers = ko.observable('Yes');  // make show markers the default
        self.showMarkers.subscribe(function(newValue) {
          if (newValue == 'Yes') {
            showMarkers();  // show markers when toggled to yes
          } else {
            hideMarkers();  // hide markers when toggled to no
          }
        });
    };

    self.initialize();  // initialize the view model
    self.loadPlaces();  // load places data
}

var neighborhoodVM = new NeighborhoodVM();  // instantiate the view model
ko.applyBindings(neighborhoodVM);           // apply knockout bindings
