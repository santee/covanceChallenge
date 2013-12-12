'use strict';

angular.module('radial', ['dataProvider', 'd3'])
  .directive('d3Radial', ['d3','clusteredData', function (d3, clusteredData) {
    return {
      restrict: 'EA',
      scope: {},
      link: function (scope, element) {

        clusteredData.then(function (cluster) {
          scope.cluster = cluster;
          scope.render();
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

        scope.render = function () {
          var partition = d3.layout.partition()
            .sort(null)
            .size([2 * Math.PI, radius * radius])
            .children( function(d) {
              return d.children;
            })
            .value(function(d){
              return 1;
            });

          var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

          var color = d3.scale.category20c();

          //var colorBrewer = d3.interpolateLab('red', 'blue');
          //var color = colorBrewer(0.5);

          var path = area.datum(scope.cluster)
            .selectAll('path')
            .data(partition.nodes)
            .enter()
            .append('path')
            .attr('display', function(d) { return d.depth ? null : 'none'; })
            .style('stroke', '#fff')
            .style('fill', function(d) {
              return color ((d.children ? d : d.parent).id );
            })
            .style('fill-rule', 'evenodd')
//            .transition()
//            .duration(2000)
            .attr('d', arc);


          //specify fisheye

          var fisheye = d3.fisheye.circular()
            .radius(radius / 4)
            .distortion(2);

          area.on('mousemove', function(){
            fisheye.focus(d3.mouse(this));

            var nodes = partition.nodes(scope.cluster);
//

            path
              .each(function(d) {
                d.fisheye = fisheye(d);
              })
              .attr('d', function(d) {
                var arc = d3.svg.arc()
                  .startAngle(function() {
                    return d.fisheye.x;
                  })
                  .endAngle(function() {
                    return d.fisheye.x + d.dx;
                  })
                  .innerRadius(function() {
                    return Math.sqrt(d.y);
                  })
                  .outerRadius(function() {
                    return Math.sqrt(d.y + d.dy);
                  });

                return arc();
              });

//            nodes.each( function(d) {
//              d.fisheye = fisheye(d);
//              d.x = fisheye
//            })
//
//            _.each(nodes, function(node) {
//              node.x = fisheye.x;
//              node.x = fisheye.x;
//            });
//
//            var links = partition.links(nodes);

          });

        };
      }
    };
  }]);
