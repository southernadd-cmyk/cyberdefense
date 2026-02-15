// ========================================
// CYBER DEFENSE SIMULATOR - GAME ENTITIES
// Tower, Threat, Asset, Projectile classes
// ========================================

import { CELL_SIZE, CANVAS_WIDTH, THREAT_TYPES, TOWER_TYPES } from './config.js';
import { getTowerImage, getThreatImage, getAssetImage } from './iconImages.js';

// --- Arcade-style icon drawing (pixel/vector shapes) - fallback when SVG not loaded ---
const px = (n) => Math.floor(n);

function drawTowerIcon(ctx, towerType, x, y, color, cellHalf = 14) {
    const h = Math.max(8, cellHalf - 2);
    const w = Math.max(8, cellHalf - 2);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    switch (towerType) {
        case 'firewall': { // shield (rounded top, point bottom)
            ctx.beginPath();
            ctx.moveTo(px(x), px(y - h));
            ctx.lineTo(px(x + w), px(y - h * 0.2));
            ctx.lineTo(px(x + w * 0.6), px(y + h * 0.4));
            ctx.lineTo(px(x), px(y + h));
            ctx.lineTo(px(x - w * 0.6), px(y + h * 0.4));
            ctx.lineTo(px(x - w), px(y - h * 0.2));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }
        case 'antivirus': { // plus/cross (scan)
            const t = 2;
            ctx.fillRect(px(x - t), px(y - h), t * 2, h * 2);
            ctx.fillRect(px(x - w), px(y - t), w * 2, t * 2);
            break;
        }
        case 'emailFilter': { // envelope with V flap
            const ey = px(y - h * 0.4);
            ctx.fillRect(px(x - w), ey, w * 2, px(h * 1.2));
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(px(x - w), ey);
            ctx.lineTo(px(x), px(y + h * 0.4));
            ctx.lineTo(px(x + w), ey);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.moveTo(px(x - w + 2), ey + 2);
            ctx.lineTo(px(x), px(y + h * 0.2));
            ctx.lineTo(px(x + w - 2), ey + 2);
            ctx.closePath();
            ctx.fill();
            break;
        }
        case 'encryption': { // padlock: shackle + body
            const lw = w * 0.5;
            ctx.beginPath();
            ctx.arc(px(x), px(y - h * 0.15), lw, 0, Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.fillRect(px(x - lw * 0.9), px(y), Math.floor(lw * 1.8), Math.floor(h * 0.7));
            ctx.strokeRect(px(x - lw * 0.9), px(y), Math.floor(lw * 1.8), Math.floor(h * 0.7));
            ctx.fillStyle = '#fff';
            ctx.fillRect(px(x - 2), px(y - h * 0.2), 4, 3);
            break;
        }
        case 'ids': { // eye: oval + pupil
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(px(x - w), px(y - 3), w * 2, 6);
            ctx.strokeRect(px(x - w), px(y - 3), w * 2, 6);
            ctx.fillStyle = color;
            ctx.fillRect(px(x - 3), px(y - 2), 6, 4);
            ctx.fillStyle = '#fff';
            ctx.fillRect(px(x - 1), px(y - 1), 2, 2);
            break;
        }
        case 'accessControl': { // key: bow + shaft + teeth
            ctx.fillRect(px(x - w * 1.2), px(y - 2), Math.floor(w * 0.8), 4);
            ctx.fillRect(px(x - w * 0.5), px(y - h * 0.4), 3, Math.floor(h * 1.2));
            ctx.fillRect(px(x - w * 0.5), px(y + h * 0.2), Math.floor(w * 0.6), 3);
            ctx.fillRect(px(x), px(y + h * 0.4), Math.floor(w * 0.4), 3);
            break;
        }
        case 'backup': { // stacked discs
            ctx.fillRect(px(x - w), px(y - h * 0.5), w * 2, 4);
            ctx.fillRect(px(x - w * 0.85), px(y - 2), Math.floor(w * 1.7), 4);
            ctx.fillRect(px(x - w * 0.7), px(y + 4), Math.floor(w * 1.4), 4);
            break;
        }
        case 'training': { // open book
            ctx.fillRect(px(x - w), px(y - h * 0.6), w * 2, Math.floor(h * 1.2));
            ctx.strokeRect(px(x - w), px(y - h * 0.6), w * 2, Math.floor(h * 1.2));
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(px(x), px(y - h * 0.6));
            ctx.lineTo(px(x), px(y + h * 0.6));
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(px(x - w + 2), px(y - h * 0.5), px(w - 2), Math.floor(h));
            break;
        }
        case 'patchMgmt': { // wrench
            ctx.fillRect(px(x - w), px(y - 1), w * 2, 2);
            ctx.fillRect(px(x + w * 0.25), px(y - h * 0.5), 2, Math.floor(h));
            ctx.fillRect(px(x + w * 0.25), px(y - h * 0.5), Math.floor(w * 0.5), 2);
            ctx.fillRect(px(x + w * 0.25), px(y + h * 0.3), Math.floor(w * 0.5), 2);
            break;
        }
        case 'proxyNode': { // diamond (routing node)
            ctx.beginPath();
            ctx.moveTo(px(x), px(y - h));
            ctx.lineTo(px(x + w), px(y));
            ctx.lineTo(px(x), px(y + h));
            ctx.lineTo(px(x - w), px(y));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fillRect(px(x - 2), px(y - 2), 4, 4);
            break;
        }
        case 'quarantine': { // stop sign / containment
            ctx.fillRect(px(x - w * 0.9), px(y - h * 0.7), Math.floor(w * 1.8), Math.floor(h * 1.4));
            ctx.strokeRect(px(x - w * 0.9), px(y - h * 0.7), Math.floor(w * 1.8), Math.floor(h * 1.4));
            ctx.fillStyle = '#fff';
            ctx.fillRect(px(x - 3), px(y - 2), 6, 4);
            break;
        }
        case 'segmentation': { // two segments with gap
            ctx.fillRect(px(x - w), px(y - h * 0.5), Math.floor(w * 0.85), h);
            ctx.fillRect(px(x + 2), px(y - h * 0.5), Math.floor(w * 0.85), h);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(px(x - w + 1), px(y - h * 0.4), Math.floor(w * 0.7), 2);
            ctx.fillRect(px(x + 3), px(y - h * 0.4), Math.floor(w * 0.7), 2);
            break;
        }
        default:
            ctx.fillRect(px(x - w * 0.5), px(y - h * 0.5), w, h);
    }
}

function drawThreatIcon(ctx, threatType, x, y, color, size) {
    const s = Math.max(5, Math.floor(size * 0.45));
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    switch (threatType) {
        case 'phishing': { // envelope with flap
            ctx.fillRect(px(x - s), px(y - s), s * 2, s * 2);
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(px(x - s), px(y - s));
            ctx.lineTo(px(x), px(y + s * 0.2));
            ctx.lineTo(px(x + s), px(y - s));
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fillRect(px(x - s + 1), px(y - s + 1), s * 2 - 2, 3);
            break;
        }
        case 'malware': { // blocky skull: head + eyes + mouth
            ctx.fillRect(px(x - s), px(y - s), s * 2, s * 2);
            ctx.strokeRect(px(x - s), px(y - s), s * 2, s * 2);
            ctx.fillStyle = '#1a1a1a';
            const es = Math.max(2, Math.floor(s * 0.35));
            ctx.fillRect(px(x - s * 0.55), px(y - s * 0.35), es, es);
            ctx.fillRect(px(x + s * 0.2), px(y - s * 0.35), es, es);
            ctx.fillRect(px(x - s * 0.45), px(y + s * 0.25), Math.floor(s * 0.9), Math.max(1, Math.floor(s * 0.2)));
            break;
        }
        case 'ransomware': { // padlock
            ctx.fillRect(px(x - s), px(y + s * 0.2), s * 2, Math.floor(s * 0.8));
            ctx.beginPath();
            ctx.arc(px(x), px(y + s * 0.1), s * 0.55, 0, Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.fillRect(px(x - 2), px(y - s * 0.2), 4, 4);
            break;
        }
        case 'ddos': { // lightning bolt
            ctx.beginPath();
            ctx.moveTo(px(x + s * 0.3), px(y - s));
            ctx.lineTo(px(x - s * 0.8), px(y));
            ctx.lineTo(px(x + s * 0.5), px(y));
            ctx.lineTo(px(x - s * 0.3), px(y + s));
            ctx.lineTo(px(x), px(y + s * 0.3));
            ctx.lineTo(px(x - s * 0.5), px(y));
            ctx.lineTo(px(x + s * 0.3), px(y - s));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }
        case 'sqlInjection': { // gear with teeth
            const g = s * 0.5;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
                const r = i % 2 === 0 ? s : s * 0.7;
                const nx = x + Math.cos(a) * r;
                const ny = y + Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px(nx), px(ny));
                else ctx.lineTo(px(nx), px(ny));
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px(x), px(y), g, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        }
        case 'trojan': { // mask / disguised face
            ctx.fillRect(px(x - s), px(y - s), s * 2, s * 2);
            ctx.fillStyle = '#fff';
            ctx.fillRect(px(x - s * 0.5), px(y - s * 0.3), Math.floor(s * 0.5), 2);
            ctx.fillRect(px(x + 2), px(y - s * 0.3), Math.floor(s * 0.5), 2);
            ctx.fillRect(px(x - s * 0.3), px(y + s * 0.2), Math.floor(s * 0.6), 2);
            break;
        }
        case 'insider': { // stick figure (head + body + arms)
            ctx.fillStyle = '#fff';
            ctx.fillRect(px(x - 1), px(y - s), 2, 2);
            ctx.fillRect(px(x - 1), px(y - s + 4), 2, Math.floor(s * 0.8));
            ctx.beginPath();
            ctx.moveTo(px(x - s * 0.6), px(y - s * 0.5));
            ctx.lineTo(px(x + s * 0.6), px(y - s * 0.5));
            ctx.stroke();
            ctx.fillRect(px(x - 1), px(y + 2), 2, Math.floor(s * 0.6));
            break;
        }
        case 'zeroDay': { // spiky hazard star
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
                const r = i % 2 === 0 ? s : s * 0.45;
                const nx = x + Math.cos(a) * r;
                const ny = y + Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px(nx), px(ny));
                else ctx.lineTo(px(nx), px(ny));
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }
        case 'sniffer': { // eye with pupil
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fillRect(px(x - s), px(y - 2), s * 2, 4);
            ctx.strokeRect(px(x - s), px(y - 2), s * 2, 4);
            ctx.fillStyle = color;
            ctx.fillRect(px(x - s * 0.3), px(y - 1), Math.floor(s * 0.6), 2);
            ctx.fillStyle = '#fff';
            ctx.fillRect(px(x - 1), px(y - 1), 2, 2);
            break;
        }
        default:
            ctx.fillRect(px(x - s), px(y - s), s * 2, s * 2);
    }
}

