import React, { useCallback, useEffect, useRef, useState } from "react";
import { RadioButton } from "primereact/radiobutton";
import classNames from "classnames";
import { Button } from "primereact/button";

export const AppConfig = (props) => {
    const [active, setActive] = useState(false);
    const [scale, setScale] = useState(14);
    const [scales] = useState([12, 13, 14, 15, 16]);
    const [theme, setTheme] = useState("lara-light-indigo");
    const config = useRef(null);
    let outsideClickListener = useRef(null);

    const unbindOutsideClickListener = useCallback(() => {
        if (outsideClickListener.current) {
            document.removeEventListener("click", outsideClickListener.current);
            outsideClickListener.current = null;
        }
    }, []);

    const hideConfigurator = useCallback(
        (event) => {
            setActive(false);
            unbindOutsideClickListener();
            event.preventDefault();
        },
        [unbindOutsideClickListener]
    );

    const bindOutsideClickListener = useCallback(() => {
        if (!outsideClickListener.current) {
            outsideClickListener.current = (event) => {
                if (active && isOutsideClicked(event)) {
                    hideConfigurator(event);
                }
            };
            document.addEventListener("click", outsideClickListener.current);
        }
    }, [active, hideConfigurator]);

    useEffect(() => {
        if (active) {
            bindOutsideClickListener();
        } else {
            unbindOutsideClickListener();
        }
    }, [active, bindOutsideClickListener, unbindOutsideClickListener]);

    const isOutsideClicked = (event) => {
        return !(config.current.isSameNode(event.target) || config.current.contains(event.target));
    };

    const decrementScale = () => {
        setScale((prevState) => --prevState);
    };

    const incrementScale = () => {
        setScale((prevState) => ++prevState);
    };

    useEffect(() => {
        document.documentElement.style.fontSize = scale + "px";
    }, [scale]);

    const toggleConfigurator = (event) => {
        setActive((prevState) => !prevState);
    };

    const configClassName = classNames("layout-config", {
        "layout-config-active": active,
    });

    const replaceLink = useCallback((linkElement, href, callback) => {
        if (isIE()) {
            linkElement.setAttribute("href", href);

            if (callback) {
                callback();
            }
        } else {
            const id = linkElement.getAttribute("id");
            const cloneLinkElement = linkElement.cloneNode(true);

            cloneLinkElement.setAttribute("href", href);
            cloneLinkElement.setAttribute("id", id + "-clone");

            linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

            cloneLinkElement.addEventListener("load", () => {
                linkElement.remove();
                cloneLinkElement.setAttribute("id", id);

                if (callback) {
                    callback();
                }
            });
        }
    }, []);

    useEffect(() => {
        let themeElement = document.getElementById("theme-link");
        const themeHref = "assets/themes/" + theme + "/theme.css";
        replaceLink(themeElement, themeHref);
    }, [theme, replaceLink]);

    const isIE = () => {
        return /(MSIE|Trident\/|Edge\/)/i.test(window.navigator.userAgent);
    };

    const changeTheme = (e, theme, scheme) => {
        props.onColorModeChange(scheme);
        setTheme(theme);
    };

    return (
        <div ref={config} className={configClassName} id={"layout-config"}>
            <button className="layout-config-button p-link" id="layout-config-button" onClick={toggleConfigurator}>
                <i className="pi pi-cog"></i>
            </button>
            <Button className="p-button-danger layout-config-close p-button-rounded p-button-text" icon="pi pi-times" onClick={hideConfigurator} />

            <div className="layout-config-content">
                <h5 className="mt-0">Zoom:</h5>
                <div className="config-scale">
                    <Button icon="pi pi-minus" onClick={decrementScale} className="p-button-text" disabled={scale === scales[0]} />
                    {scales.map((item) => {
                        return <i className={classNames("pi pi-circle-on", { "scale-active": item === scale })} key={item} />;
                    })}
                    <Button icon="pi pi-plus" onClick={incrementScale} className="p-button-text" disabled={scale === scales[scales.length - 1]} />
                </div>

                <h5>Theme:</h5>
                <div className="p-formgroup-inline">
                    <div className="field-radiobutton">
                        <RadioButton inputId="input_outlined" name="inputstyle" onChange={(e) => changeTheme(e, "bootstrap4-dark-blue", "dark")} />
                        <label htmlFor="input_outlined">Dark</label>
                    </div>
                    <div className="field-radiobutton">
                        <RadioButton inputId="input_filled" name="inputstyle" onChange={(e) => changeTheme(e, "bootstrap4-light-blue", "light")} />
                        <label htmlFor="input_filled">Light</label>
                    </div>
                </div>
            </div>
        </div>
    );
};
