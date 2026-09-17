// Levels Progression Engine & Objective Tracker for Ganesh Pandal Craft 3D
class LevelManager {
    constructor(game) {
        this.game = game;

        // 5 Immersive Vedic & Architectural Levels
        this.levels = [
            {
                id: 'level_1',
                index: 0,
                title: 'Sthapana (Sacred Foundation)',
                tagline: 'Consecrate the sanctum and welcome Lord Ganesha',
                icon: '🐘',
                blessingReward: 150,
                unlocks: 'Level 2: Mandap Vistara',
                narrative: 'Lay the sacred marble foundation for the sanctum, place the divine Lord Ganesha idol at the center, light the holy diyas, and perform the sacred Consecration Aarti!',
                objectives: [
                    { id: 'marble_floor', label: 'Lay Altar Foundation Plinth', icon: '⬜', target: 8, current: 0, type: 'place_foundation' },
                    { id: 'place_ganesha', label: 'Place Lord Ganesha Idol', icon: '🐘', target: 1, current: 0, type: 'place', blockId: 'ganesha' },
                    { id: 'light_diyas', label: 'Place Holy Glowing Diyas', icon: '🪔', target: 2, current: 0, type: 'place', blockId: 'diya' },
                    { id: 'perform_aarti', label: 'Perform Consecration Aarti', icon: '🙏', target: 1, current: 0, type: 'aarti' }
                ]
            },
            {
                id: 'level_2',
                index: 1,
                title: 'Mandap Vistara (Pandal Architecture)',
                tagline: 'Erect the grand festival tent & royal pillars',
                icon: '⛺',
                blessingReward: 350,
                unlocks: 'Level 3: Teerth Snan',
                narrative: 'Transform the altar into a grand Utsav Pandal! Raise majestic temple pillars, weave vibrant red & gold canopy fabrics, hang fresh marigold garlands, and illuminate with lanterns.',
                objectives: [
                    { id: 'temple_pillars', label: 'Erect Temple Pillars', icon: '🏛️', target: 8, current: 0, type: 'place', blockId: 'pillar' },
                    { id: 'tent_fabrics', label: 'Weave Canopy Fabric', icon: '⛺', target: 12, current: 0, type: 'place_any', blockIds: ['tent_red', 'tent_gold'] },
                    { id: 'marigold_toran', label: 'Hang Marigold Toran', icon: '🌼', target: 6, current: 0, type: 'place', blockId: 'marigold' },
                    { id: 'lanterns', label: 'Hang Festive Lanterns', icon: '🏮', target: 4, current: 0, type: 'place', blockId: 'lantern' }
                ]
            },
            {
                id: 'level_3',
                index: 2,
                title: 'Teerth Snan (Holy Ghats & Waterways)',
                tagline: 'Create the sacred riverbank steps for holy bathing',
                icon: '💧',
                blessingReward: 600,
                unlocks: 'Level 4: Modak Prasadam',
                narrative: 'Auspicious festivals require sacred waterways. Channel holy water, line the banks with pristine river sand, lay stone ghat pathways, and perform a divine River Aarti.',
                objectives: [
                    { id: 'holy_water', label: 'Channel Holy Water', icon: '💧', target: 8, current: 0, type: 'place', blockId: 'water' },
                    { id: 'river_sand', label: 'Shape Riverbank Sands', icon: '🏖️', target: 6, current: 0, type: 'place', blockId: 'sand' },
                    { id: 'ghat_path', label: 'Pave Ghat Walkways', icon: '🧱', target: 10, current: 0, type: 'place_any', blockIds: ['cobblestone', 'brick'] },
                    { id: 'ghat_aarti', label: 'Offer Teerth Snan Aarti', icon: '🪔', target: 1, current: 0, type: 'aarti' }
                ]
            },
            {
                id: 'level_4',
                index: 3,
                title: 'Modak Prasadam & Nature Grove',
                tagline: 'Nurture sacred trees & lush temple gardens',
                icon: '🍃',
                blessingReward: 1000,
                unlocks: 'Level 5: Grand Finale',
                narrative: 'Enrich the sanctuary surroundings with nature. Plant sacred peepal tree trunks, expand dense leafy canopies, cultivate green meadow grass, and offer 2 devotion ceremonies.',
                objectives: [
                    { id: 'tree_trunks', label: 'Plant Sacred Tree Trunks', icon: '🪵', target: 6, current: 0, type: 'place', blockId: 'wood_log' },
                    { id: 'peepal_leaves', label: 'Sprout Peepal Leaves', icon: '🍃', target: 12, current: 0, type: 'place', blockId: 'leaves' },
                    { id: 'garden_grass', label: 'Cultivate Meadow Grass', icon: '🌱', target: 10, current: 0, type: 'place', blockId: 'grass' },
                    { id: 'grove_aarti', label: 'Consecrate Nature Grove Aarti', icon: '🌺', target: 2, current: 0, type: 'aarti' }
                ]
            },
            {
                id: 'level_5',
                index: 4,
                title: 'Maha Visarjan & Rajadhiraj Utsav',
                tagline: 'The supreme festival celebration & divine climax',
                icon: '👑',
                blessingReward: 2500,
                unlocks: 'Supreme Title: Chhatrapati Vighnaharta',
                narrative: 'The zenith of Ganesh Utsav! Bedeck the grand pandal with 30+ festive decorations, illuminate the sanctum with 8 radiant diyas, perform 3 Maha Aartis, and earn the eternal crown of the festival master architect!',
                objectives: [
                    { id: 'festive_mastery', label: 'Place Total Festive Blocks', icon: '✨', target: 30, current: 0, type: 'place_total' },
                    { id: 'divine_diyas', label: 'Kindle 8 Radiant Diyas', icon: '🪔', target: 8, current: 0, type: 'place', blockId: 'diya' },
                    { id: 'maha_aarti_trio', label: 'Perform 3 Divine Aartis', icon: '🙏', target: 3, current: 0, type: 'aarti' },
                    { id: 'blessing_goal', label: 'Earn 1000+ Total Blessings', icon: '🌟', target: 1000, current: 0, type: 'blessings' }
                ]
            }
        ];

        this.currentLevelIndex = 0;
        this.unlockedLevels = [true, false, false, false, false];
        this.completedLevels = [false, false, false, false, false];
        this.isHudCollapsed = false;

        this.loadState();
        this.initUI();
    }

