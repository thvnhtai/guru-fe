import * as http from 'http'
import * as WebSocket from 'ws'
import * as Y from 'yjs'
import { roomManager } from './rooms.js'
import {
  parseAuthMessage,
  validateRoomAccess,
  addParticipant,
  removeParticipant,
  ConnectionContext,
} from './auth.js'
import {
  handleSync,
  sendInitialSync,
} from './handlers.js'
import { loadDocumentState, saveDocumentState } from './persistence.js'

const PORT = parseInt(process.env.WS_PORT || '4000', 10)

const server = http.createServer()
const wss = new WebSocket.Server({ server })

/**
 * Track client connections with their context
 */
const clientContexts = new Map<WebSocket, ConnectionContext>()

/**
 * Handle new WebSocket connection
 */
wss.on('connection', (ws: WebSocket) => {
  let context: ConnectionContext | null = null
  let initialized = false

  ws.on('message', async (data: Buffer) => {
    try {
      // First message: authentication and room join
      if (!initialized) {
        const authStr = data.toString('utf-8')
        const authData = parseAuthMessage(authStr)

        if (!authData?.roomId || !authData?.userId) {
          ws.close(1008, 'Invalid authentication message')
          return
        }

        // Validate room access
        const hasAccess = await validateRoomAccess(
          authData.roomId,
          authData.userId,
          authData.isObserver || false
        )

        if (!hasAccess) {
          ws.close(1008, 'Access denied')
          return
        }

        // Create context
        context = {
          roomId: authData.roomId,
          userId: authData.userId,
          sessionId: authData.sessionId || `${authData.userId}-${Date.now()}`,
          isObserver: authData.isObserver || false,
        }

        clientContexts.set(ws, context)
        initialized = true

        // Add connection to room manager
        roomManager.addConnection(
          context.roomId,
          ws,
          context.userId,
          context.sessionId
        )

        // Load or create room document
        let room = roomManager.getRoom(context.roomId)
        if (room.document.getMap('meta').size === 0) {
          // Document is empty, try to load from persistent storage
          const persistedState = await loadDocumentState(context.roomId)
          if (persistedState) {
            Y.applyUpdate(room.document, persistedState)
          }
        }

        // Track participant in database
        await addParticipant(
          context.roomId,
          context.userId,
          context.sessionId
        )

        // Send initial sync to client
        sendInitialSync(ws, room.document)

        // Broadcast participant joined
        roomManager.broadcast(
          context.roomId,
          {
            type: 'participant-joined',
            userId: context.userId,
            sessionId: context.sessionId,
            awareness: room.awareness.get(context.userId),
          },
          ws
        )

        return
      }

      // Subsequent messages: Yjs sync protocol
      if (!context) {
        ws.close(1011, 'Not authenticated')
        return
      }

      const room = roomManager.getRoom(context.roomId)
      handleSync(ws, data, context.roomId, room.document)

      // On every update, save document state
      const update = Y.encodeStateAsUpdate(room.document)
      if (update.length > 0) {
        await saveDocumentState(context.roomId, update)
      }
    } catch (error) {
      console.error('Message handler error:', error)
      ws.close(1011, 'Internal server error')
    }
  })

  ws.on('close', async () => {
    if (!context) return

    try {
      // Remove from room
      roomManager.removeConnection(context.roomId, ws, context.userId)

      // Remove from database
      await removeParticipant(context.roomId, context.userId)

      // Broadcast participant left
      roomManager.broadcast(context.roomId, {
        type: 'participant-left',
        userId: context.userId,
        sessionId: context.sessionId,
      })

      // Persist final state
      const room = roomManager.getRoom(context.roomId)
      if (room) {
        const update = Y.encodeStateAsUpdate(room.document)
        await saveDocumentState(context.roomId, update)
      }
    } catch (error) {
      console.error('Close handler error:', error)
    } finally {
      clientContexts.delete(ws)
    }
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('Shutting down server...')

  // Close all connections
  wss.clients.forEach((ws) => {
    ws.close(1000, 'Server shutting down')
  })

  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

server.listen(PORT, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`)
})
