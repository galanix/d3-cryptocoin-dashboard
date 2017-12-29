import React from 'react';
import Checkbox from './children/Checkbox';

export default class FilterSettings extends React.Component {
  onClickHandler() {
    // toggle it
    this.props.change(
      !this.props.shouldFiltersBeSavedToLocalStorage,
      'shouldFiltersBeSavedToLocalStorage',
      this.props.componentToUpdate,
    );
  }
  clearLocalStorage() {
    const keys = [
      'BitcoinHistoryGraph',
      'CurrencyPairGraph',
      'CryptoBoard__chart',
      'CryptoBoard__table',
      'Settings__filterSettings',
      'Settings__componentsToDisplay',
    ];

    keys.forEach(key => localStorage.removeItem(key));
  }
  render() {
    return (
      <div id="filter-settings">
        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <h2>Filter Settings</h2>
        </div>

        <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
          <Checkbox
            title="Filters should be saved to local storage"
            onClickHandler={() => this.onClickHandler()}
            isItemChecked={this.props.shouldFiltersBeSavedToLocalStorage}
          />
        </div>

        <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
          <div
            className="clear-all-btn-container"
          >
            <button
              style={{ paddingLeft: '10px' }}
              className="btn btn-lg btn-danger"
              onClick={() => this.clearLocalStorage()}
            >
              Clear All Filter Data
            </button>
          </div>
        </div>
      </div>
    );
  }
}

