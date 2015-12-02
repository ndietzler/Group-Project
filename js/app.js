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

    $(function(){
        $.getJSON('data/country.json', function(data) {
            $('#map').highcharts('Map', {
                title : {
                    text : 'World Music'
                },

                subtitle : {
                    text : 'Discover music of the world by clicking on a country...'
                },

                mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        verticalAlign: 'bottom'
                    }
                },
                // colorAxis: {
                //     min: 0
                // },
                colors: ['#000000'],

                series : [{
                    data : data,
                    mapData: Highcharts.maps['custom/world-highres'],
                    joinBy: 'hc-key',
                    name: 'Random data',
                    states: {
                        hover: {
                            color: '#BADA55'
                        }
                    },
                    dataLabels: {
                        enabled: false,
                        //format: '{point.name}'
                    }
                }]
            })
        })
    });


