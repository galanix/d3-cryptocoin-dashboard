import React from "react";

import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import WaitMessage from "../../General/WaitMessage";

import Graph from "../../../components/Graph";
import { formProperDateFormat } from "../../../helperFunctions";

export default class LineChart extends React.Component {
    constructor() {
        super();
    }
    componentDidMount() {
        this.hidePreloader();
    }
    buildLine(dataset) {
        const { width, paddingVal } = this.props.model;
        const height = 0.6 * width;        
        this.makeScales(dataset, width, height);    
        this.setState({
            graphSVG: d3.select(this.svgDiv).append("svg")
        }, () => {
            this.state.graphSVG
            .attrs({
                width,
                height,
                id: "historical-data"
            })
            .style("padding", paddingVal);
        });
        // construct basic graph
        const lineGraph = new Graph({
            type: "bitcoin-rate",
            color: "#c9302c",
            hidden: false,
            lineFunction:  d3.line()
                             .x(d => this.xScale(d.time.getTime()))
                             .y(d => this.yScale(d.currencyValue)),
            container: this.state.graphSVG,
        });
        lineGraph.append(dataset);
        this.setState({ lineGraph });        
        // add axises
        
        const { yTicks, xTicks, xTickFormat } = this.determineTicks(dataset);
        const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks).tickFormat(d3.format(".2f"));
        const xAxisGen = d3.axisBottom(this.xScale).tickValues(xTicks).tickFormat(d3.timeFormat(xTickFormat));

        const yAxis = this.state.graphSVG
                        .append("g")
                        .call(yAxisGen)
                        .attrs({
                            "class": "y-axis"
                        });
        const xAxis = this.state.graphSVG
                        .append("g")
                        .call(xAxisGen)
                        .attrs({
                            "transform": `translate(0, ${height})`,
                            "class": "x-axis"
                        });

