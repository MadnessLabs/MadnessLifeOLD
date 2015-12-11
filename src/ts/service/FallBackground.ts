/// <reference path="../../tsd/tsd.d.ts"/>
module MadnessLife {
    class FallBackground {
        constructor(protected $http) {
            //On Load  
        }

        get(url, fallback, callback) {
            var backgroundImage = { 'background-image': 'url(' + fallback + ')' };
            if (url) {
                this.$http.get(url).then(function(res) {
                    backgroundImage = { 'background-image': 'url(' + url + ')' };
                    if (typeof callback === 'function') {
                        callback(backgroundImage);
                    } else {
                        console.log('Third parameter must be a callback function!');
                    }
                }, function() {
                    if (typeof callback === 'function') {
                        callback(backgroundImage);
                    } else {
                        console.log('Third parameter must be a callback function!');
                    }
                });
            } else {
                callback(backgroundImage);
            }
        }
    }

	angular.module('MadnessLife').service('FallBackground', FallBackground);
}