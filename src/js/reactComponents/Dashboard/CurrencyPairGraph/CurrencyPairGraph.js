import React from 'react';
import PropTypes from 'prop-types';

import Header from '../../General/Header';
import Dropdown from '../../General/Dropdown';
import InputForm from '../../General/InputForm';
import ButtonGroup from '../../General/ButtonGroup';
import LineChart from './children/AugmentedBasicLineChart';
// import Message from '../../General/Message';
import ErrorMessage from '../../General/ErrorMessage';

class CurrencyPairGraph extends React.Component {
  constructor() {
    super();
    this.state = {
      componentToUpdate: 'CurrencyPairGraph',
      isErrorMessageVisible: false,
      isFormHighlighted: false,
      hasFetchFailed: false,
    };
    this.currencyFilterChange = this.currencyFilterChange.bind(this);
    this.hoursFilterChange = this.hoursFilterChange.bind(this);
    this.toggleGraphs = this.toggleGraphs.bind(this);
    this.frequencyFilterChange = this.frequencyFilterChange.bind(this);
  }
  componentDidMount() {
    this.props.update(this.createURL(), this.state.componentToUpdate)
      .then(() => this.renderGraphs(false))
      .catch((err) => { console.warn(err); });
  }
  createURL() {
    const { pairName, dataPoints, hours } = this.props.model.filters;
    return `https://api.nexchange.io/en/api/v1/price/${pairName}/history/?data_points=${dataPoints}&format=json&hours=${hours}`;
  }
  toggleGraphs(target) {
    let targetBtn = target;
    if (targetBtn.tagName === 'SPAN') targetBtn = targetBtn.parentElement;
    const { id } = targetBtn;

    const active = targetBtn.classList.contains('active');
    if (!active) targetBtn.classList.add('active');
    else targetBtn.classList.remove('active');

    this.charts.toggleGraphs(id, active);
  }
  saveChangesAndRerender(newFilterValue, filterName) {
    this.setState({
      hasFetchFailed: false,
    }, () => {
      this.charts.showMessage();
      this.props.change(newFilterValue, filterName, this.state.componentToUpdate);
      this.props.update(this.createURL(), this.state.componentToUpdate)
        .then(() => {
          this.renderGraphs(true);
        });
    });
    
  }
  currencyFilterChange(target) {
    const filterName = 'pairName';
    const newFilterValue = target.getAttribute('data-value');
    this.saveChangesAndRerender(newFilterValue, filterName);
  }
  frequencyFilterChange(target) {
    const frequency = target.getAttribute('data-value') || '';
    const { hours } = this.props.model.filters;
    const divisor = this.props.model.dataPointDivisors[frequency];

    let dataPoints = Math.floor(hours / divisor);
    if (dataPoints !== 0) {
      if (dataPoints === 1) {
        dataPoints += 1;
      }

      const filterNames = ['dataPoints', 'currentDivisor', 'frequency'];
      const newFilterValues = [dataPoints, divisor, frequency];
      this.saveChangesAndRerender(newFilterValues, filterNames);
    }
  }
  hoursFilterChange(evt) {
    let { target } = evt;
    if (target.tagName === 'BUTTON') {
      target = target.parentElement;
    }

    const input = target.querySelector('input');
    const hours = parseFloat(input.value);

    if (!hours) {
      this.showError();
      return;
    }
    this.hideError();

    const divisor = this.props.model.filters.currentDivisor;
    const dataPoints = Math.floor(hours / divisor);
    const filterNames = ['dataPoints', 'hours'];
    const newFilterValues = [dataPoints, hours];

    input.placeholder = `${hours} Hours`;
    input.value = '';
    input.blur();

    this.saveChangesAndRerender(newFilterValues, filterNames);
  }
  showError() {
    this.setState({
      isErrorMessageVisible: true,
      isFormHighlighted: true,
    });
  }
  hideError() {
    this.setState({
      isErrorMessageVisible: false,
      isFormHighlighted: false,
    });
  }
  renderGraphs(isModuleBeingUpdated) {
    let hasFetchFailed = false;
    if (Object.keys(this.props.model.data).length === 0) {
      hasFetchFailed = true;
    }

    if (hasFetchFailed !== this.state.hasFetchFailed) {
      this.setState({
        hasFetchFailed,
      });
    }

    if (isModuleBeingUpdated) {
      // substitute dataset and update current graphs
      this.charts.updateLine(this.props.model.data);
    } else {
      // build new graphs from scratch and add event listeners for filters
      this.charts.buildLine(this.props.model.data);
    }
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
                classesCSS={{ button: 'btn-success', dropdown: 'dropdown_currency' }}
                titleText="Currency"
                onClickHandler={this.currencyFilterChange}
                defaultDataValue={this.props.model.filters.pairName}
                options={[
                  { dataValue: 'BTCLTC', textValue: 'BTC - LTC' },
                  { dataValue: 'LTCBTC', textValue: 'LTC - BTC' },
                  { dataValue: 'ETHBTC', textValue: 'ETH - BTC' },
                  { dataValue: 'BTCETH', textValue: 'BTC - ETH' },
                  { dataValue: 'LTCETH', textValue: 'LTC - ETH' },
                  { dataValue: 'ETHLTC', textValue: 'ETH - LTC' },
                ]}
              />
              <Dropdown
                classesCSS={{ button: 'btn-success', dropdown: 'dropdown_frequency' }}
                onClickHandler={this.frequencyFilterChange}
                titleText="Frequencies"
                defaultDataValue={this.props.model.filters.frequency}
                options={[
                  { dataValue: '1 min' },
                  { dataValue: '5 mins' },
                  { dataValue: '30 mins' },
                  { dataValue: '1 hour' },
                  { dataValue: '3 hours' },
                  { dataValue: '6 hours' },
                  { dataValue: '12 hours' },
                  { dataValue: '24 hours' },
                ]}
              />
            </div>
            <div className="well">
              <div className="InputFormContainer row">
                <div className="col-md-6 col-sm-6 col-xs-12">
                  <InputForm
                    isFormHighlighted={this.state.isFormHighlighted}
                    formCSSClasses="form-horizontal form-label-left input_mask"
                    formId="hours-input"
                    inputName="hours"
                    placeholder="2 Hours"
                    inputIcon="fa fa-clock-o"
                    onSubmitHandler={this.hoursFilterChange}
                  />
                </div>
                <div className="col-md-6 col-sm-6 col-xs-12">
                  <button className="btn" onClick={this.hoursFilterChange}>Apply</button>
                </div>
              </div>
              <ErrorMessage
                isMessageVisible={this.state.isErrorMessageVisible}
                msg="Error: Invalid input"
                CSSClasses="error"
              />
              <div className="clearfix" />
            </div>
            <div className="well toggle-graphs">
              <ButtonGroup
                containerAttrs={{ 'data-toggle': 'buttons' }}
                classesCSS="btn-group"
                onClickHandler={this.toggleGraphs}
                areMultipleActiveBtnsAllowed
                buttons={[{
                    classesCSS: 'btn-info active',
                    id: 'ask',
                    textValue: ['Ask ', <span key="0" className="glyphicon glyphicon-ok" />],
                  }, {
                    classesCSS: 'btn-danger active',
                    id: 'bid',
                    textValue: ['Bid ', <span key="1" className="glyphicon glyphicon-ok" />],
                  }, {
                    classesCSS: 'btn-success',
                    id: 'spread',
                    textValue: ['Spread ', <span key="2" className="glyphicon glyphicon-ok" />],
                  },
                ]}
              />
            </div>
          </div>
          <div className="col-md-6">
            <LineChart
              ref={(lineCharts) => { this.charts = lineCharts; }}
              hasErrorOccured={this.state.hasFetchFailed}
              model={this.props.model}
              graphId="ask-bid-spread"
            />
          </div>
        </section>
      </div>
    );
  }
}

CurrencyPairGraph.propTypes = {
  update: PropTypes.func,
  change: PropTypes.func,
  model: PropTypes.object,
};

export default CurrencyPairGraph;
