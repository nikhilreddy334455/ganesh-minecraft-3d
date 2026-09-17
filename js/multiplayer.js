// Peer-to-Peer & Local Multi-Tab Multiplayer Module for Ganesh Pandal Craft 3D
// Dual-Transport: WebRTC via PeerJS (Internet / Network) + BroadcastChannel (Local Tabs & Windows)
// Allows players to share a Room Code, build together, break blocks, perform Aarti, and see each other in 3D!

class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.conn = null;
        this.bc = null;
        this.myClientId = 'usr_' + Math.random().toString(36).substring(2, 9);
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

    // Generate random 5-character room code (e.g. 7K9X2)
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Host with custom room code (e.g. for Public World 'UTSAV')
    hostRoomCustom(customCode, onReady) {
        this.disconnect();
        this.isHost = true;
        this.roomCode = customCode.trim().toUpperCase();
        const peerId = `ganesh-craft-${this.roomCode}`;

        this.updateStatusUI('hosting', this.roomCode);
        if (onReady) onReady(this.roomCode);

        // 1. BroadcastChannel for local/multi-tab
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.bc = new BroadcastChannel('ganesh_craft_room_' + this.roomCode);
                this.bc.onmessage = (e) => this.handleIncomingData(e.data);
            } catch (err) {
                console.warn('BroadcastChannel notice:', err);
            }
        }

        // 2. PeerJS for internet/LAN WebRTC
        if (typeof Peer !== 'undefined') {
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
                this.peer.on('open', () => {
                    this.updateStatusUI('waiting', this.roomCode);
                });
                this.peer.on('connection', (conn) => {
                    this.setupConnection(conn, 'Friend');
                });
                this.peer.on('error', () => {
                    this.updateStatusUI('waiting', this.roomCode);
                });
            } catch (err) {
                console.warn('PeerJS fallback:', err);
            }
        }
    }

    // 1-Click Instant Public World (No room code needed!)
    joinPublicWorld() {
        if (this.game && this.game.showToast) {
            this.game.showToast('🌍 Entering Public Festive World (Room: UTSAV)...', 3000);
        }
        this.joinRoom('UTSAV');
        // If not connected after 1.5s, host the public world so others can join!
        setTimeout(() => {
            if (!this.isConnected) {
                this.hostRoomCustom('UTSAV', (code) => {
                    try { localStorage.setItem('ganesh_active_room', code); } catch (err) {}
                    if (this.game && this.game.showToast) {
                        this.game.showToast('🌟 You are hosting the Public Festive World! Friends can join now!', 4000);
                    }
                });
            }
        }, 1200);
    }

    // Initialize Host Room
    hostRoom(onReady) {
        this.disconnect();
        this.isHost = true;
        this.roomCode = this.generateRoomCode();
        const peerId = `ganesh-craft-${this.roomCode}`;

        this.updateStatusUI('hosting', this.roomCode);
        // Invoke onReady immediately so UI shows room code and copies link without waiting for slow cloud signaling
        if (onReady) onReady(this.roomCode);

        // 1. Setup BroadcastChannel for 0ms instant local / multi-tab connectivity
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.bc = new BroadcastChannel('ganesh_craft_room_' + this.roomCode);
                this.bc.onmessage = (e) => this.handleIncomingData(e.data);
            } catch (err) {
                console.warn('BroadcastChannel notice:', err);
            }
        }

        // 2. Setup WebRTC PeerJS for cross-device internet connectivity
        if (typeof Peer !== 'undefined') {
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
                });

                this.peer.on('connection', (conn) => {
                    console.log('Incoming WebRTC peer connection received!');
                    this.setupConnection(conn, 'Friend');
                });

                this.peer.on('error', (err) => {
                    console.warn('PeerJS Host notice:', err);
                    if (err.type === 'unavailable-id') {
                        this.hostRoom(onReady);
                    } else {
                        // Keep broadcast channel alive even if cloud signaling times out
                        this.updateStatusUI('waiting', this.roomCode);
                    }
                });
            } catch (err) {
                console.warn('PeerJS fallback to BroadcastChannel:', err);
                this.updateStatusUI('waiting', this.roomCode);
            }
        } else {
            this.updateStatusUI('waiting', this.roomCode);
        }
    }

    // Join Room by Code
    joinRoom(code) {
        if (!code) return;
        this.disconnect();
        this.isHost = false;
        this.roomCode = code.trim().toUpperCase();
        const hostPeerId = `ganesh-craft-${this.roomCode}`;

        this.updateStatusUI('joining', this.roomCode);

        // 1. Connect via BroadcastChannel (instant for local / same network tabs)
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.bc = new BroadcastChannel('ganesh_craft_room_' + this.roomCode);
                this.bc.onmessage = (e) => this.handleIncomingData(e.data);

                // Ping host to establish connection
                setTimeout(() => {
                    if (this.bc) {
                        this.bc.postMessage({
                            type: 'join_request',
                            senderId: this.myClientId,
                            roomCode: this.roomCode
                        });
                    }
                }, 150);
            } catch (err) {
                console.warn('BroadcastChannel join notice:', err);
            }
        }

        // 2. Connect via PeerJS WebRTC (for cross-network / internet devices)
        if (typeof Peer !== 'undefined') {
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
                    console.warn('PeerJS Client notice:', err);
                    if (!this.isConnected) {
                        // Check if BroadcastChannel succeeded before showing error
                        setTimeout(() => {
                            if (!this.isConnected) {
                                this.game.showToast(`Could not connect to room "${this.roomCode}". Verify room code!`, 4000);
                                this.updateStatusUI('disconnected');
                            }
                        }, 1200);
                    }
                });
            } catch (err) {
                console.warn('PeerJS Client init fallback:', err);
            }
        }
    }

    // Setup DataChannel connection handlers
    setupConnection(conn, friendLabel = 'Friend') {
        this.conn = conn;

        conn.on('open', () => {
            this.markConnected(friendLabel);
            if (this.isHost) {
                this.sendInitialWorldState();
            }
        });

        conn.on('data', (data) => {
            this.handleIncomingData(data);
        });

        conn.on('close', () => {
            this.handlePeerLeave(friendLabel);
        });

        conn.on('error', (err) => {
            console.warn('Connection error:', err);
        });
    }

    markConnected(friendLabel = 'Friend') {
        if (this.isConnected) return;
        this.isConnected = true;
        this.updateStatusUI('connected', this.roomCode, friendLabel);
        this.game.showToast(`🎉 Connected with ${friendLabel}! You can now build and perform Aarti together! 🐘`, 5000);

        this.createRemotePlayerAvatar(friendLabel);
        this.startPositionSync();
    }

    handlePeerLeave(friendLabel = 'Friend') {
        this.game.showToast(`👋 ${friendLabel} left the room.`, 3500);
        this.cleanupRemotePlayer();
        this.isConnected = false;
        this.updateStatusUI('disconnected');
    }

    // Unified Send Data over all active transports (WebRTC + BroadcastChannel)
    sendData(payload) {
        payload.senderId = this.myClientId;

        // Send via PeerJS WebRTC
        if (this.conn && this.conn.open) {
            try {
                this.conn.send(payload);
            } catch (e) {}
        }

        // Send via BroadcastChannel
        if (this.bc) {
            try {
                this.bc.postMessage(payload);
            } catch (e) {}
        }
    }

    // Handle incoming messages over DataChannel & BroadcastChannel
    handleIncomingData(data) {
        if (!data || !data.type) return;
        if (data.senderId && data.senderId === this.myClientId) return; // Prevent echo

        switch (data.type) {
            case 'join_request':
                // Someone joined our room via BroadcastChannel
                if (this.isHost) {
                    this.markConnected('Friend');
                    this.sendInitialWorldState();
                    this.sendData({
                        type: 'join_ack',
                        roomCode: this.roomCode
                    });
                }
                break;

            case 'join_ack':
                // Received host ack via BroadcastChannel
                this.markConnected('Host');
                break;

            case 'pos':
                // Update remote player target position & rotation
                if (data.x !== undefined && data.y !== undefined && data.z !== undefined) {
                    if (!this.remotePlayerMesh) {
                        this.createRemotePlayerAvatar('Friend');
                    }
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
                    if (this.game.levelManager) {
                        this.game.levelManager.onBlockPlaced(data.blockType);
                    }
                }
                break;

            case 'break':
                // Friend broke a block
                if (this.game.voxelWorld) {
                    this.game.voxelWorld.breakBlock(data.x, data.y, data.z);
                    if (this.game.levelManager && data.blockType) {
                        this.game.levelManager.onBlockBroken(data.blockType);
                    }
                }
                break;

            case 'aarti':
                // Friend performed Aarti pooja!
                if (!this.game.isAartiActive) {
                    this.game.showToast('🌺 Your friend initiated Lord Ganesha Aarti Pooja! 🙏', 4000);
                    this.game.performAartiCeremony(false);
                }
                if (this.game.levelManager) {
                    this.game.levelManager.onAartiPerformed();
                }
                break;

            case 'restart':
                // Friend restarted the world
                this.game.showToast('🔄 The world was restarted by your friend!', 3500);
                this.game.restartGame(false);
                break;

            case 'world_sync':
                // Receive current placed blocks from Host
                if (data.blocks && this.game.voxelWorld) {
                    data.blocks.forEach(b => {
                        this.game.voxelWorld.placeBlock(b.x, b.y, b.z, b.type, false);
                    });
                    this.game.showToast('✨ Shared world synchronized with Host!', 3000);
                }
                break;
        }
    }

    // Send local player position/yaw to peer at 25 Hz
    startPositionSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        this.syncInterval = setInterval(() => {
            if (!this.isConnected || !this.game.player) return;

            const pos = this.game.player.position;
            const yaw = this.game.player.yaw;
            const pitch = this.game.player.pitch;
            const isMoving = this.game.player.velocity.lengthSq() > 0.05;

            this.sendData({
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
        if (this.isConnected) {
            this.sendData({
                type: 'place',
                x, y, z,
                blockType
            });
        }
    }

    // Broadcast block break
    broadcastBreakBlock(x, y, z) {
        if (this.isConnected) {
            this.sendData({
                type: 'break',
                x, y, z
            });
        }
    }

    // Broadcast Aarti ceremony
    broadcastAarti() {
        if (this.isConnected) {
            this.sendData({
                type: 'aarti'
            });
        }
    }

    // Broadcast world restart
    broadcastRestart() {
        if (this.isConnected) {
            this.sendData({
                type: 'restart'
            });
        }
    }

    // Host sends placed building blocks to client
    sendInitialWorldState() {
        if (!this.game.voxelWorld) return;
        const placedList = [];
        for (const [key, block] of this.game.voxelWorld.blocks) {
            // Send architectural & sacred blocks placed
            if (block.type !== 'grass' && block.type !== 'water' && block.type !== 'dirt' && block.type !== 'stone') {
                placedList.push({
                    x: block.x,
                    y: block.y,
                    z: block.z,
                    type: block.type
                });
            }
        }
        if (placedList.length > 0) {
            this.sendData({
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

        // Materials for Avatar
        const saffronMat = new THREE.MeshStandardMaterial({ color: 0xFF6D00, roughness: 0.5 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.7, roughness: 0.3 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xDDA15E, roughness: 0.6 });
        const darkArmorMat = new THREE.MeshStandardMaterial({ color: 0x9D0208, roughness: 0.5 });

        // Head with Traditional Turban
        const headGeo = new THREE.BoxGeometry(0.48, 0.48, 0.48);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.48;
        head.castShadow = true;
        group.add(head);

        // Auspicious Saffron Turban on Head
        const turbanGeo = new THREE.BoxGeometry(0.56, 0.22, 0.56);
        const turban = new THREE.Mesh(turbanGeo, saffronMat);
        turban.position.y = 1.76;
        turban.castShadow = true;
        group.add(turban);

        // Golden Jewel on Turban
        const jewelGeo = new THREE.BoxGeometry(0.12, 0.12, 0.08);
        const jewel = new THREE.Mesh(jewelGeo, goldMat);
        jewel.position.set(0, 1.76, 0.28);
        group.add(jewel);

        // Body / Torso (Kurta)
        const bodyGeo = new THREE.BoxGeometry(0.52, 0.68, 0.28);
        const body = new THREE.Mesh(bodyGeo, saffronMat);
        body.position.y = 0.95;
        body.castShadow = true;
        group.add(body);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
        const leftArm = new THREE.Mesh(armGeo, saffronMat);
        leftArm.position.set(-0.36, 0.95, 0);
        leftArm.castShadow = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, saffronMat);
        rightArm.position.set(0.36, 0.95, 0);
        rightArm.castShadow = true;
        group.add(rightArm);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.22, 0.68, 0.22);
        const leftLeg = new THREE.Mesh(legGeo, darkArmorMat);
        leftLeg.position.set(-0.14, 0.35, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, darkArmorMat);
        rightLeg.position.set(0.14, 0.35, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);

        // 3D Floating Nametag
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
        group.position.lerp(target.pos, Math.min(delta * 12.0, 1.0));

        // Smooth yaw rotation
        group.rotation.y = target.yaw;

        // Walking limb animation
        if (target.isMoving) {
            this.limbSwing += delta * 9.0;
            const swing = Math.sin(this.limbSwing) * 0.45;
            this.remotePlayerMesh.leftArm.rotation.x = swing;
            this.remotePlayerMesh.rightArm.rotation.x = -swing;
            this.remotePlayerMesh.leftLeg.rotation.x = -swing;
            this.remotePlayerMesh.rightLeg.rotation.x = swing;
        } else {
            this.remotePlayerMesh.leftArm.rotation.x *= 0.8;
            this.remotePlayerMesh.rightArm.rotation.x *= 0.8;
            this.remotePlayerMesh.leftLeg.rotation.x *= 0.8;
            this.remotePlayerMesh.rightLeg.rotation.x *= 0.8;
        }
    }

    cleanupRemotePlayer() {
        if (this.remotePlayerMesh) {
            this.game.scene.remove(this.remotePlayerMesh.group);
            this.remotePlayerMesh = null;
        }
    }

    disconnect() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        if (this.bc) {
            try { this.bc.close(); } catch (e) {}
            this.bc = null;
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

window.MultiplayerManager = MultiplayerManager;
