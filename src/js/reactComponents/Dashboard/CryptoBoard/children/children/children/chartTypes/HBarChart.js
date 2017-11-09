import React from "react";
import * as d3 from "d3";
import {attrs} from "d3-selection-multi";

export default class HBarChart extends React.Component {
  constructor() {
    super();
    this.state = {
      duration: 300,      
    };
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
    const svg = d3.select(this.svg);

    this.setState({ actualHeight }); // will need this variable later on

    svg.attr("width", this.props.width)
    .attr("height", this.props.height);

    this.yScale = d3.scaleBand()
      .range([actualHeight, 0])
      .padding(0.1);

    this.xScale = d3.scaleLinear()
      .range([0, actualWidth]);

    this.setState({
    g: svg.append("g")
        .attrs({
            "transform": `translate(${margin.left}, ${margin.top})`,
            "class": "hbar"
        })
    }, () => {
        this.state.g.append("g")
            .attr("class", "axis axis--y");
        
        this.state.g.append("g")
            .attr("class", "axis axis--x");

        this.state.g.append("g")
            .attr("class", "axis axis--hidden");

        this.updateSVG();
    });
  }
  updateSVG() {
    const { dataset, comparisionField, type } = this.props;
    const g = this.state.g;
    const { actualHeight, duration } = this.state;

    let [min, max] = d3.extent(dataset, d => +d[comparisionField]);

    this.yScale.domain(dataset.map(d => d.id));
    this.xScale.domain([min, max]);
    
    // ADD Y AXIS    
    const yAxis = g.select(".axis--y");

    const inRange = val => {
      if(val < 0) {
          return 0;
      }
      if(val > actualWidth) {
          return actualWidth;
      }
      return val;
    }
    yAxis.transition()
      .duration(duration)
      .attr("transform", `translate(${inRange(this.xScale(0))}, 0)`)
      .call(d3.axisLeft(this.yScale).tickValues(dataset.map(d => d.id)));

    const recalcXScaleRange = margin => {      
      const actualWidth = this.props.width - (margin.left + margin.right);     
      this.xScale.range([0, actualWidth], 0.2);
    };
    const recalcXTranslate = margin => {      
      this.state.g.attr('transform', `translate(${margin.left}, ${margin.top})`);
    };
    
    // OH NO - FUNCTION WITH SIDE EFFECTS
    const widestVal = this.props.recalc(yAxis, this.props.margin, [
      recalcXScaleRange,
      recalcXTranslate
    ]);

    yAxis.selectAll("text")
      .data(dataset)
      .on("mouseover", d => this.toggleBar(d.id, false))
      .on("mouseout", d => this.toggleBar(d.id, true))
      .transition()
      .duration(duration)
     .attr("x", d => +d[comparisionField] < 0 ? 10 : -10)            
      .style("width", widestVal)
      .style("text-anchor", d => +d[comparisionField] < 0 ? "start" : "end")
      .style("cursor", "pointer")
      .style("font-size", "14px");

    yAxis.selectAll("line")
      .style("display", "none");
    
    // ADD X AXIS
    
    g.select(".axis--x")
      .attr("transform", `translate(0, ${actualHeight})`)
      .transition()
      .duration(duration)
      .call(d3.axisBottom(this.xScale).ticks(5));
    
    // ADD HIDDEN ADITIONAL X AXIS        
    const hiddenAxis = g.select(".axis--hidden");

    hiddenAxis.attr("transform", `translate(0, ${actualHeight})`)
      .call(
        d3.axisBottom(this.xScale)
          .tickValues(dataset.map(d => +d[comparisionField]))
          .tickFormat(d3.format(".2f"))
       );

    hiddenAxis.selectAll(".tick")
      .data(dataset)
      .attr("data-currency-id", d => d.id)
      .attr("stroke", d => d.color)            
      .style("font-size", "14px")
      .style("opacity", 0)
      .select("text")
        .attr("y", 20)
                
    // APPEND RECTANGLES
    const actualWidth = this.props.width - widestVal - this.props.margin.right;
    
    const rects = g.selectAll("rect")
      .data(dataset);
    
    rects.exit()
      .remove();

    rects.enter()
      .append("rect")
      .merge(rects)
        .on("mouseover", d => this.toggleBar(d.id, false))
        .on("mouseout", d => this.toggleBar(d.id, true))
        .style("cursor", "pointer")
        .transition()
        .duration(duration)
        .attrs({
          "fill":  d => this.props.color(+d[comparisionField]),                    
          "height": () => this.yScale.bandwidth(),
          "y": d => this.yScale(d.id),
          "width": d => {
            let res = Math.abs(this.xScale(+d[comparisionField]) - this.xScale(0));
            if(res > actualWidth) {
                res = actualWidth;
            }
            return res;
          },
          "x": d => {
            let val = 0;
            if(min > 0) {
                val = min;
            }
            if(max < 0) {
                val = max;
            }
            return this.xScale(Math.min(val, +d[comparisionField]))
          }
        });
    
    this.props.drawCurrencySign(comparisionField, g, {axis: "x", x: actualWidth + 15, y: 15});
  }
  toggleBar(id, mouseOut) {
    const hiddenTicks = Array.from(this.state.g.selectAll(".axis--hidden .tick").nodes());
    const tick = hiddenTicks.find(tick => tick.getAttribute("data-currency-id") === id);
    let opacityVal;

    if(mouseOut) {
      opacityVal = 0;
    } else {
      opacityVal = 0.9;
    }

    d3.select(tick)
      .transition()
      .duration(this.state.duration)
      .style("opacity", opacityVal);        
  }
  render() {
    return (
      <div>        
        <svg ref={svg => this.svg = svg}></svg>        
      </div>
    );
  }
}