// Main Game Engine, Raycasting, Aarti Interaction, and Animation Loop
class GaneshMinecraftGame {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.clock = new THREE.Clock();

        // Hotbar Items (9 customizable slots)
        this.hotbarItems = [
            { id: 'tent_red', name: 'Red Tent Fabric', key: '1', icon: '⛺' },
            { id: 'tent_gold', name: 'Gold Tent Fabric', key: '2', icon: '✨' },
            { id: 'pillar', name: 'Temple Pillar', key: '3', icon: '🏛️' },
            { id: 'marigold', name: 'Marigold Garland', key: '4', icon: '🌼' },
            { id: 'diya', name: 'Glowing Diya', key: '5', icon: '🪔' },
            { id: 'wood_log', name: 'Tree Log', key: '6', icon: '🪵' },
            { id: 'marble', name: 'Marble Floor', key: '7', icon: '⬜' },
            { id: 'ganesha', name: 'Lord Ganesha Idol', key: '8', icon: '🐘' },
            { id: 'water', name: 'Holy Water Block', key: '9', icon: '💧' }
        ];
        this.selectedSlot = 0; // default red tent fabric

        // Creative Catalog of 19 blocks
        this.creativeCatalog = [
            { id: 'tent_red', name: 'Red Tent Fabric', category: 'Pandal & Festive', icon: '⛺', color: '#B71C1C' },
            { id: 'tent_gold', name: 'Gold Tent Fabric', category: 'Pandal & Festive', icon: '✨', color: '#FFD700' },
            { id: 'pillar', name: 'Temple Pillar', category: 'Architecture', icon: '🏛️', color: '#FFFDD0' },
            { id: 'marigold', name: 'Marigold Garland', category: 'Pandal & Festive', icon: '🌼', color: '#FF9800' },
            { id: 'diya', name: 'Glowing Diya', category: 'Lighting', icon: '🪔', color: '#FF6D00' },
            { id: 'ganesha', name: 'Lord Ganesha Idol', category: 'Sacred', icon: '🐘', color: '#E65100' },
            { id: 'grass', name: 'Vibrant Grass', category: 'Nature', icon: '🌱', color: '#4CAF50' },
            { id: 'dirt', name: 'Fertile Soil', category: 'Nature', icon: '🟫', color: '#795548' },
            { id: 'water', name: 'Holy Water Block', category: 'Nature', icon: '💧', color: '#0288D1' },
            { id: 'sand', name: 'River Sand', category: 'Nature', icon: '🏖️', color: '#E0C068' },
            { id: 'stone', name: 'Smooth Stone', category: 'Terrain', icon: '🪨', color: '#78909C' },
            { id: 'cobblestone', name: 'Cobblestone', category: 'Terrain', icon: '🧱', color: '#616161' },
            { id: 'wood_log', name: 'Tree Trunk Log', category: 'Nature', icon: '🪵', color: '#5D4037' },
            { id: 'leaves', name: 'Sacred Peepal Leaves', category: 'Nature', icon: '🍃', color: '#2E7D32' },
            { id: 'wood', name: 'Polished Wood Plank', category: 'Architecture', icon: '🪵', color: '#8D6E63' },
            { id: 'marble', name: 'White Marble Tile', category: 'Architecture', icon: '⬜', color: '#ECEFF1' },
            { id: 'brick', name: 'Terracotta Brick', category: 'Architecture', icon: '🧱', color: '#BF360C' },
            { id: 'lantern', name: 'Pandal Lantern Lamp', category: 'Lighting', icon: '🏮', color: '#FF9800' },
            { id: 'glass', name: 'Clear Glass', category: 'Architecture', icon: '🪟', color: '#81D4FA' }
        ];

        // Stats
        this.blessingsCount = 0;
        this.isAartiActive = false;

        // Flower Petals & Aarti Thali
        this.petals = [];
        this.aartiThali = null;
        this.aartiTimer = null;

