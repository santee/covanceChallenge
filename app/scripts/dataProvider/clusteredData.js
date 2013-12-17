'use strict';

angular.module('dataProvider')
  .factory('clusteredData', ['$q', '$log', '$http', '$location', 'ClusterNode', function ($q, $log, $http, $location, ClusterNode) {
    var dataset = $location.search()['setName'];
    var clusters = $http.get('/api/clusters', { params: { setName: dataset } });
    var d = $q.defer();

    var processData = function (response) {
      $log.info('Clusters loaded from ' + (dataset || 'default') + ', generating view model...');
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
