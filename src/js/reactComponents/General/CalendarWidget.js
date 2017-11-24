import React from 'react';

import InputForm from './InputForm';

import flatpickr from "flatpickr";
import "flatpickr/dist/themes/material_green.css";

import { formProperDateFormat } from "../../helperFunctions";

// Inheritance inversion pattern

function CalendarWidgetHOC(BasicInputComponent) {
  return class CalendarWidget extends BasicInputComponent {
    componentDidMount() {
      this.initCalendar();
    }
    onChangeHandler(selectedDates, dateStr, instance) {
      this.props.onWidgetChange({
        selectedDates,
        dateStr,
        instance,
        inputId: this.input.getAttribute('id'),
      });
    }
    initCalendar() {
      const currDate = new Date();

      flatpickr(this.input, {
        allowInput: true,
        enable: [
          {
            from: "2010-07-17",
            to: formProperDateFormat(currDate.getFullYear(), currDate.getMonth() + 1, currDate.getDate())
          }
        ],
        onChange: this.onChangeHandler.bind(this)
      });
    }
    render() {
      return super.render();
    }
  }
}

export default CalendarWidgetHOC(InputForm);