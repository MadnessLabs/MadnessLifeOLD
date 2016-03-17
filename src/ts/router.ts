/// <reference path="../tsd/tsd.d.ts"/>
module MadnessLife {
    'use strict';

    class MadnessLifeRouter {
        constructor($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('login', {'url':'/login', 
'templateUrl':'html/page/login.html', 
'controller':'MadnessLife.LoginController as ctrl'})
				.state('home', {'url':'/home', 
'templateUrl':'html/page/home.html', 
'controller':'MadnessLife.HomeController as ctrl'})
				.state('Connect', {'url':'/Connect', 
'templateUrl':'html/page/Connect.html', 
'controller':'MadnessLife.ConnectController as ctrl'});

            $urlRouterProvider.otherwise(function($injector, $location) {
                var $state = $injector.get('$state');
                $state.go('login');
            });
        }
    }

    angular.module('MadnessLife')
           .config(MadnessLifeRouter);
}