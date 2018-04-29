<?php
//
//  to use this proxy, create an http get request with a url formatted like this:
//    proxy.php?apiurl=your_api_url_goes_here
//    e.g. proxy.php?apiurl=https://api.foursquare.com/v2/venues/search?ll=29.5200510,-98.6439320&v=20180101&client_id=%foursq_client_id%&client_secret=%foursq_client_secret%
//
//  make sure that array $hosts contains an entry for each api host (domain)
//
//  any key names in the api url will be replaced by their corresponding values
//    as specified in array $keys
//
//  if the api url ends with parameter &header, it will be stripped and added 
//    as a request header (yelp api reqires this)
//    e.g. proxy.php?apiurl=https://api.yelp.com/v3/businesses/91uQB46ZSIYygGJeaf3Jww&header=Authorization:%yelp_api_key% 
//
// adapted from:
//   PHP Proxy example for Yahoo! Web services
//   Author: Jason Levitt
//   December 7th, 2005

// define allowed api hosts (domains)
$hosts = array (
  'https://maps.googleapis.com',
  'https://api.yelp.com',
  'https://api.foursquare.com'
  );

// define api key name / value pairs
$keys = array (
  array('%google_api_key%', 'API key goes here'),
  array('%yelp_api_key%', 'Bearer API key goes here'),
  array('%foursq_client_id%', 'API key goes here'),
  array('%foursq_client_secret%', 'API key goes here')
  );

// get the api url from the query string
$api_url = substr($_SERVER['QUERY_STRING'], 7);

// check for the api host in the array of allowed hosts
$host_match = false;
foreach ($hosts as $key=>$item) {
  $len = strlen($item);
  if (substr($api_url, 0, $len) == $item) {
    $host_match = true;
    break;
  }
}
if ($host_match === false) {
  echo 'host not allowed';  // api host not allowed
  return;
}

// replace key names with corresponding values in api url
foreach ($keys as $key=>$item) {
  $api_url = str_replace($item[0], $item[1], $api_url);    
};

$ch = curl_init();  // open curl session
$header_pos = strpos($api_url, '&header=');
if ($header_pos) {
  // add the header if one was included in the query string  
  $header = substr($api_url, $header_pos + 8);
  $api_url = substr($api_url, 0, $header_pos);
  $header = urldecode($header);  
  $request_headers = array($header);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $request_headers);
}
curl_setopt($ch, CURLOPT_URL, $api_url);
// don't return http headers, do return contents
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// make api request
$result = curl_exec($ch);

// set content-type and return result
header("Content-Type: text/html");
echo $result;
curl_close($ch);

?>
