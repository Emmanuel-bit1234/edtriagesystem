import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import ScrollToTop from "./ScrollToTop";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
    <HashRouter>
        <ScrollToTop>
            <App />
        </ScrollToTop>
    </HashRouter>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
//serviceWorker.unregister();
