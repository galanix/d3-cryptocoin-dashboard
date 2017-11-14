import React from "react";

export default class CurrencyBlock extends React.Component {
  constructor() {
    super();
    this.state = {
      blink: false,
    };
  }
  componentWillReceiveProps() {
    this.setState({
      blink: true,
      timeoutId: setTimeout(() => {
        if(!!this.div) {
          this.setState({ blink: false });
        }
      }, 3000)
    });
  }
  componentWillUnmount() {    
    clearTimeout(this.state.timeoutId);
  }
  render() {
    return  (
      <div ref={div => this.div = div} className={`${this.props.classesCSS} col-md-3 col-sm-6 col-xs-6 tile_stats_count`}>
        <span className="count_top">{this.props.text}</span>
        <div className={`count ${this.state.blink ? 'blinking' : ''}`}  dangerouslySetInnerHTML={{__html: this.props.sign + this.props.currencyValue}}></div>
        <span className="count_bottom">
          {this.props.renderChange()}
        </span>
      </div>
    );
  }
}