import React, { useState, useEffect, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from '@/context/userContext';
import { apiBaseURL, wsBaseURL } from '@/utils/api';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export default function NotifDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const { user, token } = useUser();

  // Filter notifications based on user role and company
  const shouldShowNotification = (notification: Notification): boolean => {
    if (!user) return false;

    // Superadmins see all route creation notifications
    if (user.role === 'superadmin') {
      return true; // Superadmins see everything
    }

    // Admins should only see notifications for their company
    if (user.role === 'admin') {
      // Check if notification is for this specific company
      const notificationCompanyId = notification.data?.company_id;
      const userCompanyId = user.fleet_id || user.id; // Use fleet_id or id depending on your user structure

      // For GeoJSON uploads and other company-specific notifications
      if (notification.type === 'geojson_uploaded') {
        return notificationCompanyId === userCompanyId;
      }

      // Admins don't see route creation notifications (those are for superadmins only)
      if (notification.type === 'route_added') {
        return false;
      }

      // For other notification types, check if it's for this company
      return notificationCompanyId === userCompanyId;
    }

    return false;
  };

  // WebSocket connection for real-time notifications
  const connectWebSocket = () => {
    if (!user) {
      console.log('🔐 No user found, skipping WebSocket connection');
      return;
    }

    const wsUrl = `${wsBaseURL}/declared_routes/ws/routes`;

    console.log('🔗 Connecting to route notifications WebSocket:', wsUrl);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('🔌 Successfully connected to route notifications WebSocket');

      // Send user identification for role-based filtering
      const userData = {
        role: user.role,
        user_id: user.fleet_id || user.id, // Send the company/fleet ID
        username: user.company_name
      };
      console.log('👤 Sending user identification:', userData);
      
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(userData));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        console.log('📨 Raw WebSocket message received:', event.data);

        const data = JSON.parse(event.data);
        console.log('📨 Parsed WebSocket message:', {
          type: data.type,
          timestamp: new Date().toISOString()
        });

        // Handle new route notifications
        if (data.type === 'new_route_notification') {
          console.log('🎯 Processing new route notification:', data.notification);

          // Check if current user should see this notification
          if (shouldShowNotification(data.notification)) {
            console.log('✅ User should see this notification');
            handleNewRouteNotification(data.notification);
          } else {
            console.log('🔕 User should not see this notification, filtering out');
          }
        }
        // Handle GeoJSON upload notifications
        else if (data.type === 'geojson_uploaded_notification') {
          console.log('🎯 Processing GeoJSON upload notification:', data.notification);

          // Check if current user should see this notification
          if (shouldShowNotification(data.notification)) {
            console.log('✅ User should see GeoJSON notification');
            handleGeoJSONNotification(data.notification);
          } else {
            console.log('🔕 User should not see GeoJSON notification, filtering out');
          }
        }
        // Handle route deletion notifications
        else if (data.type === 'deleted_route') {
          console.log('🗑️ Route deletion notification:', data);
        }
        // Handle other notification types
        else if (data.type === 'updated_route') {
          console.log('🔄 Route update notification:', data.route);
        }
        else {
          console.log('📨 Other WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
        console.log('📨 Raw message that failed:', event.data);
      }
    };

    ws.current.onclose = (event) => {
      setIsConnected(false);
      console.log('🔌 WebSocket disconnected:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });

      // Attempt reconnect after 3 seconds
      console.log('🔄 Attempting to reconnect in 3 seconds...');
      setTimeout(connectWebSocket, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const handleNewRouteNotification = (notification: any) => {
    // Create a proper notification object
    const newNotification: Notification = {
      id: notification.id || `route_${Date.now()}`,
      title: notification.title,
      description: notification.description,
      type: notification.type,
      is_read: notification.is_read || false,
      created_at: notification.created_at || new Date().toISOString(),
      data: notification.data
    };

    console.log('➕ Processing new notification:', {
      id: newNotification.id,
      type: newNotification.type,
      title: newNotification.title
    });

    // Check for duplicates before adding
    setNotifications(prev => {
      const exists = prev.some(n => n.id === newNotification.id);
      if (exists) {
        console.log('🔄 Notification already exists, skipping duplicate:', newNotification.id);
        return prev;
      }

      console.log('✅ Adding new notification to state:', newNotification.id);
      return [newNotification, ...prev];
    });

    // Only increment unread count if it's not read
    if (!newNotification.is_read) {
      setUnreadCount(prev => prev + 1);
      console.log('🔴 Unread count incremented');
    }

    // Show browser notification (if permission granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotification.title, {
          body: newNotification.description,
          icon: '/logo.png',
          tag: newNotification.id
        });
        console.log('📢 Browser notification shown');
      } catch (browserError) {
        console.error('❌ Browser notification failed:', browserError);
      }
    }

    playNotificationSound();
  };

  const handleGeoJSONNotification = (notification: any) => {
    const newNotification: Notification = {
      id: notification.id || `geojson_${Date.now()}`,
      title: notification.title,
      description: notification.description,
      type: notification.type,
      is_read: notification.is_read || false,
      created_at: notification.created_at || new Date().toISOString(),
      data: notification.data
    };

    console.log('➕ Processing GeoJSON notification:', {
      id: newNotification.id,
      type: newNotification.type,
      title: newNotification.title
    });

    // Check for duplicates before adding
    setNotifications(prev => {
      const exists = prev.some(n => n.id === newNotification.id);
      if (exists) {
        console.log('🔄 GeoJSON notification already exists, skipping duplicate:', newNotification.id);
        return prev;
      }

      console.log('✅ Adding GeoJSON notification to state:', newNotification.id);
      return [newNotification, ...prev];
    });

    if (!newNotification.is_read) {
      setUnreadCount(prev => prev + 1);
      console.log('🔴 Unread count incremented');
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotification.title, {
          body: newNotification.description,
          icon: '/logo.png',
          tag: newNotification.id
        });
        console.log('📢 Browser GeoJSON notification shown');
      } catch (browserError) {
        console.error('❌ Browser GeoJSON notification failed:', browserError);
      }
    }

    playNotificationSound();
  };

  const playNotificationSound = () => {
    console.log('🔊 Notification sound triggered');
  };

  // Fetch initial notifications from API
  const fetchNotifications = async () => {
    if (!token || !user) {
      console.log('🔐 No token or user available for fetching notifications');
      return;
    }

    try {
      console.log('📡 Fetching notifications from backend API...');
      const response = await fetch(`${apiBaseURL}/notifications/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Backend API response:', {
          total: data.total_count,
          unread: data.unread_count,
          notifications: data.notifications?.length || 0
        });

        if (data.success && data.notifications) {
          // Filter notifications based on user role and company
          const filteredNotifications = data.notifications.filter((notif: Notification) => 
            shouldShowNotification(notif)
          );

          console.log(`🔄 Filtered notifications: ${data.notifications.length} → ${filteredNotifications.length}`);

          // Merge with existing notifications, avoiding duplicates
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newNotifications = filteredNotifications.filter((n: Notification) =>
              !existingIds.has(n.id)
            );

            console.log(`📊 Merge result: ${prev.length} existing + ${newNotifications.length} new = ${prev.length + newNotifications.length} total`);
            return [...prev, ...newNotifications];
          });

          // Update unread count based on filtered notifications
          const unreadFiltered = filteredNotifications.filter((n: Notification) => !n.is_read).length;
          setUnreadCount(unreadFiltered);
        }
      } else {
        console.error('❌ Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications from API:', error);
    }
  };

  const handleRouteDeletionNotification = (notification: any) => {
    const deletionNotification: Notification = {
      id: notification.id || `deleted_${Date.now()}`,
      title: notification.title,
      description: notification.description,
      type: notification.type,
      is_read: notification.is_read || false,
      created_at: notification.created_at || new Date().toISOString(),
      data: notification.data
    };

    console.log('🗑️ Processing deletion notification:', {
      id: deletionNotification.id,
      type: deletionNotification.type,
      title: deletionNotification.title
    });

    setNotifications(prev => {
      const exists = prev.some(n => n.id === deletionNotification.id);
      if (exists) {
        console.log('🔄 Deletion notification already exists, skipping duplicate:', deletionNotification.id);
        return prev;
      }

      console.log('✅ Adding deletion notification to state:', deletionNotification.id);
      return [deletionNotification, ...prev];
    });

    if (!deletionNotification.is_read) {
      setUnreadCount(prev => prev + 1);
      console.log('🔴 Unread count incremented for deletion');
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(deletionNotification.title, {
          body: deletionNotification.description,
          icon: '/logo.png',
          tag: deletionNotification.id
        });
        console.log('📢 Browser deletion notification shown');
      } catch (browserError) {
        console.error('❌ Browser deletion notification failed:', browserError);
      }
    }

    playDeletionSound();
  };

  const playDeletionSound = () => {
    console.log('🔊 Deletion notification sound triggered');
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      connectWebSocket();
      requestNotificationPermission();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user, token]);

  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await fetch(`${apiBaseURL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      await fetch(`${apiBaseURL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative p-2 rounded-lg transition-colors cursor-pointer"
          variant="ghost"
          size="icon"
        >
          <Bell className="w-5 h-5 text-primary" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          {!isConnected && (
            <span className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span className="text-1xl font-bold">Notifications</span>
          <div className="flex items-center gap-2">
            {!isConnected && (
              <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Connecting..."></span>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications
            {!isConnected && (
              <div className="text-xs text-yellow-600 mt-1">
                Connecting to real-time updates...
              </div>
            )}
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <React.Fragment key={`${notif.id}_${idx}_${notif.created_at}`}>
              <DropdownMenuItem
                className={`flex flex-col items-start py-3 gap-1 cursor-default select-none ${!notif.is_read ? 'bg-blue-50 dark:bg-blue-950' : ''
                  }`}
                onSelect={() => markAsRead(notif.id)}
              >
                <div className="flex justify-between w-full items-start">
                  <span className="font-bold text-sm">{notif.title}</span>
                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {notif.description}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(notif.created_at)}
                </span>
                {notif.type === 'route_added' && notif.data && (
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs w-full">
                    <strong>Route:</strong> {notif.data.route_name}<br />
                    <strong>Company:</strong> {notif.data.company_name}<br />
                  </div>
                )}
                {notif.type === 'geojson_uploaded' && notif.data && (
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs w-full">
                    <strong>Route:</strong> {notif.data.route_name}<br />
                    <strong>Uploaded by:</strong> {notif.data.uploaded_by}<br />
                  </div>
                )}
              </DropdownMenuItem>
              {idx < notifications.length - 1 && (
                <DropdownMenuSeparator className="mx-4" />
              )}
            </React.Fragment>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}