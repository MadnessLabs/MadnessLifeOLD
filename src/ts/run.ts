/// <reference path="../tsd/tsd.d.ts"/>

declare var ionic;

module MadnessLife {
    'use strict';

    class AppRunner {
        constructor(
            $ionicPlatform, 
            $cordovaKeyboard, 
            $cordovaSplashscreen, 
            $rootScope, 
            enjin, 
            $state, 
            $ionicLoading, 
            Auth, 
            $ionicSideMenuDelegate,
            $http
        ) {
            $ionicPlatform.ready(function() {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }

                if (window.cordova) {
                    $cordovaSplashscreen.hide();

                    $rootScope.$watch(function() {
                        return $cordovaKeyboard.isVisible();
                    }, function(value) {
                        $rootScope.keyboardOpen = value;
                    });
                }

                $rootScope.mobiscrollOpts = {
                    theme: 'floodteam'
                };

                $rootScope.host = {
                    api: enjin.db.api.host.slice(0, -3),
                    apiFull: enjin.db.api.host,
                    url: enjin.url
                };

                $rootScope.logout = function() {
                    Auth.logout();
                };

                $rootScope.openMap = function(marker) {
                    var text = encodeURIComponent(marker);
                    if (window.cordova) {
                        if (ionic.Platform.isIOS()) {
                            console.log('Opeing in Google Maps on iOS');
                            window.location.href = 'maps://?q=' + text;
                        } else {
                            console.log('Opeing in Google Maps on a good OS');
                            window.open('geo:0,0?q=' + text, '_system', 'location=no');
                        }
                    } else {
                        window.open('https://maps.google.com?q=' + text, '_');
                    }
                };

                $rootScope.$on('loading:show', function() {
                    $ionicLoading.show({ template: '<ion-spinner icon="ripple" class="spinner-positive"></ion-spinner>' });
                });

                $rootScope.$on('loading:hide', function() {
                    $ionicLoading.hide();
                });
                
                setTimeout(function() {
                    angular.element(document.querySelectorAll('body')).css({ visibility: 'visible'});
                }, 500);
            });
        }
    }
    angular.module('MadnessLife').run(AppRunner);
}