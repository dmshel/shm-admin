angular
  .module('shm_servers', [
    'shm_transports_list',
    'shm_servers_groups_list',
    'shm_identities_list',
  ])
  .service('shm_servers', [ '$q', '$modal', 'shm_request', 'shm_console', function( $q, $modal, shm_request, shm_console ) {
    this.add = function(data) {
        data = {
            mode: 'template',
        };
        var deferred = $q.defer();

        this.editor('Создание сервера', data, 'lg').result.then(function(new_data){
            shm_request('PUT_JSON', 'v1/admin/server', new_data ).then(function(response) {
                deferred.resolve(response.data.data[0]);
            });
        }, function(cancel) {
            deferred.reject();
        });
        return deferred.promise;
    };

    this.editor = function (title, row, size) {
        return $modal.open({
            templateUrl: 'views/servers_edit.html',
            controller: function ($scope, $modalInstance, $modal) {
                $scope.title = title;
                $scope.data = angular.copy(row);

                if ( $scope.data.settings && $scope.data.settings.template_id ) {
                    $scope.data.mode = "template";
                } else if ( $scope.data.settings && $scope.data.settings.cmd ) {
                    $scope.data.mode = "cmd";
                }

                $scope.servers_list = [];

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.save = function () {
                    $modalInstance.close( $scope.data );
                };

                $scope.test_ssh = function() {
                    var args = {
                        host: $scope.data.host,
                        key_id: $scope.data.settings.key_id,
                        cmd: "uname -a; echo; w",
                    };

                    shm_request('PUT_JSON', 'v1/admin/transport/ssh/test', args ).then(function(response) {
                        var pipeline_id = response.data.data[0].pipeline_id;

                        shm_console.log( pipeline_id ).result.then(function(){
                        }, function(cancel) {
                        });
                    });
                }

                $scope.template_init = function() {
                    if (confirm("Выполнить шаблон на сервере?")) {
                        var args = {
                            host: $scope.data.host,
                            server_id: $scope.data.server_id,
                            key_id: $scope.data.settings.key_id,
                            template_id: $scope.data.settings.template_id,
                        };

                        shm_request('PUT_JSON', 'v1/admin/transport/ssh/init', args ).then(function(response) {
                            var pipeline_id = response.data.data[0].pipeline_id;

                            shm_console.log( pipeline_id ).result.then(function(){
                            }, function(cancel) {
                            });
                        });
                    }
                }

                $scope.test_mail = function() {
                    shm_request('POST_JSON', '/admin/mail_test.cgi', $scope.data ).then(function(response) {
                        alert("OK");
                    })
                };

                $scope.delete = function () {
                    $modalInstance.dismiss('delete');
                };
            },
            size: size,
        });
    }
  }])
  .controller('ShmServersController', ['$scope', '$modal', 'shm', 'shm_request', 'shm_servers', function($scope, $modal, shm, shm_request, shm_servers ) {
    'use strict';

    var url = 'v1/admin/server';
    $scope.url = url;

    $scope.columnDefs = [
        {field: 'server_id'},
        {field: 'name', displayName: 'Имя' },
        {field: 'host'},
        {field: 'ip'},
        {field: 'transport'},
    ];

    var save_service = function( row, save_data ) {
        delete save_data.$$treeLevel;

        if (save_data.mode!='cmd') delete save_data.settings.cmd;
        if (save_data.mode!='template') delete save_data.settings.template_id;

        shm_request('POST_JSON', url, save_data ).then(function(response) {
            angular.extend( row, response.data.data[0] );
        });
    };

    $scope.add = function() {
        shm_servers.add().then(function(row) {
            row.$$treeLevel = 0;
            $scope.gridOptions.data.push( row );
        }, function(cancel) {
        });
    }

    $scope.row_dbl_click = function(row) {
        shm_servers.editor('Редактирование сервера', row, 'lg').result.then(function(data){
            save_service( row, data );
        }, function(resp) {
            if ( resp === 'delete' ) {
                shm_request('DELETE', url, { server_id: row.server_id } ).then(function() {
                    $scope.gridOptions.data.splice(
                        $scope.gridOptions.data.indexOf( row ),
                        1
                    );
                })
            }
        });
    }

  }]);
