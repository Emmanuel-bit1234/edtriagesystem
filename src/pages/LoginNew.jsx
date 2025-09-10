import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Image } from 'primereact/image';
import LesothoIcon from '../assets/images/ieclogos.png';
import Logo from '../assets/images/Logo.jpg';
import PredictionAPI from '../service/predictionAPI';
import './login/Login.scss';

const LoginNew = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const history = useHistory();
    const predictionAPI = new PredictionAPI();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await predictionAPI.login(email, password);
            toast.current.show({
                severity: 'success',
                summary: 'Login Successful',
                detail: 'Welcome back!'
            });
            // Redirect to main app
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Login Failed',
                detail: error.response?.data?.message || 'Please check your credentials and try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const goToRegister = () => {
        history.push('/register');
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="card-size">
                <div>
                    <div className="box p-fluid p-grid">
                        <div className="p-field p-col-12">
                            <img src={Logo} alt="Logo" className="logo" />
                        </div>
                        <div className="p-field p-col-12 hide-small">
                            <Divider layout="vertical" />
                        </div>

                        <div className="p-field p-col-12">
                            <h4>Login</h4>
                            <div className="Card">
                                <form onSubmit={handleLogin}>
                                    <div className="p-field my-3">
                                        <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
                                        <InputText
                                            id="email"
                                            value={email}
                                            type="email"
                                            className="p-inputtext-lg p-d-block"
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="off"
                                            data-form-type="other"
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                            data-bwignore="true"
                                            required
                                        />
                                    </div>
                                    <div className="p-field my-3">
                                        <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <InputText
                                                id="password"
                                                value={password}
                                                type={showPassword ? "text" : "password"}
                                                className="p-inputtext-lg p-d-block"
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                style={{ paddingRight: '40px' }}
                                            />
                                            <i 
                                                className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`}
                                                style={{ 
                                                    cursor: 'pointer',
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#6c757d'
                                                }}
                                                onClick={() => setShowPassword(!showPassword)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        className="p-button-lg p-mt-5"
                                        label={loading ? "Logging in..." : "Login"}
                                        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-unlock"}
                                        iconPos="right"
                                        type="submit"
                                        loading={loading}
                                        disabled={loading}
                                    />
                                </form>

                                <div className="p-mt-3 p-text-center">
                                    <p>Don't have an account? 
                                        <Button 
                                            label="Register here" 
                                            className="p-button-link p-ml-2" 
                                            onClick={goToRegister}
                                        />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginNew;
