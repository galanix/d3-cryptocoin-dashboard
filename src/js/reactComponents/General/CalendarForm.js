import React from 'react';

const CalendarForm = props => (
    <div className='col-md-6 col-sm-12 col-xs-12'>
        <form className='calendar-date form-horizontal'>
            <fieldset>
                <div className='control-group'>
                    <div className='controls'>
                        <div className='input-prepend input-group'>                                                    
                            <span className='add-on input-group-addon'><i className='glyphicon glyphicon-calendar fa fa-calendar'></i></span>
                            <input type='text' style={{'width' : '150px'}} name={props.name} id={props.id} className='form-control flatpickr-target' value='' />
                        </div>
                    </div>
                </div>
            </fieldset>                                   
        </form>
    </div>
);

export default CalendarForm;