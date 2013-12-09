'use strict';

angular
  .module('dataProvider', [])
  .factory('clusteredData', ['$q', '$log', '$http', function($q, $log, $http){
    var clusters = $http.get('/api/clusters');
    var d = $q.defer();

    var processData = function ( data ) {
      $log.info('clusters loaded');

      d.resolve(data);
    };

    var processError = function( error) {
      $log.error(error);
      d.reject(error);
    };

    clusters.then(processData, processError );

    return d.promise;
  }]);
