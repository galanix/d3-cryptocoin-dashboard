import React from 'react';
import PropTypes from 'prop-types';

// COMPONENTS
import Header from '../../General/Header';
import Dropdown from '../../General/Dropdown';
import CalendarWidget from '../../General/CalendarWidget';
import ButtonGroup from '../../General/ButtonGroup';
import LineChart from './children/AugmentedBasicLineChart';
// import Message from '../../General/Message';
import ErrorMessage from '../../General/ErrorMessage';

// HELPER FUNCTIONS
import { formProperDateFormat } from '../../../helperFunctions';

class BitcoinHistoryGraph extends React.Component {
  constructor() {
    super();
    this.state = {
      componentToUpdate: 'BitcoinHistoryGraph',
      isErrorMessageVisible: false,
      isActiveBtnDisplayed: !!(localStorage.getItem('isActiveBtnDisplayed')),
      hasFetchFailed: false,
      substanceForButtonGroup: [],
      isBtnGroupPadded: false,
    };

    this.createURL = this.createURL.bind(this);
    this.renderGraph = this.renderGraph.bind(this);
    this.timelineFilterChange = this.timelineFilterChange.bind(this);
    this.currencyFilterChange = this.currencyFilterChange.bind(this);
    this.onWidgetChange = this.onWidgetChange.bind(this);
    this.handleFetchError = this.handleFetchError.bind(this);
  }
  componentDidMount() {
    this.props.update(this.createURL(), this.state.componentToUpdate)
      .then(() => this.renderGraph(false))
      .catch(this.handleFetchError);

    this.provideButtonSubstance();

    window.addEventListener('resize', () => {
      this.provideButtonSubstance();
    });
  }
  showInputError() {
    this.setState({
      isErrorMessageVisible: true,
    });
  }
  hideInputError() {
    this.setState({
      isErrorMessageVisible: false,
    });
  }
  renderGraph(componentIsUpdated) {
    if (!this.props.model.data) {
      return;
    }

    // if request was not caught by .catch() immediately
    // and proceeded
    let hasFetchFailed = false;
    if (Object.keys(this.props.model.data.bpi).length === 0) {
      hasFetchFailed = true;
    }

    if (hasFetchFailed !== this.state.hasFetchFailed) {
      this.setState({
        hasFetchFailed,
      });
    }

    // if request did not fail
    // then data passed was legit
    // remove error from input element
    // that was from previous unsuccessful request
    this.hideInputError();

    // transforms a string into a Date object
    // create an array(dataset) from an object(data)
    const dataset = [];
    const data = this.props.model.data.bpi;
    Object.keys(data).forEach((key) => {
      dataset.push({
        time: new Date(key),
        currencyValue: data[key],
      });
    });

    if (componentIsUpdated) {
      this.chart.updateLine(dataset);
    } else {
      this.chart.buildLine(dataset);
    }
  }
  currencyFilterChange(target) {
    const newFilterValue = target.getAttribute('data-value');
    const filterName = 'currency';

    this.saveChangesAndRerender(newFilterValue, filterName);
  }
  onWidgetChange({ inputId, dateStr }) {
    let filterName;
    let startDate;
    let endDate;

    if (inputId === 'start') {
      filterName = 'start';
      startDate = new Date(dateStr);
      endDate = new Date(this.props.model.filters.end);
    } else { // === end
      filterName = 'end';
      startDate = new Date(this.props.model.filters.start);
      endDate = new Date(dateStr);
    }

    if (endDate.getTime() > startDate.getTime()) {
      let timeline;
      const monthDiff = endDate.getMonth() - startDate.getMonth();
      switch (monthDiff) {
        case 0: case 1: case 2: case 3:
          timeline = 'less-than-3-month';
          break;

        default:
          timeline = 'from-year-to-3-month';
      }
      const yearDiff = endDate.getFullYear() - startDate.getFullYear();
      if (yearDiff > 0) {
        timeline = 'from-all-time-to-year';
      }
      const filterNames = ['timeline', filterName];
      const newFilterValues = [timeline, dateStr];
      this.saveChangesAndRerender(newFilterValues, filterNames);
      this.setState({
        isActiveBtnDisplayed: false,
      }, () => {
        localStorage.setItem('isActiveBtnDisplayed', '');
      });
    } else {
      this.showInputError();
    }
  }
  timelineFilterChange(target) {
    if (target.tagName !== 'BUTTON') {
      return;
    }
    const btnTimelineValue = target.getAttribute('data-timeline'); // button value
    const today = new Date(); // endDate
    const startDate = new Date();
    let timeline; // each of 6 buttons fall under 3 periods
    switch (btnTimelineValue) {
      case 'all-time':
        startDate.setFullYear(2010);
        startDate.setMonth(7);
        startDate.setDate(17);
        timeline = 'from-all-time-to-year';
        break;
      case '1-year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        timeline = 'from-year-to-3-month';
        break;
      case '6-month':
        startDate.setMonth(startDate.getMonth() - 6);
        timeline = 'from-year-to-3-month';
        break;
      case '3-month':
        startDate.setMonth(startDate.getMonth() - 3);
        timeline = 'less-than-3-month';
        break;
      case '1-month':
        startDate.setMonth(startDate.getMonth() - 1);
        timeline = 'less-than-3-month';
        break;
      case '1-week':
        startDate.setDate(startDate.getDate() - 7);
        timeline = 'less-than-3-month';
        break;
      default:
        console.warn('unknown timeline: ', btnTimelineValue);
    }
    const filterNames = ['timeline', 'timelineBtnGroup', 'start', 'end'];
    const startFilterValue = formProperDateFormat(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
    );
    const endFilterValue = formProperDateFormat(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    );
    const newFilterValues = [
      timeline,
      btnTimelineValue,
      startFilterValue,
      endFilterValue,
    ];

    this.saveChangesAndRerender(newFilterValues, filterNames);
    this.setState({
      isActiveBtnDisplayed: true,
    }, () => {
      localStorage.setItem('isActiveBtnDisplayed', true);
    });
  }
  saveChangesAndRerender(newFilterValue, filterName) {
    this.chart.showMessage();
    this.props.change(newFilterValue, filterName, this.state.componentToUpdate);
    this.props.update(this.createURL(), this.state.componentToUpdate)
      .then(() => {
        this.renderGraph(true);
      })
      .catch(this.handleFetchError);
  }
  handleFetchError(err) {
    this.setState({
      hasFetchFailed: true,
    });
    console.log('failed fetch');
    console.warn(err);
  }
  createURL() {
    const { start, end, currency } = this.props.model.filters;
    const { url } = this.props.model;
    return `${url}?start=${start}&end=${end}&currency=${currency}`;
  }
  provideButtonSubstance() {
    if (!this.btnGroup) {
      return;
    }

    let additionalBtnClasses = 'btn btn-success';
    const timelineVal = this.state.isActiveBtnDisplayed ? this.props.model.filters.timelineBtnGroup : '';
    const btnGroupEl = this.btnGroup.container;
    if (parseInt(getComputedStyle(btnGroupEl).width, 10) < 417) {
      additionalBtnClasses += ' btn-sm';
      if (!this.state.isBtnGroupPadded) {
        btnGroupEl.style.paddingBottom = `${parseInt(getComputedStyle(btnGroupEl).paddingBottom, 10) + 5}px`;

        this.setState({
          isBtnGroupPadded: true,
        });
      }
    } else {
      if (this.state.isBtnGroupPadded) {
        btnGroupEl.style.paddingBottom = `${parseInt(getComputedStyle(btnGroupEl).paddingBottom, 10) - 5}px`;

        this.setState({
          isBtnGroupPadded: false,
        });
      }
    }

    this.setState({
      substanceForButtonGroup: [{
        attrs: { 'data-timeline': 'all-time' },
        classesCSS: `${additionalBtnClasses} ${timelineVal === 'all-time' ? 'active' : ''}`,
        textValue: 'All time',
      }, {
        attrs: { 'data-timeline': '1-year' },
        classesCSS: `${additionalBtnClasses} ${timelineVal === '1-year' ? 'active' : ''}`,
        textValue: 'Year',
      }, {
        attrs: { 'data-timeline': '6-month' },
        classesCSS: `${additionalBtnClasses} ${timelineVal === '6-month' ? 'active' : ''}`,
        textValue: '6 months',
      }, {
        attrs: { 'data-timeline': '3-month' },
        classesCSS: `${additionalBtnClasses} ${timelineVal === '3-month' ? 'active' : ''}`,
        textValue: '3 months',
      }, {
        attrs: { 'data-timeline': '1-month' },
        classesCSS: `${additionalBtnClasses} ${timelineVal === '1-month' ? 'active' : ''}`,
        textValue: '1 month',
      }, {
        attrs: { 'data-timeline': '1-week' },
        classesCSS: `${additionalBtnClasses} ${timelineVal === '1-week' ? 'active' : ''}`,
        textValue: 'week',
      }],
    });
  }
  render() {
    const startPlaceholder = `From: ${this.props.model.filters.start}`;
    const endPlaceholder = `To: ${this.props.model.filters.end}`;
    return (
      <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <section id="history" className="row x_panel">
          <Header
            classesCSS="col-md-12 col-sm-12 col-xs-12 x_title component-title"
            titleText="Bitcoin History"
          />

          <div className="col-md-12 col-sm-12 col-xs-12">
            <Dropdown
              onClickHandler={this.currencyFilterChange}
              classesCSS={{
                container: 'well',
                button: 'btn-success',
              }}
              titleText="Currency"
              defaultDataValue={this.props.model.filters.currency}
              options={[
                { dataValue: 'USD' },
                { dataValue: 'EUR' },
                { dataValue: 'RUB' },
                { dataValue: 'UAH' },
              ]}
            />

            <div className="well">
              <div className="InputFormContainer row">
                <div className="row">
                  <div className="col-xs-6 calendar-wrapper">
                    <CalendarWidget
                      formCSSClasses="calendar-date form-horizontal"
                      name="start"
                      id="start"
                      inputIcon="fa fa-calendar"
                      placeholder={startPlaceholder}
                      onWidgetChange={this.onWidgetChange}
                      isFormInputInvalid={this.state.isErrorMessageVisible}
                    />
                  </div>
                  <div className="col-xs-6 calendar-wrapper">
                    <CalendarWidget
                      formCSSClasses="calendar-date form-horizontal"
                      name="end"
                      id="end"
                      inputIcon="fa fa-calendar"
                      placeholder={endPlaceholder}
                      onWidgetChange={this.onWidgetChange}
                      isFormInputInvalid={this.state.isErrorMessageVisible}
                    />
                  </div>
                </div>
                <ErrorMessage
                  isMessageVisible={this.state.isErrorMessageVisible}
                  CSSClasses="error"
                  msg="Error: Invalid input"
                />
              </div>
              <div className="clearfix" />
            </div>

            <ButtonGroup
              ref={(btnGroup) => { this.btnGroup = btnGroup; }}
              onClickHandler={this.timelineFilterChange}
              classesCSS="well btn-group full-width"
              isActiveBtnDisplayed={this.state.isActiveBtnDisplayed}
              buttons={this.state.substanceForButtonGroup}
            />
          </div>

          <div className="col-lg-12 col-md-12 col-sm-12 graph-container">
            <LineChart
              ref={(lineChart) => { this.chart = lineChart; }}
              hasErrorOccured={this.state.hasFetchFailed}
              model={this.props.model}
              signs={this.props.signs}
              graphId="historical-data"
            />
          </div>
        </section>
      </div>
    );
  }
}

BitcoinHistoryGraph.propTypes = {
  update: PropTypes.func,
  change: PropTypes.func,
  model: PropTypes.object,
  signs: PropTypes.object,
};

export default BitcoinHistoryGraph;
