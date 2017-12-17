import React from 'react';

class Dropdown extends React.Component {
    constructor() {
        super();
    }
    componentDidMount() {
       this.setState({
          currentValue: this.container.querySelector('.value'),
          prevClickedA: this.container.querySelector('.active')
       }, () => {
           if(!!this.state.currentValue && !!this.state.prevClickedA) {
             this.state.currentValue.textContent = this.state.prevClickedA.textContent;
           }
       });     
    }
    handleClick(e) {
        const target = e.target;
        if(
            target.tagName !== 'A' ||
            target === this.state.prevClickedA
        ) return;
        
        this.state.prevClickedA.classList.remove('active');        
        this.setState({
            prevClickedA: target
        }, () => { 
            this.state.prevClickedA.classList.add('active')
            this.state.currentValue.textContent = target.textContent;
        });
        
        this.props.onClickHandler(target);
    }
  render() {
    return (
    <div className={`${this.props.classesCSS.container || ''} dropdown_container`}>
      <h4>{this.props.titleText}</h4>
      <div
        ref={div => this.container = div}
        className={`dropdown ${this.props.classesCSS.dropdown || ''}`}
        onClick={e => this.handleClick(e)}
      >
        <button 
          className={`btn ${this.props.classesCSS.button || ''} dropdown-toggle`}                    
          type="button"
          data-toggle="dropdown"
        >
          <span className="value"></span>
          <span className="caret"></span>
        </button>
        <ul className="dropdown-menu">
          {this.props.options.map((option, index) => (
            <li key={index}>
              <a 
                data-value={option.dataValue} 
                className={this.props.defaultDataValue === option.dataValue ? 'active' : ''}
              >
                {option.textValue || option.dataValue}
              </a>
            </li>
          ))}                
        </ul>
      </div>
    </div>
    );
  }
} 

export default Dropdown;