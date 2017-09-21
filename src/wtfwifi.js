var APIbase = 'https://api.instabridge.com/lite/';
var APItoken = '&token=0a00333dfb10f99badc647af68586a17c9dcf14242970d81bc96b1af5e6b23bf81aec823ad27f153';

var offset = 0;
var perRequest = 100;
var radius = 500;
var userPos = false;
var blackList = []

var app = new Vue({
  el: '#content',
  data: {
    message: '<br/>Loading...',
    result: false,
    results: [],
    listOffset: -1
  },
  methods: {
    setWiFi: function(wifi) {
      this.result = wifi
      this.message = false;
    },
    getNextWiFi: function () {
      ga('send', 'event', 'Button', 'Other WiFi');

      this.listOffset++;
      blackList.push(this.result.id);

      if (this.results.length > this.listOffset)
        this.setWiFi(this.results[this.listOffset]);
      else {
        this.listOffset = 0;
        this.setWiFi(this.results[this.listOffset]);
      }
    },
    gaDirections: function() {
      ga('send', 'event', {
        eventCategory: 'Button',
        eventAction: 'Directions',
        transport: 'beacon'
      });
    },
    gaGetApp: function() {
      ga('send', 'event', {
        eventCategory: 'Button',
        eventAction: 'Get app',
        transport: 'beacon'
      });
    }
  }
});

function getHotspotsAtLocation(position, _offset) {

  position = {
    coords: {
      latitude:19.4326,
      longitude:-99.1332
    }
  };
  app.result = false;
  app.results = [];
  app.message = "Finding the best WiFi...";
  addedWiFi = false;

  var url = APIbase + 'hotspots?radius=' + radius + '&offset=' + _offset + '&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&limit=' + perRequest + APItoken;

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      var responseObj = JSON.parse(this.responseText);

      // No WiFi in results - redo search bigger area
      if(responseObj.hotspots.length == 0) {
        radius += 500;
        offset = 0;
        return getHotspotsAtLocation(position, offset);
      }

      ga('send', 'event', 'WiFi', 'Got wifi', {
        nonInteraction: true
      });

      for (wifi of responseObj.hotspots) {
        if( blackList.indexOf(wifi.id) == -1 ) {
          blackList.push(wifi.id)
          if ( wifi.p_exists * wifi.p_internet > 0.75 && wifi.venue_name ) {
            wifi.directionsUrl = 'https://www.google.com/maps/dir/Current+location/'+wifi.lat+','+wifi.lon;
            wifi.staticMapSrc = 'https://maps.googleapis.com/maps/api/staticmap?center='+wifi.lat+','+wifi.lon+'&zoom=15&size=480x320&scale=2&markers=color:0xFF66A4|'+wifi.lat+','+wifi.lon+'&key=AIzaSyDSBTRvomePfdfDVb14j7S5etk7B4cI7RA'
            app.results.push(wifi);
            addedWiFi = true;
          }
        }
      }
      if(addedWiFi) {
        app.getNextWiFi();
      } else {
        offset += perRequest;
        getHotspotsAtLocation(position, offset);
      }

    } else if (this.readyState == 4 && this.status != 200) {
      app.message = "Something whent wrong - try again later :(";
    } else {
      app.message = "Finding a working WiFi...";
    }
  }

  xhttp.open("GET", url, true);
  xhttp.send();
}

function getWiFi(offset) {
  app.result = false;
  if (navigator.geolocation) {
    app.message = "Fetching your location..."
    navigator.geolocation.getCurrentPosition(function(position) {
      ga('send', 'event', 'Location', 'Got location', {
        nonInteraction: true
      });
      userPos = position;
      getHotspotsAtLocation(userPos, offset);
    });
  } else {
    app.message = "Geolocation is not supported by this browser.";
  }
}

getWiFi(offset);
document.getElementById('content').classList.remove('loading');
