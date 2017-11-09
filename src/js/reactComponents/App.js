import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import TopNav from './Navigation/TopNav';
import SideNav from './Navigation/SideNav';
import Dashboard from './Dashboard/Dashboard';
import Settings from './Settings/Settings';
import SavedGraphs from './SavedGraphs/SavedGraphs.js';

import { dataRequest } from "../reduxComponents/actions/update";
import { filterChange } from "../reduxComponents/actions/change";

import templateScript from "../template"; // jQuery

function mapStateToProps(state) {
  return {
    appData: state
  };
}

function mapDispatchToProps(dispatch) {
  return {
    update: (url, display, componentToUpdate) => dispatch(dataRequest(url, display, componentToUpdate)),
    change: (newFilterValue, filterName, componentToUpdate) => dispatch(filterChange(newFilterValue, filterName, componentToUpdate))
  };
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      baseLocation: "/"
    };    
  }
  componentDidMount() {
    templateScript();        
    this.setState({
      baseLocation: this.props.location.pathname
    });
  }
  render() {
    const locationPath = this.props.location.pathname || "/";
    const baseLocation = this.state.baseLocation;
    const mainPagePath = baseLocation;
    const settingsPagePath = baseLocation + "settings";
    const savedGraphsPagePath = baseLocation + "saved_graphs";

    return (
      <div className="main_container">
        <SideNav mainPagePath={mainPagePath}
                 settingsPagePath={settingsPagePath}
                 savedGraphsPagePath={savedGraphsPagePath}
        />
        <TopNav />
        <div className="right_col" role="main">
          <Switch>
            <Route exact path={mainPagePath}
                  render={() => (
                    <Dashboard
                      update={this.props.update.bind(this)}
                      change={this.props.change.bind(this)}
                      data={this.props.appData}                                                                                    
                    />
                  )}
            />
            <Route path={settingsPagePath}
                  render={() => (
                    <Settings 
                      displayComponent={this.props.appData.settings.displayComponent}
                      change={this.props.change.bind(this)}
                    />
                  )}
            />
            <Route path={savedGraphsPagePath}
                  render={() => (
                    <SavedGraphs 
                      update={this.props.update.bind(this)}
                      linkToGraphCreation={mainPagePath}
                      graphCollection={this.props.appData.savedGraphs}
                      margin={this.props.appData.cryptoBoard.chart.margin}                      
                    />
                  )}
            />
          </Switch>
        </div>
      </div>
    );
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));