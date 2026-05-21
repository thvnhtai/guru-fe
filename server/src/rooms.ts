import * as Y from 'yjs'
import * as WebSocket from 'ws'

export interface RoomState {
  roomId: string
  document: Y.Doc
  connections: Map<string, WebSocket>
  userIds: Map<WebSocket, string>
  awareness: Map<string, any>
}

/**
 * Manage room documents and connections
 */
export class RoomManager {
  private rooms: Map<string, RoomState> = new Map()

  /**
   * Get or create room
   */
  getRoom(roomId: string): RoomState {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        document: new Y.Doc(),
        connections: new Map(),
        userIds: new Map(),
        awareness: new Map(),
      })
    }
    return this.rooms.get(roomId)!
  }

  /**
   * Add connection to room
   */
  addConnection(
    roomId: string,
    ws: WebSocket,
    userId: string,
    sessionId: string
  ) {
    const room = this.getRoom(roomId)
    const connId = sessionId || `${userId}-${Date.now()}`

    room.connections.set(connId, ws)
    room.userIds.set(ws, userId)

    // Initialize awareness for this user
    room.awareness.set(userId, {
      userId,
      sessionId: connId,
      clock: 0,
      state: {
        name: userId,
        color: this.hashToColor(userId),
      },
    })

    return connId
  }

  /**
   * Remove connection from room
   */
  removeConnection(roomId: string, ws: WebSocket, userId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    // Find and remove connection
    for (const [connId, conn] of room.connections.entries()) {
      if (conn === ws) {
        room.connections.delete(connId)
        break
      }
    }

    room.userIds.delete(ws)

    // Remove from awareness
    room.awareness.delete(userId)

    // Clean up empty rooms
    if (room.connections.size === 0) {
      this.rooms.delete(roomId)
    }
  }

  /**
   * Broadcast message to all clients in room except sender
   */
  broadcast(
    roomId: string,
    message: any,
    exclude?: WebSocket
  ) {
    const room = this.rooms.get(roomId)
    if (!room) return

    const payload = JSON.stringify(message)
    for (const [, ws] of room.connections) {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
        ws.send(payload)
      }
    }
  }

  /**
   * Get room document
   */
  getDocument(roomId: string): Y.Doc {
    return this.getRoom(roomId).document
  }

  /**
   * Get room connections count
   */
  getConnectionCount(roomId: string): number {
    const room = this.rooms.get(roomId)
    return room ? room.connections.size : 0
  }

  /**
   * Get room participants
   */
  getParticipants(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return []

    return Array.from(room.awareness.values())
  }

  /**
   * Generate color from string hash
   */
  private hashToColor(str: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    return colors[Math.abs(hash) % colors.length]
  }
}

export const roomManager = new RoomManager()
