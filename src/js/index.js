import "../scss/index.scss";

import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";

import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";

import reducers from "./reduxComponents/reducers";
import App from "./reactComponents/App";

const store = createStore(reducers, applyMiddleware(thunk));

render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById("root")
);