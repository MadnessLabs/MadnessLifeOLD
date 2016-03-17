/// <reference path="../../tsd/tsd.d.ts"/>
module MadnessLife {
    'use strict';

    class LoginController {
		username: string;
        password: string;
        ref: any;
        users: any;
        userUrl: string;

        constructor(
            protected enjin,
            protected $firebaseObject,
            protected $firebaseArray,
            protected Session,
            protected $state
        ) {
            //On Load
            this.ref = new Firebase(this.enjin.db.firebase.host);
            this.userUrl = this.enjin.db.firebase.host + 'users/';       
        }

        loginFacebook() {
            this.ref.authWithOAuthPopup('facebook', function(error, authData) {
                if (error) {
                    console.log('Login Failed!', error);
                } else {
                    this.authenticate(authData);
                }
            }.bind(this));
        }

        loginGoogle() {
            this.ref.authWithOAuthPopup('google', function(error, authData) {
                if (error) {
                    console.log('Login Failed!', error);
                } else {
                    this.authenticate(authData);
                }
            }.bind(this));
        }

        authenticate(data) {
            // if user is already registered
            var userRef = new Firebase(this.userUrl + data.auth.uid);
            this.$firebaseObject(userRef).$loaded().then(function(player) {
                if (player.id) {
                    player.id = data.auth.uid;
                    this.Session.set(player);
                    this.$state.go('home');
                } else {
                    var playersRef = new Firebase(this.userUrl);
                    var players = this.$firebaseArray(playersRef);
                    var newPlayer = {
                        id: '',
                        name: '',
                        avatar: '',
                        profile: ''
                    };
                    switch (data.provider) {
                        case 'google':
                            newPlayer.id = data.auth.uid;
                            newPlayer.name = data.google.displayName;
                            newPlayer.avatar = data.google.profileImageURL;
                            newPlayer.profile = data.google.cachedUserProfile.link;
                            break;
                        case 'facebook':
                            newPlayer.id = data.auth.uid;
                            newPlayer.name = data.facebook.displayName;
                            newPlayer.avatar = data.facebook.profileImageURL;
                            newPlayer.profile = data.facebook.cachedUserProfile.link;
                            break;
                        default:
                            return false;
                    }

                    playersRef.child(data.auth.uid).set(newPlayer, function() {
                        this.Session.set(newPlayer);
                        this.$state.go('home');
                    }.bind(this));
                }
            }.bind(this))
            .catch(function(error) {
               console.log(error);
            });
        }
    }

    angular.module('MadnessLife').controller('MadnessLife.LoginController', LoginController);
}