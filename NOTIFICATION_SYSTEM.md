# Notification System Documentation

## Overview

The CapitalKV-AI notification system is a comprehensive real-time notification platform that allows admins to send notifications to users and provides users with real-time updates.

## Features

### For Admins
- **Send Notifications**: Send notifications to all users or select specific users
- **Notification Types**: System, Order, Subscription, Promotion, and Other
- **User Management**: Search and select users for targeted notifications
- **Notification History**: View all sent notifications with details
- **Real-time Broadcasting**: Notifications are sent instantly via WebSocket

### For Users
- **Real-time Notifications**: Receive notifications instantly via WebSocket
- **Notification Panel**: View and manage notifications in a beautiful UI
- **Toast Notifications**: Pop-up notifications for immediate attention
- **Read/Unread Status**: Track notification status
- **Filtering**: Filter notifications by read/unread status

## Architecture

### Backend Components

1. **Models** (`backend/app/notifications/models.py`)
   - `NotificationType`: Enum for notification categories
   - `UserNotification`: MongoDB document model
   - `Notification`: Pydantic model for API responses

2. **WebSocket Manager** (`backend/app/notifications/notificationService.py`)
   - `ConnectionManager`: Manages WebSocket connections
   - Real-time broadcasting to all connected clients

3. **API Endpoints** (`backend/app/notifications/router.py`)
   - `POST /notifications/admin/send`: Send notifications (Admin only)
   - `GET /notifications/admin/users`: Get users for targeting (Admin only)
   - `GET /notifications/admin/notifications`: Get notification history (Admin only)
   - `GET /notifications`: Get user notifications
   - `DELETE /notifications/{id}`: Delete notification
   - `POST /notifications/mark-all-read`: Mark all as read
   - `WS /notifications/ws/notify`: WebSocket endpoint

4. **Utility Functions** (`backend/app/notifications/utils.py`)
   - `create_notification()`: Create and store notifications
   - `mark_notification_as_read()`: Update read status
   - `get_user_notifications()`: Fetch user notifications

### Frontend Components

1. **Admin Notification Page** (`frontend/app/dashboard/notifications/page.tsx`)
   - Beautiful UI for composing and sending notifications
   - User selection with search functionality
   - Notification history viewer
   - Real-time updates

2. **User Notification Panel** (`frontend/components/dashbaoard/Notifications.tsx`)
   - Slide-in notification panel
   - Filtering and management options
   - Delete and mark as read functionality

3. **WebSocket Client** (`frontend/app/notificationSocket/notificationSocket.tsx`)
   - Auto-reconnection with exponential backoff
   - Real-time notification reception
   - Error handling and connection management

## Usage

### For Admins

1. **Access the Notification Management Page**
   - Navigate to `/dashboard/notifications` (Admin only)
   - The page is accessible from the sidebar for admin users

2. **Send a Notification**
   - Select notification type (System, Order, Subscription, Promotion, Other)
   - Enter title and message
   - Choose recipients:
     - "Send to all users" for broadcast
     - Select specific users for targeted notifications
   - Click "Send Notification"

3. **View Notification History**
   - Switch to the "Notification History" tab
   - View all sent notifications with details
   - See read/unread status for each notification

### For Users

1. **Receive Notifications**
   - Notifications appear as toast messages
   - Real-time updates via WebSocket connection
   - Automatic reconnection on connection loss

2. **View Notifications**
   - Click the notification bell icon in the header
   - View all notifications in the slide-in panel
   - Filter by read/unread status

3. **Manage Notifications**
   - Mark individual notifications as read
   - Mark all notifications as read
   - Delete notifications

## API Reference

### Admin Endpoints

#### Send Notification
```http
POST /notifications/admin/send
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "title": "Notification Title",
  "message": "Notification message content",
  "type": "system",
  "user_ids": ["user_id_1", "user_id_2"] // Optional, omit for all users
}
```

#### Get Users
```http
GET /notifications/admin/users
Authorization: Bearer <admin_token>
```

#### Get Notification History
```http
GET /notifications/admin/notifications?limit=100
Authorization: Bearer <admin_token>
```

### User Endpoints

#### Get User Notifications
```http
GET /notifications?user_id=<user_id>
Authorization: Bearer <user_token>
```

#### Mark as Read
```http
PATCH /notifications/mark-all-read?user_id=<user_id>
Authorization: Bearer <user_token>
```

#### Delete Notification
```http
DELETE /notifications/<notification_id>
Authorization: Bearer <user_token>
```

### WebSocket

#### Connect
```javascript
const ws = new WebSocket('ws://localhost:8000/notifications/ws/notify');
```

#### Receive Messages
```javascript
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
};
```

## Notification Types

- **system**: System notifications (blue)
- **order**: Order-related notifications (green)
- **subscription**: Subscription updates (purple)
- **promotion**: Promotional messages (orange)
- **other**: Miscellaneous notifications (gray)

## Security

- Admin endpoints require admin privileges
- User endpoints require authentication
- WebSocket connections are validated
- Input validation on all endpoints

## Error Handling

- Graceful WebSocket reconnection
- Toast notifications for errors
- Loading states for better UX
- Validation feedback for form inputs

## Future Enhancements

- Email notifications
- Push notifications
- Notification templates
- Scheduled notifications
- Notification analytics
- User notification preferences
