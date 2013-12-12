'use strict';

angular.module('radial', ['dataProvider', 'd3'])
  .directive('d3Radial', ['d3','clusteredData','$rootScope', function (d3, clusteredData, $rootScope) {
    return {
      restrict: 'EA',
      scope: {},
      link: function (scope, element) {

        scope.subscribe = function(cluster) {

          $rootScope.$watch(
            function() {
              return cluster.isSelected();
            },
            function() {
              scope.update(cluster);
            }
          );

          _.each(cluster.children, function(child){
            scope.subscribe(child);
          });
        };


        clusteredData.then(function (cluster) {
          scope.cluster = cluster;
          scope.render();
          scope.subscribe(cluster);
        });

        var width = d3.select(element[0]).node().offsetWidth;
        var height = width;

        var svg = d3.select(element[0])
          .append('svg')
          .style('height', height + 'px')
          .style('width', '100%');

        var area = svg.append('g')
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        var radius = Math.min(width, height) / 2;

        var partition = d3.layout.partition()
          .sort(null)
          .size([2 * Math.PI, radius * radius])
          .children( function(d) {
            return d.children;
          })
          .value(function(d){
            return 1;
          });

        area
          .selectAll('path')
          .on('mouseover', function() {
            scope.update();
          });

        var arc = d3.svg.arc()
          .startAngle(function(d) { return d.x; })
          .endAngle(function(d) { return d.x + d.dx; })
          .innerRadius(function(d) { return Math.sqrt(d.y); })
          .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

        var color = d3.scale.category20b();

        //var colorBrewer = d3.interpolateLab('red', 'blue');
        //var color = colorBrewer(0.5);

        var getColor = function(item) {

          if (item.isSelected()) {
            return 'yellow';
          }

          var id = item.id;

          var elem = item;
          while (elem.parent !== null && elem.parent.children[0].id === elem.id) {
            id = elem.parent.id;
            elem = elem.parent;
          }

          return color(id);
        };


        scope.update = function (cluster) {
          area
            .selectAll('path')
            .data([cluster], function(d) {
              return d.id;
            })
            .style('fill', getColor);
            //.attr('d', arc);
        };

        scope.render = function () {

          var nodes = partition.nodes(scope.cluster);

          area
            .selectAll('path')
            .data(nodes, function(d) {
              return d.id;
            })
            .enter()
            .append('path')
            //.attr('display', function(d) { return d.depth ? null : 'none'; })
            .style('stroke', '#fff')
            .style('fill', getColor)
//            .transition()
//            .duration(2000)
            .attr('d', arc);
          //specify fisheye
        };
      }
    };
  }]);
