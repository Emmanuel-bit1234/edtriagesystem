import React from "react";
import { InputText } from "primereact/inputtext";
import "./login/Login.css";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { Divider } from "primereact/divider";
import LesothoIcon from "../assets/images/ieclogos.png";
import CoatOfArms from "../assets/images/FlagOfLesotho.png";
import { Button } from "primereact/button";
import AuthenticationService from "../service/AuthenticationService";
import { withRouter } from "react-router";
import { Toast } from "primereact/toast";
import Cookies from "js-cookie";
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            error: "",
        };
    }

    doLogin = async (event) => {
        event.preventDefault();
        AuthenticationService.signin(this.state.username, this.state.password).then(
            () => {
                Cookies.set("LoggedIn", true);
                this.props.history.push({
                    pathname: "/",
                    state: {
                        message: "Login was successful!",
                        success: true,
                        display: false,
                    },
                });
                window.location.reload();
            },
            (error) => {
                console.log("Login fail: error = { " + error.toString() + " }");
                this.setState({
                    error: "Please check your username / password and try again.",
                });

                this.toast.show({
                    severity: "error",
                    summary: "Login failed",
                    detail: this.state.error,
                });
            }
        );
    };
    render() {
        return (
            <div>
                <Toast ref={(el) => (this.toast = el)} />
                <div className="App App1">
                    <div className="content-section implementation" style={{ marginTop: "10rem" }}>
                        <Card className="p-shadow-14">
                            <div>
                                <div className="p-fluid p-grid">
                                    <div className="p-field p-col-12 p-md-5">
                                        <Image src={CoatOfArms} alt="Image" width="90%" />
                                    </div>
                                    <div className="p-field p-col-12 p-md-1">
                                        <Divider layout="vertical" />
                                    </div>

                                    <div className="p-field p-col-12 p-md-6">
                                        <h1 className="p-text-uppercase">Login</h1>
                                        <Image src={LesothoIcon} alt="Image" width="70%" />

                                        <div className="Card">
                                            <div className="p-field">
                                                <span className="p-float-label">
                                                    <InputText id="username" value={this.state.username} className="p-inputtext-lg p-d-block p-mt-5" onChange={(e) => this.setState({ username: e.target.value })} />
                                                    <label htmlFor="username">Username</label>
                                                </span>
                                            </div>
                                            <div className="p-field">
                                                <span className="p-float-label">
                                                    <InputText id="password" value={this.state.password} type="password" className="p-inputtext-lg p-d-block p-mt-5" onChange={(e) => this.setState({ password: e.target.value })} />
                                                    <label htmlFor="username">Password</label>
                                                </span>
                                            </div>

                                            <Button className="p-button-lg p-mt-5" label="Login" icon="pi pi-unlock" iconPos="right" onClick={this.doLogin} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
export default withRouter(Login);
