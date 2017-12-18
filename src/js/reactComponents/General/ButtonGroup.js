import React from 'react';
import PropTypes from 'prop-types';

class ButtonGroup extends React.Component {
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
  handleClick(evt) {
    let { target } = evt;

    if (target.tagName === 'SPAN' || target.tagName === 'I') {
      target = target.parentElement;
    }

    if (target.tagName !== 'BUTTON') {
      return;
    }

    this.props.onClickHandler(target);

    if (this.props.isActiveDisabled) {
      return;
    }

    if (!this.state || !this.state.activeBtn) {
      this.setState({
        activeBtn: this.container.querySelector('.active'),
      }, () => this.changeSelectedBtn(target));
    } else {
      this.changeSelectedBtn(target);
    }
    // we should deal with active(selected) class
    // if button group only allows one at a time
  }
  changeSelectedBtn(target) {
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
