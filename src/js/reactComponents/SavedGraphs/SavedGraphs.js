import React from 'react';
import { Link } from 'react-router-dom';

import Chart from '../Dashboard/CryptoBoard/children/children/Chart.js';
import PopUp from '../General/PopUp.js';

export default class SavedGraphs extends React.Component {
  constructor() {
    super();
    this.state = {
        componentToUpdate: 'SavedGraphs',        
        popUpId: "pop-up",        
    }
    this.confirmDeletion = this.confirmDeletion.bind(this);    
    this.selectChartForDeletion = this.selectChartForDeletion.bind(this);
  }
  componentDidMount() {
    this.updateGraphCollectionData();
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
  updateGraphCollectionData() {    
    const graphCollection = this.props.graphCollection;      

    if(graphCollection.length === 0) {
      return;  
    }
      

    // this is done to only make one request per different url
    /*
     {
       [url]: [ ...itemsThatHaveThisURL ]
     },
    */
    const updateDataset = {};
    graphCollection.forEach(item => {
      if(!updateDataset[item.url]) {
        updateDataset[item.url] = [];
      }
      updateDataset[item.url].push(item);
    });
    
    const urls = Object.keys(updateDataset);

    const fetchedData = urls.map(url => {
      return fetch(url)
        .then(res => res.json());
    });
        
    Promise.all(fetchedData)
      .then(results => {
        const newGraphCollection = [];
        urls.forEach((url, index) => {
          updateDataset[url].forEach(item => {            
            const ids = Object.keys(item.hashTable);
            const newGraphItem = JSON.parse(JSON.stringify(item));            
            ids.forEach(id => {
              newGraphItem.hashTable[id] = results[index].find(d => d.id === id);
              newGraphItem.hashTable[id].color = item.hashTable[id].color;
            });
            newGraphCollection.push(newGraphItem);
          });
        });
        this.props.update(null, this.state.componentToUpdate, newGraphCollection);        
      });
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
    const popUpId = this.state.popUpId;
    return (
      <section id="saved-graphs" className="row">
        <PopUp
          id={popUpId}
          headerText="Confirm Deletion"
          bodyText="Are you sure want to delete this chart item?"
          confirmAction={this.confirmDeletion}
        />
        { !!this.props.graphCollection && this.props.graphCollection.length !== 0 ?
          <div className="gallery col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3" onClick={this.selectChartForDeletion}>
            { this.props.graphCollection.map(item => (
                <div className="x_panel" key={item.id}>
                  <span
                    className="fa fa-times fa-2x"
                    data-id={item.id}
                    data-toggle="modal"
                    data-target={"#" + popUpId}
                  >
                  </span>
                  <Chart
                    hashTable={item.hashTable}
                    type={item.filters.type}
                    comparisionField={item.filters.comparisionField}
                    currentSign={item.currentSign}
                    margin={this.props.margin}
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