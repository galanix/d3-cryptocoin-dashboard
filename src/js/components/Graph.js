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
    this.container
      .append('path')
      .attrs({
          'd': this.lineFunction(dataset),
          'stroke': this.color,
          'stroke-width': this.strokeWidth || 2,
          'fill': this.fill || "none",
          'id': 'graph-type--' + this.type,
      })
      .style('opacity', this.opacityVal || (!!this.hidden ? 0 : 1));
  }
  update(dataset) {    
    this.container
      .select('#graph-type--' + this.type)
      .transition()
      .duration(1200)
      .attrTween('d',  (_d, _i, el) => {
          const previous = d3.select(el[0]).attr('d');
          const current = this.lineFunction(dataset);
          return interpolatePath(previous, current); // adds/removes points from prev to match current => for better graph transformations        
      })
      .style('opacity', this.opacityVal || (!!this.hidden ? 0 : 1));
  }
};