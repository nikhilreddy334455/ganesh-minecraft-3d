# 🕉️ Lord Ganesha 3D Voxel Minecraft Celebration

A browser-based, high-performance 3D Voxel Sandbox game built with Three.js and vanilla JavaScript celebrating Ganesh Chaturthi. Features an expansive 72×72 block world, an interactive Aarti ceremony, animated voxel devotees (NPCs), sacred water with swimming physics, a 19-block creative building palette, and dynamic variable-jump physics.

---

## 🌟 Key Features

- **🌍 Expansive 3D Voxel World**: 72×72 block terrain featuring rolling green hills, fertile soil, decorative sacred Peepal trees, and the elevated Grand Ganesh Pandal.
- **🐘 Lord Ganesha & Aarti Ceremony**: Detailed voxel Ganesha idol with glowing divine halo, brass diyas, flower petal showers, and procedural Web Audio shankha/dholak musical accompaniment.
- **👥 Animated Devotees (NPCs)**: Devotees dressed in festive Indian kurtas and sarees stroll the world, fold hands in a Namaste greeting when approached, and cheer during the Aarti ceremony.
- **💧 Sacred Water Lake & Fluid Physics**: Translucent, shimmering water body with buoyant swimming and wading physics.
- **🎒 19-Block Creative Palette**: Choose from Red & Gold Tent Fabrics, Pillars, Garlands, Diyas, Ganesha Idols, Grass, Dirt, Water, Sand, Stone, Cobblestone, Wood, Leaves, Marble, Bricks, Lanterns, and Glass.
- **🚀 Dynamic Variable Jump**: Tap Space for a standard hop (~1.1 blocks); hold down Space for sustained vertical thrust (~2.8 blocks high).
- **📱 Responsive & Mobile-Ready**: Full touch controls including virtual joystick, look drag, and quick action buttons.

---

## 🎮 Controls

### Desktop Keyboard & Mouse
| Control | Action |
| :--- | :--- |
| **W, A, S, D** | Move Forward / Left / Backward / Right |
| **Mouse Look** | Look around (click canvas to lock pointer) |
| **Space (Tap)** | Quick Hop (~1.1 blocks high) |
| **Space (Hold)** | High Jump (~2.8 blocks high) |
| **Left Click** | Place active block |
| **Right Click** | Break / Mine targeted block |
| **1 – 9** | Select Hotbar slot |
| **B / 🎒 Blocks** | Open Creative Block Palette modal |
| **E / 🙏 Aarti** | Perform Grand Aarti Ceremony near Lord Ganesha |
| **T** | Quick-build Grand Pandal at position |

### Mobile & Touch Devices
- **Left Joystick**: Move in all directions
- **Right Screen Drag**: Look / Aim camera
- **Jump Button**: Tap for quick hop, hold for high jump
- **Place / Break**: Dedicated touch buttons for block placement and mining
- **HUD Buttons**: Quick access to Aarti, Creative Palette, and Sound controls

---

## 🚀 Running Locally

You can serve this project with any standard local HTTP server:

```bash
# Python 3
python3 -m http.server 8080

# Or Node.js (npx)
npx serve .
```

Open `http://localhost:8080` in any modern web browser.

---

## 🛠️ Tech Stack

- **Graphics**: [Three.js](https://threejs.org/) (WebGL / PCFSoftShadowMap)
- **Physics**: Custom 3D Voxel AABB collision detection & liquid buoyancy simulation
- **Audio**: Web Audio API procedural synthesizer (Shankha, Bell, Aarti melodies)
- **Styling**: Vanilla CSS with glassmorphic UI design