function drawAssetIcon(ctx, assetType, x, y, color) {
    const s = 10;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    if (assetType === 'database') {
        ctx.fillRect(px(x - s), px(y - s * 0.8), s * 2, Math.floor(s * 0.6));
        ctx.strokeRect(px(x - s), px(y - s * 0.8), s * 2, Math.floor(s * 0.6));
        ctx.fillRect(px(x - s * 0.8), px(y), Math.floor(s * 1.6), Math.floor(s * 0.8));
        ctx.strokeRect(px(x - s * 0.8), px(y), Math.floor(s * 1.6), Math.floor(s * 0.8));
    } else {
        // server: stack of trays
        ctx.fillRect(px(x - s), px(y - s), s * 2, 4);
        ctx.fillRect(px(x - s), px(y - 4), s * 2, 4);
        ctx.fillRect(px(x - s), px(y + 2), s * 2, 4);
    }
}

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

        const px = (x) => Math.floor(x);
        const pw = 2; // trail pixel width

        // Blocky trail (pixel art)
        if (this.trail.length > 1) {
            ctx.fillStyle = this.color + '66';
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                ctx.fillRect(px(t.x) - pw, px(t.y) - pw, pw * 2, pw * 2);
            }
        }

        // Projectile: small pixel block (no blur)
        const s = 3;
        ctx.fillStyle = this.color;
        ctx.fillRect(px(this.x) - s, px(this.y) - s, s * 2, s * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px(this.x) - 1, px(this.y) - 1, 2, 2);
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
        if (this.target && this.target.alive && !this.target.reachedEnd
            && !this.target._quarantineFrozen && this.canTarget(this.target.type)) {
            const dist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
            if (dist <= this.range) return;
        }

        // Find new target: prioritize threats we're most effective against,
        // then by path progress (closest to asset)
        let bestTarget = null;
        let bestScore = -1;

        for (const threat of threats) {
            if (!threat.alive || threat.reachedEnd) continue;
            if (threat._quarantineFrozen) continue; // Frozen threats are in quarantine
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

        // Apply damage amplification from quarantine/segmentation zones
        if (this.target._damageAmp && this.target._damageAmp > 0) {
            damage *= (1 + this.target._damageAmp);
        }

        // Cover Fire synergy: DDoS causes towers to "miss" protected threats
        let missed = false;
        if (this.target.synergyEffects && this.target.synergyEffects.coverFire) {
            if (Math.random() < 0.4) { // 40% miss chance
                missed = true;
            }
        }

        if (!missed) {
            const killed = this.target.takeDamage(damage, this.specialEffect, this.slowAmount);
            this.totalDamage += damage;
            if (killed) this.totalKills++;
        }

        this.cooldownTimer = 1000 / this.attackSpeed;
        this.attackFlash = 150;

        // Projectile color indicates effectiveness: green = strong, yellow = normal, red = weak
        // Missed shots appear faded
        let projColor = this.color;
        if (missed) projColor = '#ffffff33';
        else if (effectiveness >= 1.5) projColor = '#00ff88';
        else if (effectiveness <= 0.3) projColor = '#ff475788';

        return new Projectile(this.x, this.y, this.target.x, this.target.y, projColor);
    }

    render(ctx, showRange) {
        const px = (n) => Math.floor(n);
        const cx = this.x;
        const cy = this.y;
        const halfCell = CELL_SIZE / 2 - 4;

        // Range: pixel-art square outline (no smooth circle)
        if (showRange && this.range > 0) {
            const r = this.range;
            ctx.strokeStyle = this.selected ? '#00d4ff99' : '#00d4ff44';
            ctx.fillStyle = this.selected ? '#00d4ff18' : '#00d4ff0c';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(px(cx - r), px(cy - r), px(r * 2), px(r * 2));
            ctx.fillRect(px(cx - r) + 1, px(cy - r) + 1, px(r * 2) - 2, px(r * 2) - 2);
            ctx.setLineDash([]);
        }

        // Tower base: blocky pixel square with dark outline
        const pulse = Math.sin(this.pulsePhase) * 0.1 + 0.9;
        const size = Math.max(6, Math.floor(halfCell * pulse));
        const left = px(cx - size);
        const top = px(cy - size);
        const w = size * 2;
        const h = size * 2;

        ctx.fillStyle = this.color + '50';
        ctx.fillRect(left, top, w, h);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(left, top, w, h);
        // Pixel highlight (top-left edge)
        ctx.fillStyle = this.color + '99';
        ctx.fillRect(left, top, w, 1);
        ctx.fillRect(left, top, 1, h);

        // Attack flash
        if (this.attackFlash > 0) {
            ctx.fillStyle = this.color + '88';
            ctx.fillRect(left - 2, top - 2, w + 4, h + 4);
        }

        // Tower icon: SVG if available, else inline
        const towerImg = getTowerImage(this.towerType);
        const iconSize = halfCell * 2;
        if (towerImg && towerImg.complete) {
            ctx.drawImage(towerImg, px(cx - iconSize / 2), px(cy - iconSize / 2), iconSize, iconSize);
        } else {
            drawTowerIcon(ctx, this.towerType, cx, cy, this.color, halfCell);
        }

        // Upgrade indicators: small pixel blocks
        if (this.upgradeLevel > 0) {
            const uy = px(cy + halfCell + 2);
            for (let i = 0; i < this.upgradeLevel; i++) {
                ctx.fillStyle = '#fbbf24';
                const ux = px(cx - 8 + i * 8);
                ctx.fillRect(ux, uy, 3, 3);
            }
        }

        // Selection: pixel dashed outline
        if (this.selected) {
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
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
    static _nextId = 1;

    constructor(threatType, path, pathIndex = 0) {
        this.id = Threat._nextId++;
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

        // Synergy state (set per-frame by game.applySynergies)
        this.synergyEffects = {};      // active synergy buffs, e.g. { credentialBreach: true, coverFire: true, snifferBuff: true }
        this.synergySpeedMult = 1;     // speed multiplier from synergies
        this.synergyDamageResist = 0;  // damage resistance from synergies (0-1)
        this.inSegmentationZone = false; // suppresses synergies

        // Trojan: initially looks like safe traffic
        if (this.special === 'disguise') {
            this.visible = false;
            this.revealTimer = 2000; // Reveal after 2 seconds or when damaged
        }
    }

    /**
     * Recalculate path after a grid change.
     * Replaces remaining waypoints while preserving current position.
     * @param {Array<{x:number,y:number}>} newPixelPath - New pixel waypoints from current position to asset
     */
    recalculatePath(newPixelPath) {
        if (!newPixelPath || newPixelPath.length === 0) return;

        // Build new path: current position + new waypoints
        this.path = [{ x: this.x, y: this.y }, ...newPixelPath];
        this.currentWaypoint = 0;
        this.totalPathLength = this.calculatePathLength();
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
        // Quarantine freeze: frozen threats take no damage
        if (this._quarantineFrozen) return false;

        // Apply synergy damage resistance (sniffer buff)
        if (this.synergyDamageResist > 0) {
            amount *= (1 - this.synergyDamageResist);
        }

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

        // Update proxy scan slow
        if (this.effects.proxyScan) {
            this.effects.proxyScan.duration -= dt;
            if (this.effects.proxyScan.duration <= 0) {
                delete this.effects.proxyScan;
            }
        }

        // Update segmentation slow
        if (this.effects.segmentSlow) {
            this.effects.segmentSlow.duration -= dt;
            if (this.effects.segmentSlow.duration <= 0) {
                delete this.effects.segmentSlow;
            }
        }

        // Quarantine freeze: skip all movement while frozen
        if (this._quarantineFrozen) {
            return; // Completely frozen - no movement
        }

        // Calculate speed with effects and synergies
        let currentSpeed = this.baseSpeed * this.synergySpeedMult;
        if (this.effects.slow) {
            currentSpeed *= (1 - this.effects.slow.amount);
        }
        if (this.effects.proxyScan) {
            currentSpeed *= (1 - this.effects.proxyScan.amount);
        }
        if (this.effects.segmentSlow) {
            currentSpeed *= (1 - this.effects.segmentSlow.amount);
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

        const px = (n) => Math.floor(n);
        const cx = this.x;
        const cy = this.y;
        const s = Math.max(4, Math.floor(this.size)); // pixel block size (even for symmetry)
        const left = px(cx - s);
        const top = px(cy - s);
        const w = s * 2;
        const h = s * 2;

        // Disguised trojan: pixel block + arcade "safe" icon
        if (!this.visible) {
            ctx.fillStyle = '#4ade8066';
            ctx.fillRect(left, top, w, h);
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 1;
            ctx.strokeRect(left, top, w, h);
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(px(cx - 2), px(cy - 2), 4, 4);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(px(cx - 2), px(cy - 2), 4, 4);
            return;
        }

        // Slow effect: pixel outline
        if (this.effects.slow) {
            ctx.strokeStyle = '#a855f788';
            ctx.lineWidth = 1;
            ctx.strokeRect(left - 3, top - 3, w + 6, h + 6);
        }

        // Quarantine freeze: pixel frame + label
        if (this._quarantineFrozen) {
            const freezePulse = 0.6 + 0.4 * Math.sin(Date.now() / 200);
            ctx.strokeStyle = `rgba(249, 115, 22, ${freezePulse * 0.9})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(left - 4, top - 4, w + 8, h + 8);
            ctx.fillStyle = `rgba(249, 115, 22, ${0.2})`;
            ctx.fillRect(left - 2, top - 2, w + 4, h + 4);
            ctx.fillStyle = `rgba(249, 115, 22, ${0.8})`;
            ctx.font = 'bold 6px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('FROZEN', px(cx), top - 6);
        }

        // Synergy indicators: small pixel blocks above threat
        if (this.synergyEffects) {
            let iconY = px(cy - s - 6);
            if (this.synergyEffects.credentialBreach) {
                ctx.fillStyle = '#f97316';
                ctx.fillRect(px(cx) - 4, iconY, 4, 4);
                iconY -= 6;
            }
            if (this.synergyEffects.coverFire) {
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(px(cx), iconY, 4, 4);
                iconY -= 6;
            }
            if (this.synergyEffects.snifferBuff) {
                ctx.fillStyle = '#d946ef';
                ctx.fillRect(px(cx) - 2, iconY, 4, 4);
                iconY -= 6;
            }
            if (this.synergyEffects.scanned) {
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 1;
                ctx.strokeRect(px(cx) - 3, iconY, 6, 6);
                iconY -= 6;
            }
            if (this.inSegmentationZone) {
                ctx.strokeStyle = '#6366f1';
                ctx.setLineDash([2, 2]);
                ctx.strokeRect(left - 2, top - 2, w + 4, h + 4);
                ctx.setLineDash([]);
            }
        }

        // Main body: pixel block with highlight
        const flashAlpha = this.damageFlash > 0 ? 'ff' : 'dd';
        ctx.fillStyle = this.color + flashAlpha;
        ctx.fillRect(left, top, w, h);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(left, top, w, h);
        // Top-left pixel highlight
        ctx.fillStyle = this.color + 'cc';
        ctx.fillRect(left, top, w, 1);
        ctx.fillRect(left, top, 1, h);

        // Threat icon: SVG if available, else inline
        const threatImg = getThreatImage(this.type);
        const threatIconSize = s * 2;
        if (threatImg && threatImg.complete) {
            ctx.drawImage(threatImg, px(cx - threatIconSize / 2), px(cy - threatIconSize / 2), threatIconSize, threatIconSize);
        } else {
            drawThreatIcon(ctx, this.type, cx, cy, '#ffffff', s);
        }

        // Health bar (pixel blocks)
        if (this.health < this.maxHealth) {
            const barW = Math.max(16, w + 4);
            const barH = 3;
            const barX = px(cx - barW / 2);
            const barY = px(cy - s - 7);
            const healthPct = this.health / this.maxHealth;

            ctx.fillStyle = '#000000cc';
            ctx.fillRect(barX, barY, barW, barH);
            let barColor = '#00ff88';
            if (healthPct < 0.3) barColor = '#ff4757';
            else if (healthPct < 0.6) barColor = '#fbbf24';
            ctx.fillStyle = barColor;
            ctx.fillRect(barX, barY, Math.max(0, Math.floor(barW * healthPct)), barH);
            ctx.strokeStyle = '#ffffff66';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);
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
        const px = (n) => Math.floor(n);
        const cx = this.x;
        const cy = this.y;
        const size = Math.floor(CELL_SIZE / 2 - 2);

        // Pixel diamond (integer points)
        const bodyColor = this.compromised ? '#ff4757' : (this.damageFlash > 0 ? '#fbbf24' : '#00ff88');
        ctx.fillStyle = bodyColor + '99';
        ctx.beginPath();
        ctx.moveTo(px(cx), px(cy - size));
        ctx.lineTo(px(cx + size), px(cy));
        ctx.lineTo(px(cx), px(cy + size));
        ctx.lineTo(px(cx - size), px(cy));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        // Top edge highlight (pixel style)
        ctx.strokeStyle = bodyColor + 'ee';
        ctx.beginPath();
        ctx.moveTo(px(cx), px(cy - size));
        ctx.lineTo(px(cx + size), px(cy));
        ctx.stroke();

        // Asset icon: SVG if available (by name), else inline
        const assetImg = getAssetImage(this.name);
        const assetIconSize = Math.floor(size * 1.2);
        if (assetImg && assetImg.complete) {
            ctx.drawImage(assetImg, px(cx - assetIconSize / 2), px(cy - assetIconSize / 2), assetIconSize, assetIconSize);
        } else {
            drawAssetIcon(ctx, this.type, cx, cy, bodyColor);
        }

        // Health bar (pixel blocks)
        const barWidth = CELL_SIZE - 8;
        const barHeight = 4;
        const barX = px(cx - barWidth / 2);
        const barY = px(cy + size + 6);
        const healthPct = this.health / this.maxHealth;

        ctx.fillStyle = '#000000cc';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        let barColor = '#00ff88';
        if (healthPct < 0.3) barColor = '#ff4757';
        else if (healthPct < 0.6) barColor = '#fbbf24';
        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, Math.max(0, Math.floor(barWidth * healthPct)), barHeight);
        ctx.strokeStyle = '#ffffff66';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Asset name (clamped so it doesn't overflow right edge)
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 9px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        const maxNameW = CANVAS_WIDTH - 20;
        let label = this.name;
        if (ctx.measureText(label).width > maxNameW) {
            while (label.length > 2 && ctx.measureText(label + '\u2026').width > maxNameW) label = label.slice(0, -1);
            label = label + '\u2026';
        }
        const nameW = ctx.measureText(label).width;
        const pad = 10;
        const textX = Math.max(pad + nameW / 2, Math.min(cx, CANVAS_WIDTH - pad - nameW / 2));
        ctx.fillText(label, textX, barY + barHeight + 12);

        // Protection indicators (arcade: small lock / layers)
        let ix = px(cx) - (this.hasEncryption && this.hasBackup ? 10 : 0);
        if (this.hasEncryption) {
            ctx.fillStyle = '#10b981';
            ctx.fillRect(ix - 3, px(cy - size - 10), 6, 4);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(ix - 3, px(cy - size - 10), 6, 4);
            ctx.fillRect(ix - 2, px(cy - size - 9), 4, 2);
            ix += 14;
        }
        if (this.hasBackup) {
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(ix - 4, px(cy - size - 9), 8, 2);
            ctx.fillRect(ix - 3, px(cy - size - 6), 6, 2);
            ctx.fillRect(ix - 2, px(cy - size - 3), 4, 2);
        }
    }
}
