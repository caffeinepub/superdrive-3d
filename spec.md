# SuperDrive 3D

## Current State
Fresh project with only scaffolding. No App.tsx or game logic exists yet.

## Requested Changes (Diff)

### Add
- Full 3D supercar driving game running in the browser using Three.js (React Three Fiber)
- Multiple supercar models (BMW, Lamborghini, Ferrari, Bugatti inspired) selectable from a garage screen
- Open world city map: roads, highway, intersections, buildings, trees, skybox
- Day/night cycle with ambient lighting changes
- HDR-style lighting, shadows, and car reflections
- Third-person and interior camera views toggled with C key
- Realistic car physics: acceleration, steering, braking, nitro boost
- Traffic cars with simple AI lane-following
- Traffic lights at intersections
- Speedometer HUD
- Mini-map overlay
- Car selection garage screen
- Start / Pause menu
- Background music and engine/skid/crash audio using Howler.js or Web Audio API
- Controls: WASD / arrow keys, Space=brake, Shift=nitro, C=camera toggle
- Performance target: smooth 60 FPS in desktop browsers; mobile-friendly touch controls

### Modify
- main.tsx: wrap App in providers as needed

### Remove
- Nothing

## Implementation Plan
1. Install Three.js / React Three Fiber / Drei and Howler.js dependencies in frontend
2. Create game state management (zustand store): car selection, speed, nitro, camera mode, pause
3. Build World component: terrain plane, road network, buildings, trees, skybox
4. Build Car component with physics hook: velocity, steering, nitro, collision response
5. Build TrafficAI component: simple cars following lane waypoints
6. Build Camera rig: third-person follow + interior view
7. Build HUD: speedometer, nitro bar, mini-map canvas
8. Build GarageScreen: car selection with stats
9. Build StartMenu and PauseMenu overlays
10. Wire audio: engine pitch tied to speed, skid on drift, background music
11. Add touch/on-screen controls for mobile
12. Main App.tsx: state-machine routing between Garage → Game → Pause
