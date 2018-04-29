/*
 * functions formatGoogle, formatYelp, formatFoursquare
 * insert responses from api servers into info window display templates
 *   function formatGoogle     uses var googleTemplate
 *   function formatYelp       uses var yelpTemplate
 *   function formatFoursquare uses var foursquareTemplate
 * 
 * if there is no api data, the api data is not json, or the api data
 * contains error info from the api server, error msgs are logged
 * to the console and the info window display is updated accordingly   
 */

// template for google info window display
var googleTemplate = 
  '<br>' +
  '<table style="background-color: #f0f0f0;">' +
  '  <tr>' +
  '   <td>' +
  '      <div style="padding: 3px;">' +
  '        %streetAddress%' +
  '        <span style="padding-left: 20px">%openClosed%</span>' +
  '      </div>' +
  '      <div style="padding: 3px;">Hours: %hoursToday%</div>' +
  '      <div style="padding: 3px;">' +
  '        %websiteLink%' +
  '        <span style="padding-left: 20px">Call: </span>' +
  '        %phoneLink%' +
  '      </div>' +
  '    </td>' +
  '  </tr>' +
  '  <tr>' +
  '    <td colspan="2" align="center">' +
  '      %googleLink%' +
  '    </td>' +
  '  </tr>' +
  '  <tr>' +
  '    <td colspan="2" align="center">' +
  '      %mapLink%' +
  '    </td>' +
  '  </tr>' +
  '</table>';

// template for yelp info window display
var yelpTemplate =
  '<br>' +
  '<table style="background-color: #f0f0f0;">' + 
  '  <tr>' +
  '    <td style="vertical-align: middle;">' +
  '      <div><img src="%starsImg%" alt="Rating Stars" style="padding: 5px;"></div>' +
  '      <div>%numReviews%</div>' +
  '    </td>' +
  '    <td style="vertical-align: middle; padding-left: 15px;">' +
  '      %detailsLink%' +
  '    </td>' +
  '  </tr>' +
  '  <tr>' +
  '    <td colspan="2" align="center">' +
  '      %yelpLink%' +
  '    </td>' +
  '  </tr>' +
  '</table>';

// template for foursquare info window display
var foursquareTemplate =
  '<br>' +
  '<table style="background-color: #f0f0f0;">' + 
  '  <tr>' +
  '    <td style="vertical-align: middle;">' +
  '      <div style="padding: 5px;">%category%</div>' +
  '      <div>%checkinsCount%, %tipCount%.</div>' +
  '    </td>' +
  '    <td style="vertical-align: middle; padding-left: 15px;">' +
  '      %detailsLink%' +
  '    </td>' +
  '  </tr>' +
  '  <tr>' +
  '    <td colspan="2" align="center">' +
  '      %foursquareLink%' +
  '    </td>' +
  '  </tr>' +
  '</table>';

// log error and format info window display accordingly
function formatError(marker, api, apiData, apiError, textStatus) {
  // error getting api info 
  console.log('formatError:', api, 'marker', marker.idx, marker.title);
  console.log('formatError: apiData =', apiData);
  console.log('formatError: apiError =', apiError);
  console.log('formatError: textStatus =', textStatus);
  var infoMsg = 'Error getting ' + api + ' info for this place.<br>(Details in Console.)';
  var formattedInfo = '<br><div>' + infoMsg + '</div><br>';
  return formattedInfo;
}

