'use strict';

angular.module('dataProvider')
  .service('itemPropertiesSelector', ['clusteredData', '$q', function(clusteredData, $q) {

    var d = $q.defer();

    var scope = {
      deferred: d.promise,
      selectedTextProperties : [],
      selectedNumericProperties: []
    };

    var loadProperties = function(cluster) {
      scope.selectedNumericProperties = cluster.getCommonNumericProperties();
      scope.selectedTextProperties = cluster.getCommonTextProperties();
      d.resolve(scope);
    };

    var loadingFailed = function(reason) {
      d.reject(reason);
    };

    clusteredData.then(loadProperties, loadingFailed);

    return scope;
  }]);
