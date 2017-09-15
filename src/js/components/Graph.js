import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';
import { interpolatePath } from 'd3-interpolate-path';

// GRAPH CLASS
const Graph = function(params) {
  const keys = Object.keys(params);
  keys.forEach(key => {
    this[key] = params[key];
  });
};
Graph.prototype.update = function(dataset) {
  const opacityVal = this.hidden ? 0 : 1;
  this.graphSVG
    .select('path#graph-line--' + this.type)
    .transition()
    .duration(1200)
    .attrTween('d',  (() => {
      const self = this;
      return function() {
        const previous = d3.select(this).attr('d');
        const current = self.lineFunction(dataset);
        return interpolatePath(previous, current); // adds/removes points from prev to match current => for better graph transformations
      };
    })())
    .style('opacity', opacityVal);
};
Graph.prototype.append = function(dataset) {
  const opacityVal = this.hidden ? 0 : 1;
  this.graphSVG
    .append('path')
    .attrs({
        'd': this.lineFunction(dataset),
        'stroke': this.color,
        'stroke-width': 2,
        'fill': 'none',
        'id': 'graph-line--' + this.type,
    })
    .style('opacity', opacityVal);
};

export default Graph;