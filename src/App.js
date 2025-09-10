import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { Route, useLocation } from "react-router-dom";
import { CSSTransition } from "react-transition-group";

import { AppTopbar } from "./AppTopbar";
import { AppMenu } from "./AppMenu";

import { Dashboard } from "./pages/Dashboard";
import { EDPrediction } from "./pages/EDPrediction";
import Login from "./pages/Login";
import LoginNew from "./pages/LoginNew";
import Register from "./pages/Register";

import { Users } from "./pages/Users";
import { SystemParameters } from "./pages/SystemParameters";
import { PoliticalPartyManagement } from "./pages/PoliticalPartyManagement";
import { CandidateManagement } from "./pages/CandidateManagement";
import { CandidateReports } from "./pages/CandidateReports";
import { Events } from "./pages/Events";
import { EventGroup } from "./pages/EventGroup";
import { VoterAuditHistory } from "./pages/VoterAuditHistory";
import { VoterData } from "./pages/VoterData";
import { Objections } from "./pages/Objections";
import { DelimitationManagement } from "./pages/DelimitationManagement";
import { PoliticalPartyReports } from "./pages/PoliticalPartyReports";
import { Adjudication } from "./pages/Adjudication";

import PrimeReact from "primereact/api";
import { Tooltip } from "primereact/tooltip";

import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "prismjs/themes/prism-coy.css";
import "./assets/demo/flags/flags.css";
import "./assets/demo/Demos.scss";
import "./assets/layout/layout.scss";
import "./App.scss";
import { KitConfiguration } from "./pages/KitConfiguration";
import { UserGroups } from "./pages/UserGroups";
import Cookies from "js-cookie";
import VoterAllocationParams from "./pages/VoterAllocationParams";
import { AdministrationReports } from "./pages/AdministrationReports";
import { VoterReports } from "./pages/VoterReports";
import PredictionAPI from "./service/predictionAPI";