    // Safe State Persistence with localStorage
    loadState() {
        try {
            const saved = localStorage.getItem('ganesh_craft_levels_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed.currentLevelIndex === 'number' && parsed.currentLevelIndex < this.levels.length) {
                    this.currentLevelIndex = parsed.currentLevelIndex;
                }
                if (Array.isArray(parsed.unlockedLevels)) {
                    this.unlockedLevels = parsed.unlockedLevels;
                }
                if (Array.isArray(parsed.completedLevels)) {
                    this.completedLevels = parsed.completedLevels;
                }
                if (Array.isArray(parsed.progress)) {
                    parsed.progress.forEach((savedLvl, lIdx) => {
                        if (this.levels[lIdx] && Array.isArray(savedLvl)) {
                            savedLvl.forEach((val, oIdx) => {
                                if (this.levels[lIdx].objectives[oIdx]) {
                                    this.levels[lIdx].objectives[oIdx].current = Math.min(
                                        this.levels[lIdx].objectives[oIdx].target,
                                        Number(val) || 0
                                    );
                                }
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('LevelManager: Unable to load state from localStorage:', e);
        }
    }

    saveState() {
        try {
            const progress = this.levels.map(lvl => lvl.objectives.map(o => o.current));
            const data = {
                currentLevelIndex: this.currentLevelIndex,
                unlockedLevels: this.unlockedLevels,
                completedLevels: this.completedLevels,
                progress: progress
            };
            localStorage.setItem('ganesh_craft_levels_v1', JSON.stringify(data));
        } catch (e) {
            console.warn('LevelManager: Unable to save state to localStorage:', e);
        }
    }

    getCurrentLevel() {
        return this.levels[this.currentLevelIndex] || this.levels[0];
    }

    selectLevel(index) {
        if (index < 0 || index >= this.levels.length) return;
        if (!this.unlockedLevels[index]) {
            if (this.game && this.game.showToast) {
                this.game.showToast(`🔒 Level ${index + 1} is locked! Complete previous levels first.`);
            }
            return;
        }

        this.currentLevelIndex = index;
        this.saveState();
        this.renderHUD();
        this.renderModal();

        if (this.game && this.game.showToast) {
            const lvl = this.getCurrentLevel();
            this.game.showToast(`🚩 Switched to Level ${lvl.index + 1}: ${lvl.title}!`, 3000);
        }
    }

    // Event Hook: Triggered when any block is placed
    onBlockPlaced(blockId) {
        const lvl = this.getCurrentLevel();
        if (!lvl) return;

        let changed = false;
        let lastUpdatedObj = null;

        lvl.objectives.forEach(obj => {
            if (obj.current >= obj.target) return;

            if (obj.type === 'place' && obj.blockId === blockId) {
                obj.current = Math.min(obj.target, obj.current + 1);
                changed = true;
                lastUpdatedObj = obj;
            } else if (obj.type === 'place_foundation' && ['marble', 'stone', 'cobblestone', 'wood', 'brick', 'tent_red', 'tent_gold', 'sand', 'dirt'].includes(blockId)) {
                obj.current = Math.min(obj.target, obj.current + 1);
                changed = true;
                lastUpdatedObj = obj;
            } else if (obj.type === 'place_any' && Array.isArray(obj.blockIds) && obj.blockIds.includes(blockId)) {
                obj.current = Math.min(obj.target, obj.current + 1);
                changed = true;
                lastUpdatedObj = obj;
            } else if (obj.type === 'place_total') {
                obj.current = Math.min(obj.target, obj.current + 1);
                changed = true;
                lastUpdatedObj = obj;
            }
        });

        if (changed) {
            this.saveState();
            this.renderHUD();
            if (lastUpdatedObj && this.game && this.game.showToast) {
                this.game.showToast(`✨ ${lastUpdatedObj.icon} ${lastUpdatedObj.label}: ${lastUpdatedObj.current}/${lastUpdatedObj.target}`, 1200);
            }
            if (window.soundEngine && window.soundEngine.playSparkle) {
                window.soundEngine.playSparkle();
            }
            this.checkLevelCompletion();
        }
    }

    // Event Hook: Triggered when a block is broken
    onBlockBroken(blockId) {
        // We keep completed progress sticky to encourage creative building without punishing exploration
    }

    // Event Hook: Triggered during Aarti ceremony
    onAartiPerformed() {
        const lvl = this.getCurrentLevel();
        if (!lvl) return;

        let changed = false;
        lvl.objectives.forEach(obj => {
            if (obj.current >= obj.target) return;

            if (obj.type === 'aarti') {
                obj.current = Math.min(obj.target, obj.current + 1);
                changed = true;
            }
        });

        // Also check blessings objective if present
        if (this.game && typeof this.game.blessingsCount === 'number') {
            lvl.objectives.forEach(obj => {
                if (obj.type === 'blessings') {
                    obj.current = Math.min(obj.target, this.game.blessingsCount);
                    changed = true;
                }
            });
        }

        if (changed) {
            this.saveState();
            this.renderHUD();
            if (this.game && this.game.showToast) {
                this.game.showToast('🙏 Aarti Ceremony counted toward festival objectives!', 2000);
            }
            this.checkLevelCompletion();
        }
    }

    // Check if all objectives for the active level are fulfilled
    checkLevelCompletion() {
        const lvl = this.getCurrentLevel();
        if (!lvl) return;

        // Verify all objectives met
        const allDone = lvl.objectives.every(obj => {
            if (obj.type === 'blessings' && this.game) {
                return (this.game.blessingsCount || 0) >= obj.target;
            }
            return obj.current >= obj.target;
        });

        if (allDone && !this.completedLevels[this.currentLevelIndex]) {
            this.completeLevel(this.currentLevelIndex);
        }
    }

    completeLevel(levelIdx) {
        const lvl = this.levels[levelIdx];
        if (!lvl) return;

        this.completedLevels[levelIdx] = true;

        // Unlock next level if available
        const nextIdx = levelIdx + 1;
        if (nextIdx < this.levels.length) {
            this.unlockedLevels[nextIdx] = true;
        }

        // Award blessings
        if (this.game && typeof this.game.blessingsCount === 'number') {
            this.game.blessingsCount += lvl.blessingReward;
            const blessingsEl = document.getElementById('blessings-count');
            if (blessingsEl) blessingsEl.innerText = this.game.blessingsCount;
        }

        this.saveState();
        this.renderHUD();
        this.renderModal();

        // Audio celebration fanfare
        if (window.soundEngine && window.soundEngine.playLevelComplete) {
            window.soundEngine.playLevelComplete();
        } else if (window.soundEngine && window.soundEngine.playShankh) {
            window.soundEngine.playShankh(2.5);
            setTimeout(() => {
                if (window.soundEngine.playSparkle) window.soundEngine.playSparkle();
            }, 600);
        }

        // Shower celebration flower petals
        if (this.game && this.game.spawnFlowerPetals) {
            this.game.spawnFlowerPetals(30);
        }

        // Show celebratory victory modal
        this.showLevelCompleteModal(lvl);
    }

    // Initialize UI elements and listeners
    initUI() {
        this.renderHUD();
        this.setupModalEvents();
    }

    renderHUD() {
        const hud = document.getElementById('level-hud');
        if (!hud) return;

        const lvl = this.getCurrentLevel();
        const totalObjs = lvl.objectives.length;
        const completedObjs = lvl.objectives.filter(o => o.current >= o.target).length;
        const percent = Math.round((completedObjs / totalObjs) * 100);
        const isLevelComplete = this.completedLevels[lvl.index];

        hud.innerHTML = `
            <div class="level-hud-header" id="level-hud-toggle">
                <div class="level-hud-badge">
                    <span class="level-hud-icon">${lvl.icon}</span>
                    <div class="level-hud-titles">
                        <span class="level-hud-tag">LEVEL ${lvl.index + 1} OF 5</span>
                        <h4 class="level-hud-name">${lvl.title}</h4>
                    </div>
                </div>
                <div class="level-hud-actions">
                    <span class="level-hud-progress-text">${completedObjs}/${totalObjs}</span>
                    <button class="level-hud-btn" id="btn-open-levels-hub" title="Open Levels Overview (L)">🏆</button>
                    <button class="level-hud-collapse-btn" id="btn-collapse-level-hud" title="Toggle Compact View">
                        ${this.isHudCollapsed ? '▼' : '▲'}
                    </button>
                </div>
            </div>

            <div class="level-hud-progress-bar">
                <div class="level-hud-progress-fill ${isLevelComplete ? 'complete' : ''}" style="width: ${percent}%;"></div>
            </div>

            <div class="level-hud-body ${this.isHudCollapsed ? 'collapsed' : ''}" id="level-hud-body">
                <div class="level-hud-objectives">
                    ${lvl.objectives.map(obj => {
                        const isDone = obj.current >= obj.target;
                        return `
                            <div class="level-obj-item ${isDone ? 'done' : ''}">
                                <div class="level-obj-check">${isDone ? '✓' : '○'}</div>
                                <div class="level-obj-text">
                                    <span class="obj-label">${obj.icon} ${obj.label}</span>
                                    <span class="obj-count">${obj.current} / ${obj.target}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${isLevelComplete ? `
                    <div class="level-hud-completed-banner">
                        ⭐ LEVEL COMPLETED! ⭐
                    </div>
                ` : ''}
            </div>
        `;

        // Attach listeners to newly rendered elements
        const toggleBtn = document.getElementById('btn-collapse-level-hud');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.isHudCollapsed = !this.isHudCollapsed;
                this.renderHUD();
            });
        }

        const hubBtn = document.getElementById('btn-open-levels-hub');
        if (hubBtn) {
            hubBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLevelsModal(true);
            });
        }
    }

    setupModalEvents() {
        const modal = document.getElementById('levels-modal');
        const btnOpen = document.getElementById('btn-levels');
        const btnTouchOpen = document.getElementById('btn-touch-levels');
        const btnClose = document.getElementById('btn-close-levels');

        if (btnOpen) {
            btnOpen.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLevelsModal();
            });
        }
        if (btnTouchOpen) {
            btnTouchOpen.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLevelsModal();
            });
        }
        if (btnClose) {
            btnClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLevelsModal(false);
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.toggleLevelsModal(false);
                }
            });
        }

        // Setup Level Complete celebration modal close / next buttons
        const btnNextLevel = document.getElementById('btn-complete-next-level');
        const btnCloseComplete = document.getElementById('btn-close-complete-modal');
        if (btnNextLevel) {
            btnNextLevel.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dismissLevelCompleteModal();
                if (this.currentLevelIndex < this.levels.length - 1) {
                    this.selectLevel(this.currentLevelIndex + 1);
                }
            });
        }
        if (btnCloseComplete) {
            btnCloseComplete.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dismissLevelCompleteModal();
            });
        }
    }

    toggleLevelsModal(forceOpen = null) {
        const modal = document.getElementById('levels-modal');
        if (!modal) return;

        const isClosed = (modal.style.display === 'none' || !modal.style.display);
        const shouldOpen = (forceOpen !== null) ? forceOpen : isClosed;

        if (shouldOpen) {
            this.renderModal();
            modal.style.display = 'flex';
            if (document.exitPointerLock) {
                document.exitPointerLock();
            }
        } else {
            modal.style.display = 'none';
        }
    }

    renderModal() {
        const container = document.getElementById('levels-list-grid');
        if (!container) return;

        container.innerHTML = this.levels.map((lvl, idx) => {
            const isUnlocked = this.unlockedLevels[idx];
            const isCompleted = this.completedLevels[idx];
            const isCurrent = this.currentLevelIndex === idx;

            let statusBadge = '';
            if (isCompleted) {
                statusBadge = '<span class="lvl-badge-completed">⭐ COMPLETED</span>';
            } else if (isCurrent) {
                statusBadge = '<span class="lvl-badge-active">⚡ ACTIVE QUEST</span>';
            } else if (isUnlocked) {
                statusBadge = '<span class="lvl-badge-unlocked">🔓 UNLOCKED</span>';
            } else {
                statusBadge = '<span class="lvl-badge-locked">🔒 LOCKED</span>';
            }

            const totalObjs = lvl.objectives.length;
            const doneObjs = lvl.objectives.filter(o => o.current >= o.target).length;
            const percent = Math.round((doneObjs / totalObjs) * 100);

            return `
                <div class="level-card ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}">
                    <div class="level-card-top">
                        <div class="level-card-header">
                            <span class="level-card-icon">${lvl.icon}</span>
                            <div class="level-card-title-box">
                                <span class="level-card-num">LEVEL ${idx + 1}</span>
                                <h3 class="level-card-title">${lvl.title}</h3>
                            </div>
                        </div>
                        <div class="level-card-status">${statusBadge}</div>
                    </div>

                    <p class="level-card-narrative">${lvl.narrative}</p>

                    <div class="level-card-objectives-preview">
                        <div class="level-card-obj-header">
                            <span>Objectives Progress</span>
                            <span>${doneObjs}/${totalObjs} (${percent}%)</span>
                        </div>
                        <div class="level-card-bar">
                            <div class="level-card-bar-fill" style="width: ${percent}%;"></div>
                        </div>
                        <ul class="level-card-obj-list">
                            ${lvl.objectives.map(o => `
                                <li class="${o.current >= o.target ? 'done' : ''}">
                                    <span>${o.current >= o.target ? '✓' : '•'} ${o.icon} ${o.label}</span>
                                    <span class="obj-metric">${o.current}/${o.target}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="level-card-footer">
                        <div class="level-card-reward">
                            <span class="reward-label">Reward:</span>
                            <span class="reward-val">🙏 +${lvl.blessingReward} Blessings</span>
                        </div>
                        ${isUnlocked ? `
                            <button class="level-card-action-btn ${isCurrent ? 'active' : ''}" data-index="${idx}">
                                ${isCurrent ? 'Current Quest' : 'Play Level'}
                            </button>
                        ` : `
                            <button class="level-card-action-btn disabled" disabled>
                                Locked 🔒
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        // Attach listeners to Play Level buttons
        const actionBtns = container.querySelectorAll('.level-card-action-btn:not(.disabled)');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                this.selectLevel(idx);
                this.toggleLevelsModal(false);
            });
        });
    }

    showLevelCompleteModal(lvl) {
        const modal = document.getElementById('level-complete-modal');
        if (!modal) return;

        const iconEl = document.getElementById('complete-level-icon');
        const titleEl = document.getElementById('complete-level-title');
        const descEl = document.getElementById('complete-level-desc');
        const rewardEl = document.getElementById('complete-level-reward');
        const nextBtn = document.getElementById('btn-complete-next-level');

        if (iconEl) iconEl.innerText = lvl.icon;
        if (titleEl) titleEl.innerText = `LEVEL ${lvl.index + 1} MASTERED!`;
        if (descEl) descEl.innerText = `You have successfully consecrated ${lvl.title} with divine precision and devotion!`;
        if (rewardEl) rewardEl.innerText = `+${lvl.blessingReward} Sacred Blessings`;

        if (nextBtn) {
            if (lvl.index < this.levels.length - 1) {
                nextBtn.innerText = `Advance to Level ${lvl.index + 2} ➡️`;
                nextBtn.style.display = 'inline-block';
            } else {
                nextBtn.innerText = '🏆 Rejoice in Visarjan Utsav!';
                nextBtn.style.display = 'inline-block';
            }
        }

        modal.style.display = 'flex';
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }

    dismissLevelCompleteModal() {
        const modal = document.getElementById('level-complete-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Reset progress helper for testing or player replay
    resetAllProgression() {
        this.currentLevelIndex = 0;
        this.unlockedLevels = [true, false, false, false, false];
        this.completedLevels = [false, false, false, false, false];
        this.levels.forEach(lvl => {
            lvl.objectives.forEach(obj => obj.current = 0);
        });
        try {
            localStorage.removeItem('ganesh_craft_levels_v1');
        } catch (e) {}
        this.saveState();
        this.renderHUD();
        this.renderModal();
        if (this.game && this.game.showToast) {
            this.game.showToast('🔄 Level 1: Sthapana Reloaded (0/4 Objectives)! Ready to build!', 3000);
        }
    }
}

window.LevelManager = LevelManager;
