'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Badge, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { 
  Bell, 
  BellRing, 
  Settings, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Mail,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { Notification, NotificationSettings } from '@/types';
import { supabase } from '@/lib/supabase';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [userId]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          showNotificationToast(newNotification);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const showNotificationToast = (notification: Notification) => {
    const icon = getNotificationIcon(notification.type);
    
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto 
        flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 
              flex items-center justify-center text-sm font-medium text-gray-600 
              dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 
              focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ), {
      duration: notification.priority === 'critical' ? 10000 : 5000,
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (!notifications.find(n => n.id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="light"
          isIconOnly
          className="relative"
          isLoading={isLoading}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              content={unreadCount > 99 ? '99+' : unreadCount}
              color="danger"
              className="absolute -top-1 -right-1"
            />
          )}
        </Button>
      </DropdownTrigger>
      
      <DropdownMenu
        aria-label="Notifications"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <DropdownItem key="header" className="h-14 gap-2" textValue="Notifications Header">
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="light"
                onPress={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DropdownItem>
        
        {notifications.length === 0 ? (
          <DropdownItem key="empty" textValue="No notifications">
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No notifications yet
            </div>
          </DropdownItem>
        ) : (
          notifications.map((notification) => (
            <DropdownItem
              key={notification.id}
              className={`h-auto py-3 ${!notification.read ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
              textValue={notification.title}
            >
              <div className="flex items-start gap-3 w-full">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </p>
                    <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => deleteNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownItem>
          ))
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

interface NotificationSettingsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({ userId, isOpen, onClose }: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    user_id: userId,
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    production_alerts: true,
    storage_alerts: true,
    transport_alerts: true,
    system_alerts: true,
    maintenance_alerts: true,
    threshold_alerts: true,
    daily_summary: true,
    weekly_report: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadSettings();
    }
  }, [isOpen, userId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert(settings);

      if (error) throw error;

      toast.success('Notification settings saved');
      onClose();
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex gap-1">
          <Settings className="h-5 w-5" />
          Notification Settings
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Delivery Methods */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Delivery Methods
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Notifications</span>
                  </div>
                  <Switch
                    isSelected={settings.email_enabled}
                    onValueChange={(value) => updateSetting('email_enabled', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Push Notifications</span>
                  </div>
                  <Switch
                    isSelected={settings.push_enabled}
                    onValueChange={(value) => updateSetting('push_enabled', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS Notifications</span>
                  </div>
                  <Switch
                    isSelected={settings.sms_enabled || false}
                    onValueChange={(value) => updateSetting('sms_enabled', value)}
                  />
                </div>
              </div>
            </div>

            {/* Alert Types */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alert Types
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Production Alerts</span>
                  <Switch
                    isSelected={settings.production_alerts}
                    onValueChange={(value) => updateSetting('production_alerts', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Storage Alerts</span>
                  <Switch
                    isSelected={settings.storage_alerts}
                    onValueChange={(value) => updateSetting('storage_alerts', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Transport Alerts</span>
                  <Switch
                    isSelected={settings.transport_alerts}
                    onValueChange={(value) => updateSetting('transport_alerts', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>System Alerts</span>
                  <Switch
                    isSelected={settings.system_alerts}
                    onValueChange={(value) => updateSetting('system_alerts', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Maintenance Alerts</span>
                  <Switch
                    isSelected={settings.maintenance_alerts}
                    onValueChange={(value) => updateSetting('maintenance_alerts', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Threshold Alerts</span>
                  <Switch
                    isSelected={settings.threshold_alerts}
                    onValueChange={(value) => updateSetting('threshold_alerts', value)}
                  />
                </div>
              </div>
            </div>

            {/* Reports */}
            <div>
              <h3 className="text-lg font-medium mb-4">Reports</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Daily Summary</span>
                  <Switch
                    isSelected={settings.daily_summary}
                    onValueChange={(value) => updateSetting('daily_summary', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Weekly Report</span>
                  <Switch
                    isSelected={settings.weekly_report}
                    onValueChange={(value) => updateSetting('weekly_report', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={saveSettings} isLoading={isLoading}>
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--nextui-colors-background)',
            color: 'var(--nextui-colors-foreground)',
            border: '1px solid var(--nextui-colors-border)',
          },
        }}
      />
    </>
  );
}