// format google places api data
function formatGoogle(marker, api, apiData, apiError, textStatus) {
  // set default values for all substitutions
  var streetAddress = 'No address.';
  var openClosed = 'No open now info.';
  var hoursToday = 'No hours info.';
  var websiteLink = '<span>No website.</span>';
  var phoneLink = '<span>No phone info.</span>';
  var googleLink = '<img src="images/google_logo.png" alt="Google Logo" height="20">';
  var mapLink = 'No map link.';

  // replace default values with api info when found
  if (_.has(marker.googleInfo, 'result.formatted_address')) {
    streetAddress = marker.googleInfo.result.formatted_address;
    streetAddress = streetAddress.substr(0, streetAddress.indexOf(','));
  }
  if (_.has(marker.googleInfo, 'result.opening_hours.open_now')) {
    openClosed = (marker.googleInfo.result.opening_hours.open_now ? 'OPEN' : 'CLOSED');
    openClosed = '<strong>' + openClosed + '</strong> now.';
  }
  if (_.has(marker.googleInfo, 'result.opening_hours.weekday_text')) {
    var d = new Date();
    var weekdayIdx = (d.getDay() + 6) % 7;
    hoursToday = marker.googleInfo.result.opening_hours.weekday_text[weekdayIdx];
  }
  if (_.has(marker.googleInfo, 'result.website')) {
    websiteLink = '<a href="' + marker.googleInfo.result.website + '" target="_blank" ' +
    'style="text-decoration: none;">View Website</a>';
  }
  if (_.has(marker.googleInfo, 'result.formatted_phone_number')) {
    phoneLink = '<a href="tel:' + marker.googleInfo.result.formatted_phone_number +
      '" style="text-decoration: none;">' + marker.googleInfo.result.formatted_phone_number + '</a>';
  }
  if (_.has(marker, 'googleId')) {
    var googleUrl = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id=' +
      marker.googleId;
    var googleLogo = '<img src="images/google_logo.png" alt="Google Logo" height="20">';  
    googleLink = '<a href="' + googleUrl + '" target="_blank">' +
      googleLogo + '</a>';
    mapLink = '<a href="' + googleUrl + '" target="_blank">' +
      'View in Google Maps</a>';
  }

  // insert api info into display template
  var formattedInfo = googleTemplate;
  formattedInfo = formattedInfo.replace('%streetAddress%', streetAddress);
  formattedInfo = formattedInfo.replace('%openClosed%', openClosed);
  formattedInfo = formattedInfo.replace('%hoursToday%', hoursToday);
  formattedInfo = formattedInfo.replace('%websiteLink%', websiteLink);
  formattedInfo = formattedInfo.replace('%phoneLink%', phoneLink);
  formattedInfo = formattedInfo.replace('%googleLink%', googleLink);
  formattedInfo = formattedInfo.replace('%mapLink%', mapLink);
  return formattedInfo;  
}

// format yelp api data 
function formatYelp(marker, api, apiData, apiError, textStatus) {
  if (_.has(marker.yelpInfo, 'error.code') && _.has(marker.yelpInfo, 'error.description')) {
    // error info, not place info
    var formattedInfo = formatError(marker, api, apiData, apiError, textStatus);
  } else {    
    // set default values for all substitutions
    var starsImg = 'imagenotfound.gif';
    var numReviews = 'No reviews number.';   
    var yelpLink = '<img src="images/yelp_logo.png" alt="Yelp Logo" height="30">';
    var detailsLink = 'No details link.';
      
    // replace default values with api info when found
    if (_.has(marker.yelpInfo, 'rating')) {
      var yelpRating = marker.yelpInfo.rating.toFixed(1);
      var intPart = yelpRating.substr(0, yelpRating.indexOf('.'));
      var decPart = yelpRating.substr(yelpRating.indexOf('.') + 1);
      starsImg = 'images/yelp_stars/regular_' + intPart +
        ((decPart == '5') ? '_half' : '') + '.png';
    }
    if (_.has(marker.yelpInfo, 'review_count')) {
      numReviews = 'Based on <strong>' + marker.yelpInfo.review_count.toString() +
        '</strong> reviews.';
    }    
    if (_.has(marker.yelpInfo, 'url')) {
      var yelpLogo = '<img src="images/yelp_logo.png" alt="Yelp Logo" height="30">';  
      yelpLink = '<a href="' + marker.yelpInfo.url + '" target="_blank">' +
        yelpLogo + '</a>';
      detailsLink = '<a href="' + marker.yelpInfo.url + '" target="_blank">' +
        'More<br>Details...</a>';
    }
    
    // insert api info into display template
    var formattedInfo = yelpTemplate;
    formattedInfo = formattedInfo.replace('%starsImg%', starsImg);
    formattedInfo = formattedInfo.replace('%numReviews%', numReviews);
    formattedInfo = formattedInfo.replace('%yelpLink%', yelpLink);
    formattedInfo = formattedInfo.replace('%detailsLink%', detailsLink);
  }  
  return formattedInfo;  
}

