import React from 'react';

export default  function InputForm(props) {
  return (
    <form className="well form-horizontal form-label-left input_mask" 
          id={props.formId}
          onSubmit={evt => props.onSubmitHandler(evt)}
    >
      <fieldset>
        <div className="control-group">
          <div className="controls">
            <div className="input-prepend input-group">                                                    
              <span className="add-on input-group-addon">
                <i className={props.inputIcon} aria-hidden="true"></i>
              </span>
              <input type="text" name={props.inputName} className="form-control" placeholder={props.placeholder} />
            </div>
          </div>
        </div>
      </fieldset>       
    </form>
  );
}