        this.drawCurrencySign();    
        this.createHashTable(dataset, this.addMovableParts.bind(this)); // add add movable after it
        //this.setState({ xScale, yScale, graphSVG }, afterStateChangeCallback);
    }
    updateLine(dataset) {
        // dataset has changed, need to update #historical-data graph    
        const paddingVal = parseInt(this.state.graphSVG.style("padding-left"));
        const width = Math.round(this.state.graphSVG.node().getBoundingClientRect().width) - paddingVal * 2;
        const height = Math.round(width * 0.6);

        this.state.lineGraph.update(dataset);
        this.makeScales(dataset, width, height);
        this.state.graphSVG.attrs({ width, height }); 
        // update axises
        const { yTicks, xTicks, xTickFormat } = this.determineTicks(dataset);
        const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks).tickFormat(d3.format(".2f"));
        const xAxisGen = d3.axisBottom(this.xScale).tickValues(xTicks).tickFormat(d3.timeFormat(xTickFormat));
    
        const yAxis = this.state.graphSVG
                        .selectAll("g.y-axis")
                        .transition()
                        .duration(1000)
                        .call(yAxisGen);
    
        const xAxis = this.state.graphSVG
                        .selectAll("g.x-axis")
                        .transition()
                        .duration(1000)
                        .attr("transform", `translate(0, ${height})`)
                        .call(xAxisGen);

        this.drawCurrencySign();
        this.createHashTable(dataset);               
    }
    makeScales(dataset, width, height) {
        // chronological order
        const firstDate = dataset[0].time.getTime();
        const lastDate = dataset[dataset.length - 1].time.getTime();
        const min = d3.min(dataset, d => d.currencyValue);
        const max = d3.max(dataset, d => d.currencyValue);

        this.xScale = d3.scaleLinear().domain([ firstDate, lastDate ]).range([ 0, width ]);
        this.yScale = d3.scaleLinear().domain([ min, max ]).range([ height, 0 ]);
    }
    createHashTable(dataset, callback) {
        const hashTable = {};
        dataset.forEach(item => {
            hashTable[Math.round(this.xScale(item.time.getTime()))] = {
            currencyValue: item.currencyValue,
            time: item.time,
            }
        });
        this.setState({
            hashTable
        }, () => { if(callback) callback(dataset); });
    }
    determineTicks(dataset) {
        // recursivly finds averages
        const formTicksArray = ({ finalLevel, level, prevSm, prevLg }) => {
            let outputArray = [ prevSm, prevLg ];

            if(level >= finalLevel) {
            return;
            }
            const currTick = (prevLg + prevSm) / 2;
            outputArray.push(currTick);

            ++level;
            const  valuesDown = formTicksArray({
            finalLevel,
            level,
            prevSm: currTick,
            prevLg
            });
            if(!!valuesDown) {
            outputArray = [ ...new Set([...outputArray, ...valuesDown]) ];
            }
            
            const valuesUp = formTicksArray({
            finalLevel,
            level,
            prevSm,
            prevLg: currTick
            })        
            if(!!valuesUp) {
            outputArray = [ ...new Set([...outputArray, ...valuesUp]) ];
            }
            return outputArray;
        };        
        const { xTicks, yTicks, xTickFormat } = this.props.model.ticksInfo[this.props.model.filters.currentTimeline];

        let prevLarger = d3.max(dataset, d=> d.currencyValue);
        let prevSmaller = d3.min(dataset, d => d.currencyValue);

        const yTicksArray = formTicksArray({
            finalLevel: yTicks || 0,
            level: 1,
            prevSm: prevSmaller,
            prevLg: prevLarger
        });
        
        prevSmaller = dataset[0].time.getTime();
        prevLarger = dataset[dataset.length - 1].time.getTime();

        const xTicksArray = formTicksArray({
            finalLevel: xTicks || 0,
            level: 1,
            prevSm: prevSmaller,
            prevLg: prevLarger
        });

        return {
            yTicks: yTicksArray,
            xTicks: xTicksArray,
            xTickFormat
        };
    }
    drawCurrencySign() {
        const yAxis = d3.select("g.y-axis");
        
        if(!yAxis.select("g#currency-sign").node()) {
            yAxis
            .append("g")
            .attrs({
            "id": "currency-sign",
            })
            .append("text")
            .attrs({
                "fill": "#000",
                "font-size": "18",
                "x": "4",
                "y": "-10"
            });
        }
        const text = d3.select("#currency-sign text");
        text
            .transition()
            .duration(500)
            .attrs({
            y: "-100"
            });
        setTimeout(() => {      
            text
            .transition()
            .duration(500)
            .attrs({
                y: "-10"
            })
            .node().innerHTML = this.props.signs[this.props.model.filters.currency];        
        }, 500);
    }
    addMovableParts(dataset) {
        const showDotsAndTooltip = ({ time, currencyValue }) => {
            d3.selectAll(".dot")
            .attrs({
                cy: this.yScale(currencyValue),
                cx: this.xScale(time.getTime())
            })
            .transition()
            .duration(100)
            .style("opacity", 0.9);
            
            const tooltip = d3.select("#history .tooltip")
            .transition()
            .duration(100)
            .style("opacity", 0.9);
                      
            tooltip.node().innerHTML =
            `<h4>${formProperDateFormat(time.getFullYear(), time.getMonth() + 1, time.getDate())}</h4>
                <strong>Price: ${this.props.signs[this.props.model.filters.currency] + currencyValue.toFixed(2)}</strong>`;

            tooltip
            .style("left", this.xScale(time.getTime()) + parseInt(getComputedStyle(tooltip.node()).width) / 2 + "px")
            .style("top", this.yScale(currencyValue) + "px")
        };
        const hideDotsAndTooltip = () => {
            d3.select("#movable")
            .attrs({
            "transform": `translate(-999, 0)`,
            })
        
            d3.selectAll(".dot")         
            .transition()
            .duration(100)
            .style("opacity", 0);
        
            d3.select("#history .tooltip")
            .transition()
            .duration(100)
            .style("opacity", 0);
        };        
        const graphSVG = this.state.graphSVG;
        const lineFunction =
            d3.line()
            .x(d => 0)
            .y(d => this.yScale(d.currencyValue));
        
        graphSVG.append("path")
            .attrs({
            "d": lineFunction(dataset),
            "stroke": "#717A84",
            "stroke-width": 2,
            "fill": "none",
            "id": "movable",
            "transform": `translate(-100, 0)`,
            });

        d3.select("#history .graph").append("div") // adding tooltip
        .attr("class", "tooltip")
        .style("opacity", 0);
        
        d3.select("#historical-data").append("circle") // adding dots
            .attrs({
            r: 5,
            "class": "dot",
            "fill": "#26B99A"
            })
            .style("opacity", 0);
            
        
        const graphSVGStyles = getComputedStyle(graphSVG.node());    
        graphSVG.on("mousemove", () => {
            const paddingLeft = parseInt(graphSVGStyles.paddingLeft);
            const offsetLeft = this.state.graphSVG.node().getBoundingClientRect().left;        
            let xPos = Math.round(d3.event.clientX - offsetLeft - paddingLeft);

            const hashTable = this.state.hashTable;

            const graphWidth = parseInt(graphSVGStyles.width);
            const padRight = parseInt(graphSVGStyles.paddingRight);
            const padLeft = parseInt(graphSVGStyles.paddingLeft);
            
            if(
            xPos > (graphWidth + 10) ||
            xPos < -10
            ) {
            hideDotsAndTooltip();
            return;
            }

            let rightDist = xPos;
            let leftDist = xPos;
            let valueKey;

            // looks for closest point relative to the mouse
            while( !hashTable["" + leftDist] && leftDist < (graphWidth - padRight - padLeft + 10) ) {
            leftDist++;
            }
            while( !hashTable["" + rightDist] && rightDist > -10 ) {
            rightDist--;
            }                
            if(rightDist < leftDist) valueKey = rightDist; 
            else valueKey = leftDist;
            
            const value = hashTable["" + valueKey];
            if(!!value) {
            showDotsAndTooltip(Object.assign({}, value));
            } else {
            hideDotsAndTooltip();
            }

            d3.select("#movable")
            .attrs({
                "transform": `translate(${xPos}, 0)`,
            });
        })
        .on("mouseout", () => {
            hideDotsAndTooltip();
        });    
    }
    showPreloader() {
        this.WaitMessage.show();
    }
    hidePreloader() {
        this.WaitMessage.hide();
    }
    render() {
        return (
            <div className="graph col-md-12 col-sm-12 col-xs-12" ref={div => this.svgDiv = div}>
                <WaitMessage ref={WaitMessage => this.WaitMessage = WaitMessage} msg="Wait, please"/>
            </div>
        );
    }
};

