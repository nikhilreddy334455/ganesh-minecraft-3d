// Peer-to-Peer Multiplayer Module using PeerJS (WebRTC DataChannels)
// Allows two players to share a 5-character Room Code, connect, build together, and see each other in 3D!

class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.conn = null;
        this.isHost = false;
        this.isConnected = false;
        this.roomCode = null;
        this.remotePlayerMesh = null;
        this.remotePlayerTarget = {
            pos: new THREE.Vector3(0, 1.7, 5),
            yaw: 0,
            pitch: 0,
            isMoving: false
        };
        this.limbSwing = 0;
        this.syncInterval = null;

        // Auto-join from URL parameter ?room=XYZ
        this.checkUrlForRoomCode();
    }

    checkUrlForRoomCode() {
        try {
            const params = new URLSearchParams(window.location.search);
            const roomFromUrl = params.get('room') || params.get('code');
            if (roomFromUrl) {
                this.pendingRoomCode = roomFromUrl.trim().toUpperCase();
            }
        } catch (e) {
            console.warn('Could not read URL params:', e);
        }
    }

    // Generate random 5-character room code (e.g. GAN-82 or 7K9X2)
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Initialize Host Peer
    hostRoom(onReady) {
        this.disconnect();
        this.isHost = true;
        this.roomCode = this.generateRoomCode();
        const peerId = `ganesh-craft-${this.roomCode}`;

        this.updateStatusUI('hosting', this.roomCode);

        try {
            this.peer = new Peer(peerId, {
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });

            this.peer.on('open', (id) => {
                console.log('Host Peer opened with ID:', id);
                this.updateStatusUI('waiting', this.roomCode);
                if (onReady) onReady(this.roomCode);
            });

            this.peer.on('connection', (conn) => {
                console.log('Friend incoming connection received!');
                this.setupConnection(conn, 'Friend');
            });

            this.peer.on('error', (err) => {
                console.error('PeerJS Host Error:', err);
                if (err.type === 'unavailable-id') {
                    // Regenerate code if already taken
                    this.hostRoom(onReady);
                } else {
                    this.game.showToast(`Multiplayer error: ${err.message || 'Connection failed'}`, 4000);
                    this.updateStatusUI('disconnected');
                }
            });
        } catch (err) {
            console.error('PeerJS failed to initialize:', err);
            this.game.showToast('Multiplayer service unavailable offline.', 3000);
        }
    }

    // Join a Host by Room Code
    joinRoom(code) {
        if (!code) return;
        this.disconnect();
        this.isHost = false;
        this.roomCode = code.trim().toUpperCase();
        const hostPeerId = `ganesh-craft-${this.roomCode}`;

        this.updateStatusUI('joining', this.roomCode);

        try {
            this.peer = new Peer({
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });

            this.peer.on('open', () => {
                console.log('Client Peer opened, connecting to host:', hostPeerId);
                const conn = this.peer.connect(hostPeerId, {
                    reliable: true
                });
                this.setupConnection(conn, 'Host');
            });

            this.peer.on('error', (err) => {
                console.error('PeerJS Join Error:', err);
                this.game.showToast(`Could not connect to room "${this.roomCode}". Verify code!`, 4500);
                this.updateStatusUI('disconnected');
            });
        } catch (err) {
            console.error('PeerJS failed to initialize:', err);
            this.game.showToast('Multiplayer service unavailable offline.', 3000);
        }
    }

    // Setup DataChannel connection handlers
    setupConnection(conn, friendLabel = 'Friend') {
        this.conn = conn;

        conn.on('open', () => {
            console.log('Connected to peer DataChannel!');
            this.isConnected = true;
            this.updateStatusUI('connected', this.roomCode, friendLabel);
            this.game.showToast(`🎉 Connected with ${friendLabel}! You are playing together! 🐘`, 5000);

            // Create 3D avatar in Three.js scene
            this.createRemotePlayerAvatar(friendLabel);

            // If Host, send current modified blocks so friend sees everything built so far
            if (this.isHost) {
                this.sendInitialWorldState();
            }

            // Start sending local position at 25 Hz
            this.startPositionSync();
        });

        conn.on('data', (data) => {
            this.handleIncomingData(data);
        });

        conn.on('close', () => {
            console.log('Peer connection closed.');
            this.game.showToast(`👋 ${friendLabel} left the game.`, 4000);
            this.cleanupRemotePlayer();
            this.isConnected = false;
            this.updateStatusUI('disconnected');
        });

        conn.on('error', (err) => {
            console.warn('Connection error:', err);
        });
    }

    // Handle incoming messages over DataChannel
    handleIncomingData(data) {
        if (!data || !data.type) return;

        switch (data.type) {
            case 'pos':
                // Update remote player target position & rotation
                if (data.x !== undefined && data.y !== undefined && data.z !== undefined) {
                    this.remotePlayerTarget.pos.set(data.x, data.y, data.z);
                    this.remotePlayerTarget.yaw = data.yaw || 0;
                    this.remotePlayerTarget.pitch = data.pitch || 0;
                    this.remotePlayerTarget.isMoving = !!data.moving;
                }
                break;

            case 'place':
                // Friend placed a block
                if (this.game.voxelWorld) {
                    this.game.voxelWorld.placeBlock(data.x, data.y, data.z, data.blockType, false);
                }
                break;

            case 'break':
                // Friend broke a block
                if (this.game.voxelWorld) {
                    this.game.voxelWorld.breakBlock(data.x, data.y, data.z);
                }
                break;

            case 'aarti':
                // Friend performed Aarti pooja!
                if (!this.game.isAartiActive) {
                    this.game.showToast('🌺 Your friend initiated Lord Ganesha Aarti Pooja! 🙏', 4000);
                    this.game.performAartiCeremony();
                }
                break;

            case 'world_sync':
                // Client receives current modified blocks from Host
                if (data.blocks && this.game.voxelWorld) {
                    data.blocks.forEach(b => {
                        this.game.voxelWorld.placeBlock(b.x, b.y, b.z, b.type, false);
                    });
                    this.game.showToast('✨ World synchronized with Host!', 3000);
                }
                break;
        }
    }

    // Send local player position/yaw to peer at 25 Hz
    startPositionSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        this.syncInterval = setInterval(() => {
            if (!this.isConnected || !this.conn || !this.game.player) return;

            const pos = this.game.player.position;
            const yaw = this.game.player.yaw;
            const pitch = this.game.player.pitch;
            const isMoving = this.game.player.velocity.lengthSq() > 0.05;

            this.conn.send({
                type: 'pos',
                x: Number(pos.x.toFixed(2)),
                y: Number(pos.y.toFixed(2)),
                z: Number(pos.z.toFixed(2)),
                yaw: Number(yaw.toFixed(3)),
                pitch: Number(pitch.toFixed(3)),
                moving: isMoving
            });
        }, 40); // 25 updates per second
    }

    // Broadcast block placement
    broadcastPlaceBlock(x, y, z, blockType) {
        if (this.isConnected && this.conn) {
            this.conn.send({
                type: 'place',
                x, y, z,
                blockType
            });
        }
    }

    // Broadcast block break
    broadcastBreakBlock(x, y, z) {
        if (this.isConnected && this.conn) {
            this.conn.send({
                type: 'break',
                x, y, z
            });
        }
    }

    // Broadcast Aarti ceremony
    broadcastAarti() {
        if (this.isConnected && this.conn) {
            this.conn.send({
                type: 'aarti'
            });
        }
    }

    // Host sends non-default placed blocks to client
    sendInitialWorldState() {
        if (!this.game.voxelWorld || !this.conn) return;
        const placedList = [];
        for (const [key, block] of this.game.voxelWorld.blocks) {
            if (block.type !== 'grass' && block.type !== 'water') {
                placedList.push({
                    x: block.x,
                    y: block.y,
                    z: block.z,
                    type: block.type
                });
            }
        }
        if (placedList.length > 0) {
            this.conn.send({
                type: 'world_sync',
                blocks: placedList
            });
        }
    }

    // Create 3D Voxel Avatar for the remote friend
    createRemotePlayerAvatar(name = 'Friend') {
        this.cleanupRemotePlayer();

        const group = new THREE.Group();
        group.position.copy(this.remotePlayerTarget.pos);

        // Sleek Minecraft Voxel Gamer Bot (Zero human/people elements)
        const diamondMat = new THREE.MeshStandardMaterial({ color: 0x00E5FF, roughness: 0.3, metalness: 0.6 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.3, metalness: 0.7 });
        const darkArmorMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.5 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x76FF03 });

        // Head (0.4 x 0.4 x 0.4)
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const head = new THREE.Mesh(headGeo, darkArmorMat);
        head.position.y = 1.6;
        head.castShadow = true;
        group.add(head);

        // Glowing visor
        const visorGeo = new THREE.BoxGeometry(0.32, 0.08, 0.42);
        const visor = new THREE.Mesh(visorGeo, eyeMat);
        visor.position.y = 0.02;
        head.add(visor);

        // Torso (0.5 x 0.65 x 0.3)
        const bodyGeo = new THREE.BoxGeometry(0.5, 0.65, 0.3);
        const body = new THREE.Mesh(bodyGeo, diamondMat);
        body.position.y = 1.05;
        body.castShadow = true;
        group.add(body);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
        const leftArm = new THREE.Mesh(armGeo, goldMat);
        leftArm.position.set(-0.35, 1.05, 0);
        leftArm.castShadow = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, goldMat);
        rightArm.position.set(0.35, 1.05, 0);
        rightArm.castShadow = true;
        group.add(rightArm);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.2, 0.7, 0.22);
        const leftLeg = new THREE.Mesh(legGeo, darkArmorMat);
        leftLeg.position.set(-0.14, 0.35, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, darkArmorMat);
        rightLeg.position.set(0.14, 0.35, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);

        // 3D Canvas Floating Nametag Billboard
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.roundRect(10, 8, 236, 48, 12);
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🎮 ${name}`, 128, 32);

        const textTex = new THREE.CanvasTexture(canvas);
        const textMat = new THREE.SpriteMaterial({ map: textTex, depthTest: false });
        const textSprite = new THREE.Sprite(textMat);
        textSprite.position.y = 2.05;
        textSprite.scale.set(1.4, 0.35, 1);
        group.add(textSprite);

        this.game.scene.add(group);
        this.remotePlayerMesh = {
            group,
            head,
            body,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            textSprite
        };
    }

    // Smoothly animate & interpolate remote player avatar in animate()
    update(delta) {
        if (!this.remotePlayerMesh) return;

        const group = this.remotePlayerMesh.group;
        const target = this.remotePlayerTarget;

        // Smooth position LERP
        group.position.lerp(target.pos, Math.min(1.0, delta * 15));

        // Smooth rotation LERP
        const curY = group.rotation.y;
        let diff = target.yaw - curY;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        group.rotation.y += diff * Math.min(1.0, delta * 15);

        // Animate walking limbs
        if (target.isMoving) {
            this.limbSwing += delta * 10;
            const swing = Math.sin(this.limbSwing) * 0.6;
            this.remotePlayerMesh.leftLeg.rotation.x = swing;
            this.remotePlayerMesh.rightLeg.rotation.x = -swing;
            this.remotePlayerMesh.leftArm.rotation.x = -swing;
            this.remotePlayerMesh.rightArm.rotation.x = swing;
        } else {
            // Idle return to rest
            this.remotePlayerMesh.leftLeg.rotation.x *= 0.8;
            this.remotePlayerMesh.rightLeg.rotation.x *= 0.8;
            this.remotePlayerMesh.leftArm.rotation.x *= 0.8;
            this.remotePlayerMesh.rightArm.rotation.x *= 0.8;
        }
    }

    // Clean up avatar when disconnected
    cleanupRemotePlayer() {
        if (this.remotePlayerMesh && this.remotePlayerMesh.group) {
            this.game.scene.remove(this.remotePlayerMesh.group);
            this.remotePlayerMesh = null;
        }
    }

    disconnect() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        if (this.conn) {
            try { this.conn.close(); } catch (e) {}
            this.conn = null;
        }
        if (this.peer) {
            try { this.peer.destroy(); } catch (e) {}
            this.peer = null;
        }
        this.cleanupRemotePlayer();
        this.isConnected = false;
        this.isHost = false;
        this.roomCode = null;
        this.updateStatusUI('disconnected');
    }

    // Update Multiplayer HUD & Modal UI elements
    updateStatusUI(state, code = '', label = '') {
        const badge = document.getElementById('mp-status-badge');
        const hostCodeDisplay = document.getElementById('mp-host-code');
        const hostWaiting = document.getElementById('mp-host-waiting');
        const shareLinkInput = document.getElementById('mp-share-link');

        const baseUrl = window.location.origin + window.location.pathname;

        if (state === 'hosting' || state === 'waiting') {
            if (hostCodeDisplay) hostCodeDisplay.innerText = code;
            if (hostWaiting) hostWaiting.style.display = 'block';
            if (shareLinkInput) shareLinkInput.value = `${baseUrl}?room=${code}`;
            if (badge) {
                badge.style.display = 'inline-flex';
                badge.className = 'mp-badge mp-badge-waiting';
                badge.innerHTML = `🟡 Room: <strong>${code}</strong> (Waiting...)`;
            }
        } else if (state === 'connected') {
            if (hostWaiting) hostWaiting.style.display = 'none';
            if (badge) {
                badge.style.display = 'inline-flex';
                badge.className = 'mp-badge mp-badge-connected';
                badge.innerHTML = `🟢 Playing with <strong>${label}</strong> (Room: ${code})`;
            }
        } else if (state === 'joining') {
            if (badge) {
                badge.style.display = 'inline-flex';
                badge.className = 'mp-badge mp-badge-waiting';
                badge.innerHTML = `🟡 Joining <strong>${code}</strong>...`;
            }
        } else {
            // Disconnected
            if (hostWaiting) hostWaiting.style.display = 'none';
            if (badge) {
                badge.style.display = 'none';
            }
        }
    }
}
