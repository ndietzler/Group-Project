'use strict'
Parse.initialize("H07TyKtDvsyQ7Q34Q3UxKYyHBTJx7iztp3PKL7oZ", "JctEP7G2KbdabHhbMsx7NTou0qFNcNDkjML8lWsu");
var CountryGenreData = Parse.Object.extend("CountryGenreData");
var ECHO_NEST_BASE_URL = 'http://developer.echonest.com/api/v4/';
var API_KEY = '59RZW7H5IFPYFDZWA';
var fullName = "";
var datum = [];
var startArrayFrom = 0;// out of 242 countries

var myApp = angular.module('WorldApp', [])
	.controller('WorldCtrl', ['$scope', '$http', function($scope, $http) {
        $http.get('data/countryNames.json').then(function(data){
            datum = data.data;
            anotherGoddamnHelper();
        })

        var anotherGoddamnHelper = function(){
            if(startArrayFrom < 243){//goes through all 242 countries or however many you want to specify.
                var countryGenreData = new CountryGenreData();
                var countrName = datum[startArrayFrom].name;
                console.log("NewCountry #" + startArrayFrom + "Started Here: "+ countrName);

                countryGenreData.set("countryName", countrName);
                countryGenreData.set("genres", []);

                var request = ECHO_NEST_BASE_URL + 'artist/search?' + 'api_key=' + API_KEY + '&results=99' + '&artist_location=country:' + countrName + "&sort=hotttnesss-desc" + "&bucket=hotttnesss" + '&format=json';
                var requests = Array();
                $http.get(request).then(function(response) {
                    var size = response.data['response']['artists'].length;
                    for (var i = 0; i < size; i ++) {
                        var name = response.data["response"]["artists"][i]["name"];
                        requests.push(ECHO_NEST_BASE_URL + "artist/terms?api_key="+ API_KEY + "&name=" + name + "&format=json");
                    }
                    var arrayIndex = 0;
                    var bigResponse = [];
  
                    var start = Date.now();      
                    bigRequest(arrayIndex, requests, bigResponse, countryGenreData, start);
                });
            }
        };

        var bigRequest = function(index, requests, responses, countryGenreData, start){
            console.log(requests.length);
            if (index < requests.length){
                console.log(index);
                $http.get(requests[index]).then(function(r){
                    var listTermsSize = r.data["response"]["terms"].length;          
                    for (var j = 0; j < listTermsSize; j++) {
                        var term = r.data["response"]["terms"][j].name;
                        var freq = r.data["response"]["terms"][j].frequency;
                        if (freq > 0.5){
                            var found = false;
                            for (var h = 0; h < responses.length; h++){
                                if (responses[h].name == term){
                                    responses[h].y += 1;
                                    found = true;
                                }
                            } 
                            if(!found) {
                                responses.push({"name": term, "y": 1});
                            }
                        }   
                    }
                });
                    index = index + 1;
                    setTimeout(function(){
                        return bigRequest(index, requests, responses, countryGenreData, start);
                    }, 800);//sends request for artist list term every x milliseconds
            }else{
                countryGenreData.set("genres", responses);
                countryGenreData.save();//saves parse object to cloud
                
                var end = Date.now();
                console.log(end - start);
                console.log(responses);

                startArrayFrom = startArrayFrom + 1;
                anotherGoddamnHelper()
            }
        }
}]);        
        
