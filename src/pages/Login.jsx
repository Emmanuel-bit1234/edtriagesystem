import React from 'react'
import { InputText } from 'primereact/inputtext'
import { Card } from 'primereact/card'
import { Image } from 'primereact/image'
import { Divider } from 'primereact/divider'
import LesothoIcon from '../assets/images/ieclogos.png'
import CoatOfArms from '../assets/images/FlagOfLesotho.png'
import { Button } from 'primereact/button'
import AuthenticationService from '../service/AuthenticationService'
import { withRouter } from 'react-router'
import { Toast } from 'primereact/toast'
import Cookies from 'js-cookie'
class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      error: '',
    }
  }

  doLogin = async (event) => {
    event.preventDefault()
    AuthenticationService.signin(this.state.username, this.state.password).then(
      () => {
        Cookies.set('LoggedIn', true)
        this.props.history.push({
          pathname: '/',
          state: {
            message: 'Login was successful!',
            success: true,
            display: false,
          },
        })
        window.location.reload()
      },
      (error) => {
        this.setState({
          error: 'Please check your username / password and try again.',
        })

        this.toast.show({
          severity: 'error',
          summary: 'Login failed',
          detail: this.state.error,
        })
      },
    )
  }
  render() {
    return (
      <div>
        <Toast ref={(el) => (this.toast = el)} />

        <div className="card-size">
          <div>
            <div className="box p-fluid p-grid">
              <div className="p-field p-col-12">
                <img src={CoatOfArms} alt="Image" className="logo" />
              </div>
              <div className="p-field p-col-12 hide-small">
                <Divider layout="vertical" />
              </div>

              <div className="p-field p-col-12">
                <h4>Login</h4>
                <Image src={LesothoIcon} alt="Image" width="100%" />

                <div className="Card">
                  <div className="p-field my-3">
                    <span className="p-float-labe">
                      <label htmlFor="username">Username</label>
                      <InputText
                        id="username"
                        value={this.state.username}
                        className="p-inputtext-lg p-d-block p-mt-5"
                        onChange={(e) =>
                          this.setState({ username: e.target.value })
                        }
                      />
                      {/* <label htmlFor="username">Username</label> */}
                    </span>
                  </div>
                  <div className="p-field my-3">
                    <span className="p-float-labe">
                      <label htmlFor="username">Password</label>
                      <InputText
                        id="password"
                        value={this.state.password}
                        type="password"
                        className="p-inputtext-lg p-d-block p-mt-5"
                        onChange={(e) =>
                          this.setState({ password: e.target.value })
                        }
                      />
                      {/* <label htmlFor="username">Password</label> */}
                    </span>
                  </div>

                  <Button
                    className="p-button-lg p-mt-5"
                    label="Login"
                    icon="pi pi-unlock"
                    iconPos="right"
                    onClick={this.doLogin}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default withRouter(Login)
