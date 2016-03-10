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
            Session, 
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

                if (!enjin.session && localStorage.getItem('enjin_session')) {
                    Session.get();
                }

                $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                    Session.check(event, toState, toParams, fromState, fromParams);
                }.bind(this));

                $rootScope.$on('loading:show', function() {
                    $ionicLoading.show({ template: '<ion-spinner icon="ripple" class="spinner-positive"></ion-spinner>' });
                });

                $rootScope.$on('loading:hide', function() {
                    $ionicLoading.hide();
                });

                $rootScope.logout = function() {
                    Session.destroy();
                    $state.go('login');
                };
            });
        }
    }
    angular.module('MadnessLife').run(AppRunner);
}