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
import CoatOfArms from '../assets/images/FlagOfLesotho.png';
import PredictionAPI from '../service/predictionAPI';
import './login/Login.scss';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const history = useHistory();
    const predictionAPI = new PredictionAPI();

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
        history.push('/login');
    };

    return (
        <div>
            <Toast ref={toast} />
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
                            <h4>Register</h4>
                            <Image src={LesothoIcon} alt="Image" width="100%" />

                            <div className="Card">
                                <form onSubmit={handleRegister}>
                                    <div className="p-field my-3">
                                        <span className="p-float-label">
                                            <InputText
                                                id="name"
                                                value={name}
                                                className="p-inputtext-lg p-d-block p-mt-5"
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                            <label htmlFor="name">Full Name</label>
                                        </span>
                                    </div>
                                    <div className="p-field my-3">
                                        <span className="p-float-label">
                                            <InputText
                                                id="email"
                                                value={email}
                                                type="email"
                                                className="p-inputtext-lg p-d-block p-mt-5"
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            <label htmlFor="email">Email</label>
                                        </span>
                                    </div>
                                    <div className="p-field my-3">
                                        <span className="p-float-label">
                                            <InputText
                                                id="password"
                                                value={password}
                                                type="password"
                                                className="p-inputtext-lg p-d-block p-mt-5"
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <label htmlFor="password">Password</label>
                                        </span>
                                    </div>
                                    <div className="p-field my-3">
                                        <span className="p-float-label">
                                            <InputText
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                type="password"
                                                className="p-inputtext-lg p-d-block p-mt-5"
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                            <label htmlFor="confirmPassword">Confirm Password</label>
                                        </span>
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
                                        <Button 
                                            label="Login here" 
                                            className="p-button-link p-ml-2" 
                                            onClick={goToLogin}
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

export default Register;
