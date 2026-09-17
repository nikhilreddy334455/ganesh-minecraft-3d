// Main Game Engine, Raycasting, Aarti Interaction, and Animation Loop
class GaneshMinecraftGame {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.clock = new THREE.Clock();

        // Hotbar Items (9 customizable slots)
        this.hotbarItems = [
            { id: 'marble', name: 'Marble Plinth', key: '1', icon: '⬜' },
            { id: 'ganesha', name: 'Lord Ganesha Idol', key: '2', icon: '🐘' },
            { id: 'diya', name: 'Glowing Diya', key: '3', icon: '🪔' },
            { id: 'tent_red', name: 'Red Tent Fabric', key: '4', icon: '⛺' },
            { id: 'tent_gold', name: 'Gold Tent Fabric', key: '5', icon: '✨' },
            { id: 'pillar', name: 'Temple Pillar', key: '6', icon: '🏛️' },
            { id: 'marigold', name: 'Marigold Garland', key: '7', icon: '🌼' },
            { id: 'lantern', name: 'Pandal Lantern', key: '8', icon: '🏮' },
            { id: 'water', name: 'Holy Water Block', key: '9', icon: '💧' }
        ];
        this.selectedSlot = 0; // default marble plinth for Level 1 foundation

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

        // Lord Ganesha Lift & Carry State: null | { type: 'companion' | 'idol', mesh?: THREE.Object3D, coords?: {x,y,z} }
        this.carriedGanesha = null;

