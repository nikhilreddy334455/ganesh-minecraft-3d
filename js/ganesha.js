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

    // Majestic Standing Lord Ganesha Animated Character & Companion
    static createStandingGanesha() {
        const root = new THREE.Group();
        root.name = "Standing_Lord_Ganesha";

        const materials = {
            gold: new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.25, metalness: 0.85 }),
            ruby: new THREE.MeshStandardMaterial({ color: 0xDC143C, roughness: 0.2, metalness: 0.3 }),
            emerald: new THREE.MeshStandardMaterial({ color: 0x00A86B, roughness: 0.2, metalness: 0.3 }),
            dhoti: new THREE.MeshStandardMaterial({ color: 0xFF7A00, roughness: 0.55 }), // Bright Saffron
            dhotiGold: new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.3, metalness: 0.6 }),
            angavastram: new THREE.MeshStandardMaterial({ color: 0xE63946, roughness: 0.5 }), // Red silk stole
            skin: new THREE.MeshStandardMaterial({ color: 0xFDE2BB, roughness: 0.5 }), // Warm sandalwood
            trunk: new THREE.MeshStandardMaterial({ color: 0xFAD29B, roughness: 0.5 }),
            tusk: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.15 }),
            haloGlow: new THREE.MeshBasicMaterial({ color: 0xFFEA00, transparent: true, opacity: 0.7 }),
            modak: new THREE.MeshStandardMaterial({ color: 0xFFF5B7, roughness: 0.3, emissive: 0x443300 }),
            mouseMat: new THREE.MeshStandardMaterial({ color: 0x8D99AE, roughness: 0.6 }),
            mousePink: new THREE.MeshStandardMaterial({ color: 0xFFB7B2, roughness: 0.5 })
        };

        const boxGeo = new THREE.BoxGeometry(1, 1, 1);

        function makeVoxel(sx, sy, sz, mat, px = 0, py = 0, pz = 0) {
            const mesh = new THREE.Mesh(boxGeo, mat);
            mesh.scale.set(sx, sy, sz);
            mesh.position.set(px, py, pz);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }

        // 1. Articulated Standing Legs (Hips at Y = 0.9)
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.35, 0.9, 0);
        // Thigh & Shin
        leftLegPivot.add(makeVoxel(0.42, 0.5, 0.45, materials.dhoti, 0, -0.25, 0));
        leftLegPivot.add(makeVoxel(0.38, 0.45, 0.4, materials.dhoti, 0, -0.65, 0));
        // Golden Dhoti border & Anklet
        leftLegPivot.add(makeVoxel(0.44, 0.1, 0.46, materials.dhotiGold, 0, -0.85, 0));
        leftLegPivot.add(makeVoxel(0.36, 0.08, 0.38, materials.gold, 0, -0.92, 0)); // Golden Kada
        // Foot
        leftLegPivot.add(makeVoxel(0.34, 0.15, 0.45, materials.skin, 0, -0.96, 0.08));
        root.add(leftLegPivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.35, 0.9, 0);
        rightLegPivot.add(makeVoxel(0.42, 0.5, 0.45, materials.dhoti, 0, -0.25, 0));
        rightLegPivot.add(makeVoxel(0.38, 0.45, 0.4, materials.dhoti, 0, -0.65, 0));
        rightLegPivot.add(makeVoxel(0.44, 0.1, 0.46, materials.dhotiGold, 0, -0.85, 0));
        rightLegPivot.add(makeVoxel(0.36, 0.08, 0.38, materials.gold, 0, -0.92, 0));
        rightLegPivot.add(makeVoxel(0.34, 0.15, 0.45, materials.skin, 0, -0.96, 0.08));
        root.add(rightLegPivot);

        // 2. Torso Group (Hips to Shoulders)
        const torsoGroup = new THREE.Group();
        // Saffron Waistband & Dhoti Fold
        torsoGroup.add(makeVoxel(1.1, 0.35, 0.95, materials.dhoti, 0, 1.05, 0));
        torsoGroup.add(makeVoxel(1.15, 0.15, 1.0, materials.dhotiGold, 0, 1.15, 0)); // Royal Belt
        torsoGroup.add(makeVoxel(0.25, 0.4, 0.15, materials.ruby, 0, 1.05, 0.52)); // Belt Gem brooch
        
        // Majestic Lambodara Belly
        torsoGroup.add(makeVoxel(1.15, 0.65, 1.05, materials.skin, 0, 1.45, 0.1));
        // Navel (Nabhi)
        torsoGroup.add(makeVoxel(0.08, 0.08, 0.05, materials.ruby, 0, 1.38, 0.65));

        // Sacred Janeu thread across chest
        const janeu = makeVoxel(0.08, 0.65, 0.08, materials.gold, -0.15, 1.6, 0.62);
        janeu.rotation.z = 0.55;
        torsoGroup.add(janeu);

        // Upper Chest & Broad Shoulders
        torsoGroup.add(makeVoxel(1.3, 0.45, 0.9, materials.skin, 0, 1.85, 0.05));
        // Royal pearl and ruby necklace
        torsoGroup.add(makeVoxel(0.8, 0.12, 0.15, materials.gold, 0, 1.8, 0.52));
        torsoGroup.add(makeVoxel(0.2, 0.18, 0.15, materials.emerald, 0, 1.72, 0.53));
        root.add(torsoGroup);

        // 3. Four Divine Arms (Chaturbhuja)
        // Upper Right Arm: Golden Parashu / Ankusha (Axe of Wisdom)
        const upperRightArmPivot = new THREE.Group();
        upperRightArmPivot.position.set(0.75, 1.9, 0);
        upperRightArmPivot.add(makeVoxel(0.3, 0.4, 0.3, materials.skin, 0.15, 0.1, 0));
        upperRightArmPivot.add(makeVoxel(0.25, 0.4, 0.25, materials.skin, 0.25, 0.35, 0));
        upperRightArmPivot.add(makeVoxel(0.08, 0.7, 0.08, materials.gold, 0.25, 0.65, 0)); // Shaft
        upperRightArmPivot.add(makeVoxel(0.35, 0.35, 0.06, materials.ruby, 0.4, 0.85, 0)); // Axe Blade
        root.add(upperRightArmPivot);

        // Lower Right Arm: Abhaya Mudra (Blessing & Waving Palm)
        const lowerRightArmPivot = new THREE.Group();
        lowerRightArmPivot.position.set(0.7, 1.55, 0.25);
        lowerRightArmPivot.add(makeVoxel(0.28, 0.3, 0.35, materials.skin, 0.1, 0, 0.15));
        // Blessing palm with divine ruby tilak
        lowerRightArmPivot.add(makeVoxel(0.28, 0.32, 0.12, materials.skin, 0.15, 0.15, 0.35));
        lowerRightArmPivot.add(makeVoxel(0.1, 0.1, 0.05, materials.ruby, 0.15, 0.15, 0.42)); // Palm Tilak
        root.add(lowerRightArmPivot);

        // Upper Left Arm: Holding Sacred Red Lotus (Pasha)
        const upperLeftArmPivot = new THREE.Group();
        upperLeftArmPivot.position.set(-0.75, 1.9, 0);
        upperLeftArmPivot.add(makeVoxel(0.3, 0.4, 0.3, materials.skin, -0.15, 0.1, 0));
        upperLeftArmPivot.add(makeVoxel(0.25, 0.4, 0.25, materials.skin, -0.25, 0.35, 0));
        upperLeftArmPivot.add(makeVoxel(0.3, 0.3, 0.3, materials.ruby, -0.25, 0.65, 0)); // Lotus Blossom
        upperLeftArmPivot.add(makeVoxel(0.12, 0.12, 0.12, materials.gold, -0.25, 0.65, 0.16));
        root.add(upperLeftArmPivot);

        // Lower Left Arm: Golden Bowl filled with Sweet Modaks
        const lowerLeftArmPivot = new THREE.Group();
        lowerLeftArmPivot.position.set(-0.7, 1.55, 0.25);
        lowerLeftArmPivot.add(makeVoxel(0.28, 0.3, 0.35, materials.skin, -0.1, 0, 0.15));
        // Golden bowl
        lowerLeftArmPivot.add(makeVoxel(0.42, 0.15, 0.42, materials.gold, -0.12, 0.05, 0.35));
        // Glowing Modaks
        lowerLeftArmPivot.add(makeVoxel(0.22, 0.25, 0.22, materials.modak, -0.12, 0.2, 0.35));
        lowerLeftArmPivot.add(makeVoxel(0.14, 0.16, 0.14, materials.modak, -0.02, 0.16, 0.42));
        lowerLeftArmPivot.add(makeVoxel(0.14, 0.16, 0.14, materials.modak, -0.22, 0.16, 0.3));
        root.add(lowerLeftArmPivot);

        // 4. Head Group (Gaja Vadana with Royal Mukut & Trunk)
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.2, 0.2);
        
        // Head skull
        headGroup.add(makeVoxel(0.9, 0.7, 0.8, materials.skin, 0, 0, 0));

        // Ears with golden Kundala earrings
        const leftEar = makeVoxel(0.12, 0.55, 0.65, materials.skin, -0.62, 0.05, -0.05);
        leftEar.rotation.y = 0.25;
        headGroup.add(leftEar);
        headGroup.add(makeVoxel(0.16, 0.18, 0.16, materials.gold, -0.62, -0.2, -0.05));

        const rightEar = makeVoxel(0.12, 0.55, 0.65, materials.skin, 0.62, 0.05, -0.05);
        rightEar.rotation.y = -0.25;
        headGroup.add(rightEar);
        headGroup.add(makeVoxel(0.16, 0.18, 0.16, materials.gold, 0.62, -0.2, -0.05));

        // Tusks (Danta: Left Ekadanta half tusk, Right full tusk)
        headGroup.add(makeVoxel(0.1, 0.22, 0.15, materials.tusk, 0.25, -0.18, 0.42));
        headGroup.add(makeVoxel(0.1, 0.11, 0.12, materials.tusk, -0.25, -0.14, 0.42));

        // Curved Elephant Trunk (Vakratunda)
        headGroup.add(makeVoxel(0.3, 0.35, 0.28, materials.trunk, 0, -0.08, 0.42));
        headGroup.add(makeVoxel(0.26, 0.32, 0.25, materials.trunk, 0, -0.32, 0.5));
        headGroup.add(makeVoxel(0.24, 0.22, 0.22, materials.trunk, -0.12, -0.46, 0.52));
        const trunkTip = makeVoxel(0.2, 0.18, 0.2, materials.gold, -0.26, -0.42, 0.5); // Golden tip
        headGroup.add(trunkTip);

        // Sacred Tilak & Trishul on Forehead
        headGroup.add(makeVoxel(0.14, 0.25, 0.04, materials.ruby, 0, 0.2, 0.42));
        headGroup.add(makeVoxel(0.08, 0.12, 0.04, materials.gold, 0, 0.14, 0.43));

        // Royal Mukut (Crown)
        headGroup.add(makeVoxel(0.78, 0.32, 0.68, materials.gold, 0, 0.45, 0));
        headGroup.add(makeVoxel(0.58, 0.28, 0.52, materials.gold, 0, 0.7, 0));
        headGroup.add(makeVoxel(0.36, 0.22, 0.34, materials.ruby, 0, 0.9, 0));
        headGroup.add(makeVoxel(0.16, 0.18, 0.16, materials.emerald, 0, 1.05, 0));
        root.add(headGroup);

        // 5. Rotating Radiant Halo / Prabhavali
        const haloGeo = new THREE.TorusGeometry(1.2, 0.07, 12, 32);
        const haloMesh = new THREE.Mesh(haloGeo, materials.gold);
        haloMesh.position.set(0, 2.35, -0.35);
        haloMesh.name = "Ganesha_Companion_Halo";
        root.add(haloMesh);

        // Radiant back glow plate
        const glowDiscGeo = new THREE.CircleGeometry(1.22, 28);
        const glowDisc = new THREE.Mesh(glowDiscGeo, materials.haloGlow);
        glowDisc.position.set(0, 2.35, -0.36);
        root.add(glowDisc);

        // 6. Running Little Mushak (Mouse Vahana)
        const mushakGroup = new THREE.Group();
        mushakGroup.position.set(0.95, 0, 0.4);
        mushakGroup.name = "Mushak_Vahana";
        // Body
        mushakGroup.add(makeVoxel(0.3, 0.22, 0.42, materials.mouseMat, 0, 0.16, 0));
        // Head
        mushakGroup.add(makeVoxel(0.2, 0.18, 0.22, materials.mouseMat, 0, 0.24, 0.25));
        // Pink ears
        mushakGroup.add(makeVoxel(0.08, 0.1, 0.06, materials.mousePink, -0.09, 0.34, 0.22));
        mushakGroup.add(makeVoxel(0.08, 0.1, 0.06, materials.mousePink, 0.09, 0.34, 0.22));
        // Tail
        const mTail = makeVoxel(0.05, 0.05, 0.32, materials.mousePink, 0, 0.2, -0.28);
        mTail.rotation.x = 0.3;
        mushakGroup.add(mTail);
        // Little modak
        mushakGroup.add(makeVoxel(0.12, 0.14, 0.12, materials.modak, 0, 0.16, 0.4));
        root.add(mushakGroup);

        // 7. Warm divine aura light
        const companionLight = new THREE.PointLight(0xFFD700, 1.6, 9);
        companionLight.position.set(0, 2.2, 0.6);
        root.add(companionLight);

        // Store articulated parts for real-time companion animation
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
