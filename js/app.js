'use strict'
Parse.initialize("H07TyKtDvsyQ7Q34Q3UxKYyHBTJx7iztp3PKL7oZ", "JctEP7G2KbdabHhbMsx7NTou0qFNcNDkjML8lWsu");
var CountryGenreData = Parse.Object.extend("CountryGenreData");
var ECHO_NEST_BASE_URL = 'http://developer.echonest.com/api/v4/';
var API_KEY = 'SOHI1JMKEKOSMGRC5';
var fullName = "";
var showBio = false;

var myApp = angular.module('WorldApp', [])
	.controller('WorldCtrl', ['$scope', '$http', '$compile', '$q', function($scope, $http, $compile, $q) {
        $scope.getData = function(fullname, country) {
            makePieChart(country);
			var request = ECHO_NEST_BASE_URL + 'artist/search?' + 'api_key=' + API_KEY + '&results=99' + '&artist_location=country:' + fullname + "&sort=hotttnesss-desc" + "&bucket=hotttnesss" + '&format=json';
			$http.get(request)
			.then(function(response) {
                    var size = response.data['response']['artists'].length;
                    if (size > 10) {
                        size = 10;
                    }
                    if (size != 0) {
                        angular.element($('#countryInfo')).html("<h2 id=top10>Top 10 Artists from " + country + ":</h2>");
                        for (var i = 0; i < size; i++) {
                            var name = response.data["response"]["artists"][i]["name"];
                            var strElm = "<p>" + (i + 1) + ". " + "<a href='#bioTitle' ng-click=artistInfo()>" + name + "</a>" + "</p>";
                            var compiledHtml = $compile(strElm)($scope);
                            angular.element($('#countryInfo')).append(compiledHtml);
                        }
                    } else {
                        angular.element($('#countryInfo')).html("<p>No top artists found.</p>");
                    }
			})
		}
   
    $scope.artistInfo = function() {
        var name = $(event.target).text();
        $scope.artistName = name;
        $scope.showBio = true;
        artistBio(name);
        artistNews(name);
        artistSongs(name);
    }

    $http.get('data/countryNames.json').success(function(data) {
       $scope.countryData = data;
    });

    var makePieChart = function(country){
        var pieData = [{"name" : "Not Found", "y" : 100}];
        var query = new Parse.Query("CountryStats");
        query.equalTo("name", country);
        query.first({
            success : function(data){
                if(data !== undefined){
                    pieData = data.get("pieData");
                }else{
                    console.log("Error: no data available for" + country);
                }
            },
            error : function(error){
                console.log("Error: Parse request failed." + error)
            }
        }).then(function(){

        $('#pieChart').highcharts({
            chart: {
                backgroundColor: '#302f2f',
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Most Popular Genres in ' + country,
                style: {
                    color: 'white',
                    padding: 'none'
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: 'white',
                            textShadow: 'none'
                        }
                    }
                }
            },
            series: [{
                name: 'Genres',
                colorByPoint: true,
                data: pieData
            }]
        })
        })
    }
	
    var artistBio = function(name) {
        var artistName = eliminateSpace(name);
        var request = ECHO_NEST_BASE_URL + 'artist/biographies?' + 'api_key=' + API_KEY + '&name=' + artistName + '&format=json';
        $http.get(request)
        .then(function(response) {
            var count = 0;
            var size = response.data['response']['biographies'].length;
            angular.element($('#bioTitle')).html('<h2 id="personName">' + name + '<h2>');
            for (var i = 0; i < size; i++) {
                if (response.data['response']['biographies'][i]['text'].length >= 1000 && count == 0) {
                    angular.element($('#bio')).html('<h3>Biograghy</h3>');
                    angular.element($('#bio')).append('<p class="bioBody">' + response.data['response']['biographies'][i]['text'].slice(0, 1000) + "...</p>") 
                    angular.element($('#bio')).append('\n' + '<div class="bioBody">' + "Go to " + '<a href=' + response.data['response']['biographies'][0]['url'] + '>' + response.data['response']['biographies'][0]['url'] + '</a>' + " for more information." + '</div>');
                    count = 1;
                } 
                if (response.data['response']['biographies'][i]['text'].length < 1000 && count == 0) {
                    angular.element($('#bio')).html('<h3>Biograghy</h3>\n' + '<div class="bioBody">' + "Go to " + '<a href=' + response.data['response']['biographies'][0]['url'] + '>' + response.data['response']['biographies'][0]['url'] + '</a>' + " for more information." + '</div>');
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
                    angular.element($('#news')).append('<table><tr>' + '<a class="bioBody" href =' + link + '>' + link + '</a></tr></table>');
                }
            } 
            else {
                angular.element($('#news')).html('<h3>News Articles</h3>\n<p class="bioBody">No news articles are available at this time.</p>');
            }
        })
    }

    var artistSongs = function(name) {
        name = eliminateSpace(name.toLowerCase());
        var request = ECHO_NEST_BASE_URL + 'artist/songs?' + 'api_key=' + API_KEY + '&name=' + name + '&format=json' + '&results=15';
        console.log(request);
        $http.get(request)
        .then(function(response) {
            angular.element($('#play')).html('<p>Select a song, click play, and login with spotify to listen.</p>');
            var size = response.data['response']['songs'].length;
            if (size > 0) {
                angular.element($('#songs')).html('<h3>Trending Songs</h3>');
                for (var i = 0; i < size; i++) {
                    var title = response.data['response']['songs'][i]['title'];
                    var title2 = eliminateSpace(title.toLowerCase());
                    var strElm = '<p class="bioBody">' + (i + 1) + '. ' + '<a class=' + name + ' id=' + title2 +' ng-click=playSong()>' + title + '</a></p>';
                    var compiledHtml = $compile(strElm)($scope);
                    angular.element($('#songs')).append(compiledHtml);
                }
            } 
            else {
                angular.element($('#songs')).html('<h3>Trending Songs</h3>\n<p class="bioBody">No songs can be provided at this time.</p>');
            }
        })
    }

    $scope.playSong = function() {
        var title = $(event.target).attr('id');
        var name = $(event.target).attr('class');
        var request = ECHO_NEST_BASE_URL + 'song/search?' + 'api_key=' + API_KEY + '&format=json&results=1&title=' + title + '&artist=' + name + '&bucket=id:spotify&bucket=tracks&limit=true';
        console.log(request);
        $http.get(request)
        .then(function(response) {
            var id = response.data['response']['songs'][0]['tracks'][0]['foreign_id'];
            var url = 'http://embed.spotify.com/?url=' + id;
            angular.element($('#play')).html('<iframe src=' + url + ' width="400" height="480" frameborder="0" allowtransparency="true"></iframe>');
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
        $scope.showBio = false;
        var countryName = country.name;
        var fullName = countryName.toLowerCase();
        fullName = eliminateSpace(fullName);
        if (fullName == 'united+states+of+america') {
            fullName = 'united+states';
        } 
        else if (fullName == 'ivory+coast') {
            fullName = 'cote+d\"ivoire';
        }
        $scope.getData(fullName, countryName);
    }
	
    angular.element(document).ready(function(){
        $.getJSON('data/country.json', function(data) {
            $('#map').highcharts('Map', {
                title : {
                    style : {
                        color : "white",
                    },
                    text : ''
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