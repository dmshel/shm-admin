angular.module('theme.core.main_controller', ['theme.core.services','ngCookies'])
  .controller('MainController', [
    '$scope',
    '$theme',
    '$timeout',
    'progressLoader',
    'wijetsService',
    '$location',
    '$route',
    '$http',
    '$cookieStore',
    '$q',
    function($scope, $theme, $timeout, progressLoader, wijetsService, $location, $route, $http, $cookieStore, $q ) {
    'use strict';
    $scope.layoutFixedHeader = $theme.get('fixedHeader');
    $scope.layoutPageTransitionStyle = $theme.get('pageTransitionStyle');
    $scope.layoutDropdownTransitionStyle = $theme.get('dropdownTransitionStyle');
    $scope.layoutPageTransitionStyleList = ['bounce',
      'flash',
      'pulse',
      'bounceIn',
      'bounceInDown',
      'bounceInLeft',
      'bounceInRight',
      'bounceInUp',
      'fadeIn',
      'fadeInDown',
      'fadeInDownBig',
      'fadeInLeft',
      'fadeInLeftBig',
      'fadeInRight',
      'fadeInRightBig',
      'fadeInUp',
      'fadeInUpBig',
      'flipInX',
      'flipInY',
      'lightSpeedIn',
      'rotateIn',
      'rotateInDownLeft',
      'rotateInDownRight',
      'rotateInUpLeft',
      'rotateInUpRight',
      'rollIn',
      'zoomIn',
      'zoomInDown',
      'zoomInLeft',
      'zoomInRight',
      'zoomInUp'
    ];

    $scope.layoutLoading = true;

    $scope.getLayoutOption = function(key) {
      return $theme.get(key);
    };

    $scope.setNavbarClass = function(classname, $event) {
      $event.preventDefault();
      $event.stopPropagation();
      $theme.set('topNavThemeClass', classname);
    };

    $scope.setSidebarClass = function(classname, $event) {
      $event.preventDefault();
      $event.stopPropagation();
      $theme.set('sidebarThemeClass', classname);
    };

    $scope.layoutFixedHeader = $theme.get('fixedHeader');
    $scope.layoutLayoutBoxed = $theme.get('layoutBoxed');
    $scope.layoutLayoutHorizontal = $theme.get('layoutHorizontal');
    $scope.layoutLeftbarCollapsed = $theme.get('leftbarCollapsed');
    $scope.layoutAlternateStyle = $theme.get('alternateStyle');

    $scope.$watch('layoutFixedHeader', function(newVal, oldval) {
      if (newVal === undefined || newVal === oldval) {
        return;
      }
      $theme.set('fixedHeader', newVal);
    });
    $scope.$watch('layoutLayoutBoxed', function(newVal, oldval) {
      if (newVal === undefined || newVal === oldval) {
        return;
      }
      $theme.set('layoutBoxed', newVal);
    });
    $scope.$watch('layoutLayoutHorizontal', function(newVal, oldval) {
      if (newVal === undefined || newVal === oldval) {
        return;
      }
      $theme.set('layoutHorizontal', newVal);
    });
    $scope.$watch('layoutAlternateStyle', function(newVal, oldval) {
      if (newVal === undefined || newVal === oldval) {
        return;
      }
      $theme.set('alternateStyle', newVal);
    });
    $scope.$watch('layoutPageTransitionStyle', function(newVal) {
      $theme.set('pageTransitionStyle', newVal);
    });
    $scope.$watch('layoutDropdownTransitionStyle', function(newVal) {
      $theme.set('dropdownTransitionStyle', newVal);
    });
    $scope.$watch('layoutLeftbarCollapsed', function(newVal, oldVal) {
      if (newVal === undefined || newVal === oldVal) {
        return;
      }
      $theme.set('leftbarCollapsed', newVal);
    });

    $scope.toggleLeftBar = function() {
      $theme.set('leftbarCollapsed', !$theme.get('leftbarCollapsed'));
    };

    $scope.$on('themeEvent:maxWidth767', function(event, newVal) {
      $timeout(function() {
          $theme.set('leftbarCollapsed', newVal);
      });
    });
    $scope.$on('themeEvent:changed:fixedHeader', function(event, newVal) {
      $scope.layoutFixedHeader = newVal;
    });
    $scope.$on('themeEvent:changed:layoutHorizontal', function(event, newVal) {
      $scope.layoutLayoutHorizontal = newVal;
    });
    $scope.$on('themeEvent:changed:layoutBoxed', function(event, newVal) {
      $scope.layoutLayoutBoxed = newVal;
    });
    $scope.$on('themeEvent:changed:leftbarCollapsed', function(event, newVal) {
      $scope.layoutLeftbarCollapsed = newVal;
    });
    $scope.$on('themeEvent:changed:alternateStyle', function(event, newVal) {
      $scope.layoutAlternateStyle = newVal;
    });

    $scope.toggleSearchBar = function($event) {
      $event.stopPropagation();
      $event.preventDefault();
      $theme.set('showSmallSearchBar', !$theme.get('showSmallSearchBar'));
    };

    $scope.toggleExtraBar = function($event) {
      $event.stopPropagation();
      $event.preventDefault();
      $theme.set('extraBarShown', !$theme.get('extraBarShown'));
    };

    $scope.isLoggedIn = false;

    $scope.http_request = function( $method, $url, $data ) {
      var deferred = $q.defer();
      var $request_url = 'http://shm.local/' + $url;
      var $args = {
        method: $method,
        url: $request_url,
        withCredentials: true,
      };
      if ( $data ) {
        if ( $method == 'GET' ) {
            $args['params'] = $data;
        } else {
            $args['data'] = $.param( $data );
            $args['headers'] = {'Content-Type': 'application/x-www-form-urlencoded'};
        }
      }
	  $http( $args ).then(
		function successCallback(response) {
			deferred.resolve( response.data, response.status );
		}, function errorCallback(response) {
			if ( response.status == 401 ) {
				if ( $scope.isLoggedIn ) $scope.logOut();
			} else {
                alert(
                    "URL: " + $request_url + "\n" +
                    "Status: " + response.status + " (" + response.statusText +  ")\n"
                );
            }
			deferred.reject( response );
		}
	  );
      return deferred.promise;
    };

    $scope.logOut = function() {
      progressLoader.start();
      progressLoader.set(50);

      $cookieStore.remove('session_id');
      $scope.isLoggedIn = false;

	  $scope.http_request('POST', 'user/logout.cgi').then( function() {
        progressLoader.end();
        $route.reload();
      });
    };

    $scope.logIn = function(login, password) {
      progressLoader.start();
      progressLoader.set(50);
	  $scope.http_request('POST', 'user/auth.cgi', { login: login, password: password } ).then( function(response) {
        if ( response.session_id ) {
            var $session_id = response.session_id;
            $cookieStore.put('session_id', $session_id);
            $scope.isLoggedIn = true;
            $location.path('/');
            $route.reload();
        }
        progressLoader.end();
      }, function(error) {
            alert('Login or password incorrect');
            progressLoader.end();
      });
	};

    $scope.sessionCheck = function() {
        var $session_id = $cookieStore.get('session_id');
        if ($session_id) {
            $scope.isLoggedIn = true;
            return 1;
        }
        return 0;
    };

    $scope.$on('$routeChangeStart', function() {
      if ( !$scope.sessionCheck() ) return $location.path( '/extras-login' );

      if ($location.path() === '/extras-login') return $location.path('/');
      if ($location.path() === '') return $location.path('/');

      progressLoader.start();
      progressLoader.set(50);
    });

    $scope.$on('$routeChangeSuccess', function() {
      progressLoader.end();
      if ($scope.layoutLoading) {
        $scope.layoutLoading = false;
      }
      // wijetsService.make();
    });
  }]);
