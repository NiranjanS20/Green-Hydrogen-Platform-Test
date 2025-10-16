'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  Slider,
  Select,
  SelectItem,
  Card,
  CardBody,
  Divider,
  Kbd,
} from '@heroui/react';
import {
  Settings,
  Eye,
  Type,
  Zap,
  Focus,
  Keyboard,
  Volume2,
  Palette,
  MousePointer,
  Info,
} from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const { settings, updateSettings, announceToScreenReader } = useAccessibility();
  const [fontSize, setFontSize] = useState(100);
  const [contrastLevel, setContrastLevel] = useState(100);

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
    
    // Provide feedback
    const settingName = key.replace(/_/g, ' ');
    announceToScreenReader(`${settingName} ${value ? 'enabled' : 'disabled'}`);
  };

  const applyFontSize = (size: number) => {
    setFontSize(size);
    document.documentElement.style.fontSize = `${size}%`;
    announceToScreenReader(`Font size set to ${size} percent`);
  };

  const applyContrastLevel = (level: number) => {
    setContrastLevel(level);
    document.documentElement.style.filter = `contrast(${level}%)`;
    announceToScreenReader(`Contrast level set to ${level} percent`);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      screen_reader: false,
      keyboard_navigation: true,
      high_contrast: false,
      large_text: false,
      reduced_motion: false,
      focus_indicators: true,
      alt_text_enabled: true,
    };
    
    updateSettings(defaultSettings);
    setFontSize(100);
    setContrastLevel(100);
    document.documentElement.style.fontSize = '';
    document.documentElement.style.filter = '';
    
    announceToScreenReader('Accessibility settings reset to defaults');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        body: "py-6",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          <Settings className="h-5 w-5" />
          <span>Accessibility Settings</span>
          <span className="sr-only">
            Configure accessibility options for better user experience
          </span>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={settings.high_contrast ? "solid" : "bordered"}
                    onPress={() => handleSettingChange('high_contrast', !settings.high_contrast)}
                    className="justify-start"
                    startContent={<Palette className="h-4 w-4" />}
                  >
                    High Contrast
                  </Button>
                  <Button
                    variant={settings.large_text ? "solid" : "bordered"}
                    onPress={() => handleSettingChange('large_text', !settings.large_text)}
                    className="justify-start"
                    startContent={<Type className="h-4 w-4" />}
                  >
                    Large Text
                  </Button>
                  <Button
                    variant={settings.reduced_motion ? "solid" : "bordered"}
                    onPress={() => handleSettingChange('reduced_motion', !settings.reduced_motion)}
                    className="justify-start"
                    startContent={<MousePointer className="h-4 w-4" />}
                  >
                    Reduce Motion
                  </Button>
                  <Button
                    variant={settings.focus_indicators ? "solid" : "bordered"}
                    onPress={() => handleSettingChange('focus_indicators', !settings.focus_indicators)}
                    className="justify-start"
                    startContent={<Focus className="h-4 w-4" />}
                  >
                    Focus Indicators
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Visual Settings */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visual Settings
                </h3>
                
                <div className="space-y-6">
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Font Size: {fontSize}%
                    </label>
                    <Slider
                      size="md"
                      step={10}
                      minValue={80}
                      maxValue={200}
                      value={fontSize}
                      onChange={(value) => applyFontSize(Array.isArray(value) ? value[0] : value)}
                      className="max-w-md"
                      aria-label="Font size adjustment"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>80%</span>
                      <span>200%</span>
                    </div>
                  </div>

                  {/* Contrast Level */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contrast Level: {contrastLevel}%
                    </label>
                    <Slider
                      size="md"
                      step={10}
                      minValue={50}
                      maxValue={200}
                      value={contrastLevel}
                      onChange={(value) => applyContrastLevel(Array.isArray(value) ? value[0] : value)}
                      className="max-w-md"
                      aria-label="Contrast level adjustment"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50%</span>
                      <span>200%</span>
                    </div>
                  </div>

                  {/* High Contrast Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">High Contrast Mode</label>
                      <p className="text-xs text-gray-500">
                        Increases contrast for better visibility
                      </p>
                    </div>
                    <Switch
                      isSelected={settings.high_contrast}
                      onValueChange={(value) => handleSettingChange('high_contrast', value)}
                      aria-label="Toggle high contrast mode"
                    />
                  </div>

                  {/* Large Text Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Large Text</label>
                      <p className="text-xs text-gray-500">
                        Increases text size across the application
                      </p>
                    </div>
                    <Switch
                      isSelected={settings.large_text}
                      onValueChange={(value) => handleSettingChange('large_text', value)}
                      aria-label="Toggle large text"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Navigation Settings */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Navigation Settings
                </h3>
                
                <div className="space-y-4">
                  {/* Keyboard Navigation */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enhanced Keyboard Navigation</label>
                      <p className="text-xs text-gray-500">
                        Improved keyboard shortcuts and navigation
                      </p>
                    </div>
                    <Switch
                      isSelected={settings.keyboard_navigation}
                      onValueChange={(value) => handleSettingChange('keyboard_navigation', value)}
                      aria-label="Toggle keyboard navigation"
                    />
                  </div>

                  {/* Focus Indicators */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enhanced Focus Indicators</label>
                      <p className="text-xs text-gray-500">
                        Stronger visual focus indicators for keyboard navigation
                      </p>
                    </div>
                    <Switch
                      isSelected={settings.focus_indicators}
                      onValueChange={(value) => handleSettingChange('focus_indicators', value)}
                      aria-label="Toggle focus indicators"
                    />
                  </div>

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Reduce Motion</label>
                      <p className="text-xs text-gray-500">
                        Minimizes animations and transitions
                      </p>
                    </div>
                    <Switch
                      isSelected={settings.reduced_motion}
                      onValueChange={(value) => handleSettingChange('reduced_motion', value)}
                      aria-label="Toggle reduced motion"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Screen Reader Settings */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Screen Reader Settings
                </h3>
                
                <div className="space-y-4">
                  {/* Screen Reader Optimization */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Screen Reader Optimization</label>
                      <p className="text-xs text-gray-500">
                        Optimizes interface for screen reader users
                      </p>
                    </div>
                    <Switch
                      isSelected={settings.screen_reader}
                      onValueChange={(value) => handleSettingChange('screen_reader', value)}
                      aria-label="Toggle screen reader optimization"
                    />
                  </div>

                  {/* Alt Text */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enhanced Alt Text</label>
                      <p className="text-xs text-gray-500">
                        Provides detailed descriptions for images and charts
                      </p>
                    </div>
                    <Switch
                      isSelected={settings.alt_text_enabled}
                      onValueChange={(value) => handleSettingChange('alt_text_enabled', value)}
                      aria-label="Toggle enhanced alt text"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Keyboard Shortcuts
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Skip to main content</span>
                    <div className="flex gap-1">
                      <Kbd>Alt</Kbd>
                      <span>+</span>
                      <Kbd>1</Kbd>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Skip to navigation</span>
                    <div className="flex gap-1">
                      <Kbd>Alt</Kbd>
                      <span>+</span>
                      <Kbd>2</Kbd>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Toggle high contrast</span>
                    <div className="flex gap-1">
                      <Kbd>Alt</Kbd>
                      <span>+</span>
                      <Kbd>H</Kbd>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Close modal/dropdown</span>
                    <Kbd>Escape</Kbd>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Navigate between elements</span>
                    <Kbd>Tab</Kbd>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Navigate backwards</span>
                    <div className="flex gap-1">
                      <Kbd>Shift</Kbd>
                      <span>+</span>
                      <Kbd>Tab</Kbd>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Divider />

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button
                variant="bordered"
                onPress={resetToDefaults}
                className="w-full max-w-xs"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
          <Button 
            color="primary" 
            onPress={() => {
              announceToScreenReader('Accessibility settings saved');
              onClose();
            }}
          >
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Accessibility Settings Button Component
interface AccessibilityButtonProps {
  className?: string;
}

export function AccessibilityButton({ className = '' }: AccessibilityButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        isIconOnly
        variant="light"
        onPress={() => setIsOpen(true)}
        className={className}
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
      
      <AccessibilityPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
