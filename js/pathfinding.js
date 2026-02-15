// ========================================
// CYBER DEFENSE SIMULATOR - PATHFINDING
// BFS grid pathfinder with path validation
// ========================================

import { CELL_SIZE, GRID_COLS, GRID_ROWS, CELL } from './config.js';

/**
 * BFS pathfinder on a 2D grid.
 * Finds the shortest path from (startX, startY) to (endX, endY).
 *
 * @param {number[][]} grid - 2D grid array (grid[y][x])
 * @param {number} startX - Start grid X
 * @param {number} startY - Start grid Y
 * @param {number} endX   - End grid X
 * @param {number} endY   - End grid Y
 * @param {Set<string>} [attractors] - Set of "x,y" strings for Proxy Node attractor cells (lower cost)
 * @returns {Array<{x:number,y:number}>|null} Array of grid coords, or null if no path
 */
export function findPath(grid, startX, startY, endX, endY, attractors) {
    if (startX === endX && startY === endY) {
        return [{ x: startX, y: startY }];
    }

    // Use weighted BFS (0-1 BFS with deque) when attractors exist
    // Cells adjacent to attractors have cost 0, others cost 1
    // This pulls paths toward Proxy Nodes
    const useWeighted = attractors && attractors.size > 0;

    const visited = new Array(GRID_ROWS);
    const parent = new Array(GRID_ROWS);
    for (let y = 0; y < GRID_ROWS; y++) {
        visited[y] = new Array(GRID_COLS).fill(false);
        parent[y] = new Array(GRID_COLS).fill(null);
    }

    // Check if a cell is walkable for threats (only path/spawn/asset cells)
    const isWalkable = (x, y) => {
        if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
        const cell = grid[y][x];
        return cell === CELL.PATH || cell === CELL.SPAWN || cell === CELL.ASSET;
    };

    if (!isWalkable(startX, startY) || !isWalkable(endX, endY)) return null;

    visited[startY][startX] = true;

    // Directions: up, down, left, right
    const dirs = [
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];

    if (useWeighted) {
        // 0-1 BFS: use deque, attractor-adjacent cells cost 0, others cost 1
        const deque = [{ x: startX, y: startY }];
        let head = 0;

        while (head < deque.length) {
            const curr = deque[head++];

            if (curr.x === endX && curr.y === endY) {
                return reconstructPath(parent, startX, startY, endX, endY);
            }

            for (const d of dirs) {
                const nx = curr.x + d.dx;
                const ny = curr.y + d.dy;
                if (!isWalkable(nx, ny) || visited[ny][nx]) continue;

                visited[ny][nx] = true;
                parent[ny][nx] = { x: curr.x, y: curr.y };

                // Cost 0 if this cell is adjacent to an attractor
                const isAttracted = attractors.has(`${nx},${ny}`);
                if (isAttracted) {
                    deque.splice(head, 0, { x: nx, y: ny }); // push front
                } else {
                    deque.push({ x: nx, y: ny }); // push back
                }
            }
        }
    } else {
        // Standard BFS
        const queue = [{ x: startX, y: startY }];
        let head = 0;

        while (head < queue.length) {
            const curr = queue[head++];

            if (curr.x === endX && curr.y === endY) {
                return reconstructPath(parent, startX, startY, endX, endY);
            }

            for (const d of dirs) {
                const nx = curr.x + d.dx;
                const ny = curr.y + d.dy;
                if (!isWalkable(nx, ny) || visited[ny][nx]) continue;

                visited[ny][nx] = true;
                parent[ny][nx] = { x: curr.x, y: curr.y };
                queue.push({ x: nx, y: ny });
            }
        }
    }

    return null; // No path found
}

/**
 * BFS pathfinder with randomised neighbour order.
 * Returns a shortest path, but picks a random one among equally-short routes.
 * Use for spawning threats so they spread across multiple valid paths.
 *
 * Same signature as findPath except no attractors (not needed for per-threat spawns).
 */
