import React, { useState, useEffect, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import Logo from '../assets/images/Logo.jpg';
import PredictionAPI from '../service/predictionAPI';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Nurse');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [nameError, setNameError] = useState('');
    const toast = useRef(null);
    const history = useHistory();
    const predictionAPI = new PredictionAPI();

    // Available roles
    const roles = [
        { label: 'Nurse', value: 'Nurse' },
        { label: 'Doctor', value: 'Doctor' },
        { label: 'Admin', value: 'Admin' },
        { label: 'User', value: 'User' }
    ];

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Name validation function - check for "Admin" or similar names
    const validateName = (name) => {
        const adminVariations = [
            'admin', 'administrator', 'adm', 'admn', 'administrador',
            'admin1', 'admin2', 'admin3', 'admin123', 'admin1234',
            'admin_', '_admin', 'admin-', '-admin',
            'adminstrator', 'adminn', 'addmin', 'aadmin',
            'adm1', 'adm2', 'admn1', 'admn2',
            'superadmin', 'super-admin', 'super_admin',
            'sysadmin', 'sys-admin', 'sys_admin',
            'root', 'rootadmin',
            'adminadmin', 'admin admin',
            'imadmin', 'iadmin', 'madmin',
            'aradmin', 'adminr', 'admine'
        ];
        const lowerCaseName = name.toLowerCase().trim();
        return !adminVariations.includes(lowerCaseName);
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

    // Handle name change with validation
    const handleNameChange = (e) => {
        const nameValue = e.target.value;
        setName(nameValue);
        
        // Clear error when user starts typing
        if (nameError) {
            setNameError('');
        }
        
        // Real-time validation
        if (nameValue.trim() !== '' && !validateName(nameValue)) {
            setNameError('You cannot use this name');
        }
    };

    // Check if form is valid
    const isFormValid = () => {
        return name.trim() !== '' && 
               email.trim() !== '' && 
               validateEmail(email) && 
               password.length >= 6 && 
               confirmPassword.trim() !== '' && 
               password === confirmPassword;
    };

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
        
        // Validate name
        if (!validateName(name)) {
            setNameError('You cannot use this name');
            toast.current.show({
                severity: 'error',
                summary: 'Invalid Name',
                detail: 'You cannot use this name. Please choose a different name.'
            });
            return;
        } else {
            setNameError('');
        }
        
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
            await predictionAPI.register(name, email, password, role);
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
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.';
            toast.current.show({
                severity: 'error',
                summary: 'Registration Failed',
                detail: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line no-unused-vars
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
                                            className={`p-inputtext-lg p-d-block ${nameError ? 'p-invalid' : ''}`}
                                            onChange={handleNameChange}
                                            required
                                        />
                                        {nameError && (
                                            <small className="p-error" style={{ color: '#e24c4c', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                                                {nameError}
                                            </small>
                                        )}
                                    </div>
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
                                    <div className="p-field my-3">
                                        <label htmlFor="role" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Role</label>
                                        <Dropdown
                                            id="role"
                                            value={role}
                                            options={roles}
                                            onChange={(e) => setRole(e.value)}
                                            placeholder="Select a role"
                                            className="p-inputtext-lg p-d-block"
                                            style={{ width: '100%' }}
                                        />
                                        <small className="p-text-secondary" style={{ display: 'block', marginTop: '4px' }}>
                                            Defaults to Nurse if not specified
                                        </small>
                                    </div>

                                    <Button
                                        className="p-button-lg p-mt-5"
                                        label={loading ? "Creating Account..." : "Register"}
                                        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
                                        iconPos="right"
                                        type="submit"
                                        loading={loading}
                                        disabled={loading || !isFormValid()}
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
