import React from 'react';

import Header from '../../General/Header';
import CurrencyBlock from './children/CurrencyBlock';

export default  class BitcoinCurrentPrice extends React.Component {
  constructor() {
    super();
    this.state = {
      componentToUpdate: 'BitcoinCurrentPrice',
      prevRateEUR: 0,
      prevRateUSD: 0
    };
    this.renderChangeUSD = this.renderChange.bind(this, 'USD');
    this.renderChangeEUR = this.renderChange.bind(this, 'EUR');
  }
  componentDidMount() {
    const { updateFrequency, url } = this.props.model;

    this.props.update(url, this.state.componentToUpdate);

    const intervalId = setInterval(() => {
      const dataset = this.props.model.data.bpi;
      
      this.setState({
        prevRateEUR: !!dataset ? dataset.EUR.rate_float : 0,
        prevRateUSD: !!dataset ? dataset.USD.rate_float : 0,
      }, () => { 
        this.props.update(url, this.state.componentToUpdate);        
      });
    }, updateFrequency);

    this.setState({ intervalId });
  }
  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }
  insertDiffJSX(diff, sign) {
    return (
      <span className={diff < 0 ? "red" : "green"}>
        <i className={`fa fa-sort-${diff < 0 ? "desc" : "asc"}`}></i>
        <span dangerouslySetInnerHTML={{__html: sign + Math.abs(diff).toFixed(2)}}></span>
        <span> From last minute</span>
      </span>
    );
  }
  renderChange(sign) {
    if(!this.props.model.data.bpi) {
      return null;
    }

    const prevRate = this.state['prevRate' + sign] || 0;
    const currRate = this.props.model.data.bpi[sign].rate_float;

    if(prevRate === 0) {
      return null;
    }
      
    return this.insertDiffJSX(prevRate - currRate, this.props.signs[sign]);
  }
  render() {
    const dataset = this.props.model.data.bpi;
    const rateEUR = !!dataset ? dataset.EUR.rate_float : '';
    const rateUSD = !!dataset ? dataset.USD.rate_float : '';

    return (
      <div className="col-md-12 col-sm-12 col-xs-12">
        <section id="bitcoin-current-price" className="row tile_count x_panel">
        <Header
          classesCSS="col-md-6 col-sm-12 col-xs-12"
          titleText="Current Price For Bitcoin"
        />
        <CurrencyBlock
          classesCSS="current-price-in-USD"
          text="United States Dollars:"
          currencyValue={rateUSD}
          sign={this.props.signs["USD"]}
          renderChange={this.renderChangeUSD}
        />
        <CurrencyBlock
          classesCSS="current-price-in-EUR"
          text="European Union Euro:"
          currencyValue={rateEUR}
          sign={this.props.signs["EUR"]}
          renderChange={this.renderChangeEUR}
        />
        </section>
      </div>
    );
  }
}