// Standing Lord Ganesha Animated Companion & Interactive Tasks Engine
// Allows Lord Ganesha to stand, walk with the gamer, and play 5 exciting interactive divine tasks!

class GaneshaCompanion {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.voxelWorld = game.voxelWorld;

        // Position & Kinematics
        this.position = new THREE.Vector3(0, 1.0, 3.5); // Default sanctum entrance position
        this.spawnPosition = new THREE.Vector3(0, 1.0, 3.5);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.yaw = 0;
        this.targetYaw = 0;

        // Companion State: 'idle' | 'follow' | 'playing' | 'celebrate' | 'carried'
        this.state = 'idle';
        this.isFollowing = false;
        this.isCelebrating = false;
        this.isCarried = false;
        this.celebrateTimer = 0;

        // Kinematic settings
        this.walkSpeed = 4.2;
        this.followDistanceMin = 2.4;
        this.followDistanceMax = 4.5;
        this.animTime = 0;

        // Active Task Tracking
        this.activeTask = null;
        this.taskProgress = 0;
        this.taskTarget = 0;
        this.taskData = {};
        this.modakPickups = [];
        this.archwayGuides = [];

        // 3D Mesh & Articulation
        this.mesh = null;
        this.speechBubble = null;
        this.initModel();
        this.initSpeechBubble();
        this.initEvents();
    }

    get model() {
        return this.mesh;
    }

    set model(val) {
        this.mesh = val;
    }

    initModel() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }

        this.mesh = GaneshaModel.createStandingGanesha();
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    initSpeechBubble() {
        // Floating 2D Canvas speech bubble texture above Ganesha
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 160;
        this.bubbleCanvas = canvas;
        this.bubbleCtx = canvas.getContext('2d');

        this.bubbleTexture = new THREE.CanvasTexture(canvas);
        this.bubbleTexture.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
            map: this.bubbleTexture,
            transparent: true,
            opacity: 0.95
        });

        this.speechBubble = new THREE.Sprite(spriteMat);
        this.speechBubble.scale.set(3.2, 1.0, 1.0);
        this.speechBubble.position.set(0, 3.8, 0);
        this.mesh.add(this.speechBubble);

        this.updateSpeechBubble("🙏 Namaste! Press E to talk with me!");
    }

    updateSpeechBubble(text) {
        if (!this.bubbleCtx) return;
        const ctx = this.bubbleCtx;
        const w = 512;
        const h = 160;

        ctx.clearRect(0, 0, w, h);

        // Glassmorphic rounded bubble background
        ctx.fillStyle = 'rgba(20, 14, 10, 0.88)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 6;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(10, 10, w - 20, h - 35, 24);
        } else if (typeof ctx.quadraticCurveTo === 'function') {
            const bx = 10, by = 10, bw = w - 20, bh = h - 35, br = 24;
            ctx.moveTo(bx + br, by);
            ctx.lineTo(bx + bw - br, by);
            ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
            ctx.lineTo(bx + bw, by + bh - br);
            ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
            ctx.lineTo(bx + br, by + bh);
            ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
            ctx.lineTo(bx, by + br);
            ctx.quadraticCurveTo(bx, by, bx + br, by);
            ctx.closePath();
        } else if (typeof ctx.rect === 'function') {
            ctx.rect(10, 10, w - 20, h - 35);
        }
        ctx.fill();
        ctx.stroke();

        // Little speech pointer triangle at bottom
        ctx.beginPath();
        ctx.moveTo(w / 2 - 20, h - 25);
        ctx.lineTo(w / 2, h - 4);
        ctx.lineTo(w / 2 + 20, h - 25);
        ctx.fillStyle = '#FFD700';
        ctx.fill();

        // Text
        ctx.font = 'bold 24px "Cinzel", Georgia, serif';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, w / 2, (h - 25) / 2);

        this.bubbleTexture.needsUpdate = true;
    }

    // Set position and snap to terrain
    teleport(x, y, z) {
        this.position.set(x, y, z);
        if (this.mesh) this.mesh.position.copy(this.position);
    }

    // Reset Companion to default sanctum location
    resetToSanctum() {
        this.teleport(this.spawnPosition.x, this.spawnPosition.y, this.spawnPosition.z);
        this.state = 'idle';
        this.isFollowing = false;
        this.isCelebrating = false;
        this.isCarried = false;
        this.cancelActiveTask();
        this.updateSpeechBubble("🙏 Namaste! Press E to play with me!");
        this.updateHUD();
        this.updateDialogUI();
    }

    // Lift Lord Ganesha to carry Him
    lift() {
        this.isCarried = true;
        this.state = 'carried';
        this.updateSpeechBubble("🤲 You are carrying Lord Ganesha! Press [F] or Drop to place Me!");
        if (window.soundEngine && window.soundEngine.playCompanionGreeting) {
            window.soundEngine.playCompanionGreeting();
        }
        if (this.game && this.game.spawnFlowerPetals) {
            this.game.spawnFlowerPetals(20);
        }
        this.updateDialogUI();
    }

    // Drop / Place Lord Ganesha down at target location
    drop(x, y, z) {
        this.isCarried = false;
        this.state = 'idle';
        this.teleport(x, y, z);

        if (this.game && this.game.player) {
            const pPos = this.game.player.position;
            const lookDir = new THREE.Vector3().subVectors(pPos, this.position);
            this.yaw = Math.atan2(lookDir.x, lookDir.z);
            this.targetYaw = this.yaw;
            if (this.mesh) this.mesh.rotation.y = this.yaw;
        }

        this.celebrate("🙏 Tathastu! I am graciously seated in your sanctum!");
        if (window.soundEngine && window.soundEngine.playTempleBell) {
            window.soundEngine.playTempleBell(2100, 1.8);
        }
        this.updateDialogUI();
    }

    // Toggle follow mode
    toggleFollow(force = null) {
        this.isFollowing = (force !== null) ? force : !this.isFollowing;
        this.state = this.isFollowing ? 'follow' : 'idle';
        
        if (this.isFollowing) {
            this.updateSpeechBubble("🐾 I am walking with you! Let's explore!");
            if (this.game && this.game.showToast) {
                this.game.showToast('🐾 Lord Ganesha & Mushak are now following you!', 3000);
            }
            if (window.soundEngine && window.soundEngine.playCompanionGreeting) {
                window.soundEngine.playCompanionGreeting();
            }
        } else {
            this.updateSpeechBubble("🛑 Standing here to guard the sacred sanctum!");
            if (this.game && this.game.showToast) {
                this.game.showToast('🛑 Lord Ganesha will stay here.', 2500);
            }
        }
        this.updateDialogUI();
    }

    // Main Update Loop called from game.js animate()
    update(delta) {
        if (!this.mesh) return;

        this.animTime += delta;
        const playerPos = this.game.player ? this.game.player.position : null;
        if (!playerPos) return;

        const distToPlayer = this.position.distanceTo(playerPos);

        // If currently carried by the player, smoothly attach to player's front view
        if (this.isCarried) {
            const camera = this.game.camera;
            if (camera) {
                const camDir = new THREE.Vector3();
                camera.getWorldDirection(camDir);
                camDir.y = 0;
                if (camDir.lengthSq() < 0.001) camDir.set(0, 0, -1);
                camDir.normalize();

                const hoverBob = Math.sin(this.animTime * 3.5) * 0.08;
                const targetX = playerPos.x + camDir.x * 1.6;
                const targetY = (playerPos.y - 0.25) + hoverBob;
                const targetZ = playerPos.z + camDir.z * 1.6;

                this.position.set(targetX, targetY, targetZ);
                this.mesh.position.copy(this.position);

                // Face outward in the direction the player is looking
                this.yaw = Math.atan2(camDir.x, camDir.z);
                this.mesh.rotation.y = this.yaw;

                if (this.speechBubble) {
                    this.speechBubble.visible = true;
                }

                this.animateLimbs(delta, false);
                return;
            }
        }

        // 1. Proximity Speech Bubble visibility
        if (this.speechBubble) {
            this.speechBubble.visible = (distToPlayer < 12);
        }

        // 2. State Handling & Movement
        let isMoving = false;

        if (this.state === 'follow' && distToPlayer > this.followDistanceMin) {
            // Move toward player
            const dir = new THREE.Vector3().subVectors(playerPos, this.position);
            dir.y = 0; // Flat horizontal plane
            const dist = dir.length();

            if (dist > this.followDistanceMin) {
                dir.normalize();
                const step = this.walkSpeed * delta;
                this.position.x += dir.x * Math.min(step, dist - this.followDistanceMin);
                this.position.z += dir.z * Math.min(step, dist - this.followDistanceMin);

                // Smooth ground elevation following terrain
                const groundY = this.getGroundHeight(this.position.x, this.position.z);
                this.position.y += (groundY - this.position.y) * 0.15;

                // Face moving direction
                this.targetYaw = Math.atan2(dir.x, dir.z);
                isMoving = true;
            }
        } else if (distToPlayer < 8) {
            // Face player when close
            const lookDir = new THREE.Vector3().subVectors(playerPos, this.position);
            this.targetYaw = Math.atan2(lookDir.x, lookDir.z);
        }

        // Smooth rotation interpolation
        let diffYaw = this.targetYaw - this.yaw;
        while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
        while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
        this.yaw += diffYaw * Math.min(1.0, delta * 7.0);

        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.yaw;

        // 3. Articulated Limb Animations
        this.animateLimbs(delta, isMoving);

        // 4. Update Active Task Loop (Modaks, Archway, Proximity)
        this.updateActiveTask(delta, playerPos);

        // 5. Celebration Timer
        if (this.isCelebrating) {
            this.celebrateTimer -= delta;
            if (this.celebrateTimer <= 0) {
                this.isCelebrating = false;
                if (!this.isFollowing) this.state = 'idle';
                else this.state = 'follow';
            }
        }
    }

    // Helper: Find terrain ground elevation at (x, z)
    getGroundHeight(x, z) {
        if (!this.voxelWorld) return 1.0;
        const bx = Math.round(x);
        const bz = Math.round(z);
        for (let y = 16; y >= 0; y--) {
            if (this.voxelWorld.isSolidAt(bx, y, bz)) {
                return y + 1.0;
            }
        }
        return 1.0;
    }

    // Animate Limbs (Walking, Idle Swaying, Waving, Jumping)
    animateLimbs(delta, isMoving) {
        const u = this.mesh.userData;
        if (!u) return;

        // Rotate halo continuously
        if (u.haloMesh) {
            u.haloMesh.rotation.z += delta * (this.isCarried ? 3.0 : 1.5);
        }

        if (this.isCarried) {
            // Auspicious blessing posture while carried
            if (u.lowerRightArmPivot) u.lowerRightArmPivot.rotation.z = 0.25 + Math.sin(this.animTime * 3) * 0.1;
            if (u.lowerLeftArmPivot) u.lowerLeftArmPivot.rotation.x = -0.35;
            if (u.trunkTip) u.trunkTip.position.y = -0.42 + Math.sin(this.animTime * 3.5) * 0.04;
            if (u.leftEar) u.leftEar.rotation.y = 0.25 + Math.sin(this.animTime * 2.5) * 0.06;
            if (u.rightEar) u.rightEar.rotation.y = -0.25 - Math.sin(this.animTime * 2.5) * 0.06;
            if (u.leftLegPivot) u.leftLegPivot.rotation.x = 0;
            if (u.rightLegPivot) u.rightLegPivot.rotation.x = 0;
            return;
        }

        if (this.isCelebrating) {
            // Joyful Jump & Dance
            const hop = Math.abs(Math.sin(this.animTime * 10)) * 0.35;
            this.mesh.position.y = this.position.y + hop;

            if (u.upperRightArmPivot) u.upperRightArmPivot.rotation.z = Math.sin(this.animTime * 12) * 0.4;
            if (u.upperLeftArmPivot) u.upperLeftArmPivot.rotation.z = -Math.sin(this.animTime * 12) * 0.4;
            if (u.lowerRightArmPivot) u.lowerRightArmPivot.rotation.x = -0.5 + Math.sin(this.animTime * 12) * 0.3;
            if (u.trunkTip) u.trunkTip.position.y = -0.42 + Math.sin(this.animTime * 10) * 0.15;
            return;
        }

        if (isMoving) {
            // Walking Animation: Legs and arms swinging in natural rhythm
            const swing = Math.sin(this.animTime * 8);
            if (u.leftLegPivot) u.leftLegPivot.rotation.x = swing * 0.55;
            if (u.rightLegPivot) u.rightLegPivot.rotation.x = -swing * 0.55;

            // Arms swing counter to legs
            if (u.lowerRightArmPivot) u.lowerRightArmPivot.rotation.x = -swing * 0.35;
            if (u.lowerLeftArmPivot) u.lowerLeftArmPivot.rotation.x = swing * 0.35;

            // Trunk sways with movement
            if (u.trunkTip) u.trunkTip.position.x = -0.26 + Math.sin(this.animTime * 4) * 0.08;

            // Little Mushak scampers happily
            if (u.mushakGroup) {
                u.mushakGroup.position.y = Math.abs(Math.sin(this.animTime * 16)) * 0.12;
            }
        } else {
            // Idle Animation: Gentle breathing bob, swaying trunk, blessing mudra wave
            const breathe = Math.sin(this.animTime * 2.5) * 0.03;
            if (u.leftLegPivot) u.leftLegPivot.rotation.x = 0;
            if (u.rightLegPivot) u.rightLegPivot.rotation.x = 0;

            if (u.headGroup) u.headGroup.position.y = 2.2 + breathe;
            if (u.trunkTip) {
                u.trunkTip.position.x = -0.26 + Math.sin(this.animTime * 1.8) * 0.06;
                u.trunkTip.position.y = -0.42 + Math.cos(this.animTime * 2.2) * 0.04;
            }

            // Gentle blessing wave
            if (u.lowerRightArmPivot) {
                u.lowerRightArmPivot.rotation.z = Math.sin(this.animTime * 2) * 0.12;
            }

            // Ears flap gently
            if (u.leftEar) u.leftEar.rotation.y = 0.25 + Math.sin(this.animTime * 2) * 0.08;
            if (u.rightEar) u.rightEar.rotation.y = -0.25 - Math.sin(this.animTime * 2) * 0.08;

            // Mushak tail wag
            if (u.mushakGroup) {
                u.mushakGroup.position.y = 0;
            }
        }
    }

    // Trigger Celebratory Reaction (Fanfare, Petals, Bell, Jump)
    celebrate(message = "✨ Har Har Mahadev! Well done, Balak! ✨") {
        this.isCelebrating = true;
        this.celebrateTimer = 3.5;
        this.updateSpeechBubble(message);

        if (window.soundEngine) {
            if (window.soundEngine.playGaneshaLaugh) window.soundEngine.playGaneshaLaugh();
            else if (window.soundEngine.playSparkle) window.soundEngine.playSparkle();
        }

        if (this.game && this.game.spawnFlowerPetals) {
            this.game.spawnFlowerPetals(35);
        }
    }

    // ==========================================
    // 5 INTERACTIVE TASKS PLAYED WITH THE GAMER
    // ==========================================

    getAvailableTasks() {
        return [
            {
                id: 'modak_hunt',
                title: '🍬 The Sacred Golden Modak Hunt',
                tagline: 'Find 5 golden modaks hidden around the grounds for Ganesha!',
                reward: 250,
                desc: 'Lord Ganesha is feeling hungry! He hid 5 sacred glowing golden modaks around the pandal and riverbank. Find and collect them all!'
            },
            {
                id: 'aarti_duet',
                title: '🪔 Divine Aarti Harmony with Ganesha',
                tagline: 'Stand together with Ganesha and offer the sacred Aarti!',
                reward: 300,
                desc: 'Stand alongside Lord Ganesha and perform the divine Consecration Aarti. Ganesha will ring the sacred bells and shower divine blessings!'
            },
            {
                id: 'marigold_offering',
                title: '🌼 Fragrant Marigold Offering',
                tagline: 'Place 5 fresh marigold garlands near Ganesha!',
                reward: 200,
                desc: 'Adorn the altar with 5 fragrant fresh marigold garlands. Ganesha will absorb the divine floral fragrance and expand his golden aura!'
            },
            {
                id: 'temple_arch',
                title: '🏛️ Sacred Temple Archway Challenge',
                tagline: 'Erect 4 sacred temple pillars at Ganesha’s beacon spots!',
                reward: 350,
                desc: 'Build a majestic festival gateway! Ganesha will designate 4 sacred ground beacons. Place temple pillars there to complete the archway!'
            },
            {
                id: 'wisdom_riddle',
                title: '📜 Ganesha’s Divine Wisdom Riddle',
                tagline: 'Answer sacred riddles of the Lord of Wisdom!',
                reward: 200,
                desc: 'Test your knowledge with Lord Ganesha, the Lord of Wisdom and Intellect! Answer his sacred question correctly to earn instant divine boons!'
            }
        ];
    }

    // Start a specific task
    startTask(taskId) {
        this.cancelActiveTask();
        const taskDef = this.getAvailableTasks().find(t => t.id === taskId);
        if (!taskDef) return;

        this.activeTask = taskDef;
        this.taskProgress = 0;
        this.taskData = {};

        switch (taskId) {
            case 'modak_hunt':
                this.taskTarget = 5;
                this.spawnGoldenModaks(5);
                this.updateSpeechBubble("🍬 Find my 5 golden modaks hidden nearby!");
                break;

            case 'aarti_duet':
                this.taskTarget = 1;
                this.updateSpeechBubble("🪔 Press E or click Aarti to offer with me!");
                break;

            case 'marigold_offering':
                this.taskTarget = 5;
                this.updateSpeechBubble("🌼 Place 5 marigold garlands around me!");
                break;

            case 'temple_arch':
                this.taskTarget = 4;
                this.spawnArchwayGuides();
                this.updateSpeechBubble("🏛️ Place 4 temple pillars on the glowing spots!");
                break;

            case 'wisdom_riddle':
                this.taskTarget = 1;
                this.openRiddleModal();
                break;
        }

        this.updateHUD();
        if (this.game && this.game.showToast) {
            this.game.showToast(`🎯 Task Started: ${taskDef.title}!`, 3500);
        }
        if (window.soundEngine && window.soundEngine.playSparkle) {
            window.soundEngine.playSparkle();
        }
    }

    // Spawn 5 interactive floating golden modaks in world (Task 1)
    spawnGoldenModaks(count = 5) {
        const modakGeo = new THREE.DodecahedronGeometry(0.35, 1);
        const modakMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFAA00,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.7
        });

        // Fixed scenic locations relative to pandal and ghats
        const offsets = [
            { x: -4, z: 2 },
            { x: 5, z: -3 },
            { x: -6, z: -6 },
            { x: 7, z: 6 },
            { x: 0, z: -8 }
        ];

        offsets.forEach((off, i) => {
            const mesh = new THREE.Mesh(modakGeo, modakMat);
            const gx = this.spawnPosition.x + off.x;
            const gz = this.spawnPosition.z + off.z;
            const gy = this.getGroundHeight(gx, gz) + 0.3;

            mesh.position.set(gx, gy, gz);
            mesh.castShadow = true;

            // Halo point light
            const pLight = new THREE.PointLight(0xFFD700, 1.2, 3);
            mesh.add(pLight);

            this.scene.add(mesh);
            this.modakPickups.push({ mesh, x: gx, y: gy, z: gz, id: i, collected: false });
        });
    }

    // Spawn 4 holographic pillar guides (Task 4)
    spawnArchwayGuides() {
        const pillarGeo = new THREE.BoxGeometry(1, 2, 1);
        const guideMat = new THREE.MeshBasicMaterial({
            color: 0x00E5FF,
            wireframe: true,
            transparent: true,
            opacity: 0.75
        });

        const spots = [
            { x: -3, z: 0 },
            { x: -3, z: -4 },
            { x: 3, z: 0 },
            { x: 3, z: -4 }
        ];

        spots.forEach((sp, idx) => {
            const guide = new THREE.Mesh(pillarGeo, guideMat);
            const gx = Math.round(this.spawnPosition.x + sp.x);
            const gz = Math.round(this.spawnPosition.z + sp.z);
            const gy = 1.5;

            guide.position.set(gx, gy, gz);
            this.scene.add(guide);
            this.archwayGuides.push({ mesh: guide, x: gx, z: gz, fulfilled: false });
        });
    }

    // Active Task Per-Frame Update
    updateActiveTask(delta, playerPos) {
        if (!this.activeTask) return;

        // Task 1: Modak pickup detection
        if (this.activeTask.id === 'modak_hunt') {
            this.modakPickups.forEach(m => {
                if (m.collected) return;

                // Animate floating and spinning
                m.mesh.rotation.y += delta * 3.0;
                m.mesh.position.y = m.y + Math.sin(this.animTime * 4 + m.id) * 0.15;

                // Pickup distance check
                const dist = playerPos.distanceTo(m.mesh.position);
                if (dist < 1.6) {
                    m.collected = true;
                    this.scene.remove(m.mesh);
                    this.taskProgress++;

                    if (window.soundEngine && window.soundEngine.playModakCollect) {
                        window.soundEngine.playModakCollect();
                    } else if (window.soundEngine && window.soundEngine.playSparkle) {
                        window.soundEngine.playSparkle();
                    }

                    if (this.game && this.game.showToast) {
                        this.game.showToast(`🍬 Sacred Modak Collected! (${this.taskProgress}/${this.taskTarget})`, 1800);
                    }

                    this.updateSpeechBubble(`🍬 Delicious! Found ${this.taskProgress}/${this.taskTarget}!`);
                    this.updateHUD();

                    if (this.taskProgress >= this.taskTarget) {
                        this.completeActiveTask();
                    }
                }
            });
        }

        // Task 4: Animate Archway Guides
        if (this.activeTask.id === 'temple_arch') {
            this.archwayGuides.forEach(g => {
                if (!g.fulfilled) {
                    g.mesh.rotation.y += delta * 1.5;
                }
            });
        }
    }

    // Hook: Triggered when player places any block in world
    onBlockPlaced(blockId, x, y, z) {
        if (!this.activeTask) return;

        // Task 3: Fragrant Marigolds placed near Ganesha
        if (this.activeTask.id === 'marigold_offering' && blockId === 'marigold') {
            const blockPos = new THREE.Vector3(x, y, z);
            const dist = this.position.distanceTo(blockPos);

            if (dist < 8.0) {
                this.taskProgress++;
                this.updateSpeechBubble(`🌼 Ah! Such sweet fragrance! (${this.taskProgress}/${this.taskTarget})`);
                this.updateHUD();

                if (window.soundEngine && window.soundEngine.playSparkle) {
                    window.soundEngine.playSparkle();
                }

                if (this.taskProgress >= this.taskTarget) {
                    this.completeActiveTask();
                }
            }
        }

        // Task 4: Pillar placed on designated spot
        if (this.activeTask.id === 'temple_arch' && (blockId === 'pillar' || blockId === 'marble')) {
            this.archwayGuides.forEach(g => {
                if (!g.fulfilled && Math.abs(x - g.x) < 1 && Math.abs(z - g.z) < 1) {
                    g.fulfilled = true;
                    this.scene.remove(g.mesh);
                    this.taskProgress++;
                    this.updateSpeechBubble(`🏛️ Majestic Pillar Erected! (${this.taskProgress}/${this.taskTarget})`);
                    this.updateHUD();

                    if (window.soundEngine && window.soundEngine.playSparkle) {
                        window.soundEngine.playSparkle();
                    }

                    if (this.taskProgress >= this.taskTarget) {
                        this.completeActiveTask();
                    }
                }
            });
        }
    }

    // Hook: Triggered when Aarti is performed
    onAartiPerformed() {
        if (!this.activeTask) return;

        if (this.activeTask.id === 'aarti_duet') {
            this.taskProgress = 1;
            this.updateHUD();
            this.completeActiveTask();
        }
    }

    // Task Completed with Fanfare, Dialogue & Blessings!
    completeActiveTask() {
        if (!this.activeTask) return;
        const reward = this.activeTask.reward || 200;
        const taskTitle = this.activeTask.title;

        // Award blessings
        if (this.game) {
            this.game.blessingsCount = (this.game.blessingsCount || 0) + reward;
            const bEl = document.getElementById('blessings-count');
            if (bEl) bEl.innerText = this.game.blessingsCount;
        }

        this.celebrate(`🌟 Divine Victory! Task Completed: +${reward} Blessings!`);

        if (this.game && this.game.showToast) {
            this.game.showToast(`🏆 ${taskTitle} Completed! +${reward} Sacred Blessings!`, 4000);
        }

        // Clean task props
        this.cleanupTaskObjects();
        this.activeTask = null;
        this.taskProgress = 0;
        this.updateHUD();
    }

    cancelActiveTask() {
        this.cleanupTaskObjects();
        this.activeTask = null;
        this.taskProgress = 0;
        this.updateHUD();
    }

    cleanupTaskObjects() {
        this.modakPickups.forEach(m => this.scene.remove(m.mesh));
        this.modakPickups = [];

        this.archwayGuides.forEach(g => this.scene.remove(g.mesh));
        this.archwayGuides = [];
    }

    // Open Ganesha's Interactive Wisdom Riddle Modal (Task 5)
    openRiddleModal() {
        const modal = document.getElementById('ganesha-dialog-modal');
        const titleEl = document.getElementById('ganesha-dialog-title');
        const textEl = document.getElementById('ganesha-dialog-text');
        const optionsEl = document.getElementById('ganesha-dialog-options');

        if (!modal || !titleEl || !textEl || !optionsEl) return;

        if (document.exitPointerLock) document.exitPointerLock();
        modal.style.display = 'flex';

        titleEl.innerHTML = '🐘 GANESHA’S SACRED RIDDLE';
        textEl.innerHTML = `
            <em>"Listen carefully, dear builder! Here is my sacred question:"</em><br><br>
            <strong>"I am the remover of obstacles and the lord of beginnings. Who is my beloved, loyal little vahana that travels everywhere with me?"</strong>
        `;

        optionsEl.innerHTML = `
            <button class="ganesha-opt-btn" data-correct="true">🐭 Mushak the Little Mouse</button>
            <button class="ganesha-opt-btn" data-correct="false">🦅 Garuda the Mighty Eagle</button>
            <button class="ganesha-opt-btn" data-correct="false">🐂 Nandi the Sacred Bull</button>
        `;

        const btns = optionsEl.querySelectorAll('.ganesha-opt-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isCorrect = btn.dataset.correct === 'true';
                if (isCorrect) {
                    textEl.innerHTML = '✨ <strong>"Shaabash, Balak!"</strong> That is correct! Mushak is indeed my beloved companion! You have earned divine wisdom!';
                    optionsEl.innerHTML = `
                        <button id="btn-riddle-claim" class="ganesha-opt-btn ganesha-opt-primary">🙏 Claim Divine Reward (+200 Blessings)</button>
                    `;
                    const claimBtn = document.getElementById('btn-riddle-claim');
                    if (claimBtn) {
                        claimBtn.addEventListener('click', () => {
                            modal.style.display = 'none';
                            this.completeActiveTask();
                        });
                    }
                } else {
                    textEl.innerHTML = '😄 <em>"Ho ho ho! Not quite! Think of the little creature with sweet paws who loves modaks!"</em>';
                }
            });
        });
    }

    // Open Main Companion Interactive Hub
    openCompanionDialog() {
        const modal = document.getElementById('ganesha-dialog-modal');
        const titleEl = document.getElementById('ganesha-dialog-title');
        const textEl = document.getElementById('ganesha-dialog-text');
        const optionsEl = document.getElementById('ganesha-dialog-options');

        if (!modal || !titleEl || !textEl || !optionsEl) return;

        if (document.exitPointerLock) document.exitPointerLock();
        modal.style.display = 'flex';

        titleEl.innerHTML = '🐘 LORD GANESHA & MUSHAK';
        textEl.innerHTML = `
            <em>"Namaste, dear builder! I am pleased with your devotion and craftsmanship in our sacred pandal. How would you like to play with me today?"</em>
        `;

        const followLabel = this.isFollowing ? '🛑 Stay Here in Sanctum' : '🐾 Walk & Follow Me!';
        const liftLabel = this.isCarried ? '⬇️ Drop Lord Ganesha Here (F)' : '🤲 Lift & Carry Lord Ganesha (F)';

        optionsEl.innerHTML = `
            <button id="btn-comp-lift" class="ganesha-opt-btn ganesha-opt-primary">${liftLabel}</button>
            <button id="btn-comp-follow" class="ganesha-opt-btn">${followLabel}</button>
            <button id="btn-comp-tasks" class="ganesha-opt-btn">🎯 Play a Sacred Task with Ganesha</button>
            <button id="btn-comp-aarti" class="ganesha-opt-btn">🪔 Perform Holy Aarti Pooja</button>
            <button id="btn-comp-blessing" class="ganesha-opt-btn">🙏 Ask for Divine Blessing</button>
            <button id="btn-comp-dance" class="ganesha-opt-btn">💃 Watch Ganesha Dance!</button>
            <button id="btn-comp-close" class="ganesha-opt-btn ganesha-opt-secondary">✕ Close</button>
        `;

        // Wire Actions
        const btnLift = document.getElementById('btn-comp-lift');
        if (btnLift) {
            btnLift.addEventListener('click', () => {
                modal.style.display = 'none';
                if (this.game && this.game.toggleLiftDropGanesha) {
                    this.game.toggleLiftDropGanesha();
                }
            });
        }

        const btnFollow = document.getElementById('btn-comp-follow');
        if (btnFollow) {
            btnFollow.addEventListener('click', () => {
                this.toggleFollow();
                modal.style.display = 'none';
            });
        }

        const btnTasks = document.getElementById('btn-comp-tasks');
        if (btnTasks) {
            btnTasks.addEventListener('click', () => {
                this.openTaskListDialog();
            });
        }

        const btnAarti = document.getElementById('btn-comp-aarti');
        if (btnAarti) {
            btnAarti.addEventListener('click', () => {
                modal.style.display = 'none';
                if (this.game && this.game.performAartiCeremony) {
                    this.game.performAartiCeremony();
                }
            });
        }

        const btnBlessing = document.getElementById('btn-comp-blessing');
        if (btnBlessing) {
            btnBlessing.addEventListener('click', () => {
                this.celebrate("✨ Tathastu! May all your obstacles vanish like morning mist! 🙏");
                if (this.game) {
                    this.game.blessingsCount = (this.game.blessingsCount || 0) + 100;
                    const bEl = document.getElementById('blessings-count');
                    if (bEl) bEl.innerText = this.game.blessingsCount;
                }
                modal.style.display = 'none';
            });
        }

        const btnDance = document.getElementById('btn-comp-dance');
        if (btnDance) {
            btnDance.addEventListener('click', () => {
                this.celebrate("💃 Anandotsav! Let the festive celebrations begin! 🌺");
                modal.style.display = 'none';
            });
        }

        const btnClose = document.getElementById('btn-comp-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    // Open Task Picker Dialog
    openTaskListDialog() {
        const textEl = document.getElementById('ganesha-dialog-text');
        const optionsEl = document.getElementById('ganesha-dialog-options');
        if (!textEl || !optionsEl) return;

        textEl.innerHTML = `<em>"Choose a sacred task or game to play together! Complete it to earn divine boons & blessings!"</em>`;

        const tasks = this.getAvailableTasks();
        optionsEl.innerHTML = tasks.map(t => `
            <button class="ganesha-opt-btn ganesha-task-item-btn" data-task="${t.id}">
                <div class="task-opt-title">${t.title}</div>
                <div class="task-opt-desc">${t.tagline} (+${t.reward} 🙏)</div>
            </button>
        `).join('') + `
            <button id="btn-task-back" class="ganesha-opt-btn ganesha-opt-secondary">⬅️ Back</button>
        `;

        const taskBtns = optionsEl.querySelectorAll('.ganesha-task-item-btn');
        taskBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.dataset.task;
                const modal = document.getElementById('ganesha-dialog-modal');
                if (modal && taskId !== 'wisdom_riddle') {
                    modal.style.display = 'none';
                }
                this.startTask(taskId);
            });
        });

        const backBtn = document.getElementById('btn-task-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.openCompanionDialog();
            });
        }
    }

    updateDialogUI() {
        const btnFollow = document.getElementById('btn-comp-follow');
        if (btnFollow) {
            btnFollow.innerText = this.isFollowing ? '🛑 Stay Here in Sanctum' : '🐾 Walk & Follow Me!';
        }
        const btnLift = document.getElementById('btn-comp-lift');
        if (btnLift) {
            btnLift.innerText = this.isCarried ? '⬇️ Drop Lord Ganesha Here (F)' : '🤲 Lift & Carry Lord Ganesha (F)';
        }
    }

    // Update floating companion task HUD on screen
    updateHUD() {
        const hud = document.getElementById('companion-task-hud');
        if (!hud) return;

        if (!this.activeTask) {
            hud.style.display = 'none';
            return;
        }

        hud.style.display = 'flex';
        hud.innerHTML = `
            <div class="comp-hud-icon">🐘</div>
            <div class="comp-hud-info">
                <div class="comp-hud-tag">GANESHA’S TASK</div>
                <div class="comp-hud-title">${this.activeTask.title}</div>
                <div class="comp-hud-progress">
                    <div class="comp-hud-bar" style="width: ${(this.taskProgress / this.taskTarget) * 100}%;"></div>
                </div>
                <div class="comp-hud-count">${this.taskProgress} / ${this.taskTarget} Completed</div>
            </div>
            <button id="btn-cancel-comp-task" class="comp-hud-cancel" title="Cancel Task">✕</button>
        `;

        const btnCancel = document.getElementById('btn-cancel-comp-task');
        if (btnCancel) {
            btnCancel.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cancelActiveTask();
            });
        }
    }

    closeDialog() {
        const modal = document.getElementById('ganesha-dialog-modal');
        if (modal) modal.style.display = 'none';
    }

    closeAllModals() {
        this.closeDialog();
    }

    initEvents() {
        // Wire companion top HUD button
        const btnHud = document.getElementById('btn-companion');
        if (btnHud) {
            btnHud.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openCompanionDialog();
            });
        }

        // Mobile touch button
        const btnTouchComp = document.getElementById('btn-touch-companion');
        if (btnTouchComp) {
            btnTouchComp.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openCompanionDialog();
            });
        }
    }
}

window.GaneshaCompanion = GaneshaCompanion;
