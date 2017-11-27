import React from 'react';

import Header from '../../General/Header';
import Dropdown from '../../General/Dropdown';
import InputForm from '../../General/InputForm';
import ButtonGroup from '../../General/ButtonGroup';
import LineChart from './children/AugmentedBasicLineChart';
import Message from '../../General/Message';


import { scaleGraphSize } from '../../../helperFunctions';

export default class CurrencyPairGraph extends React.Component {
  constructor() {
    super();
    this.state = {
      componentToUpdate: 'CurrencyPairGraph'
    };
    this.currencyFilterChange = this.currencyFilterChange.bind(this);
    this.hoursFilterChange = this.hoursFilterChange.bind(this);
    this.toggleGraphs = this.toggleGraphs.bind(this);
  }
  componentDidMount() {
    this.props.update(this.createURL(), this.state.componentToUpdate)
    .then(() => this.renderGraphs(false))
    .catch(err => console.warn(err));
  }
  createURL() {
    const { pairName, dataPoints, hours } = this.props.model.filters;
    return `https://api.nexchange.io/en/api/v1/price/${pairName}/history/?data_points=${dataPoints}&format=json&hours=${hours}`;
  }
  renderGraphs(isModuleBeingUpdated) {
    // substitute dataset and update current graphs
    if(isModuleBeingUpdated) this.charts.updateLine(this.props.model.data);
    // build new graphs from scratch and add event listeners for filters
    else this.charts.buildLine(this.props.model.data);
  }
  saveChangesAndRerender(newFilterValue, filterName) {
    this.charts.showPreloader();
    this.props.change(newFilterValue, filterName, this.state.componentToUpdate)
    this.props.update(this.createURL(), this.state.componentToUpdate)
      .then(() => {
        this.renderGraphs(true);
        this.charts.hidePreloader();
      });
  }
  currencyFilterChange(target) {
    const filterName = 'pairName';
    const newFilterValue = target.getAttribute('data-value');        
        
    this.saveChangesAndRerender(newFilterValue, filterName);
  }
  frequencyFilterChange(target) {
    const frequency = target.getAttribute('data-value') || '';
    const hours = this.props.model.filters.hours;
    const divisor = this.props.model.dataPointDivisors[frequency];

    let dataPoints = Math.floor(hours / divisor);
    if(dataPoints !== 0) {
      if(dataPoints === 1) {
        dataPoints++;
      }        

      const filterNames = ['dataPoints', 'currentDivisor', 'frequency'];
      const newFilterValues = [dataPoints, divisor, frequency];
    
      this.saveChangesAndRerender(newFilterValues, filterNames);
    }
  }
  hoursFilterChange(evt) {
    const input = evt.target.querySelector('input');
    const hours = parseFloat(input.value);

    if(!hours) {
      this.showError();
      return;
    }
    
    this.hideError();

    const divisor = this.props.model.filters.currentDivisor;        
    const dataPoints = Math.floor(hours / divisor);        
    const filterNames = ['dataPoints', 'hours'];        
    const newFilterValues = [dataPoints, hours];

    input.placeholder = hours + ' Hours'
    input.value = '';
    input.blur();

    this.saveChangesAndRerender(newFilterValues, filterNames);
  }
  showError() {
    this.message.show();
    this.form.showError();
  }
  hideError() {
    this.message.hide();
    this.form.hideError();
  }
  toggleGraphs(target) {
    let targetBtn = target;
    if(targetBtn.tagName === 'SPAN') targetBtn = targetBtn.parentElement;        
    const id = targetBtn.id;

    const active = targetBtn.classList.contains('active');
    if(!active) targetBtn.classList.add('active');
    else targetBtn.classList.remove('active');

    this.charts.toggleGraphs(id, active);
  }
  render() {
    return (
      <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <section id="currency-pair" className="row x_panel">
          <Header
            classesCSS="col-md-12 col-sm-12 col-xs-12 x_title"
            titleText="Currency Pair"
          />
          <div className="col-md-12 col-sm-12 col-xs-12">
            <div className="well dropdown-group">
              <Dropdown
                classesCSS={{ button: "btn-success", dropdown: "dropdown_currency" }}
                titleText="Currency"
                onClickHandler={this.currencyFilterChange}
                defaultDataValue={this.props.model.filters.pairName}
                options={[
                  { dataValue:"BTCLTC", textValue: "BTC - LTC" },
                  { dataValue:"LTCBTC", textValue: "LTC - BTC" },
                  { dataValue:"ETHBTC", textValue: "ETH - BTC" },
                  { dataValue:"BTCETH", textValue: "BTC - ETH" },
                  { dataValue:"LTCETH", textValue: "LTC - ETH" },
                  { dataValue:"ETHLTC", textValue: "ETH - LTC" },
                ]}
              />
              <Dropdown 
                classesCSS={{ button: "btn-success", dropdown: "dropdown_frequency" }}
                onClickHandler={this.frequencyFilterChange.bind(this)}
                titleText="Frequencies"
                defaultDataValue={this.props.model.filters.frequency}
                options={[
                  { dataValue:"1 min" },
                  { dataValue:"5 mins" },
                  { dataValue:"30 mins" },
                  { dataValue:"1 hour" },
                  { dataValue:"3 hours" },
                  { dataValue:"6 hours" },
                  { dataValue:"12 hours" },
                  { dataValue:"24 hours" },
                ]}
              />
            </div>
            <div className="well" style={{"overfow": "auto"}}>
              <div className="col-md-12 col-sm-12 col-xs-12">
                <InputForm
                  ref={form => this.form = form}
                  formCSSClasses="form-horizontal form-label-left input_mask"
                  formId="hours-input"
                  inputName="hours"
                  placeholder="2 Hours"
                  inputIcon="fa fa-clock-o"
                  onSubmitHandler={this.hoursFilterChange}
                />
              </div>
              <Message
                ref={message => this.message = message}
                msg="Invalid input, try numbers"                
                CSSClasses="error"
              />
              <div className="clearfix"></div>
            </div>
            <div className="well toggle-graphs">
              <ButtonGroup 
                containerAttrs={{ "data-toggle": "buttons"}}
                classesCSS="btn-group"
                noSingleButtonSelection={true}
                onClickHandler={this.toggleGraphs}
                buttons={[
                  { classesCSS: "btn-info active",
                    id: "ask",
                    textValue: ["Ask ", <span key="0" className="glyphicon glyphicon-ok"></span>]
                  },
                  { classesCSS: "btn-danger active",
                    id: "bid",
                    textValue: ["Bid ", <span key="1" className="glyphicon glyphicon-ok"></span>]
                  },
                  { classesCSS: "btn-success",
                    id: "spread",
                    textValue: ["Spread ", <span key="2" className="glyphicon glyphicon-ok"></span>]
                  }
                ]}
              />
            </div>
          </div>
          <LineChart
            ref={lineCharts => this.charts = lineCharts}
            model={this.props.model}
            graphId="ask-bid-spread"                            
          />
        </section>
      </div>
    );
  }
};