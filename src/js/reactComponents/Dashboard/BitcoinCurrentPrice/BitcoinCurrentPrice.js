import React from "react";

import Header from "../../General/Header";
import CurrencyBlock from "./children/CurrencyBlock";

class BitcoinCurrentPrice extends React.Component {
  constructor() {
    super();
    this.state = {
      componentToUpdate: "BitcoinCurrentPrice",
      prevValEUR: 0,
      prevValUSD: 0
    };
  }
  componentDidMount() {
    const { updateFrequency, url } = this.props.model;

    this.props.update(url, this.state.componentToUpdate);

    this.setState({
      intervalId: setInterval(() => {
        this.setState({
          prevValEUR: !!this.props.model.data.bpi ? this.props.model.data.bpi.EUR.rate_float : 0,
          prevValUSD: !!this.props.model.data.bpi ? this.props.model.data.bpi.USD.rate_float : 0
        }, () => this.props.update(url, this.state.componentToUpdate));
      }, updateFrequency)
    });
  }
  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }    
  renderDifference(sign) {
    if(!this.props.model.data.bpi) {
      return null;
    }

    const insertDiffJSX = (diff, sign) => (
      <span className={diff < 0 ? "red" : "green"}>
        <i className={`fa fa-sort-${diff < 0 ? "desc" : "asc"}`}></i>
        <span dangerouslySetInnerHTML={{__html: sign + Math.abs(diff).toFixed(2)}}></span>
        <span> From last minute</span>
      </span>
    );

    const price = {
      ['prevVal' + sign]: !this.state['prevVal' + sign] ? 0 : this.state['prevVal' + sign],
      ['currVal' + sign]: this.props.model.data.bpi[sign].rate_float
    };

    if(price['prevVal' + sign] !== 0 ) {            
      return insertDiffJSX(price['prevVal' + sign] - price['currVal' + sign], this.props.signs[sign]);
    } else {
      return null;
    }
  }
  render() {
    const rateEUR = !!this.props.model.data.bpi ? this.props.model.data.bpi.EUR.rate_float : '';
    const rateUSD = !!this.props.model.data.bpi ? this.props.model.data.bpi.USD.rate_float : '';     
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