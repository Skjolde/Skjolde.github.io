//Create savedata
var saveData = JSON.parse(localStorage.saveData || null) || {data : []};

//make a new map
var map = new L.map('map').fitWorld();
var viewMarkers = new L.FeatureGroup();
var position = {};
var markers = [];
var closestMark = {};
var markerActive = {};

// create a map tile layer and add it to the map
// there are lots of different map options at maps.stamen.com
// cam change "toner" to another map type if you'd like to, for example
L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 20
}).addTo(map);

// finds current location of the device
// NOTE: this updates continuously using watch: true
map.locate({setView: true, watch: true});

//when the location is found, run the function "onLocationFound"
map.on('locationfound', onLocationFound);

//if there is a location error, run "onLocationError"
map.on('locationerror', onLocationError);

//click on the map to add a marker
map.on('click', addMarker);

function onLocationFound(e) {
    // remove any previous markers
    if (position != undefined) {
        map.removeLayer(position);
    }

    // place a marker on the map at geolocated point:
    position = L.circleMarker(e.latlng).addTo(map);
    console.log(position);
}

function onLocationError(e) {
    alert(e.message);
}

function addMarker(e){
    //marker = L.marker(e.latlng).addTo(map).on('click', handleMarkerClick);
    //markers.push(e.latlng)
    var id = markers.length + 1;
    markers.push(new Moment(e.latlng.lat, e.latlng.lng, '/moments/moment-test.mp4', id))
    console.log(markers);
    saveTheData();
}

// Handle click on markers
function handleMarkerClick (e) {
    var temp
    for(var i = 0; i < markers.length; i++) {
        if (markers[i].latlng == e.latlng) {
            temp = markers[i];
        }
    }
}

/**
 * Moment object function
 * @param {*} lat
 * @param {*} lng 
 * @param {*} video 
 * @param {*} id 
 */
function Moment(lat, lng, video, id) {
    this.lat = lat;
    this.lng = lng;
    this.video = video;
    this.distance = -1;
    this.id = id;
    this.timeLeft = 60; // base time left in seconds 
}


// Load markers
window.addEventListener('load', loadData)

function loadData() {
    var count = saveData.data.length;
    console.log(count);
    for (var i = 0; i < count; i++){
        innercount = saveData.data[i].markers.length;
        console.log(innercount);
        for (var j = 0; j < innercount; j++){
            L.marker(saveData.data[i].markers[j]).addTo(map);
        }
        markers = saveData.data[i].markers;
    }
}

// Create cookie & save data
function saveTheData() {
    // Create a temporary object
    var tempObject = {};
    // Add our marker values to the object
    tempObject.markers = markers;
    // Add the time to our object in a readable format
    var date = new Date();
    tempObject.time = date.toDateString() + " · " + date.toTimeString();
    // Add the object to our data array
    saveData.data.push(tempObject);
    //console.log(saveData);
    
    // Save it to the localStorage
    localStorage.saveData = JSON.stringify(saveData);
    //console.log("Data from "+tempObject.time+" saved!");
}

// Clear the saved data (console only)
function clearData() {
    saveData.data = [];
    localStorage.saveData = JSON.stringify(saveData);
    //reload page... delete if you don't want to refresh
    location.reload();
}

// Modify geiker audio speed
function modSpeed(distance) {
    if (!markerActive) {
        var newSpeed = ((distance * 5) / 100);
        console.log(Math.round((newSpeed * 10) / 10));
        $('#geiger').attr("playbackRate", Math.round(newSpeed * 10) / 10);
    }
    if (markerActive) {
        document.querySelector('audio').playbackRate = 0;
    }
}

// Run the CheckInfo function every 5 seconds
setInterval(checkInfo, 5000);

// THIS IS THE MAIN FUNCTION THAT RUNS CONTINOUSLY
function checkInfo() {

    // Determine the closest marker
    console.log("length: "+ markers.length);
    var shortest = -1;
    var posLatlng = position.getLatLng();
    for (var i = 0; i < markers.length; i++) {
        var curMark = markers[i];
        var distance = posLatlng.distanceTo([curMark.lat, curMark.lng]);
        console.log("dist: " + distance);
        curMark.distance = distance;
        if (shortest == -1) {
            shortest = distance;
            closestMark = curMark;           
        }
        if (distance < shortest) {
            shortest = distance;
            closestMark = curMark;
        }
    }
    console.log("doing stuff");
    // Show or hide the mark depending on whether the person is close enough
    if (closestMark.distance < 30) {
        isClose(true, shortest);
        console.log("close enough");
    }
    if (closestMark.distance > 30) {
        isClose(false, shortest);
        console.log("move closer");
    }

    // Update the geiger speed
    modSpeed(closestMark.distance);
}

// Function to be called when the distance is short enough
function isClose(visible, shortest) {
    console.log("1");
    var shown = L.marker(shortest.lat, shortest.lng).on('click', handleMarkerClick);

    //marker = L.marker(e.latlng).addTo(map).on('click', handleMarkerClick);
    console.log("2");
    viewMarkers.addLayer(shown);
    console.log(viewMarkers);
    if (visible) {
        markerActive = true;
        console.log("making visible");


        map.addLayer(shown);
        
        
        console.log("making visible");
        document.getElementById("infovid").attribute("src", shortest.video);
        $("#info-disabled").attr("id", "info");
        console.log("made visible");
    }
    else {
        if (markerActive) {
            map.removeLayer(viewMarkers);
            markerActive = false;
        }
        console.log("making hidden");
        $("#info").attr("id","info-disabled");
        console.log("hidden");
    }
    
}