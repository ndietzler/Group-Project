'use strict'
Parse.initialize("H07TyKtDvsyQ7Q34Q3UxKYyHBTJx7iztp3PKL7oZ", "JctEP7G2KbdabHhbMsx7NTou0qFNcNDkjML8lWsu");
var CountryGenreData = Parse.Object.extend("CountryGenreData");
var ECHO_NEST_BASE_URL = 'http://developer.echonest.com/api/v4/';
var API_KEY = 'SOHI1JMKEKOSMGRC5';
var fullName = "";
var showBio = false;

var myApp = angular.module('WorldApp', []).controller('WorldCtrl', ['$scope', '$http', '$compile', '$q', function($scope, $http, $compile, $q) {

    // Generates the data from a particular country after a user selects a country from the drop down or the map; adds the top 10 trending artists to the webpage or will display an error message if not top artists are found
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
   
   // Generates the information for a particular artist: their name, biography, news, and songs
    $scope.artistInfo = function() {
        var name = $(event.target).text();
        $scope.artistName = name;
        $scope.showBio = true;
        artistBio(name);
        artistNews(name);
        artistSongs(name);
    }

    // Connects a .json file to the drop down list of countries for mobile devices
    $http.get('data/countryNames.json').success(function(data) {
       $scope.countryData = data;
    });

    // Creates a pie chart representing genre percentages based on that particular countries artists
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
	
    // Adds the artist's biography to the artist information section. Only the first 1000 characters are displayed. A link to more information will be provided if no bios are displayed
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
                    angular.element($('#bio')).html('<h3>Biography</h3>');
                    angular.element($('#bio')).append('<p class="bioBody">' + response.data['response']['biographies'][i]['text'].slice(0, 1000) + "...</p>") 
                    angular.element($('#bio')).append('\n' + '<div class="bioBody">' + "Go to " + '<a href=' + response.data['response']['biographies'][0]['url'] + '>' + response.data['response']['biographies'][0]['url'] + '</a>' + " for more information." + '</div>');
                    count = 1;
                } 
                if (response.data['response']['biographies'][i]['text'].length < 1000 && count == 0) {
                    angular.element($('#bio')).html('<h3>Biography</h3>\n' + '<div class="bioBody">' + "Go to " + '<a href=' + response.data['response']['biographies'][0]['url'] + '>' + response.data['response']['biographies'][0]['url'] + '</a>' + " for more information." + '</div>');
                }
            }
        })
    }

    // Adds the latest news articles about a particular artist to the artist information section. An error message will be displayed if no news articles are available
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

    // Adds the top 10 songs from a particular artist to the artist information section. An error message will be displayed if the user does not have any trending songs at this time
    var artistSongs = function(name) {
        name = eliminateSpace(name.toLowerCase());
        var request = ECHO_NEST_BASE_URL + 'artist/songs?' + 'api_key=' + API_KEY + '&name=' + name + '&format=json' + '&results=10';
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

    // Grabs the Spotify ID from a particular song with a song title and artist's name and adds the Spotify player if the request is successful. If the request is unsuccessful, and error message is displayed
    $scope.playSong = function() {
        var title = $(event.target).attr('id');
        var name = $(event.target).attr('class');
        var request = ECHO_NEST_BASE_URL + 'song/search?' + 'api_key=' + API_KEY + '&format=json&results=1&title=' + title + '&artist=' + name + '&bucket=id:spotify&bucket=tracks&limit=true';
        console.log(request);
        $http.get(request)
        .then(function success(response) {
            var id = response.data['response']['songs'][0]['tracks'][0]['foreign_id'];
            var url = 'http://embed.spotify.com/?url=' + id;
            angular.element($('#play')).html('<iframe src=' + url + ' width="400" height="480" frameborder="0" allowtransparency="true"></iframe>');
        }).catch(function error(response) {
            angular.element($('#play')).text('We cannot play the requested song at this time. Please select another song.');
        })
    }

    // Eliminates any white space in the name passed in and strings different words together with a series of '+'; removes an & from the string if it exists
    var eliminateSpace = function(name) {
        var check = name.includes('&');
        if (check) {
            name = name.split(' & ');
            var newName = name[0];
            for (var i = 1; i < name.length; i++) {
                newName += '+' + name[i];
            }
            name = newName;
        } else {
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
        }
        return name;
    }

    // Takes in country the user clicks on the map or selects from the drop down on mobile devices; Hides data below the map or dropdown from another country if it is present; checks for cases of country names that differ in Echo Nest's documentation; calls a function to get the data of that particular country
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
	
    // Creates the map based on data/country.json; adds certain style elements to the map; directs the user to the country information once a country is clicked
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
                    text : 'Discover the Top 10 Trending Artists by clicking on their country of origin...'
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
                                    window.location.hash = 'map';
                                    $scope.countryURL(this);
                                    window.setTimeout('window.location.hash = "countryInfo"', 500);
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