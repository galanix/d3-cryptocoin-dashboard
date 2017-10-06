import React from 'react';

const InputForm = props => (
    <form className="well form-horizontal form-label-left input_mask" id={props.formId}>
        <div className="col-md-6 col-sm-6 col-xs-12 form-group has-feedback">
            <input name={props.inputName} type="text" className="form-control has-feedback-left" placeholder={props.placeholder} />
            <span className={`${props.inputIcon} form-control-feedback left`} aria-hidden="true"></span>
        </div>
    </form>
);

export default InputForm;