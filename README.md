# 🕉️ Lord Ganesha 3D Voxel Minecraft Celebration

A browser-based, high-performance 3D Voxel Sandbox game built with Three.js and vanilla JavaScript celebrating Ganesh Chaturthi. Features an expansive 72×72 block world, real-time peer-to-peer multiplayer with room codes, an interactive Aarti ceremony, sacred water with swimming physics, a 19-block creative building palette, and dynamic variable-jump physics.

---

## 🌟 Key Features

- **👥 Multiplayer with Room Codes**: Host a private room with a 5-character code (or direct link) and play with your friend in real time over WebRTC DataChannels! Real-time player avatars, 3D nametags, block synchronization, and synchronized Aarti celebrations.
- **🌍 Expansive 3D Voxel World**: 72×72 block terrain featuring rolling green hills, fertile soil, decorative sacred Peepal trees, and the elevated Grand Ganesh Pandal.
- **🐘 Lord Ganesha & Aarti Ceremony**: Detailed voxel Ganesha idol with glowing divine halo, brass diyas, flower petal showers, and procedural Web Audio shankha/dholak musical accompaniment.
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
| **M / 👥 Friends** | Open Multiplayer Room Code modal |
| **B / 🎒 Blocks** | Open Creative Block Palette modal |
| **E / 🙏 Aarti** | Perform Grand Aarti Ceremony near Lord Ganesha |
| **T** | Quick-build Grand Pandal at position |

### Mobile & Touch Devices
- **Left Joystick**: Move in all directions
- **Right Screen Drag**: Look / Aim camera
- **Jump Button**: Tap for quick hop, hold for high jump
- **Place / Break**: Dedicated touch buttons for block placement and mining
- **HUD Buttons**: Quick access to Multiplayer, Aarti, Creative Palette, and Sound controls

---

## 👥 How to Play with Friends

1. Click **👥 Friends (M)** in the top navigation bar.
2. Click **🎮 Create Room Code**.
3. Copy the **5-character Room Code** or **Invite Link** and share it with your friend.
4. Your friend clicks **👥 Friends**, types the code, and clicks **Join Game** (or just opens the invite link).
5. Both players will appear in each other's 3D world, can build together, and celebrate Aarti simultaneously!

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
