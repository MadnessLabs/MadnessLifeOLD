/// <reference path="../../tsd/tsd.d.ts"/>
module MadnessLife {
    'use strict';

    class HomeController {

        constructor(
            protected enjin,
            protected Rest
        ) {
            // On Load
        }

        testMethod() {
            alert('I Ran!');
        }
    }

    angular.module('MadnessLife').controller('MadnessLife.HomeController', HomeController);
}