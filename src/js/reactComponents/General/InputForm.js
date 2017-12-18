import React from 'react';

export default class InputForm extends React.Component {
  constructor() {
    super();
    this.state = {
      errorColor: '#c9302c',
      normalColor: '#ccc',
    };
  }
  handleSubmit(evt) {
    evt.preventDefault();

    console.log(this.props.onSubmitHandler);
    if (typeof this.props.onSubmitHandler === 'function') {
      this.props.onSubmitHandler(evt);
    }
  }
  getBorderColor() {
    return this.props.isFormInputInvalid ?
      this.state.errorColor
      :
      this.state.normalColor;
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
                  style={{
                    borderColor: this.getBorderColor(),
                  }}
                >
                  <i className={this.props.inputIcon} aria-hidden="true" />
                </span>
                <input
                  ref={(input) => { this.input = input; }}
                  id={this.props.id}
                  className="form-control"
                  type="text"
                  style={{
                    width: '140px',
                    borderColor: this.getBorderColor(),
                  }}
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