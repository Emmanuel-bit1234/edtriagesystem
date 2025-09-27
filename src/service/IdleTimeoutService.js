class IdleTimeoutService {
    constructor() {
        this.idleTimeout = 3 * 60 * 1000; // 3 minutes in milliseconds
        this.warningTimeout = 30 * 1000; // 30 seconds warning before logout
        this.timers = {
            idle: null,
            warning: null
        };
        this.isIdle = false;
        this.isWarning = false;
        this.callbacks = {
            onIdle: null,
            onWarning: null,
            onLogout: null,
            onContinue: null
        };
        this.events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
            'keydown'
        ];
    }
    // Initialize the idle timeout service
    init(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
        this.reset();
        this.bindEvents();
    }

    // Bind activity events to reset the timer
    bindEvents() {
        this.events.forEach(event => {
            document.addEventListener(event, this.reset.bind(this), true);
        });
    }

    // Unbind activity events
    unbindEvents() {
        this.events.forEach(event => {
            document.removeEventListener(event, this.reset.bind(this), true);
        });
    }

    // Reset the idle timer
    reset() {
        // Don't reset if we're in warning mode - let the user decide
        if (this.isWarning) {
            return;
        }

        this.clearTimers();
        this.isIdle = false;

        // Set timer for idle detection
        this.timers.idle = setTimeout(() => {
            this.handleIdle();
        }, this.idleTimeout);
    }

    // Handle when user becomes idle
    handleIdle() {
        this.isIdle = true;
        this.isWarning = true;
        
        if (this.callbacks.onWarning) {
            this.callbacks.onWarning();
        }

        // Set timer for automatic logout
        this.timers.warning = setTimeout(() => {
            this.handleLogout();
        }, this.warningTimeout);
    }

    // Handle logout
    handleLogout() {
        this.clearTimers();
        this.isIdle = false;
        this.isWarning = false;
        
        if (this.callbacks.onLogout) {
            this.callbacks.onLogout();
        }
    }

    // Handle continue session
    continueSession() {
        this.clearTimers();
        this.isIdle = false;
        this.isWarning = false;
        
        if (this.callbacks.onContinue) {
            this.callbacks.onContinue();
        }

        // Reset the timer after a short delay to ensure clean state
        setTimeout(() => {
            this.reset();
        }, 100);
    }

    // Clear all timers
    clearTimers() {
        if (this.timers.idle) {
            clearTimeout(this.timers.idle);
            this.timers.idle = null;
        }
        if (this.timers.warning) {
            clearTimeout(this.timers.warning);
            this.timers.warning = null;
        }
    }

    // Get remaining warning time in seconds
    getWarningTimeRemaining() {
        if (!this.isWarning || !this.timers.warning) {
            return 0;
        }
        return Math.ceil(this.warningTimeout / 1000);
    }

    // Check if currently in warning state
    isInWarningState() {
        return this.isWarning;
    }

    // Check if currently idle
    isCurrentlyIdle() {
        return this.isIdle;
    }

    // Destroy the service
    destroy() {
        this.clearTimers();
        this.unbindEvents();
        this.isIdle = false;
        this.isWarning = false;
    }

    // Update timeout values
    updateTimeouts(idleTimeout, warningTimeout) {
        this.idleTimeout = idleTimeout;
        this.warningTimeout = warningTimeout;
    }
}

export default new IdleTimeoutService();
