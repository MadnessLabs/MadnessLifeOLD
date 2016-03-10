/// <reference path="../../tsd/angularjs/angular.d.ts"/>

module MadnessLife {
    class SessionService {

        constructor(
            protected enjin,
            protected $rootScope,
            protected $state
        ) {
            // On Load
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

        set(player) {
            this.enjin.session = this.$rootScope.session = {
                id: player.id,
                name: player.name,
                avatar: player.avatar,
                profile: player.profile
            };
            localStorage.setItem('enjin_session', JSON.stringify(this.enjin.session));
            return this.enjin.session;
        }

        get() {
            var player = JSON.parse(localStorage.getItem('enjin_session'));
            return this.set(player);
        }

        destroy() {
            this.enjin.session = false;
            this.$rootScope.session = false;
            localStorage.clear();
        }

    }

    angular.module('MadnessLife').service('Session', SessionService);
}