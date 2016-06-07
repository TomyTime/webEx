'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngProgressLite',
  'myApp.view1',
  'myApp.view2'
]).
config(['$locationProvider', '$routeProvider', 'ngProgressLiteProvider',
  function($locationProvider, $routeProvider, ngProgressLiteProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/view1'});

    ngProgressLiteProvider.settings.speed = 1500;
}])
.factory('MyCache', function ($cacheFactory) {
  return $cacheFactory('myCache', {
    maxAge: 60 * 60 * 1000,
    deleteOnExpire: 'aggressive'
  });
});
