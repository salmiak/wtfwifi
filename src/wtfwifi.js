var APIbase = 'https://api.instabridge.com/lite/';
var APItoken = '&token=0a00333dfb10f99badc647af68586a17c9dcf14242970d81bc96b1af5e6b23bf81aec823ad27f153';

var offset = 0;
var radius = 100;
var userPos = false;
var blackList = []

var app = new Vue({
  el: '#main',
  data: {
    state: 'loading',
    message: '',
    result: false
  },
  methods: {
    getNextWiFi: function () {
      ga('send', 'event', 'Button', 'Other WiFi');
      getHotspotsAtLocation(userPos, offset);
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

  // app.result = false;
  app.state = "getWiFi";
  // app.message = "Finding the best fucking WiFi...";

  var url = APIbase + 'hotspots?radius=' + radius + '&offset=' + _offset + '&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&limit=1' + APItoken;

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var responseObj = JSON.parse(this.responseText);
      if(responseObj.hotspots.length == 0) {

        radius += 100;
        offset = 0;
        getHotspotsAtLocation(position, offset)

      } else if (blackList.indexOf(responseObj.hotspots[0].id) != -1 ) {

        offset++;
        getHotspotsAtLocation(position, offset)

      } else {

        app.result = responseObj.hotspots[0];
        app.result.directionsUrl = 'https://www.google.com/maps/dir/Current+location/'+app.result.lat+','+app.result.lon;
        //app.message = false;
        app.state = "result";
        blackList.push(app.result.id);
        offset++;

        ga('send', 'event', 'WiFi', 'Got wifi', {
          nonInteraction: true
        });

      }
    } else if (this.readyState == 4 && this.status != 200) {
      app.message = "Something fucked up - try again later :(";
      app.state = "error"
    } else {
      app.state = "getWiFi"
      // app.message = "Finding the best fucking WiFi...";
    }
  }

  xhttp.open("GET", url, true);
  xhttp.send();
}

function getWiFi(offset) {
  // app.result = false;
  if (navigator.geolocation) {
    // app.message = "Fetching your fucking location..."
    app.state = "pos"
    navigator.geolocation.getCurrentPosition(function(position) {
      ga('send', 'event', 'Location', 'Got location', {
        nonInteraction: true
      });
      userPos = position;
      getHotspotsAtLocation(userPos, offset);
    });
  } else {
    app.state = "error";
    app.message = "Geolocation is not supported by this fucking browser.";
  }
}

getWiFi(offset);