const App = () => {
    const [layoutMode, setLayoutMode] = useState("static");
    const [layoutColorMode, setLayoutColorMode] = useState("light");
    const [inputStyle, setInputStyle] = useState("outlined");
    const [ripple, setRipple] = useState(true);
    const [staticMenuInactive, setStaticMenuInactive] = useState(false);
    const [overlayMenuActive, setOverlayMenuActive] = useState(false);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false);
    const copyTooltipRef = useRef();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const predictionAPI = new PredictionAPI();

    PrimeReact.ripple = true;

    let menuClick = false;
    let mobileTopbarMenuClick = false;

    useEffect(() => {
        // Check authentication using the new API
        const checkAuth = () => {
            const isAuthenticated = predictionAPI.isAuthenticated();
            setIsLoggedIn(isAuthenticated);
            
            // Also update cookies for backward compatibility
            if (isAuthenticated) {
                Cookies.set("LoggedIn", true);
            } else {
                Cookies.set("LoggedIn", false);
            }
        };
        
        checkAuth();

        if (mobileMenuActive) {
            addClass(document.body, "body-overflow-hidden");
        } else {
            removeClass(document.body, "body-overflow-hidden");
        }
    }, [mobileMenuActive]);

    useEffect(() => {
        copyTooltipRef && copyTooltipRef.current && copyTooltipRef.current.updateTargetEvents();
    }, [location]);

    const onInputStyleChange = (inputStyle) => {
        setInputStyle(inputStyle);
    };

    const onRipple = (e) => {
        PrimeReact.ripple = e.value;
        setRipple(e.value);
    };

    const onLayoutModeChange = (mode) => {
        setLayoutMode(mode);
    };

    const onColorModeChange = (mode) => {
        setLayoutColorMode(mode);
    };

    const onWrapperClick = (event) => {
        if (!menuClick) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }

        if (!mobileTopbarMenuClick) {
            setMobileTopbarMenuActive(false);
        }

        mobileTopbarMenuClick = false;
        menuClick = false;
    };

    const onToggleMenuClick = (event) => {
        menuClick = true;

        if (isDesktop()) {
            if (layoutMode === "overlay") {
                if (mobileMenuActive === true) {
                    setOverlayMenuActive(true);
                }

                setOverlayMenuActive((prevState) => !prevState);
                setMobileMenuActive(false);
            } else if (layoutMode === "static") {
                setStaticMenuInactive((prevState) => !prevState);
            }
        } else {
            setMobileMenuActive((prevState) => !prevState);
        }

        event.preventDefault();
    };

    const onSidebarClick = () => {
        menuClick = true;
    };

    const onMobileTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        setMobileTopbarMenuActive((prevState) => !prevState);
        event.preventDefault();
    };

    const onMobileSubTopbarMenuClick = (event) => {
        mobileTopbarMenuClick = true;

        event.preventDefault();
    };

    const onMenuItemClick = (event) => {
        if (!event.item.items) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }
    };
    const isDesktop = () => {
        return window.innerWidth >= 992;
    };

    const menu = [
        {
            items: [
                // {
                //     label: "Dashboard",
                //     icon: "pi pi-fw pi-home",
                //     to: "/",
                // },
                {
                    label: "Emergency Triage",
                    icon: "pi pi-fw pi-home",
                    to: "/EDPrediction",
                },
                //     {
                //         label: "Administration",
                //         icon: "pi pi-fw pi-folder-open",
                //         items: [
                //             {
                //                 label: "Kit Configuration",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/kit-configuration",
                //             },
                //             {
                //                 label: "Voter Allocation Params",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/voter-allocation-params",
                //             },
                //             {
                //                 label: "User Management",
                //                 icon: "pi pi-fw pi-user-edit",
                //                 items: [
                //                     {
                //                         label: "Users",
                //                         icon: "pi pi-fw pi-bookmark",
                //                         to: "/users",
                //                     },
                //                     {
                //                         label: "User Groups",
                //                         icon: "pi pi-fw pi-bookmark",
                //                         to: "/user-groups",
                //                     },
                //                 ],
                //             },
                //             {
                //                 label: "System Parameters",
                //                 icon: "pi pi-fw pi-cog",
                //                 to: "/system-parameters",
                //             },
                //             {
                //                 label: "Delimitation Management",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/delimitation-management",
                //             },
                //         ],
                //     },

                //     {
                //         label: "Data Inspection",
                //         icon: "pi pi-fw pi-database",
                //         items: [
                //             {
                //                 label: "Voter Data",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/voter-data",
                //             },
                //             {
                //                 label: "Voter Audit History",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/voter-audit-history",
                //             },
                //         ],
                //     },
                //     {
                //         label: "Objection Management",
                //         icon: "pi pi-fw pi-database",
                //         items: [
                //             {
                //                 label: "Objections",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/objections",
                //             },
                //             {
                //                 label: "Adjudication",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/adjudication",
                //             },
                //         ],
                //     },
                //     {
                //         label: "Candidate Management",
                //         icon: "pi pi-fw pi-users",

                //         items: [
                //             {
                //                 label: "Candidates",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 items: [
                //                     {
                //                         label: "Management",
                //                         icon: "pi pi-fw pi-bookmark",
                //                         to: "/candidate-management",
                //                     },
                //                     {
                //                         label: "Reports",
                //                         icon: "pi pi-fw pi-bookmark",
                //                         to: "/candidate-reports",
                //                     },
                //                 ],
                //             },
                //         ],
                //     },
                //     {
                //         label: "Political Party Management",
                //         icon: "pi pi-fw pi-users",
                //         items: [
                //             {
                //                 label: "Political Parties",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 items: [
                //                     {
                //                         label: "Management",
                //                         icon: "pi pi-fw pi-bookmark",
                //                         to: "/political-party-management",
                //                     },
                //                     {
                //                         label: "Reports",
                //                         icon: "pi pi-fw pi-bookmark",
                //                         to: "/political-party-reports",
                //                     },
                //                 ],
                //             },
                //         ],
                //     },
                //     {
                //         label: "Register Management",
                //         icon: "pi pi-fw pi-clone",
                //         items: [
                //             {
                //                 label: "Event Group",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/event-group",
                //             },
                //             {
                //                 label: "Event",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/event",
                //             },
                //         ],
                //     },
                //     {
                //         label: "Reports",
                //         icon: "pi pi-fw pi-clone",
                //         items: [
                //             {
                //                 label: "Administration",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/administration-reports",
                //             },
                //             {
                //                 label: "Voter",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/voter-reports",
                //             },
                //             {
                //                 label: "Candidate",
                //                 icon: "pi pi-fw pi-bookmark",
                //                 to: "/candidate-reports",
                //             },
                //         ],
                //     },
            ],
        },
    ];

    const addClass = (element, className) => {
        if (element.classList) element.classList.add(className);
        else element.className += " " + className;
    };

    const removeClass = (element, className) => {
        if (element.classList) element.classList.remove(className);
        else element.className = element.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };

    const wrapperClass = classNames("layout-wrapper", {
        "layout-overlay": layoutMode === "overlay",
        "layout-static": layoutMode === "static",
        "layout-static-sidebar-inactive": staticMenuInactive && layoutMode === "static",
        "layout-overlay-sidebar-active": overlayMenuActive && layoutMode === "overlay",
        "layout-mobile-sidebar-active": mobileMenuActive,
        "p-input-filled": inputStyle === "filled",
        "p-ripple-disabled": ripple === false,
        "layout-theme-light": layoutColorMode === "light",
    });

    return (
        <div className={wrapperClass} onClick={onWrapperClick}>
            {isLoggedIn === false ? (
                <>
                    <Route path="/login" component={LoginNew} />
                    <Route path="/register" component={Register} />
                    <Route path="/" exact component={LoginNew} />
                    <Route path="*" component={LoginNew} />
                </>
            ) : (
                <>
                    <Tooltip ref={copyTooltipRef} target=".block-action-copy" position="bottom" content="Copied to clipboard" event="focus" />

                    <AppTopbar onToggleMenuClick={onToggleMenuClick} layoutColorMode={layoutColorMode} mobileTopbarMenuActive={mobileTopbarMenuActive} onMobileTopbarMenuClick={onMobileTopbarMenuClick} onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick} />
                    <div className="layout-sidebar" onClick={onSidebarClick}>
                        <AppMenu model={menu} onMenuItemClick={onMenuItemClick} layoutColorMode={layoutColorMode} />
                    </div>
                    <div className="layout-main-container">
                        <div className="layout-main">
                            <Route path="/" exact render={() => <Dashboard colorMode={layoutColorMode} />} />
                            <Route path="/users" component={Users} />
                            <Route path="/EDPrediction" component={EDPrediction} />
                            <Route path="/user-groups" component={UserGroups} />
                            <Route path="/kit-configuration" component={KitConfiguration} />
                            <Route path="/voter-allocation-params" component={VoterAllocationParams} />
                            <Route path="/system-parameters" component={SystemParameters} />
                            <Route path="/delimitation-management" component={DelimitationManagement} />
                            <Route path="/voter-data" component={VoterData} />
                            <Route path="/voter-audit-history" component={VoterAuditHistory} />
                            <Route path="/objections" component={Objections} />
                            <Route path="/political-party-management" component={PoliticalPartyManagement} />
                            <Route path="/political-party-reports" component={PoliticalPartyReports} />
                            <Route path="/candidate-management" component={CandidateManagement} />
                            <Route path="/candidate-reports" component={CandidateReports} />
                            <Route path="/event" component={Events} />
                            <Route path="/event-group" component={EventGroup} />
                            <Route path="/adjudication" component={Adjudication} />

                            <Route path="/administration-reports" component={AdministrationReports} />
                            <Route path="/voter-reports" component={VoterReports} />
                            <Route path="/candidate-reports" component={CandidateReports} />
                        </div>
                    </div>
                </>
            )}


            <CSSTransition classNames="layout-mask" timeout={{ enter: 200, exit: 200 }} in={mobileMenuActive} unmountOnExit>
                <div className="layout-mask p-component-overlay"></div>
            </CSSTransition>
        </div>
    );
};

export default App;
