'use strict'

var BASE_URL = 'http://developer.echonest.com/api/v4/';
var CLIENT_ID = 'bf01b3b802764ec488bfda1ee9b29cd3';
var API_KEY = 'SOHI1JMKEKOSMGRC5';

var myApp = angular.module('WorldApp', [])
	.controller('WorldCtrl', ['$scope', '$http', function($scope, $http) {
		//$scope.getBios = function() {
			var request = BASE_URL + 'artist/biographies?' + 'api_key=' + API_KEY + '&name=Adele' + '&format=json';
			console.log(request)
			$http.get(request)
			.then(function(response) {
					console.log("...");
					$scope.bio = response.data["response"]["status"]["version"];
			}) 
		//}


	}]);



//http://developer.echonest.com/api/v4/artist/biographies?api_key=SOHI1JMKEKOSMGRC5&id=ARH6W4X1187B99274F&format=json

//http://developer.echonest.com/api/v4/artist/biographies?api_key=SOHI1JMKEKOSMGRC5&id=ARH6W4X1187B99274F&format=json&results=1&start=0&license=cc-by-sa


















