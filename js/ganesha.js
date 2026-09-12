// 3D Voxel Lord Ganesha Model Generator & Mushak Vahana
class GaneshaModel {
    static createIdol() {
        const group = new THREE.Group();
        group.name = "Lord_Ganesha_Idol";

        // Material Palette
        const materials = {
            gold: new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.3, metalness: 0.8 }),
            ruby: new THREE.MeshStandardMaterial({ color: 0xDC143C, roughness: 0.2, metalness: 0.3 }),
            emerald: new THREE.MeshStandardMaterial({ color: 0x00A86B, roughness: 0.2, metalness: 0.3 }),
            dhoti: new THREE.MeshStandardMaterial({ color: 0xFF8C00, roughness: 0.6 }), // Saffron/Orange
            angavastram: new THREE.MeshStandardMaterial({ color: 0xE63946, roughness: 0.5 }), // Red silk
            skin: new THREE.MeshStandardMaterial({ color: 0xFDE2BB, roughness: 0.5 }), // Warm sandalwood
            trunk: new THREE.MeshStandardMaterial({ color: 0xFAD29B, roughness: 0.5 }),
            tusk: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 }),
            pedestalMarble: new THREE.MeshStandardMaterial({ color: 0x800020, roughness: 0.4 }), // Royal Maroon/Marble
            haloGlow: new THREE.MeshBasicMaterial({ color: 0xFFEA00, transparent: true, opacity: 0.65 }),
            modak: new THREE.MeshStandardMaterial({ color: 0xFFF5B7, roughness: 0.4, emissive: 0x332200 }),
            diyaBrass: new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.2, metalness: 0.9 }),
            flame: new THREE.MeshBasicMaterial({ color: 0xFF4500 })
        };

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

        // 1. Grand Lotus / Maroon Pedestal (Peetha)
        addVoxel(0, 0.15, 0, 2.4, 0.3, 2.4, materials.pedestalMarble);
        addVoxel(0, 0.35, 0, 2.0, 0.15, 2.0, materials.gold);
        addVoxel(0, 0.45, 0, 1.8, 0.1, 1.8, materials.ruby);

        // 2. Legs (Folded Yogic Padmasana)
        addVoxel(-0.6, 0.65, 0.2, 0.7, 0.4, 1.0, materials.dhoti);
        addVoxel(0.6, 0.65, 0.2, 0.7, 0.4, 1.0, materials.dhoti);
        addVoxel(0, 0.65, 0.35, 0.8, 0.35, 0.7, materials.dhoti); // Folded knees

        // 3. Round Royal Belly (Lambodara)
        addVoxel(0, 1.05, 0.1, 1.2, 0.7, 1.1, materials.dhoti);
        addVoxel(0, 1.25, 0.35, 0.8, 0.5, 0.5, materials.skin); // Torso upper
        
        // Sacred Janeu Thread (Diagonal ribbon across chest)
        const janeu = addVoxel(-0.15, 1.35, 0.62, 0.1, 0.5, 0.1, materials.gold);
        janeu.rotation.z = 0.6;

        // 4. Chest and Shoulders
        addVoxel(0, 1.45, 0.1, 1.3, 0.5, 0.9, materials.skin);

        // 5. Four Divine Arms (Chaturbhuja)
        // Upper Right: Holding Ankusha/Parashu (Axe)
        addVoxel(0.75, 1.55, -0.1, 0.35, 0.35, 0.6, materials.skin);
        addVoxel(0.9, 1.8, 0.1, 0.3, 0.4, 0.3, materials.skin);
        addVoxel(0.9, 2.05, 0.1, 0.15, 0.4, 0.15, materials.gold); // Ankusha

        // Lower Right: Abhaya Mudra (Blessing Palm with sacred tilak)
        addVoxel(0.7, 1.25, 0.4, 0.3, 0.3, 0.5, materials.skin);
        const palm = addVoxel(0.75, 1.4, 0.7, 0.3, 0.35, 0.12, materials.skin);
        addVoxel(0.75, 1.4, 0.77, 0.1, 0.1, 0.05, materials.ruby); // Red Tilak on palm

        // Upper Left: Holding Pasha (Lotus/Noose)
        addVoxel(-0.75, 1.55, -0.1, 0.35, 0.35, 0.6, materials.skin);
        addVoxel(-0.9, 1.8, 0.1, 0.3, 0.4, 0.3, materials.skin);
        addVoxel(-0.9, 2.05, 0.1, 0.25, 0.25, 0.25, materials.ruby); // Lotus flower

        // Lower Left: Holding Bowl of Divine Modaks
        addVoxel(-0.7, 1.25, 0.4, 0.3, 0.3, 0.5, materials.skin);
        addVoxel(-0.65, 1.25, 0.7, 0.4, 0.15, 0.4, materials.gold); // Gold Thali
        addVoxel(-0.65, 1.37, 0.7, 0.25, 0.25, 0.25, materials.modak); // Sweet Modak

        // 6. Sacred Elephant Head (Gaja Vadana)
        addVoxel(0, 1.85, 0.25, 0.9, 0.7, 0.8, materials.skin);

        // Large Divine Ears
        const leftEar = addVoxel(-0.65, 1.9, 0.2, 0.15, 0.6, 0.7, materials.skin);
        leftEar.rotation.y = 0.3;
        const rightEar = addVoxel(0.65, 1.9, 0.2, 0.15, 0.6, 0.7, materials.skin);
        rightEar.rotation.y = -0.3;

        // Ear gold ornaments
        addVoxel(-0.65, 1.6, 0.2, 0.18, 0.15, 0.18, materials.gold);
        addVoxel(0.65, 1.6, 0.2, 0.18, 0.15, 0.18, materials.gold);

        // Tusks (Danta: Left broken Ekadanta, Right intact)
        addVoxel(0.25, 1.68, 0.65, 0.1, 0.2, 0.15, materials.tusk);
        addVoxel(-0.25, 1.72, 0.65, 0.1, 0.1, 0.12, materials.tusk); // Half tusk

        // Curved Elephant Trunk (Vakratunda)
        addVoxel(0, 1.75, 0.65, 0.3, 0.4, 0.3, materials.trunk);
        addVoxel(0, 1.5, 0.75, 0.25, 0.35, 0.25, materials.trunk);
        addVoxel(-0.15, 1.35, 0.78, 0.25, 0.22, 0.22, materials.trunk); // Curves towards modak on left
        addVoxel(-0.35, 1.32, 0.75, 0.22, 0.2, 0.2, materials.trunk);
        addVoxel(-0.45, 1.38, 0.7, 0.18, 0.18, 0.18, materials.gold); // Gold tip touching modak

        // Sacred Red & Yellow Tilak / Trishul on Forehead
        addVoxel(0, 2.05, 0.66, 0.15, 0.25, 0.05, materials.ruby);
        addVoxel(0, 1.98, 0.67, 0.08, 0.1, 0.05, materials.gold);

        // 7. Majestic Royal Crown (Kireeta Mukut)
        addVoxel(0, 2.3, 0.25, 0.8, 0.35, 0.7, materials.gold);
        addVoxel(0, 2.55, 0.25, 0.6, 0.3, 0.55, materials.gold);
        addVoxel(0, 2.75, 0.25, 0.35, 0.25, 0.35, materials.ruby);
        addVoxel(0, 2.92, 0.25, 0.15, 0.18, 0.15, materials.emerald);

        // 8. Rotating Divine Radiant Aura / Halo (Prabhavali)
        const haloGeo = new THREE.TorusGeometry(1.2, 0.08, 12, 36);
        const haloMesh = new THREE.Mesh(haloGeo, materials.gold);
        haloMesh.position.set(0, 2.0, -0.25);
        haloMesh.name = "Ganesha_Halo";
        group.add(haloMesh);

        // Radiant back glow plate
        const glowDiscGeo = new THREE.CircleGeometry(1.25, 32);
        const glowDisc = new THREE.Mesh(glowDiscGeo, materials.haloGlow);
        glowDisc.position.set(0, 2.0, -0.26);
        group.add(glowDisc);

        // 9. Humble Companion Mushak (Mouse Vahana) sitting beside Lord Ganesha
        const mouseGroup = new THREE.Group();
        mouseGroup.position.set(0.85, 0.45, 0.8);
        const mouseMat = new THREE.MeshStandardMaterial({ color: 0x8D99AE, roughness: 0.6 });
        const mousePink = new THREE.MeshStandardMaterial({ color: 0xFFB7B2, roughness: 0.5 });
        
        // Body
        const mouseBody = new THREE.Mesh(boxGeo, mouseMat);
        mouseBody.scale.set(0.35, 0.25, 0.45);
        mouseBody.position.set(0, 0.12, 0);
        mouseGroup.add(mouseBody);

        // Head
        const mouseHead = new THREE.Mesh(boxGeo, mouseMat);
        mouseHead.scale.set(0.22, 0.2, 0.25);
        mouseHead.position.set(0, 0.2, -0.25);
        mouseGroup.add(mouseHead);

        // Ears
        const mEarL = new THREE.Mesh(boxGeo, mousePink);
        mEarL.scale.set(0.08, 0.12, 0.08);
        mEarL.position.set(-0.1, 0.32, -0.22);
        mouseGroup.add(mEarL);

        const mEarR = new THREE.Mesh(boxGeo, mousePink);
        mEarR.scale.set(0.08, 0.12, 0.08);
        mEarR.position.set(0.1, 0.32, -0.22);
        mouseGroup.add(mEarR);

        // Tail
        const mTail = new THREE.Mesh(boxGeo, mousePink);
        mTail.scale.set(0.06, 0.06, 0.35);
        mTail.position.set(0, 0.15, 0.35);
        mTail.rotation.x = -0.3;
        mouseGroup.add(mTail);

        // Little Modak in paws
        const mModak = new THREE.Mesh(boxGeo, materials.modak);
        mModak.scale.set(0.12, 0.15, 0.12);
        mModak.position.set(0, 0.15, -0.4);
        mouseGroup.add(mModak);

        group.add(mouseGroup);

        // 10. Sacred Temple Brass Diyas on both sides
        [-1.0, 1.0].forEach(sideX => {
            const diyaBase = addVoxel(sideX, 0.35, 0.8, 0.25, 0.15, 0.25, materials.diyaBrass);
            const flame = addVoxel(sideX, 0.48, 0.8, 0.1, 0.16, 0.1, materials.flame);
            flame.name = "Diya_Flame";

            // Warm light from the Diya
            const light = new THREE.PointLight(0xFFA500, 1.2, 5);
            light.position.set(sideX, 0.55, 0.8);
            group.add(light);
        });

        // Divine golden point light over the idol
        const auraLight = new THREE.PointLight(0xFFD700, 1.8, 8);
        auraLight.position.set(0, 2.5, 0.8);
        group.add(auraLight);

        return group;
    }
}

window.GaneshaModel = GaneshaModel;
