import React from "react";

import flatpickr from "flatpickr";
import "flatpickr/dist/themes/material_green.css";

// HELPER FUNCTIONS
import { formProperDateFormat, createDateObj } from "../../helperFunctions";

class CalendarForm extends React.Component {
    constructor() {
        super();
    }
    componentDidMount() {
        if(!this.state) {
            const end = new Date();
            const start = new Date(end.getFullYear(), end.getMonth() - 1, end.getDate());            
            this.setState({ start, end }, () => this.initCalendar());
        } else this.initCalendar();
    }
    initCalendar() {
        let filterName;
        if(this.input.getAttribute("id") === "start") {
            this.input.placeholder = "From: " + this.props.start;
            filterName = "start";
        }
        else {
            this.input.placeholder = "To: " + this.props.end;
            filterName = "end";
        }

        const self = this; // for onChange method
        const currDate = new Date();
        flatpickr(this.input, {
          allowInput: true,
          enable: [
            {
                from: "2010-07-17",
                to: formProperDateFormat(currDate.getFullYear(), currDate.getMonth() + 1, currDate.getDate())
            }
          ],
          onChange(_selectedDates, dateStr, instance) {            
            if(filterName === 'start') self.input.placeholder = 'From:' + dateStr;            
            else self.input.placeholder = 'To: ' + dateStr;

            self.setState({
                [filterName]: _selectedDates[0]
            }, () => {
                const startDate = self.state.start;
                const endDate = self.state.end;            
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
                  
                  const componentToUpdate = "BitcoinHistoryGraph";
                  const newFilterValue = dateStr;
                  const filterNames = [ "currentTimeline", filterName ];
                  const newFilterValues = [
                    timeline,
                    newFilterValue
                  ];
              
                  self.props.change(newFilterValues, filterNames, componentToUpdate);
                  self.props.update(self.props.createURL(), componentToUpdate)
                    .then(() => self.props.renderGraph(true));
                }
            });           
          }
        });        
    }
    render() {
        return  (
            <div className="col-md-6 col-sm-12 col-xs-12">
                <form className="calendar-date form-horizontal">
                    <fieldset>
                        <div className="control-group">
                            <div className="controls">
                                <div className="input-prepend input-group">                                                    
                                    <span className="add-on input-group-addon">
                                        <i className="glyphicon glyphicon-calendar fa fa-calendar"></i>
                                    </span>
                                    <input ref={input => this.input = input} 
                                           type="text"
                                           style={{"width" : "150px"}} 
                                           name={this.props.name} 
                                           id={this.props.id} 
                                           className="form-control" 
                                           value=""
                                     />
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </form>
            </div>
        );
    }
}

export default CalendarForm;