        this.initScene();
        this.initLighting();
        this.initWorld();
        this.initPlayer();
        this.multiplayer = new MultiplayerManager(this);
        this.levelManager = new LevelManager(this);
        this.ganeshaCompanion = new GaneshaCompanion(this);
        this.initUI();
        this.initEvents();

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Festive sky blue
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.007);

        const isMobile = typeof navigator !== 'undefined' && (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
            (window.innerWidth <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0))
        );
        this.isMobile = isMobile;

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            800
        );

        this.renderer = new THREE.WebGLRenderer({
            antialias: !isMobile, // Disable expensive MSAA on mobile for 2x framerate
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false // Prevent copying framebuffer each frame
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2));

        if (!isMobile) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        } else {
            // Disabling shadow map on mobile gives massive 60fps performance
            this.renderer.shadowMap.enabled = false;
        }

        this.container.appendChild(this.renderer.domElement);

        // Procedural Clouds in the sky
        this.createClouds();
    }

    createClouds() {
        const cloudGeo = new THREE.BoxGeometry(1, 1, 1);
        const cloudMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.75 });
        const cloudsGroup = new THREE.Group();
        const cloudCount = this.isMobile ? 12 : 28;

        for (let i = 0; i < cloudCount; i++) {
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            const w = 18 + Math.random() * 24;
            const d = 18 + Math.random() * 24;
            cloud.scale.set(w, 2, d);
            cloud.position.set(
                (Math.random() - 0.5) * 240,
                30 + Math.random() * 8,
                (Math.random() - 0.5) * 240
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
        this.sunLight.position.set(35, 55, 30);
        if (!this.isMobile) {
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = 1024;
            this.sunLight.shadow.mapSize.height = 1024;
            this.sunLight.shadow.camera.near = 0.5;
            this.sunLight.shadow.camera.far = 140;
            const d = 40;
            this.sunLight.shadow.camera.left = -d;
            this.sunLight.shadow.camera.right = d;
            this.sunLight.shadow.camera.top = d;
            this.sunLight.shadow.camera.bottom = -d;
        } else {
            this.sunLight.castShadow = false;
        }
        this.scene.add(this.sunLight);

        // Warm ambient ground bounce
        const ambientLight = new THREE.AmbientLight(0xFFEAA7, 0.35);
        this.scene.add(ambientLight);
    }

    initWorld() {
        this.voxelWorld = new VoxelWorld(this.scene);
        this.voxelWorld.generateTerrain(this.isMobile ? 60 : 76);
    }

    initPlayer() {
        this.player = new PlayerController(this.camera, this.renderer.domElement, this.voxelWorld);
    }

    initUI() {
        this.renderHotbar();
        this.setupPaletteModal();
        this.setupMultiplayerModal();

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
                if (this.levelManager) {
                    for (let i = 0; i < 8; i++) this.levelManager.onBlockPlaced('marble');
                    for (let i = 0; i < 8; i++) this.levelManager.onBlockPlaced('pillar');
                    for (let i = 0; i < 12; i++) this.levelManager.onBlockPlaced('tent_red');
                    for (let i = 0; i < 4; i++) this.levelManager.onBlockPlaced('diya');
                }
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

        // Restart Button on Top HUD
        const btnRestart = document.getElementById('btn-restart');
        if (btnRestart) {
            btnRestart.addEventListener('click', (e) => {
                e.stopPropagation();
                this.restartGame();
            });
        }

        // Restart Touch Button on Mobile
        const btnTouchRestart = document.getElementById('btn-touch-restart');
        if (btnTouchRestart) {
            btnTouchRestart.addEventListener('click', (e) => {
                e.stopPropagation();
                this.restartGame();
            });
        }

        // Restart button inside instructions modal
        const btnModalRestart = document.getElementById('btn-modal-restart');
        if (btnModalRestart) {
            btnModalRestart.addEventListener('click', (e) => {
                e.stopPropagation();
                this.restartGame();
            });
        }

        // Lift / Drop Top HUD Button
        const btnLiftGanesha = document.getElementById('btn-lift-ganesha');
        if (btnLiftGanesha) {
            btnLiftGanesha.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLiftDropGanesha();
            });
        }

        // Lift / Drop Touch Button on Mobile
        const btnTouchLift = document.getElementById('btn-touch-lift');
        if (btnTouchLift) {
            btnTouchLift.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLiftDropGanesha();
            });
        }

        // Initialize consolidated single-button mobile menu
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const btnMenu = document.getElementById('btn-mobile-menu');
        const menuModal = document.getElementById('mobile-menu-modal');
        const btnClose = document.getElementById('btn-close-mobile-menu');

        const openMenu = () => {
            if (!menuModal) return;
            const isCarrying = !!this.carriedGanesha;
            const liftTitle = document.getElementById('menu-lift-title');
            const liftIcon = document.getElementById('menu-lift-icon');
            const liftSub = document.getElementById('menu-lift-sub');
            if (liftTitle) liftTitle.innerText = isCarrying ? 'Drop Ganesha' : 'Lift Ganesha';
            if (liftIcon) liftIcon.innerText = isCarrying ? '⬇️' : '🤲';
            if (liftSub) liftSub.innerText = isCarrying ? 'Place Down' : 'Carry with You';

            const soundSub = document.getElementById('menu-sound-sub');
            const soundIcon = document.getElementById('menu-sound-icon');
            if (soundSub && window.soundEngine) {
                soundSub.innerText = window.soundEngine.isMuted ? 'Muted' : 'Audio On';
            }
            if (soundIcon && window.soundEngine) {
                soundIcon.innerText = window.soundEngine.isMuted ? '🔇' : '🔊';
            }

            const questSnippet = document.getElementById('mobile-menu-quest-snippet');
            if (questSnippet && this.levelManager && this.levelManager.levels) {
                const cur = this.levelManager.levels[this.levelManager.currentLevelIndex];
                if (cur) {
                    questSnippet.innerHTML = `🏆 <strong>Level ${cur.level}: ${cur.name}</strong><br>${cur.description}`;
                    questSnippet.style.display = 'block';
                }
            }

            menuModal.style.display = 'flex';
        };

        const closeMenu = () => {
            if (menuModal) menuModal.style.display = 'none';
        };

        if (btnMenu) {
            btnMenu.addEventListener('click', (e) => { e.stopPropagation(); openMenu(); });
            btnMenu.addEventListener('touchend', (e) => { e.stopPropagation(); openMenu(); });
        }
        if (btnClose) {
            btnClose.addEventListener('click', (e) => { e.stopPropagation(); closeMenu(); });
            btnClose.addEventListener('touchend', (e) => { e.stopPropagation(); closeMenu(); });
        }
        if (menuModal) {
            menuModal.addEventListener('click', (e) => {
                if (e.target === menuModal) closeMenu();
            });
        }

        const bindMenuItem = (id, action) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const handle = (e) => {
                e.stopPropagation();
                closeMenu();
                action();
            };
            btn.addEventListener('click', handle);
            btn.addEventListener('touchend', handle);
        };

        bindMenuItem('menu-btn-palette', () => this.togglePalette(true));
        bindMenuItem('menu-btn-aarti', () => this.performAartiCeremony());
        bindMenuItem('menu-btn-lift', () => this.toggleLiftDropGanesha());
        bindMenuItem('menu-btn-companion', () => {
            if (this.ganeshaCompanion) this.ganeshaCompanion.openCompanionDialog();
        });
        bindMenuItem('menu-btn-pandal', () => {
            const hit = this.getRaycastHit();
            const targetPos = hit ? hit.point : this.player.position.clone().add(new THREE.Vector3(0, 0, -6));
            this.voxelWorld.buildGrandPandal(
                Math.round(targetPos.x),
                1,
                Math.round(targetPos.z),
                true
            );
            if (this.levelManager) {
                for (let i = 0; i < 8; i++) this.levelManager.onBlockPlaced('marble');
                for (let i = 0; i < 8; i++) this.levelManager.onBlockPlaced('pillar');
                for (let i = 0; i < 12; i++) this.levelManager.onBlockPlaced('tent_red');
                for (let i = 0; i < 4; i++) this.levelManager.onBlockPlaced('diya');
            }
            this.showToast('✨ Grand Ganesh Pandal Built with Sacred Canopy & Diyas!');
        });
        bindMenuItem('menu-btn-levels', () => {
            if (this.levelManager) this.levelManager.openLevelsModal();
        });
        bindMenuItem('menu-btn-multiplayer', () => {
            if (this.multiplayer) this.toggleMultiplayerModal(true);
        });
        bindMenuItem('menu-btn-restart', () => this.restartGame());
        bindMenuItem('menu-btn-sound', () => {
            if (window.soundEngine) {
                const isMuted = window.soundEngine.toggleMute();
                this.showToast(isMuted ? '🔇 Audio Muted' : '🔊 Audio Enabled', 1500);
            }
        });
        bindMenuItem('menu-btn-help', () => {
            const blocker = document.getElementById('blocker');
            if (blocker) blocker.style.display = 'flex';
        });
    }

    restartGame(broadcast = true) {
        // 1. Stop any active Aarti ceremony
        if (this.isAartiActive) {
            this.isAartiActive = false;
            clearTimeout(this.aartiTimer);
            if (window.soundEngine && window.soundEngine.stopAarti) {
                window.soundEngine.stopAarti();
            }
            const aartiBanner = document.getElementById('aarti-banner');
            if (aartiBanner) aartiBanner.style.display = 'none';
        }
        if (this.aartiThali) {
            this.scene.remove(this.aartiThali);
            this.aartiThali = null;
        }

        // 2. Remove all floating flower petals
        this.petals.forEach(p => this.scene.remove(p.mesh));
        this.petals.length = 0;

        // 3. Clear and regenerate the pristine extended voxel world (NO default tent)
        this.voxelWorld.clearWorld();
        this.voxelWorld.generateTerrain(this.isMobile ? 60 : 76);

        // 4. Reset player position and velocity to sanctum entrance
        if (this.player && this.player.resetPosition) {
            this.player.resetPosition(0, 2.25, 7);
        }

        // 5. Reset blessings count to 0
        this.blessingsCount = 0;
        const blessingsEl = document.getElementById('blessings-count');
        if (blessingsEl) blessingsEl.innerText = '0';

        // 6. Reset hotbar to Level 1 foundation items
        this.hotbarItems = [
            { id: 'marble', name: 'Marble Plinth', key: '1', icon: '⬜' },
            { id: 'ganesha', name: 'Lord Ganesha Idol', key: '2', icon: '🐘' },
            { id: 'diya', name: 'Glowing Diya', key: '3', icon: '🪔' },
            { id: 'tent_red', name: 'Red Tent Fabric', key: '4', icon: '⛺' },
            { id: 'tent_gold', name: 'Gold Tent Fabric', key: '5', icon: '✨' },
            { id: 'pillar', name: 'Temple Pillar', key: '6', icon: '🏛️' },
            { id: 'marigold', name: 'Marigold Garland', key: '7', icon: '🌼' },
            { id: 'lantern', name: 'Pandal Lantern', key: '8', icon: '🏮' },
            { id: 'water', name: 'Holy Water Block', key: '9', icon: '💧' }
        ];
        this.renderHotbar();
        this.selectSlot(0);

        // 7. Reset level progression and reload all levels to Level 1
        if (this.levelManager) {
            this.levelManager.resetAllProgression();
        }

        // 8. Reset Lord Ganesha Companion back to pristine sanctum
        if (this.ganeshaCompanion) {
            this.ganeshaCompanion.resetToSanctum();
        }

        // Reset carried Ganesha state
        if (this.carriedGanesha && this.carriedGanesha.mesh) {
            this.scene.remove(this.carriedGanesha.mesh);
        }
        this.carriedGanesha = null;
        this.updateLiftDropUI();

        // 9. Close any open overlays
        this.togglePalette(false);
        this.toggleMultiplayerModal(false);
        if (this.levelManager) {
            this.levelManager.toggleLevelsModal(false);
            this.levelManager.dismissLevelCompleteModal();
        }
        if (this.ganeshaCompanion) {
            this.ganeshaCompanion.closeAllModals();
        }

        // 10. Re-render Level HUD immediately so user sees Level 1 loaded with 0 progress
        if (this.levelManager) {
            this.levelManager.renderHUD();
        }

        // Keep player active in game if already entered
        const blocker = document.getElementById('blocker');
        if (blocker && !this.player.hasEnteredGame) {
            blocker.style.display = 'flex';
        } else if (blocker) {
            blocker.style.display = 'none';
        }

        // 10. Broadcast restart to multiplayer peers if connected
        if (broadcast && this.multiplayer && this.multiplayer.broadcastRestart) {
            this.multiplayer.broadcastRestart();
        }

        // 11. Auspicious Temple Bell sound and festive restart notification
        if (window.soundEngine && window.soundEngine.playTempleBell) {
            window.soundEngine.playTempleBell(2000, 1.4);
        }
        this.showToast('🔄 Game Started Over! Level 1: Sthapana Reloaded (0/4 Objectives)!', 3500);
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

    setupMultiplayerModal() {
        const modal = document.getElementById('multiplayer-modal');
        const btnOpen = document.getElementById('btn-multiplayer');
        const btnTouchOpen = document.getElementById('btn-touch-multiplayer');
        const btnModalMp = document.getElementById('btn-modal-multiplayer');
        const btnClose = document.getElementById('btn-close-multiplayer');

        const btnPublic = document.getElementById('btn-mp-public');
        const btnHost = document.getElementById('btn-mp-host');
        const btnJoin = document.getElementById('btn-mp-join');
        const joinInput = document.getElementById('mp-join-input');
        const btnCopyCode = document.getElementById('btn-copy-code');
        const btnCopyLink = document.getElementById('btn-copy-link');

        if (!modal) return;

        if (btnOpen) btnOpen.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMultiplayerModal(); });
        if (btnTouchOpen) btnTouchOpen.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMultiplayerModal(); });
        if (btnModalMp) btnModalMp.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMultiplayerModal(true); });
        if (btnClose) btnClose.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMultiplayerModal(false); });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.toggleMultiplayerModal(false);
        });

        // 1-Click Instant Public World button
        if (btnPublic) {
            btnPublic.addEventListener('click', (e) => {
                e.stopPropagation();
                this.multiplayer.joinPublicWorld();
                this.toggleMultiplayerModal(false);
            });
        }

        // Host button
        if (btnHost) {
            btnHost.addEventListener('click', (e) => {
                e.stopPropagation();
                this.multiplayer.hostRoom((code) => {
                    try { localStorage.setItem('ganesh_active_room', code); } catch (err) {}
                    this.showToast(`👑 Room Created! Code: ${code}. Share it with your friend!`, 4000);
                });
            });
        }

        // Join button
        if (btnJoin && joinInput) {
            btnJoin.addEventListener('click', (e) => {
                e.stopPropagation();
                const code = joinInput.value.trim();
                if (!code) {
                    this.showToast('Please enter a room code!', 3000);
                    return;
                }
                this.multiplayer.joinRoom(code);
                this.toggleMultiplayerModal(false);
            });
            joinInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    btnJoin.click();
                }
            });
        }

        // Quick Join Active Room button (Same PC / Tabs)
        const btnQuickJoin = document.getElementById('btn-mp-quick-join');
        if (btnQuickJoin) {
            btnQuickJoin.addEventListener('click', (e) => {
                e.stopPropagation();
                let activeRoom = null;
                try { activeRoom = localStorage.getItem('ganesh_active_room'); } catch (err) {}
                if (activeRoom) {
                    if (joinInput) joinInput.value = activeRoom;
                    this.multiplayer.joinRoom(activeRoom);
                    this.toggleMultiplayerModal(false);
                    this.showToast(`Connecting to room ${activeRoom}...`, 2500);
                } else {
                    this.showToast('No active room found on this machine. Create one first!', 3000);
                }
            });
        }

        // Copy Code button
        if (btnCopyCode) {
            btnCopyCode.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.multiplayer.roomCode) {
                    navigator.clipboard.writeText(this.multiplayer.roomCode).then(() => {
                        this.showToast('📋 Room Code copied to clipboard!', 2500);
                    }).catch(() => {
                        this.showToast(`Code: ${this.multiplayer.roomCode}`, 3000);
                    });
                }
            });
        }

        // Copy Link button
        if (btnCopyLink) {
            btnCopyLink.addEventListener('click', (e) => {
                e.stopPropagation();
                const linkInput = document.getElementById('mp-share-link');
                if (linkInput && linkInput.value) {
                    navigator.clipboard.writeText(linkInput.value).then(() => {
                        this.showToast('🔗 Direct Invite Link copied to clipboard!', 2500);
                    }).catch(() => {
                        this.showToast('Copied link!', 2000);
                    });
                }
            });
        }

        // Check if there was an auto-join room code in URL parameter
        if (this.multiplayer && this.multiplayer.pendingRoomCode) {
            setTimeout(() => {
                this.showToast(`Auto-joining room: ${this.multiplayer.pendingRoomCode}...`, 3000);
                this.multiplayer.joinRoom(this.multiplayer.pendingRoomCode);
            }, 1000);
        }
    }

    toggleMultiplayerModal(forceOpen = null) {
        const modal = document.getElementById('multiplayer-modal');
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
        // Resize & Orientation Listener (safeguarded per nik1 & mobile landscape)
        const updateViewDimensions = () => {
            if (!this.camera || !this.renderer) return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        };

        window.addEventListener('resize', updateViewDimensions);
        window.addEventListener('orientationchange', () => {
            updateViewDimensions();
            setTimeout(updateViewDimensions, 100);
            setTimeout(updateViewDimensions, 300);
        });
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                updateViewDimensions();
                setTimeout(updateViewDimensions, 100);
                setTimeout(updateViewDimensions, 300);
            });
        }

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

        // Keyboard hotbar keys 1-9, 'B' for Palette, 'M' for Friends, 'L' for Levels, 'R' for Restart, 'E' for Aarti
        window.addEventListener('keydown', (e) => {
            // Do not trigger game hotkeys if user is currently typing in an input or textarea
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                return;
            }

            const k = (e.key || '').toLowerCase();

            const num = parseInt(e.key);
            if (num >= 1 && num <= this.hotbarItems.length) {
                this.selectSlot(num - 1);
            }

            // 'B' Key to toggle Creative Blocks Palette
            if (k === 'b' || e.code === 'KeyB') {
                this.togglePalette();
            }

            // 'M' Key to toggle Multiplayer Room Code modal
            if (k === 'm' || e.code === 'KeyM') {
                e.preventDefault();
                this.toggleMultiplayerModal();
            }

            // 'L' Key to toggle Levels Overview Modal
            if (k === 'l' || e.code === 'KeyL') {
                e.preventDefault();
                if (this.levelManager) {
                    this.levelManager.toggleLevelsModal();
                }
            }

            // 'R' Key to Restart Game & Reload Levels
            if (k === 'r' || e.code === 'KeyR') {
                e.preventDefault();
                this.restartGame();
            }

            // Escape closes modals
            if (e.key === 'Escape' || e.code === 'Escape') {
                this.togglePalette(false);
                this.toggleMultiplayerModal(false);
                if (this.levelManager) {
                    this.levelManager.toggleLevelsModal(false);
                    this.levelManager.dismissLevelCompleteModal();
                }
                if (this.ganeshaCompanion) {
                    this.ganeshaCompanion.closeAllModals();
                }
            }

            // 'G' Key to open Lord Ganesha Companion & Tasks Dialog
            if (k === 'g' || e.code === 'KeyG') {
                if (this.ganeshaCompanion) {
                    this.ganeshaCompanion.openCompanionDialog();
                }
            }

            // 'F' Key to Lift or Drop Lord Ganesha
            if (k === 'f' || e.code === 'KeyF') {
                e.preventDefault();
                this.toggleLiftDropGanesha();
            }

            // 'E' Key to interact with Lord Ganesha Companion or Idol
            if (k === 'e' || e.code === 'KeyE') {
                this.interactWithIdol();
            }

            // 'T' Key to Quick-Build Grand Pandal
            if (k === 't' || e.code === 'KeyT') {
                this.voxelWorld.buildGrandPandal(
                    Math.round(this.player.position.x),
                    1,
                    Math.round(this.player.position.z - 5),
                    true
                );
                if (this.levelManager) {
                    for (let i = 0; i < 8; i++) this.levelManager.onBlockPlaced('marble');
                    for (let i = 0; i < 8; i++) this.levelManager.onBlockPlaced('pillar');
                    for (let i = 0; i < 12; i++) this.levelManager.onBlockPlaced('tent_red');
                    for (let i = 0; i < 4; i++) this.levelManager.onBlockPlaced('diya');
                }
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
        try {
            if (!this.voxelWorld) return;
            const hit = this.getRaycastHit();
            if (!hit) return;

            const currentItem = this.hotbarItems[this.selectedSlot];
            if (!currentItem) return;

            const snap = this.voxelWorld.calculateSnapPosition(hit);
            if (!snap) return;

            // Prevent placing inside player's body
            const pPos = this.player ? this.player.position : null;
            if (pPos && Math.abs(snap.x - Math.round(pPos.x)) < 1 &&
                Math.abs(snap.z - Math.round(pPos.z)) < 1 &&
                (snap.y === Math.floor(pPos.y) || snap.y === Math.floor(pPos.y - 1))) {
                return;
            }

            const placed = this.voxelWorld.placeBlock(snap.x, snap.y, snap.z, currentItem.id, true);
            if (!placed) return;

            if (this.levelManager && this.levelManager.onBlockPlaced) {
                try { this.levelManager.onBlockPlaced(currentItem.id); } catch(e) {}
            }
            if (this.ganeshaCompanion && this.ganeshaCompanion.onBlockPlaced) {
                try { this.ganeshaCompanion.onBlockPlaced(currentItem.id, snap.x, snap.y, snap.z); } catch(e) {}
            }
            if (this.multiplayer && this.multiplayer.broadcastPlaceBlock) {
                try { this.multiplayer.broadcastPlaceBlock(snap.x, snap.y, snap.z, currentItem.id); } catch(e) {}
            }
        } catch (err) {
            console.warn('Safe handlePlaceBlock error:', err);
        }
    }

    handleBreakBlock() {
        try {
            if (!this.voxelWorld) return;
            const hit = this.getRaycastHit();
            if (!hit) return;

            // Traverse up to find root block mesh
            let obj = hit.object;
            while (obj && obj.parent && obj.parent !== this.scene) {
                obj = obj.parent;
            }

            if (obj && obj.userData && obj.userData.coords) {
                const { x, y, z } = obj.userData.coords;
                const bType = (obj.userData && obj.userData.blockType) || null;
                this.voxelWorld.breakBlock(x, y, z);
                if (this.levelManager && bType && this.levelManager.onBlockBroken) {
                    try { this.levelManager.onBlockBroken(bType); } catch(e) {}
                }
                if (this.multiplayer && this.multiplayer.broadcastBreakBlock) {
                    try { this.multiplayer.broadcastBreakBlock(x, y, z); } catch(e) {}
                }
                return;
            }

            // Fallback search
            if (this.voxelWorld.blocks) {
                for (const [key, val] of this.voxelWorld.blocks) {
                    if (val.mesh === obj) {
                        this.voxelWorld.breakBlock(val.x, val.y, val.z);
                        if (this.levelManager && val.type && this.levelManager.onBlockBroken) {
                            try { this.levelManager.onBlockBroken(val.type); } catch(e) {}
                        }
                        if (this.multiplayer && this.multiplayer.broadcastBreakBlock) {
                            try { this.multiplayer.broadcastBreakBlock(val.x, val.y, val.z); } catch(e) {}
                        }
                        break;
                    }
                }
            }
        } catch (err) {
            console.warn('Safe handleBreakBlock error:', err);
        }
    }

    // Update UI when lifting or dropping Lord Ganesha
    updateLiftDropUI() {
        const isCarrying = !!this.carriedGanesha;
        const btnLift = document.getElementById('btn-lift-ganesha');
        if (btnLift) {
            btnLift.innerText = isCarrying ? '⬇️ Drop (F)' : '🤲 Lift (F)';
            if (isCarrying) btnLift.classList.add('carrying');
            else btnLift.classList.remove('carrying');
        }
        const btnTouchLift = document.getElementById('btn-touch-lift');
        if (btnTouchLift) {
            btnTouchLift.innerText = isCarrying ? '⬇️ Drop' : '🤲 Lift';
            if (isCarrying) btnTouchLift.classList.add('carrying');
            else btnTouchLift.classList.remove('carrying');
        }
        if (this.ganeshaCompanion && this.ganeshaCompanion.updateDialogUI) {
            this.ganeshaCompanion.updateDialogUI();
        }
    }

    // Main Lift & Drop Engine: pick up or place down Lord Ganesha
    toggleLiftDropGanesha() {
        if (this.carriedGanesha) {
            // ==========================
            // 1. DROP LORD GANESHA
            // ==========================
            const hit = this.getRaycastHit();
            let dropPos;
            if (hit && hit.point) {
                dropPos = this.voxelWorld.calculateSnapPosition(hit);
            } else {
                const camDir = new THREE.Vector3();
                this.camera.getWorldDirection(camDir);
                camDir.y = 0;
                if (camDir.lengthSq() < 0.001) camDir.set(0, 0, -1);
                camDir.normalize();

                const fx = Math.round(this.player.position.x + camDir.x * 2.5);
                const fz = Math.round(this.player.position.z + camDir.z * 2.5);
                const fy = this.ganeshaCompanion ? this.ganeshaCompanion.getGroundHeight(fx, fz) : 1;
                dropPos = new THREE.Vector3(fx, fy, fz);
            }

            if (this.carriedGanesha.type === 'companion') {
                if (this.ganeshaCompanion) {
                    this.ganeshaCompanion.drop(dropPos.x, dropPos.y, dropPos.z);
                }
                this.showToast('✨ Lord Ganesha placed down safely in the sanctum!', 3000);
            } else if (this.carriedGanesha.type === 'idol') {
                if (this.carriedGanesha.mesh) {
                    this.scene.remove(this.carriedGanesha.mesh);
                }
                this.voxelWorld.placeGanesha(dropPos.x, dropPos.y, dropPos.z, true);
                if (this.levelManager && this.levelManager.onBlockPlaced) {
                    try { this.levelManager.onBlockPlaced('ganesha'); } catch(e) {}
                }
                if (this.multiplayer && this.multiplayer.broadcastPlaceBlock) {
                    try { this.multiplayer.broadcastPlaceBlock(dropPos.x, dropPos.y, dropPos.z, 'ganesha'); } catch(e) {}
                }
                this.spawnFlowerPetals(25);
                if (window.soundEngine && window.soundEngine.playTempleBell) {
                    window.soundEngine.playTempleBell(2100, 1.8);
                }
                this.showToast('✨ Lord Ganesha Idol consecrated at new location!', 3000);
            }

            this.carriedGanesha = null;
            this.updateLiftDropUI();
            return;
        }

        // ==========================
        // 2. LIFT LORD GANESHA
        // ==========================
        const hit = this.getRaycastHit();
        let hitGaneshaIdol = null;
        if (hit) {
            let obj = hit.object;
            while (obj && obj.parent && obj.parent !== this.scene) {
                obj = obj.parent;
            }
            if (obj && obj.userData && (obj.userData.isGanesha || obj.userData.blockType === 'ganesha')) {
                hitGaneshaIdol = obj;
            }
        }

        let nearIdol = null;
        if (!hitGaneshaIdol && this.voxelWorld && this.voxelWorld.ganeshaInstances) {
            for (const idol of this.voxelWorld.ganeshaInstances) {
                if (idol.position.distanceTo(this.player.position) < 4.8) {
                    nearIdol = idol;
                    break;
                }
            }
        }

        const targetIdol = hitGaneshaIdol || nearIdol;

        let nearCompanion = false;
        if (this.ganeshaCompanion && this.ganeshaCompanion.model) {
            nearCompanion = this.ganeshaCompanion.model.position.distanceTo(this.player.position) < 5.5;
        }

        if (targetIdol) {
            const coords = (targetIdol.userData && targetIdol.userData.coords) || {
                x: Math.round(targetIdol.position.x),
                y: Math.round(targetIdol.position.y + 0.5),
                z: Math.round(targetIdol.position.z)
            };
            this.voxelWorld.removeIdolQuietly(coords.x, coords.y, coords.z);

            const carriedMesh = GaneshaModel.createIdol();
            carriedMesh.scale.set(0.65, 0.65, 0.65);
            this.scene.add(carriedMesh);
            this.carriedGanesha = { type: 'idol', mesh: carriedMesh, coords };

            if (window.soundEngine) {
                if (window.soundEngine.playTempleBell) window.soundEngine.playTempleBell(2100, 1.5);
                if (window.soundEngine.playSparkle) window.soundEngine.playSparkle();
            }
            this.spawnFlowerPetals(20);
            this.showToast('🤲 Sacred Lord Ganesha Idol lifted! Walk anywhere and press [F] or Drop to place Him down!', 3500);
            this.updateLiftDropUI();
        } else if (nearCompanion) {
            this.ganeshaCompanion.lift();
            this.carriedGanesha = { type: 'companion' };
            this.showToast('🤲 Lord Ganesha Companion lifted! Walk anywhere and press [F] or Drop to place Him down!', 3500);
            this.updateLiftDropUI();
        } else {
            this.showToast('Get closer to Lord Ganesha to lift Him! (Press F or click Lift when nearby)', 2500);
        }
    }

    // Direct interaction with Standing Companion or Idol (E Key)
    interactWithIdol() {
        // Priority 1: Check proximity to Standing Ganesha Companion
        if (this.ganeshaCompanion && this.ganeshaCompanion.model) {
            const distToCompanion = this.ganeshaCompanion.model.position.distanceTo(this.player.position);
            if (distToCompanion < 6.5) {
                this.ganeshaCompanion.openCompanionDialog();
                return;
            }
        }

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
            this.showToast('Get closer and look at Lord Ganesha to perform Aarti! (Press E or G)');
        }
    }

    performAartiCeremony(broadcast = true) {
        if (this.isAartiActive) return;
        this.isAartiActive = true;
        this.blessingsCount++;

        if (this.levelManager) {
            this.levelManager.onAartiPerformed();
        }
        if (this.ganeshaCompanion) {
            this.ganeshaCompanion.onAartiPerformed();
        }

        if (broadcast && this.multiplayer) {
            this.multiplayer.broadcastAarti();
        }

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

            // Position carried idol mesh gracefully in front of camera
            if (this.carriedGanesha && this.carriedGanesha.type === 'idol' && this.carriedGanesha.mesh) {
                const pPos = this.player.position;
                const camDir = new THREE.Vector3();
                this.camera.getWorldDirection(camDir);
                camDir.y = 0;
                if (camDir.lengthSq() < 0.001) camDir.set(0, 0, -1);
                camDir.normalize();

                const hoverBob = Math.sin(elapsedTime * 3.5) * 0.06;
                this.carriedGanesha.mesh.position.set(
                    pPos.x + camDir.x * 1.5,
                    pPos.y - 0.2 + hoverBob,
                    pPos.z + camDir.z * 1.5
                );
                this.carriedGanesha.mesh.rotation.y = Math.atan2(camDir.x, camDir.z);
            }

            // Check if carrying Ganesha, near standing Ganesha companion, or looking at Ganesha
            const interactPrompt = document.getElementById('interact-prompt');
            if (interactPrompt) {
                if (this.carriedGanesha) {
                    interactPrompt.innerText = '🤲 Carrying Lord Ganesha • Press [ F ] or [ Drop ] to Place Down ✨';
                    interactPrompt.style.display = 'block';
                } else {
                    let isNearCompanion = false;
                    if (this.ganeshaCompanion && this.ganeshaCompanion.model) {
                        isNearCompanion = this.ganeshaCompanion.model.position.distanceTo(this.player.position) < 6.5;
                    }
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
                    if (isNearCompanion) {
                        interactPrompt.innerText = '🤲 Press [ F ] to Lift Ganesha • [ E ] to Talk & Play!';
                        interactPrompt.style.display = 'block';
                    } else if (lookingAtGanesha && !this.isAartiActive) {
                        interactPrompt.innerText = '🤲 Press [ F ] to Lift Idol • [ E ] for Aarti!';
                        interactPrompt.style.display = 'block';
                    } else {
                        interactPrompt.style.display = 'none';
                    }
                }
            }

            // 3. Update Voxel Particles & Flower Petals
            this.voxelWorld.updateParticles(delta);
            this.updatePetals(delta);

            // Shimmer holy water waves
            if (this.voxelWorld.updateWater) {
                this.voxelWorld.updateWater(elapsedTime);
            }

            // Update Lord Ganesha Standing Character & Companion
            if (this.ganeshaCompanion) {
                this.ganeshaCompanion.update(delta);
            }

            // Update multiplayer remote player avatar
            if (this.multiplayer) {
                this.multiplayer.update(delta);
            }

            // 4. Animate Lord Ganesha Divine Aura & Cached Diya Flames (no per-frame traverse)
            if (!this.cachedDiyaFlames || this.cachedDiyaFlamesCount !== this.voxelWorld.ganeshaInstances.length) {
                this.cachedDiyaFlames = [];
                this.voxelWorld.ganeshaInstances.forEach(g => {
                    g.traverse(child => {
                        if (child.name === "Diya_Flame") this.cachedDiyaFlames.push(child);
                    });
                });
                this.cachedDiyaFlamesCount = this.voxelWorld.ganeshaInstances.length;
            }
            this.voxelWorld.ganeshaInstances.forEach(g => {
                const halo = g.getObjectByName("Ganesha_Halo");
                if (halo) {
                    halo.rotation.z += 0.8 * delta;
                }
            });
            for (let i = 0; i < this.cachedDiyaFlames.length; i++) {
                const f = this.cachedDiyaFlames[i];
                f.scale.y = 1 + Math.sin(elapsedTime * 12 + f.id) * 0.15;
            }

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
