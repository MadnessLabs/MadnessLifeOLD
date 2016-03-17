
/// <reference path="../../tsd/tsd.d.ts"/>
declare var tinycolor;

module MadnessLife {
    'use strict';

    class HomeController {

        lights: any;
        lightsUrl: string;

        constructor(
            protected enjin,
            protected Rest
        ) {
            // On Load
            if (this.enjin.session.hue.username) {
                this.lightsUrl = 'http://' + this.enjin.session.hue.ip + '/api/' + this.enjin.session.hue.username + '/lights';
                this.Rest.get(this.lightsUrl).then(function(data){
                    this.lights = data;
                    console.log(this.lights);
                }.bind(this));
            }
        }

        toggleLight(light, key) {
            var lightUrl = this.lightsUrl + '/' + key + '/state';
            var lightBody = {'on': light.state.on};
            this.Rest.put(lightUrl, lightBody).then(function(data){
                console.log(data);
            });
        }

        changeColor(light, key) {
            console.log(tinycolor(light.color).toHsl());
        }

        renameLight(light, key) {
            console.log(light);
        }

        testMethod() {
            console.log(this.enjin.session);
        }
    }

    angular.module('MadnessLife').controller('MadnessLife.HomeController', HomeController);
}