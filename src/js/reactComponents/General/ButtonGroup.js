import React from 'react';
import PropTypes from 'prop-types';

class ButtonGroup extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  componentWillReceiveProps(newProps) {
    if (!newProps.isActiveBtnDisplayed) {
      if (!!this.state && !!this.state.activeBtn) {
        this.state.activeBtn.classList.remove('active');
        this.setState({
          activeBtn: null,
        });
      }
    }
  }
  componentDidMount() {
    if (this.props.isActiveBtnDisplayed) {
      this.setState({
        activeBtn: this.container.querySelector('.active'),
      });
    }
  }
  handleClick(evt) {
    let { target } = evt;

    if (target.tagName === 'SPAN' || target.tagName === 'I') {
      target = target.parentElement;
    }

    if (target.tagName !== 'BUTTON') {
      return;
    }

    if (!this.props.isActiveDisabled) {
    // we should deal with active(selected) class
    // if button group only allows one at a time
      if (
        !this.props.areMultipleActiveBtnsAllowed
        && (target !== this.state.activeBtn)
      ) {
        if (this.state.activeBtn) {
          this.state.activeBtn.classList.remove('active');
        }

        this.setState({
          activeBtn: target,
        }, () => this.state.activeBtn.classList.add('active'));
      }
    }

    this.props.onClickHandler(target);
  }
  render() {
    return (
      <div
        ref={(div) => { this.container = div; }}
        className={this.props.classesCSS}
        onClick={evt => this.handleClick(evt)}
        {...this.props.containerAttrs}
      >
        {this.props.buttons.map((btn, index) => (
          <button
            key={index}
            {...btn.attrs}
            className={`btn ${btn.classesCSS || ''}`}
            id={btn.id}
          >
            {btn.textValue}
          </button>
        ))}
      </div>
    );
  }
}

ButtonGroup.propTypes = {
  onClickHandler: PropTypes.func,
  areMultipleActiveBtnsAllowed: PropTypes.bool,
  isActiveBtnDisplayed: PropTypes.bool,
  buttons: PropTypes.array,
};

export default ButtonGroup;
