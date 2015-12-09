'use strict'

//var SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
var ECHO_NEST_BASE_URL = 'http://developer.echonest.com/api/v4/';
//var CLIENT_ID = 'bf01b3b802764ec488bfda1ee9b29cd3';
var API_KEY = 'SOHI1JMKEKOSMGRC5';
var fullName = "";
var show = false;

var myApp = angular.module('WorldApp', [])
	.controller('WorldCtrl', ['$scope', '$http', '$compile', '$q', function($scope, $http, $compile, $q) {
        $scope.getData = function(fullname, country) {
			var request = ECHO_NEST_BASE_URL + 'artist/search?' + 'api_key=' + API_KEY + '&results=99' + '&artist_location=country:' + fullname + "&sort=hotttnesss-desc" + "&bucket=hotttnesss" + '&format=json';
			$http.get(request)
			.then(function(response) {
                    var size = response.data['response']['artists'].length;
                    if (size > 10) {
                        size = 10;
                    }
                    if (size != 0) {
                        angular.element($('#countryInfo')).html("<h2>Top 10 Artists from " + country + ":</h2>");
                        for (var i = 0; i < size; i++) {
                            var name = response.data["response"]["artists"][i]["name"];
                            var strElm = "<p>" + (i + 1) + ". " + "<a ng-click=artistInfo()>" + name + "</a>" + "</p>";
                            var compiledHtml = $compile(strElm)($scope);
                            angular.element($('#countryInfo')).append(compiledHtml);
                        }
                    } else {
                        angular.element($('#countryInfo')).html("<p>No top artists found.</p>");
                    }
			})
		}
   
    $scope.artistInfo = function() {
        $scope.show = true;
        var name = $(event.target).text();
        $scope.artistName = name;
        artistBio(name);
        artistNews(name);
    }

    $http.get('data/countryNames.json').success(function(data) {
       $scope.countryData = data;
    });
	
    var artistBio = function(name) {
        var artistName = eliminateSpace(name);
        var request = ECHO_NEST_BASE_URL + 'artist/biographies?' + 'api_key=' + API_KEY + '&name=' + artistName + '&format=json';
        $http.get(request)
        .then(function(response) {
            var count = 0;
            var size = response.data['response']['biographies'].length
            for (var i = 0; i < size; i++) {
                if (response.data['response']['biographies'][i]['text'].length >= 1000 && count == 0) {
                    angular.element($('#bio')).html('<h1>' + name + '<h1>\n<h3>Biograghy</h3>') 
                    angular.element($('#bio')).append('<p>' + response.data['response']['biographies'][i]['text'].slice(0, 1000) + "...</p>") 
                    angular.element($('#bio')).append('\n' + "Go to " + '<a href=' + response.data['response']['biographies'][0]['url'] + '>' + response.data['response']['biographies'][0]['url'] + '</a>' + " for more information.")
                    count = 1;
                } 
                if (response.data['response']['biographies'][i]['text'].length < 1000 && count == 0) {
                    angular.element($('#bio')).html('<h1>Twyla<h1>\n<h3>Biograghy</h3>\n' + "Go to " + '<a href=' + response.data['response']['biographies'][0]['url'] + '>' + response.data['response']['biographies'][0]['url'] + '</a>' + " for more information.");
                }
            }
        })
    }

    var artistNews = function(name) {
        var artistName = eliminateSpace(name);
        var request = ECHO_NEST_BASE_URL + 'artist/news?' + 'api_key=' + API_KEY + '&name=' + artistName + '&format=json';
        $http.get(request)
        .then(function(response) {
            var size = response.data['response']['news'].length
            if (size > 0) {
                angular.element($('#news')).html('<h3>News Articles</h3>');
                for (var i = 0; i < size; i++) {
                    var link = response.data['response']['news'][i]['url'];
                    if (link.charAt(link.length - 1) == '/') {
                        link = link.substring(0, link.length - 1);
                    }
                    angular.element($('#news')).append('<table><tr>' + '<a href =' + link + '>' + link + '</a></tr></table>');
                }
            } 
            else {
                angular.element($('#news')).html('<h3>News Articles</h3>\n<p>No news articles are available at this time.</p>');
            }
        })
    }

    var eliminateSpace = function(name) {
        name = name.split(" ");
        if (name.length == 1) {
            name = name[0];
        } else {
            var newName = '';
            for (var i = 0; i < name.length; i++) {
                newName += name[i];
                if (name[i + 1] != null) {
                    newName += '+';
                }
            }
            name = newName;
        }
        return name;
    }

    $scope.countryURL = function(country) {
        var countryName = country.name;
        var fullName = countryName.toLowerCase();
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
        $scope.getData(fullName, countryName);
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
                                click: function () {
                                    $scope.countryURL(this);
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