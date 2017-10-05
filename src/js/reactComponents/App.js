import React from 'react';
import { Switch, Route } from 'react-router-dom';

import TopNav from './Navigation/TopNav';
import SideNav from './Navigation/SideNav';
import Dashboard from './Dashboard/Dashboard';
import Settings from './Settings/Settings';

const App = () => (
    <div className="main_container">
        <SideNav />
        <TopNav />
        <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/settings" component={Settings} />
        </Switch>
    </div>
);

export default App;