'use strict';

angular.module('radial', ['dataProvider', 'd3'])
  .directive('d3Radial', ['d3','clusteredData','$rootScope', 'itemsSelectionService', function (d3, clusteredData, $rootScope, itemsSelectionService) {
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
              scope.updateViz(cluster);
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

        var radius = Math.min(width, height) / 2.1;

        var partition = d3.layout.partition()
          .sort(null)
          .size([2 * Math.PI, radius * radius])
          .children( function(d) {
            return d.children;
          })
          .value(function(d){
            return d.isSelected() ? 100 : 1;
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


        scope.updateViz = function (cluster) {
          var newOpacity = cluster.isSelected() ? 1 : 0.9;
          //newOpacity = itemsSelectionService.selectedItems.length === 0 && itemsSelectionService.selectedCluster === null ? 0.1 : newOpacity;

          scope.arcs
            .filter(function(d) {
              return d.id === cluster.id;
            })
            //.classed('selected', cluster.isSelected())
            //.classed('faded', !cluster.isSelected())
            .transition()
            .duration(500)
            .style('opacity', newOpacity)
            .style('fill', getColor)
            .style('stroke', cluster.isSelected() ? '#000' : '#fff');
            //.attr('d', arc);
        };

        scope.onClusterClick = function (d) {

          itemsSelectionService.toggleClusterSelection(d);
          $rootScope.$apply();
          scope.render();
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
            .attr('class', 'arc')
            .attr('d', arc);

          scope.arcs = area
            .selectAll('.arc');

          scope.arcs.on('click', scope.onClusterClick);

          //specify fisheye
        };
      }
    };
  }]);
