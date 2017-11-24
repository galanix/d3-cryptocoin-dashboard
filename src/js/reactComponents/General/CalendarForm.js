import React from "react";

import flatpickr from "flatpickr";
import "flatpickr/dist/themes/material_green.css";

// HELPER FUNCTIONS
import { formProperDateFormat, createDateObj } from "../../helperFunctions";

export default class CalendarForm extends React.Component {   
  componentDidMount() {
    this.initCalendar();
    this.setState({
      icon: this.input.parentElement.querySelector('span')
    }, () => {
      this.state.icon.style.transition = 'border-color .15s linear';
      this.input.style.transition = 'border-color .15s linear';
    });

  }
  showError() {
    this.input.style.borderColor = '#c9302c';
    this.state.icon.style.borderColor = '#c9302c';
  }
  hideError() {
    this.input.style.borderColor = '#ccc';
    this.state.icon.style.borderColor = '#ccc';
  }
  initCalendar() {
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
      onChange(selectedDates, dateStr, instance) {        
        self.props.onWidgetChange({          
          selectedDates,
          dateStr,
          instance,
          inputId: this.input.getAttribute('id'),
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
                  <input
                    ref={input => this.input = input}
                    placeholder={this.props.placeholder}
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