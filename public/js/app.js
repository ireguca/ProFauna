// views
var app = angular.module('animalApp', ['ngRoute']);
var markers = [];
var map;
var userSession;

app.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when ('/', {
			templateUrl: '/views/home.html',
			controller: 'HomeViewController'
		})
		.when ('/register',{
			templateUrl: '/views/register.html',
			controller: 'RegisterViewController'
		})
		.when ('/menuUser', {
			templateUrl: '/views/menuUser.html',
			controller: 'MenuUserViewController'
		})
		.when ('/form', {
			templateUrl: '/views/form.html',
			controller: 'FormViewController'
		})
		.when ('/map', {
			templateUrl: '/views/map.html',
			controller: 'MapViewController'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);

app.controller('HomeViewController', ['$scope', '$http', '$location', function($scope, $http, $location){

	$scope.checkUser=function(){

        var queryUser = $http.get('/users', {params:{"username":$scope.formData.userLog,"password":$scope.formData.passLog}})
            .success(function (data) {

            	var correct = false;

				if(data.length > 0) {

				//Obtiene el campo de texto que vamos a moniterear
				userSession = document.getElementById("userLog").value;

				sessionStorage.setItem("username", userSession);

					// Once complete, clear the form (except location)
					$scope.formData.userLog = "";
                	$scope.formData.passLog = "";
					console.log('User and password correct');
					// Now, go to the form view    	
					$location.path('/menuUser');

				} else {
					console.log('User or password incorrect');
					alert("¡Usuario o contraseña incorrectos!");
				}
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });

	}

	$scope.functionGoRegister = function() {
	    $location.path('/register');
	}
}])

app.controller('RegisterViewController', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.saveUser = function() {

        // Grabs all of the text box fields
        var userData = {
            username: $scope.formData.username,
            password: $scope.formData.password
        };

        // Saves the user data to the db
        $http.post('/users', userData)
            .success(function (data) {

                // Once complete, clear the form (except location)
                $scope.formData.username = "";
                $scope.formData.password = "";
                
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
        $location.path('/');
    };
}]);

app.controller('MenuUserViewController', ['$scope', '$location', function($scope, $location){
	$scope.functionGoForm = function() {
		$location.path('/form');
	}

	$scope.functionGoMap = function() {
		$location.path('/map');	
	}

}]);

app.controller('FormViewController', ['$scope','$http','$location', function($scope, $http, $location){	
	var stringPos = "";
	initMap();
	userForm();
		
	// Add your current position to the form.
	$scope.currentPos = function() {

		navigator.geolocation.getCurrentPosition(onLocation);
		function onLocation(position) {
	    	stringPos = position.coords.latitude + ', ' + position.coords.longitude;
	    	var s = document.getElementById('idCurrentPos');
	    	stringPos = stringPos.replace('(',"");
	    	stringPos = stringPos.replace(')',"");
            s.value = stringPos;
            deleteMarkers();
            addMarker(new google.maps.LatLng(position.coords.latitude, position.coords.longitude),map,"");
	    	markers[0].setMap(map);
		}
	}

	$scope.saveForm = function() {

        // Grabs all of the text box fields
        var userData = {
            username: sessionStorage.getItem("username"),
            date: $scope.formData.date.toString(),
            location: document.getElementById('idCurrentPos').value.toString()
        };

        // Saves the user data to the db
        $http.post('/forms', userData)
            .success(function (data) {

                // Once complete, clear the form (except location)
                $scope.formData.user = "";
                $scope.formData.date = "";
                $scope.formData.inputCurrentPos = "";
                
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
        alert("¡Entrada guardada correctamente!");
    };

    $scope.backMenuUser = function() {
    	$location.path('/menuUser');
    }
}]);

app.controller('MapViewController', ['$scope', '$http','$location', function($scope,$http, $location){
	initMap2();
	//Get all the markers stored in the BBDD
	deleteMarkers();
	var title = "";
	var date = "";
	var latlongArray;
	var user = "";

    var querForm = $http.get('/forms',{})
    .success(function (data) {
		data.forEach(function(currentObject) {
			latlongArray = currentObject.location.split(',');
			date = currentObject.date;
			user = currentObject.username;
			title = user + " añadió una incidencia en "+currentObject.location+ " en fecha de: "+date;
			addMarker(new google.maps.LatLng(latlongArray[0], latlongArray[1]),map,title);
		})
		showMarkers();
	})
	.error(function (data) {
		console.log('Error: ' + data);
	});
	console.log("Examinar variable de mapa");
}]);

function userForm () {
    document.getElementById('user').innerHTML = sessionStorage.getItem("username");
}

//map (form).
function initMap() {
	var centerSpain = {lat: 40.41678, lng: -3.70379};
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, {
        center: centerSpain,
        zoom: 6
    });
	// This event listener calls addMarker() when the map is clicked.
  	google.maps.event.addListener(map, 'click', function(event) {
  		deleteMarkers();
    	addMarker(event.latLng, map,"");
    	markers[0].setMap(map);
  	});
}

function initMap2() {
	var centerSpain = {lat: 40.41678, lng: -3.70379};
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, {
        center: centerSpain,
        zoom: 6
    });
}

// Adds a marker to the map.
function addMarker(location, map,ptitle) {
	var stringloc;
	var inputLoc = document.getElementById('idCurrentPos');
	if(ptitle === ""){
		stringloc = location.toString();
		stringloc = stringloc.replace('(',"");
	    stringloc = stringloc.replace(')',"");
	    if(inputLoc !== undefined){
	    	inputLoc.value = stringloc;
		}
	}else{
		stringloc = ptitle;
	}
  	// Add the marker at the clicked location
  	var marker = new google.maps.Marker({
    	position: location,
    	map: map,
    	title: stringloc
  	});
  	markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function clearMarkers() {
  setMapOnAll(null);
}
// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}