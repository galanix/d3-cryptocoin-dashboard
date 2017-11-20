import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

// COMPONENTS
import TopNav from './Navigation/TopNav';
import SideNav from './Navigation/SideNav';
import Dashboard from './Dashboard/Dashboard';
import Settings from './Settings/Settings';
import SavedGraphs from './SavedGraphs/SavedGraphs.js';

// EVENT DISPATCHERS
import { 
  handleDataRequest, 
  handleMultipleDataReqeuests 
} from "../reduxComponents/actions/update";
import { filterChange } from "../reduxComponents/actions/change";

// UI THEME EFFECTS
import templateScript from "../template"; // jQuery

// REDUX BOILIER PLATE
function mapStateToProps(state) {
  return {
    appData: state
  };
}
function mapDispatchToProps(dispatch) {
  return {
    update: (url, display, componentToUpdate) => dispatch(handleDataRequest(url, display, componentToUpdate)),
    updateAll: (urls, componentToUpdate, createDataCollection) => dispatch(handleMultipleDataReqeuests(urls, componentToUpdate, createDataCollection)),
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
    // routing
    const baseLocation = this.state.baseLocation;
    const mainPagePath = baseLocation;
    const settingsPagePath = baseLocation + "settings";
    const savedGraphsPagePath = baseLocation + "saved_graphs";

    return (
      <div className="main_container">
        <SideNav 
          mainPagePath={mainPagePath}
          settingsPagePath={settingsPagePath}
          savedGraphsPagePath={savedGraphsPagePath}
        />
        <TopNav />
        <div className="right_col" role="main">
          <Switch>
            <Route 
              exact path={mainPagePath}
              render={() => (
                <Dashboard
                  update={this.props.update.bind(this)}
                  change={this.props.change.bind(this)}
                  data={this.props.appData}                                                                                    
                />
              )}
            />
            <Route 
              path={settingsPagePath}
              render={() => (
                <Settings 
                  displayComponent={this.props.appData.settings.displayComponent}
                  change={this.props.change.bind(this)}
                />
              )}
            />
            <Route 
              path={savedGraphsPagePath}
              render={() => (
                <SavedGraphs 
                  update={this.props.update.bind(this)}
                  updateAll={this.props.updateAll.bind(this)}
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