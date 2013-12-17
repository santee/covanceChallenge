'use strict';

angular.module('dataProvider')
  .factory('datasetList', ['$q', '$http', function ($q, $http) {
    return $http.get('/api/datasetnames');
  }]);