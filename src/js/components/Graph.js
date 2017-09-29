import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';
import { interpolatePath } from 'd3-interpolate-path';

// GRAPH CLASS
export default class Graph {
  constructor(params) {
    const keys = Object.keys(params);
    keys.forEach(key => {
      this[key] = params[key];
    });
  }
  append(dataset) {
    const opacityVal = !!this.hidden ? 0 : 1;  
    this.container
      .append('path')
      .attrs({
          'd': this.lineFunction(dataset),
          'stroke': this.color,
          'stroke-width': 2,
          'fill': 'none',
          'id': 'graph-type--' + this.type,
      })
      .style('opacity', opacityVal);
  }
  update(dataset) {
    const opacityVal = !!this.hidden ? 0 : 1;    
    this.container
      .select('#graph-type--' + this.type)
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
  }
};