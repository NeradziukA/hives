# Architecture

## Auth + Connection Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server (HTTP)
    participant WS as Server (WebSocket)
    participant O as Other Clients

    C->>S: POST /api/login { username, password }
    S->>C: 200 { id }

    C->>WS: TCP connect
    C->>WS: UNIT_AUTH { srcId: id }
    WS->>C: UNIT_AUTHENTICATED { id, config }
    Note over C: Starts LocationTracker (GPS)

    C->>WS: UNIT_GET_ALL { coords }
    WS->>C: INIT_UNITS { users[], staticObjects[] }
    WS->>O: UNIT_CONNECTED { user }
    Note over C: Creates 3D models for each user / building

    loop Every 10 000 ms
        C->>WS: UNIT_MOVED { id, coords }
        WS->>O: UNIT_MOVED { id, coords }
        Note over O: Updates 3D model position
    end

    C->>WS: disconnect
    WS->>O: UNIT_DISCONNECTED { id }
    Note over O: Removes 3D model from scene
```

## WebSocket Message Types

| Type | Direction | Payload | Description |
|------|-----------|---------|-------------|
| `UNIT_AUTH` | C → S | `{ srcId: id }` | Client identifies itself after connect |
| `UNIT_AUTHENTICATED` | S → C | `{ id, config }` | Auth confirmed, game config sent |
| `AUTH_ERROR` | S → C | `{ error }` | Auth failed; connection closed |
| `UNIT_GET_ALL` | C → S | `{ coords }` | Request full state |
| `INIT_UNITS` | S → C | `{ users[], staticObjects[] }` | Full snapshot |
| `UNIT_MOVED` | C → S, S → C | `{ id, coords }` | Position update |
| `UNIT_CONNECTED` | S → C | `{ user }` | New user joined |
| `UNIT_DISCONNECTED` | S → C | `{ id }` | User left |

## Server Data Structures

```typescript
// In-memory (real-time positions)
clientsSockets: { [id: string]: WebSocket }
users: { [id: string]: User }

interface User {
  id: string          // UUID (from players table)
  type: string        // e.g. "HUMAN_A"
  coords: { lat: number, lon: number }
}
```

## Client Scene

Three.js scene origin = the authenticated client's initial coordinates.
All positions are converted from lat/lon to scene-local meters using `lib/geo/constants.ts`.

```
Scene origin (0, 0, 0) = own unit's starting position
Hex grid overlay   = pointy-top hexagons, radius 150 m, hidden at zoom > 25
Camera = top-down perspective, zoom via mouse wheel / ZoomSlider
Own unit color = red / orange / gold palette
Other units color = blue / cyan / green palette
Static buildings = separate color palette
Model height = 1.7 m (converted to lat/lon degrees); LOD dot below 20 px screen size
```

## Coordinate System

`lib/geo/constants.ts` provides:
- `metersToLatDegrees(m)` — meters → latitude degrees (constant ~111320 m/deg)
- `metersToLonDegrees(m, lat)` — meters → longitude degrees (varies with cosine of latitude)

This is used to position 3D models relative to the origin in geographic space.
