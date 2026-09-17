// 3D Voxel Lord Ganesha Model Generator & Mushak Vahana
// Faithfully matches authentic Minecraft voxel sculpture styling:
// - 3-tiered carved stone brick pedestal
// - Crimson red terracotta dhoti with seated Lalitasana pose & pendant foot
// - Center emerald green silk sash with gold borders
// - Plump Lambodara belly, broad chest, golden Janeu thread & necklaces
// - Chaturbhuja (4 arms): Stone Battle Axe (Parashu), Abhaya Mudra blessing, Golden Mace/Lotus, Mound of Modaks
// - Magnificent stepped elephant ears, pixel eyes, red/yellow tilak
// - Complete right ivory tusk & broken left tusk (Ekadanta)
// - Sweeping curved trunk curling toward the modak hand
// - Majestic tiered golden Mukut (pagoda crown) with pointed pinnacle

class GaneshaModel {
    // Helper to generate crisp Minecraft-style block textures
    static getSharedTextures() {
        if (GaneshaModel._textures) return GaneshaModel._textures;

        const createTex = (drawFn) => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            drawFn(ctx);
            const tex = new THREE.CanvasTexture(canvas);
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            return tex;
        };

        // 1. Stone Brick Pedestal Texture (Carved Stone Slabs)
        const stoneBrickTex = createTex(ctx => {
            ctx.fillStyle = '#A39D94';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#7C766E';
            ctx.fillRect(0, 15, 32, 2);
            ctx.fillRect(0, 30, 32, 2);
            ctx.fillRect(15, 0, 2, 16);
            ctx.fillRect(7, 16, 2, 16);
            ctx.fillRect(23, 16, 2, 16);
            ctx.fillStyle = '#B8B2A8';
            ctx.fillRect(1, 1, 14, 1);
            ctx.fillRect(1, 17, 6, 1);
            ctx.fillRect(9, 17, 14, 1);
            ctx.fillStyle = '#676159';
            ctx.fillRect(0, 0, 32, 1);
        });

        // 2. Peachy Sandstone / Terracotta Divine Skin Texture
        const skinTex = createTex(ctx => {
            ctx.fillStyle = '#F3BA90';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#E8A77E';
            ctx.fillRect(0, 0, 32, 2);
            ctx.fillRect(0, 0, 2, 32);
            ctx.fillStyle = '#FAD4B9';
            ctx.fillRect(2, 2, 12, 12);
            ctx.fillStyle = '#D99166';
            ctx.fillRect(0, 30, 32, 2);
            ctx.fillRect(30, 0, 2, 32);
        });

        // 3. Shaded Peach Texture for Inner Ear & Fold Depths
        const skinShadowTex = createTex(ctx => {
            ctx.fillStyle = '#D88A62';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#BF744E';
            ctx.fillRect(0, 0, 32, 3);
            ctx.fillRect(0, 0, 3, 32);
            ctx.fillStyle = '#E59B73';
            ctx.fillRect(4, 4, 24, 24);
        });

        // 4. Crimson Red Terracotta Dhoti Texture
        const dhotiRedTex = createTex(ctx => {
            ctx.fillStyle = '#B42D21';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#8B1E14';
            ctx.fillRect(0, 15, 32, 2);
            ctx.fillRect(15, 0, 2, 32);
            ctx.fillStyle = '#C83B2F';
            ctx.fillRect(2, 2, 12, 12);
            ctx.fillRect(18, 18, 12, 12);
        });

        // 5. Emerald Green Silk Sash Texture (with gold accent weave)
        const sashGreenTex = createTex(ctx => {
            ctx.fillStyle = '#1E8449';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#145A32';
            ctx.fillRect(0, 0, 32, 3);
            ctx.fillRect(0, 29, 32, 3);
            ctx.fillStyle = '#27AE60';
            ctx.fillRect(4, 4, 24, 24);
            ctx.fillStyle = '#F1C40F';
            ctx.fillRect(0, 0, 4, 32);
            ctx.fillRect(28, 0, 4, 32);
        });

        // 6. Radiant Golden Mukut & Jewelry Texture
        const goldTex = createTex(ctx => {
            ctx.fillStyle = '#F4B41A';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#D49206';
            ctx.fillRect(0, 0, 32, 2);
            ctx.fillRect(0, 0, 2, 32);
            ctx.fillRect(0, 30, 32, 2);
            ctx.fillRect(30, 0, 2, 32);
            ctx.fillStyle = '#FDE38C';
            ctx.fillRect(4, 4, 8, 8);
            ctx.fillRect(20, 4, 8, 8);
            ctx.fillStyle = '#E09F0B';
            ctx.fillRect(4, 20, 24, 8);
        });

        // 7. Stone Battle Axe Blade Texture
        const stoneAxeTex = createTex(ctx => {
            ctx.fillStyle = '#85929E';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#5D6D7E';
            ctx.fillRect(0, 0, 32, 2);
            ctx.fillRect(0, 0, 2, 32);
            ctx.fillStyle = '#A6ACAF';
            ctx.fillRect(4, 4, 14, 14);
            ctx.fillStyle = '#34495E';
            ctx.fillRect(0, 30, 32, 2);
            ctx.fillRect(30, 0, 2, 32);
        });

