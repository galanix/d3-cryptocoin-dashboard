import React from 'react';

import Dropdown from '../../../../General/Dropdown';
import ButtonGroup from '../../../../General/ButtonGroup';

export default function Filters(props) {
  return (
    <section className="table-filters col-md-12 col-sm-12 col-xs-12">
      <div className="well dropdown-group row">
        <Dropdown
          onClickHandler={props.filterByMarketCap}
          classesCSS={{
            container: 'col-md-3 col-xs-6 col-sm-6 col-lg-3 market-cap-filter',
            button: 'btn-success',
          }}
          titleText="Market Cap"
          defaultDataValue={props.filters.marketCap}
          options={[
            { dataValue: '0', textValue: 'All' },
            { dataValue: '1', textValue: '$1 Billion+' },
            { dataValue: '2', textValue: '$100 Million - $1 Billion' },
            { dataValue: '3', textValue: '$10 Million - $100 Million' },
            { dataValue: '4', textValue: '$1 Million - $10 Million' },
            { dataValue: '5', textValue: '$100k - $1 Million' },
            { dataValue: '6', textValue: '$0 - $100k' },
          ]}
        />
        <Dropdown
          onClickHandler={props.filterByPrice}
          classesCSS={{
            container: 'col-md-3 col-xs-6 col-sm-6 col-lg-3 price-filter',
            button: 'btn-success',
          }}
          titleText="Price"
          defaultDataValue={props.filters.price}
          options={[
            { dataValue: '0', textValue: 'All' },
            { dataValue: '1', textValue: '$100+' },
            { dataValue: '2', textValue: '$1 - $100' },
            { dataValue: '3', textValue: '$0.01 - $1' },
            { dataValue: '4', textValue: '$0.0001 - $0.01' },
            { dataValue: '5', textValue: '$0 - $0.0001' },
          ]}
        />
        <Dropdown
          onClickHandler={props.filterByVolume_24h}
          classesCSS={{
            container: 'col-md-3 col-xs-6 col-sm-6 col-lg-3 volume-24h-filter',
            button: 'btn-success',
          }}
          titleText="Volume(24 hours)"
          defaultDataValue={props.filters.volume_24h}
          options={[
            { dataValue: '0', textValue: 'All' },
            { dataValue: '1', textValue: '$10 Million+' },
            { dataValue: '2', textValue: '$1 Million+' },
            { dataValue: '3', textValue: '$100k+' },
            { dataValue: '4', textValue: '$10k+' },
            { dataValue: '5', textValue: '$1k+' },
          ]}
        />
        <div className="col-md-3 col-xs-6 col-sm-6 col-lg-3 reset-btn-container">
          <h4>Reset filters</h4>
          <button
            id="reset-filters"
            className="btn btn-danger"
            onClick={props.clearFilters}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="well">
        <Dropdown
          onClickHandler={props.changeTableCurrency}
          classesCSS={{
            container: 'table-currency-filter',
            button: 'btn-success',
          }}
          titleText="Currency"
          defaultDataValue={props.filters.currency}
          options={[
            { dataValue: 'USD' },
            { dataValue: 'EUR' },
            { dataValue: 'UAH' },
            { dataValue: 'RUB' },
            { dataValue: 'BTC' },
            { dataValue: 'LTC' },
            { dataValue: 'ETH' },
          ]}
        />
        <div className="table-length-filter">
          <h4>Table Length</h4>
          <ButtonGroup
            onClickHandler={props.changeTableLength}
            classesCSS="btn-group"
            isActiveBtnDisplayed
            buttons={[
              { classesCSS: 'active', attrs: { 'data-value': '100' }, textValue: 'Top 100' },
              { textValue: 'All', attrs: { 'data-value': '0' } },
            ]}
          />
        </div>
      </div>
    </section>
  );  
};