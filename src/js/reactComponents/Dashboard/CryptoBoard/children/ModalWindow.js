import React from 'react';

import Dropdown from '../../../General/Dropdown';
import ButtonGroup from '../../../General/ButtonGroup';
import Chart from './children/Chart';

import { changeCSSProperties } from '../../../../helperFunctions';

export default class ModalWindow extends React.Component {
  constructor() {
    super();
    this.state = {
        componentsToUpdate: ['CryptoBoard_chart', 'SavedGraphs'],            
        propertiesCSS: [ 'paddingTop', 'PaddingBottom', 'maxHeight', 'minHeight' ],
        buttonIsDisabled: false,
        chartIsNotBuilt: true, // make 'save graph' button unclickable when chart is not yet built
        chartIsSaved: false, // make 'save graph' button unclickable when chart has already been sved once - prevents duplication
    };
    this.handleControllBtnClick = this.handleControllBtnClick.bind(this);
    this.openModalWindow = this.openModalWindow.bind(this);
    this.changeCurrencyFilter = this.changeCurrencyFilter.bind(this);
    this.changeComparisionField = this.changeComparisionField.bind(this);
    this.changeChartType = this.changeChartType.bind(this);
  }
  openModalWindow() {
    if(this.state.buttonIsDisabled) return;

    const values = [ '19px', '19px', '2000px', '20px' ];

    changeCSSProperties(this.state.propertiesCSS, values, this.modalWindow);
  }
  closeModalWindow() {
     const values = [ '0', '0', '0', '0' ];

     changeCSSProperties(this.state.propertiesCSS, values, this.modalWindow);
  }
  enableButton() {
    this.setState({
      buttonIsDisabled: false
    });
  }
  disableButton() {
    this.setState({
      buttonIsDisabled: true
    });
  }
  visualize() {
    if(this.state.buttonIsDisabled) return;

    const {type, comparisionField} = this.props.model.filters;

    this.chart.renderChart(type, comparisionField);

    this.setState({
      chartIsNotBuilt: false,
      chartIsSaved: false
    });
  }
  handleControllBtnClick(target) {
    const id = target.getAttribute('id');

    switch(id) {
    case 'cancel-button':
      this.closeModalWindow();
      break;

    case 'build-button':
      this.visualize();
      break;
        
    case 'save-graph-button':
      this.saveGraph();
      break;

    default:
      console.log('controll btn group defaulted with', id);
    }
  }
  saveGraph() {
    if(this.state.chartIsNotBuilt || this.state.chartIsSaved) {
      return;
    }

    const newCollectionItem = {
      hashTable: Object.assign({}, this.props.hashTable),
      filters: Object.assign({}, this.props.model.filters),
      currentSign: this.props.currentSign,        
      actionSubtype: "add", // for reducer
      id: Math.random().toString(36).slice(2) // randomly generated string, used as unique identifier
    };

    this.setState({ chartIsSaved: true }); // to prevent duplication
    this.props.update(null, this.state.componentsToUpdate[1], newCollectionItem);
  }
  changeCurrencyFilter(target) {
    const filterNames = ['currency'];
    const newFilterValues = [target.getAttribute('data-value')];
    const {comparisionField, currency} = this.props.model.filters;
    const componentToUpdate = this.state.componentsToUpdate[0];

    if(currency !== newFilterValues[0]) {
      if(
        comparisionField.indexOf('price') !== -1
        || comparisionField.indexOf('volume_24h') !== -1
        || comparisionField.indexOf('market_cap') !== -1
      ) {
        // we need to change the last three chars as they represent currency
        filterNames.push('comparisionField');
        newFilterValues.push(comparisionField.substr(0, comparisionField.length - 3) + newFilterValues[0].toLowerCase());            
      }
    
      this.props.update(this.props.createURL(this.props.limit, newFilterValues[0]), componentToUpdate)
        .then(() => {
            this.props.change(newFilterValues, filterNames, componentToUpdate);
            this.props.changeHashTableCurrency();
        });
    }
}
  changeComparisionField(target) {
    const btnVal = target.textContent;
    const currency = this.props.model.filters.currency;
    const filterName = 'comparisionField';
    let newFilterValue;
    
    switch(btnVal) {
      case 'Price':
        newFilterValue = 'price_' + currency.toLowerCase();
        break;
      case 'Volume(24h)':
        newFilterValue = '24h_volume_' + currency.toLowerCase();
        break;
      case 'Market Cap':
        newFilterValue = 'market_cap_' + currency.toLowerCase();
        break;
      case '%1h':
        newFilterValue = 'percent_change_1h';
        break;
      case '%24h':
        newFilterValue = 'percent_change_24h';
        break;
      case '%7d':
        newFilterValue = 'percent_change_7d';
        break;
      default: 
        console.warn('switch of btnVal defaulted width', btnVal);
    }

    this.props.change(newFilterValue, filterName, this.state.componentsToUpdate[0]);
  }
  changeChartType(target) {
    const filterName = 'type';
    const newFilterValue = target.getAttribute('data-type');

    this.props.change(newFilterValue, filterName, this.state.componentsToUpdate[0]);
  }
render() {
    return (
      <div>
        <button
          id="modal-button"
          className={`btn ${this.state.buttonIsDisabled ? "disabled" : ""}`}
          onClick={this.openModalWindow}
        >
          Visualize
        </button>
        <section ref={section => this.modalWindow = section} className="modal-window col-md-12 col-sm-12 col-xs-12">
          <div className="well">
            <Dropdown
              classesCSS={{ dropdown: "dropdown_chart-currency", button: "btn-success" }}
              defaultDataValue={this.props.model.filters.currency}
              onClickHandler={this.changeCurrencyFilter}
              titleText="Currency"
              options={[
                { dataValue: "USD" },
                { dataValue: "EUR" },
                { dataValue: "UAH" },
                { dataValue: "RUB" },
                { dataValue: "BTC" },
                { dataValue: "LTC" },
                { dataValue: "ETH" }
              ]}
            />
            <div className="btn-group_container">
              <h4>Categories</h4>
              <ButtonGroup 
                classesCSS="btn-group category"
                onClickHandler={this.changeComparisionField}
                buttons={[
                  { classesCSS:"active", textValue: "Price" },
                  { textValue: "Volume(24h)" },
                  { textValue: "Market Cap" },
                  { textValue: "%1h" },
                  { textValue: "%24h" },
                  { textValue: "%7d" }
                ]}
              />
            </div>
            <div className="btn-group_container">
              <h4>Graph Types</h4>
              <ButtonGroup
                classesCSS="btn-group type"
                onClickHandler={this.changeChartType}
                buttons={[
                  { classesCSS: "active", attrs: { "data-type": "bar"}, textValue: "Bar" },
                  { attrs: { "data-type": "hbar"}, textValue: "Horizontal Bar" },
                  { attrs: { "data-type": "pie"}, textValue: "Pie" },
                  { attrs: { "data-type": "pie-donut"}, textValue: "Donut" },
                  { attrs: { "data-type": "line"}, textValue: "Line"},                                            
                  { attrs: { "data-type": "line-scatter"}, textValue: "Scatter Plot"},
                  { attrs: { "data-type": "line-area"}, textValue: "Area Plot"},
                ]}
              />
            </div>
        </div>
        <ButtonGroup 
          classesCSS="controll-group"
          onClickHandler = {this.handleControllBtnClick}
          buttons={[
            { classesCSS: "btn-danger", id:"cancel-button", textValue: "Hide" },
            { classesCSS: `btn-success  ${this.state.buttonIsDisabled ? "disabled" : ""}`, id: "build-button", textValue: "Build Chart" },
            { classesCSS: `btn-info  ${this.state.chartIsNotBuilt ? "disabled" : ""}`, id:"save-graph-button", textValue: "Save graph" },
          ]}                    
        />
        <Chart
          ref={chart => this.chart = chart}
          hashTable={this.props.hashTable}
          currentSign={this.props.currentSign}
          margin={this.props.model.margin}
        />
      </section>
    </div>
    );
  }
};