import React from 'react';
import PropTypes from 'prop-types';

import Header from '../../General/Header';
import CurrencyBlock from './children/CurrencyBlock';

class BitcoinCurrentPrice extends React.Component {
  constructor() {
    super();
    this.state = {
      componentToUpdate: 'BitcoinCurrentPrice',
      prevRateEUR: 0,
      prevRateUSD: 0,
    };
    this.renderChangeUSD = this.renderChange.bind(this, 'USD');
    this.renderChangeEUR = this.renderChange.bind(this, 'EUR');
  }
  componentDidMount() {
    const { updateFrequency, url } = this.props.model;

    this.props.update(url, this.state.componentToUpdate);
  
    setInterval(() => {
      const dataset = this.props.model.data.bpi;

      this.setState({
        prevRateEUR: dataset ? dataset.EUR.rate_float : 0,
        prevRateUSD: dataset ? dataset.USD.rate_float : 0,
      }, () => {
        this.props.update(url, this.state.componentToUpdate);
      });
    }, updateFrequency);
  }
  static insertDiffJSX(diff, sign) { // generates JSX based on diff value
    return (
      <span className={diff < 0 ? 'red' : 'green'}>
        <i className={`fa fa-sort-${diff < 0 ? 'desc' : 'asc'}`} />
        <span dangerouslySetInnerHTML={{ __html: sign + Math.abs(diff).toFixed(2) }} />
        <span> From last minute</span>
      </span>
    );
  }
  renderChange(sign) {
    if (!this.props.model.data.bpi) {
      return null;
    }

    const prevRate = this.state[`prevRate${sign}`] || 0;
    const currRate = this.props.model.data.bpi[sign].rate_float;

    if (prevRate === 0) {
      return null;
    }
    return BitcoinCurrentPrice.insertDiffJSX(prevRate - currRate, this.props.signs[sign]);
  }
  render() {
    const dataset = this.props.model.data.bpi;
    const rateEUR = dataset ? dataset.EUR.rate_float : '';
    const rateUSD = dataset ? dataset.USD.rate_float : '';

    return (
      <div className="col-md-12 col-sm-12 col-xs-12">
        <section id="bitcoin-current-price" className="row tile_count x_panel">
          <Header
            classesCSS="col-md-6 col-sm-12 col-xs-12 component-title"
            titleText="Current Price For Bitcoin"
          />
          <CurrencyBlock
            classesCSS="current-price-bar"
            text="United States Dollars:"
            currencyValue={rateUSD}
            sign={this.props.signs.USD}
            renderChange={this.renderChangeUSD}
          />
          <CurrencyBlock
            classesCSS="current-price-bar"
            text="European Union Euro:"
            currencyValue={rateEUR}
            sign={this.props.signs.EUR}
            renderChange={this.renderChangeEUR}
          />
        </section>
      </div>
    );
  }
}

BitcoinCurrentPrice.propTypes = {
  update: PropTypes.func,
  model: PropTypes.object,
  signs: PropTypes.object,
};

export default BitcoinCurrentPrice;
