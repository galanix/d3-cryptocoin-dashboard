import React from 'react';

export default class InputForm extends React.Component {
  componentDidMount() {
    this.span.style.transition = 'border-color .15s linear';
    this.input.style.transition = 'border-color .15s linear';    
  }
  showError() {
    this.input.style.borderColor = '#c9302c';
    this.span.style.borderColor = '#c9302c';
  }
  hideError() {
    this.input.style.borderColor = '#ccc';
    this.span.style.borderColor = '#ccc';
  }
  handleSubmit(evt) {
    evt.preventDefault();

    if (typeof this.props.onSubmitHandler === 'function') {
      this.props.onSubmitHandler(evt);
    }
  }
  render() {
    return (      
      <form
        className={this.props.formCSSClasses}
        onSubmit={evt => this.handleSubmit(evt)}
      >
        <fieldset>
          <div className="control-group">
            <div className="controls">
              <div className="input-prepend input-group">                                                    
                <span 
                  className="add-on input-group-addon"
                  ref={span => this.span = span}
                >
                  <i className={this.props.inputIcon} aria-hidden="true"></i>
                </span>
                <input
                  ref={input => this.input = input}
                  id={this.props.id}
                  className="form-control"
                  type="text"
                  style={{"width" : "140px"}}
                  name={this.props.inputName}
                  placeholder={this.props.placeholder}                    
                />
                {this.props.children}
              </div>
            </div>
          </div>
        </fieldset>       
      </form>
    );
  }
}