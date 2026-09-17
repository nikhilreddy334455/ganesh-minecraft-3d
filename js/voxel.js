// Voxel Engine, Grid Snapping, Block Types, and Pandal Generation
class VoxelWorld {
    constructor(scene) {
        this.scene = scene;
        this.blocks = new Map(); // key: "x,y,z" -> { mesh, type, light? }
        this.blockMeshes = [];
        this.waterMeshes = [];
        this.ganeshaInstances = [];
        this.blockBoxGeo = new THREE.BoxGeometry(1, 1, 1);

        // Preload procedural textures for Minecraft authenticity
        this.textures = this.createBlockTextures();
        this.materials = this.createBlockMaterials();

        // Wireframe preview helper for block snapping
        this.cursorBox = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.blockBoxGeo),
            new THREE.LineBasicMaterial({ color: 0xFFD700, linewidth: 2 })
        );
        this.cursorBox.visible = false;
        this.scene.add(this.cursorBox);

        // Particle system for broken blocks
        this.particles = [];
    }

    createBlockTextures() {
        const createTexture = (drawFn) => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            drawFn(ctx);
            const tex = new THREE.CanvasTexture(canvas);
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            return tex;
        };

        // Red Tent Fabric
        const redFabricTex = createTexture(ctx => {
            ctx.fillStyle = '#C1121F';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#780000';
            for (let i = 0; i < 64; i += 8) {
                ctx.fillRect(i, 0, 2, 64);
                ctx.fillRect(0, i, 64, 2);
            }
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(0, 0, 64, 4);
            ctx.fillRect(0, 60, 64, 4);
        });

        // Golden Fabric
        const goldFabricTex = createTexture(ctx => {
            ctx.fillStyle = '#FFB703';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#FB8500';
            for (let i = 0; i < 64; i += 8) {
                ctx.fillRect(i, 0, 2, 64);
                ctx.fillRect(0, i, 64, 2);
            }
            ctx.fillStyle = '#FFF3B0';
            ctx.fillRect(16, 16, 32, 32);
        });

        // Carved Pillar
        const pillarTex = createTexture(ctx => {
            ctx.fillStyle = '#F8F9FA';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#D4AF37';
            ctx.fillRect(0, 0, 64, 10);
            ctx.fillRect(0, 54, 64, 10);
            ctx.fillRect(20, 10, 24, 44);
        });

        // Marigold Flower Garland
        const marigoldTex = createTexture(ctx => {
            ctx.fillStyle = '#2D6A4F';
            ctx.fillRect(0, 0, 64, 64);
            // Orange and yellow marigold blooms
            const colors = ['#FF7B00', '#FFB703', '#E85D04', '#FAA307'];
            for (let y = 8; y < 64; y += 16) {
                for (let x = 8; x < 64; x += 16) {
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.beginPath();
                    ctx.arc(x, y, 7, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // Polished Marble
        const marbleTex = createTexture(ctx => {
            ctx.fillStyle = '#F1FAEE';
            ctx.fillRect(0, 0, 64, 64);
            ctx.strokeStyle = '#A8DADC';
            ctx.lineWidth = 2;
            ctx.strokeRect(4, 4, 56, 56);
            ctx.strokeStyle = '#D4AF37';
            ctx.strokeRect(8, 8, 48, 48);
        });

        // Wood Planks
        const woodTex = createTexture(ctx => {
            ctx.fillStyle = '#9C6644';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#7F4F24';
            ctx.fillRect(0, 15, 64, 2);
            ctx.fillRect(0, 31, 64, 2);
            ctx.fillRect(0, 47, 64, 2);
            ctx.fillStyle = '#582F0E';
            ctx.fillRect(30, 0, 2, 16);
            ctx.fillRect(15, 16, 2, 16);
            ctx.fillRect(45, 32, 2, 16);
        });

        // Green Grass Block
        const grassTopTex = createTexture(ctx => {
            ctx.fillStyle = '#4D9078';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#3E7B65';
            for (let i = 0; i < 40; i++) {
                ctx.fillRect(Math.random() * 60, Math.random() * 60, 3, 3);
            }
        });

        // Crystal Blue Water Texture
        const waterTex = createTexture(ctx => {
            ctx.fillStyle = '#0077B6';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#00B4D8';
            for (let y = 0; y < 64; y += 8) {
                ctx.fillRect(0, y, 64, 2);
            }
            ctx.fillStyle = '#90E0EF';
            for (let i = 0; i < 20; i++) {
                ctx.fillRect(Math.random() * 56, Math.random() * 56, 6, 2);
            }
        });

        // Warm Sand Texture
        const sandTex = createTexture(ctx => {
            ctx.fillStyle = '#E9C46A';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#F4A261';
            for (let i = 0; i < 50; i++) {
                ctx.fillRect(Math.random() * 62, Math.random() * 62, 2, 2);
            }
        });

        // Stone Block Texture
        const stoneTex = createTexture(ctx => {
            ctx.fillStyle = '#6C757D';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#495057';
            for (let i = 0; i < 35; i++) {
                ctx.fillRect(Math.random() * 60, Math.random() * 60, 4, 3);
            }
        });

        // Cobblestone Paver Texture
        const cobbleTex = createTexture(ctx => {
            ctx.fillStyle = '#5C677D';
            ctx.fillRect(0, 0, 64, 64);
            ctx.strokeStyle = '#33415C';
            ctx.lineWidth = 2;
            for (let y = 0; y < 64; y += 16) {
                for (let x = 0; x < 64; x += 16) {
                    ctx.strokeRect(x + 1, y + 1, 14, 14);
                }
            }
        });

        // Tree Wood Trunk Log
        const woodLogTex = createTexture(ctx => {
            ctx.fillStyle = '#5C4033';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#3E2723';
            for (let y = 0; y < 64; y += 8) {
                ctx.fillRect(0, y, 64, 3);
            }
        });

        // Lush Leaves Foliage
        const leavesTex = createTexture(ctx => {
            ctx.fillStyle = '#2D6A4F';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#40916C';
            for (let i = 0; i < 45; i++) {
                ctx.fillRect(Math.random() * 60, Math.random() * 60, 4, 4);
            }
            ctx.fillStyle = '#52B788';
            for (let i = 0; i < 20; i++) {
                ctx.fillRect(Math.random() * 60, Math.random() * 60, 2, 2);
            }
        });

        // Terracotta Brick
        const brickTex = createTexture(ctx => {
            ctx.fillStyle = '#9E2A2B';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#E56B6F';
            ctx.lineWidth = 2;
            for (let y = 0; y < 64; y += 16) {
                ctx.fillRect(0, y, 64, 2);
                const offset = (y % 32 === 0) ? 0 : 16;
                for (let x = offset; x < 64; x += 32) {
                    ctx.fillRect(x, y, 2, 16);
                }
            }
        });

        // Glowing Lantern
        const lanternTex = createTexture(ctx => {
            ctx.fillStyle = '#33272A';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#FFB703';
            ctx.fillRect(10, 10, 44, 44);
            ctx.fillStyle = '#FFE494';
            ctx.fillRect(18, 18, 28, 28);
            ctx.fillStyle = '#D4AF37';
            ctx.strokeRect(4, 4, 56, 56);
        });

        // Glass Frame
        const glassTex = createTexture(ctx => {
            ctx.fillStyle = 'rgba(230, 245, 255, 0.4)';
            ctx.fillRect(0, 0, 64, 64);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, 60, 60);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.moveTo(10, 50);
            ctx.lineTo(50, 10);
            ctx.stroke();
        });

        return {
            redFabric: redFabricTex,
            goldFabric: goldFabricTex,
            pillar: pillarTex,
            marigold: marigoldTex,
            marble: marbleTex,
            wood: woodTex,
            grass: grassTopTex,
            water: waterTex,
            sand: sandTex,
            stone: stoneTex,
            cobblestone: cobbleTex,
            woodLog: woodLogTex,
            leaves: leavesTex,
            brick: brickTex,
            lantern: lanternTex,
            glass: glassTex
        };
    }

    createBlockMaterials() {
        return {
            tent_red: new THREE.MeshStandardMaterial({ map: this.textures.redFabric, roughness: 0.8 }),
            tent_gold: new THREE.MeshStandardMaterial({ map: this.textures.goldFabric, roughness: 0.5, metalness: 0.3 }),
            pillar: new THREE.MeshStandardMaterial({ map: this.textures.pillar, roughness: 0.4 }),
            marigold: new THREE.MeshStandardMaterial({ map: this.textures.marigold, roughness: 0.7 }),
            marble: new THREE.MeshStandardMaterial({ map: this.textures.marble, roughness: 0.3 }),
            wood: new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.9 }),
            grass: new THREE.MeshStandardMaterial({ map: this.textures.grass, roughness: 0.9 }),
            dirt: new THREE.MeshStandardMaterial({ color: 0x582F0E, roughness: 0.9 }),
            diya: new THREE.MeshStandardMaterial({ color: 0xFF9F1C, emissive: 0xFF5400, emissiveIntensity: 0.8 }),
            water: new THREE.MeshStandardMaterial({ map: this.textures.water, color: 0x0099FF, transparent: true, opacity: 0.72, roughness: 0.1, metalness: 0.1 }),
            sand: new THREE.MeshStandardMaterial({ map: this.textures.sand, roughness: 0.9 }),
            stone: new THREE.MeshStandardMaterial({ map: this.textures.stone, roughness: 0.8 }),
            cobblestone: new THREE.MeshStandardMaterial({ map: this.textures.cobblestone, roughness: 0.7 }),
            wood_log: new THREE.MeshStandardMaterial({ map: this.textures.woodLog, roughness: 0.85 }),
            leaves: new THREE.MeshStandardMaterial({ map: this.textures.leaves, roughness: 0.6, transparent: true, opacity: 0.92 }),
            brick: new THREE.MeshStandardMaterial({ map: this.textures.brick, roughness: 0.75 }),
            lantern: new THREE.MeshStandardMaterial({ map: this.textures.lantern, emissive: 0xFFB703, emissiveIntensity: 0.85, roughness: 0.3 }),
            glass: new THREE.MeshStandardMaterial({ map: this.textures.glass, transparent: true, opacity: 0.45, roughness: 0.1 })
        };
    }

    getKey(x, y, z) {
        return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
    }

    isSolidAt(x, y, z) {
        const key = this.getKey(x, y, z);
        const b = this.blocks.get(key);
        if (!b) return false;
        if (b.type === 'water') return false; // Water allows wading and swimming
        return true;
    }

    isWaterAt(x, y, z) {
        const key = this.getKey(x, y, z);
        const b = this.blocks.get(key);
        return Boolean(b && b.type === 'water');
    }

    placeBlock(x, y, z, type = 'tent_red', playSound = false) {
        const key = this.getKey(x, y, z);
        if (this.blocks.has(key)) return null;

        const rx = Math.round(x);
        const ry = Math.round(y);
        const rz = Math.round(z);

        if (type === 'ganesha') {
            return this.placeGanesha(rx, ry, rz, playSound);
        }

        const mat = this.materials[type] || this.materials.tent_red;
        const mesh = new THREE.Mesh(this.blockBoxGeo, mat);
        mesh.position.set(rx, ry, rz);
        // Optimize terrain performance: ground blocks don't need shadow casting
        if (type === 'grass' || type === 'dirt' || type === 'sand' || type === 'stone' || type === 'cobblestone' || type === 'water') {
            mesh.castShadow = false;
            mesh.receiveShadow = (type !== 'water');
        } else {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }
        mesh.userData = { blockType: type, coords: { x: rx, y: ry, z: rz } };

        this.scene.add(mesh);
        mesh.updateMatrixWorld(true);

        let pointLight = null;
        if (type === 'diya' || type === 'lantern') {
            pointLight = new THREE.PointLight(type === 'lantern' ? 0xFFB703 : 0xFFA500, 1.3, 6);
            pointLight.position.set(rx, ry + 0.6, rz);
            this.scene.add(pointLight);
        }

        if (type === 'water') {
            this.waterMeshes.push(mesh);
        }

        const blockData = { mesh, type, light: pointLight, x: rx, y: ry, z: rz };
        this.blocks.set(key, blockData);
        this.blockMeshes.push(mesh);

        if (playSound && window.soundEngine) {
            window.soundEngine.playPlaceBlock();
        }

        return blockData;
    }

    placeGanesha(x, y, z, playSound = false) {
        const key = this.getKey(x, y, z);
        if (this.blocks.has(key)) {
            this.breakBlock(x, y, z);
        }
        const ganesha = GaneshaModel.createIdol();
        ganesha.position.set(x, y - 0.5, z);
        ganesha.userData = { isGanesha: true, coords: { x, y, z }, blockType: 'ganesha' };
        this.scene.add(ganesha);
        ganesha.updateMatrixWorld(true);

        this.ganeshaInstances.push(ganesha);
        this.blocks.set(key, { mesh: ganesha, type: 'ganesha', x, y, z });
        this.blockMeshes.push(ganesha);

        if (playSound && window.soundEngine) {
            window.soundEngine.playSparkle();
            window.soundEngine.playTempleBell(2100, 1.5);
        }

        return ganesha;
    }

    // Safely remove idol from altar without explosion particles when lifting
    removeIdolQuietly(x, y, z) {
        const key = this.getKey(x, y, z);
        const block = this.blocks.get(key);
        if (!block) return null;

        if (block.light) {
            this.scene.remove(block.light);
        }

        this.scene.remove(block.mesh);
        this.blocks.delete(key);

        const mIdx = this.blockMeshes.indexOf(block.mesh);
        if (mIdx !== -1) {
            this.blockMeshes.splice(mIdx, 1);
        }

        if (block.type === 'ganesha') {
            const idx = this.ganeshaInstances.indexOf(block.mesh);
            if (idx !== -1) this.ganeshaInstances.splice(idx, 1);
        }

        return block;
    }

    breakBlock(x, y, z) {
        const key = this.getKey(x, y, z);
        const block = this.blocks.get(key);
        if (!block) return false;

        // Create burst particles
        this.createBreakParticles(block.x, block.y, block.z, block.type);

        if (block.light) {
            this.scene.remove(block.light);
        }

        this.scene.remove(block.mesh);
        this.blocks.delete(key);

        const mIdx = this.blockMeshes.indexOf(block.mesh);
        if (mIdx !== -1) {
            this.blockMeshes.splice(mIdx, 1);
        }

        if (block.type === 'water') {
            const wIdx = this.waterMeshes.indexOf(block.mesh);
            if (wIdx !== -1) {
                this.waterMeshes.splice(wIdx, 1);
            }
        }

        if (window.soundEngine) {
            window.soundEngine.playBreakBlock();
        }

        if (y === 0 && !this.blocks.has(this.getKey(x, -1, z))) {
            this.placeBlock(x, -1, z, 'dirt', false);
        }

        return true;
    }

    createBreakParticles(x, y, z, type) {
        const particleMat = this.materials[type] || this.materials.tent_red;
        const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);

        for (let i = 0; i < 8; i++) {
            const pMesh = new THREE.Mesh(pGeo, particleMat);
            pMesh.position.set(
                x + (Math.random() - 0.5) * 0.7,
                y + (Math.random() - 0.5) * 0.7,
                z + (Math.random() - 0.5) * 0.7
            );
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 3
            );
            this.scene.add(pMesh);
            this.particles.push({ mesh: pMesh, velocity: vel, life: 1.0 });
        }
    }

    updateParticles(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta * 2.0;
            p.velocity.y -= 9.8 * delta;
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.mesh.scale.multiplyScalar(0.96);

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }

    // Mathematical 1x1x1 grid snapping directly implementing nik3 logic!
    calculateSnapPosition(hit) {
        if (!hit || !hit.point) return new THREE.Vector3(0, 1, 0);
        let normal = (hit.face && hit.face.normal) ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
        if (hit.object && hit.object.matrixWorld) {
            normal.transformDirection(hit.object.matrixWorld);
        }
        return new THREE.Vector3(
            Math.round(hit.point.x + normal.x * 0.5),
            Math.round(hit.point.y + normal.y * 0.5),
            Math.round(hit.point.z + normal.z * 0.5)
        );
    }

    updateCursorBox(hit) {
        if (!hit || !hit.point) {
            this.cursorBox.visible = false;
            return;
        }
        try {
            const snap = this.calculateSnapPosition(hit);
            this.cursorBox.position.copy(snap);
            this.cursorBox.visible = true;
        } catch (e) {
            this.cursorBox.visible = false;
        }
    }

    // Auto-Build Traditional Grand Ganesh Pandal / Tent
    buildGrandPandal(cx = 0, cy = 1, cz = 0, playSound = false) {
        const radius = 4;
        const height = 6;

        // 1. Marble Plinth & Steps (9x9)
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                this.placeBlock(cx + x, cy, cz + z, 'marble', false);
            }
        }

        // Red Carpet Center leading to sanctum
        for (let z = -radius; z <= radius; z++) {
            this.placeBlock(cx, cy, cz + z, 'tent_red', false);
        }

        // 2. Grand Four Corner Pillars & Mid Pillars
        const pillarLocations = [
            [-radius, -radius], [radius, -radius],
            [-radius, radius], [radius, radius],
            [-radius, 0], [radius, 0]
        ];

        pillarLocations.forEach(([px, pz]) => {
            for (let h = 1; h <= height; h++) {
                this.placeBlock(cx + px, cy + h, cz + pz, 'pillar', false);
            }
        });

        // 3. Horizontal Support Beams & Flower Toran
        for (let x = -radius; x <= radius; x++) {
            this.placeBlock(cx + x, cy + height, cz - radius, 'marigold', false);
            this.placeBlock(cx + x, cy + height, cz + radius, 'marigold', false);
        }
        for (let z = -radius; z <= radius; z++) {
            this.placeBlock(cx - radius, cy + height, cz + z, 'marigold', false);
            this.placeBlock(cx + radius, cy + height, cz + z, 'marigold', false);
        }

        // 4. Sloped Royal Tent Canopy (Red and Gold alternating fabric)
        for (let layer = 1; layer <= 3; layer++) {
            const r = radius - layer;
            const h = cy + height + layer;
            const matType = layer % 2 === 1 ? 'tent_red' : 'tent_gold';

            for (let x = -r; x <= r; x++) {
                for (let z = -r; z <= r; z++) {
                    if (Math.abs(x) === r || Math.abs(z) === r) {
                        this.placeBlock(cx + x, h, cz + z, matType, false);
                    }
                }
            }
        }

        // Golden Pinnacle / Kalash on top
        this.placeBlock(cx, cy + height + 4, cz, 'tent_gold', false);
        this.placeBlock(cx, cy + height + 5, cz, 'diya', false);

        // 5. Traditional Diyas at Entrance and Sanctum
        this.placeBlock(cx - 2, cy + 1, cz + radius, 'diya', false);
        this.placeBlock(cx + 2, cy + 1, cz + radius, 'diya', false);
        this.placeBlock(cx - 1, cy + 1, cz - 2, 'diya', false);
        this.placeBlock(cx + 1, cy + 1, cz - 2, 'diya', false);

        // 6. Sacred Centerpiece: Place Lord Ganesha in the Sanctum!
        this.placeGanesha(cx, cy + 1, cz - 1, playSound);

        if (playSound && window.soundEngine) {
            window.soundEngine.playShankh(2.0);
        }
    }

    updateWater(elapsedTime) {
        if (!this.waterMeshes || !this.waterMeshes.length) return;
        const wave = 0.72 + Math.sin(elapsedTime * 2.5) * 0.08;
        if (this.materials.water) {
            this.materials.water.opacity = wave;
        }
    }

    plantTree(x, z) {
        const height = 4;
        for (let y = 1; y <= height; y++) {
            this.placeBlock(x, y, z, 'wood_log');
        }
        // Leaves canopy
        for (let lx = -2; lx <= 2; lx++) {
            for (let lz = -2; lz <= 2; lz++) {
                for (let ly = height - 1; ly <= height + 2; ly++) {
                    if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && ly >= height + 1) continue;
                    if (lx === 0 && lz === 0 && ly <= height) continue;
                    this.placeBlock(x + lx, ly, z + lz, 'leaves');
                }
            }
        }
        // Traditional hanging brass lantern under branch
        this.placeBlock(x + 1, height - 1, z, 'lantern');
    }

    clearWorld() {
        // Remove all block meshes and attached lights
        for (const [key, block] of this.blocks) {
            if (block.light) {
                this.scene.remove(block.light);
            }
            if (block.mesh) {
                this.scene.remove(block.mesh);
            }
        }
        this.blocks.clear();
        this.blockMeshes.length = 0;
        this.waterMeshes.length = 0;

        // Remove any remaining Ganesha instances
        this.ganeshaInstances.forEach(g => {
            this.scene.remove(g);
        });
        this.ganeshaInstances.length = 0;

        // Clear particles
        this.particles.forEach(p => {
            this.scene.remove(p.mesh);
        });
        this.particles.length = 0;
    }

    generateWorld(size) {
        const isMobile = typeof navigator !== 'undefined' && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 1024));
        if (!size) {
            size = isMobile ? 66 : 84;
        }
        const half = Math.floor(size / 2);

        // Extended Sacred Lake definition on East side
        const lakeMinX = 18;
        const lakeMaxX = Math.min(42, half - 2);
        const lakeMinZ = -20;
        const lakeMaxZ = 18;

        for (let x = -half; x <= half; x++) {
            for (let z = -half; z <= half; z++) {
                const distCenter = Math.sqrt(x * x + z * z);

                // Check if in Lake region
                const inLake = (x >= lakeMinX && x <= lakeMaxX && z >= lakeMinZ && z <= lakeMaxZ);
                const isLakeBank = (x >= lakeMinX - 2 && x <= lakeMaxX + 2 && z >= lakeMinZ - 2 && z <= lakeMaxZ + 2) && !inLake;

                // Central Cobblestone Paths (Long Ceremonial Avenues across extended land)
                const isNorthSouthPath = (Math.abs(x) <= 1 && ((z >= 5 && z <= half - 4) || (z <= -5 && z >= -(half - 4))));
                const isEastWestPath = (Math.abs(z) <= 1 && ((x >= 5 && x <= lakeMinX - 2) || (x <= -5 && x >= -(half - 4))));
                const isPavedPlaza = (Math.abs(x) <= 5 && Math.abs(z) <= 5);

                if (inLake) {
                    // Sacred Lake: Water at surface y=0, with bed underneath
                    this.placeBlock(x, 0, z, 'water');
                } else if (isLakeBank) {
                    // Sandy beach shore around lake
                    this.placeBlock(x, 0, z, 'sand');
                } else if (isNorthSouthPath || isEastWestPath) {
                    // Cobblestone ceremonial walkway
                    this.placeBlock(x, 0, z, 'cobblestone');
                } else if (isPavedPlaza) {
                    // Marble plinth surround
                    this.placeBlock(x, 0, z, 'marble');
                } else {
                    // Lush Meadow landscape across extended land (surface layer)
                    this.placeBlock(x, 0, z, 'grass');

                    // Perimeter sacred hills (only on the edges)
                    const hillStart = half - 16;
                    if (distCenter > hillStart) {
                        const hillHeight = Math.min(4, Math.floor((distCenter - hillStart) / 3) + 1);
                        for (let h = 1; h <= hillHeight; h++) {
                            const hillType = (h === hillHeight) ? 'grass' : 'stone';
                            this.placeBlock(x, h, z, hillType);
                        }
                    }
                }
            }
        }

        // Sacred Lake Ghats (Tiered temple steps leading into water on west shore)
        for (let z = -8; z <= 8; z++) {
            this.placeBlock(lakeMinX, 0, z, 'marble');
            this.placeBlock(lakeMinX - 1, 0, z, 'cobblestone');
            this.placeBlock(lakeMinX - 1, 1, z, (Math.abs(z) % 2 === 0) ? 'diya' : 'marigold');
        }

        // Plant sacred banyan/oak trees in extended meadows
        const treeLocations = [
            [-12, 14], [-18, 20], [-26, -12], [-14, -18],
            [-10, -28], [-28, 6], [-16, -6], [8, -26],
            [10, 24], [26, 26], [28, -26], [-8, 28],
            [-34, 18], [-38, -20], [-30, 32], [-22, -36],
            [6, 38], [-12, -42], [-42, 10], [-40, -12],
            [14, -38], [34, -10], [36, 12], [-4, -36]
        ];

        treeLocations.forEach(([tx, tz]) => {
            if (Math.abs(tx) <= half - 4 && Math.abs(tz) <= half - 4) {
                this.plantTree(tx, tz);
            }
        });

        // Decorative pathway street lamps along the extended walkways
        const lampLocations = [
            [2, 0, 10], [-2, 0, 10], [2, 0, 22], [-2, 0, 22],
            [2, 0, 36], [-2, 0, 36], [2, 0, 46], [-2, 0, 46],
            [2, 0, -10], [-2, 0, -10], [2, 0, -22], [-2, 0, -22],
            [2, 0, -36], [-2, 0, -36], [2, 0, -46], [-2, 0, -46],
            [12, 0, 2], [12, 0, -2], [-12, 0, 2], [-12, 0, -2],
            [-24, 0, 2], [-24, 0, -2], [-36, 0, 2], [-36, 0, -2],
            [-46, 0, 2], [-46, 0, -2]
        ];

        lampLocations.forEach(([lx, ly, lz]) => {
            this.placeBlock(lx, ly + 1, lz, 'pillar');
            this.placeBlock(lx, ly + 2, lz, 'lantern');
        });

        // Build Grand Ganesh Pandal with Lord Ganesha at the heart of the world on spawn
        this.buildGrandPandal(0, 0, 0, false);
    }

    generateTerrain(size) {
        this.generateWorld(size);
    }
}

window.VoxelWorld = VoxelWorld;
