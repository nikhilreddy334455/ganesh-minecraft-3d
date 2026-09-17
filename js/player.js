// First-Person Minecraft Player Controller with Pointer Lock & Voxel Collisions
class PlayerController {
    constructor(camera, domElement, voxelWorld) {
        this.camera = camera;
        this.domElement = domElement;
        this.voxelWorld = voxelWorld;

        // Player physics bounding parameters
        this.height = 1.75;
        this.radius = 0.32;
        this.position = new THREE.Vector3(0, 2.25, 7); // Spawn facing pandal resting firmly on grass
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.isGrounded = true;
        this.moveSpeed = 6.0;
        this.baseJumpForce = 6.2; // Quick tap jump (~1.1 blocks)
        this.maxJumpHoldTime = 0.34; // Hold time window for high jump
        this.jumpHoldTimer = 0;
        this.isJumping = false;
        this.gravity = 18.0;
        this.isInWater = false;

        // Camera Euler angles
        this.pitch = 0;
        this.yaw = 0;
        this.isLocked = false;

        // Key states
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false
        };

        // Raycasting for block interaction (nik3 center screen raycast)
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 10.0; // 10 units reach from nik3

        this.initEventListeners();
        this.initTouchControls();
    }

    initEventListeners() {
        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');

        this.hasEnteredGame = false;

        const requestLock = () => {
            this.hasEnteredGame = true;
            if (window.soundEngine) {
                window.soundEngine.init();
            }
            if (blocker) blocker.style.display = 'none';
            this.isLocked = true;

            try {
                if (document.pointerLockElement !== this.domElement) {
                    const req = this.domElement.requestPointerLock();
                    if (req && req.catch) {
                        req.catch((err) => {
                            console.warn('Pointer lock request non-fatal:', err);
                        });
                    }
                }
            } catch (err) {
                console.warn('requestPointerLock error non-fatal:', err);
            }
        };

        const enterGameAction = (e) => {
            if (e) {
                e.stopPropagation();
            }
            requestLock();
        };

        // Click or tap to enter
        if (blocker) {
            blocker.addEventListener('click', (e) => {
                if (e.target === blocker) enterGameAction(e);
            });
            blocker.addEventListener('touchend', (e) => {
                if (e.target === blocker) enterGameAction(e);
            });
        }
        if (instructions) {
            instructions.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        const btnStart = document.getElementById('btn-start-game');
        if (btnStart) {
            btnStart.addEventListener('click', enterGameAction);
            btnStart.addEventListener('touchend', enterGameAction);
        }
        const btnClose = document.getElementById('btn-close-modal');
        if (btnClose) {
            btnClose.addEventListener('click', enterGameAction);
            btnClose.addEventListener('touchend', enterGameAction);
        }
        const btnHelp = document.getElementById('btn-help');
        if (btnHelp) {
            btnHelp.addEventListener('click', (e) => {
                e.stopPropagation();
                if (blocker) {
                    const isVisible = blocker.style.display !== 'none';
                    blocker.style.display = isVisible ? 'none' : 'flex';
                }
            });
        }
        this.domElement.addEventListener('click', () => {
            if (!this.hasEnteredGame) {
                requestLock();
            } else if (!this.isLocked) {
                const modals = document.querySelectorAll('.modal-overlay');
                const anyModalOpen = Array.from(modals).some(m => m.style.display && m.style.display !== 'none');
                if (!anyModalOpen) {
                    try {
                        this.domElement.requestPointerLock();
                    } catch (e) {}
                }
            }
        });
        this.domElement.addEventListener('touchstart', () => {
            if (!this.hasEnteredGame) {
                requestLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            const hasLock = (document.pointerLockElement === this.domElement);
            this.isLocked = hasLock;
            // Never re-show blocker once the game has been entered!
        });

        document.addEventListener('pointerlockerror', (e) => {
            console.warn('PointerLockError (non-fatal, mouse drag available):', e);
            this.isLocked = false;
            if (blocker) blocker.style.display = 'none';
        });

        // Mouse look with pointer lock + mouse drag fallback
        let isMouseDown = false;
        let prevMouseX = 0;
        let prevMouseY = 0;

        window.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        document.addEventListener('mousemove', (e) => {
            // Never rotate camera or intercept mouse when any UI modal or blocker is open
            const modals = document.querySelectorAll('.modal-overlay, #palette-modal');
            const anyModalOpen = Array.from(modals).some(m => m.style.display && m.style.display !== 'none');
            if (anyModalOpen) return;

            let movementX = 0;
            let movementY = 0;

            if (this.isLocked) {
                movementX = e.movementX || 0;
                movementY = e.movementY || 0;
            } else if (isMouseDown && (!blocker || blocker.style.display === 'none')) {
                movementX = e.clientX - prevMouseX;
                movementY = e.clientY - prevMouseY;
                prevMouseX = e.clientX;
                prevMouseY = e.clientY;
            } else {
                return;
            }

            // Clamp excessive movement deltas to prevent camera snaps/jumps
            movementX = Math.max(-80, Math.min(80, movementX));
            movementY = Math.max(-80, Math.min(80, movementY));

            this.yaw -= movementX * 0.0024;
            this.pitch -= movementY * 0.0024;

            // Clamp pitch to prevent flipping
            this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
        });

        // Keyboard bindings
        window.addEventListener('keydown', (e) => {
            if (!this.hasEnteredGame) {
                if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyW') {
                    requestLock();
                }
            }

            if (e.code === 'KeyH') {
                if (blocker) {
                    const isVisible = blocker.style.display !== 'none';
                    blocker.style.display = isVisible ? 'none' : 'flex';
                }
            }

            // Prevent default page scroll on game control keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }

            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case 'Space':
                    this.keys.jump = true;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.keys.sprint = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.jump = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.keys.sprint = false;
                    break;
            }
        });

        // Reset keys if browser window loses focus to prevent keys staying stuck
        window.addEventListener('blur', () => this.resetKeys());
    }

    initTouchControls() {
        const dpadUp = document.getElementById('dpad-up');
        const dpadDown = document.getElementById('dpad-down');
        const dpadLeft = document.getElementById('dpad-left');
        const dpadRight = document.getElementById('dpad-right');

        const bindDirection = (el, dirKey) => {
            if (!el) return;
            const start = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.soundEngine) window.soundEngine.init();
                this.keys[dirKey] = true;
                el.classList.add('active');
            };
            const end = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.keys[dirKey] = false;
                el.classList.remove('active');
            };
            el.addEventListener('touchstart', start, { passive: false });
            el.addEventListener('touchend', end, { passive: false });
            el.addEventListener('touchcancel', end, { passive: false });
            el.addEventListener('mousedown', start);
            el.addEventListener('mouseup', end);
            el.addEventListener('mouseleave', end);
        };

        bindDirection(dpadUp, 'forward');
        bindDirection(dpadDown, 'backward');
        bindDirection(dpadLeft, 'left');
        bindDirection(dpadRight, 'right');

        const btnJump = document.getElementById('btn-touch-jump');
        if (btnJump) {
            const startJump = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.soundEngine) window.soundEngine.init();
                this.keys.jump = true;
                btnJump.classList.add('active');
            };
            const endJump = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.keys.jump = false;
                btnJump.classList.remove('active');
            };
            btnJump.addEventListener('touchstart', startJump, { passive: false });
            btnJump.addEventListener('touchend', endJump, { passive: false });
            btnJump.addEventListener('touchcancel', endJump, { passive: false });
            btnJump.addEventListener('mousedown', startJump);
            btnJump.addEventListener('mouseup', endJump);
            btnJump.addEventListener('mouseleave', endJump);
            window.addEventListener('mouseup', () => {
                this.keys.jump = false;
                btnJump.classList.remove('active');
            });
        }

        const btnPlace = document.getElementById('btn-touch-place');
        if (btnPlace) {
            btnPlace.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.soundEngine) window.soundEngine.init();
                if (window.game) window.game.handlePlaceBlock();
                btnPlace.classList.add('active');
                setTimeout(() => btnPlace.classList.remove('active'), 150);
            }, { passive: false });
            btnPlace.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.game) window.game.handlePlaceBlock();
            });
        }

        const btnBreak = document.getElementById('btn-touch-break');
        if (btnBreak) {
            btnBreak.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.soundEngine) window.soundEngine.init();
                if (window.game) window.game.handleBreakBlock();
                btnBreak.classList.add('active');
                setTimeout(() => btnBreak.classList.remove('active'), 150);
            }, { passive: false });
            btnBreak.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.game) window.game.handleBreakBlock();
            });
        }

        const btnAarti = document.getElementById('btn-touch-aarti');
        if (btnAarti) {
            btnAarti.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.soundEngine) window.soundEngine.init();
                if (window.game) window.game.performAartiCeremony();
                btnAarti.classList.add('active');
                setTimeout(() => btnAarti.classList.remove('active'), 150);
            }, { passive: false });
            btnAarti.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.game) window.game.performAartiCeremony();
            });
        }

        // Touch swipe camera rotation on mobile screen (excluding HUD and buttons)
        let touchLookId = null;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let touchStartTime = 0;
        let touchMoved = false;

        window.addEventListener('touchstart', (e) => {
            if (!this.hasEnteredGame) return;
            const target = e.target;
            if (target.closest('#mobile-controls') ||
                target.closest('#top-hud') ||
                target.closest('#hotbar-container') ||
                target.closest('#instructions')) {
                return;
            }

            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                // Right half or middle of screen for look drag
                if (touchLookId === null && t.clientX > window.innerWidth * 0.28) {
                    touchLookId = t.identifier;
                    lastTouchX = t.clientX;
                    lastTouchY = t.clientY;
                    touchStartTime = Date.now();
                    touchMoved = false;
                    break;
                }
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (touchLookId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === touchLookId) {
                    const dx = t.clientX - lastTouchX;
                    const dy = t.clientY - lastTouchY;
                    lastTouchX = t.clientX;
                    lastTouchY = t.clientY;

                    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                        touchMoved = true;
                    }

                    // Mobile look rotation speed
                    this.yaw -= dx * 0.004;
                    this.pitch -= dy * 0.004;
                    this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
                    e.preventDefault();
                    break;
                }
            }
        }, { passive: false });

        const endTouchLook = (e) => {
            if (touchLookId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === touchLookId) {
                    // Tap on screen to place block if not dragged
                    if (!touchMoved && (Date.now() - touchStartTime < 250)) {
                        if (window.game) window.game.handlePlaceBlock();
                    }
                    touchLookId = null;
                    break;
                }
            }
        };

        window.addEventListener('touchend', endTouchLook, { passive: false });
        window.addEventListener('touchcancel', endTouchLook, { passive: false });
    }

    resetKeys() {
        for (const key in this.keys) {
            this.keys[key] = false;
        }
    }

    update(delta) {
        if (!delta || delta > 0.1) delta = 0.016; // Safeguard against large frame skips

        // Update Camera rotation
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = this.pitch;
        euler.y = this.yaw;
        this.camera.quaternion.setFromEuler(euler);

        // Movement vectors relative to camera look yaw
        const moveDir = new THREE.Vector3();
        if (this.keys.forward) moveDir.z -= 1;
        if (this.keys.backward) moveDir.z += 1;
        if (this.keys.left) moveDir.x -= 1;
        if (this.keys.right) moveDir.x += 1;

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
            // Apply yaw only so player doesn't fly up/down with pitch
            moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        }

        // Check if player is wading in water
        const feetY = this.position.y - this.height;
        const blockY = Math.floor(feetY + 0.4);
        this.isInWater = this.voxelWorld.isWaterAt(this.position.x, blockY, this.position.z) ||
                         this.voxelWorld.isWaterAt(this.position.x, blockY + 1, this.position.z);

        const currentSpeed = this.isInWater ? this.moveSpeed * 0.65 : (this.keys.sprint ? this.moveSpeed * 1.5 : this.moveSpeed);
        this.velocity.x = moveDir.x * currentSpeed;
        this.velocity.z = moveDir.z * currentSpeed;

        if (this.isInWater) {
            // Water physics: buoyancy and swimming
            this.isGrounded = false;
            this.isJumping = false;
            if (this.keys.jump) {
                this.velocity.y = 4.0; // Swim up
            } else {
                // Gentle floating near water surface
                const targetWaterSurface = 0.5 + this.height - 0.25;
                if (this.position.y < targetWaterSurface) {
                    this.velocity.y = 1.0;
                } else {
                    this.velocity.y = -0.8;
                }
            }
        } else {
            // Land physics: dynamic variable jump
            if (this.isGrounded) {
                if (this.keys.jump) {
                    this.velocity.y = this.baseJumpForce; // initial impulse for short hop
                    this.isGrounded = false;
                    this.isJumping = true;
                    this.jumpHoldTimer = 0;
                } else {
                    this.velocity.y = 0;
                }
            } else if (this.isJumping) {
                // Long press space sustains thrust to jump significantly higher (~2.8 blocks high!)
                if (this.keys.jump && this.jumpHoldTimer < this.maxJumpHoldTime && this.velocity.y > 0) {
                    this.velocity.y += 22.0 * delta;
                    this.jumpHoldTimer += delta;
                } else {
                    this.isJumping = false;
                }
            }
        }

        // Apply movement with voxel collision
        this.moveWithCollision(delta);

        // Update Camera position
        this.camera.position.copy(this.position);
    }

    resetPosition(x = 0, y = 2.25, z = 7) {
        this.position.set(x, y, z);
        this.velocity.set(0, 0, 0);
        this.pitch = 0;
        this.yaw = 0;
        this.isGrounded = true;
        this.isJumping = false;
        this.jumpHoldTimer = 0;
        this.camera.position.copy(this.position);
    }

    moveWithCollision(delta) {
        // 1. Horizontal X movement (slide along walls)
        const dx = this.velocity.x * delta;
        if (dx !== 0) {
            if (!this.checkCollision(this.position.x + dx, this.position.y, this.position.z)) {
                this.position.x += dx;
            } else {
                this.velocity.x = 0;
            }
        }

        // 2. Horizontal Z movement (slide along walls)
        const dz = this.velocity.z * delta;
        if (dz !== 0) {
            if (!this.checkCollision(this.position.x, this.position.y, this.position.z + dz)) {
                this.position.z += dz;
            } else {
                this.velocity.z = 0;
            }
        }

        // 3. Vertical Y movement & Ground checking
        if (this.isInWater) {
            this.position.y += this.velocity.y * delta;
            // Prevent swimming above solid ceiling
            const headBy = Math.floor(this.position.y + 0.5);
            if (this.isBlockSolidBeneath(this.position.x, headBy, this.position.z)) {
                this.position.y = headBy - 0.5;
                this.velocity.y = 0;
            }
        } else if (this.isGrounded) {
            // Verify if player is still supported by solid ground
            const groundY = this.findGroundUnderFeet(this.position.x, this.position.y, this.position.z);
            if (groundY !== null) {
                // Keep player smoothly resting on the supporting block surface
                this.position.y = groundY + this.height;
                this.velocity.y = 0;
            } else {
                // Stepped off an edge into open air
                this.isGrounded = false;
            }
        } else {
            // Falling or jumping in air
            this.handleAirVertical(delta);
        }

        // Floor safety boundary: if fallen into void, respawn on ground
        if (this.position.y < -10) {
            this.position.set(0, 2.25, 7);
            this.velocity.set(0, 0, 0);
            this.isGrounded = true;
        }
    }

    handleAirVertical(delta) {
        this.velocity.y -= this.gravity * delta;
        const dy = this.velocity.y * delta;
        const targetY = this.position.y + dy;

        if (this.velocity.y < 0) {
            // Falling down: check if feet penetrate any solid block top
            const currentFeet = this.position.y - this.height;
            const targetFeet = targetY - this.height;

            const startBy = Math.floor(currentFeet + 0.5);
            const endBy = Math.floor(targetFeet + 0.5);

            let landed = false;
            let highestLandingY = -Infinity;

            for (let by = startBy; by >= endBy; by--) {
                const surfaceY = by + 0.5;
                if (targetFeet <= surfaceY && currentFeet >= surfaceY - 0.05) {
                    if (this.isBlockSolidBeneath(this.position.x, by, this.position.z)) {
                        if (surfaceY > highestLandingY) {
                            highestLandingY = surfaceY;
                            landed = true;
                        }
                    }
                }
            }

            if (landed) {
                this.position.y = highestLandingY + this.height;
                this.velocity.y = 0;
                this.isGrounded = true;
            } else {
                this.position.y = targetY;
            }
        } else if (this.velocity.y > 0) {
            // Jumping up: check ceiling collision above head
            const targetHead = targetY;
            const headBy = Math.floor(targetHead + 0.5);

            if (this.isBlockSolidBeneath(this.position.x, headBy, this.position.z)) {
                // Ceiling collision: stop upward momentum
                this.position.y = headBy - 0.5;
                this.velocity.y = 0;
            } else {
                this.position.y = targetY;
            }
        }
    }

    findGroundUnderFeet(x, y, z) {
        const feetY = y - this.height;
        // Check the block layer immediately beneath feet (within margin)
        const checkBy = Math.floor(feetY - 0.05 + 0.5);
        if (this.isBlockSolidBeneath(x, checkBy, z)) {
            return checkBy + 0.5; // Top surface of the solid block
        }
        return null;
    }

    isBlockSolidBeneath(x, by, z) {
        const sampleOffset = this.radius * 0.7;
        const pts = [
            [x, z],
            [x - sampleOffset, z - sampleOffset],
            [x + sampleOffset, z - sampleOffset],
            [x - sampleOffset, z + sampleOffset],
            [x + sampleOffset, z + sampleOffset]
        ];

        for (let i = 0; i < pts.length; i++) {
            if (this.voxelWorld.isSolidAt(pts[i][0], by, pts[i][1])) {
                return true;
            }
        }
        return false;
    }

    checkCollision(x, y, z) {
        // Player cylinder/AABB check for horizontal movement
        // We check from feet + 0.15 up to head - 0.05 so the ground you stand on is never considered a wall!
        const minX = x - this.radius + 0.001;
        const maxX = x + this.radius - 0.001;
        const minY = y - this.height + 0.15;
        const maxY = y - 0.05;
        const minZ = z - this.radius + 0.001;
        const maxZ = z + this.radius - 0.001;

        const minBx = Math.floor(minX + 0.5);
        const maxBx = Math.floor(maxX + 0.5);
        const minBy = Math.floor(minY + 0.5);
        const maxBy = Math.floor(maxY + 0.5);
        const minBz = Math.floor(minZ + 0.5);
        const maxBz = Math.floor(maxZ + 0.5);

        for (let bx = minBx; bx <= maxBx; bx++) {
            for (let bz = minBz; bz <= maxBz; bz++) {
                for (let by = minBy; by <= maxBy; by++) {
                    if (this.voxelWorld.isSolidAt(bx, by, bz)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // nik3 Raycast from center of the screen
    getCenterRaycast(objectsToIntersect) {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = this.raycaster.intersectObjects(objectsToIntersect, true);
        if (intersects.length > 0) {
            return intersects[0];
        }
        return null;
    }
}

window.PlayerController = PlayerController;