        this.initScene();
        this.initLighting();
        this.initWorld();
        this.initPlayer();
        this.initUI();
        this.initEvents();

        // Build default majestic pandal with Ganesha
        this.voxelWorld.buildGrandPandal(0, 0, 0);

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Festive sky blue
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.015);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        // Procedural Clouds in the sky
        this.createClouds();
    }

    createClouds() {
        const cloudGeo = new THREE.BoxGeometry(1, 1, 1);
        const cloudMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.75 });
        const cloudsGroup = new THREE.Group();

        for (let i = 0; i < 20; i++) {
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            const w = 15 + Math.random() * 20;
            const d = 15 + Math.random() * 20;
            cloud.scale.set(w, 2, d);
            cloud.position.set(
                (Math.random() - 0.5) * 160,
                30 + Math.random() * 8,
                (Math.random() - 0.5) * 160
            );
            cloudsGroup.add(cloud);
        }
        this.scene.add(cloudsGroup);
        this.cloudsGroup = cloudsGroup;
    }

    initLighting() {
        // Soft ambient sky illumination
        const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x556B2F, 0.6);
        this.scene.add(hemiLight);

        // Sunlight
        this.sunLight = new THREE.DirectionalLight(0xFFF4E6, 1.2);
        this.sunLight.position.set(25, 45, 20);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 100;
        const d = 25;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.scene.add(this.sunLight);

        // Warm ambient ground bounce
        const ambientLight = new THREE.AmbientLight(0xFFEAA7, 0.35);
        this.scene.add(ambientLight);
    }

    initWorld() {
        this.voxelWorld = new VoxelWorld(this.scene);
        this.voxelWorld.generateTerrain(72);
        this.npcManager = new NPCManager(this.scene);
        this.npcManager.spawnDevotees(14);
    }

    initPlayer() {
        this.player = new PlayerController(this.camera, this.renderer.domElement, this.voxelWorld);
    }

    initUI() {
        this.renderHotbar();
        this.setupPaletteModal();

        // Pandal Quick-Build Button
        const btnBuildPandal = document.getElementById('btn-build-pandal');
        if (btnBuildPandal) {
            btnBuildPandal.addEventListener('click', (e) => {
                e.stopPropagation();
                // Build pandal where player is looking or near player
                const hit = this.getRaycastHit();
                const targetPos = hit ? hit.point : this.player.position.clone().add(new THREE.Vector3(0, 0, -6));
                this.voxelWorld.buildGrandPandal(
                    Math.round(targetPos.x),
                    1,
                    Math.round(targetPos.z),
                    true
                );
                this.showToast('✨ Grand Ganesh Pandal Built with Sacred Canopy & Diyas!');
            });
        }

        // Mute / Unmute Button
        const btnMute = document.getElementById('btn-mute');
        if (btnMute) {
            btnMute.addEventListener('click', (e) => {
                e.stopPropagation();
                const isMuted = window.soundEngine.toggleMute();
                btnMute.innerHTML = isMuted ? '🔇 Unmute Sound' : '🔊 Sound: ON';
            });
        }

        // Aarti trigger button on HUD
        const btnPerformAarti = document.getElementById('btn-aarti');
        if (btnPerformAarti) {
            btnPerformAarti.addEventListener('click', (e) => {
                e.stopPropagation();
                this.performAartiCeremony();
            });
        }
    }

    renderHotbar() {
        const hotbar = document.getElementById('hotbar');
        if (!hotbar) return;
        hotbar.innerHTML = '';
        this.hotbarItems.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = `hotbar-slot ${index === this.selectedSlot ? 'active' : ''}`;
            slot.dataset.index = index;
            slot.innerHTML = `
                <span class="slot-key">${item.key}</span>
                <span class="slot-icon">${item.icon}</span>
                <span class="slot-label">${item.name}</span>
            `;
            slot.addEventListener('click', () => this.selectSlot(index));
            hotbar.appendChild(slot);
        });
    }

    setupPaletteModal() {
        const modal = document.getElementById('palette-modal');
        const grid = document.getElementById('palette-grid');
        const btnOpen = document.getElementById('btn-palette');
        const btnTouchOpen = document.getElementById('btn-touch-palette');
        const btnClose = document.getElementById('btn-close-palette');

        if (!modal || !grid) return;

        grid.innerHTML = '';
        this.creativeCatalog.forEach(block => {
            const itemEl = document.createElement('div');
            itemEl.className = 'palette-item';
            itemEl.innerHTML = `
                <div class="item-icon">${block.icon}</div>
                <div class="item-name">${block.name}</div>
            `;
            itemEl.title = `${block.name} (${block.category}) - Click to equip`;
            itemEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.equipBlockToCurrentSlot(block);
                this.togglePalette(false);
            });
            grid.appendChild(itemEl);
        });

        if (btnOpen) {
            btnOpen.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePalette();
            });
        }
        if (btnTouchOpen) {
            btnTouchOpen.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePalette();
            });
        }
        if (btnClose) {
            btnClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePalette(false);
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.togglePalette(false);
            }
        });
    }

    togglePalette(forceOpen = null) {
        const modal = document.getElementById('palette-modal');
        if (!modal) return;
        const isClosed = (modal.style.display === 'none' || !modal.style.display);
        const shouldOpen = (forceOpen !== null) ? forceOpen : isClosed;
        if (shouldOpen) {
            modal.style.display = 'flex';
            if (document.exitPointerLock) {
                document.exitPointerLock();
            }
        } else {
            modal.style.display = 'none';
        }
    }

    equipBlockToCurrentSlot(block) {
        this.hotbarItems[this.selectedSlot] = {
            id: block.id,
            name: block.name,
            key: (this.selectedSlot + 1).toString(),
            icon: block.icon
        };
        this.renderHotbar();
        this.showToast(`Equipped ${block.icon} ${block.name} into Slot ${this.selectedSlot + 1}!`, 2000);
        if (window.soundEngine && window.soundEngine.playBlockPlace) {
            window.soundEngine.playBlockPlace();
        }
    }

    selectSlot(index) {
        if (index < 0 || index >= this.hotbarItems.length) return;
        this.selectedSlot = index;
        const slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach((s, idx) => {
            if (idx === index) s.classList.add('active');
            else s.classList.remove('active');
        });
        const currentItem = this.hotbarItems[index];
        this.showToast(`Selected: ${currentItem.icon} ${currentItem.name}`, 1200);
    }

    initEvents() {
        // Resize Listener (safeguarded per nik1)
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Mouse Controls: Left Click = Place, Right Click = Break
        window.addEventListener('mousedown', (e) => {
            if (!this.player.isLocked) return;

            if (e.button === 0) {
                // Left Click: Place selected block / idol (as in nik3)
                this.handlePlaceBlock();
            } else if (e.button === 2) {
                // Right Click: Break block / mine
                this.handleBreakBlock();
            }
        });

        // Prevent context menu on right-click
        window.addEventListener('contextmenu', (e) => {
            if (this.player.isLocked) {
                e.preventDefault();
            }
        });

        // Keyboard hotbar keys 1-9, 'B' for Palette, and 'E' for Aarti Interaction (nik3)
        window.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= this.hotbarItems.length) {
                this.selectSlot(num - 1);
            }

            // 'B' Key to toggle Creative Blocks Palette
            if (e.code === 'KeyB') {
                this.togglePalette();
            }

            // Escape closes palette
            if (e.code === 'Escape') {
                this.togglePalette(false);
            }

            // 'E' Key to interact with Lord Ganesha (nik3: InteractWithIdol)
            if (e.code === 'KeyE') {
                this.interactWithIdol();
            }

            // 'T' Key to Quick-Build Grand Pandal
            if (e.code === 'KeyT') {
                this.voxelWorld.buildGrandPandal(
                    Math.round(this.player.position.x),
                    1,
                    Math.round(this.player.position.z - 5),
                    true
                );
                this.showToast('✨ Grand Ganesh Pandal Built with Sacred Canopy & Diyas!');
            }
        });

        // Mouse Wheel to cycle hotbar
        window.addEventListener('wheel', (e) => {
            if (!this.player.isLocked) return;
            if (e.deltaY > 0) {
                this.selectSlot((this.selectedSlot + 1) % this.hotbarItems.length);
            } else {
                this.selectSlot((this.selectedSlot - 1 + this.hotbarItems.length) % this.hotbarItems.length);
            }
        });
    }

    getRaycastHit() {
        if (!this.voxelWorld || !this.voxelWorld.blockMeshes) return null;
        return this.player.getCenterRaycast(this.voxelWorld.blockMeshes);
    }

    handlePlaceBlock() {
        const hit = this.getRaycastHit();
        if (!hit) return;

        const currentItem = this.hotbarItems[this.selectedSlot];
        const snap = this.voxelWorld.calculateSnapPosition(hit);

        // Prevent placing inside player's body
        const pPos = this.player.position;
        if (Math.abs(snap.x - Math.round(pPos.x)) < 1 &&
            Math.abs(snap.z - Math.round(pPos.z)) < 1 &&
            (snap.y === Math.floor(pPos.y) || snap.y === Math.floor(pPos.y - 1))) {
            return;
        }

        this.voxelWorld.placeBlock(snap.x, snap.y, snap.z, currentItem.id, true);
    }

    handleBreakBlock() {
        const hit = this.getRaycastHit();
        if (!hit) return;

        // Traverse up to find root block mesh
        let obj = hit.object;
        while (obj.parent && obj.parent !== this.scene) {
            obj = obj.parent;
        }

        if (obj && obj.userData && obj.userData.coords) {
            const { x, y, z } = obj.userData.coords;
            this.voxelWorld.breakBlock(x, y, z);
            return;
        }

        // Fallback search
        for (const [key, val] of this.voxelWorld.blocks) {
            if (val.mesh === obj) {
                this.voxelWorld.breakBlock(val.x, val.y, val.z);
                break;
            }
        }
    }

    // Direct translation of nik3: InteractWithIdol()
    interactWithIdol() {
        const hit = this.getRaycastHit();
        let lookingAtGanesha = false;

        if (hit) {
            let obj = hit.object;
            while (obj) {
                if ((obj.name && obj.name.includes("Ganesha")) ||
                    (obj.userData && obj.userData.isGanesha) ||
                    (obj.userData && obj.userData.blockType === 'ganesha')) {
                    lookingAtGanesha = true;
                    break;
                }
                obj = obj.parent;
            }
        }

        // Distance check fallback (if player is in front of Ganesha in pandal)
        const isNearGanesha = this.voxelWorld.ganeshaInstances.some(g => {
            return g.position.distanceTo(this.player.position) < 8.0;
        });

        if (lookingAtGanesha || isNearGanesha) {
            this.performAartiCeremony();
        } else {
            this.showToast('Get closer and look at Lord Ganesha to perform Aarti! (Press E)');
        }
    }

    performAartiCeremony() {
        if (this.isAartiActive) return;
        this.isAartiActive = true;
        this.blessingsCount++;

        const blessingsEl = document.getElementById('blessings-count');
        if (blessingsEl) blessingsEl.innerText = this.blessingsCount;

        // Devotional Aarti Banner
        const aartiBanner = document.getElementById('aarti-banner');
        if (aartiBanner) {
            aartiBanner.style.display = 'block';
            aartiBanner.classList.add('pulse-glow');
        }

        // Start Web Audio Aarti & Shankha
        window.soundEngine.startAartiMelody((step) => {
            // Spawn continuous shower of flower petals
            this.spawnFlowerPetals(12);
        });

        // Spawn Floating Aarti Thali with camphor flame in front of closest Ganesha
        const ganesha = this.voxelWorld.ganeshaInstances[0];
        if (ganesha) {
            this.createAartiThali(ganesha.position);
        }

        this.showToast('🙏 Jai Ganesh Deva! Grand Aarti Ceremony in progress! ✨', 4000);

        // Ceremony lasts 12 seconds
        clearTimeout(this.aartiTimer);
        this.aartiTimer = setTimeout(() => {
            this.isAartiActive = false;
            window.soundEngine.stopAarti();
            if (aartiBanner) aartiBanner.style.display = 'none';
            if (this.aartiThali) {
                this.scene.remove(this.aartiThali);
                this.aartiThali = null;
            }
            this.showToast('✨ Aarti Completed! You have received Lord Ganesha’s blessings! 🌺', 4000);
        }, 12000);
    }

    createAartiThali(pos) {
        if (this.aartiThali) {
            this.scene.remove(this.aartiThali);
        }

        const thaliGroup = new THREE.Group();
        thaliGroup.position.set(pos.x, pos.y + 1.2, pos.z + 1.2);

        // Golden Thali plate
        const plateGeo = new THREE.CylinderGeometry(0.5, 0.4, 0.05, 24);
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9, roughness: 0.2 });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        thaliGroup.add(plate);

        // Brass Diya Lamp with camphor flame
        const diyaGeo = new THREE.CylinderGeometry(0.15, 0.08, 0.08, 16);
        const diya = new THREE.Mesh(diyaGeo, plateMat);
        diya.position.y = 0.06;
        thaliGroup.add(diya);

        const flameGeo = new THREE.ConeGeometry(0.08, 0.22, 12);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 0.18;
        thaliGroup.add(flame);

        // Dynamic Aarti Warm Light
        const thaliLight = new THREE.PointLight(0xFFA500, 2.0, 8);
        thaliLight.position.y = 0.25;
        thaliGroup.add(thaliLight);

        this.scene.add(thaliGroup);
        this.aartiThali = thaliGroup;
        this.aartiThaliOrigin = pos.clone().add(new THREE.Vector3(0, 1.3, 1.2));
    }

    spawnFlowerPetals(count = 15) {
        if (!this.petalMaterials) {
            const petalColors = [0xFF5722, 0xFF9800, 0xFFEB3B, 0xE91E63, 0xFFD700];
            this.petalMaterials = petalColors.map(c => new THREE.MeshBasicMaterial({
                color: c,
                side: THREE.DoubleSide
            }));
            this.petalGeo = new THREE.PlaneGeometry(0.18, 0.24);
        }

        if (this.petals.length > 80) return; // Cap maximum simultaneous petals for smooth performance

        for (let i = 0; i < count; i++) {
            const mat = this.petalMaterials[Math.floor(Math.random() * this.petalMaterials.length)];
            const mesh = new THREE.Mesh(this.petalGeo, mat);

            const spawnCenter = this.voxelWorld.ganeshaInstances[0] ?
                this.voxelWorld.ganeshaInstances[0].position : this.player.position;

            mesh.position.set(
                spawnCenter.x + (Math.random() - 0.5) * 5,
                spawnCenter.y + 4 + Math.random() * 2,
                spawnCenter.z + (Math.random() - 0.5) * 5
            );

            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 1.5,
                -1.2 - Math.random() * 1.5,
                (Math.random() - 0.5) * 1.5
            );

            this.scene.add(mesh);
            this.petals.push({
                mesh,
                velocity,
                rotSpeed: new THREE.Vector3(Math.random() * 3, Math.random() * 3, Math.random() * 3),
                life: 4.5
            });
        }
    }

    updatePetals(delta) {
        for (let i = this.petals.length - 1; i >= 0; i--) {
            const p = this.petals[i];
            p.life -= delta;
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.mesh.rotation.x += p.rotSpeed.x * delta;
            p.mesh.rotation.y += p.rotSpeed.y * delta;
            p.mesh.rotation.z += p.rotSpeed.z * delta;

            // Swirl gently
            p.velocity.x += Math.sin(Date.now() * 0.003 + i) * 0.05 * delta;

            if (p.life <= 0 || p.mesh.position.y < 0) {
                this.scene.remove(p.mesh);
                this.petals.splice(i, 1);
            }
        }
    }

    showToast(message, duration = 3000) {
        let toast = document.getElementById('game-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'game-toast';
            document.body.appendChild(toast);
        }
        toast.innerText = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(15px)';
        }, duration);
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);
        const elapsedTime = this.clock.getElapsedTime();

        try {
            // 1. Update Player simulation & collisions
            this.player.update(delta);

            // 2. Center Raycast hit testing for grid snapping indicator
            const hit = this.getRaycastHit();
            if (this.voxelWorld) {
                this.voxelWorld.updateCursorBox(hit);
            }

            // Check if looking at Ganesha to show "Press E to Perform Aarti" prompt
            const interactPrompt = document.getElementById('interact-prompt');
            if (interactPrompt) {
                let lookingAtGanesha = false;
                if (hit) {
                    let obj = hit.object;
                    while (obj) {
                        if ((obj.name && obj.name.includes("Ganesha")) ||
                            (obj.userData && obj.userData.isGanesha) ||
                            (obj.userData && obj.userData.blockType === 'ganesha')) {
                            lookingAtGanesha = true;
                            break;
                        }
                        obj = obj.parent;
                    }
                }
                interactPrompt.style.display = (lookingAtGanesha && !this.isAartiActive) ? 'block' : 'none';
            }

            // 3. Update Voxel Particles & Flower Petals
            this.voxelWorld.updateParticles(delta);
            this.updatePetals(delta);

            // Shimmer holy water waves
            if (this.voxelWorld.updateWater) {
                this.voxelWorld.updateWater(elapsedTime);
            }

            // Update animated devotees
            if (this.npcManager) {
                this.npcManager.update(delta, this.player.position, this.isAartiActive);
            }

            // 4. Animate Lord Ganesha Divine Aura
            this.voxelWorld.ganeshaInstances.forEach(g => {
                const halo = g.getObjectByName("Ganesha_Halo");
                if (halo) {
                    halo.rotation.z += 0.8 * delta;
                }
                // Diya gentle flicker
                g.traverse(child => {
                    if (child.name === "Diya_Flame") {
                        child.scale.y = 1 + Math.sin(elapsedTime * 12 + child.id) * 0.15;
                    }
                });
            });

            // 5. Circular Aarti Motion for Aarti Thali
            if (this.aartiThali && this.aartiThaliOrigin) {
                const aartiRadius = 0.5;
                const aartiSpeed = 3.5;
                this.aartiThali.position.x = this.aartiThaliOrigin.x + Math.cos(elapsedTime * aartiSpeed) * aartiRadius;
                this.aartiThali.position.y = this.aartiThaliOrigin.y + Math.sin(elapsedTime * aartiSpeed) * aartiRadius * 0.6;
                this.aartiThali.rotation.z = Math.sin(elapsedTime * aartiSpeed) * 0.15;
            }

            // 6. Slow drift for clouds
            if (this.cloudsGroup) {
                this.cloudsGroup.position.x = (elapsedTime * 1.5) % 100;
            }
        } catch (loopErr) {
            console.warn('Animation loop non-fatal error:', loopErr);
        }

        // 7. Render scene (guaranteed to run)
        this.renderer.render(this.scene, this.camera);
    }
}

// Safe boot game when DOM is ready
function bootGame() {
    if (!window.game) {
        window.game = new GaneshMinecraftGame();
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootGame);
} else {
    bootGame();
}
