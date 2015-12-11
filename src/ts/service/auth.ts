/// <reference path="../../tsd/tsd.d.ts"/>
module MadnessLife {
    class AuthService {

        pause: boolean;

        constructor(
            protected enjin, 
            protected $state, 
            protected $rootScope,
            protected Rest
        ) {
            this.setSession();
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                this.check(event, toState, toParams, fromState, fromParams);
            }.bind(this));
        }

        setSession() {
            if (!this.enjin.session && localStorage.getItem('enjin_session')) {
                this.enjin.session = this.$rootScope.session = JSON.parse(localStorage.getItem('enjin_session'));
            }
        }

        check(event, toState, toParams, fromState, fromParams) {
            if (toState && toState.name !== fromState.name) {
                if (toState.name === 'login') {
                    if (this.enjin.session) {
                        event.preventDefault();
                        this.$state.go('home');
                    }
                } else {
                    if (!this.enjin.session) {
                        event.preventDefault();    
                        this.$state.go('login');
                    }
                }
            }
        }

        login(url, params, callback) {
            this.Rest.post(url, params).then(function(res) {
                if (res.success === true) {
                    this.enjin.session = this.$rootScope.session = res.data;
                    localStorage.setItem('enjin_session', JSON.stringify(this.enjin.session));
                    if (typeof callback === 'function') {
                        callback(res);
                    } else {
                        console.log('Third parameter must be a callback function!');
                    }
                } else {
                    console.log(res.data);
                }
            }.bind(this));
        }

        logout() {
            if (confirm('Are you sure you wish to log out?')) {
                delete this.enjin.session;
                delete this.$rootScope.session;
                localStorage.clear();
                this.$state.go('login');
            }
        }
    }

	angular.module('MadnessLife').service('Auth', AuthService);
}