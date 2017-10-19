// STYLES
import "../scss/index.scss";

//  JQUERY & BOOTSTRAP
import $ from "jquery";
import "bootstrap";

// POLYFILLS
import "./polyfills/requestAnimationFrame";

// REACT
import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./reactComponents/App";

// REDUX
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import reducers from "./reduxComponents/reducers";

const store = createStore(reducers, applyMiddleware(thunk));

render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById("root")
);