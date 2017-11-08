import React from 'react';
import { Link } from 'react-router-dom';

import Chart from '../Dashboard/CryptoBoard/children/children/Chart.js';
import PopUp from '../General/PopUp.js';

export default class SavedGraphs extends React.Component {
  constructor() {
    super();
    this.state = {
        componentToUpdate: 'SavedGraphs'
    }
    this.confirmDeletion = this.confirmDeletion.bind(this);    
    this.selectChartForDeletion = this.selectChartForDeletion.bind(this);
  }
  confirmDeletion(e) {
    const target = e.target;
    if(target.tagName !== 'BUTTON') return;

    const outcome = e.target.getAttribute('data-variant');

    switch(outcome) {
      case 'confirm':
        this.deleteChart();
        break;

      case 'cancel':
        this.setState({ target: null });
        break;

      default:
        console.warn('outcome switch defaulted with', outcome);
    }
  }
  selectChartForDeletion(e) {
    const target = e.target;
    if(target.tagName !== 'SPAN') return;

    this.setState({ target });
  }
  deleteChart() {
    const target = this.state.target;
    
    if(!target) return;

    const id = target.getAttribute('data-id');
    const index = this.props.graphCollection.reduce((res, item, index) => {
      if(item.id === id) {
        res = index;
      }
      return res;
    });

    // faking an item from graphCollection to prevent from searching 2 times
    // reducers.js only needs to know the index of an element for deletion

    const itemToDelete = {
      index,
      actionSubtype: 'delete',
    };
    
    this.props.update(null, this.state.componentToUpdate, itemToDelete);
  }  
  render() {
    return (
      <section id="saved-graphs" className="row">
        <PopUp
          headerText="Confirm Deletion"
          bodyText="Are you sure want to delete this chart item?"
          confirmAction={this.confirmDeletion}
        />
        { !!this.props.graphCollection && this.props.graphCollection.length !== 0 ?
          <div className="gallery col-md-8 col-md-offset-2" onClick={this.selectChartForDeletion}>
            { this.props.graphCollection.map(item => (
                <div className="x_panel" key={item.id}>
                  <span
                    className="fa fa-times fa-2x"
                    data-id={item.id}
                    data-toggle="modal"
                    data-target="#pop-up"
                  >
                  </span>
                  <Chart
                    hashTable={item.hashTable}
                    type={item.filters.type}
                    comparisionField={item.filters.comparisionField}
                    currentSign={item.currentSign}
                    immediateRender
                  />
                </div>
              ))
            }
          </div>
          :
          <p>
            You currently have no saved graphs.
            <Link to={this.props.linkToGraphCreation}>Create one</Link>
          </p> 
        }
      </section>
    );
  }
}