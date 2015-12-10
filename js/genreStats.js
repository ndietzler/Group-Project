'use strict'
Parse.initialize("H07TyKtDvsyQ7Q34Q3UxKYyHBTJx7iztp3PKL7oZ", "JctEP7G2KbdabHhbMsx7NTou0qFNcNDkjML8lWsu");
var CountryGenreData = Parse.Object.extend("CountryGenreData");
var CountryStats = Parse.Object.extend("CountryStats");
var SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
var ECHO_NEST_BASE_URL = 'http://developer.echonest.com/api/v4/';
var CLIENT_ID = 'bf01b3b802764ec488bfda1ee9b29cd3';
var API_KEY = 'SOHI1JMKEKOSMGRC5';
var fullName = "";
var datum = [];

var myApp = angular.module('WorldApp', [])
	.controller('WorldCtrl', ['$scope', '$http', '$compile', '$q', function($scope, $http, $compile, $q) {
        var index = 0;
        $http.get('data/countryNames.json').then(function(data){
            datum = data.data;
            countryQuery();
        })

    var countryQuery = function(){
        console.log("Searching For #" + index);
        if(index < 243){
            var countryStats = new CountryStats();
            var countryName = datum[index].name;
            countryStats.set("name", countryName);
            var query = new Parse.Query("CountryGenreData");
            query.equalTo("countryName", countryName);
            query.first({
                success : function(data){
                    console.log(data);
                    if(data !== undefined){
                        calcStats(countryStats, data);
                    }else{
                        console.log("Error:"+ countryName + "not found");
                        index++;
                        countryQuery();
                    }
                },
                error : function(){
                    console.log("Error: " + countryName + "not found");
                    index++;
                    countryQuery();
                }
            })
        }
    }

    var calcStats = function(newObject, parseObject){
        var sampleSize = 0;
        var percentOther = 100;
        var stats = [];
        var genres = parseObject.get("genres");
        for(var i = 0; i < genres.length; i++){
            sampleSize = sampleSize + genres[i].y; 
        }
        newObject.set("sampleSize" , sampleSize);
        for(var j = 0; j < genres.length; j++){
            var proportion = (genres[j].y / sampleSize) * 100;
            if (proportion > 5){
                percentOther = percentOther - proportion;
                stats.push({"name" : genres[j].name, "y" : proportion});
            }
        }
        stats.push({"name": "Other", "y" : percentOther});
        newObject.set("pieData", stats);
        console.log(stats);
        newObject.save(null, {
            success : function(){
                console.log("Statistics Saved Successfully");
            },
            error : function(){
                console.log("Error: Could Not Be saved");
            }
        })
        index++;
        countryQuery();
    }

    $http.get('data/countryNames.json').success(function(data) {
       $scope.countryData = data;
    });
}]);