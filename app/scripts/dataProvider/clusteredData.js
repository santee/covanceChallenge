'use strict';

angular.module('dataProvider')
  .factory('clusteredData', ['$q', '$log', '$http', 'ClusterNode', function ($q, $log, $http, ClusterNode) {
    var clusters = $http.get('/api/clusters');
    var d = $q.defer();

    var processData = function (response) {
      $log.info('Clusters loaded, generating view model...');
      var cluster = new ClusterNode(response.data);
      $log.info('View model generated');
      d.resolve(cluster);
    };

    var processError = function (error) {
      $log.error(error);
      d.reject(error);
    };

    clusters.then(processData, processError);

    return d.promise;
  }]);
