import React from 'react';
import { Link } from 'react-router-dom';

import Chart from '../Dashboard/CryptoBoard/children/children/Chart.js';
import PopUp from './children/PopUp.js';

export default class SavedGraphs extends React.Component {
  constructor() {
      super(); 
      this.state = {
          componentToUpdate: 'SavedGraphs'
      }
  }
  componentDidMount() {
      console.log(this.props);
  }
  deleteChart(e) {
    const target = e.target;
    if(target.tagName !== 'SPAN') return;

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
        { !!this.props.graphCollection && this.props.graphCollection.length !== 0 ?
          <div className="gallery col-md-8 col-md-offset-2" onClick={e => this.deleteChart(e)}>
            { this.props.graphCollection.map(item => (
                <div className="x_panel" key={item.id}>
                  <span className="fa fa-times fa-2x" data-id={item.id}></span>
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