import React from 'react';

import Checkbox from './children/Checkbox';

export default class Settings extends React.Component {
  constructor() {
    super();
    this.onClickHandler = this.onClickHandler.bind(this);
  }
  onClickHandler(evt) {
    let { target } = evt;
    if (target.tagName === 'DIV') {
      return;
    } else if (target.tagName === 'SPAN') {
      target = target.parentElement.childNodes[0];
    } else if (target.tagName === 'I') {
      target = target.parentElement;
    }

    const key = target.getAttribute('data-js-hook');
    const filterName = 'displayComponent';
    const newFilterValue = Object.assign({}, this.props.displayComponent);

    newFilterValue[key] = !this.props.displayComponent[key];

    this.props.change(newFilterValue, filterName, this.props.componentToUpdate);
    // window.localStorage.setItem(filterName, JSON.stringify(newFilterValue));
    // this.applyChanges(target, newFilterValue[key]);
  }
  render() {
    return (
      <section
        id="component-display"
        className="row"
        ref={(section) => { this.checkboxSection = section; }}
      >
        <div className="col-md-12 col-sm-12 col-lg-6">
          <h2>What components should be displayed</h2>
        </div>
        <div className="col-md-12 col-sm-12 col-lg-6">
          <Checkbox
            isItemChecked={this.props.displayComponent.BitcoinCurrentPrice}
            jsHook="BitcoinCurrentPrice"
            title="Current Bitcoin Price"
            onClickHandler={this.onClickHandler}
          />
        </div>
        <div className="col-md-12 col-sm-12 col-lg-6">
          <Checkbox
            isItemChecked={this.props.displayComponent.BitcoinHistoryGraph}
            jsHook="BitcoinHistoryGraph"
            title="Bitcoin Price History"
            onClickHandler={this.onClickHandler}
          />
        </div>
        <div className="col-md-12 col-sm-12 col-lg-6">
          <Checkbox
            isItemChecked={this.props.displayComponent.CurrencyPairGraph}
            jsHook="CurrencyPairGraph"
            title="Currency Comparison"
            onClickHandler={this.onClickHandler}
          />
        </div>
        <div className="col-md-12 col-sm-12 col-lg-6">
          <Checkbox
            isItemChecked={this.props.displayComponent.CryptoBoard}
            jsHook="CryptoBoard"
            title="Table of Currencies"
            onClickHandler={this.onClickHandler}
          />
        </div>
      </section>
    );
  }
}
