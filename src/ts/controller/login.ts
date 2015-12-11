/// <reference path="../../tsd/tsd.d.ts"/>
module MadnessLife {
    'use strict';

    class LoginController {
		username: string;
        password: string;

        constructor(
            protected Auth,
            protected $filter, 
            protected $state, 
            protected enjin,
            protected $ionicSideMenuDelegate
        ) {
            //On Load
        }

        login(form) {
			if (form.$valid) {
                this.Auth.login(
                    this.enjin.db.api.host + 'login',
                    {
                        username: this.username,
                        password: this.password
                    },
                    function(res) {
                        this.$state.go('home');
                        this.$ionicSideMenuDelegate.canDragContent(true);
                    }.bind(this)
                );
			} else {
				alert('Please enter in a valid E-mail and password.');
			}
        }
    }

    angular.module('MadnessLife').controller('MadnessLife.LoginController', LoginController);
}