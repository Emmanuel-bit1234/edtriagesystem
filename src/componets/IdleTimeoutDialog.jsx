import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';

const IdleTimeoutDialog = ({ visible, onContinue, onLogout, timeRemaining, totalTime }) => {
    const [countdown, setCountdown] = useState(timeRemaining);

    // Reset countdown when dialog becomes visible
    useEffect(() => {
        if (visible) {
            setCountdown(timeRemaining);
        }
    }, [visible, timeRemaining]);

    // Countdown timer
    useEffect(() => {
        if (visible) {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    console.log('Countdown:', prev - 1); // Debug log
                    if (prev <= 1) {
                        clearInterval(timer);
                        onLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [visible, onLogout]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressValue = totalTime > 0 ? ((totalTime - countdown) / totalTime) * 100 : 0;

    return (
        <Dialog
            header="Session Timeout Warning"
            visible={visible}
            style={{ width: '90vw', maxWidth: '450px' }}
            modal
            closable={false}
            className="p-fluid"
            onHide={() => {}} // Prevent closing by clicking outside or X
        >
            <div className="text-center">
                <div className="mb-4">
                    <i className="pi pi-clock text-4xl text-orange-500 mb-3"></i>
                    <h4 className="mb-3">Your session is about to expire</h4>
                    <p className="text-gray-600 mb-4">
                        You have been inactive for 3 minutes. Your session will expire in:
                    </p>
                </div>

                <div className="mb-4">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                        {formatTime(countdown)}
                    </div>
                    <ProgressBar 
                        value={progressValue} 
                        showValue={false}
                        style={{ height: '8px' }}
                        className="w-full"
                    />
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500">
                        Click "Continue Session" to stay logged in, or you will be automatically logged out.
                    </p>
                </div>

                <div className="flex justify-content-center">
                    <Button
                        label="Continue Session"
                        icon="pi pi-check"
                        onClick={onContinue}
                        className="p-button-success mr-3"
                        autoFocus
                    />
                    <Button
                        label="Log Out"
                        icon="pi pi-sign-out"
                        onClick={onLogout}
                        className="p-button-secondary"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default IdleTimeoutDialog;
