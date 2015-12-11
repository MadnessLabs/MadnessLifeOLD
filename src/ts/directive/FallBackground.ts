/// <reference path="../../tsd/tsd.d.ts"/>

angular.module('MadnessLife').directive('setBackground', function(FallBackground) {
    return {
        restrict: 'EA',
        scope: {
            host: '=',
            image: '=',
            fallback: '='
        },
        link: function($scope:any, element, attrs) {
            element[0].style.backgroundImage = 'url(' + $scope.fallback + ')';
            var url = false;
            if ($scope.image && $scope.host) {
                url = $scope.host + $scope.image;
            }
            FallBackground.get(url, $scope.fallback, function(background){
                element[0].style.backgroundImage = background['background-image'];
            });
        }
    };
});