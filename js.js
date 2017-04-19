var APIbase = 'https://api.instabridge.com/lite/';
var APItoken = '&token=0a00333dfb10f99badc647af68586a17c9dcf14242970d81bc96b1af5e6b23bf81aec823ad27f153';

var offset = 0;
var radius = 100;
var userPos = false;

// https://www.w3schools.com/html/html5_geolocation.asp
var messageEl = document.getElementById("message");
var resultEl = document.getElementById("result");
var otherEl = document.getElementById("loadNext");

function showWiFi(response) {

  hotspot = response.hotspots[0];

  ga('send', 'event', 'WiFi', 'Got wifi', {
    nonInteraction: true
  });

  if(hotspot.venue_name) {
    resultEl.innerHTML =
      '<p class="greatWiFi">Now there\'s some great fucking WiFi:</p><p>Go to<br/><b>' +
      hotspot.venue_name +
      '</b><br/>at<br/><b>' +
      hotspot.venue_address +
      '</b>.</p><p style="text-align: center"><a id="directionsBtn" class="btn" href="https://www.google.com/maps/dir/Current+location/' + hotspot.lat + ',' + hotspot.lon + '">Show me the fucking way!</a></p>';
  } else {
    resultEl.innerHTML = '<p class="greatWiFi">Now there\'s some great fucking WiFi:</p><p style="margin-top: 10vmin;">Go to<br/><b>' +
      hotspot.ssid +
      '</b></p><p style="text-align: center"><a id="directionsBtn" class="btn" href="https://www.google.com/maps/dir/Current+location/' + hotspot.lat + ',' + hotspot.lon + '">Show me the fucking way!</a></p>';
  }


  document.getElementById("directionsBtn").onclick = function(){
    ga('send', 'event', {
      eventCategory: 'Button',
      eventAction: 'Directions',
      transport: 'beacon'
    });
  };

  resultEl.className = '';
  messageEl.className = 'hidden';
  otherEl.className = 'active';
  offset++;
}

function getHotspotsAtLocation(position, offset) {
  otherEl.className = "";
  resultEl.className = 'hidden';
  messageEl.className = '';
  var url = APIbase + 'hotspots?radius=' + radius + '&offset=' + offset + '&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&limit=1' + APItoken;
  messageEl.innerHTML = "<p>Finding the best fucking WiFi...</p>";

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    console.log(this)
    if (this.readyState == 4 && this.status == 200) {

      var responseObj = JSON.parse(this.responseText);

      if(responseObj.hotspots.length == 0) {
        radius += 100;
        getHotspotsAtLocation(position, offset)
      } else {
        showWiFi(responseObj);
      }
    } else if (this.readyState == 4 && this.status != 200) {
      messageEl.innerHTML = "<p>Something fucked up - try again later :(</p>";
    } else {
      messageEl.innerHTML = "<p>Finding the best fucking WiFi...</p>";
    }
  }

  xhttp.open("GET", url, true);
  xhttp.send();


}

function getWiFi(offset) {
  otherEl.className = "";
  resultEl.className = 'hidden';
  messageEl.className = '';
  if (navigator.geolocation) {
    messageEl.innerHTML = "<p>Fetching your fucking location...</p>"
    navigator.geolocation.getCurrentPosition(function(position) {
      ga('send', 'event', 'Location', 'Got location', {
        nonInteraction: true
      });
      userPos = position;
      getHotspotsAtLocation(userPos, offset)
    });
  } else {
    messageEl.innerHTML = "<p>Geolocation is not supported by this fucking browser.</p>";
  }
}

otherEl.onclick = function() {
  ga('send', 'event', 'Button', 'Other WiFi');
  getHotspotsAtLocation(userPos, offset);
}

document.getElementById("getApp").onclick = function(){
  ga('send', 'event', {
    eventCategory: 'Button',
    eventAction: 'Get app',
    transport: 'beacon'
  });
};

getWiFi(offset);