export function findPathRandomized(grid, startX, startY, endX, endY) {
    if (startX === endX && startY === endY) {
        return [{ x: startX, y: startY }];
    }

    const visited = new Array(GRID_ROWS);
    const parent = new Array(GRID_ROWS);
    for (let y = 0; y < GRID_ROWS; y++) {
        visited[y] = new Array(GRID_COLS).fill(false);
        parent[y] = new Array(GRID_COLS).fill(null);
    }

    const isWalkable = (x, y) => {
        if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
        const cell = grid[y][x];
        return cell === CELL.PATH || cell === CELL.SPAWN || cell === CELL.ASSET;
    };

    if (!isWalkable(startX, startY) || !isWalkable(endX, endY)) return null;

    visited[startY][startX] = true;

    // Base directions — shuffled per call to produce different shortest paths
    const dirs = [
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];
    // Fisher-Yates shuffle
    for (let i = dirs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }

    const queue = [{ x: startX, y: startY }];
    let head = 0;

    while (head < queue.length) {
        const curr = queue[head++];

        if (curr.x === endX && curr.y === endY) {
            return reconstructPath(parent, startX, startY, endX, endY);
        }

        for (const d of dirs) {
            const nx = curr.x + d.dx;
            const ny = curr.y + d.dy;
            if (!isWalkable(nx, ny) || visited[ny][nx]) continue;

            visited[ny][nx] = true;
            parent[ny][nx] = { x: curr.x, y: curr.y };
            queue.push({ x: nx, y: ny });
        }
    }

    return null;
}

/**
 * Reconstruct path from BFS parent map.
 */
function reconstructPath(parent, startX, startY, endX, endY) {
    const path = [];
    let cx = endX, cy = endY;

    while (cx !== startX || cy !== startY) {
        path.push({ x: cx, y: cy });
        const p = parent[cy][cx];
        if (!p) return null; // Shouldn't happen
        cx = p.x;
        cy = p.y;
    }
    path.push({ x: startX, y: startY });
    path.reverse();
    return path;
}

/**
 * Validate that all spawn-asset pairs are still connected on the given grid.
 *
 * @param {number[][]} grid
 * @param {Array<{spawn:{x:number,y:number}, asset:{x:number,y:number}}>} pairs - Spawn-asset pairs to validate
 * @returns {boolean} True if every pair is still connected
 */
export function validateAllPaths(grid, pairs) {
    for (const pair of pairs) {
        const path = findPath(grid, pair.spawn.x, pair.spawn.y, pair.asset.x, pair.asset.y);
        if (!path) return false;
    }
    return true;
}

/**
 * Convert a grid path to pixel waypoints for threat movement.
 * Simplifies by only keeping turning points (direction changes).
 *
 * @param {Array<{x:number,y:number}>} gridPath
 * @returns {Array<{x:number,y:number}>} Pixel waypoints
 */
export function gridPathToPixels(gridPath) {
    if (!gridPath || gridPath.length === 0) return [];
    if (gridPath.length === 1) {
        return [{
            x: gridPath[0].x * CELL_SIZE + CELL_SIZE / 2,
            y: gridPath[0].y * CELL_SIZE + CELL_SIZE / 2
        }];
    }

    // Keep start, end, and any point where direction changes
    const simplified = [gridPath[0]];

    for (let i = 1; i < gridPath.length - 1; i++) {
        const prev = gridPath[i - 1];
        const curr = gridPath[i];
        const next = gridPath[i + 1];
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;

        // Keep if direction changes
        if (dx1 !== dx2 || dy1 !== dy2) {
            simplified.push(curr);
        }
    }
    simplified.push(gridPath[gridPath.length - 1]);

    return simplified.map(p => ({
        x: p.x * CELL_SIZE + CELL_SIZE / 2,
        y: p.y * CELL_SIZE + CELL_SIZE / 2
    }));
}

/**
 * Get all spawn positions from level config paths.
 * @param {object} levelConfig
 * @returns {Array<{x:number,y:number}>}
 */
export function getSpawnPositions(levelConfig) {
    const spawns = [];
    const seen = new Set();
    for (const path of levelConfig.paths) {
        if (path.length > 0) {
            const key = `${path[0].x},${path[0].y}`;
            if (!seen.has(key)) {
                spawns.push({ x: path[0].x, y: path[0].y });
                seen.add(key);
            }
        }
    }
    return spawns;
}

/**
 * Get all asset positions from level config.
 * @param {object} levelConfig
 * @returns {Array<{x:number,y:number}>}
 */
export function getAssetPositions(levelConfig) {
    return levelConfig.assets.map(a => ({ x: a.x, y: a.y }));
}
