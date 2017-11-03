import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import TopNav from './Navigation/TopNav';
import SideNav from './Navigation/SideNav';
import Dashboard from './Dashboard/Dashboard';
import Settings from './Settings/Settings';

import { dataRequest } from "../reduxComponents/actions/update";
import { filterChange } from "../reduxComponents/actions/change";

import templateScript from "../template"; // jQuery

const mapStateToProps = state => ({
    appData: state
});

const mapDispatchToProps = dispatch => ({
    update: (url, display, componentToUpdate) => dispatch(dataRequest(url, display, componentToUpdate)),
    change: (newFilterValue, filterName, componentToUpdate) => dispatch(filterChange(newFilterValue, filterName, componentToUpdate))
});

class App extends React.Component {   
    componentDidMount() {
        templateScript();        
    }
    render() {
        const locationPath = this.props.location.pathname || "/";
        return (
            <div className="main_container">
                <SideNav location={locationPath}/>
                <TopNav />
                <Switch>
                    <Route exact path={locationPath}
                           render={() => (
                               <Dashboard update={this.props.update.bind(this)} 
                                          change={this.props.change.bind(this)}
                                          data={this.props.appData}                                                                                    
                                />
                           )}
                    />
                    <Route path={`${locationPath}settings`}
                           render={() => (
                                <Settings displayComponent={this.props.appData.settings.displayComponent}
                                          change={this.props.change.bind(this)}
                                />
                            )}
                    />
                </Switch>
            </div>
        );
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));