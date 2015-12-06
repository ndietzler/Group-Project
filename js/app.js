'use strict'

//var SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
var ECHO_NEST_BASE_URL = 'http://developer.echonest.com/api/v4/';
//var CLIENT_ID = 'bf01b3b802764ec488bfda1ee9b29cd3';
var API_KEY = 'SOHI1JMKEKOSMGRC5';
var fullName = "";

var myApp = angular.module('WorldApp', [])
	.controller('WorldCtrl', ['$scope', '$http', function($scope, $http) {	
        $scope.getData = function(fullname) {
			var request = ECHO_NEST_BASE_URL + 'artist/search?' + 'api_key=' + API_KEY + '&results=99' + '&artist_location=country:' + fullname + "&sort=hotttnesss-desc" + "&bucket=hotttnesss" + '&format=json';
			console.log(request)
			$http.get(request)
			.then(function(response) {
                    var size = response.data['response']['artists'].length;
                    calcGenreStats(response.data);
                    if (size > 10) {
                        size = 10;
                    }
                    if (size != 0) {
                        $('#countryInfo').html("<h2>Top 10 Artists:</h2>");
                        for (var i = 0; i < size; i++) {
                            var name = response.data["response"]["artists"][i]["name"];
                            $('#countryInfo').append("<p>" + (i + 1) + ". " + name + "</p>");
                        }
                    } else {
                        $('#countryInfo').append("<>");
                        console.log("No top artists found.")
                    }
			}) 
		}

	var getCountryName = function(data) {
		console.log(data);
		$scope.countryData = data;
	}




    $.getJSON('data/countryNames.json').then(getCountryName);
	

            var calcGenreStats = function(response){
                var chartStats = [];
                var requests = Array();
                var size = response["response"]["artists"].length;
                for (var i = 0; i < size; i ++) {
                    var name = response["response"]["artists"][i]["name"];
                    requests.push(ECHO_NEST_BASE_URL + "artist/terms?api_key="+ API_KEY + "&name=" + name + "&format=json");
                }
                var defer = $http.apply(requests);
                defer.done(function(){
                    $.each(function(index,response){
                        console.log("hey");
                    //     var listTermsSize = response.data["response"]["terms"].length;
                    //     for (var j = 0; j < listTermsSize; j++) {
                    //         var term = response.data["response"]["terms"][j].name;
                    //         var freq = response.data["response"]["terms"][j].frequency;
                    //         if (freq > 0.5){
                    //             var found = false;
                    //             for(var k = 0; k < chartStats.length; k++){
                    //                 if(chartStats[k].name == term){
                    //                     var newStat = chartStats[k].y + 1;
                    //                     chartStats[k].y = newStat;   
                    //                     found = true; 
                    //                 }
                    //             }
                    //             if(!found) {
                    //                 var data = {"name" : term, "y" : 1};
                    //                 chartStats.push(data);
                    //             }
                    //             //console.log(chartStats);
                    //         }                         
                    });
                });
            }  

        //$scope.artistBio = function(name) {
            var request = ECHO_NEST_BASE_URL + 'artist/biographies?' + 'api_key=' + API_KEY + '&name=Adele' /*+ name*/ + '&format=json';
            console.log(request);
            $http.get(request)
            .then(function(response) {
                var count = 0;
                var size = response.data['response']['biographies'].length
                for (var i = 0; i < size; i++) {
                    if (response.data['response']['biographies'][i]['text'].length >= 1000 && count == 0) {
                        $('#bio').html('<h1>Adele<h1>\n<h3>Biograghy</h3>') 
                        $('#bio').append('<p>' + response.data['response']['biographies'][i]['text'].slice(0, 1000) + "...</p>") 
                        $('#bio').append('\n' + "Go to " + '<a href=' + response.data['response']['biographies'][0]['url'] + '>' + response.data['response']['biographies'][0]['url'] + '</a>' + " for more information.")
                        count = 1;
                    } 
                    if (response.data['response']['biographies'][i]['text'].length < 1000 && count == 0) {
                        $('#bio').html('<h1>Twyla<h1>\n<h3>Biograghy</h3>\n' + "Go to " + '<a href=' + response.data['response']['biographies'][0]['url'] + '>' + response.data['response']['biographies'][0]['url'] + '</a>' + " for more information.");
                    }
                }
            })
        //}
	
    $(document).ready(function(){
        $.getJSON('data/country.json', function(data) {
            $('#map').highcharts('Map', {
                title : {
                    style : {
                        color : "white",
                    },
                    text : 'World Music'
                },

                subtitle : {
                    style : {
                        color : "white",
                    },
                    text : 'Discover music of the world by clicking on a country...'
                },

                mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        verticalAlign: 'bottom'
                    }
                },

                colors: ['#23CF5F '],

                chart: {
                    backgroundColor: "#000000"
                },
                plotOptions:{
                    series:{
                        point:{
                            events:{
                                click: function(){
                                    fullName = this.name.toLowerCase();
                                    fullName = fullName.split(" ");
                                    if (fullName.length == 1) {
                                        fullName = fullName[0];
                                    } else {
                                        var urlName = '';
                                        for (var i = 0; i < fullName.length; i++) {
                                            urlName += fullName[i];
                                            if (fullName[i + 1] != null) {
                                                urlName += '+';
                                            }
                                        }
                                        fullName = urlName;
                                        if (fullName == 'united+states+of+america') {
                                            fullName = 'united+states';
                                        }
                                    }
                                    console.log(fullName);
                                    $scope.getData(fullName);
                                }
                            }
                        }
                    }
                },

                series : [{
                    data : data,
                    mapData: Highcharts.maps['custom/world-highres'],
                    joinBy: 'hc-key',

                    name: 'country',
                    borderColor: "#000000",

                    states: {
                        hover: {
                            color: '#F0FFFF'
                        }
                    },

                    backgroundColor: 'white',

                    dataLabels: {
                        enabled: false,
                    }
                }]
            })
        }) 
    });
}]);

