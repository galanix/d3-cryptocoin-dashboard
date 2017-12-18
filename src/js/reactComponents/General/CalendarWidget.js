import 'flatpickr/dist/themes/material_green.css';
import flatpickr from 'flatpickr';

import InputForm from './InputForm';

import { formProperDateFormat } from '../../helperFunctions';

// Inheritance inversion pattern

function CalendarWidgetHOC(BasicInputComponent) {
  return class CalendarWidget extends BasicInputComponent {
    componentDidMount() {
      this.initCalendar();
    }
    handleSubmit(evt) {
      this.submitInput(evt.target.value);
    }
    onChangeHandler(_selectedDates, dateStr) {
      this.submitInput(dateStr);
    }
    submitInput(dateStr) {
      this.props.onWidgetChange({
        dateStr,
        inputId: this.input.getAttribute('id'),
      });
      /*
        line below fixes a bug where some other filters(like button group of timelines)
        change the date
        but the value blocks placeholder that reflects this change and keeps the previous value
      */
      this.input.value = '';
    }
    initCalendar() {
      const currDate = new Date();

      flatpickr(this.input, {
        allowInput: true,
        enable: [
          {
            from: '2010-07-17',
            to: formProperDateFormat(
              currDate.getFullYear(),
              currDate.getMonth() + 1,
              currDate.getDate(),
            ),
          },
        ],
        onChange: this.onChangeHandler.bind(this),
      });
    }
    render() {
      return super.render();
    }
  };
}

export default CalendarWidgetHOC(InputForm);