        // 8. Ivory Tusk Texture
        const tuskTex = createTex(ctx => {
            ctx.fillStyle = '#FAF9F6';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#E5E4E2';
            ctx.fillRect(0, 28, 32, 4);
            ctx.fillRect(28, 0, 4, 32);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(2, 2, 16, 16);
        });

        // 9. Sweet Modak Mound Texture
        const modakTex = createTex(ctx => {
            ctx.fillStyle = '#78422A';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#5C301D';
            ctx.fillRect(0, 0, 32, 2);
            ctx.fillRect(15, 0, 2, 32);
            ctx.fillStyle = '#9C5B3E';
            ctx.fillRect(2, 2, 12, 12);
            ctx.fillRect(18, 18, 12, 12);
        });

        GaneshaModel._textures = {
            stoneBrick: stoneBrickTex,
            skin: skinTex,
            skinShadow: skinShadowTex,
            dhotiRed: dhotiRedTex,
            sashGreen: sashGreenTex,
            gold: goldTex,
            stoneAxe: stoneAxeTex,
            tusk: tuskTex,
            modak: modakTex
        };

        return GaneshaModel._textures;
    }

    static getSharedMaterials() {
        const tex = GaneshaModel.getSharedTextures();
        return {
            stonePedestal: new THREE.MeshStandardMaterial({ map: tex.stoneBrick, roughness: 0.7, metalness: 0.1 }),
            skin: new THREE.MeshStandardMaterial({ map: tex.skin, roughness: 0.55, metalness: 0.05 }),
            skinShadow: new THREE.MeshStandardMaterial({ map: tex.skinShadow, roughness: 0.6, metalness: 0.05 }),
            dhotiRed: new THREE.MeshStandardMaterial({ map: tex.dhotiRed, roughness: 0.6, metalness: 0.1 }),
            sashGreen: new THREE.MeshStandardMaterial({ map: tex.sashGreen, roughness: 0.5, metalness: 0.15 }),
            gold: new THREE.MeshStandardMaterial({ map: tex.gold, roughness: 0.35, metalness: 0.75 }),
            stoneAxe: new THREE.MeshStandardMaterial({ map: tex.stoneAxe, roughness: 0.8, metalness: 0.1 }),
            axeHandle: new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.7 }),
            tusk: new THREE.MeshStandardMaterial({ map: tex.tusk, roughness: 0.3, metalness: 0.05 }),
            modak: new THREE.MeshStandardMaterial({ map: tex.modak, roughness: 0.5, emissive: 0x1A0D08 }),
            darkHair: new THREE.MeshStandardMaterial({ color: 0x422B1E, roughness: 0.8 }),
            eyePupil: new THREE.MeshBasicMaterial({ color: 0x1B120C }),
            ruby: new THREE.MeshStandardMaterial({ color: 0xC0392B, roughness: 0.25, metalness: 0.4 }),
            emerald: new THREE.MeshStandardMaterial({ color: 0x1E8449, roughness: 0.25, metalness: 0.4 }),
            haloGlow: new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.55 })
        };
    }

    // -------------------------------------------------------------
    // 1. Authentic Temple Idol (Placed in Pandal / by Player)
    // -------------------------------------------------------------
    static createIdol() {
        const group = new THREE.Group();
        group.name = "Lord_Ganesha_Idol";

        const mats = GaneshaModel.getSharedMaterials();
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);

        function addVoxel(x, y, z, sx, sy, sz, mat) {
            const mesh = new THREE.Mesh(boxGeo, mat);
            mesh.scale.set(sx, sy, sz);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            return mesh;
        }

        // =========================================================
        // 1. THREE-TIERED STONE PEDESTAL (Plinth / Peetha)
        // =========================================================
        // Bottom Base Plinth (Widest tier)
        addVoxel(0, 0.12, 0, 3.2, 0.24, 3.2, mats.stonePedestal);
        // Middle Step Tier
        addVoxel(0, 0.36, 0, 2.8, 0.24, 2.8, mats.stonePedestal);
        // Top Surface Tier
        addVoxel(0, 0.60, 0, 2.4, 0.24, 2.4, mats.stonePedestal);

        // =========================================================
        // 2. SEATED LEGS & CRIMSON DHOTI (Lalitasana Meditative Pose)
        // =========================================================
        // Ganesha's Right Leg (Viewer's Left): folded horizontally
        addVoxel(-0.72, 0.92, 0.12, 0.96, 0.44, 1.15, mats.dhotiRed);
        addVoxel(-0.85, 0.88, 0.48, 0.74, 0.40, 0.78, mats.dhotiRed); // Rounded knee
        addVoxel(-0.44, 0.88, 0.56, 0.64, 0.38, 0.68, mats.dhotiRed); // Folded calf

        // Ganesha's Left Leg (Viewer's Right): folded with lower foot stepping DOWN
        addVoxel(0.72, 0.92, 0.12, 0.96, 0.44, 1.15, mats.dhotiRed);
        addVoxel(0.85, 0.88, 0.48, 0.74, 0.40, 0.78, mats.dhotiRed); // Knee
        addVoxel(0.46, 0.78, 0.68, 0.46, 0.52, 0.48, mats.dhotiRed); // Puffed dhoti drape
        addVoxel(0.55, 0.66, 0.72, 0.36, 0.38, 0.38, mats.dhotiRed);

        // Pendant Foot: stepping down onto Tier 2 pedestal step!
        addVoxel(0.28, 0.62, 0.82, 0.26, 0.22, 0.40, mats.skin);
        addVoxel(0.28, 0.75, 0.78, 0.22, 0.18, 0.24, mats.skin);
        addVoxel(0.28, 0.76, 0.78, 0.25, 0.08, 0.27, mats.gold); // Golden Kada / Anklet
        // Toes resting on the stone step
        addVoxel(0.28, 0.50, 0.96, 0.26, 0.14, 0.22, mats.skin);

        // Center Emerald Green Sash (Patka) with Golden Borders
        addVoxel(-0.02, 0.94, 0.58, 0.38, 0.46, 0.38, mats.sashGreen);
        addVoxel(-0.02, 0.70, 0.72, 0.32, 0.34, 0.34, mats.sashGreen);
        addVoxel(-0.22, 0.90, 0.60, 0.08, 0.44, 0.36, mats.gold); // Gold border left
        addVoxel(0.18, 0.90, 0.60, 0.08, 0.44, 0.36, mats.gold);  // Gold border right

        // Golden Waistband (Kamarband)
        addVoxel(0, 1.22, 0.12, 1.62, 0.14, 1.25, mats.gold);
        addVoxel(0, 1.22, 0.76, 0.20, 0.18, 0.12, mats.ruby); // Central jewel brooch

        // =========================================================
        // 3. PLUMP LAMBODARA BELLY & CHEST
        // =========================================================
        // Lower Belly (pot-belly resting gracefully over dhoti)
        addVoxel(0, 1.46, 0.15, 1.48, 0.46, 1.22, mats.skin);
        addVoxel(0, 1.42, 0.54, 1.18, 0.42, 0.56, mats.skin);
        addVoxel(0, 1.42, 0.82, 0.08, 0.08, 0.04, mats.skinShadow); // Nabhi / Navel

        // Upper Chest & Broad Divine Shoulders
        addVoxel(0, 1.84, 0.12, 1.58, 0.52, 1.16, mats.skin);
        addVoxel(0, 1.90, 0.50, 1.28, 0.46, 0.46, mats.skin); // Chest contour

        // Sacred Golden Yagnopavita (Janeu Thread): left shoulder to right waist
        const j1 = addVoxel(0.32, 2.15, 0.46, 0.10, 0.38, 0.10, mats.gold);
        j1.rotation.z = -0.45;
        const j2 = addVoxel(0.14, 1.88, 0.58, 0.10, 0.42, 0.10, mats.gold);
        j2.rotation.z = -0.55;
        const j3 = addVoxel(-0.08, 1.62, 0.68, 0.10, 0.42, 0.10, mats.gold);
        j3.rotation.z = -0.62;
        const j4 = addVoxel(-0.32, 1.36, 0.64, 0.10, 0.38, 0.10, mats.gold);
        j4.rotation.z = -0.55;

        // Royal Golden Necklaces
        addVoxel(0, 2.08, 0.58, 0.88, 0.12, 0.18, mats.gold);
        addVoxel(0, 1.98, 0.64, 0.22, 0.18, 0.14, mats.ruby); // Ruby central gem

        // =========================================================
        // 4. FOUR DIVINE ARMS (Chaturbhuja)
        // =========================================================
        // A. Upper Right Arm (Viewer's Left): Holding Stone Battle Axe (Parashu)
        addVoxel(-0.95, 2.05, 0.05, 0.46, 0.46, 0.54, mats.skin); // Shoulder
        addVoxel(-1.18, 2.15, 0.10, 0.38, 0.44, 0.38, mats.skin);
        addVoxel(-1.18, 2.25, 0.10, 0.42, 0.12, 0.42, mats.gold); // Armband
        addVoxel(-1.22, 2.62, 0.15, 0.34, 0.56, 0.34, mats.skin); // Forearm
        addVoxel(-1.22, 2.82, 0.15, 0.38, 0.12, 0.38, mats.gold); // Wristlet
        addVoxel(-1.22, 2.95, 0.18, 0.32, 0.24, 0.32, mats.skin); // Hand

        // Stone Battle Axe (Parashu):
        addVoxel(-1.22, 3.15, 0.18, 0.12, 1.10, 0.12, mats.axeHandle); // Handle
        addVoxel(-1.38, 3.44, 0.18, 0.34, 0.54, 0.14, mats.stoneAxe);  // Main blade
        addVoxel(-1.62, 3.50, 0.18, 0.26, 0.42, 0.10, mats.stoneAxe);  // Cutting edge flange
        addVoxel(-1.06, 3.44, 0.18, 0.18, 0.28, 0.10, mats.stoneAxe);  // Rear counter-spur

        // B. Lower Right Arm (Viewer's Left): Abhaya Mudra (Blessing Palm)
        addVoxel(-0.90, 1.72, 0.25, 0.38, 0.38, 0.46, mats.skin);
        addVoxel(-0.95, 1.68, 0.56, 0.32, 0.32, 0.48, mats.skin); // Forearm forward
        addVoxel(-0.95, 1.72, 0.74, 0.36, 0.10, 0.36, mats.gold); // Wristlet
        addVoxel(-0.95, 1.90, 0.84, 0.34, 0.38, 0.12, mats.skin); // Blessing palm
        addVoxel(-0.95, 2.10, 0.84, 0.30, 0.16, 0.10, mats.skin); // Fingers raised
        addVoxel(-0.95, 1.90, 0.91, 0.10, 0.10, 0.04, mats.ruby); // Palm Red Tilak

        // C. Upper Left Arm (Viewer's Right): Holding Golden Mace / Lotus (Gada)
        addVoxel(0.95, 2.05, 0.05, 0.46, 0.46, 0.54, mats.skin); // Shoulder
        addVoxel(1.18, 2.15, 0.10, 0.38, 0.44, 0.38, mats.skin);
        addVoxel(1.18, 2.25, 0.10, 0.42, 0.12, 0.42, mats.gold); // Armband
        addVoxel(1.22, 2.62, 0.15, 0.34, 0.56, 0.34, mats.skin); // Forearm
        addVoxel(1.22, 2.82, 0.15, 0.38, 0.12, 0.38, mats.gold); // Wristlet
        addVoxel(1.22, 2.95, 0.18, 0.32, 0.24, 0.32, mats.skin); // Hand

        // Golden Mace / Lotus (viewer's right in photo):
        addVoxel(1.22, 3.08, 0.18, 0.12, 0.68, 0.12, mats.gold); // Golden shaft
        addVoxel(1.22, 3.34, 0.18, 0.38, 0.26, 0.38, mats.gold); // Base tier
        addVoxel(1.22, 3.54, 0.18, 0.28, 0.22, 0.28, mats.gold); // Mid tier
        addVoxel(1.22, 3.70, 0.18, 0.14, 0.16, 0.14, mats.gold); // Pointed pinnacle

        // D. Lower Left Arm (Viewer's Right): Holding Heap of Sweet Modaks
        addVoxel(0.90, 1.72, 0.25, 0.38, 0.38, 0.46, mats.skin);
        addVoxel(0.92, 1.55, 0.58, 0.34, 0.32, 0.56, mats.skin);
        addVoxel(0.92, 1.55, 0.78, 0.36, 0.10, 0.36, mats.gold); // Wristlet
        addVoxel(0.92, 1.52, 1.00, 0.46, 0.12, 0.46, mats.skin); // Open palm facing up
        addVoxel(0.92, 1.58, 1.20, 0.42, 0.14, 0.12, mats.skin); // Cupping fingers front
        addVoxel(1.14, 1.58, 1.00, 0.12, 0.14, 0.40, mats.skin); // Cupping thumb/fingers

        // Heap of Delicious Sweet Modaks (Rich brown terracotta voxel mound)
        addVoxel(0.92, 1.66, 1.00, 0.38, 0.18, 0.38, mats.modak);
        addVoxel(0.92, 1.78, 1.00, 0.26, 0.14, 0.26, mats.modak);
        addVoxel(0.92, 1.86, 1.00, 0.14, 0.10, 0.14, mats.modak); // Top modak tip

        // =========================================================
        // 5. ELEPHANT HEAD, STEPPED EARS, TUSKS & CURVED TRUNK
        // =========================================================
        // Head Skull Core
        addVoxel(0, 2.54, 0.18, 1.36, 0.92, 1.06, mats.skin);
        addVoxel(0, 2.68, 0.56, 1.16, 0.66, 0.46, mats.skin);

        // Dark Hair / Temple Band at Base of Crown
        addVoxel(0, 3.00, 0.20, 1.38, 0.14, 1.08, mats.darkHair);
        addVoxel(-0.72, 2.86, 0.20, 0.18, 0.36, 0.66, mats.darkHair);
        addVoxel(0.72, 2.86, 0.20, 0.18, 0.36, 0.66, mats.darkHair);

        // STEPPED FAN ELEPHANT EARS (Shurpa Karna):
        // Viewer's Left Ear (Ganesha's Right Ear):
        addVoxel(-0.86, 2.58, 0.12, 0.36, 0.86, 0.18, mats.skin);
        addVoxel(-1.16, 2.66, 0.12, 0.38, 0.96, 0.16, mats.skin);
        addVoxel(-1.44, 2.76, 0.12, 0.32, 0.84, 0.14, mats.skin);
        addVoxel(-1.64, 2.86, 0.12, 0.22, 0.64, 0.12, mats.skin); // Outermost tip
        addVoxel(-1.26, 3.16, 0.12, 0.46, 0.24, 0.14, mats.skin); // Stepped crest
        addVoxel(-1.14, 2.66, 0.18, 0.32, 0.68, 0.08, mats.skinShadow); // Inner depth

        // Viewer's Right Ear (Ganesha's Left Ear):
        addVoxel(0.86, 2.58, 0.12, 0.36, 0.86, 0.18, mats.skin);
        addVoxel(1.16, 2.66, 0.12, 0.38, 0.96, 0.16, mats.skin);
        addVoxel(1.44, 2.76, 0.12, 0.32, 0.84, 0.14, mats.skin);
        addVoxel(1.64, 2.86, 0.12, 0.22, 0.64, 0.12, mats.skin);  // Outermost tip
        addVoxel(1.26, 3.16, 0.12, 0.46, 0.24, 0.14, mats.skin);  // Stepped crest
        addVoxel(1.14, 2.66, 0.18, 0.32, 0.68, 0.08, mats.skinShadow); // Inner depth

        // Minecraft Pixel Eyes
        // Right eye (viewer's left):
        addVoxel(-0.35, 2.72, 0.77, 0.12, 0.14, 0.08, mats.eyePupil);
        addVoxel(-0.44, 2.72, 0.77, 0.08, 0.14, 0.08, mats.tusk); // Sclera
        // Left eye (viewer's right):
        addVoxel(0.35, 2.72, 0.77, 0.12, 0.14, 0.08, mats.eyePupil);
        addVoxel(0.44, 2.72, 0.77, 0.08, 0.14, 0.08, mats.tusk);

        // Sacred Vermillion Tilak on Forehead
        addVoxel(0, 2.94, 0.78, 0.14, 0.26, 0.06, mats.ruby);
        addVoxel(0, 2.80, 0.78, 0.08, 0.10, 0.06, mats.gold);

        // Ivory Tusks (Danta):
        // Right tusk: full sharp tusk
        addVoxel(-0.28, 2.22, 0.68, 0.14, 0.18, 0.20, mats.tusk);
        addVoxel(-0.28, 2.12, 0.82, 0.12, 0.16, 0.18, mats.tusk);
        // Left tusk: broken half-tusk (Ekadanta!)
        addVoxel(0.28, 2.22, 0.68, 0.14, 0.18, 0.14, mats.tusk);

        // Sweeping Curved Trunk (Vakratunda):
        // Sweeps down and curls leftwards (viewer's right) towards the modak!
        addVoxel(0, 2.62, 0.74, 0.44, 0.42, 0.38, mats.skin);
        addVoxel(0, 2.32, 0.80, 0.40, 0.42, 0.38, mats.skin);
        addVoxel(0.04, 2.02, 0.86, 0.38, 0.40, 0.38, mats.skin);
        addVoxel(0.18, 1.78, 0.88, 0.36, 0.36, 0.36, mats.skin);
        addVoxel(0.38, 1.68, 0.88, 0.32, 0.30, 0.34, mats.skin);
        addVoxel(0.48, 1.78, 0.84, 0.24, 0.24, 0.26, mats.skin); // Curling up to modak
        addVoxel(0.38, 1.68, 0.88, 0.36, 0.08, 0.36, mats.gold); // Golden trunk ring

        // =========================================================
        // 6. TIERED PAGODA GOLDEN MUKUT (CROWN)
        // =========================================================
        // Base Circlet wrapping around head
        addVoxel(0, 3.14, 0.20, 1.48, 0.28, 1.16, mats.gold);
        addVoxel(0, 3.24, 0.20, 1.58, 0.12, 1.26, mats.gold); // Ornamental gold brim

        // Tier 1 (Lower pagoda tier with ruby gem)
        addVoxel(0, 3.44, 0.20, 1.26, 0.32, 1.02, mats.gold);
        addVoxel(0, 3.44, 0.72, 0.22, 0.22, 0.12, mats.ruby);

        // Tier 2 (Middle tier with emerald gem)
        addVoxel(0, 3.74, 0.20, 0.98, 0.32, 0.84, mats.gold);
        addVoxel(0, 3.74, 0.63, 0.18, 0.18, 0.12, mats.emerald);

        // Tier 3 (Upper tapering tier with ruby gem)
        addVoxel(0, 4.04, 0.20, 0.72, 0.32, 0.64, mats.gold);
        addVoxel(0, 4.04, 0.53, 0.14, 0.14, 0.10, mats.ruby);

        // Tier 4 (Spire base)
        addVoxel(0, 4.30, 0.20, 0.48, 0.26, 0.46, mats.gold);

        // Crown Pinnacle (Kalash / Shikhara pointed pyramid)
        addVoxel(0, 4.50, 0.20, 0.28, 0.22, 0.28, mats.gold);
        addVoxel(0, 4.64, 0.20, 0.14, 0.14, 0.14, mats.gold); // Sharp golden tip

        // =========================================================
        // 7. DIVINE RADIANT HALO & WARM TEMPLE AURA
        // =========================================================
        const haloGeo = new THREE.TorusGeometry(1.25, 0.08, 12, 36);
        const haloMesh = new THREE.Mesh(haloGeo, mats.gold);
        haloMesh.position.set(0, 2.7, -0.42);
        haloMesh.name = "Ganesha_Halo";
        group.add(haloMesh);

        const glowDiscGeo = new THREE.CircleGeometry(1.30, 32);
        const glowDisc = new THREE.Mesh(glowDiscGeo, mats.haloGlow);
        glowDisc.position.set(0, 2.7, -0.43);
        group.add(glowDisc);

        // Humble Mouse Vahana (Mushak) sitting beside Lord Ganesha on the pedestal
        const mouseGroup = new THREE.Group();
        mouseGroup.position.set(0.95, 0.72, 0.85);
        const mouseMat = new THREE.MeshStandardMaterial({ color: 0x8D99AE, roughness: 0.6 });
        const mousePink = new THREE.MeshStandardMaterial({ color: 0xFFB7B2, roughness: 0.5 });
        
        const mBody = new THREE.Mesh(boxGeo, mouseMat);
        mBody.scale.set(0.35, 0.25, 0.45);
        mBody.position.set(0, 0.12, 0);
        mouseGroup.add(mBody);

        const mHead = new THREE.Mesh(boxGeo, mouseMat);
        mHead.scale.set(0.22, 0.20, 0.25);
        mHead.position.set(0, 0.20, -0.25);
        mouseGroup.add(mHead);

        const mEarL = new THREE.Mesh(boxGeo, mousePink);
        mEarL.scale.set(0.08, 0.12, 0.08);
        mEarL.position.set(-0.10, 0.32, -0.22);
        mouseGroup.add(mEarL);

        const mEarR = new THREE.Mesh(boxGeo, mousePink);
        mEarR.scale.set(0.08, 0.12, 0.08);
        mEarR.position.set(0.10, 0.32, -0.22);
        mouseGroup.add(mEarR);

        const mTail = new THREE.Mesh(boxGeo, mousePink);
        mTail.scale.set(0.06, 0.06, 0.35);
        mTail.position.set(0, 0.15, 0.35);
        mTail.rotation.x = -0.3;
        mouseGroup.add(mTail);

        const mModak = new THREE.Mesh(boxGeo, mats.modak);
        mModak.scale.set(0.12, 0.15, 0.12);
        mModak.position.set(0, 0.15, -0.40);
        mouseGroup.add(mModak);

        group.add(mouseGroup);

        // Sacred Brass Diyas on Pedestal Corners
        [-1.2, 1.2].forEach(sideX => {
            addVoxel(sideX, 0.78, 1.2, 0.25, 0.14, 0.25, mats.gold);
            const flame = addVoxel(sideX, 0.90, 1.2, 0.10, 0.16, 0.10, new THREE.MeshBasicMaterial({ color: 0xFF5722 }));
            flame.name = "Diya_Flame";

            const diyaLight = new THREE.PointLight(0xFFA500, 1.2, 5);
            diyaLight.position.set(sideX, 0.98, 1.2);
            group.add(diyaLight);
        });

        // Soft warm natural temple illumination
        const auraLight = new THREE.PointLight(0xFFF2DE, 1.3, 10);
        auraLight.position.set(0, 3.2, 1.8);
        group.add(auraLight);

        return group;
    }

    // -------------------------------------------------------------
    // 2. Majestic Standing Companion Lord Ganesha
    // -------------------------------------------------------------
    static createStandingGanesha() {
        const root = new THREE.Group();
        root.name = "Standing_Lord_Ganesha";

        const mats = GaneshaModel.getSharedMaterials();
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);

        function makeVoxel(sx, sy, sz, mat, px = 0, py = 0, pz = 0) {
            const mesh = new THREE.Mesh(boxGeo, mat);
            mesh.scale.set(sx, sy, sz);
            mesh.position.set(px, py, pz);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }

        // 1. Articulated Standing Legs in Crimson Dhoti (Hips at Y = 0.9)
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.35, 0.9, 0);
        leftLegPivot.add(makeVoxel(0.42, 0.50, 0.45, mats.dhotiRed, 0, -0.25, 0));
        leftLegPivot.add(makeVoxel(0.38, 0.45, 0.40, mats.dhotiRed, 0, -0.65, 0));
        leftLegPivot.add(makeVoxel(0.44, 0.10, 0.46, mats.gold, 0, -0.85, 0)); // Golden border
        leftLegPivot.add(makeVoxel(0.36, 0.08, 0.38, mats.gold, 0, -0.92, 0)); // Kada
        leftLegPivot.add(makeVoxel(0.34, 0.15, 0.45, mats.skin, 0, -0.96, 0.08)); // Foot
        root.add(leftLegPivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.35, 0.9, 0);
        rightLegPivot.add(makeVoxel(0.42, 0.50, 0.45, mats.dhotiRed, 0, -0.25, 0));
        rightLegPivot.add(makeVoxel(0.38, 0.45, 0.40, mats.dhotiRed, 0, -0.65, 0));
        rightLegPivot.add(makeVoxel(0.44, 0.10, 0.46, mats.gold, 0, -0.85, 0));
        rightLegPivot.add(makeVoxel(0.36, 0.08, 0.38, mats.gold, 0, -0.92, 0));
        rightLegPivot.add(makeVoxel(0.34, 0.15, 0.45, mats.skin, 0, -0.96, 0.08));
        root.add(rightLegPivot);

        // 2. Torso Group
        const torsoGroup = new THREE.Group();
        torsoGroup.add(makeVoxel(1.10, 0.35, 0.95, mats.dhotiRed, 0, 1.05, 0));
        torsoGroup.add(makeVoxel(0.32, 0.38, 0.18, mats.sashGreen, 0, 0.95, 0.50)); // Emerald sash center
        torsoGroup.add(makeVoxel(1.15, 0.15, 1.00, mats.gold, 0, 1.15, 0)); // Royal Belt
        torsoGroup.add(makeVoxel(0.25, 0.20, 0.15, mats.ruby, 0, 1.15, 0.52));

        // Plump Belly & Chest
        torsoGroup.add(makeVoxel(1.15, 0.65, 1.05, mats.skin, 0, 1.45, 0.10));
        torsoGroup.add(makeVoxel(0.08, 0.08, 0.05, mats.skinShadow, 0, 1.38, 0.65)); // Navel

        // Sacred Janeu thread across chest
        const janeu = makeVoxel(0.08, 0.65, 0.08, mats.gold, -0.15, 1.60, 0.62);
        janeu.rotation.z = 0.55;
        torsoGroup.add(janeu);

        // Upper Chest & Necklaces
        torsoGroup.add(makeVoxel(1.30, 0.45, 0.90, mats.skin, 0, 1.85, 0.05));
        torsoGroup.add(makeVoxel(0.80, 0.12, 0.15, mats.gold, 0, 1.80, 0.52));
        torsoGroup.add(makeVoxel(0.20, 0.18, 0.15, mats.emerald, 0, 1.72, 0.53));
        root.add(torsoGroup);

        // 3. Four Divine Arms
        // Upper Right Arm: Stone Battle Axe (Parashu)
        const upperRightArmPivot = new THREE.Group();
        upperRightArmPivot.position.set(-0.75, 1.9, 0);
        upperRightArmPivot.add(makeVoxel(0.30, 0.40, 0.30, mats.skin, -0.15, 0.10, 0));
        upperRightArmPivot.add(makeVoxel(0.34, 0.10, 0.34, mats.gold, -0.15, 0.18, 0));
        upperRightArmPivot.add(makeVoxel(0.25, 0.40, 0.25, mats.skin, -0.25, 0.35, 0));
        upperRightArmPivot.add(makeVoxel(0.10, 0.85, 0.10, mats.axeHandle, -0.25, 0.70, 0));
        upperRightArmPivot.add(makeVoxel(0.32, 0.45, 0.12, mats.stoneAxe, -0.40, 0.88, 0)); // Axe head
        upperRightArmPivot.add(makeVoxel(0.18, 0.24, 0.08, mats.stoneAxe, -0.12, 0.88, 0));
        root.add(upperRightArmPivot);

        // Lower Right Arm: Abhaya Mudra (Blessing Palm)
        const lowerRightArmPivot = new THREE.Group();
        lowerRightArmPivot.position.set(-0.70, 1.55, 0.25);
        lowerRightArmPivot.add(makeVoxel(0.28, 0.30, 0.35, mats.skin, -0.10, 0, 0.15));
        lowerRightArmPivot.add(makeVoxel(0.32, 0.10, 0.32, mats.gold, -0.10, 0.05, 0.28));
        lowerRightArmPivot.add(makeVoxel(0.28, 0.32, 0.12, mats.skin, -0.15, 0.15, 0.35)); // Blessing palm
        lowerRightArmPivot.add(makeVoxel(0.10, 0.10, 0.05, mats.ruby, -0.15, 0.15, 0.42)); // Palm Tilak
        root.add(lowerRightArmPivot);

        // Upper Left Arm: Golden Mace / Lotus (Gada)
        const upperLeftArmPivot = new THREE.Group();
        upperLeftArmPivot.position.set(0.75, 1.9, 0);
        upperLeftArmPivot.add(makeVoxel(0.30, 0.40, 0.30, mats.skin, 0.15, 0.10, 0));
        upperLeftArmPivot.add(makeVoxel(0.34, 0.10, 0.34, mats.gold, 0.15, 0.18, 0));
        upperLeftArmPivot.add(makeVoxel(0.25, 0.40, 0.25, mats.skin, 0.25, 0.35, 0));
        upperLeftArmPivot.add(makeVoxel(0.10, 0.60, 0.10, mats.gold, 0.25, 0.65, 0));
        upperLeftArmPivot.add(makeVoxel(0.32, 0.22, 0.32, mats.gold, 0.25, 0.85, 0)); // Tiered mace head
        upperLeftArmPivot.add(makeVoxel(0.22, 0.18, 0.22, mats.gold, 0.25, 0.98, 0));
        upperLeftArmPivot.add(makeVoxel(0.12, 0.14, 0.12, mats.gold, 0.25, 1.08, 0)); // Pinnacle
        root.add(upperLeftArmPivot);

        // Lower Left Arm: Golden Modaks
        const lowerLeftArmPivot = new THREE.Group();
        lowerLeftArmPivot.position.set(0.70, 1.55, 0.25);
        lowerLeftArmPivot.add(makeVoxel(0.28, 0.30, 0.35, mats.skin, 0.10, 0, 0.15));
        lowerLeftArmPivot.add(makeVoxel(0.32, 0.10, 0.32, mats.gold, 0.10, 0.05, 0.28));
        lowerLeftArmPivot.add(makeVoxel(0.36, 0.10, 0.36, mats.skin, 0.12, 0.05, 0.45)); // Flat open palm
        lowerLeftArmPivot.add(makeVoxel(0.30, 0.16, 0.30, mats.modak, 0.12, 0.18, 0.45)); // Modak mound
        lowerLeftArmPivot.add(makeVoxel(0.18, 0.12, 0.18, mats.modak, 0.12, 0.28, 0.45));
        root.add(lowerLeftArmPivot);

        // 4. Head Group (with Stepped Ears, Tusks, Tilak & Tiered Crown)
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.2, 0.2);
        
        // Head skull
        headGroup.add(makeVoxel(0.95, 0.72, 0.82, mats.skin, 0, 0, 0));
        headGroup.add(makeVoxel(1.00, 0.14, 0.84, mats.darkHair, 0, 0.38, 0)); // Hair band

        // Stepped Fan Ears
        const leftEar = makeVoxel(0.12, 0.65, 0.65, mats.skin, -0.66, 0.05, -0.05);
        leftEar.rotation.y = 0.25;
        headGroup.add(leftEar);
        headGroup.add(makeVoxel(0.10, 0.50, 0.45, mats.skinShadow, -0.64, 0.05, -0.02)); // Inner shadow

        const rightEar = makeVoxel(0.12, 0.65, 0.65, mats.skin, 0.66, 0.05, -0.05);
        rightEar.rotation.y = -0.25;
        headGroup.add(rightEar);
        headGroup.add(makeVoxel(0.10, 0.50, 0.45, mats.skinShadow, 0.64, 0.05, -0.02));

        // Minecraft Eyes
        headGroup.add(makeVoxel(0.10, 0.12, 0.04, mats.eyePupil, -0.28, 0.10, 0.43));
        headGroup.add(makeVoxel(0.06, 0.12, 0.04, mats.tusk, -0.35, 0.10, 0.43));
        headGroup.add(makeVoxel(0.10, 0.12, 0.04, mats.eyePupil, 0.28, 0.10, 0.43));
        headGroup.add(makeVoxel(0.06, 0.12, 0.04, mats.tusk, 0.35, 0.10, 0.43));

        // Sacred Tilak
        headGroup.add(makeVoxel(0.12, 0.24, 0.04, mats.ruby, 0, 0.24, 0.43));
        headGroup.add(makeVoxel(0.08, 0.10, 0.04, mats.gold, 0, 0.14, 0.44));

        // Tusks: Right full, Left broken (Ekadanta)
        headGroup.add(makeVoxel(0.10, 0.20, 0.18, mats.tusk, -0.22, -0.16, 0.44));
        headGroup.add(makeVoxel(0.10, 0.10, 0.12, mats.tusk, 0.22, -0.14, 0.44));

        // Curved Elephant Trunk (Vakratunda)
        headGroup.add(makeVoxel(0.32, 0.35, 0.30, mats.skin, 0, -0.06, 0.44));
        headGroup.add(makeVoxel(0.28, 0.32, 0.26, mats.skin, 0.04, -0.28, 0.52));
        headGroup.add(makeVoxel(0.24, 0.24, 0.24, mats.skin, 0.14, -0.42, 0.54));
        const trunkTip = makeVoxel(0.20, 0.20, 0.20, mats.skin, 0.26, -0.38, 0.50); // Curling to modaks
        headGroup.add(trunkTip);
        headGroup.add(makeVoxel(0.24, 0.08, 0.24, mats.gold, 0.22, -0.38, 0.50));

        // Tiered Pagoda Crown (Mukut)
        headGroup.add(makeVoxel(0.85, 0.28, 0.75, mats.gold, 0, 0.48, 0));
        headGroup.add(makeVoxel(0.68, 0.26, 0.60, mats.gold, 0, 0.70, 0));
        headGroup.add(makeVoxel(0.48, 0.22, 0.44, mats.gold, 0, 0.90, 0));
        headGroup.add(makeVoxel(0.28, 0.18, 0.28, mats.gold, 0, 1.08, 0));
        headGroup.add(makeVoxel(0.14, 0.14, 0.14, mats.gold, 0, 1.20, 0)); // Pinnacle
        root.add(headGroup);

        // 5. Halo
        const haloGeo = new THREE.TorusGeometry(1.2, 0.07, 12, 32);
        const haloMesh = new THREE.Mesh(haloGeo, mats.gold);
        haloMesh.position.set(0, 2.35, -0.35);
        haloMesh.name = "Ganesha_Companion_Halo";
        root.add(haloMesh);

        // 6. Little Mushak Vahana
        const mushakGroup = new THREE.Group();
        mushakGroup.position.set(0.95, 0, 0.4);
        mushakGroup.name = "Mushak_Vahana";
        const mouseMat = new THREE.MeshStandardMaterial({ color: 0x8D99AE, roughness: 0.6 });
        const mousePink = new THREE.MeshStandardMaterial({ color: 0xFFB7B2, roughness: 0.5 });
        mushakGroup.add(makeVoxel(0.30, 0.22, 0.42, mouseMat, 0, 0.16, 0));
        mushakGroup.add(makeVoxel(0.20, 0.18, 0.22, mouseMat, 0, 0.24, 0.25));
        mushakGroup.add(makeVoxel(0.08, 0.10, 0.06, mousePink, -0.09, 0.34, 0.22));
        mushakGroup.add(makeVoxel(0.08, 0.10, 0.06, mousePink, 0.09, 0.34, 0.22));
        const mTail = makeVoxel(0.05, 0.05, 0.32, mousePink, 0, 0.20, -0.28);
        mTail.rotation.x = 0.3;
        mushakGroup.add(mTail);
        mushakGroup.add(makeVoxel(0.12, 0.14, 0.12, mats.modak, 0, 0.16, 0.40));
        root.add(mushakGroup);

        // Aura light
        const companionLight = new THREE.PointLight(0xFFD700, 1.8, 9);
        companionLight.position.set(0, 2.2, 0.6);
        root.add(companionLight);

        // Keep all pivot references for smooth companion walking and gestures
        root.userData = {
            leftLegPivot,
            rightLegPivot,
            upperRightArmPivot,
            lowerRightArmPivot,
            upperLeftArmPivot,
            lowerLeftArmPivot,
            headGroup,
            trunkTip,
            leftEar,
            rightEar,
            haloMesh,
            mushakGroup,
            companionLight
        };

        return root;
    }
}

window.GaneshaModel = GaneshaModel;
