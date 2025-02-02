angular
  .module('shm_spool', [
  ])
  .service('shm_spool', [ '$q', '$modal', 'shm_request', 'shm_console', function( $q, $modal, shm_request, shm_console ) {
    this.edit = function(row) {
        return $modal.open({
            templateUrl: 'views/spool_view.html',
            controller: function ($scope, $modalInstance, $modal) {
                $scope.title = 'Просмотр события';
                $scope.data = angular.copy(row);
                $scope.obj = {
                   options: { mode: 'code' },
                }

                $scope.show_user_service = 0;
                if ( $scope.data.settings ) $scope.show_user_service = $scope.data.settings.user_service_id;

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.close = function () {
                    $modalInstance.close( $scope.data );
                };

                $scope.retry = function () {
                    shm_request('POST_JSON', 'v1/admin/spool/retry', $scope.data ).then(function(response) {
                        angular.extend( $scope.data, response.data.data[0] );
                        $modalInstance.close( response.data.data[0] );
                    });
                };

                $scope.pause = function () {
                    shm_request('POST_JSON', 'v1/admin/spool/pause', $scope.data ).then(function(response) {
                        angular.extend( $scope.data, response.data.data[0] );
                        $modalInstance.close( response.data.data[0] );
                    });
                };

                $scope.force_success = function () {
                    shm_request('POST_JSON', 'v1/admin/spool/success', $scope.data ).then(function(response) {
                        angular.extend( $scope.data, response.data.data[0] );
                        $modalInstance.close( response.data.data[0] );
                    });
                };

                $scope.resume = function () {
                    shm_request('POST_JSON', 'v1/admin/spool/resume', $scope.data ).then(function(response) {
                        angular.extend( $scope.data, response.data.data[0] );
                        $modalInstance.close( response.data.data[0] );
                    });
                };

                $scope.save = function () {
                    shm_request('POST_JSON', 'v1/admin/spool', $scope.data ).then(function(response) {
                        angular.extend( $scope.data, response.data );
                        $modalInstance.close( response.data.data[0] );
                    });
                };

                $scope.console = function() {
                    var pipeline_id = $scope.data.response.pipeline_id;
                    shm_console.log( pipeline_id ).result.then(function(){
                    }, function(cancel) {
                    });
                }
            },
            size: 'lg',
        });
    };
  }])
  .controller('ShmSpoolController', ['$scope', '$modal', 'shm', 'shm_request', 'shm_spool', function($scope, $modal, shm, shm_request,shm_spool) {
    'use strict';

    $scope.url = 'v1/admin/spool';

    $scope.columnDefs = [
        {
            field: 'created',
            width: 150,
        },
        {
            field: 'user_id',
            width: 100,
            filter: { term: $scope.user.user_id }
        },
        {
            field: 'event.title',
            displayName: 'event',
            width: 200,
        },
        {
            field: 'status',
            width: 100,
        },
        {field: 'response'},
    ];

    $scope.row_dbl_click = function(row) {
        shm_spool.edit(row).result.then(function(data) {
            angular.extend( row, data );
        }, function(resp) {
        });
    }

  }]);
