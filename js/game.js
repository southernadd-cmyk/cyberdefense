// ========================================
// CYBER DEFENSE SIMULATOR - GAME ENGINE
// Core game loop, state management, rendering
// ========================================

import {
    CELL_SIZE, GRID_COLS, GRID_ROWS, CANVAS_WIDTH, CANVAS_HEIGHT,
    CELL, STATE, COLORS, PLANNING_DURATION, WAVE_BREAK_DURATION,
    THREAT_TYPES, TOWER_TYPES, LEVELS
} from './config.js';

import { Tower, Threat, Asset, Projectile } from './entities.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        // Game state
        this.state = STATE.MENU;
        this.currentLevelIndex = 0;
        this.levelConfig = null;

        // Game objects
        this.towers = [];
        this.threats = [];
        this.assets = [];
        this.projectiles = [];
        this.grid = [];
        this.pathCells = new Set();

        // Budget & scoring
        this.budget = 0;
        this.score = 0;
        this.totalScore = 0;

        // Wave management
        this.currentWave = 0;
        this.totalWaves = 0;
        this.waveSpawnQueue = [];
        this.waveActive = false;
        this.threatsRemaining = 0;

        // Timers
        this.planningTimer = 0;
        this.waveBreakTimer = 0;
        this.lastTimestamp = 0;
        this.gameSpeed = 1;
        this.elapsed = 0;

        // Interaction
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.hoveredCell = null;
        this.mouseX = 0;
        this.mouseY = 0;

        // UI callbacks
        this.onStateChange = null;
        this.onNotification = null;
        this.onEduPopup = null;
        this.onWaveChange = null;
        this.onQuizRequest = null;       // Called between waves to trigger quiz
        this.onShowDYK = null;           // Called to show "Did You Know?" tips
        this.onHideDYK = null;           // Called to hide "Did You Know?" tips
        this.onThreatHover = null;       // Called when mouse hovers over a threat

        // Level stats
        this.stats = {
            towersPlaced: 0,
            towersUsedTypes: new Set(),
            threatsKilled: 0,
            moneySpent: 0,
            moneyEarned: 0,
            damageToAssets: 0,
            startTime: 0,
            ransomwareKills: 0,
            quizBonusEarned: 0
        };

        // Saved progress
        this.progress = this.loadProgress();

        // Path pixel cache for rendering
        this.pathPixelSegments = [];

        // Particles for visual effects
        this.particles = [];

        // Animation frame tracking
        this.running = false;
        this.animFrameId = null;

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
    }

    // --- Save/Load ---
    loadProgress() {
        try {
            const data = localStorage.getItem('cyberDefenseProgress');
            return data ? JSON.parse(data) : {
                levelsCompleted: [],
                levelScores: {},
                levelStars: {},
                highScore: 0,
                achievements: [],
                totalRansomwareKills: 0,
                towersEverUsed: [],
                encyclopediaRead: []
            };
        } catch {
            return {
                levelsCompleted: [],
                levelScores: {},
                levelStars: {},
                highScore: 0,
                achievements: [],
                totalRansomwareKills: 0,
                towersEverUsed: [],
                encyclopediaRead: []
            };
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('cyberDefenseProgress', JSON.stringify(this.progress));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }

    // --- Level Loading ---
    loadLevel(levelIndex) {
        // Stop existing game loop if running
        this.stop();

        this.currentLevelIndex = levelIndex;
        this.levelConfig = LEVELS[levelIndex];

        // Reset game objects
        this.towers = [];
        this.threats = [];
        this.projectiles = [];
        this.particles = [];
        this.assets = [];
        this.waveSpawnQueue = [];

        // Set budget
        this.budget = this.levelConfig.startingBudget;
        this.score = 0;
        this.currentWave = 0;
        this.totalWaves = this.levelConfig.waves.length;
        this.waveActive = false;
        this.elapsed = 0;
        this.gameSpeed = 1;
        this.selectedTowerType = null;
        this.selectedTower = null;

        // Reset stats
        this.stats = {
            towersPlaced: 0,
            towersUsedTypes: new Set(),
            threatsKilled: 0,
            moneySpent: 0,
            moneyEarned: 0,
            damageToAssets: 0,
            startTime: Date.now(),
            ransomwareKills: 0,
            quizBonusEarned: 0
        };

        // Build grid
        this.buildGrid();

        // Create assets
        for (const assetConfig of this.levelConfig.assets) {
            const asset = new Asset(assetConfig, assetConfig.x, assetConfig.y);
            this.assets.push(asset);
        }

        // Build pixel path segments for rendering
        this.buildPathSegments();

        // Start planning phase
        this.state = STATE.PLANNING;
        this.planningTimer = PLANNING_DURATION;

        if (this.onStateChange) this.onStateChange(this.state);

        // Show DYK tip during planning
        if (this.onShowDYK) this.onShowDYK();
    }

    buildGrid() {
        // Initialize empty grid
        this.grid = [];
        this.pathCells = new Set();

        for (let y = 0; y < GRID_ROWS; y++) {
            this.grid[y] = [];
            for (let x = 0; x < GRID_COLS; x++) {
                this.grid[y][x] = CELL.EMPTY;
            }
        }

        // Mark path cells by tracing between waypoints
        for (const path of this.levelConfig.paths) {
            for (let i = 0; i < path.length - 1; i++) {
                const from = path[i];
                const to = path[i + 1];
                this.tracePath(from.x, from.y, to.x, to.y);
            }
            // Mark spawn and asset points
            if (path.length > 0) {
                const spawn = path[0];
                this.grid[spawn.y][spawn.x] = CELL.SPAWN;
            }
        }

        // Mark asset cells
        for (const asset of this.levelConfig.assets) {
            this.grid[asset.y][asset.x] = CELL.ASSET;
            this.pathCells.add(`${asset.x},${asset.y}`);
        }
    }

    tracePath(x1, y1, x2, y2) {
        // Bresenham-like line trace on grid
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;

        let x = x1, y = y1;

        if (dx >= dy) {
            // Horizontal dominant
            let err = dx / 2;
            while (x !== x2) {
                this.markPathCell(x, y);
                err -= dy;
                if (err < 0) { y += sy; err += dx; }
                x += sx;
            }
        } else {
            // Vertical dominant
            let err = dy / 2;
            while (y !== y2) {
                this.markPathCell(x, y);
                err -= dx;
                if (err < 0) { x += sx; err += dy; }
                y += sy;
            }
        }
        this.markPathCell(x2, y2);
    }

    markPathCell(x, y) {
        if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
            if (this.grid[y][x] === CELL.EMPTY) {
                this.grid[y][x] = CELL.PATH;
            }
            this.pathCells.add(`${x},${y}`);
        }
    }

    buildPathSegments() {
        // Convert grid waypoints to pixel coordinates for threat movement
        this.pathPixelSegments = [];

        for (const path of this.levelConfig.paths) {
            const pixels = path.map(wp => ({
                x: wp.x * CELL_SIZE + CELL_SIZE / 2,
                y: wp.y * CELL_SIZE + CELL_SIZE / 2
            }));
            this.pathPixelSegments.push(pixels);
        }
    }

    // --- Tower Placement ---
    canPlaceTower(gridX, gridY) {
        if (gridX < 0 || gridX >= GRID_COLS || gridY < 0 || gridY >= GRID_ROWS) return false;
        if (this.grid[gridY][gridX] !== CELL.EMPTY) return false;

        // Check no tower already there
        for (const tower of this.towers) {
            if (tower.gridX === gridX && tower.gridY === gridY) return false;
        }

        return true;
    }

    placeTower(towerType, gridX, gridY) {
        const config = TOWER_TYPES[towerType];
        if (!config) return false;
        if (this.budget < config.cost) return false;
        if (!this.canPlaceTower(gridX, gridY)) return false;

        // Check if tower type is available in current level
        if (!this.levelConfig.availableTowers.includes(towerType)) return false;

        const tower = new Tower(towerType, gridX, gridY);
        this.towers.push(tower);
        this.budget -= config.cost;
        this.stats.towersPlaced++;
        this.stats.towersUsedTypes.add(towerType);
        this.stats.moneySpent += config.cost;

        // Track tower usage for achievements
        if (!this.progress.towersEverUsed.includes(towerType)) {
            this.progress.towersEverUsed.push(towerType);
            this.saveProgress();
        }

        // Update asset protection status
        this.updateAssetProtection();

        if (this.onNotification) {
            this.onNotification(`${config.name} deployed`, 'success');
        }

        return true;
    }

    upgradeTower(tower) {
        const cost = tower.getUpgradeCost();
        if (cost === null || this.budget < cost) return false;

        this.budget -= cost;
        this.stats.moneySpent += cost;
        tower.upgrade();

        this.updateAssetProtection();

        if (this.onNotification) {
            this.onNotification(`${tower.name} upgraded to ${TOWER_TYPES[tower.towerType].upgrades[tower.upgradeLevel - 1].name}`, 'success');
        }

        return true;
    }

    sellTower(tower) {
        const value = tower.getSellValue();
        this.budget += value;
        this.towers = this.towers.filter(t => t !== tower);

        this.updateAssetProtection();

        if (this.selectedTower === tower) this.selectedTower = null;

        if (this.onNotification) {
            this.onNotification(`${tower.name} sold for \u00A3${value}`, 'info');
        }
    }

    updateAssetProtection() {
        // Check which assets have backup/encryption nearby
        for (const asset of this.assets) {
            asset.hasBackup = false;
            asset.hasEncryption = false;
            asset.encryptionReduction = 0;

            for (const tower of this.towers) {
                // Check if tower is adjacent to asset (within 2 cells)
                const dist = Math.max(
                    Math.abs(tower.gridX - asset.gridX),
                    Math.abs(tower.gridY - asset.gridY)
                );

                if (tower.towerType === 'backup' && dist <= 3) {
                    asset.hasBackup = true;
                }
                if (tower.towerType === 'encryption' && dist <= 2) {
                    asset.hasEncryption = true;
                    asset.encryptionReduction = tower.protectionAmount;
                }
            }
        }
    }

    // --- Wave Management ---
    startNextWave() {
        if (this.currentWave >= this.totalWaves) return;

        // Hide DYK tips when battle starts
        if (this.onHideDYK) this.onHideDYK();

        const waveConfig = this.levelConfig.waves[this.currentWave];
        this.waveSpawnQueue = [];
        this.threatsRemaining = 0;

        // Check for educational popup
        if (this.levelConfig.eduPopups) {
            const popup = this.levelConfig.eduPopups.find(p => p.wave === this.currentWave + 1);
            if (popup && this.onEduPopup) {
                this.onEduPopup(popup);
            }
        }

        // Build spawn queue
        for (const group of waveConfig.threats) {
            const pathIdx = group.path !== undefined ? group.path : 0;
            for (let i = 0; i < group.count; i++) {
                this.waveSpawnQueue.push({
                    type: group.type,
                    pathIndex: pathIdx,
                    delay: i * group.interval,
                    spawned: false
                });
                this.threatsRemaining++;
            }
        }

        // Sort by delay
        this.waveSpawnQueue.sort((a, b) => a.delay - b.delay);

        this.waveActive = true;
        this.waveStartTime = this.elapsed;
        this.currentWave++;

        if (this.onWaveChange) this.onWaveChange(this.currentWave, this.totalWaves);
        if (this.onNotification) {
            this.onNotification(`Wave ${this.currentWave} / ${this.totalWaves} incoming!`, 'warning');
        }
    }

    spawnThreats() {
        if (!this.waveActive) return;

        const waveTime = this.elapsed - this.waveStartTime;

        for (const spawn of this.waveSpawnQueue) {
            if (spawn.spawned) continue;
            if (waveTime >= spawn.delay) {
                const pathPixels = this.pathPixelSegments[spawn.pathIndex] || this.pathPixelSegments[0];

                // Insider threats spawn partway through the path
                let startWaypoint = 0;
                let path = pathPixels;

                if (THREAT_TYPES[spawn.type].special === 'spawnInside') {
                    // Start from middle of path
                    startWaypoint = Math.floor(pathPixels.length / 2);
                    path = pathPixels.slice(startWaypoint);
                }

                const threat = new Threat(spawn.type, path);
                this.threats.push(threat);
                spawn.spawned = true;
            }
        }

        // Check if all spawned and all dead/reached end
        const allSpawned = this.waveSpawnQueue.every(s => s.spawned);
        if (allSpawned) {
            const activeThreats = this.threats.filter(t => t.alive && !t.reachedEnd);
            if (activeThreats.length === 0) {
                this.waveActive = false;
                this.onWaveComplete();
            }
        }
    }

    onWaveComplete() {
        if (this.currentWave >= this.totalWaves) {
            // Level complete!
            this.state = STATE.LEVEL_COMPLETE;
            if (this.onHideDYK) this.onHideDYK();
            this.onLevelComplete();
        } else {
            // Wave break - trigger quiz and DYK tips
            this.state = STATE.WAVE_BREAK;
            this.waveBreakTimer = WAVE_BREAK_DURATION;
            if (this.onStateChange) this.onStateChange(this.state);
            if (this.onNotification) {
                this.onNotification('Wave cleared! Prepare for next attack.', 'success');
            }

            // Show "Did You Know?" tip
            if (this.onShowDYK) this.onShowDYK();

            // Trigger quiz between waves (every other wave to avoid overload)
            if (this.currentWave % 2 === 0 && this.onQuizRequest) {
                // Small delay so wave-clear notification shows first
                setTimeout(() => {
                    if (this.state === STATE.WAVE_BREAK) {
                        this.onQuizRequest(this.levelConfig.id);
                    }
                }, 1500);
            }
        }
    }

    onLevelComplete() {
        const levelId = this.levelConfig.id;

        // Calculate stars
        const healthPercent = this.getOverallHealth();
        let stars = 1;
        if (healthPercent >= 50) stars = 2;
        if (healthPercent >= 90) stars = 3;

        // Save progress
        if (!this.progress.levelsCompleted.includes(levelId)) {
            this.progress.levelsCompleted.push(levelId);
        }
        this.progress.levelScores[levelId] = Math.max(
            this.progress.levelScores[levelId] || 0,
            this.score
        );
        this.progress.levelStars[levelId] = Math.max(
            this.progress.levelStars[levelId] || 0,
            stars
        );
        this.progress.highScore = Math.max(this.progress.highScore, this.totalScore + this.score);
        this.progress.totalRansomwareKills += this.stats.ransomwareKills;
        this.saveProgress();

        if (this.onStateChange) this.onStateChange(this.state);
    }

    // --- Game Loop ---
    start() {
        if (this.running) return; // Prevent duplicate loops
        this.running = true;
        this.lastTimestamp = performance.now();
        this.animFrameId = requestAnimationFrame(this.gameLoop);
    }

    gameLoop(timestamp) {
        const rawDt = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        // Cap dt to prevent spiral of death
        const dt = Math.min(rawDt, 100) * this.gameSpeed;

        if (this.state === STATE.PLANNING) {
            this.planningTimer -= dt;
            if (this.planningTimer <= 0) {
                this.state = STATE.PLAYING;
                this.startNextWave();
                if (this.onStateChange) this.onStateChange(this.state);
            }
            this.render();
        } else if (this.state === STATE.PLAYING) {
            this.elapsed += dt;
            this.update(dt);
            this.render();
        } else if (this.state === STATE.WAVE_BREAK) {
            this.waveBreakTimer -= dt;
            this.elapsed += dt;
            // Still update towers/projectiles for visual continuity
            this.updateProjectiles(dt);
            this.updateParticles(dt);
            if (this.waveBreakTimer <= 0) {
                this.state = STATE.PLAYING;
                this.startNextWave();
                if (this.onStateChange) this.onStateChange(this.state);
            }
            this.render();
        } else if (this.state === STATE.PAUSED) {
            this.render();
        } else if (this.state === STATE.LEVEL_COMPLETE || this.state === STATE.GAME_OVER) {
            this.render();
        }

        this.animFrameId = requestAnimationFrame(this.gameLoop);
    }

    stop() {
        this.running = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }

    update(dt) {
        // Spawn threats
        this.spawnThreats();

        // Check for global passive effects
        const hasTraining = this.towers.some(t => t.towerType === 'training');

        // Update threats
        for (const threat of this.threats) {
            threat.update(dt);

            // Apply patch management effect: threats in range of patchMgmt take more damage
            // This is handled via tower damage multipliers

            // Check if threat reached end
            if (threat.reachedEnd && threat.alive) {
                this.handleThreatReachEnd(threat, hasTraining);
            }
        }

        // Collect patch management aura towers (boost nearby towers vs zero-days)
        const patchTowers = this.towers.filter(t => t.towerType === 'patchMgmt');

        // Update towers and collect projectiles
        for (const tower of this.towers) {
            const activeThreats = this.threats.filter(t => t.alive && !t.reachedEnd);

            // Patch management is passive - skip its update
            if (tower.towerType === 'patchMgmt') continue;

            // Apply patch management aura: if an active tower is within range of a
            // patchMgmt tower, temporarily boost its zero-day effectiveness by 60%
            let patchBoosted = false;
            if (tower.effectiveness && tower.type === 'active') {
                for (const pm of patchTowers) {
                    const dist = Math.hypot(tower.x - pm.x, tower.y - pm.y);
                    if (dist <= pm.range) {
                        // Temporarily boost zero-day effectiveness
                        const baseEff = tower.effectiveness.zeroDay || 0;
                        tower._origZeroDayEff = baseEff;
                        tower.effectiveness.zeroDay = Math.min(baseEff + 0.6, 2.5);
                        patchBoosted = true;
                        break;
                    }
                }
            }

            const projectile = tower.update(dt, activeThreats);
            if (projectile) {
                this.projectiles.push(projectile);
            }

            // Restore original zero-day effectiveness after attack
            if (patchBoosted && tower._origZeroDayEff !== undefined) {
                tower.effectiveness.zeroDay = tower._origZeroDayEff;
                delete tower._origZeroDayEff;
            }
        }

        // Update projectiles
        this.updateProjectiles(dt);

        // Update assets
        for (const asset of this.assets) {
            asset.update(dt);
        }

        // Update particles
        this.updateParticles(dt);

        // Clean up dead threats and award rewards
        for (const threat of this.threats) {
            if (!threat.alive && threat.reward > 0) {
                this.budget += threat.reward;
                this.score += threat.reward;
                this.stats.moneyEarned += threat.reward;
                this.stats.threatsKilled++;
                if (threat.type === 'ransomware') this.stats.ransomwareKills++;

                // Spawn death particles
                this.spawnDeathParticles(threat.x, threat.y, threat.color);

                threat.reward = 0; // Don't double-count
            }
        }

        // Remove dead threats that have faded
        this.threats = this.threats.filter(t => t.alive || t.reachedEnd);

        // Check loss condition
        this.checkLossCondition();
    }

    handleThreatReachEnd(threat, hasTraining) {
        // Find closest asset
        let closestAsset = null;
        let closestDist = Infinity;

        for (const asset of this.assets) {
            if (asset.compromised) continue;
            const dist = Math.hypot(asset.x - threat.x, asset.y - threat.y);
            if (dist < closestDist) {
                closestDist = dist;
                closestAsset = asset;
            }
        }

        if (closestAsset) {
            const result = closestAsset.takeDamage(threat.damage, threat.type, hasTraining);
            this.stats.damageToAssets += threat.damage;

            if (result === 'ransomware_critical') {
                if (this.onNotification) {
                    this.onNotification('RANSOMWARE: ' + closestAsset.name + ' encrypted! No backup available!', 'danger');
                }
            } else if (result === 'destroyed') {
                if (this.onNotification) {
                    this.onNotification(closestAsset.name + ' compromised!', 'danger');
                }
            }
        }

        threat.alive = false;
        threat.reward = 0;
    }

    checkLossCondition() {
        const allCompromised = this.assets.every(a => a.compromised);
        if (allCompromised) {
            this.state = STATE.GAME_OVER;
            if (this.onStateChange) this.onStateChange(this.state);
        }
    }

    getOverallHealth() {
        if (this.assets.length === 0) return 100;
        const total = this.assets.reduce((sum, a) => sum + a.maxHealth, 0);
        const current = this.assets.reduce((sum, a) => sum + a.health, 0);
        return Math.round((current / total) * 100);
    }

    updateProjectiles(dt) {
        for (const p of this.projectiles) {
            p.update(dt);
        }
        this.projectiles = this.projectiles.filter(p => p.alive);
    }

    // --- Particles ---
    spawnDeathParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * (50 + Math.random() * 50),
                vy: Math.sin(angle) * (50 + Math.random() * 50),
                life: 500,
                maxLife: 500,
                color,
                size: 2 + Math.random() * 2
            });
        }
    }

    updateParticles(dt) {
        for (const p of this.particles) {
            p.x += p.vx * dt / 1000;
            p.y += p.vy * dt / 1000;
            p.life -= dt;
            p.vx *= 0.98;
            p.vy *= 0.98;
        }
        this.particles = this.particles.filter(p => p.life > 0);
    }

    // --- Rendering ---
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.renderGrid(ctx);
        this.renderPaths(ctx);
        this.renderAssets(ctx);
        this.renderPlacementPreview(ctx);
        this.renderTowers(ctx);
        this.renderThreats(ctx);
        this.renderProjectiles(ctx);
        this.renderParticles(ctx);

        // Planning phase overlay
        if (this.state === STATE.PLANNING) {
            this.renderPlanningOverlay(ctx);
        }
    }

    renderGrid(ctx) {
        // Background
        ctx.fillStyle = COLORS.gridBg;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Grid lines
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 0.5;

        for (let x = 0; x <= GRID_COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * CELL_SIZE, 0);
            ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT);
            ctx.stroke();
        }

        for (let y = 0; y <= GRID_ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * CELL_SIZE);
            ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE);
            ctx.stroke();
        }
    }

    renderPaths(ctx) {
        // Fill path cells
        for (const key of this.pathCells) {
            const [x, y] = key.split(',').map(Number);
            ctx.fillStyle = COLORS.pathFill;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = COLORS.pathBorder;
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x * CELL_SIZE + 0.5, y * CELL_SIZE + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
        }

        // Draw path lines connecting waypoints
        for (const pathPixels of this.pathPixelSegments) {
            ctx.strokeStyle = '#00d4ff22';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            ctx.moveTo(pathPixels[0].x, pathPixels[0].y);
            for (let i = 1; i < pathPixels.length; i++) {
                ctx.lineTo(pathPixels[i].x, pathPixels[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Spawn point indicators
        for (const path of this.levelConfig.paths) {
            const spawn = path[0];
            ctx.fillStyle = COLORS.spawnPoint;
            ctx.fillRect(spawn.x * CELL_SIZE, spawn.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = '#ff4757';
            ctx.font = 'bold 10px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('IN', spawn.x * CELL_SIZE + CELL_SIZE / 2, spawn.y * CELL_SIZE + CELL_SIZE / 2);
        }
    }

    renderAssets(ctx) {
        for (const asset of this.assets) {
            asset.render(ctx);
        }
    }

    renderTowers(ctx) {
        for (const tower of this.towers) {
            const showRange = tower === this.selectedTower || tower.selected;
            tower.render(ctx, showRange);
        }
    }

    renderThreats(ctx) {
        for (const threat of this.threats) {
            threat.render(ctx);
        }
    }

    renderProjectiles(ctx) {
        for (const p of this.projectiles) {
            p.render(ctx);
        }
    }

    renderParticles(ctx) {
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    renderPlacementPreview(ctx) {
        if (!this.selectedTowerType || !this.hoveredCell) return;
        if (this.state !== STATE.PLANNING && this.state !== STATE.PLAYING && this.state !== STATE.WAVE_BREAK) return;

        const { x, y } = this.hoveredCell;
        const canPlace = this.canPlaceTower(x, y);

        // Highlight cell
        ctx.fillStyle = canPlace ? COLORS.buildHighlight : COLORS.buildBlocked;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // Range preview
        if (canPlace) {
            const config = TOWER_TYPES[this.selectedTowerType];
            if (config.range > 0) {
                const cx = x * CELL_SIZE + CELL_SIZE / 2;
                const cy = y * CELL_SIZE + CELL_SIZE / 2;
                ctx.fillStyle = COLORS.rangeCircle;
                ctx.strokeStyle = COLORS.rangeBorder;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(cx, cy, config.range, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        // Tower preview icon
        if (canPlace) {
            const config = TOWER_TYPES[this.selectedTowerType];
            const cx = x * CELL_SIZE + CELL_SIZE / 2;
            const cy = y * CELL_SIZE + CELL_SIZE / 2;
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = config.color;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.symbol, cx, cy);
            ctx.globalAlpha = 1;
        }
    }

    renderPlanningOverlay(ctx) {
        // Subtle border pulse
        const pulse = Math.sin(performance.now() * 0.003) * 0.3 + 0.5;
        ctx.strokeStyle = `rgba(0, 212, 255, ${pulse * 0.3})`;
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);
    }

    // --- Input Handling ---
    handleCanvasClick(canvasX, canvasY) {
        const gridX = Math.floor(canvasX / CELL_SIZE);
        const gridY = Math.floor(canvasY / CELL_SIZE);

        if (this.state !== STATE.PLANNING && this.state !== STATE.PLAYING && this.state !== STATE.WAVE_BREAK) return;

        // Check if clicking on an existing tower
        const clickedTower = this.towers.find(t => t.gridX === gridX && t.gridY === gridY);

        if (clickedTower) {
            // Select this tower
            if (this.selectedTower) this.selectedTower.selected = false;
            this.selectedTower = clickedTower;
            clickedTower.selected = true;
            this.selectedTowerType = null;
            if (this.onStateChange) this.onStateChange(this.state);
            return;
        }

        // If we have a tower type selected, try to place
        if (this.selectedTowerType) {
            if (this.placeTower(this.selectedTowerType, gridX, gridY)) {
                // Keep tower type selected for rapid placement
                if (this.onStateChange) this.onStateChange(this.state);
            } else {
                if (this.onNotification) {
                    if (this.budget < TOWER_TYPES[this.selectedTowerType].cost) {
                        this.onNotification('Insufficient budget!', 'danger');
                    } else {
                        this.onNotification('Cannot place here!', 'warning');
                    }
                }
            }
            return;
        }

        // Deselect
        if (this.selectedTower) {
            this.selectedTower.selected = false;
            this.selectedTower = null;
            if (this.onStateChange) this.onStateChange(this.state);
        }
    }

    handleCanvasMouseMove(canvasX, canvasY) {
        this.mouseX = canvasX;
        this.mouseY = canvasY;
        const gridX = Math.floor(canvasX / CELL_SIZE);
        const gridY = Math.floor(canvasY / CELL_SIZE);

        if (gridX >= 0 && gridX < GRID_COLS && gridY >= 0 && gridY < GRID_ROWS) {
            this.hoveredCell = { x: gridX, y: gridY };
        } else {
            this.hoveredCell = null;
        }

        // Check if hovering over a threat (for educational info panel)
        if (this.state === STATE.PLAYING || this.state === STATE.WAVE_BREAK) {
            let hoveredThreat = null;
            for (const threat of this.threats) {
                if (!threat.alive || !threat.visible) continue;
                const dist = Math.hypot(threat.x - canvasX, threat.y - canvasY);
                if (dist <= threat.size + 8) {
                    hoveredThreat = threat;
                    break;
                }
            }
            if (this.onThreatHover) this.onThreatHover(hoveredThreat);
        }
    }

    handleRightClick() {
        // Deselect tower type
        this.selectedTowerType = null;
        if (this.selectedTower) {
            this.selectedTower.selected = false;
            this.selectedTower = null;
        }
        if (this.onStateChange) this.onStateChange(this.state);
    }

    // --- Game Controls ---
    pause(isSystemPause = false) {
        if (this.state === STATE.PLAYING || this.state === STATE.WAVE_BREAK || this.state === STATE.PLANNING) {
            this.previousState = this.state;
            this.state = STATE.PAUSED;
            this._isSystemPause = isSystemPause; // true = paused by quiz/edu, false = paused by user
            if (this.onStateChange) this.onStateChange(this.state);
        }
    }

    resume() {
        if (this.state === STATE.PAUSED) {
            this.state = this.previousState || STATE.PLAYING;
            this._isSystemPause = false;
            if (this.onStateChange) this.onStateChange(this.state);
        }
    }

    toggleSpeed() {
        if (this.gameSpeed === 1) {
            this.gameSpeed = 2;
        } else if (this.gameSpeed === 2) {
            this.gameSpeed = 3;
        } else {
            this.gameSpeed = 1;
        }
        return this.gameSpeed;
    }

    skipPlanning() {
        if (this.state === STATE.PLANNING) {
            this.planningTimer = 0;
        }
    }
}
