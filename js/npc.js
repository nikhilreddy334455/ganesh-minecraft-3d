// 3D Voxel Animated Devotees (People / NPCs)
class DevoteeNPC {
    constructor(scene, x, z, options = {}) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, 0.5, z);
        this.targetPosition = new THREE.Vector3(x, 0.5, z);
        this.walkSpeed = options.speed || 1.8;
        this.gender = options.gender || (Math.random() > 0.5 ? 'male' : 'female');
        this.name = options.name || (this.gender === 'male' ? 'Devotee' : 'Bhakta');

        this.walkCycle = Math.random() * Math.PI * 2;
        this.isPraying = false;
        this.isWandering = true;
        this.wanderTimer = Math.random() * 4;
        this.dialogueCooldown = 0;

        // Colors
        this.kurtaColors = [0xFF9F1C, 0xE76F51, 0x2A9D8F, 0xE63946, 0x9D4EDD, 0xFFB703];
        this.dhotiColors = [0xFFF3B0, 0xE9ECEF, 0xFAEDCD, 0xD4AF37];
        this.skinColors = [0xFAD29B, 0xE0AC69, 0xC68642];

        this.kurtaColor = options.kurtaColor || this.kurtaColors[Math.floor(Math.random() * this.kurtaColors.length)];
        this.dhotiColor = options.dhotiColor || this.dhotiColors[Math.floor(Math.random() * this.dhotiColors.length)];
        this.skinColor = options.skinColor || this.skinColors[Math.floor(Math.random() * this.skinColors.length)];

        this.createModel();
    }

    createModel() {
        this.group = new THREE.Group();
        this.group.position.copy(this.position);

        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const skinMat = new THREE.MeshStandardMaterial({ color: this.skinColor, roughness: 0.6 });
        const kurtaMat = new THREE.MeshStandardMaterial({ color: this.kurtaColor, roughness: 0.7 });
        const dhotiMat = new THREE.MeshStandardMaterial({ color: this.dhotiColor, roughness: 0.7 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.3, metalness: 0.6 });

        // 1. Torso
        this.torso = new THREE.Mesh(boxGeo, kurtaMat);
        this.torso.scale.set(0.5, 0.65, 0.3);
        this.torso.position.set(0, 0.95, 0);
        this.torso.castShadow = true;
        this.group.add(this.torso);

        // Angavastram / Shawl diagonal sash
        const sash = new THREE.Mesh(boxGeo, goldMat);
        sash.scale.set(0.12, 0.7, 0.32);
        sash.position.set(0, 0.95, 0);
        sash.rotation.z = 0.35;
        this.group.add(sash);

        // 2. Head
        this.headGroup = new THREE.Group();
        this.headGroup.position.set(0, 1.45, 0);

        const headMesh = new THREE.Mesh(boxGeo, skinMat);
        headMesh.scale.set(0.4, 0.4, 0.4);
        this.headGroup.add(headMesh);

        // Tilak on forehead
        const tilakMat = new THREE.MeshBasicMaterial({ color: 0xDC143C });
        const tilak = new THREE.Mesh(boxGeo, tilakMat);
        tilak.scale.set(0.08, 0.15, 0.05);
        tilak.position.set(0, 0.08, 0.21);
        this.headGroup.add(tilak);

        // Turban (Pagri) / Hair
        if (this.gender === 'male') {
            const turbanMat = new THREE.MeshStandardMaterial({ color: this.kurtaColor, roughness: 0.8 });
            const turban = new THREE.Mesh(boxGeo, turbanMat);
            turban.scale.set(0.44, 0.18, 0.44);
            turban.position.set(0, 0.24, 0);
            this.headGroup.add(turban);
        } else {
            const hairMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.9 });
            const hair = new THREE.Mesh(boxGeo, hairMat);
            hair.scale.set(0.44, 0.22, 0.44);
            hair.position.set(0, 0.18, -0.05);
            this.headGroup.add(hair);
        }

        this.group.add(this.headGroup);

        // 3. Left & Right Arms
        this.leftArm = new THREE.Group();
        this.leftArm.position.set(-0.35, 1.25, 0);
        const lArmMesh = new THREE.Mesh(boxGeo, kurtaMat);
        lArmMesh.scale.set(0.18, 0.6, 0.2);
        lArmMesh.position.set(0, -0.3, 0);
        this.leftArm.add(lArmMesh);
        this.group.add(this.leftArm);

        this.rightArm = new THREE.Group();
        this.rightArm.position.set(0.35, 1.25, 0);
        const rArmMesh = new THREE.Mesh(boxGeo, kurtaMat);
        rArmMesh.scale.set(0.18, 0.6, 0.2);
        rArmMesh.position.set(0, -0.3, 0);
        this.rightArm.add(rArmMesh);
        this.group.add(this.rightArm);

        // 4. Left & Right Legs
        this.leftLeg = new THREE.Group();
        this.leftLeg.position.set(-0.16, 0.65, 0);
        const lLegMesh = new THREE.Mesh(boxGeo, dhotiMat);
        lLegMesh.scale.set(0.2, 0.65, 0.22);
        lLegMesh.position.set(0, -0.32, 0);
        this.leftLeg.add(lLegMesh);
        this.group.add(this.leftLeg);

        this.rightLeg = new THREE.Group();
        this.rightLeg.position.set(0.16, 0.65, 0);
        const rLegMesh = new THREE.Mesh(boxGeo, dhotiMat);
        rLegMesh.scale.set(0.2, 0.65, 0.22);
        rLegMesh.position.set(0, -0.32, 0);
        this.rightLeg.add(rLegMesh);
        this.group.add(this.rightLeg);

        this.scene.add(this.group);
    }

    pickNewTarget() {
        // Stay within village pathways or around pond / pandal
        const angle = Math.random() * Math.PI * 2;
        const dist = 3 + Math.random() * 8;
        let tx = this.position.x + Math.cos(angle) * dist;
        let tz = this.position.z + Math.sin(angle) * dist;

        // Keep away from lake deep water (x: 14 to 28, z: -14 to 12)
        if (tx >= 14 && tx <= 28 && tz >= -14 && tz <= 12) {
            tx = 8 + (Math.random() - 0.5) * 6;
        }

        // Keep within world bounds
        tx = Math.max(-28, Math.min(28, tx));
        tz = Math.max(-28, Math.min(28, tz));

        this.targetPosition.set(tx, 0.5, tz);
        this.isWandering = (Math.random() > 0.3);
    }

    update(delta, playerPos, isAartiActive) {
        if (!this.group) return;

        if (this.dialogueCooldown > 0) {
            this.dialogueCooldown -= delta;
        }

        const distToPlayer = this.position.distanceTo(playerPos);

        // Aarti reaction: all devotees raise hands and face Lord Ganesha (at 0, 1, -1)
        if (isAartiActive) {
            this.isPraying = true;
            // Face pandal center
            const lookAngle = Math.atan2(0 - this.position.x, -1 - this.position.z);
            this.group.rotation.y = lookAngle;

            // Clapping / Raised hands motion
            const clap = Math.sin(Date.now() * 0.008) * 0.35;
            this.leftArm.rotation.x = -1.6 + clap * 0.4;
            this.rightArm.rotation.x = -1.6 + clap * 0.4;
            this.leftArm.rotation.z = -0.3 + clap * 0.3;
            this.rightArm.rotation.z = 0.3 - clap * 0.3;

            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            return;
        }

        // If player is close, face player and do Namaste greeting
        if (distToPlayer < 3.2) {
            const angleToPlayer = Math.atan2(playerPos.x - this.position.x, playerPos.z - this.position.z);
            this.group.rotation.y = angleToPlayer;

            // Namaste pose (folded hands in front of chest)
            this.leftArm.rotation.x = -1.1;
            this.rightArm.rotation.x = -1.1;
            this.leftArm.rotation.z = -0.45;
            this.rightArm.rotation.z = 0.45;
            this.leftArm.rotation.y = 0.3;
            this.rightArm.rotation.y = -0.3;

            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;

            if (this.dialogueCooldown <= 0 && window.game) {
                const greetings = [
                    '🙏 Ganpati Bappa Morya!',
                    '✨ Mangal Murti Morya!',
                    '🌺 Happy Ganesh Utsav! Lord Ganesha bless you!',
                    '🪔 Welcome to the Grand Pandal! Join the Aarti!'
                ];
                const msg = greetings[Math.floor(Math.random() * greetings.length)];
                window.game.showToast(msg, 2400);
                this.dialogueCooldown = 9.0;
            }
            return;
        }

        // Wandering logic
        this.wanderTimer -= delta;
        if (this.wanderTimer <= 0) {
            this.pickNewTarget();
            this.wanderTimer = 4 + Math.random() * 6;
        }

        if (this.isWandering) {
            const toTarget = new THREE.Vector3().subVectors(this.targetPosition, this.position);
            toTarget.y = 0;
            const dist = toTarget.length();

            if (dist > 0.4) {
                toTarget.normalize();
                this.position.addScaledVector(toTarget, this.walkSpeed * delta);
                this.group.position.copy(this.position);

                // Rotate towards walk direction
                const walkAngle = Math.atan2(toTarget.x, toTarget.z);
                this.group.rotation.y = walkAngle;

                // Arm and leg swing
                this.walkCycle += delta * 7;
                const swing = Math.sin(this.walkCycle) * 0.6;
                this.leftLeg.rotation.x = swing;
                this.rightLeg.rotation.x = -swing;
                this.leftArm.rotation.x = -swing * 0.8;
                this.rightArm.rotation.x = swing * 0.8;
                this.leftArm.rotation.z = 0;
                this.rightArm.rotation.z = 0;
            } else {
                // Standing still facing pandal
                this.isWandering = false;
                const angleToPandal = Math.atan2(0 - this.position.x, 0 - this.position.z);
                this.group.rotation.y = angleToPandal;
                this.leftLeg.rotation.x = 0;
                this.rightLeg.rotation.x = 0;
                this.leftArm.rotation.x = 0;
                this.rightArm.rotation.x = 0;
            }
        } else {
            // Standing peacefully, occasional head turn
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
            this.headGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.2;
        }
    }

    dispose() {
        if (this.group) {
            this.scene.remove(this.group);
        }
    }
}

class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.devotees = [];
        this.spawnDevotees();
    }

    spawnDevotees() {
        // Spawn 10 devotees around the temple, pathways, and lake ghats
        const spawnPoints = [
            { x: -3, z: 8, gender: 'male' },
            { x: 3, z: 8, gender: 'female' },
            { x: 0, z: 12, gender: 'male' },
            { x: -6, z: 4, gender: 'female' },
            { x: 6, z: 4, gender: 'male' },
            { x: 12, z: 2, gender: 'female' },
            { x: 12, z: -2, gender: 'male' },
            { x: -12, z: 2, gender: 'female' },
            { x: 0, z: -10, gender: 'male' },
            { x: 10, z: 12, gender: 'female' }
        ];

        spawnPoints.forEach(pt => {
            const devotee = new DevoteeNPC(this.scene, pt.x, pt.z, { gender: pt.gender });
            this.devotees.push(devotee);
        });
    }

    update(delta, playerPos, isAartiActive) {
        this.devotees.forEach(d => {
            d.update(delta, playerPos, isAartiActive);
        });
    }
}

window.NPCManager = NPCManager;
window.DevoteeNPC = DevoteeNPC;
