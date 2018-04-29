## Neighborhood Map Project

The dist version of this application is hosted here: 
[http://24.28.142.95/u-neighborhood/index.html](http://24.28.142.95/u-neighborhood/index.html)

The github repository for this project is here: 
[https://github.com/txpmr001/u-neighborhood](https://github.com/txpmr001/u-neighborhood)

#### Description

This single page Google Maps web application displays neighborhood locations  with additional information collected through Google Places, Yelp, and Foursquare API's. API requests are routed through a PHP proxy in order to conceal API keys and to circumvent CORS restrictions. The application is based on the [jQuery Mobile](http://jquerymobile.com) web framework and uses a [Knockout](http://knockoutjs.com)  view model.

#### Using the Application

The application is run by loading file **index.html** which  displays 12 neighborhood locations on the map. A list view of these locations can be displayed / hidden by clicking the **List** button.  An info window for each location can be displayed by clicking on it's map marker or list item.  On small displays, any touch outside the list will hide the list view. On larger devices,  the map and list can be used side by side and the list view can be hidden explicitly with a button click or a swipe. The **Search** field can be used to restrict items on both the map and the list view. Searches are case insensitive. **Settings** can be used to display / hide map markers and to recenter the map.

The main javascript for the application is in file **js/neighborhood.js**, and the view model is in file **js/neighborhoodVM.js**. File **js/formatInfo.js**  contains the javascript for processing responses received from API requests. The data for the places initially loaded and displayed in the map is contained in file **places.json**.

#### Installing the Application

Command "*grunt build*" copies, minifies, and combines files from directory src to directory dist. After running *build*, update  **index.html** with the new minified css and javascript filenames.

In file **proxy.php**, make sure that array **\$hosts**  has an entry for each API domain.  Array  **\$keys** contains pairs of target keys and replacement values, one pair for each API.  Change replacement string *"API key goes here"* to your actual API key for each API. Use the corresponding key values in your API url's.

#### Acknowledgements

This application was built with [jQuery](http://jquery.com), [jQuery Mobile](http://jquerymobile.com), [Knockout](http://knockoutjs.com), [Lodash](https://lodash.com), and [Grunt](https://gruntjs.com/).  The map is created with the [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/tutorial).  Additional details for neighborhood locations are collected though the [Google Places Library](https://developers.google.com/maps/documentation/javascript/places),  the [Yelp Fusion API](https://www.yelp.com/developers/documentation/v3), and the [Foursquare Developers API](https://developer.foursquare.com/docs/api/getting-started).

Map styling is done with Snazzy Maps style [simple_retro_label](https://snazzymaps.com/style/19569/simple-retro-label) by Melissa.

The PHP proxy is based on the [PHP proxy for XMLHttpRequest calls](https://developer.yahoo.com/javascript/samples/proxy/php_proxy_simple.txt) written by Jason Levitt and posted in Yahoo's [JavaScript Developer Center](https://developer.yahoo.com/javascript/index.html).


 Written with [StackEdit](https://stackedit.io/).