'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilitySettings } from '@/types';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string) => void;
  focusManagement: {
    trapFocus: (element: HTMLElement) => () => void;
    restoreFocus: (element: HTMLElement | null) => void;
    skipToContent: () => void;
  };
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screen_reader: false,
    keyboard_navigation: true,
    high_contrast: false,
    large_text: false,
    reduced_motion: false,
    focus_indicators: true,
    alt_text_enabled: true,
  });

  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Detect system preferences
    detectSystemPreferences();

    // Create screen reader announcer
    createScreenReaderAnnouncer();

    // Setup keyboard navigation
    setupKeyboardNavigation();

    // Apply initial settings
    applyAccessibilitySettings(settings);
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Apply settings to DOM
    applyAccessibilitySettings(settings);
  }, [settings]);

  const detectSystemPreferences = () => {
    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Detect screen reader usage
    const screenReaderDetected = detectScreenReader();

    setSettings(prev => ({
      ...prev,
      reduced_motion: prefersReducedMotion,
      high_contrast: prefersHighContrast,
      screen_reader: screenReaderDetected,
    }));
  };

  const detectScreenReader = (): boolean => {
    // Multiple methods to detect screen reader usage
    
    // Method 1: Check for screen reader specific CSS
    const testElement = document.createElement('div');
    testElement.setAttribute('aria-hidden', 'true');
    testElement.style.position = 'absolute';
    testElement.style.left = '-10000px';
    testElement.textContent = 'Screen reader test';
    document.body.appendChild(testElement);
    
    const isHidden = window.getComputedStyle(testElement).visibility === 'hidden';
    document.body.removeChild(testElement);
    
    // Method 2: Check for common screen reader user agents
    const userAgent = navigator.userAgent.toLowerCase();
    const screenReaderIndicators = ['nvda', 'jaws', 'voiceover', 'talkback', 'orca'];
    const hasScreenReaderUA = screenReaderIndicators.some(indicator => 
      userAgent.includes(indicator)
    );
    
    // Method 3: Check for assistive technology APIs
    const hasAccessibilityAPI = 'speechSynthesis' in window || 
                               'webkitSpeechSynthesis' in window;
    
    return !isHidden || hasScreenReaderUA || hasAccessibilityAPI;
  };

  const createScreenReaderAnnouncer = () => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('id', 'screen-reader-announcer');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    
    document.body.appendChild(announcer);
    setAnnouncer(announcer);
  };

  const setupKeyboardNavigation = () => {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 9999;
      border-radius: 4px;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Global keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeydown);
  };

  const handleGlobalKeydown = (event: KeyboardEvent) => {
    // Alt + 1: Skip to main content
    if (event.altKey && event.key === '1') {
      event.preventDefault();
      focusManagement.skipToContent();
    }

    // Alt + 2: Skip to navigation
    if (event.altKey && event.key === '2') {
      event.preventDefault();
      const nav = document.querySelector('nav[role="navigation"]') as HTMLElement;
      nav?.focus();
    }

    // Alt + H: Toggle high contrast
    if (event.altKey && event.key === 'h') {
      event.preventDefault();
      updateSettings({ high_contrast: !settings.high_contrast });
    }

    // Escape: Close modals/dropdowns
    if (event.key === 'Escape') {
      const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (activeModal) {
        const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
        closeButton?.click();
      }
    }
  };

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text
    if (settings.large_text) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Reduced motion
    if (settings.reduced_motion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Focus indicators
    if (settings.focus_indicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    // Keyboard navigation
    if (settings.keyboard_navigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  };

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Announce changes to screen reader
    const changes = Object.entries(newSettings).map(([key, value]) => {
      const setting = key.replace(/_/g, ' ');
      return `${setting} ${value ? 'enabled' : 'disabled'}`;
    }).join(', ');
    
    announceToScreenReader(`Accessibility settings updated: ${changes}`);
  };

  const announceToScreenReader = (message: string) => {
    if (announcer && settings.screen_reader) {
      // Clear previous message
      announcer.textContent = '';
      
      // Set new message after a brief delay to ensure it's announced
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
      
      // Clear message after announcement
      setTimeout(() => {
        announcer.textContent = '';
      }, 3000);
    }
  };

  const focusManagement = {
    trapFocus: (element: HTMLElement) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      element.addEventListener('keydown', handleTabKey);
      
      // Focus first element
      firstElement?.focus();
      
      // Return cleanup function
      return () => {
        element.removeEventListener('keydown', handleTabKey);
      };
    },

    restoreFocus: (element: HTMLElement | null) => {
      if (element && typeof element.focus === 'function') {
        element.focus();
      }
    },

    skipToContent: () => {
      const mainContent = document.getElementById('main-content') || 
                         document.querySelector('main') ||
                         document.querySelector('[role="main"]') as HTMLElement;
      
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        announceToScreenReader('Skipped to main content');
      }
    },
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    announceToScreenReader,
    focusManagement,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Accessibility CSS */}
      <style jsx global>{`
        .high-contrast {
          --background: #000000;
          --foreground: #ffffff;
          --primary: #ffff00;
          --secondary: #00ffff;
          --accent: #ff00ff;
          --muted: #808080;
          --border: #ffffff;
        }
        
        .large-text {
          font-size: 120% !important;
        }
        
        .large-text * {
          font-size: inherit !important;
        }
        
        .reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .enhanced-focus *:focus {
          outline: 3px solid #005fcc !important;
          outline-offset: 2px !important;
        }
        
        .keyboard-navigation *:focus-visible {
          outline: 2px solid #005fcc;
          outline-offset: 2px;
        }
        
        .skip-link:focus {
          position: absolute !important;
          top: 6px !important;
          left: 6px !important;
          z-index: 9999 !important;
        }
        
        /* Screen reader only content */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        /* Focus management for modals */
        [role="dialog"] {
          outline: none;
        }
        
        [role="dialog"]:focus {
          outline: 2px solid #005fcc;
        }
      `}</style>
    </AccessibilityContext.Provider>
  );
}
