from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}  # user_email -> WebSocket connection
        self.group_connections: Dict[str, Dict[str, WebSocket]] = {}  # community/category -> {user_email -> WebSocket}

    async def connect(self, websocket: WebSocket, user_email: str, community: str = None, category: str = None):
        await websocket.accept()
        self.active_connections[user_email] = websocket
        if community and category:
            if (community, category) not in self.group_connections:
                self.group_connections[(community, category)] = {}
            self.group_connections[(community, category)][user_email] = websocket

    def disconnect(self, user_email: str, community: str = None, category: str = None):
        if community and category:
            if (community, category) in self.group_connections and user_email in self.group_connections[(community, category)]:
                del self.group_connections[(community, category)][user_email]
        if user_email in self.active_connections:
            del self.active_connections[user_email]

    async def send_personal_message(self, user_email: str, message: str):
        websocket = self.active_connections.get(user_email)
        if websocket:
            await websocket.send_text(message)

    async def send_group_message(self, community: str, category: str, message: str):
        # Send a message to all users in a specific group
        for websocket in self.group_connections.get((community, category), {}).values():
            await websocket.send_text(message)

    async def broadcast(self, message: str):
        for websocket in self.active_connections.values():
            await websocket.send_text(message)
