import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Image } from 'primereact/image';
import Logo from '../assets/images/Logo.jpg';
import PredictionAPI from '../service/predictionAPI';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const history = useHistory();
    const predictionAPI = new PredictionAPI();

    useEffect(() => {
        // Add class to body to prevent scrolling
        document.body.classList.add('register-page');
        
        // Cleanup function to remove class when component unmounts
        return () => {
            document.body.classList.remove('register-page');
        };
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.current.show({
                severity: 'error',
                summary: 'Password Mismatch',
                detail: 'Passwords do not match. Please try again.'
            });
            return;
        }

        if (password.length < 6) {
            toast.current.show({
                severity: 'error',
                summary: 'Password Too Short',
                detail: 'Password must be at least 6 characters long.'
            });
            return;
        }

        setLoading(true);

        try {
            await predictionAPI.register(name, email, password);
            toast.current.show({
                severity: 'success',
                summary: 'Registration Successful',
                detail: 'Account created successfully! You can now login.'
            });
            // Redirect to login after successful registration
            setTimeout(() => {
                history.push('/login');
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Registration Failed',
                detail: error.response?.data?.message || 'Registration failed. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const goToLogin = () => {
        console.log('Navigating to login page...');
        history.push('/login');
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
                            <h4>Register</h4>
                            <div className="Card">
                                <form onSubmit={handleRegister}>
                                    <div className="p-field my-3">
                                        <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
                                        <InputText
                                            id="name"
                                            value={name}
                                            className="p-inputtext-lg p-d-block"
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
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
                                    <div className="p-field my-3">
                                        <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirm Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <InputText
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="p-inputtext-lg p-d-block"
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                style={{ paddingRight: '40px' }}
                                            />
                                            <i 
                                                className={`pi ${showConfirmPassword ? 'pi-eye-slash' : 'pi-eye'}`}
                                                style={{ 
                                                    cursor: 'pointer',
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#6c757d'
                                                }}
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        className="p-button-lg p-mt-5"
                                        label={loading ? "Creating Account..." : "Register"}
                                        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
                                        iconPos="right"
                                        type="submit"
                                        loading={loading}
                                        disabled={loading}
                                    />
                                </form>

                                <div className="p-mt-3 p-text-center">
                                    <p>Already have an account? 
                                        <a 
                                            href="#/login" 
                                            className="p-button-link p-ml-2" 
                                            style={{ textDecoration: 'none', color: '#007ad9', cursor: 'pointer' }}
                                        >
                                            Login here
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

export default Register;
