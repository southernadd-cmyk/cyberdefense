// ========================================
// CYBER DEFENSE SIMULATOR - GAME ENTITIES
// Tower, Threat, Asset, Projectile classes
// ========================================

import { CELL_SIZE, THREAT_TYPES, TOWER_TYPES } from './config.js';

// ---- Projectile (visual effect) ----
export class Projectile {
    constructor(fromX, fromY, toX, toY, color) {
        this.x = fromX;
        this.y = fromY;
        this.targetX = toX;
        this.targetY = toY;
        this.color = color || '#00d4ff';
        this.speed = 600; // pixels per second
        this.alive = true;
        this.trail = [];
    }

    update(dt) {
        if (!this.alive) return;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);
        const move = this.speed * dt / 1000;

        // Save trail position
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();

        if (dist <= move) {
            this.alive = false;
        } else {
            this.x += (dx / dist) * move;
            this.y += (dy / dist) * move;
        }
    }

    render(ctx) {
        if (!this.alive) return;

        // Draw trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.color + '44';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        }

        // Draw projectile
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ---- Tower ----
export class Tower {
    constructor(towerType, gridX, gridY) {
        this.towerType = towerType;
        const config = TOWER_TYPES[towerType];
        this.gridX = gridX;
        this.gridY = gridY;
        this.x = gridX * CELL_SIZE + CELL_SIZE / 2;
        this.y = gridY * CELL_SIZE + CELL_SIZE / 2;

        // Copy base stats
        this.name = config.name;
        this.cost = config.cost;
        this.range = config.range;
        this.damage = config.damage;
        this.attackSpeed = config.attackSpeed;
        this.color = config.color;
        this.symbol = config.symbol;
        this.type = config.type;
        this.description = config.description;
        this.effectiveness = config.effectiveness || null; // NEW: threat-specific damage multipliers
        this.specialEffect = config.specialEffect || null;
        this.slowAmount = config.slowAmount || 0;
        this.protectionAmount = config.protectionAmount || 0;
        this.reductionAmount = config.reductionAmount || 0;

        // State
        this.upgradeLevel = 0;
        this.maxUpgradeLevel = config.upgrades ? config.upgrades.length : 0;
        this.target = null;
        this.cooldownTimer = 0;
        this.totalKills = 0;
        this.totalDamage = 0;
        this.totalSpent = config.cost;
        this.selected = false;

        // Animation
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.attackFlash = 0;
    }

    getUpgradeCost() {
        const config = TOWER_TYPES[this.towerType];
        if (this.upgradeLevel >= this.maxUpgradeLevel) return null;
        return config.upgrades[this.upgradeLevel].cost;
    }

    getUpgradeName() {
        const config = TOWER_TYPES[this.towerType];
        if (this.upgradeLevel >= this.maxUpgradeLevel) return null;
        return config.upgrades[this.upgradeLevel].name;
    }

    upgrade() {
        const config = TOWER_TYPES[this.towerType];
        if (this.upgradeLevel >= this.maxUpgradeLevel) return false;

        const upg = config.upgrades[this.upgradeLevel];
        if (upg.damage !== undefined) this.damage = upg.damage;
        if (upg.range !== undefined) this.range = upg.range;
        if (upg.slowAmount !== undefined) this.slowAmount = upg.slowAmount;
        if (upg.protectionAmount !== undefined) this.protectionAmount = upg.protectionAmount;
        if (upg.reductionAmount !== undefined) this.reductionAmount = upg.reductionAmount;

        this.totalSpent += upg.cost;
        this.upgradeLevel++;
        return true;
    }

    getSellValue() {
        return Math.floor(this.totalSpent * 0.6);
    }

    getEffectiveness(threatType) {
        // Returns the damage multiplier for this tower against a threat type
        if (!this.effectiveness) return 1.0; // No effectiveness map = standard damage
        const eff = this.effectiveness[threatType];
        return (eff !== undefined) ? eff : 0; // Unknown threat type = no damage
    }

    canTarget(threatType) {
        // Tower can only target threats it has > 0 effectiveness against
        return this.getEffectiveness(threatType) > 0;
    }

    findTarget(threats) {
        // If current target is still valid AND we can still damage it, keep it
        if (this.target && this.target.alive && !this.target.reachedEnd && this.canTarget(this.target.type)) {
            const dist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
            if (dist <= this.range) return;
        }

        // Find new target: prioritize threats we're most effective against,
        // then by path progress (closest to asset)
        let bestTarget = null;
        let bestScore = -1;

        for (const threat of threats) {
            if (!threat.alive || threat.reachedEnd) continue;
            if (!this.canTarget(threat.type)) continue; // Skip threats we can't damage

            const dist = Math.hypot(threat.x - this.x, threat.y - this.y);
            if (dist <= this.range) {
                // Score = effectiveness * 0.3 + pathProgress * 0.7
                // This makes towers prefer their specialist targets but still prioritize
                // threats close to the asset
                const eff = this.getEffectiveness(threat.type);
                const score = (eff / 2.5) * 0.3 + threat.pathProgress * 0.7;
                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = threat;
                }
            }
        }

        this.target = bestTarget;
    }

    update(dt, threats) {
        this.pulsePhase += dt * 0.003;
        if (this.attackFlash > 0) this.attackFlash -= dt;

        // Passive towers don't attack
        if (this.type === 'passive') return null;

        this.cooldownTimer -= dt;
        if (this.cooldownTimer > 0) return null;

        this.findTarget(threats);

        if (this.target && this.target.alive) {
            return this.attack();
        }

        return null;
    }

    attack() {
        if (!this.target || !this.target.alive) return null;

        // Calculate damage using effectiveness system
        const effectiveness = this.getEffectiveness(this.target.type);
        if (effectiveness <= 0) return null; // Can't damage this threat type

        let damage = this.damage * effectiveness;

        const killed = this.target.takeDamage(damage, this.specialEffect, this.slowAmount);
        this.totalDamage += damage;
        if (killed) this.totalKills++;

        this.cooldownTimer = 1000 / this.attackSpeed;
        this.attackFlash = 150;

        // Projectile color indicates effectiveness: green = strong, yellow = normal, red = weak
        let projColor = this.color;
        if (effectiveness >= 1.5) projColor = '#00ff88';
        else if (effectiveness <= 0.3) projColor = '#ff475788';

        return new Projectile(this.x, this.y, this.target.x, this.target.y, projColor);
    }

    render(ctx, showRange) {
        const cx = this.x;
        const cy = this.y;
        const halfCell = CELL_SIZE / 2 - 4;

        // Range circle
        if (showRange && this.range > 0) {
            ctx.strokeStyle = this.selected ? '#00d4ff66' : '#00d4ff22';
            ctx.fillStyle = this.selected ? '#00d4ff11' : '#00d4ff08';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, this.range, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Tower base
        const pulse = Math.sin(this.pulsePhase) * 0.1 + 0.9;
        const flash = this.attackFlash > 0 ? 0.3 : 0;

        ctx.fillStyle = this.color + '30';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.selected ? 2.5 : 1.5;

        // Draw rounded square
        const r = 6;
        const size = halfCell * pulse;
        ctx.beginPath();
        ctx.moveTo(cx - size + r, cy - size);
        ctx.lineTo(cx + size - r, cy - size);
        ctx.quadraticCurveTo(cx + size, cy - size, cx + size, cy - size + r);
        ctx.lineTo(cx + size, cy + size - r);
        ctx.quadraticCurveTo(cx + size, cy + size, cx + size - r, cy + size);
        ctx.lineTo(cx - size + r, cy + size);
        ctx.quadraticCurveTo(cx - size, cy + size, cx - size, cy + size - r);
        ctx.lineTo(cx - size, cy - size + r);
        ctx.quadraticCurveTo(cx - size, cy - size, cx - size + r, cy - size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Attack flash
        if (flash > 0) {
            ctx.fillStyle = this.color + '55';
            ctx.beginPath();
            ctx.arc(cx, cy, halfCell + 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Tower symbol
        ctx.fillStyle = this.color;
        ctx.font = `${16}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, cx, cy);

        // Upgrade indicators
        if (this.upgradeLevel > 0) {
            for (let i = 0; i < this.upgradeLevel; i++) {
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.arc(cx - 8 + i * 8, cy + halfCell + 4, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Selection highlight
        if (this.selected) {
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(
                this.gridX * CELL_SIZE + 1,
                this.gridY * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
            );
            ctx.setLineDash([]);
        }
    }
}

// ---- Threat ----
export class Threat {
    constructor(threatType, path, pathIndex = 0) {
        this.type = threatType;
        const config = THREAT_TYPES[threatType];

        this.name = config.name;
        this.health = config.health;
        this.maxHealth = config.health;
        this.baseSpeed = config.speed;
        this.speed = config.speed;
        this.damage = config.damage;
        this.reward = config.reward;
        this.color = config.color;
        this.symbol = config.symbol;
        this.size = config.size;
        this.special = config.special;
        this.resistances = config.resistances ? { ...config.resistances } : {};

        // Path following
        this.path = path; // Array of {x, y} pixel positions
        this.currentWaypoint = pathIndex || 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.pathProgress = 0; // How far along the total path (0 to 1)
        this.totalPathLength = this.calculatePathLength();

        // State
        this.alive = true;
        this.reachedEnd = false;
        this.visible = true; // For trojan disguise
        this.revealTimer = 0;

        // Effects
        this.effects = {};
        this.damageFlash = 0;

        // Trojan: initially looks like safe traffic
        if (this.special === 'disguise') {
            this.visible = false;
            this.revealTimer = 2000; // Reveal after 2 seconds or when damaged
        }
    }

    calculatePathLength() {
        let len = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            len += Math.hypot(
                this.path[i + 1].x - this.path[i].x,
                this.path[i + 1].y - this.path[i].y
            );
        }
        return len || 1;
    }

    takeDamage(amount, effect, effectAmount) {
        // Apply resistances
        if (effect && this.resistances[effect]) {
            amount *= (1 - this.resistances[effect]);
        }

        this.health -= amount;
        this.damageFlash = 100;

        // Reveal trojans when damaged
        if (!this.visible) this.visible = true;

        // Apply slow effect
        if (effect === 'slow' && effectAmount) {
            this.effects.slow = {
                amount: effectAmount,
                duration: 2000
            };
        }

        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            return true; // killed
        }
        return false;
    }

    update(dt) {
        if (!this.alive || this.reachedEnd) return;

        // Update effects
        if (this.effects.slow) {
            this.effects.slow.duration -= dt;
            if (this.effects.slow.duration <= 0) {
                delete this.effects.slow;
            }
        }

        // Trojan reveal timer
        if (!this.visible) {
            this.revealTimer -= dt;
            if (this.revealTimer <= 0) this.visible = true;
        }

        // Damage flash
        if (this.damageFlash > 0) this.damageFlash -= dt;

        // Calculate speed with effects
        let currentSpeed = this.baseSpeed;
        if (this.effects.slow) {
            currentSpeed *= (1 - this.effects.slow.amount);
        }

        // Move toward next waypoint
        const target = this.path[this.currentWaypoint + 1];
        if (!target) {
            this.reachedEnd = true;
            return;
        }

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        const moveAmount = currentSpeed * dt / 1000;

        if (dist <= moveAmount) {
            this.x = target.x;
            this.y = target.y;
            this.currentWaypoint++;

            if (this.currentWaypoint >= this.path.length - 1) {
                this.reachedEnd = true;
            }
        } else {
            this.x += (dx / dist) * moveAmount;
            this.y += (dy / dist) * moveAmount;
        }

        // Update path progress
        let traveled = 0;
        for (let i = 0; i < this.currentWaypoint && i < this.path.length - 1; i++) {
            traveled += Math.hypot(
                this.path[i + 1].x - this.path[i].x,
                this.path[i + 1].y - this.path[i].y
            );
        }
        if (this.currentWaypoint < this.path.length - 1) {
            traveled += Math.hypot(
                this.x - this.path[this.currentWaypoint].x,
                this.y - this.path[this.currentWaypoint].y
            );
        }
        this.pathProgress = traveled / this.totalPathLength;
    }

    render(ctx) {
        if (!this.alive) return;

        const cx = this.x;
        const cy = this.y;

        // Disguised trojan appearance
        if (!this.visible) {
            ctx.fillStyle = '#4ade8044';
            ctx.beginPath();
            ctx.arc(cx, cy, this.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4ade80';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\u2714', cx, cy);
            return;
        }

        // Slow effect indicator
        if (this.effects.slow) {
            ctx.strokeStyle = '#a855f744';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, this.size + 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Main body
        const flashAlpha = this.damageFlash > 0 ? 'ff' : 'cc';
        ctx.fillStyle = this.color + flashAlpha;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.damageFlash > 0 ? 12 : 4;
        ctx.beginPath();
        ctx.arc(cx, cy, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner glow
        ctx.fillStyle = this.color + '33';
        ctx.beginPath();
        ctx.arc(cx, cy, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(10, this.size - 2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, cx, cy);

        // Health bar (only if damaged)
        if (this.health < this.maxHealth) {
            const barWidth = this.size * 2 + 4;
            const barHeight = 3;
            const barX = cx - barWidth / 2;
            const barY = cy - this.size - 8;
            const healthPct = this.health / this.maxHealth;

            // Background
            ctx.fillStyle = '#00000088';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Health fill
            let barColor = '#00ff88';
            if (healthPct < 0.3) barColor = '#ff4757';
            else if (healthPct < 0.6) barColor = '#fbbf24';

            ctx.fillStyle = barColor;
            ctx.fillRect(barX, barY, barWidth * healthPct, barHeight);

            // Border
            ctx.strokeStyle = '#ffffff44';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
    }
}

// ---- Asset ----
export class Asset {
    constructor(config, gridX, gridY) {
        this.name = config.name;
        this.type = config.type;
        this.gridX = gridX;
        this.gridY = gridY;
        this.x = gridX * CELL_SIZE + CELL_SIZE / 2;
        this.y = gridY * CELL_SIZE + CELL_SIZE / 2;
        this.health = config.health;
        this.maxHealth = config.health;
        this.compromised = false;
        this.hasBackup = false;
        this.hasEncryption = false;
        this.encryptionReduction = 0;
        this.damageFlash = 0;
    }

    takeDamage(amount, threatType, hasTrainingTower) {
        // Encryption reduces damage
        if (this.hasEncryption) {
            amount *= (1 - this.encryptionReduction);
        }

        // Training reduces social engineering damage
        if (hasTrainingTower && (threatType === 'phishing' || threatType === 'trojan')) {
            amount *= 0.3; // 70% reduction
        }

        // Ransomware special: instant critical unless backup exists
        if (threatType === 'ransomware') {
            if (!this.hasBackup) {
                this.health = 0;
                this.compromised = true;
                return 'ransomware_critical';
            } else {
                // Backup allows recovery - still takes some damage
                amount = Math.min(amount, 20);
            }
        }

        // SQL injection does extra damage to databases
        if (threatType === 'sqlInjection' && this.type === 'database') {
            amount *= 2;
        }

        this.health -= amount;
        this.damageFlash = 200;

        if (this.health <= 0) {
            this.health = 0;
            this.compromised = true;
            return 'destroyed';
        }

        return 'damaged';
    }

    update(dt) {
        if (this.damageFlash > 0) this.damageFlash -= dt;
    }

    render(ctx) {
        const cx = this.x;
        const cy = this.y;
        const size = CELL_SIZE / 2 - 2;

        // Background glow
        const glowColor = this.compromised ? '#ff475733' : '#00ff8833';
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(cx, cy, size + 6, 0, Math.PI * 2);
        ctx.fill();

        // Asset body
        const bodyColor = this.compromised ? '#ff4757' : (this.damageFlash > 0 ? '#fbbf24' : '#00ff88');
        ctx.fillStyle = bodyColor + '44';
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 2;

        // Draw diamond shape for assets
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + size, cy);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx - size, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Asset icon
        const icon = this.type === 'database' ? '\uD83D\uDDC4' : '\uD83D\uDDA5';
        ctx.fillStyle = bodyColor;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, cx, cy);

        // Health bar
        const barWidth = CELL_SIZE - 8;
        const barHeight = 4;
        const barX = cx - barWidth / 2;
        const barY = cy + size + 8;
        const healthPct = this.health / this.maxHealth;

        ctx.fillStyle = '#00000088';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        let barColor = '#00ff88';
        if (healthPct < 0.3) barColor = '#ff4757';
        else if (healthPct < 0.6) barColor = '#fbbf24';

        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, barWidth * healthPct, barHeight);

        ctx.strokeStyle = '#ffffff44';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Asset name
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 9px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, cx, barY + barHeight + 12);

        // Protection indicators
        let indicators = [];
        if (this.hasEncryption) indicators.push({ text: '\uD83D\uDD12', color: '#10b981' });
        if (this.hasBackup) indicators.push({ text: '\uD83D\uDCBE', color: '#06b6d4' });

        indicators.forEach((ind, i) => {
            ctx.fillStyle = ind.color;
            ctx.font = '10px Arial';
            ctx.fillText(ind.text, cx - 10 + i * 20, cy - size - 8);
        });
    }
}
