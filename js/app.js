'use strict'

var SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
var ECHO_NEST_BASE_URL = 'http://developer.echonest.com/api/v4/';
var CLIENT_ID = 'bf01b3b802764ec488bfda1ee9b29cd3';
var API_KEY = 'SOHI1JMKEKOSMGRC5';
var fullName = "";

var myApp = angular.module('WorldApp', [])
	.controller('WorldCtrl', ['$scope', '$http', function($scope, $http) {
		$scope.getData = function(fullname) {
			var request = ECHO_NEST_BASE_URL + 'artist/search?' + 'api_key=' + API_KEY + '&results=99' + '&artist_location=country:' + fullname + "&sort=hotttnesss-desc" + "&bucket=hotttnesss&bucket=genre" + '&format=json';
			console.log(request)
			$http.get(request)
			.then(function(response) {
                    var names = [];//
                    $('#countryInfo table').html('<tr><th>Top 10 Artists</th></tr>');
                    var size = response.data['response']['artists'].length;
                    if (size > 10) {
                        size = 10;
                    }
                    if (response.data['response']['artists'] != []) {
                        for (var i = 0; i < size; i++) {
                            var name = response.data["response"]["artists"][i]["name"];
                            $('#countryInfo table').append("<tr><td>" + name + "</td></tr>");
                        }
                    }
			}) 
		}
	

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

                    name: 'Random data',
                    borderColor: "#000000",

                    states: {
                        hover: {
                            color: '#F0FFFF'
                        }
                    },
                    dataLabels: {
                        enabled: false,
                    }
                }]
            })
        })
    });
}]);

