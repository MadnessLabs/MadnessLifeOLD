/// <reference path="../../tsd/tsd.d.ts"/>

angular.module('MadnessLife').directive('photoUpload', function(
        $http, 
        FallBackground, 
        Rest, 
        enjin, 
        $cordovaCamera
    ) {
    return {
        restrict: 'EA',
        templateUrl: 'html/directive/photo-upload.html',
        scope: {
            image: '=',
            fallback: '=',
            hostUrl: '=',
            uploadUrl: '=',
            uploadData: '=',
            onComplete: '&'
        },
        link: function($scope:any, element, attrs) {
            $scope.backgroundImage = { 'background-image': 'url(' + $scope.fallback + ')' };
            $scope.$watch('image', function(image) {
                if (image) {
                    $scope.backgroundImage = FallBackground.get(
                        $scope.hostUrl + $scope.image, 
                        $scope.fallback,
                        function(backgroundImage){
                            $scope.backgroundImage = backgroundImage;
                        }
                    );
                }
            });

            $scope.dataURItoBlob = function(dataURI) {
                var binary = atob(dataURI.split(',')[1]);
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }

                return new Blob([new Uint8Array(array)], { type: mimeString });
            };

            $scope.takePhoto = function() {
                if (window.cordova) {
                    var options = {
                        quality: 100,
                        cameraDirection: 0,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: false,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 500,
                        targetHeight: 500,
                        saveToPhotoAlbum: false,
                        correctOrientation: true
                    };

                    $cordovaCamera.getPicture(options).then(function(imageData) {
                        $scope.addPhoto('data:image/jpeg;base64,' + imageData);
                    }, function(err) {
                        console.log('Failed to take picture with device camera!');
                    });
                } else {
                    document.getElementById('photo-input').click();
                }
            };

            $scope.addPhoto = function(photo) {
                $scope.uploadData.file = $scope.dataURItoBlob(photo);
                Rest.upload(
                    $scope.uploadUrl,
                    $scope.uploadData
                ).then(function(res) {
                    $scope.onComplete({res:res});
                });
            };

            $scope.selectFile = function(event) {
                if (event.target.files.length) {
                    var selectedFile = event.target.files[0];

                    if (selectedFile.type.match(/image.*/)) {
                        var reader = new FileReader();
                        reader.onload = function(ev: IReaderOnLoadEvent) {
                            $scope.addPhoto(ev.target.result);
                        };

                        reader.readAsDataURL(selectedFile);
                    } else {
                        alert('Image files only please!');
                    }
                }
            };
        }
    };
});