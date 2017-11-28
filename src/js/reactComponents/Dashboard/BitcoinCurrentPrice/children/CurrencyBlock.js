import React from 'react';
import PropTypes from 'prop-types';

class CurrencyBlock extends React.Component {
  constructor() {
    super();
    this.state = {
      blink: false,
    };
  }
  componentWillReceiveProps() {
    this.setState({
      blink: true,
    });
    setTimeout(() => {
      if (this.div) {
        this.setState({ blink: false });
      }
    }, 3000);
  }
  render() {
    return (
      <div ref={(div) => { this.div = div; }} className={`${this.props.classesCSS} col-md-3 col-sm-6 col-xs-6 tile_stats_count`}>
        <span className="count_top">{this.props.text}</span>
        <div
          className={`count ${this.state.blink ? 'blinking' : ''}`}
          dangerouslySetInnerHTML={{ __html: this.props.sign + this.props.currencyValue }}
        />
        <span className="count_bottom">
          {this.props.renderChange()}
        </span>
      </div>
    );
  }
}

CurrencyBlock.propTypes = {
  renderChange: PropTypes.func,
  classesCSS: PropTypes.string,
  text: PropTypes.string,
  sign: PropTypes.string,
  currencyValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

export default CurrencyBlock;
