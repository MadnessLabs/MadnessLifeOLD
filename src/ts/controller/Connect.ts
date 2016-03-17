/// <reference path="../../tsd/tsd.d.ts"/>
module MadnessLife {
    'use strict';

    class ConnectController {
		user: any;

        constructor(
            protected Rest,
            protected enjin,
            protected $firebaseObject,
            protected $state,
            protected Session
        ) {
            // ON LOAD 
			var ref = new Firebase(this.enjin.db.firebase.host + 'users/' + this.enjin.session.id);
            $firebaseObject(ref).$loaded(function(user) {
				this.user = user;
            }.bind(this));
        }

        getBridgeIP(callback) {
            this.Rest.get('https://www.meethue.com/api/nupnp').then(function(data) {
				callback(data[0].internalipaddress);
            }.bind(this));
        }

        pushedIt() {
			// Make User and Get Lights
			// http://192.168.0.1/api
			this.getBridgeIP(function(ip){
				this.user.hue = {};
				this.user.hue.ip = ip;
				var bridgeUrl = 'http://' + this.user.hue.ip + '/api';
				var bridgeParams = { 'devicetype': 'MadnessLife#' + this.enjin.session.id };
				this.Rest.post(bridgeUrl, bridgeParams).then(function(data) {
					if (data[0].error) {
						alert(data[0].error.description);
					} else {
						// Save User Token to Firebase User
						this.user.hue.username = data[0].success.username;
						this.user.$save();
						this.Session.set(this.user);
						this.$state.go('home');
					}
				}.bind(this)); 
			}.bind(this));
        }
    }

    angular.module('MadnessLife')
           .controller('MadnessLife.ConnectController', ConnectController);
}