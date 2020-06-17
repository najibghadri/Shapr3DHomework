import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import {
  ThemeProvider,
  CSSReset,
  theme,
} from "@chakra-ui/core";

function delay(t, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
}
Promise.prototype.delay = function(t) {
  return this.then(function(v) {
      return delay(t, v);
  });
}

const customTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    brand: {
      900: "#00a7ff",
      800: "#e6faff",
      700: "#2a69ac",
    },
  },
  fonts: {
    heading:
    'San Francisco, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
    body:
    'San Francisco, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
    mono:
    'San Francisco, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
  },
  shadows: {
    outline: null,
  },

};

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={customTheme}>
      <CSSReset />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
