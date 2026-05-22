# University Clone Web

Interactive 3D campus explorer built with React and Three.js. The scene renders a stylized voxel-inspired university map with animated cars, NPCs, day/night lighting, and rain effects.

## Highlights

- Real-time 3D campus scene using @react-three/fiber and Three.js
- Toggleable day/night lighting and rain weather effects
- Animated traffic and NPC walkers
- Landmarks, lamp posts, buildings, sports field, and main gate
- Data-driven layout via campus map definitions

## Controls

- Mouse drag: look around
- Arrow keys: move forward/backward and strafe
- UI buttons: toggle day/night and rain

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)

### Install

```bash
npm install
```

### Run (dev)

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Tech Stack

- React 19
- Vite
- Three.js
- @react-three/fiber (React renderer for Three.js)
- @react-three/drei (helpers and primitives)

## Project Structure

```
src/
	App.jsx            # Canvas setup, UI toggles
	App.css            # Layout styles
	index.css          # Global theme styles
	main.jsx           # App bootstrap
	components/        # Scene composition and objects
	data/              # Campus layout definitions
	utils/             # World/coordinate utilities
```

## Scene Architecture

- `App.jsx` hosts the `<Canvas>` and the mode toggles. It passes `mode` and `isRain` into the scene.
- `CampusScene.jsx` owns camera movement, input, and most of the lighting. It switches sky, sun/moon, and rain per mode.
- `VoxelWorld.jsx` composes the static world: ground, roads, buildings, main gate, sports field, lamps, and landmarks.

### Key Components

- `Ground`, `Roads`: base terrain and paths; add puddles during rain.
- `Buildings`: procedural windows and entrance styling.
- `MainGate`: gate pillars and signage using drei `Text`.
- `SportsField`: field geometry, goals, and corner lamps.
- `LampPosts`: auto-placed lamps near buildings and gate.
- `Landmarks`: tree rows and benches.
- `Cars`: instanced traffic along the main road.
- `Npcs`: animated walkers with simple gait.
- `SkyDome`, `Sun`, `Moon`, `DarkClouds`, `Rain`: weather and sky effects.

## Campus Data

Campus layout lives in `src/data/campus.js`. It defines:

- Map bounds (`width`, `height`)
- Paths (roads)
- Buildings and entrances
- NPC spawn hints
- Landmarks and sports fields

The data is shifted horizontally with a fixed offset to create a wider left margin and align the main gate with the road system.

## Coordinate System

Utilities in `src/utils/world.js` convert campus coordinates into world coordinates:

- `campusToWorld` converts map coordinates into Three.js space
- `rectToWorld` builds centered world rectangles
- `WORLD_SCALE` controls the campus-to-world scale
- `PLAYER_START` defines the initial camera/player position

## Assets

Static sprites and textures are loaded from the public folder:

- `/sun-48190.png` for the sun sprite
- `/moon.png` for the moon sprite
- `/darkcloud.png` for cloud layers
- `/Raindrop.jpeg` for rain particles

## Notes

- The project uses instanced meshes for cars to keep rendering efficient.
- Rain and puddles are only active when the rain mode is on.
- Camera movement is first-person style with smooth yaw/pitch dampening.

## Roadmap Ideas

- Add minimap and location labels
- Expose campus data editing via a GUI
- Add collision for fences and landmarks
- Add soundscapes for day/night and rain
