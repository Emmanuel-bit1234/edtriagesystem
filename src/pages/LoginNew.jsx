import React, { useState, useEffect, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import Logo from '../assets/images/Logo.jpg';
import PredictionAPI from '../service/predictionAPI';

const LoginNew = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const toast = useRef(null);
    const history = useHistory();
    const predictionAPI = new PredictionAPI();

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Debounced email validation
    const debouncedEmailValidation = useCallback((emailValue) => {
        const timeoutId = setTimeout(() => {
            if (emailValue && !validateEmail(emailValue)) {
                setEmailError('Please enter a valid email address');
            } else {
                setEmailError('');
            }
        }, 500); // Wait 500ms after user stops typing
        return () => clearTimeout(timeoutId);
    }, []);

    // Handle email change with debounced validation
    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        debouncedEmailValidation(emailValue);
    };

    // Check if form is valid
    const isFormValid = () => {
        return email.trim() !== '' && 
               validateEmail(email) && 
               password.trim() !== '';
    };

    useEffect(() => {
        // Add class to body to prevent scrolling
        document.body.classList.add('login-page');
        
        // Cleanup function to remove class when component unmounts
        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

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
            
            // Redirect to main app immediately
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
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

    // eslint-disable-next-line no-unused-vars
    const goToRegister = () => {
        // Check if we're already on register page
        if (window.location.hash === '#/register' || window.location.pathname === '/register') {
            return;
        }
        
        try {
            history.push('/register');
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback to window.location with hash
            window.location.href = '#/register';
        }
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
                                            className={`p-inputtext-lg p-d-block ${emailError ? 'p-invalid' : ''}`}
                                            onChange={handleEmailChange}
                                            autoComplete="off"
                                            data-form-type="other"
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                            data-bwignore="true"
                                            required
                                        />
                                        {emailError && (
                                            <small className="p-error" style={{ color: '#e24c4c', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                                                {emailError}
                                            </small>
                                        )}
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
                                        disabled={loading || !isFormValid()}
                                    />
                                </form>

                                <div className="p-mt-3 p-text-center">
                                    <p>Don't have an account? 
                                        <a 
                                            href="#/register" 
                                            className="p-button-link p-ml-2" 
                                            style={{ textDecoration: 'none', color: '#007ad9', cursor: 'pointer' }}
                                        >
                                            Register here
                                        </a>
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
