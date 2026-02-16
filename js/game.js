// ========================================
// CYBER DEFENSE SIMULATOR - GAME ENGINE
// Core game loop, state management, rendering
// ========================================

import {
    CELL_SIZE, GRID_COLS, GRID_ROWS, CANVAS_WIDTH, CANVAS_HEIGHT,
    CELL, STATE, COLORS, PLANNING_DURATION, WAVE_BREAK_DURATION,
    THREAT_TYPES, TOWER_TYPES, LEVELS, SYNERGIES, getLevelObjectives, getInsiderSpawnPoints
} from './config.js';

import { Tower, Threat, Asset, Projectile } from './entities.js';
import { findPath, findPathRandomized, validateAllPaths, gridPathToPixels, getSpawnPositions, getAssetPositions } from './pathfinding.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        // Pixel-art: no smoothing so scaled pixels stay crisp
        this.ctx.imageSmoothingEnabled = false;

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
        this._ghostPaths = null;  // cached ghost path preview

        // UI callbacks
        this.onStateChange = null;
        this.onNotification = null;
        this.onEduPopup = null;
        this.onWaveChange = null;
        this.onQuizRequest = null;       // Called between waves to trigger quiz
        this.onShowDYK = null;           // Called to show "Did You Know?" tips
        this.onHideDYK = null;           // Called to hide "Did You Know?" tips
        this.onThreatHover = null;       // Called when mouse hovers over a threat
        this.onNextWaveModalRequest = null; // Called before each wave to show threat intel modal
        this.nextWaveModalPending = false; // True when waiting for user to dismiss next-wave modal
        this.prePlanningModalShown = false; // True after we've shown the wave-1 modal before planning (avoid re-showing)
        this.waitingForBreakStart = false;  // True when next-wave modal was shown at wave clear; Begin starts the break timer

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
            quizBonusEarned: 0,
            ransomwareBreachThisLevel: false,
            quizzesCorrectThisLevel: 0
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
        const defaults = {
            levelsCompleted: [],
            levelScores: {},
            levelStars: {},
            highScore: 0,
            achievements: [],
            totalRansomwareKills: 0,
            towersEverUsed: [],
            synergyPairsUsed: [],  // Pairs of tower types used together in a level: ["firewall|ids", ...]
            encyclopediaRead: [],
            budgetRemaining50Achieved: false,  // True if player ever completed a level with ≥50% budget left
            mastery: {} // Per-spec quiz mastery: { D1: { correct, attempted }, ... }
        };
        try {
            const data = localStorage.getItem('cyberDefenseProgress');
            if (data) {
                const parsed = JSON.parse(data);
                // Merge with defaults to add any new fields
                return { ...defaults, ...parsed };
            }
            return defaults;
        } catch {
            return defaults;
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
        this.nextWaveModalPending = false;
        this.prePlanningModalShown = false;
        this.waitingForBreakStart = false;
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
            quizBonusEarned: 0,
            ransomwareBreachThisLevel: false,
            quizzesCorrectThisLevel: 0
        };

        // Build grid
        this.buildGrid();

        // Create assets
        for (const assetConfig of this.levelConfig.assets) {
            const asset = new Asset(assetConfig, assetConfig.x, assetConfig.y);
            this.assets.push(asset);
        }

        // Path pixel segments already built by buildGrid() -> rebuildPaths()

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

        // Trace designed paths between waypoints and mark cells as PATH
        for (const path of this.levelConfig.paths) {
            for (let i = 0; i < path.length - 1; i++) {
                this._tracePathSegment(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
            }
        }

        // Mark spawn cells (overwrites PATH with SPAWN)
        for (const path of this.levelConfig.paths) {
            if (path.length > 0) {
                const spawn = path[0];
                this.grid[spawn.y][spawn.x] = CELL.SPAWN;
            }
        }

        // Mark asset cells (overwrites PATH with ASSET)
        for (const asset of this.levelConfig.assets) {
            this.grid[asset.y][asset.x] = CELL.ASSET;
        }

        // Cache spawn and asset positions for BFS
        this.spawnPositions = getSpawnPositions(this.levelConfig);
        this.assetPositions = getAssetPositions(this.levelConfig);

        // Build spawn-to-asset pairs from path definitions
        // Each path's spawn is paired with the closest asset to its endpoint
        this.spawnAssetPairs = [];
        for (const pathDef of this.levelConfig.paths) {
            if (pathDef.length < 2) continue;
            const spawn = pathDef[0];
            const pathEnd = pathDef[pathDef.length - 1];
            let targetAsset = this.assetPositions[0];
            let minDist = Infinity;
            for (const asset of this.assetPositions) {
                const d = Math.abs(asset.x - pathEnd.x) + Math.abs(asset.y - pathEnd.y);
                if (d < minDist) { minDist = d; targetAsset = asset; }
            }
            this.spawnAssetPairs.push({ spawn: { x: spawn.x, y: spawn.y }, asset: { x: targetAsset.x, y: targetAsset.y } });
        }

        // Build initial BFS paths and mark path cells for rendering
        this.rebuildPaths();
    }

    /**
     * Trace a line between two waypoints on the grid,
     * marking every cell along the way as CELL.PATH.
     */
    _tracePathSegment(x1, y1, x2, y2) {
        // Step one cell at a time from (x1,y1) to (x2,y2)
        let x = x1, y = y1;
        while (x !== x2 || y !== y2) {
            if (this.grid[y][x] === CELL.EMPTY) {
                this.grid[y][x] = CELL.PATH;
            }
            if (x !== x2) x += (x2 > x1) ? 1 : -1;
            else if (y !== y2) y += (y2 > y1) ? 1 : -1;
        }
        // Mark the final cell too
        if (this.grid[y2][x2] === CELL.EMPTY) {
            this.grid[y2][x2] = CELL.PATH;
        }
    }

    /**
     * Rebuild all BFS paths from every spawn to every asset.
     * Updates pathCells and pathPixelSegments for rendering and threat spawning.
     */
    rebuildPaths(recalcThreats = true) {
        this.pathCells = new Set();
        this.pathPixelSegments = [];

        // (Proxy nodes sit on path and inspect - no pathfinding influence)

        // Populate pathCells from the grid itself: every PATH, SPAWN, ASSET cell
        for (let y = 0; y < GRID_ROWS; y++) {
            for (let x = 0; x < GRID_COLS; x++) {
                const c = this.grid[y][x];
                if (c === CELL.PATH || c === CELL.SPAWN || c === CELL.ASSET) {
                    this.pathCells.add(`${x},${y}`);
                }
            }
        }

        // Build pixel segments: one per level path definition.
        // Each path definition has a spawn (first waypoint) and target (last waypoint near an asset).
        this.pathPixelSegments = [];
        for (let i = 0; i < this.levelConfig.paths.length; i++) {
            const pathDef = this.levelConfig.paths[i];
            const spawn = pathDef[0];
            const pathEnd = pathDef[pathDef.length - 1];

            // Find the asset closest to this path's endpoint
            let targetAsset = this.assetPositions[0];
            let minDist = Infinity;
            for (const asset of this.assetPositions) {
                const d = Math.abs(asset.x - pathEnd.x) + Math.abs(asset.y - pathEnd.y);
                if (d < minDist) {
                    minDist = d;
                    targetAsset = asset;
                }
            }

            const gridPath = findPath(this.grid, spawn.x, spawn.y, targetAsset.x, targetAsset.y);
            if (gridPath) {
                this.pathPixelSegments.push(gridPathToPixels(gridPath));
            } else {
                // Fallback: use original waypoints converted to pixels
                this.pathPixelSegments.push(pathDef.map(wp => ({
                    x: wp.x * CELL_SIZE + CELL_SIZE / 2,
                    y: wp.y * CELL_SIZE + CELL_SIZE / 2
                })));
            }
        }

        // Recalculate paths for all living threats (only when walkable grid changed)
        if (recalcThreats) {
            this.recalcThreatPaths();
        }
    }

    /**
     * Recalculate paths for all active threats after a grid change.
     */
    recalcThreatPaths() {
        for (const threat of this.threats) {
            if (!threat.alive || threat.reachedEnd) continue;

            // Find closest grid cell to current position
            const gx = Math.round((threat.x - CELL_SIZE / 2) / CELL_SIZE);
            const gy = Math.round((threat.y - CELL_SIZE / 2) / CELL_SIZE);
            const clampedX = Math.max(0, Math.min(GRID_COLS - 1, gx));
            const clampedY = Math.max(0, Math.min(GRID_ROWS - 1, gy));

            // Find path from current position to nearest asset (randomized for diversity)
            let bestPath = null;
            let bestDist = Infinity;
            for (const asset of this.assetPositions) {
                const gridPath = findPathRandomized(this.grid, clampedX, clampedY, asset.x, asset.y);
                if (gridPath && gridPath.length < bestDist) {
                    bestDist = gridPath.length;
                    bestPath = gridPath;
                }
            }
            if (bestPath) {
                threat.recalculatePath(gridPathToPixels(bestPath));
            }
        }
    }

    // --- Tower Placement ---
    canPlaceTower(gridX, gridY, towerType) {
        if (gridX < 0 || gridX >= GRID_COLS || gridY < 0 || gridY >= GRID_ROWS) return false;

        const cellValue = this.grid[gridY][gridX];

        // Path-placed towers can go on PATH cells
        const isPathPlaced = towerType === 'quarantine' || towerType === 'proxyNode' || towerType === 'segmentation';
        if (isPathPlaced) {
            if (cellValue !== CELL.EMPTY && cellValue !== CELL.PATH) return false;
        } else {
            // Normal towers can only go on EMPTY cells (off-path)
            if (cellValue !== CELL.EMPTY) return false;
        }

        // Check no tower already there
        for (const tower of this.towers) {
            if (tower.gridX === gridX && tower.gridY === gridY) return false;
        }

        // Path-placed towers don't block the path - threats walk through, no validation needed
        if (towerType === 'proxyNode' || towerType === 'segmentation' || towerType === 'quarantine') {
            return true;
        }

        // Normal towers: path validation (temporarily block and check spawn-asset pairs)
        const savedCell = this.grid[gridY][gridX];
        this.grid[gridY][gridX] = CELL.TOWER;
        const valid = validateAllPaths(this.grid, this.spawnAssetPairs);
        this.grid[gridY][gridX] = savedCell;

        return valid;
    }

    placeTower(towerType, gridX, gridY) {
        const config = TOWER_TYPES[towerType];
        if (!config) return false;
        if (this.budget < config.cost) return false;
        if (!this.canPlaceTower(gridX, gridY, towerType)) return false;

        // Check if tower type is available in current level
        if (!this.levelConfig.availableTowers.includes(towerType)) return false;

        const tower = new Tower(towerType, gridX, gridY);
        this.towers.push(tower);
        this.budget -= config.cost;
        this.stats.towersPlaced++;
        this.stats.towersUsedTypes.add(towerType);
        this.stats.moneySpent += config.cost;

        // Save original cell value for restoration on sell
        tower._savedCell = this.grid[gridY][gridX];
        if (towerType === 'proxyNode' || towerType === 'segmentation' || towerType === 'quarantine') {
            // Path-placed towers sit ON the path - cell stays walkable
            this.grid[gridY][gridX] = CELL.PATH;
        } else {
            this.grid[gridY][gridX] = CELL.TOWER;
        }

        // Track tower usage for achievements
        if (!this.progress.towersEverUsed.includes(towerType)) {
            this.progress.towersEverUsed.push(towerType);
            this.saveProgress();
        }

        // Update asset protection status
        this.updateAssetProtection();

        // Rebuild BFS paths - skip threat recalc since no walkable cells changed
        // (normal towers go on EMPTY, path-placed towers keep cells as PATH)
        this.rebuildPaths(false);

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

        const config = TOWER_TYPES[tower.towerType];

        // If selling a quarantine zone, unfreeze all threats frozen by it
        if (tower.towerType === 'quarantine') {
            for (const threat of this.threats) {
                if (threat._quarantineFrozen) {
                    threat._quarantineFrozen = false;
                    delete threat._quarantineFreezeEnd;
                }
            }
        }

        // Restore grid cell to its original value
        this.grid[tower.gridY][tower.gridX] = tower._savedCell !== undefined ? tower._savedCell : CELL.EMPTY;

        this.updateAssetProtection();

        // Rebuild BFS paths - skip threat recalc (selling restores cell, doesn't change walkability)
        this.rebuildPaths(false);

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

    /** Called by UI when user dismisses the "next wave" modal. If before planning (wave 1), unfreeze planning timer. If at start of wave break, start the break timer and DYK/quiz; else start the next wave. */
    dismissNextWaveModal() {
        this.nextWaveModalPending = false;
        if (this.state === STATE.PLANNING && this.currentWave === 0) {
            // Pre-planning modal dismissed — planning timer will now run
            return;
        }
        if (this.state === STATE.WAVE_BREAK && this.waitingForBreakStart) {
            // Modal was shown at wave clear; user clicked Begin — start the break timer and show DYK/quiz
            this.waitingForBreakStart = false;
            this.waveBreakTimer = WAVE_BREAK_DURATION;
            if (this.onShowDYK) this.onShowDYK();
            if (this.currentWave % 2 === 0 && this.onQuizRequest) {
                setTimeout(() => {
                    if (this.state === STATE.WAVE_BREAK) this.onQuizRequest(this.levelConfig.id);
                }, 1500);
            }
            return;
        }
        this.state = STATE.PLAYING;
        this.startNextWave();
        if (this.onStateChange) this.onStateChange(this.state);
    }

    /** Start the next wave (used internally after dismissNextWaveModal when not in planning). */
    beginNextWave() {
        this.nextWaveModalPending = false;
        this.state = STATE.PLAYING;
        this.startNextWave();
        if (this.onStateChange) this.onStateChange(this.state);
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

        // Synergy wave notification
        if (waveConfig.synergy && SYNERGIES[waveConfig.synergy]) {
            const syn = SYNERGIES[waveConfig.synergy];
            if (this.onNotification) {
                this.onNotification(`\u26A0 SYNERGY WAVE: ${syn.name} - ${syn.description}`, 'warning');
            }
        }

        // Build spawn queue (optional waveConfig.hpMult for elite waves)
        const waveHpMult = waveConfig.hpMult != null ? waveConfig.hpMult : 1;
        for (const group of waveConfig.threats) {
            const pathIdx = group.path !== undefined ? group.path : 0;
            for (let i = 0; i < group.count; i++) {
                this.waveSpawnQueue.push({
                    type: group.type,
                    pathIndex: pathIdx,
                    delay: i * group.interval,
                    spawned: false,
                    hpMult: waveHpMult
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
                const isInsider = THREAT_TYPES[spawn.type].special === 'spawnInside';
                let pathPixels;

                if (isInsider) {
                    // Insider: pick one of the level's 5 spawn points at random, path from there to nearest asset
                    const spawnPoints = getInsiderSpawnPoints(this.levelConfig);
                    const pt = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
                    let assetPos = this.assetPositions[0];
                    let minDist = Infinity;
                    for (const asset of this.assetPositions) {
                        const d = Math.abs(asset.x - pt.x) + Math.abs(asset.y - pt.y);
                        if (d < minDist) { minDist = d; assetPos = asset; }
                    }
                    const gridPath = findPathRandomized(this.grid, pt.x, pt.y, assetPos.x, assetPos.y);
                    pathPixels = gridPath ? gridPathToPixels(gridPath) : (this.pathPixelSegments[spawn.pathIndex || 0] || this.pathPixelSegments[0]);
                } else {
                    // Normal threat: spawn at path start, path to asset
                    const pathIdx = spawn.pathIndex || 0;
                    const pathDef = this.levelConfig.paths[pathIdx] || this.levelConfig.paths[0];
                    const spawnPos = pathDef[0];
                    const pathEnd = pathDef[pathDef.length - 1];
                    let assetPos = this.assetPositions[0];
                    let minDist = Infinity;
                    for (const asset of this.assetPositions) {
                        const d = Math.abs(asset.x - pathEnd.x) + Math.abs(asset.y - pathEnd.y);
                        if (d < minDist) { minDist = d; assetPos = asset; }
                    }
                    const gridPath = findPathRandomized(this.grid, spawnPos.x, spawnPos.y, assetPos.x, assetPos.y);
                    pathPixels = gridPath ? gridPathToPixels(gridPath) : (this.pathPixelSegments[pathIdx] || this.pathPixelSegments[0]);
                }

                const threat = new Threat(spawn.type, pathPixels, 0, { hpMult: spawn.hpMult != null ? spawn.hpMult : 1 });
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
            // Show next-wave threat intel modal first (before the break countdown)
            this.state = STATE.WAVE_BREAK;
            this.waveBreakTimer = 0;
            this.waitingForBreakStart = true;
            if (this.onStateChange) this.onStateChange(this.state);
            if (this.onNotification) {
                this.onNotification('Wave cleared!', 'success');
            }
            if (this.onNextWaveModalRequest) {
                this.nextWaveModalPending = true;
                this.onNextWaveModalRequest(this.currentWave, this.levelConfig.waves[this.currentWave]);
            } else {
                this.waitingForBreakStart = false;
                this.waveBreakTimer = WAVE_BREAK_DURATION;
                if (this.onShowDYK) this.onShowDYK();
                if (this.currentWave % 2 === 0 && this.onQuizRequest) {
                    setTimeout(() => {
                        if (this.state === STATE.WAVE_BREAK) this.onQuizRequest(this.levelConfig.id);
                    }, 1500);
                }
            }
        }
    }

    onLevelComplete() {
        const levelId = this.levelConfig.id;

        // Calculate stars from mechanical objectives
        const { stars } = this.getObjectivesResult();

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
        if (this.budget / this.levelConfig.startingBudget >= 0.5) {
            this.progress.budgetRemaining50Achieved = true;
        }
        // Record tower synergies (pairs used together this level)
        if (!this.progress.synergyPairsUsed) this.progress.synergyPairsUsed = [];
        const used = Array.from(this.stats.towersUsedTypes).sort();
        for (let i = 0; i < used.length; i++) {
            for (let j = i + 1; j < used.length; j++) {
                const key = `${used[i]}|${used[j]}`;
                if (!this.progress.synergyPairsUsed.includes(key)) {
                    this.progress.synergyPairsUsed.push(key);
                }
            }
        }
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
            // Show wave-1 intel modal before planning starts (once per level), then freeze timer until dismissed
            if (this.currentWave === 0 && this.onNextWaveModalRequest && !this.prePlanningModalShown) {
                this.prePlanningModalShown = true;
                this.nextWaveModalPending = true;
                this.onNextWaveModalRequest(0, this.levelConfig.waves[0]);
            }
            if (this.nextWaveModalPending) {
                this.render();
                this.animFrameId = requestAnimationFrame(this.gameLoop);
                return;
            }
            this.planningTimer -= dt;
            if (this.planningTimer <= 0) {
                // Wave 1: intel was already shown before planning — start wave
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
            if (this.nextWaveModalPending) {
                // Modal shown at wave clear — wait for user to click Begin; don't run timer yet
                this.updateProjectiles(dt);
                this.updateParticles(dt);
                this.render();
                this.animFrameId = requestAnimationFrame(this.gameLoop);
                return;
            }
            this.waveBreakTimer -= dt;
            this.elapsed += dt;
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

    // --- Synergy System ---
    applySynergies() {
        const activeThreats = this.threats.filter(t => t.alive && !t.reachedEnd);
        if (activeThreats.length === 0) return;

        // Build a set of active threat types
        const activeTypes = new Set(activeThreats.map(t => t.type));

        // Reset all synergy effects before recomputing
        for (const threat of activeThreats) {
            threat.synergyEffects = {};
            threat.synergySpeedMult = 1;
            threat.synergyDamageResist = 0;
            threat.inSegmentationZone = false;
        }

        // Check which threats are inside segmentation tower auras (suppresses synergies)
        const segTowers = this.towers.filter(t => t.towerType === 'segmentation');
        for (const seg of segTowers) {
            const range = seg.range;
            for (const threat of activeThreats) {
                const dist = Math.hypot(threat.x - seg.x, threat.y - seg.y);
                if (dist <= range) {
                    threat.inSegmentationZone = true;
                }
            }
        }

        // --- Credential Breach: phishing present -> ransomware gets speed boost ---
        const credBreach = SYNERGIES.credentialBreach;
        if (credBreach && credBreach.requires.every(t => activeTypes.has(t))) {
            for (const threat of activeThreats) {
                if (threat.type === credBreach.target && !threat.inSegmentationZone) {
                    threat.synergyEffects.credentialBreach = true;
                    threat.synergySpeedMult *= credBreach.speedMultiplier;
                }
            }
        }

        // --- Cover Fire: DDoS protects nearby malware/trojan ---
        const coverFire = SYNERGIES.coverFire;
        if (coverFire && coverFire.requires.some(t => activeTypes.has(t))) {
            const ddosThreats = activeThreats.filter(t => t.type === 'ddos');
            const protectable = activeThreats.filter(t => coverFire.protects.includes(t.type));

            for (const target of protectable) {
                if (target.inSegmentationZone) continue;
                for (const ddos of ddosThreats) {
                    if (ddos.inSegmentationZone) continue;
                    const dist = Math.hypot(target.x - ddos.x, target.y - ddos.y);
                    if (dist <= coverFire.range) {
                        target.synergyEffects.coverFire = true;
                        break; // Only need one DDoS in range
                    }
                }
            }
        }

        // --- Sniffer Buff: sniffer buffs all nearby threats ---
        const snifferBuff = SYNERGIES.snifferBuff;
        if (snifferBuff && activeTypes.has('sniffer')) {
            const sniffers = activeThreats.filter(t => t.type === 'sniffer');
            for (const threat of activeThreats) {
                if (threat.type === 'sniffer') continue; // Sniffers don't buff themselves
                if (threat.inSegmentationZone) continue;

                for (const sniffer of sniffers) {
                    if (sniffer.inSegmentationZone) continue;
                    const dist = Math.hypot(threat.x - sniffer.x, threat.y - sniffer.y);
                    if (dist <= snifferBuff.range) {
                        threat.synergyEffects.snifferBuff = true;
                        threat.synergySpeedMult *= snifferBuff.speedMultiplier;
                        threat.synergyDamageResist = Math.max(threat.synergyDamageResist, snifferBuff.damageResist);
                        break; // Only need one sniffer in range
                    }
                }
            }
        }
    }

    // --- Tower Aura System (Quarantine + Segmentation damage amp) ---
    applyTowerAuras() {
        const activeThreats = this.threats.filter(t => t.alive && !t.reachedEnd);
        if (activeThreats.length === 0) return;

        // Reset aura effects
        for (const threat of activeThreats) {
            threat._damageAmp = 0;
        }

        // Quarantine zones: freeze threats entering the zone (use game-time for speed-consistent expiry)
        const quarantines = this.towers.filter(t => t.towerType === 'quarantine');
        const gameTime = this.elapsed;
        for (const qb of quarantines) {
            const qConfig = TOWER_TYPES.quarantine;
            const freezeDur = qb.upgradeLevel > 0 ?
                (qConfig.upgrades[qb.upgradeLevel - 1].freezeDuration || qConfig.freezeDuration) : qConfig.freezeDuration;
            const range = qb.range;
            // Each quarantine tracks which threats it has already frozen
            if (!qb._frozenThreats) qb._frozenThreats = new Set();

            for (const threat of activeThreats) {
                const dist = Math.hypot(threat.x - qb.x, threat.y - qb.y);
                if (dist <= range) {
                    // Freeze this threat if not already frozen by this quarantine
                    const threatKey = threat.id || `${threat.x},${threat.y}`;
                    if (!qb._frozenThreats.has(threatKey) && !threat._quarantineFrozen) {
                        qb._frozenThreats.add(threatKey);
                        threat._quarantineFrozen = true;
                        threat._quarantineFreezeEnd = gameTime + freezeDur;
                    }
                }
            }
        }

        // Segmentation towers: damage amp + optional slow (Zero-Trust) to threats in range
        const segTowersAura = this.towers.filter(t => t.towerType === 'segmentation');
        for (const seg of segTowersAura) {
            const segConfig = TOWER_TYPES.segmentation;
            const dmgAmp = seg.upgradeLevel > 0 ?
                (segConfig.upgrades[seg.upgradeLevel - 1].damageAmplify || segConfig.damageAmplify) : segConfig.damageAmplify;
            const slowAmt = seg.upgradeLevel > 0 ?
                (segConfig.upgrades[seg.upgradeLevel - 1].slowAmount || 0) : 0;
            const range = seg.range;

            for (const threat of activeThreats) {
                const dist = Math.hypot(threat.x - seg.x, threat.y - seg.y);
                if (dist <= range) {
                    threat._damageAmp = Math.max(threat._damageAmp, dmgAmp);
                    // Zero-Trust upgrade adds a slow effect
                    if (slowAmt > 0) {
                        threat.effects.segmentSlow = {
                            amount: Math.max(threat.effects.segmentSlow?.amount || 0, slowAmt),
                            duration: 100
                        };
                    }
                }
            }
        }

        // Proxy Nodes: scan threats passing through, applying slow + damage amp debuff
        const proxyNodes = this.towers.filter(t => t.towerType === 'proxyNode');
        for (const proxy of proxyNodes) {
            const config = TOWER_TYPES.proxyNode;
            const slowAmt = proxy.upgradeLevel > 0 ?
                (config.upgrades[proxy.upgradeLevel - 1].slowAmount || config.slowAmount) : config.slowAmount;
            const dmgAmp = proxy.upgradeLevel > 0 ?
                (config.upgrades[proxy.upgradeLevel - 1].damageAmplify || config.damageAmplify) : config.damageAmplify;
            const scanDur = proxy.upgradeLevel > 0 ?
                (config.upgrades[proxy.upgradeLevel - 1].scanDuration || config.scanDuration) : config.scanDuration;
            const stripSynergies = proxy.upgradeLevel > 0 &&
                config.upgrades[proxy.upgradeLevel - 1].stripSynergies;
            const range = proxy.range;

            for (const threat of activeThreats) {
                const dist = Math.hypot(threat.x - proxy.x, threat.y - proxy.y);
                if (dist <= range) {
                    // Threat is in proxy range - apply scan and refresh timer (game-time)
                    threat._proxyScanExpiry = gameTime + scanDur;
                    threat._proxySlow = Math.max(threat._proxySlow || 0, slowAmt);
                    threat._proxyDmgAmp = Math.max(threat._proxyDmgAmp || 0, dmgAmp);
                    // Deep Packet Inspection: strip synergy buffs
                    if (stripSynergies) {
                        threat._proxyStripSynergies = true;
                    }
                }
            }
        }

        // Apply proxy scan effects (persists after leaving range for scanDuration)
        for (const threat of activeThreats) {
            if (threat._proxyScanExpiry && gameTime < threat._proxyScanExpiry) {
                // Scan is active - apply slow and damage amp
                threat._damageAmp = Math.max(threat._damageAmp, threat._proxyDmgAmp || 0);
                threat.effects.proxyScan = {
                    amount: threat._proxySlow || 0,
                    duration: 100 // Refreshed each frame while scan is active
                };
                // Mark threat as scanned (for visual indicator)
                threat.synergyEffects.scanned = true;
                // Strip synergies if DPI upgrade active
                if (threat._proxyStripSynergies) {
                    threat.synergySpeedMult = 1;
                    threat.synergyDamageResist = 0;
                    // Remove other synergy buffs but keep scanned marker
                    delete threat.synergyEffects.credentialBreach;
                    delete threat.synergyEffects.coverFire;
                    delete threat.synergyEffects.snifferBuff;
                }
            } else {
                // Scan expired - clean up
                delete threat.effects.proxyScan;
                delete threat._proxyScanExpiry;
                delete threat._proxySlow;
                delete threat._proxyDmgAmp;
                delete threat._proxyStripSynergies;
                delete threat.synergyEffects.scanned;
            }
        }

        // Update quarantine freeze state for all threats
        for (const threat of activeThreats) {
            if (threat._quarantineFrozen && gameTime >= threat._quarantineFreezeEnd) {
                // Freeze expired - unfreeze the threat
                threat._quarantineFrozen = false;
                delete threat._quarantineFreezeEnd;
            }
        }
    }

    update(dt) {
        // Spawn threats
        this.spawnThreats();

        // Apply synergy buffs and tower auras
        this.applySynergies();
        this.applyTowerAuras();

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

            // Skip passive towers from the attack update loop
            if (tower.towerType === 'patchMgmt' || tower.towerType === 'proxyNode' ||
                tower.towerType === 'quarantine' || tower.towerType === 'segmentation') continue;

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
                this.stats.ransomwareBreachThisLevel = true;
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
        // Mission fail if any critical asset is compromised (level-specific fail condition)
        const criticalCompromised = this.assets.find(a => a.critical && a.compromised);
        if (criticalCompromised) {
            this._lastLossReason = 'critical_asset';
            this._lastLossAssetName = criticalCompromised.name;
            this.state = STATE.GAME_OVER;
            if (this.onStateChange) this.onStateChange(this.state);
            return;
        }
        // Otherwise fail only when all assets are compromised
        const allCompromised = this.assets.every(a => a.compromised);
        if (allCompromised) {
            this._lastLossReason = 'all_compromised';
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

    /** Evaluate level objectives; returns { objectives, results, metCount, stars }. */
    getObjectivesResult() {
        if (!this.levelConfig) return { objectives: [], results: [], metCount: 0, stars: 1 };
        const objectives = getLevelObjectives(this.levelConfig);
        const healthPct = this.getOverallHealth();
        const results = objectives.map(obj => {
            if (obj.type === 'noRansomwareBreach') return !this.stats.ransomwareBreachThisLevel;
            if (obj.type === 'healthPercent') return healthPct >= (obj.target || 50);
            if (obj.type === 'quizCorrect') return (this.stats.quizzesCorrectThisLevel || 0) >= (obj.target || 1);
            return false;
        });
        const metCount = results.filter(Boolean).length;
        const total = objectives.length;
        let stars = 1;
        if (metCount >= total) stars = 3;
        else if (metCount >= Math.ceil(total / 2)) stars = 2;
        return { objectives, results, metCount, stars };
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
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.renderGrid(ctx);
        this.renderPaths(ctx);
        this.renderZoneOverlays(ctx);
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

    renderZoneOverlays(ctx) {
        // Quarantine freeze zones
        const quarantines = this.towers.filter(t => t.towerType === 'quarantine');
        const time = Date.now() / 1000;
        for (const qb of quarantines) {
            const pulse = 0.5 + 0.5 * Math.sin(time * 2);

            // Zone fill (amber glow)
            const gradient = ctx.createRadialGradient(qb.x, qb.y, 0, qb.x, qb.y, qb.range);
            gradient.addColorStop(0, `rgba(249, 115, 22, ${0.08 + pulse * 0.04})`);
            gradient.addColorStop(0.6, 'rgba(249, 115, 22, 0.04)');
            gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(qb.x, qb.y, qb.range, 0, Math.PI * 2);
            ctx.fill();

            // Quarantine border (animated dash rotation)
            ctx.save();
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.3 + pulse * 0.15})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = -time * 20;
            ctx.beginPath();
            ctx.arc(qb.x, qb.y, qb.range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // "QUARANTINE" label
            ctx.fillStyle = `rgba(249, 115, 22, ${0.35 + pulse * 0.1})`;
            ctx.font = 'bold 7px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('QUARANTINE', qb.x, qb.y - qb.range - 3);
        }

        // Segmentation zone overlays (radius-based circles)
        const segTowersRender = this.towers.filter(t => t.towerType === 'segmentation');
        for (const seg of segTowersRender) {
            const range = seg.range;
            const time = Date.now() / 1000;

            // Zone fill (semi-transparent indigo)
            ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, range, 0, Math.PI * 2);
            ctx.fill();

            // Inner grid-line pattern (subtle barrier effect)
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
            ctx.lineWidth = 0.5;
            const step = CELL_SIZE;
            const left = seg.x - range;
            const right = seg.x + range;
            const top = seg.y - range;
            const bottom = seg.y + range;
            ctx.save();
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, range, 0, Math.PI * 2);
            ctx.clip();
            for (let gx = Math.floor(left / step) * step; gx <= right; gx += step) {
                ctx.beginPath();
                ctx.moveTo(gx, top);
                ctx.lineTo(gx, bottom);
                ctx.stroke();
            }
            for (let gy = Math.floor(top / step) * step; gy <= bottom; gy += step) {
                ctx.beginPath();
                ctx.moveTo(left, gy);
                ctx.lineTo(right, gy);
                ctx.stroke();
            }
            ctx.restore();

            // Pulsing dashed border
            const pulse = 0.15 + 0.1 * Math.sin(time * 2);
            ctx.strokeStyle = `rgba(99, 102, 241, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // "SEGMENT" label below the zone
            ctx.fillStyle = '#6366f188';
            ctx.font = 'bold 6px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SEGMENT', seg.x, seg.y + range + 8);
        }

        // Proxy Node inspection zone visualization
        const proxyNodes = this.towers.filter(t => t.towerType === 'proxyNode');
        for (const proxy of proxyNodes) {
            const range = proxy.range;
            const time = Date.now() / 1000;

            // Scan zone fill
            ctx.fillStyle = 'rgba(34, 211, 238, 0.06)';
            ctx.beginPath();
            ctx.arc(proxy.x, proxy.y, range, 0, Math.PI * 2);
            ctx.fill();

            // Rotating scan line
            const angle = (time * 2) % (Math.PI * 2);
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(proxy.x, proxy.y);
            ctx.lineTo(proxy.x + Math.cos(angle) * range, proxy.y + Math.sin(angle) * range);
            ctx.stroke();

            // Scan zone border (pulsing)
            const pulse = 0.15 + 0.15 * Math.sin(time * 3);
            ctx.strokeStyle = `rgba(34, 211, 238, ${pulse})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(proxy.x, proxy.y, range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // "PROXY" label
            ctx.fillStyle = '#22d3ee88';
            ctx.font = 'bold 6px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('PROXY', proxy.x, proxy.y + range + 8);
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
        const config = TOWER_TYPES[this.selectedTowerType];
        const canPlace = this.canPlaceTower(x, y, this.selectedTowerType);

        // Standard 1x1 tower preview
        ctx.fillStyle = canPlace ? COLORS.buildHighlight : COLORS.buildBlocked;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // Range preview
        if (canPlace && config.range > 0) {
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

        // Tower preview icon
        if (canPlace) {
            const cx = x * CELL_SIZE + CELL_SIZE / 2;
            const cy = y * CELL_SIZE + CELL_SIZE / 2;
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = config.color;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.symbol, cx, cy);
            ctx.globalAlpha = 1;

            // Ghost path preview: show where threats would route if tower is placed
            this._renderGhostPaths(ctx, x, y, config);
        }
    }

    /**
     * Render ghost path preview showing where threats will route if the
     * tower is placed at the hovered cell.
     */
    _renderGhostPaths(ctx, gridX, gridY, towerConfig) {
        // Compute ghost paths (cached — only recalculated when hover cell changes)
        if (!this._ghostPaths) {
            this._ghostPaths = this._computeGhostPaths(gridX, gridY, towerConfig);
        }

        if (!this._ghostPaths || this._ghostPaths.length === 0) return;

        // Draw each ghost path as a translucent dashed line
        const ghostColors = ['#00d4ff', '#00ff88', '#fbbf24'];
        for (let i = 0; i < this._ghostPaths.length; i++) {
            const gp = this._ghostPaths[i];
            if (gp.length < 2) continue;

            ctx.strokeStyle = ghostColors[i % ghostColors.length] + '55';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(gp[0].x, gp[0].y);
            for (let j = 1; j < gp.length; j++) {
                ctx.lineTo(gp[j].x, gp[j].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // Arrow at end to show direction
            if (gp.length >= 2) {
                const last = gp[gp.length - 1];
                const prev = gp[gp.length - 2];
                const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
                ctx.fillStyle = ghostColors[i % ghostColors.length] + '88';
                ctx.beginPath();
                ctx.moveTo(last.x, last.y);
                ctx.lineTo(last.x - 8 * Math.cos(angle - 0.4), last.y - 8 * Math.sin(angle - 0.4));
                ctx.lineTo(last.x - 8 * Math.cos(angle + 0.4), last.y - 8 * Math.sin(angle + 0.4));
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    /**
     * Temporarily block the hovered cell(s) and run BFS to see what new paths
     * threats would take. Returns array of pixel-waypoint arrays.
     */
    _computeGhostPaths(gridX, gridY, towerConfig) {
        // Save original cell values
        const saved = [];

        if (this.selectedTowerType === 'quarantine' || this.selectedTowerType === 'proxyNode' || this.selectedTowerType === 'segmentation') {
            // Proxy Node / Segmentation Zone don't block - cell stays PATH (no path change)
            saved.push({ x: gridX, y: gridY, orig: this.grid[gridY][gridX] });
            this.grid[gridY][gridX] = CELL.PATH;
        } else {
            saved.push({ x: gridX, y: gridY, orig: this.grid[gridY][gridX] });
            this.grid[gridY][gridX] = CELL.TOWER;
        }

        // Run BFS for each path definition
        const ghostPaths = [];
        for (let i = 0; i < this.levelConfig.paths.length; i++) {
            const pathDef = this.levelConfig.paths[i];
            const spawn = pathDef[0];
            const pathEnd = pathDef[pathDef.length - 1];

            // Find target asset
            let targetAsset = this.assetPositions[0];
            let minDist = Infinity;
            for (const asset of this.assetPositions) {
                const d = Math.abs(asset.x - pathEnd.x) + Math.abs(asset.y - pathEnd.y);
                if (d < minDist) { minDist = d; targetAsset = asset; }
            }

            const gridPath = findPath(this.grid, spawn.x, spawn.y, targetAsset.x, targetAsset.y);
            if (gridPath) {
                ghostPaths.push(gridPathToPixels(gridPath));
            }
        }

        // Restore original grid values
        for (const s of saved) {
            this.grid[s.y][s.x] = s.orig;
        }

        return ghostPaths;
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
        const gridX = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(canvasX / CELL_SIZE)));
        const gridY = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(canvasY / CELL_SIZE)));

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
                this._ghostPaths = null; // Invalidate ghost preview after placement
                if (this.onStateChange) this.onStateChange(this.state);
            } else {
                if (this.onNotification) {
                    const config = TOWER_TYPES[this.selectedTowerType];
                    if (this.budget < config.cost) {
                        this.onNotification('Insufficient budget!', 'danger');
                    } else if (this.grid[gridY] && this.grid[gridY][gridX] === CELL.EMPTY &&
                               !this.canPlaceTower(gridX, gridY, this.selectedTowerType)) {
                        this.onNotification('Cannot place here \u2014 would block all threat paths!', 'warning');
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
        const gridX = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(canvasX / CELL_SIZE)));
        const gridY = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(canvasY / CELL_SIZE)));

        const prevCell = this.hoveredCell;
        if (gridX >= 0 && gridX < GRID_COLS && gridY >= 0 && gridY < GRID_ROWS) {
            this.hoveredCell = { x: gridX, y: gridY };
        } else {
            this.hoveredCell = null;
        }

        // Recompute ghost paths when hovered cell changes while a tower is selected
        const cellChanged = !prevCell || !this.hoveredCell ||
            prevCell.x !== this.hoveredCell?.x || prevCell.y !== this.hoveredCell?.y;
        if (cellChanged) {
            this._ghostPaths = null; // invalidate cache
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

    /** Set game speed (1, 2, or 3). Returns the new speed. */
    setSpeed(speed) {
        this.gameSpeed = Math.max(1, Math.min(3, Math.floor(speed)));
        return this.gameSpeed;
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
