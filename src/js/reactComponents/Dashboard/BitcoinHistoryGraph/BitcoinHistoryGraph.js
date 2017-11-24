import React from 'react';

// COMPONENTS
import Header from '../../General/Header';
import Dropdown from '../../General/Dropdown';
import CalendarForm from '../../General/CalendarForm';
import ButtonGroup from '../../General/ButtonGroup';
import LineChart from './children/LineChart';
import Message from '../../General/Message';

// HELPER FUNCTIONS
import { formProperDateFormat, scaleGraphSize } from '../../../helperFunctions';

export default class BitcoinHistoryGraph extends React.Component {
  constructor() {
    super();
    this.state = {
      componentToUpdate: 'BitcoinHistoryGraph',      
    };        

    this.createURL = this.createURL.bind(this);
    this.renderGraph = this.renderGraph.bind(this);
    this.timelineFilterChange = this.timelineFilterChange.bind(this);
    this.currencyFilterChange = this.currencyFilterChange.bind(this);
    this.onWidgetChange = this.onWidgetChange.bind(this);

  }
  componentDidMount() {
    this.hideErrorMsg();

    const { start, end } = this.props.model.filters;
    this.setState({
      startPlaceholder: 'From: ' + start,
      endPlaceholder: 'To: ' + end,
    });

    this.props.update(this.createURL(), this.state.componentToUpdate)
      .then(() => this.renderGraph(false))
      .catch(err => { console.warn('failed fetch', err) });
  }
  hideErrorMsg() {
    this.Message.hide();
  }
  showErrorMsg() {
    this.Message.show();  
  }
  createURL() {
    const { start, end, currency } = this.props.model.filters;
    const url = this.props.model.url;
    return url + `?start=${start}&end=${end}&currency=${currency}`;
  }
  renderGraph(componentIsUpdated) {
    if(!this.props.model.data) {
      return;
    }

    this.hideErrorMsg();

    // transforms a string into a Date object
    // create an array(dataset) from an object(data)
    const dataset = [];
    const data = this.props.model.data.bpi;
    Object.keys(data).forEach(key => {
      dataset.push({
        time: new Date(key),
        currencyValue: data[key]
      });
    });

    if(componentIsUpdated) this.chart.updateLine(dataset);
    else this.chart.buildLine(dataset);
  }
  saveChangesAndRerender(newFilterValue, filterName) {
    this.chart.showPreloader();
    this.props.change(newFilterValue, filterName, this.state.componentToUpdate)
    this.props.update(this.createURL(), this.state.componentToUpdate)
      .then(() => {
        this.renderGraph(true);
        this.chart.hidePreloader();
      })
      .catch(err => console.log(err));
  }
  timelineFilterChange(target) {
    if(target.tagName !== 'BUTTON') {
      return;
    }
    
    const btnValue = target.getAttribute('data-timeline'); // button value
    const today = new Date(); // endDate
    const startDate = new Date();
    let timeline; // each of 6 buttons fall under 3 periods
  
    switch(btnValue) {
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
        timeline ='less-than-3-month';
        break;
      case '1-week':
        startDate.setDate(startDate.getDate() - 7);
        timeline ='less-than-3-month';
        break;
      default:
        console.warn('unknown timeline: ', btnValue);
    }

    const filterNames = [ 'currentTimeline', 'start', 'end' ];    
    const startFilterValue = formProperDateFormat(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    const endFilterValue = formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate());    

    const newFilterValues = [
      timeline,
      startFilterValue,
      endFilterValue
    ];

    this.saveChangesAndRerender(newFilterValues, filterNames);

    this.setState({
      startPlaceholder: 'From: ' + startFilterValue,
      endPlaceholder: 'To: ' + endFilterValue,
    });
  }
  currencyFilterChange(target) {
    const newFilterValue = target.getAttribute('data-value');
    const filterName = 'currency';

    this.saveChangesAndRerender(newFilterValue, filterName)
  }
  onWidgetChange({ inputId, selectedDates, dateStr }) {
    let filterName;
    let startDate;
    let endDate;

    if(inputId === "start") {
      this.setState({
        startPlaceholder: "From: " + dateStr
      });

      filterName = "start";
      startDate = new Date(dateStr);
      endDate = new Date(this.props.model.filters.end);

    } else { // === end
      this.setState({
        endPlaceholder: "To: " + dateStr
      });

      filterName = "end";
      startDate = new Date(this.props.model.filters.start);
      endDate = new Date(dateStr);
    }

    if(endDate.getTime() > startDate.getTime()) {      

      let timeline;
      const monthDiff = endDate.getMonth() - startDate.getMonth();
      switch(monthDiff) {
        case 0: case 1: case 2: case 3:
          timeline = "less-than-3-month";
          break;

        default:
          timeline = "from-year-to-3-month";
      }
      const yearDiff = endDate.getFullYear() - startDate.getFullYear();
      if(yearDiff > 0) {
        timeline = "from-all-time-to-year";
      }
      
      const filterNames = [ "currentTimeline", filterName, ];
      const newFilterValues = [ timeline, dateStr, ];
      this.saveChangesAndRerender(newFilterValues, filterNames);

    } else {
      this.showErrorMsg();
    }

  }  
  render() {
    return (
      <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <section id="history" className="row x_panel">
          <Header
            classesCSS="col-md-12 col-sm-12 col-xs-12 x_title"
            titleText="Bitcoin History"
          />
          <div className="col-md-12 col-sm-12 col-xs-12">
            <Dropdown
              onClickHandler={this.currencyFilterChange}
              classesCSS={{
                container: "well",
                button: "btn-success"
              }}
              titleText="Currency"
              defaultDataValue={this.props.model.filters.currency}
              options={[
                { dataValue: "USD" },
                { dataValue: "EUR" },
                { dataValue: "RUB" },
                { dataValue: "UAH" },
              ]}
            />
            <div className="well" style={{ "overflow" : "auto"}}>
              <CalendarForm
                name="start" 
                id="start"                
                placeholder={this.state.startPlaceholder}                
                onWidgetChange={this.onWidgetChange}
              />
              <CalendarForm 
                name="end" 
                id="end"
                placeholder={this.state.endPlaceholder}                
                onWidgetChange={this.onWidgetChange}
              />
              <Message
                ref={Message => this.Message = Message}
                additionalClasses="error"
                msg="An error has occured..."
              />
            </div>
            <ButtonGroup 
              onClickHandler={this.timelineFilterChange}
              classesCSS="well btn-group full-width"                                 
              buttons={[
                { attrs: { "data-timeline": "all-time" },
                  classesCSS:"btn-success",
                  textValue: "All time"
                },
                { attrs: { "data-timeline": "1-year" },
                  classesCSS: "btn-success",
                  textValue: "Year"
                },
                { attrs: { "data-timeline": "6-month" },
                  classesCSS: "btn-success",
                  textValue: "6 months"
                },
                { attrs: { "data-timeline": "3-month" },
                  classesCSS: "btn-success",
                  textValue: "3 months"
                },
                { attrs: { "data-timeline": "1-month" },
                  classesCSS: "btn-success active",
                  textValue: "1 month"
                },
                { attrs: { "data-timeline": "1-week" },
                  classesCSS: "btn-success",
                  textValue: "week"
                },
              ]}
            />
          </div>
          <LineChart 
            ref={lineChart => this.chart = lineChart}
            model={this.props.model}
            signs={this.props.signs}
          />
        </section>
      </div>
    );
  }
};