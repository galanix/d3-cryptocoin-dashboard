import React from 'react';
import * as d3 from 'd3';
import {attrs} from 'd3-selection-multi';

import Legend from '../Legend.js';

export default class BarChart extends React.Component {
    constructor() {
      super();
      this.state = {
        duration: 300,
      };
      this.handleHoverEvtHandler = this.handleHoverEvtHandler.bind(this);
    }
    componentDidMount() {
      this.renderSVG();      
    }
    shouldComponentUpdate(nextProps) {
      return this.props.didPropsUpdate(nextProps, this.props);
    }
    componentDidUpdate() {
      this.updateSVG();
    }    
    renderSVG() {
      const margin = this.props.margin;
      const actualWidth = this.props.width - (margin.left + margin.right);
      const actualHeight = this.props.height - (margin.top + margin.bottom);
      this.setState({ actualHeight }); // will need this variable later on
      const svg = d3.select(this.svg);

      svg.attr('width', this.props.width)
        .attr('height', this.props.height);
      
      this.yScale = d3.scaleLinear()
        .range([actualHeight, 0])
        .nice();
      
      this.xScale = d3.scaleBand()
        .padding(0.2)
        .rangeRound([0, actualWidth], 0.2);

      this.setState({
        g: svg.append('g')
            .attrs({
              'transform': `translate(${margin.left}, ${margin.top})`,
              'class': 'bar'
            })
      }, () => {
          this.state.g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + actualHeight + ')');

          this.state.g.append('g')
            .attr('class', 'axis axis--y');

          this.state.g.append('g')
            .attr('class', `axis axis--x axis--zero`);

          this.updateSVG();
      });
    }
    updateSVG() {
      const { dataset, comparisionField, type } = this.props;
      const { g, duration } = this.state;
      const indices = dataset.map((_d, i) => ++i);
      let [min, max] = d3.extent(dataset, d => Number(d[comparisionField]));
      min = Math.min(min, 0);
      max = Math.max(max, 0);
      
      this.yScale.domain([min, max]);
      this.xScale.domain(indices);
     
      // Y AXIS
      const yAxis = g.select('g.axis--y')
      
      yAxis
        // .transition()
        // .duration(duration)
        .call(d3.axisLeft(this.yScale).ticks(10));
      
      // COUNT
      const recalcXScaleRange = margin => {
        const actualWidth = this.props.width - (margin.left + margin.right);
        this.xScale.rangeRound([0, actualWidth], 0.2);
      };
      const recalcXTranslate = margin => {
        this.state.g
          .transition()
          .duration(duration)
          .attr('transform', `translate(${margin.left}, ${margin.top})`);
      };

      this.props.recalc(yAxis, this.props.margin, [
        recalcXScaleRange,
        recalcXTranslate
      ]);

      // X AXIS
      g.select('g.axis--x')
        .call(d3.axisBottom(this.xScale).tickValues(indices))
        .transition()
        .duration(duration)
        .style('shape-rendering', 'crispEdges');

      g.select('.bar .axis--x').selectAll('.tick')
        .data(dataset)
        .attr('data-currency-id', d => d.id)
        .attr('data-index', (_d, i) => ++i);

      // ZEROTH X AXIS
      const zerothAxis = g.select('g.axis--zero');

      zerothAxis
        .attr('transform', `translate(0, ${this.yScale(0)})`)
        .style('opacity', 0.4)
        .transition()
        .duration(duration)
        .call(d3.axisBottom(this.xScale));

      zerothAxis.selectAll('text')
        .style('opacity', 0);

      zerothAxis.selectAll('line')
        .style('opacity', 0);      
      
      const rects = this.state.g.selectAll('rect')
        .data(dataset);
        
      rects
        .attr('y', this.yScale(min))
        .attr('height', this.state.actualHeight - this.yScale(min));

      rects
        .exit()
        .remove();

      rects
        .enter()
        .append('rect')
        .merge(rects)          
        .on('mouseover', d => this.toggleBar(d3.event.target.getAttribute('data-currency-id'), d, false))
        .on('mouseout', d => this.toggleBar(d3.event.target.getAttribute('data-currency-id'), d, true))
        .transition()
        .duration(duration)
        .attrs({
          'fill':  d => this.props.color(Number(d[comparisionField])),
          'data-currency-id': d => d.id,
          'width': () => this.xScale.bandwidth() > 200 ? 200 : this.xScale.bandwidth(),            
          'x': (_d,i) => this.xScale(i + 1) + (this.xScale.bandwidth() > 200 ? (this.xScale.bandwidth() - 200) / 2 : 0),
          'y': d => Number(d[comparisionField]) < 0 ? (this.yScale(0)) : this.yScale(Number(d[comparisionField])),
          'height': d => Math.abs(this.yScale(Number(d[comparisionField])) - (this.yScale(0))),
        });
          
      this.props.drawCurrencySign(comparisionField, g);
      this.legend.build();
    }
    toggleBar(id, d, mouseOut) {
      const xTicks = Array.from(this.svg.parentElement.parentElement.querySelectorAll('.axis--x .tick'));
      const rects = Array.from(this.state.g.selectAll('.bar rect').nodes());
      
      const elementInArray = d => {
        return d.getAttribute('data-currency-id') === id;
      };

      const tick = xTicks.find(elementInArray);
      const rect = rects.find(elementInArray);
      
      // r - rect
      const show = r => {
        if(r !== rect) {
            r.style.opacity = 0.2;
        }
      };
      const hide = r => {
          r.style.opacity = 1;
      };
      const display = mouseOut ? hide : show;
      rects.forEach(display);

      const onMouseMove = ({ text, innerHTML, styles }) => {
        Object.keys(styles).map(prop => {
          text.style[prop] = styles[prop];
        });      
        text.innerHTML = innerHTML;
      };
      const text = tick.getElementsByTagName('text')[0];

      if(mouseOut) {
        onMouseMove({
          text,
          innerHTML: tick.getAttribute('data-index'),
          styles: {
            fontSize: '1em',
            fill: '#73879C',
            fontWeight: 'normal' 
          }
        });
      } else {
        const formater = d3.format(',.2f');
        onMouseMove({
          text,
          innerHTML: `
            <tspan x="0">${d.name}</tspan>
            <tspan x="0" dy="1.2em">${formater(d[this.props.comparisionField])}</tspan>
          `,
          styles: { 
            fontSize: '1.5em', 
            fill: this.props.color(+d[this.props.comparisionField]) , 
            fontWeight: 'bold' 
          }
        });
      }
    }
    handleHoverEvtHandler(opacityVal, color, d) {
      let item = d3.event.target;
      if(item.tagName !== 'DIV') item = item.parentElement;    

      item.getElementsByTagName('span')[1].style.color = color;

      const id = item.getAttribute('data-currency-id');        
      this.toggleBar(id, d, opacityVal !== 1);
    }
    render() {
      return (
        <div>          
          <svg ref={svg => this.svg = svg}></svg>
          <Legend
            ref={legend => this.legend = legend}
            onHoverHandler={this.handleHoverEvtHandler}
            color={this.props.color}
            comparisionField={this.props.comparisionField}
            dataset={this.props.dataset}
          />          
        </div>
      );
    }
}