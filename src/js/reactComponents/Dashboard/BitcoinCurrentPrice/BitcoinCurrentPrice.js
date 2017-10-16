import React from "react";

import Header from "../../General/Header";
import CurrencyBlock from "./CurrencyBlock";

class BitcoinCurrentPrice extends React.Component {
    constructor() {
        super();
        this.state = {
            componentToUpdate: "BitcoinCurrentPrice"
        };
    }
    shouldComponentRender() {
        return this.props.display;
    }
    componentDidMount() {
        const display = this.props.display;
        const { updateFrequency, url } = this.props.model;

        this.props.update(url, display, this.state.componentToUpdate);
        this.setState({
            intervalId: setInterval(() => this.props.update(url, display, this.state.componentToUpdate), updateFrequency)
        });
    }
    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            prevValEUR: !!this.props.model.data.bpi ? this.props.model.data.bpi.EUR.rate_float.toFixed(2) : 0,
            prevValUSD: !!this.props.model.data.bpi ? this.props.model.data.bpi.USD.rate_float.toFixed(2) : 0
        });
    }
    renderDifference(sign) {
        if(!this.props.model.data.bpi) {
            return null;
        }

        const insertDiffJSX = (diff, sign) => {
            let outputJSX = null;
            if(diff > 0.01) outputJSX = (
                <span className={diff > 0 ? "green" : "red"}>
                    <i className={`fa fa-sort-${diff > 0 ? "asc" : "desc"}`}></i>
                    <span dangerouslySetInnerHTML={{__html: sign + Math.abs(diff).toFixed(2)}}></span>
                    <span> From last minute</span>
                </span>
            );
            return outputJSX;
        };

        const price = {
            ['prevVal' + sign]: !this.state['prevVal' + sign] ? 0 : this.state['prevVal' + sign],
            ['currVal' + sign]: this.props.model.data.bpi[sign].rate_float
        };

        if(price['prevVal' + sign] !== 0 ) return insertDiffJSX(price['prevVal' + sign] - price['currVal' + sign], this.props.signs[sign]);    
        else return null;
    }    
    render() {
        const rateEUR = !!this.props.model.data.bpi ? this.props.model.data.bpi.EUR.rate_float.toFixed(2) : '';
        const rateUSD = !!this.props.model.data.bpi ? this.props.model.data.bpi.USD.rate_float.toFixed(2) : '';
        return (
            <div className="col-md-12 col-sm-12 col-xs-12">
                <section id="bitcoin-current-price" className="row tile_count x_panel">
                    <Header classesCSS="col-md-6 col-sm-12 col-xs-12"
                            titleText="Current Price For Bitcoin"
                    />
                    <CurrencyBlock classesCSS="current-price-in-USD"
                                   text="United States Dollars:"
                                   currencyValue={rateUSD}
                                   sign={this.props.signs["USD"]}                                   
                                   renderDifference={this.renderDifference.bind(this, "USD")}
                    />
                    <CurrencyBlock classesCSS="current-price-in-EUR"
                                   text="European Union Euro:"
                                   currencyValue={rateEUR}
                                   sign={this.props.signs["EUR"]}
                                   renderDifference={this.renderDifference.bind(this, "EUR")}
                    />
                </section>
            </div>
        );
    }
};
    
export default BitcoinCurrentPrice;