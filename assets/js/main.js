// Main JavaScript for Boat Show Landing Page
// Version 2.0 - Optimized for conversions and membership funneling

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        exitIntentEnabled: true,
        exitIntentDelay: 5000, // 5 seconds before exit intent can trigger
        scrollTrackingEnabled: true,
        formValidationEnabled: true,
        socialProofAnimation: true,
        membershipUpsellEnabled: true
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeFormHandling();
        initializeExitIntent();
        initializeScrollAnimations();
        initializeUTMTracking();
        initializeAnalytics();
        initializeFormCard3D();
        initializeSocialProof();
        initializeMembershipTeaser();
        
        console.log('🚤 Boat Smart landing page initialized');
    });

    // Enhanced Form Handling with Conversion Optimization
    function initializeFormHandling() {
        const form = document.getElementById('leadForm');
        const submitBtn = document.getElementById('submitBtn');
        
        if (!form || !submitBtn) return;

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        form.addEventListener('submit', function(e) {
            // Show loading state immediately
            if (btnText && btnLoading) {
                btnText.style.display = 'none';
                btnLoading.style.display = 'flex';
                submitBtn.disabled = true;
            }

            // Track form submission attempt
            trackEvent('form_submit_attempt', {
                form_name: 'boat_show_guide',
                boat_interest: document.getElementById('boatType').value
            });

            // Get form data for tracking
            const formData = new FormData(form);
            trackFormSubmission(formData);

            // If using GitHub Pages demo (action contains thank-you.html)
            if (form.action.includes('thank-you.html')) {
                e.preventDefault();
                
                // Simulate processing time for better UX
                setTimeout(() => {
                    const firstName = formData.get('first_name') || formData.get('firstName');
                    const email = formData.get('email_address') || formData.get('email');
                    const boatType = formData.get('boat_type') || formData.get('boatType');
                    
                    // Build redirect URL with parameters
                    const params = new URLSearchParams({
                        first_name: firstName || '',
                        email: email || '',
                        boat_type: boatType || '',
                        source: 'landing_page'
                    });
                    
                    window.location.href = `./thank-you.html?${params.toString()}`;
                }, 1500);
                
                return;
            }

            // For production with real email platform, form will submit normally
            // Reset button state after 3 seconds if still on page (error handling)
            setTimeout(() => {
                if (btnText && btnLoading && submitBtn) {
                    btnText.style.display = 'inline';
                    btnLoading.style.display = 'none';
                    submitBtn.disabled = false;
                }
            }, 5000);
        });

        // Real-time form validation
        const emailInput = document.getElementById('email');
        const firstNameInput = document.getElementById('firstName');
        const boatTypeSelect = document.getElementById('boatType');

        if (emailInput) {
            emailInput.addEventListener('blur', () => validateEmail(emailInput));
            emailInput.addEventListener('focus', () => trackEvent('email_field_focus'));
        }

        if (firstNameInput) {
            firstNameInput.addEventListener('blur', () => validateName(firstNameInput));
            firstNameInput.addEventListener('focus', () => trackEvent('name_field_focus'));
        }

        if (boatTypeSelect) {
            boatTypeSelect.addEventListener('change', function() {
                trackEvent('boat_type_selected', { 
                    boat_type: this.value 
                });
            });
        }

        // Form field interaction tracking
        const formFields = form.querySelectorAll('input, select');
        formFields.forEach(field => {
            field.addEventListener('focus', function() {
                trackEvent('form_field_interaction', {
                    field_name: this.name || this.id,
                    field_type: this.type || this.tagName.toLowerCase()
                });
            });
        });
    }

    // Enhanced Form Validation with UX improvements
    function validateEmail(input) {
        if (!input || !input.value) return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(input.value.trim());
        
        // Remove any existing validation messages
        hideValidationMessage(input);
        
        if (!isValid && input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            input.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.1)';
            showValidationMessage(input, 'Please enter a valid email address');
            
            trackEvent('form_validation_error', {
                field: 'email',
                error: 'invalid_format'
            });
        } else if (isValid) {
            input.style.borderColor = '#10b981';
            input.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
            
            trackEvent('form_validation_success', {
                field: 'email'
            });
        } else {
            // Reset to default
            input.style.borderColor = '#e1e5e9';
            input.style.boxShadow = 'none';
        }
        
        return isValid;
    }

    function validateName(input) {
        if (!input || !input.value) return false;
        
        const isValid = input.value.trim().length >= 2;
        const hasNumbers = /\d/.test(input.value);
        
        hideValidationMessage(input);
        
        if (!isValid && input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            showValidationMessage(input, 'Name must be at least 2 characters');
        } else if (hasNumbers) {
            input.style.borderColor = '#f59e0b';
            showValidationMessage(input, 'Name should not contain numbers');
        } else if (isValid && !hasNumbers) {
            input.style.borderColor = '#10b981';
            hideValidationMessage(input);
        } else {
            input.style.borderColor = '#e1e5e9';
        }
        
        return isValid && !hasNumbers;
    }

    function showValidationMessage(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #e74c3c; 
            font-size: 0.85rem; 
            margin-top: 5px; 
            animation: slideDown 0.3s ease;
        `;
        
        input.parentNode.appendChild(errorDiv);
    }

    function hideValidationMessage(input) {
        const existingError = input.parentNode.querySelector('.validation-error');
        if (existingError) {
            existingError.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => existingError.remove(), 300);
        }
    }

    // Advanced Exit Intent with Smart Timing
    function initializeExitIntent() {
        if (!CONFIG.exitIntentEnabled) return;

        const modal = document.getElementById('exitIntentModal');
        const closeBtn = modal?.querySelector('.close');
        const miniForm = modal?.querySelector('.mini-form');
        
        let exitIntentTriggered = false;
        let pageLoadTime = Date.now();
        let userEngaged = false;

        // Track user engagement
        setTimeout(() => { userEngaged = true; }, CONFIG.exitIntentDelay);

        // Detect exit intent
        document.addEventListener('mouseleave', function(e) {
            // Only trigger on desktop, near top of page, after engagement time
            if (e.clientY < 50 && 
                !exitIntentTriggered && 
                window.innerWidth > 768 &&
                userEngaged &&
                (Date.now() - pageLoadTime) > CONFIG.exitIntentDelay) {
                
                showExitIntentModal();
                exitIntentTriggered = true;
            }
        });

        // Mobile exit intent (scroll up quickly)
        let lastScrollY = window.scrollY;
        let scrollUpCount = 0;
        
        window.addEventListener('scroll', throttle(() => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY < lastScrollY && currentScrollY < 200) {
                scrollUpCount++;
                if (scrollUpCount >= 3 && !exitIntentTriggered && userEngaged && window.innerWidth <= 768) {
                    showExitIntentModal();
                    exitIntentTriggered = true;
                }
            } else {
                scrollUpCount = 0;
            }
            
            lastScrollY = currentScrollY;
        }, 100));

        // Close modal handlers
        if (closeBtn) {
            closeBtn.addEventListener('click', hideExitIntentModal);
        }

        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) hideExitIntentModal();
            });
        }

        // Escape key close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                hideExitIntentModal();
            }
        });

        // Mini form submission
        if (miniForm) {
            miniForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput?.value;
                
                if (!email || !validateEmail(emailInput)) {
                    showValidationMessage(emailInput, 'Please enter a valid email');
                    return;
                }

                // Track exit intent conversion
                trackExitIntentSignup(email);
                
                // Show success state
                const submitBtn = this.querySelector('button');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = '✅ Redirecting...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    window.location.href = `./thank-you.html?email=${encodeURIComponent(email)}&source=exit_intent`;
                }, 1000);
            });
        }

        function showExitIntentModal() {
            if (!modal) return;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                modal.style.opacity = '1';
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.transform = 'translateY(0) scale(1)';
                }
            }, 10);
            
            trackEvent('exit_intent_shown', {
                time_on_page: Math.round((Date.now() - pageLoadTime) / 1000)
            });
        }

        function hideExitIntentModal() {
            if (!modal) return;
            
            modal.style.opacity = '0';
            document.body.style.overflow = 'auto';
            
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.transform = 'translateY(-20px) scale(0.95)';
            }
            
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            
            trackEvent('exit_intent_dismissed');
        }
    }

    // Advanced Scroll Animations with Performance Optimization
    function initializeScrollAnimations() {
        if (!CONFIG.scrollTrackingEnabled) return;

        const animatedElements = document.querySelectorAll('.benefits li, .stats span, .testimonial, .form-card');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Add staggered animation delay
                    const delay = Array.from(element.parentNode.children).indexOf(element) * 100;
                    
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0) scale(1)';
                        element.classList.add('animated');
                    }, delay);

                    // Track element visibility
                    trackEvent('element_viewed', {
                        element_type: element.className,
                        element_text: element.textContent.substring(0, 50)
                    });

                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        animatedElements.forEach(function(element) {
            // Set initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px) scale(0.95)';
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            observer.observe(element);
        });
    }

    // UTM Parameter Tracking and Attribution
    function initializeUTMTracking() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Capture UTM parameters
        const utmData = {
            source: urlParams.get('utm_source'),
            medium: urlParams.get('utm_medium'),
            campaign: urlParams.get('utm_campaign'),
            term: urlParams.get('utm_term'),
            content: urlParams.get('utm_content')
        };

        // Store in hidden form fields
        Object.keys(utmData).forEach(key => {
            const field = document.getElementById(`utm${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (field && utmData[key]) {
                field.value = utmData[key];
            }
        });

        // Store in localStorage for cross-session tracking
        if (Object.values(utmData).some(val => val)) {
            localStorage.setItem('attribution_data', JSON.stringify({
                ...utmData,
                landing_page: window.location.href,
                timestamp: Date.now(),
                session_id: generateSessionId()
            }));

            trackEvent('utm_parameters_captured', utmData);
        }

        // Track referrer information
        if (document.referrer) {
            trackEvent('referrer_tracked', {
                referrer: document.referrer,
                referrer_domain: new URL(document.referrer).hostname
            });
        }
    }

    // Enhanced Analytics with User Journey Tracking
    function initializeAnalytics() {
        let startTime = Date.now();
        let maxScroll = 0;
        let scrollMilestones = [25, 50, 75, 90];
        let reachedMilestones = [];
        let timeOnPageTracked = [30, 60, 120, 300]; // seconds
        let trackedTimes = [];

        // Scroll depth tracking
        window.addEventListener('scroll', throttle(function() {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            maxScroll = Math.max(maxScroll, scrollPercent);

            // Track scroll milestones
            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && !reachedMilestones.includes(milestone)) {
                    reachedMilestones.push(milestone);
                    trackEvent('scroll_milestone', {
                        milestone: milestone,
                        time_to_milestone: Math.round((Date.now() - startTime) / 1000)
                    });
                }
            });
        }, 250));

        // Time on page tracking
        timeOnPageTracked.forEach(timeThreshold => {
            setTimeout(() => {
                if (!trackedTimes.includes(timeThreshold)) {
                    trackedTimes.push(timeThreshold);
                    trackEvent('time_on_page_milestone', {
                        seconds: timeThreshold,
                        max_scroll: maxScroll
                    });
                }
            }, timeThreshold * 1000);
        });

        // Page visibility tracking
        let isVisible = true;
        let hiddenTime = 0;

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                isVisible = false;
                hiddenTime = Date.now();
                trackEvent('page_hidden');
            } else {
                isVisible = true;
                if (hiddenTime) {
                    const hiddenDuration = Date.now() - hiddenTime;
                    trackEvent('page_visible', {
                        hidden_duration: Math.round(hiddenDuration / 1000)
                    });
                }
            }
        });

        // Before unload tracking
        window.addEventListener('beforeunload', function() {
            const sessionData = {
                total_time: Math.round((Date.now() - startTime) / 1000),
                max_scroll_depth: maxScroll,
                scroll_milestones_reached: reachedMilestones,
                page_url: window.location.href,
                user_agent: navigator.userAgent.substring(0, 100)
            };
            
            trackEvent('session_end', sessionData);

            // Send beacon for reliable tracking
            if ('sendBeacon' in navigator) {
                const data = new URLSearchParams({ event: 'session_end', data: JSON.stringify(sessionData) });
                navigator.sendBeacon('/analytics', data);
            }
        });
    }

    // Enhanced 3D Form Card Effect
    function initializeFormCard3D() {
        const card = document.querySelector('.form-card');
        if (!card) return;

        let isMoving = false;

        card.addEventListener('mousemove', throttle(function(e) {
            if (window.innerWidth <= 768) return; // Disable on mobile

            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;
            
            this.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                translateY(-5px)
                scale(1.02)
            `;
            
            if (!isMoving) {
                isMoving = true;
                trackEvent('form_card_3d_interaction');
            }
        }, 16)); // ~60fps

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.transition = 'transform 0.5s ease';
            
            setTimeout(() => {
                this.style.transition = '';
            }, 500);
            
            isMoving = false;
        });

        // Touch interaction for mobile
        card.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                this.style.transform = 'translateY(-3px) scale(1.01)';
                trackEvent('form_card_touch_interaction');
            }
        }, { passive: true });

        card.addEventListener('touchend', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    }

    // Social Proof Animation System
    function initializeSocialProof() {
        if (!CONFIG.socialProofAnimation) return;

        const countElement = document.querySelector('.form-subtitle');
        if (!countElement) return;

        let currentCount = 4247;
        const countRegex = /([\d,]+)/;

        // Animate download count
        const animateCount = () => {
            if (Math.random() < 0.08) { // 8% chance every interval
                const increment = Math.floor(Math.random() * 3) + 1;
                currentCount += increment;
                
                const newText = countElement.textContent.replace(
                    countRegex, 
                    currentCount.toLocaleString()
                );
                countElement.textContent = newText;
                
                // Add subtle pulse animation
                countElement.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    countElement.style.animation = '';
                }, 500);

                trackEvent('social_proof_updated', {
                    new_count: currentCount,
                    increment: increment
                });
            }
        };

        // Start animation after page load
        setTimeout(() => {
            setInterval(animateCount, 30000); // Every 30 seconds
        }, 5000);

        // Add testimonial rotation (if multiple testimonials)
        const testimonials = document.querySelectorAll('.testimonial');
        if (testimonials.length > 1) {
            let currentTestimonial = 0;
            
            setInterval(() => {
                testimonials[currentTestimonial].style.opacity = '0';
                currentTestimonial = (currentTestimonial + 1) % testimonials.length;
                
                setTimeout(() => {
                    testimonials.forEach((t, i) => {
                        t.style.display = i === currentTestimonial ? 'block' : 'none';
                    });
                    testimonials[currentTestimonial].style.opacity = '1';
                }, 500);
                
                trackEvent('testimonial_rotated', {
                    testimonial_index: currentTestimonial
                });
            }, 8000); // Every 8 seconds
        }
    }

    // Membership Club Teaser System
    function initializeMembershipTeaser() {
        const memberPreview = document.querySelector('.member-preview');
        const memberLink = memberPreview?.querySelector('a');
        
        if (!memberPreview || !memberLink) return;

        // Track membership interest
        memberLink.addEventListener('click', function(e) {
            trackEvent('membership_interest_clicked', {
                link_text: this.textContent,
                source: 'landing_page_teaser'
            });
        });

        // Show membership teaser after user engagement
        setTimeout(() => {
            if (memberPreview.style.display !== 'block') {
                memberPreview.style.opacity = '0';
                memberPreview.style.display = 'block';
                
                setTimeout(() => {
                    memberPreview.style.transition = 'opacity 0.8s ease';
                    memberPreview.style.opacity = '1';
                }, 100);
                
                trackEvent('membership_teaser_shown');
            }
        }, 45000); // After 45 seconds

        // Pulse animation for attention
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                memberPreview.style.animation = 'pulse 1s ease';
                setTimeout(() => {
                    memberPreview.style.animation = '';
                }, 1000);
            }
        }, 60000); // Every minute
    }

    // Event Tracking Wrapper
    function trackEvent(eventName, eventData = {}) {
        const baseData = {
            timestamp: Date.now(),
            page_url: window.location.href,
            user_agent: navigator.userAgent.substring(0, 100),
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            ...eventData
        };

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, baseData);
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined' && eventName === 'form_submit_attempt') {
            fbq('track', 'Lead', {
                content_name: '2025 Boat Show Guide',
                content_category: 'Lead Magnet'
            });
        }

        // Custom analytics (if available)
        if (window.customAnalytics && typeof window.customAnalytics.track === 'function') {
            window.customAnalytics.track(eventName, baseData);
        }

        // Console logging for development
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
            console.log(`📊 Event: ${eventName}`, baseData);
        }
    }

    // Form Submission Tracking
    function trackFormSubmission(formData) {
        const eventData = {
            first_name: formData.get('first_name') || formData.get('firstName'),
            boat_type: formData.get('boat_type') || formData.get('boatType'),
            source: formData.get('source'),
            utm_source: formData.get('utm_source'),
            utm_medium: formData.get('utm_medium'),
            utm_campaign: formData.get('utm_campaign')
        };

        trackEvent('form_submission_success', eventData);

        // Enhanced conversion tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'send_to': 'YOUR-GOOGLE-ADS-CONVERSION-ID',
                'value': 1.0,
                'currency': 'USD'
            });
        }
    }

    function trackExitIntentSignup(email) {
        trackEvent('exit_intent_conversion', {
            email: email,
            conversion_type: 'exit_intent'
        });

        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'Exit Intent Capture'
            });
        }
    }

    // Utility Functions
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Performance Monitoring
    function initializePerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    trackEvent('page_performance', {
                        dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                        page_load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                        dns_lookup_time: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
                        connection_time: Math.round(perfData.connectEnd - perfData.connectStart)
                    });
                }
            }, 100);
        });

        // Monitor form performance
        const formFields = document.querySelectorAll('#leadForm input, #leadForm select');
        formFields.forEach(field => {
            let focusTime;
            
            field.addEventListener('focus', () => {
                focusTime = Date.now();
            });
            
            field.addEventListener('blur', () => {
                if (focusTime) {
                    const timeSpent = Date.now() - focusTime;
                    trackEvent('field_interaction_time', {
                        field_name: field.name || field.id,
                        time_spent: Math.round(timeSpent / 1000)
                    });
                }
            });
        });
    }

    // Initialize performance monitoring
    setTimeout(initializePerformanceMonitoring, 1000);

    // Global error handling
    window.addEventListener('error', function(e) {
        trackEvent('javascript_error', {
            message: e.message,
            filename: e.filename,
            line_number: e.lineno,
            column_number: e.colno
        });
    });

    // Export functions for external access if needed
    window.BoatSmartAnalytics = {
        trackEvent: trackEvent,
        trackFormSubmission: trackFormSubmission
    };

})();
