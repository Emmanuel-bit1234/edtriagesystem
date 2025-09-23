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
      emailError: '',
    }
    this.emailValidationTimeout = null;
  }

  // Email validation function
  validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Debounced email validation
  debouncedEmailValidation = (usernameValue) => {
    clearTimeout(this.emailValidationTimeout);
    this.emailValidationTimeout = setTimeout(() => {
      if (usernameValue && !this.validateEmail(usernameValue)) {
        this.setState({ emailError: 'Please enter a valid email address' });
      } else {
        this.setState({ emailError: '' });
      }
    }, 500); // Wait 500ms after user stops typing
  };

  // Handle username change with debounced validation
  handleUsernameChange = (e) => {
    const usernameValue = e.target.value;
    this.setState({ username: usernameValue });
    this.debouncedEmailValidation(usernameValue);
  };

  // Cleanup timeout on component unmount
  componentWillUnmount() {
    if (this.emailValidationTimeout) {
      clearTimeout(this.emailValidationTimeout);
    }
  }

  // Check if form is valid
  isFormValid = () => {
    return this.state.username.trim() !== '' && 
           this.validateEmail(this.state.username) && 
           this.state.password.trim() !== '';
  };

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
                      <label htmlFor="username">Username (Email)</label>
                      <InputText
                        id="username"
                        value={this.state.username}
                        type="email"
                        className={`p-inputtext-lg p-d-block p-mt-5 ${this.state.emailError ? 'p-invalid' : ''}`}
                        onChange={this.handleUsernameChange}
                      />
                      {this.state.emailError && (
                        <small className="p-error" style={{ color: '#e24c4c', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                          {this.state.emailError}
                        </small>
                      )}
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
                    disabled={!this.isFormValid()}
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