// format foursquare api data
function formatFoursquare(marker, api, apiData, apiError, textStatus) {
  if (_.has(marker.foursquareInfo, 'meta.errorType') && _.has(marker.foursquareInfo, 'meta.errorDetail')) {
    // error info, not place info
    var formattedInfo = formatError(marker, api, apiData, apiError, textStatus);
  } else {
    // set default values for all substitutions
    var category = 'No Category info.';
    var checkinsCount = 'No checkins info';
    var tipCount = 'No tip info';
    var foursquareLink = '<img src="images/foursquare_logo.png" alt="Foursquare Logo" height="30">';
    var detailsLink = 'No details link.';
  
    // replace default values with api info when found
    if (_.has(marker.foursquareInfo, 'response.venues')) {
      var venue = marker.foursquareInfo.response.venues[0];
      if (_.has(venue, 'categories')) {
        category = venue.categories[0].name;
      }
      if (_.has(venue, 'stats.checkinsCount')) {
        checkinsCount = '<strong>' + venue.stats.checkinsCount + '</strong> checkins';
      }
      if (_.has(venue, 'stats.tipCount')) {
        tipCount = '<strong>' + venue.stats.tipCount + '</strong> tips';
      }
      if (_.has(venue, 'id')) {
        var foursquareUrl = 'http://foursquare.com/v/' + venue.id;
        var foursquareLogo = '<img src="images/foursquare_logo.png" alt="Foursquare Logo" height="30">';  
        foursquareLink = '<a href="' + foursquareUrl + '" target="_blank">' +
          foursquareLogo + '</a>';
        detailsLink = '<a href="' + foursquareUrl + '" target="_blank">' +
          'More<br>Details...</a>';
      }
    }

    // insert api info into display template
    var formattedInfo = foursquareTemplate;
    formattedInfo = formattedInfo.replace('%category%', category);
    formattedInfo = formattedInfo.replace('%checkinsCount%', checkinsCount);
    formattedInfo = formattedInfo.replace('%tipCount%', tipCount);
    formattedInfo = formattedInfo.replace('%foursquareLink%', foursquareLink);
    formattedInfo = formattedInfo.replace('%detailsLink%', detailsLink);
  }
  return formattedInfo; 
}

// check for valid json data from the api server,
// pass the data to a specific formatting function or to the error function,
// update the marker's display info and open the info window when done  
function formatInfo(marker, api, apiData, apiError, textStatus) {
  var infoKey = api + 'Info';
  var displayKey = api + 'Display';
  var error = false;
  if (apiData) {
    try {
      marker[infoKey] = JSON.parse(apiData);
    }
    catch(e) {
      error = true;  // api data is not json
    }
  } else {
    error = true;  // no api data
  }
  if (error) {
    formattedInfo = formatError(marker, api, apiData, apiError, textStatus);
  } else if (api == 'google') {
    formattedInfo = formatGoogle(marker, api, apiData, apiError, textStatus);
  } else if (api == 'yelp') {
    formattedInfo = formatYelp(marker, api, apiData, apiError, textStatus);
  } else if (api == 'foursquare') {
    formattedInfo = formatFoursquare(marker, api, apiData, apiError, textStatus);
  }
  marker[displayKey] = formattedInfo;
  if (marker.googleDisplay && marker.yelpDisplay && marker.foursquareDisplay) {
    showInfo(marker);  // last one displays the info window 
  }
}
