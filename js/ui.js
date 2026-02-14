// ========================================
// CYBER DEFENSE SIMULATOR - UI MANAGER
// Handles all DOM-based UI interactions
// Including educational systems: quiz, knowledge tracker, case studies
// ========================================

import {
    STATE, TOWER_TYPES, THREAT_TYPES, LEVELS, ACHIEVEMENTS, ENCYCLOPEDIA,
    QUIZ_QUESTIONS, CASE_STUDIES, DID_YOU_KNOW_TIPS, SPEC_TOPICS, THREAT_COUNTERS
} from './config.js';

export class UIManager {
    constructor(game) {
        this.game = game;

        // Cache DOM elements
        this.screens = {
            mainMenu: document.getElementById('main-menu'),
            levelSelect: document.getElementById('level-select'),
            gameScreen: document.getElementById('game-screen'),
            encyclopedia: document.getElementById('encyclopedia-screen'),
            achievements: document.getElementById('achievements-screen'),
            knowledge: document.getElementById('knowledge-screen'),
            intel: document.getElementById('intel-screen')
        };

        this.modals = {
            levelIntro: document.getElementById('level-intro'),
            levelComplete: document.getElementById('level-complete'),
            gameOver: document.getElementById('game-over'),
            pause: document.getElementById('pause-modal'),
            eduPopup: document.getElementById('edu-popup'),
            quiz: document.getElementById('quiz-modal')
        };

        this.hud = {
            budget: document.getElementById('hud-budget'),
            wave: document.getElementById('hud-wave'),
            score: document.getElementById('hud-score'),
            healthBar: document.getElementById('hud-health-bar'),
            phase: document.getElementById('hud-phase'),
            timer: document.getElementById('hud-timer')
        };

        this.elements = {
            towerList: document.getElementById('tower-list'),
            towerInfoPanel: document.getElementById('tower-info-panel'),
            towerInfoName: document.getElementById('tower-info-name'),
            towerInfoStats: document.getElementById('tower-info-stats'),
            levelGrid: document.getElementById('level-grid'),
            notifications: document.getElementById('notifications'),
            tooltip: document.getElementById('tooltip'),
            encyclopediaNav: document.getElementById('encyclopedia-nav'),
            encyclopediaContent: document.getElementById('encyclopedia-content'),
            achievementsGrid: document.getElementById('achievements-grid'),
            knowledgeContainer: document.getElementById('knowledge-container'),
            threatInfoPanel: document.getElementById('threat-info-panel'),
            didYouKnow: document.getElementById('did-you-know'),
            dykText: document.getElementById('dyk-text'),
            dykSpec: document.getElementById('dyk-spec')
        };

        this.activeNotifications = [];
        this.hudUpdateInterval = null;

        // Quiz state
        this.currentQuiz = null;
        this.quizAnswered = false;
        this.quizCallback = null;
        this.usedQuizQuestions = new Set();

        // Did You Know state
        this.dykIndex = 0;
        this.dykInterval = null;
        this.shownTips = new Set();

        // Threat info state
        this.hoveredThreat = null;
    }

    // --- Screen Management ---
    showScreen(screenName) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }

    showModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.remove('hidden');
        }
    }

    hideModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.add('hidden');
        }
    }

    hideAllModals() {
        Object.values(this.modals).forEach(m => m.classList.add('hidden'));
    }

    // --- Main Menu ---
    showMainMenu() {
        this.showScreen('mainMenu');
        this.hideAllModals();
        this.stopHudUpdates();
        this.hideDYK();
    }

    // --- Level Select ---
    showLevelSelect() {
        this.showScreen('levelSelect');
        this.renderLevelGrid();
    }

    renderLevelGrid() {
        const grid = this.elements.levelGrid;
        grid.innerHTML = '';

        LEVELS.forEach((level, index) => {
            const isUnlocked = index === 0 || this.game.progress.levelsCompleted.includes(index);
            const isCompleted = this.game.progress.levelsCompleted.includes(level.id);
            const stars = this.game.progress.levelStars[level.id] || 0;
            const score = this.game.progress.levelScores[level.id] || 0;

            const card = document.createElement('div');
            card.className = `level-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`;

            card.innerHTML = `
                <div class="level-number">MISSION ${level.id}</div>
                <div class="level-name">${level.name}</div>
                <div class="level-desc">${level.description}</div>
                <div class="level-difficulty">
                    ${Array.from({ length: 6 }, (_, i) =>
                        `<div class="diff-dot ${i < level.difficulty ? 'active' : ''}"></div>`
                    ).join('')}
                </div>
                ${isCompleted ? `
                    <div class="level-stars">${'\u2605'.repeat(stars)}${'\u2606'.repeat(3 - stars)}</div>
                    <div style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">Best: \u00A3${score}</div>
                ` : ''}
                ${!isUnlocked ? '<div style="font-size:0.75rem;color:#64748b;margin-top:8px;">Complete previous mission to unlock</div>' : ''}
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.game.loadLevel(index);
                    this.showGameScreen();
                    this.showLevelIntro(level);
                });
            }

            grid.appendChild(card);
        });
    }

    // --- Game Screen ---
    showGameScreen() {
        this.showScreen('gameScreen');
        this.renderTowerSidebar();
        this.startHudUpdates();
    }

    renderTowerSidebar() {
        const list = this.elements.towerList;
        list.innerHTML = '';

        if (!this.game.levelConfig) return;

        for (const towerKey of this.game.levelConfig.availableTowers) {
            const config = TOWER_TYPES[towerKey];
            if (!config) continue;

            const card = document.createElement('div');
            card.className = 'tower-card';
            card.dataset.towerType = towerKey;

            card.innerHTML = `
                <div class="tower-card-header">
                    <div class="tower-icon" style="background:${config.bgColor};color:${config.color};">
                        ${config.symbol}
                    </div>
                    <div>
                        <div class="tower-card-name">${config.name}</div>
                        <div class="tower-card-cost">\u00A3${config.cost}</div>
                    </div>
                </div>
                <div class="tower-card-desc">${config.shortDesc}</div>
            `;

            card.addEventListener('click', () => {
                this.selectTowerType(towerKey);
            });

            card.addEventListener('mouseenter', (e) => {
                this.showTowerTooltip(towerKey, e);
            });

            card.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            list.appendChild(card);
        }
    }

    selectTowerType(towerKey) {
        if (this.game.selectedTower) {
            this.game.selectedTower.selected = false;
            this.game.selectedTower = null;
        }

        if (this.game.selectedTowerType === towerKey) {
            this.game.selectedTowerType = null;
        } else {
            this.game.selectedTowerType = towerKey;
        }

        this.elements.towerList.querySelectorAll('.tower-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.towerType === this.game.selectedTowerType);
        });

        this.updateTowerInfoPanel();
    }

    updateTowerInfoPanel() {
        const panel = this.elements.towerInfoPanel;

        if (this.game.selectedTower) {
            const tower = this.game.selectedTower;
            panel.classList.remove('hidden');

            this.elements.towerInfoName.textContent = tower.name +
                (tower.upgradeLevel > 0 ? ` (Lv ${tower.upgradeLevel + 1})` : '');

            const upgradeCost = tower.getUpgradeCost();
            const upgradeName = tower.getUpgradeName();
            const sellValue = tower.getSellValue();

            let statsHtml = `
                <div class="stat-row"><span class="stat-label">Type:</span><span class="stat-value">${tower.type}</span></div>
            `;

            if (tower.type === 'active') {
                statsHtml += `
                    <div class="stat-row"><span class="stat-label">Damage:</span><span class="stat-value">${tower.damage}</span></div>
                    <div class="stat-row"><span class="stat-label">Range:</span><span class="stat-value">${tower.range}</span></div>
                    <div class="stat-row"><span class="stat-label">Speed:</span><span class="stat-value">${tower.attackSpeed}/s</span></div>
                `;
            }

            statsHtml += `
                <div class="stat-row"><span class="stat-label">Kills:</span><span class="stat-value">${tower.totalKills}</span></div>
                <div class="stat-row"><span class="stat-label">Sell Value:</span><span class="stat-value">\u00A3${sellValue}</span></div>
            `;

            if (upgradeName) {
                statsHtml += `
                    <div class="stat-row"><span class="stat-label">Next:</span><span class="stat-value" style="color:#00ff88;">${upgradeName}</span></div>
                `;
            }

            // Show effectiveness ratings for active towers
            if (tower.effectiveness && tower.type === 'active') {
                statsHtml += `<div style="margin-top:8px;padding-top:6px;border-top:1px solid #2a3a4e;">`;
                statsHtml += `<div style="font-size:0.7rem;color:#64748b;margin-bottom:4px;letter-spacing:0.5px;">EFFECTIVENESS:</div>`;
                const sortedThreats = Object.entries(tower.effectiveness).sort((a, b) => b[1] - a[1]);
                for (const [threatKey, eff] of sortedThreats) {
                    const threatConfig = THREAT_TYPES[threatKey];
                    if (!threatConfig) continue;
                    const pct = Math.round(eff * 100);
                    let color = '#334155'; // none
                    if (eff >= 2.0) color = '#00ff88';
                    else if (eff >= 1.0) color = '#60a5fa';
                    else if (eff >= 0.5) color = '#fbbf24';
                    else if (eff > 0) color = '#f87171';
                    statsHtml += `<div style="display:flex;justify-content:space-between;font-size:0.68rem;padding:1px 0;color:${color};">`;
                    statsHtml += `<span>${threatConfig.symbol} ${threatConfig.name}</span><span>${pct}%</span></div>`;
                }
                statsHtml += `</div>`;
            }

            // Educational note about the tower
            const config = TOWER_TYPES[tower.towerType];
            if (config && config.educationalNote) {
                statsHtml += `<div style="margin-top:8px;padding-top:6px;border-top:1px solid #2a3a4e;font-size:0.7rem;color:#94a3b8;line-height:1.3;">${config.educationalNote}</div>`;
            }

            this.elements.towerInfoStats.innerHTML = statsHtml;

            const upgradeBtn = document.getElementById('btn-upgrade');
            const sellBtn = document.getElementById('btn-sell');

            if (upgradeCost !== null) {
                upgradeBtn.textContent = `UPGRADE \u00A3${upgradeCost}`;
                upgradeBtn.disabled = this.game.budget < upgradeCost;
                upgradeBtn.style.display = '';
            } else {
                upgradeBtn.style.display = 'none';
            }

            sellBtn.textContent = `SELL \u00A3${sellValue}`;

        } else {
            panel.classList.add('hidden');
        }
    }

    // --- HUD Updates ---
    startHudUpdates() {
        this.stopHudUpdates();
        this.hudUpdateInterval = setInterval(() => this.updateHUD(), 100);
    }

    stopHudUpdates() {
        if (this.hudUpdateInterval) {
            clearInterval(this.hudUpdateInterval);
            this.hudUpdateInterval = null;
        }
    }

    updateHUD() {
        if (!this.game.levelConfig) return;

        this.hud.budget.textContent = `\u00A3${this.game.budget}`;
        this.hud.wave.textContent = `${this.game.currentWave} / ${this.game.totalWaves}`;
        this.hud.score.textContent = this.game.score;

        const healthPct = this.game.getOverallHealth();
        this.hud.healthBar.style.width = healthPct + '%';

        if (healthPct < 30) {
            this.hud.healthBar.style.background = 'linear-gradient(90deg, #ff4757, #ff6b7a)';
        } else if (healthPct < 60) {
            this.hud.healthBar.style.background = 'linear-gradient(90deg, #fbbf24, #fcd34d)';
        } else {
            this.hud.healthBar.style.background = 'linear-gradient(90deg, #00ff88, #66ffaa)';
        }

        // Phase text
        if (this.game.state === STATE.PLANNING) {
            this.hud.phase.textContent = 'PLANNING PHASE';
            this.hud.phase.style.color = '#00d4ff';
            const secs = Math.ceil(this.game.planningTimer / 1000);
            this.hud.timer.textContent = `${secs}s remaining \u2013 Place your defenses!`;
        } else if (this.game.state === STATE.PLAYING) {
            this.hud.phase.textContent = `WAVE ${this.game.currentWave}`;
            this.hud.phase.style.color = '#ff4757';
            this.hud.timer.textContent = `${this.game.threats.filter(t => t.alive).length} threats active`;
        } else if (this.game.state === STATE.WAVE_BREAK) {
            this.hud.phase.textContent = 'WAVE BREAK';
            this.hud.phase.style.color = '#00ff88';
            const secs = Math.ceil(this.game.waveBreakTimer / 1000);
            this.hud.timer.textContent = `Next wave in ${secs}s`;
        } else if (this.game.state === STATE.PAUSED) {
            this.hud.phase.textContent = 'PAUSED';
            this.hud.phase.style.color = '#fbbf24';
            this.hud.timer.textContent = '';
        }

        // Update tower card affordability
        this.elements.towerList.querySelectorAll('.tower-card').forEach(card => {
            const type = card.dataset.towerType;
            const config = TOWER_TYPES[type];
            if (config) {
                card.classList.toggle('disabled', this.game.budget < config.cost);
            }
        });

        if (this.game.selectedTower) {
            this.updateTowerInfoPanel();
        }
    }

    // --- Tooltip ---
    showTowerTooltip(towerKey, event) {
        const config = TOWER_TYPES[towerKey];
        if (!config) return;

        const tooltip = this.elements.tooltip;
        let html = `<h4>${config.name}</h4>`;
        html += `<p>${config.description}</p>`;
        html += `<div class="tooltip-stat"><span>Cost:</span><span>\u00A3${config.cost}</span></div>`;

        if (config.type === 'active') {
            html += `<div class="tooltip-stat"><span>Damage:</span><span>${config.damage}</span></div>`;
            html += `<div class="tooltip-stat"><span>Range:</span><span>${config.range}px</span></div>`;
            html += `<div class="tooltip-stat"><span>Attack Speed:</span><span>${config.attackSpeed}/s</span></div>`;

            // Show effectiveness summary in tooltip
            if (config.effectiveness) {
                const strong = config.strongVs || [];
                const weak = config.weakVs || [];
                if (strong.length > 0) {
                    const names = strong.map(k => THREAT_TYPES[k] ? `${THREAT_TYPES[k].symbol} ${THREAT_TYPES[k].name}` : k).join(', ');
                    html += `<div class="tooltip-stat" style="color:#00ff88;"><span>Strong vs:</span><span>${names}</span></div>`;
                }
                if (weak.length > 0) {
                    const names = weak.map(k => THREAT_TYPES[k] ? `${THREAT_TYPES[k].symbol} ${THREAT_TYPES[k].name}` : k).join(', ');
                    html += `<div class="tooltip-stat" style="color:#ef4444;"><span>Weak vs:</span><span>${names}</span></div>`;
                }
            }
        } else {
            html += `<div class="tooltip-stat"><span>Type:</span><span>Passive</span></div>`;
            if (config.passiveEffect) {
                html += `<p style="color:#06b6d4;margin-top:4px;font-size:0.72rem;">${config.passiveEffect}</p>`;
            }
        }

        if (config.upgrades && config.upgrades.length > 0) {
            html += `<p style="color:#fbbf24;margin-top:6px;font-size:0.7rem;">Upgrades: ${config.upgrades.map(u => u.name).join(' \u2192 ')}</p>`;
        }

        // Add educational note to tooltip
        if (config.educationalNote) {
            html += `<p style="color:#a855f7;margin-top:6px;font-size:0.7rem;border-top:1px solid #2a3a4e;padding-top:6px;">\uD83D\uDCDA ${config.educationalNote}</p>`;
        }

        tooltip.innerHTML = html;
        tooltip.classList.remove('hidden');

        const rect = tooltip.getBoundingClientRect();
        const x = event.clientX - rect.width - 10;
        const y = event.clientY;
        tooltip.style.left = Math.max(10, x) + 'px';
        tooltip.style.top = Math.max(10, y) + 'px';
    }

    hideTooltip() {
        this.elements.tooltip.classList.add('hidden');
    }

    // --- Notifications ---
    showNotification(message, type = 'info') {
        const container = this.elements.notifications;
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        container.appendChild(notif);

        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateY(-10px)';
            notif.style.transition = 'all 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    // ============================================================
    //  LEVEL INTRO WITH CASE STUDIES
    // ============================================================

    showLevelIntro(level) {
        document.getElementById('intro-title').textContent = `Mission ${level.id}: ${level.name}`;
        document.getElementById('intro-scenario').textContent = level.scenario;

        // Objectives
        const objectives = document.getElementById('intro-objectives');
        objectives.innerHTML = `
            <h4>OBJECTIVES</h4>
            <ul>
                <li>Protect all network assets from cyber threats</li>
                <li>Survive ${level.waves.length} waves of attacks</li>
                <li>Starting budget: \u00A3${level.startingBudget}</li>
                <li>Answer quiz questions between waves for bonus budget!</li>
            </ul>
        `;

        // Available towers
        const available = document.getElementById('intro-available');
        available.innerHTML = '<h4>AVAILABLE DEFENSES</h4>';
        const tags = level.availableTowers.map(key => {
            const config = TOWER_TYPES[key];
            return `<span class="tower-tag">${config.symbol} ${config.name} (\u00A3${config.cost})</span>`;
        }).join('');
        available.innerHTML += tags;

        // Case Study (if available for this level)
        const caseStudy = CASE_STUDIES[level.id];
        if (caseStudy) {
            const caseBox = document.createElement('div');
            caseBox.className = 'case-study-box';
            caseBox.innerHTML = `
                <span class="case-study-badge">\uD83D\uDCC4 REAL-WORLD CASE STUDY</span>
                <h4>${caseStudy.title}</h4>
                <p>${caseStudy.summary}</p>
                <p class="case-lesson">\u25B8 Lesson: ${caseStudy.lesson}</p>
                <span class="case-spec">SPEC: ${caseStudy.specLink}</span>
            `;
            // Insert case study before the start button
            const startBtn = document.getElementById('btn-start-level');
            startBtn.parentNode.insertBefore(caseBox, startBtn);
        }

        this.showModal('levelIntro');
    }

    // ============================================================
    //  LEVEL COMPLETE (enhanced with spec topics covered)
    // ============================================================

    showLevelComplete() {
        const game = this.game;
        const healthPct = game.getOverallHealth();
        const stars = healthPct >= 90 ? 3 : healthPct >= 50 ? 2 : 1;
        const timeSecs = Math.round((Date.now() - game.stats.startTime) / 1000);

        document.getElementById('complete-title').textContent =
            `MISSION ${game.levelConfig.id} COMPLETE`;

        // Stats
        const statsEl = document.getElementById('complete-stats');
        statsEl.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">SCORE</div>
                <div class="stat-value">${game.score}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">ASSET HEALTH</div>
                <div class="stat-value">${healthPct}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">THREATS STOPPED</div>
                <div class="stat-value">${game.stats.threatsKilled}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">TIME</div>
                <div class="stat-value">${Math.floor(timeSecs / 60)}:${(timeSecs % 60).toString().padStart(2, '0')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">QUIZ BONUS</div>
                <div class="stat-value" style="color:#fbbf24;">\u00A3${game.stats.quizBonusEarned || 0}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">RATING</div>
                <div class="stat-value" style="color:#fbbf24;">${'\u2605'.repeat(stars)}${'\u2606'.repeat(3 - stars)}</div>
            </div>
        `;

        // Learning summary
        const learningEl = document.getElementById('complete-learning');
        const summary = game.levelConfig.learningSummary;
        let learningHtml = '';

        if (summary) {
            learningHtml += `
                <h4>\uD83D\uDCDA ${summary.title}</h4>
                ${summary.points.map(p => `<p>\u25B8 ${p}</p>`).join('')}
            `;

            if (summary.legislation) {
                learningHtml += `<p style="color:#a855f7;margin-top:8px;"><strong>\u2696\uFE0F Legislation:</strong> ${summary.legislation}</p>`;
            }
        }

        // Show which BTEC spec topics were covered in this level
        const levelId = game.levelConfig.id;
        const coveredTopics = [];
        for (const topic of SPEC_TOPICS) {
            for (const sub of topic.subtopics) {
                if (sub.coveredInLevels && sub.coveredInLevels.includes(levelId)) {
                    coveredTopics.push(`${sub.id}: ${sub.name}`);
                }
            }
        }

        if (coveredTopics.length > 0) {
            learningHtml += `<p style="color:#00d4ff;margin-top:12px;font-size:0.75rem;"><strong>BTEC SPEC TOPICS COVERED:</strong></p>`;
            learningHtml += `<p style="font-size:0.75rem;color:#94a3b8;">${coveredTopics.join(' \u2022 ')}</p>`;
        }

        learningEl.innerHTML = learningHtml;

        const nextBtn = document.getElementById('btn-next-level');
        if (game.currentLevelIndex < LEVELS.length - 1) {
            nextBtn.style.display = '';
        } else {
            nextBtn.style.display = 'none';
        }

        this.showModal('levelComplete');
    }

    // --- Game Over Modal ---
    showGameOver() {
        const msg = document.getElementById('gameover-message');
        const hasRansomware = this.game.threats.some(t => t.type === 'ransomware');

        if (hasRansomware) {
            msg.innerHTML = '<strong>Ransomware has encrypted critical systems!</strong> Without adequate backup and layered defenses, your organization has suffered catastrophic data loss.<br><br><em style="color:#a855f7;">Learning point: Defense in depth and regular backups are essential for business continuity. Under GDPR, this breach must be reported to the ICO within 72 hours.</em>';
        } else {
            msg.innerHTML = 'Your network defenses have been overwhelmed! All critical assets have been compromised.<br><br><em style="color:#a855f7;">Learning point: Consider using a wider variety of security controls. No single defense is sufficient \u2013 this is why defense in depth (D4) is essential.</em>';
        }

        this.showModal('gameOver');
    }

    // --- Educational Popup ---
    showEduPopup(popup) {
        document.getElementById('edu-title').textContent = popup.title;
        document.getElementById('edu-text').textContent = popup.text;

        const legEl = document.getElementById('edu-legislation');
        if (popup.legislation) {
            legEl.innerHTML = `
                <h5>RELEVANT LEGISLATION</h5>
                <p>${popup.legislation}</p>
            `;
            legEl.style.display = '';
        } else {
            legEl.style.display = 'none';
        }

        this.showModal('eduPopup');

        if (this.game.state === STATE.PLAYING || this.game.state === STATE.WAVE_BREAK || this.game.state === STATE.PLANNING) {
            this.game.pause(true); // System pause - don't show pause modal
            this._resumeAfterEdu = true;
        }
    }

    closeEduPopup() {
        this.hideModal('eduPopup');
        if (this._resumeAfterEdu) {
            this.game.resume();
            this._resumeAfterEdu = false;
        }
    }

    // ============================================================
    //  QUIZ SYSTEM
    //  Shows between waves and awards bonus budget for correct answers
    // ============================================================

    getQuizQuestion(levelId) {
        // Get level-specific questions first, then general
        const levelQs = QUIZ_QUESTIONS[levelId] || [];
        const generalQs = QUIZ_QUESTIONS.general || [];
        const allQs = [...levelQs, ...generalQs];

        // Filter out already used questions
        const available = allQs.filter((_, i) => !this.usedQuizQuestions.has(`${levelId}_${i}`));

        if (available.length === 0) {
            // Reset if all used
            this.usedQuizQuestions.clear();
            return allQs[Math.floor(Math.random() * allQs.length)];
        }

        const idx = Math.floor(Math.random() * available.length);
        const q = available[idx];

        // Mark as used
        const origIdx = allQs.indexOf(q);
        this.usedQuizQuestions.add(`${levelId}_${origIdx}`);

        return q;
    }

    showQuiz(levelId, callback) {
        const question = this.getQuizQuestion(levelId);
        if (!question) {
            if (callback) callback(false);
            return;
        }

        this.currentQuiz = question;
        this.quizAnswered = false;
        this.quizCallback = callback;

        // Populate quiz UI
        document.getElementById('quiz-question').textContent = question.question;
        document.getElementById('quiz-spec-ref').textContent = `BTEC SPEC: ${question.specRef}`;
        document.getElementById('quiz-reward').textContent = 'Correct = +\u00A3200 bonus!';

        // Build options
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const btn = document.createElement('div');
            btn.className = 'quiz-option';
            btn.textContent = option;
            btn.addEventListener('click', () => this.answerQuiz(index));
            optionsContainer.appendChild(btn);
        });

        // Hide feedback and continue button
        document.getElementById('quiz-feedback').classList.add('hidden');
        document.getElementById('btn-quiz-continue').classList.add('hidden');

        // Pause game (system pause - don't show pause modal)
        if (this.game.state === STATE.PLAYING || this.game.state === STATE.WAVE_BREAK || this.game.state === STATE.PLANNING) {
            this.game.pause(true); // System pause - don't show pause modal
            this._resumeAfterQuiz = true;
        }

        this.showModal('quiz');
    }

    answerQuiz(selectedIndex) {
        if (this.quizAnswered) return;
        this.quizAnswered = true;

        const question = this.currentQuiz;
        const isCorrect = selectedIndex === question.correct;

        // Highlight options
        const options = document.querySelectorAll('#quiz-options .quiz-option');
        options.forEach((opt, i) => {
            opt.classList.add('disabled');
            if (i === question.correct) {
                opt.classList.add('correct');
            }
            if (i === selectedIndex && !isCorrect) {
                opt.classList.add('incorrect');
            }
        });

        // Show feedback
        const feedbackEl = document.getElementById('quiz-feedback');
        feedbackEl.classList.remove('hidden');

        const resultIcon = document.getElementById('quiz-result-icon');
        if (isCorrect) {
            resultIcon.textContent = '\u2714 CORRECT! +\u00A3200 bonus budget';
            resultIcon.className = 'quiz-result-icon correct';
            this.game.budget += 200;
            this.game.score += 200;
            if (!this.game.stats.quizBonusEarned) this.game.stats.quizBonusEarned = 0;
            this.game.stats.quizBonusEarned += 200;
        } else {
            resultIcon.textContent = '\u2718 INCORRECT';
            resultIcon.className = 'quiz-result-icon incorrect';
        }

        document.getElementById('quiz-explanation').textContent = question.explanation;

        // Show continue button
        document.getElementById('btn-quiz-continue').classList.remove('hidden');
    }

    closeQuiz() {
        this.hideModal('quiz');

        if (this._resumeAfterQuiz) {
            this.game.resume();
            this._resumeAfterQuiz = false;
        }

        if (this.quizCallback) {
            this.quizCallback(this.quizAnswered);
            this.quizCallback = null;
        }
    }

    // ============================================================
    //  THREAT INFO PANEL (hover/click on threats during gameplay)
    // ============================================================

    showThreatInfo(threat) {
        if (!threat) {
            this.hideThreatInfo();
            return;
        }

        const panel = this.elements.threatInfoPanel;
        const config = THREAT_TYPES[threat.type];
        if (!config) return;

        document.getElementById('threat-info-icon').textContent = config.symbol;
        document.getElementById('threat-info-icon').style.color = config.color;
        document.getElementById('threat-info-name').textContent = config.name;
        document.getElementById('threat-info-type').textContent = `${config.special || 'Standard'} threat`;

        // Stats
        document.getElementById('threat-info-stats').innerHTML = `
            <div class="stat-row"><span class="stat-label">Health:</span><span class="stat-value">${Math.ceil(threat.health)} / ${threat.maxHealth}</span></div>
            <div class="stat-row"><span class="stat-label">Speed:</span><span class="stat-value">${config.speed}</span></div>
            <div class="stat-row"><span class="stat-label">Damage:</span><span class="stat-value">${config.damage}</span></div>
            <div class="stat-row"><span class="stat-label">Reward:</span><span class="stat-value" style="color:#00ff88;">\u00A3${config.reward}</span></div>
        `;

        // Educational note
        document.getElementById('threat-info-edu').innerHTML = `
            <strong style="color:#a855f7;font-size:0.7rem;">\uD83D\uDCDA LEARN:</strong> ${config.educationalNote}
        `;

        // Best defense recommendation using THREAT_COUNTERS
        const counters = THREAT_COUNTERS[threat.type];
        let defenseHtml = '';
        if (counters) {
            if (counters.strongCounters.length > 0) {
                const names = counters.strongCounters.map(k => {
                    const t = TOWER_TYPES[k];
                    return t ? `<span style="color:#00ff88;">${t.symbol} ${t.name}</span>` : k;
                }).join(', ');
                defenseHtml += `<div style="margin-bottom:3px;"><strong style="color:#00ff88;">STRONG COUNTERS:</strong> ${names}</div>`;
            }
            if (counters.immune.length > 0) {
                const names = counters.immune.map(k => {
                    const t = TOWER_TYPES[k];
                    return t ? t.name : k;
                }).join(', ');
                defenseHtml += `<div style="color:#ef4444;font-size:0.7rem;">Resists: ${names}</div>`;
            }
        }

        document.getElementById('threat-info-defense').innerHTML = defenseHtml || '<strong>BEST DEFENSE:</strong> Multiple layered controls';

        panel.classList.remove('hidden');
    }

    hideThreatInfo() {
        this.elements.threatInfoPanel.classList.add('hidden');
    }

    // ============================================================
    //  "DID YOU KNOW?" TIPS
    //  Shown during planning phases and wave breaks
    // ============================================================

    showRandomDYK() {
        const tips = DID_YOU_KNOW_TIPS;
        if (tips.length === 0) return;

        // Pick a random tip not recently shown
        let attempts = 0;
        let idx;
        do {
            idx = Math.floor(Math.random() * tips.length);
            attempts++;
        } while (this.shownTips.has(idx) && attempts < tips.length);

        if (this.shownTips.size >= tips.length) this.shownTips.clear();
        this.shownTips.add(idx);

        const tip = tips[idx];
        this.elements.dykText.textContent = tip.tip;
        this.elements.dykSpec.textContent = `BTEC SPEC: ${tip.specRef}`;
        this.elements.didYouKnow.classList.remove('hidden');
    }

    hideDYK() {
        this.elements.didYouKnow.classList.add('hidden');
        if (this.dykInterval) {
            clearInterval(this.dykInterval);
            this.dykInterval = null;
        }
    }

    startDYKRotation() {
        this.showRandomDYK();
        this.dykInterval = setInterval(() => this.showRandomDYK(), 8000);
    }

    // ============================================================
    //  KNOWLEDGE TRACKER
    //  Maps progress to BTEC Learning Aim D specification
    // ============================================================

    showKnowledgeTracker() {
        this.showScreen('knowledge');
        this.renderKnowledgeTracker();
    }

    renderKnowledgeTracker() {
        const container = this.elements.knowledgeContainer;
        container.innerHTML = '';

        const completedLevels = this.game.progress.levelsCompleted;

        // Overall progress header
        let totalSubs = 0;
        let coveredSubs = 0;

        for (const topic of SPEC_TOPICS) {
            for (const sub of topic.subtopics) {
                totalSubs++;
                const isCovered = sub.coveredInLevels && sub.coveredInLevels.some(l => completedLevels.includes(l));
                if (isCovered) coveredSubs++;
            }
        }

        const overallPct = totalSubs > 0 ? Math.round((coveredSubs / totalSubs) * 100) : 0;

        const overallDiv = document.createElement('div');
        overallDiv.className = 'knowledge-topic';
        overallDiv.style.borderColor = '#00d4ff';
        overallDiv.innerHTML = `
            <div class="knowledge-topic-header">
                <div class="knowledge-topic-title">OVERALL LEARNING AIM D PROGRESS</div>
                <div class="knowledge-progress-badge ${overallPct === 100 ? 'complete' : overallPct > 0 ? 'partial' : 'not-started'}">${overallPct}% COVERED</div>
            </div>
            <div class="knowledge-progress-bar">
                <div class="knowledge-progress-fill" style="width:${overallPct}%"></div>
            </div>
            <p style="font-size:0.8rem;color:#94a3b8;">Complete all 6 levels to cover 100% of the Learning Aim D specification. Each level introduces new threats, defenses, and legislation relevant to the BTEC assessment.</p>
        `;
        container.appendChild(overallDiv);

        // Per-topic progress
        for (const topic of SPEC_TOPICS) {
            let topicTotal = topic.subtopics.length;
            let topicCovered = 0;

            const subtopicHtml = topic.subtopics.map(sub => {
                const isCovered = sub.coveredInLevels && sub.coveredInLevels.some(l => completedLevels.includes(l));
                if (isCovered) topicCovered++;

                const coveredLevelStr = sub.coveredInLevels ? sub.coveredInLevels.map(l => `L${l}`).join(', ') : '';

                return `
                    <div class="knowledge-subtopic ${isCovered ? 'covered' : ''}">
                        <span class="knowledge-check ${isCovered ? 'done' : 'pending'}">${isCovered ? '\u2714' : '\u2013'}</span>
                        <span>${sub.name}</span>
                        ${coveredLevelStr ? `<span style="margin-left:auto;font-size:0.65rem;color:#64748b;">${coveredLevelStr}</span>` : ''}
                    </div>
                `;
            }).join('');

            const topicPct = topicTotal > 0 ? Math.round((topicCovered / topicTotal) * 100) : 0;
            const statusClass = topicPct === 100 ? 'complete' : topicPct > 0 ? 'partial' : 'not-started';
            const statusText = topicPct === 100 ? 'COMPLETE' : topicPct > 0 ? `${topicPct}%` : 'NOT STARTED';

            const topicDiv = document.createElement('div');
            topicDiv.className = 'knowledge-topic';
            topicDiv.innerHTML = `
                <div class="knowledge-topic-header">
                    <div class="knowledge-topic-title">${topic.title}</div>
                    <div class="knowledge-progress-badge ${statusClass}">${statusText}</div>
                </div>
                <div class="knowledge-progress-bar">
                    <div class="knowledge-progress-fill" style="width:${topicPct}%"></div>
                </div>
                <div class="knowledge-subtopics">${subtopicHtml}</div>
            `;
            container.appendChild(topicDiv);
        }
    }

    // ============================================================
    //  ENCYCLOPEDIA (enhanced with case studies)
    // ============================================================

    showEncyclopedia() {
        this.showScreen('encyclopedia');
        this.renderEncyclopediaNav();
    }

    renderEncyclopediaNav() {
        const nav = this.elements.encyclopediaNav;
        nav.innerHTML = '';

        for (const [categoryKey, category] of Object.entries(ENCYCLOPEDIA)) {
            const catDiv = document.createElement('div');
            catDiv.className = 'enc-category';
            catDiv.innerHTML = `<div class="enc-category-title">${category.title.toUpperCase()}</div>`;

            for (const entry of category.entries) {
                const item = document.createElement('div');
                item.className = 'enc-item';
                item.textContent = entry.name;
                item.addEventListener('click', () => {
                    nav.querySelectorAll('.enc-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    this.renderEncyclopediaEntry(entry, categoryKey);

                    const readKey = `${categoryKey}_${entry.id}`;
                    if (!this.game.progress.encyclopediaRead.includes(readKey)) {
                        this.game.progress.encyclopediaRead.push(readKey);
                        this.game.saveProgress();
                    }
                });
                catDiv.appendChild(item);
            }

            nav.appendChild(catDiv);
        }

        // Add Case Studies section
        const caseDiv = document.createElement('div');
        caseDiv.className = 'enc-category';
        caseDiv.innerHTML = '<div class="enc-category-title">REAL-WORLD CASE STUDIES</div>';

        for (const [levelId, cs] of Object.entries(CASE_STUDIES)) {
            const item = document.createElement('div');
            item.className = 'enc-item';
            item.textContent = cs.title.replace('Real Case: ', '');
            item.addEventListener('click', () => {
                nav.querySelectorAll('.enc-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.renderCaseStudyEntry(cs, levelId);
            });
            caseDiv.appendChild(item);
        }

        nav.appendChild(caseDiv);
    }

    renderEncyclopediaEntry(entry, categoryKey) {
        const content = this.elements.encyclopediaContent;
        const data = entry.content;

        let html = `<div class="enc-entry"><h3>${entry.name}</h3>`;

        if (data.overview) {
            html += `<div class="enc-section"><h4>OVERVIEW</h4><p>${data.overview}</p></div>`;
        }

        if (data.inGame) {
            html += `<div class="enc-section"><h4>IN-GAME</h4><p>${data.inGame}</p></div>`;
        }

        if (data.stats) {
            html += `<div class="enc-section"><h4>STATISTICS</h4><p>${data.stats}</p></div>`;
        }

        if (data.prevention) {
            html += `<div class="enc-section"><h4>PREVENTION</h4><p>${data.prevention}</p></div>`;
        }

        if (data.upgradePath) {
            html += `<div class="enc-section"><h4>UPGRADE PATH</h4><p>${data.upgradePath}</p></div>`;
        }

        if (data.keyPoints) {
            html += `<div class="enc-section"><h4>KEY POINTS</h4><ul>${data.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul></div>`;
        }

        // Legislation reference
        if (categoryKey === 'threats') {
            const threatConfig = THREAT_TYPES[entry.id];
            if (threatConfig && threatConfig.educationalNote) {
                html += `<div class="legislation-ref"><h5>EDUCATIONAL NOTE</h5><p>${threatConfig.educationalNote}</p></div>`;
            }
        }

        // Exam-style practice question (if threat or defense)
        if (categoryKey === 'threats' || categoryKey === 'defenses') {
            html += `<div class="enc-section" style="margin-top:16px;"><h4>EXAM PRACTICE</h4>`;
            html += `<p style="font-style:italic;color:#fbbf24;">Try to answer this without looking at the answer:</p>`;

            if (categoryKey === 'threats') {
                html += `<p><strong>Q:</strong> Describe what a ${entry.name.toLowerCase()} attack is and explain one security control that would help prevent it.</p>`;
                html += `<p style="color:#64748b;font-size:0.8rem;margin-top:8px;">Think about your answer, then check the Prevention section above.</p>`;
            } else {
                html += `<p><strong>Q:</strong> Explain how ${entry.name.toLowerCase()} contributes to an organisation's overall security strategy.</p>`;
                html += `<p style="color:#64748b;font-size:0.8rem;margin-top:8px;">Think about your answer, then check the Overview section above.</p>`;
            }
            html += '</div>';
        }

        html += '</div>';
        content.innerHTML = html;
    }

    renderCaseStudyEntry(caseStudy, levelId) {
        const content = this.elements.encyclopediaContent;

        content.innerHTML = `
            <div class="enc-entry">
                <h3>${caseStudy.title}</h3>
                <div class="enc-section">
                    <h4>WHAT HAPPENED</h4>
                    <p>${caseStudy.summary}</p>
                </div>
                <div class="enc-section">
                    <h4>KEY LESSON</h4>
                    <p style="color:#00ff88;font-weight:600;">${caseStudy.lesson}</p>
                </div>
                <div class="enc-section">
                    <h4>BTEC SPECIFICATION LINKS</h4>
                    <p>${caseStudy.specLink}</p>
                </div>
                <div class="enc-section">
                    <h4>EXAM PRACTICE</h4>
                    <p style="font-style:italic;color:#fbbf24;">Using this case study as an example:</p>
                    <p><strong>Q1:</strong> Identify TWO types of cyber threat demonstrated in this incident.</p>
                    <p><strong>Q2:</strong> Explain TWO security controls that could have reduced the impact of this attack.</p>
                    <p><strong>Q3:</strong> Which legislation is relevant to this breach and what are the potential consequences for the organisation?</p>
                    <p style="color:#64748b;font-size:0.8rem;margin-top:12px;">These are exam-style questions. Practice writing full answers using the BTEC command words: identify, describe, explain, evaluate, assess.</p>
                </div>
                <div class="legislation-ref">
                    <h5>RELATED LEVEL</h5>
                    <p>This case study is featured in Level ${levelId}: ${LEVELS[levelId - 1] ? LEVELS[levelId - 1].name : ''}. Play the level to experience defending against similar attacks!</p>
                </div>
            </div>
        `;
    }

    // --- Achievements ---
    showAchievements() {
        this.showScreen('achievements');
        this.renderAchievements();
    }

    renderAchievements() {
        const grid = this.elements.achievementsGrid;
        grid.innerHTML = '';

        for (const ach of ACHIEVEMENTS) {
            const unlocked = this.checkAchievement(ach);
            const card = document.createElement('div');
            card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;

            card.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info">
                    <h4>${ach.name}</h4>
                    <p>${ach.description}</p>
                </div>
            `;

            grid.appendChild(card);
        }
    }

    checkAchievement(achievement) {
        const p = this.game.progress;
        switch (achievement.condition) {
            case 'levels_completed >= 1': return p.levelsCompleted.length >= 1;
            case 'levels_completed >= 6': return p.levelsCompleted.length >= 6;
            case 'no_damage_level': return Object.values(p.levelStars).some(s => s === 3);
            case 'budget_remaining_50': return false;
            case 'time_under_3min': return false;
            case 'tower_variety_5': return p.towersEverUsed.length >= 5;
            case 'all_towers_used': return p.towersEverUsed.length >= 9;
            case 'all_encyclopedia_read': return p.encyclopediaRead.length >= 19;
            case 'score_10000': return p.highScore >= 10000;
            case 'ransomware_kills_10': return p.totalRansomwareKills >= 10;
            default: return false;
        }
    }

    // ========================================
    // INTEL BRIEFING - Threat/Defense Matrix
    // ========================================
    showIntelBriefing(returnTo) {
        this.intelReturnTo = returnTo || 'mainMenu';
        this.showScreen('intel');
        this.renderIntelBriefing();
    }

    renderIntelBriefing() {
        // --- 1. Render Threat Cards with Counter Info ---
        const threatsContainer = document.getElementById('intel-threats');
        if (!threatsContainer) return;

        const threatKeys = Object.keys(THREAT_TYPES);
        const activeTowerKeys = Object.keys(TOWER_TYPES).filter(k => TOWER_TYPES[k].type === 'active');
        const passiveTowerKeys = Object.keys(TOWER_TYPES).filter(k => TOWER_TYPES[k].type === 'passive');

        let cardsHTML = '<h3 class="intel-section-title">THREAT INTELLIGENCE</h3>';
        cardsHTML += '<div class="intel-threat-cards">';

        for (const threatKey of threatKeys) {
            const threat = THREAT_TYPES[threatKey];
            const counters = THREAT_COUNTERS[threatKey] || { strongCounters: [], weakCounters: [], immune: [] };

            cardsHTML += `<div class="intel-threat-card" style="border-left: 3px solid ${threat.color}">`;
            cardsHTML += `<div class="intel-threat-card-header">`;
            cardsHTML += `<div class="intel-threat-icon" style="background:${threat.color}20; color:${threat.color}">${threat.symbol}</div>`;
            cardsHTML += `<div><h4>${threat.name}</h4><span class="intel-threat-type">${threatKey}</span></div>`;
            cardsHTML += `</div>`;

            // Strong counters
            cardsHTML += `<ul class="intel-counter-list">`;
            if (counters.strongCounters.length > 0) {
                for (const tKey of counters.strongCounters) {
                    const tower = TOWER_TYPES[tKey];
                    if (!tower) continue;
                    const eff = tower.effectiveness ? tower.effectiveness[threatKey] : null;
                    const effLabel = eff ? ` (${Math.round(eff * 100)}%)` : '';
                    const isPassive = tower.type === 'passive';
                    cardsHTML += `<li><span class="intel-counter-badge ${isPassive ? 'passive' : 'strong'}">${isPassive ? 'PASSIVE' : 'STRONG'}</span> `;
                    cardsHTML += `<span class="intel-counter-strong">${tower.symbol} ${tower.name}${effLabel}</span></li>`;
                }
            }
            // Partial counters
            if (counters.weakCounters.length > 0) {
                for (const tKey of counters.weakCounters) {
                    const tower = TOWER_TYPES[tKey];
                    if (!tower) continue;
                    const eff = tower.effectiveness ? tower.effectiveness[threatKey] : null;
                    const effLabel = eff ? ` (${Math.round(eff * 100)}%)` : '';
                    cardsHTML += `<li><span class="intel-counter-badge weak">PARTIAL</span> `;
                    cardsHTML += `<span class="intel-counter-weak">${tower.symbol} ${tower.name}${effLabel}</span></li>`;
                }
            }
            // Immune / ineffective
            if (counters.immune.length > 0) {
                const immuneNames = counters.immune.map(tKey => TOWER_TYPES[tKey] ? TOWER_TYPES[tKey].name : tKey).join(', ');
                cardsHTML += `<li><span class="intel-counter-badge immune">IMMUNE</span> `;
                cardsHTML += `<span class="intel-counter-immune">Resists: ${immuneNames}</span></li>`;
            }
            cardsHTML += `</ul></div>`;
        }

        cardsHTML += '</div>';
        threatsContainer.innerHTML = cardsHTML;

        // --- 2. Render Effectiveness Matrix Table ---
        const matrixTable = document.getElementById('intel-matrix');
        if (!matrixTable) return;

        let tableHTML = '<thead><tr><th></th>';
        for (const tKey of threatKeys) {
            const t = THREAT_TYPES[tKey];
            tableHTML += `<th class="rotate-header" style="color:${t.color}">${t.symbol} ${t.name}</th>`;
        }
        tableHTML += '</tr></thead><tbody>';

        for (const towKey of activeTowerKeys) {
            const tower = TOWER_TYPES[towKey];
            tableHTML += `<tr><th style="color:${tower.color}">${tower.symbol} ${tower.name}</th>`;

            for (const threatKey of threatKeys) {
                const eff = tower.effectiveness ? (tower.effectiveness[threatKey] || 0) : 0;
                const pct = Math.round(eff * 100);
                let cls = 'eff-0';
                let label = 'NONE';

                if (eff >= 2.0) { cls = 'eff-max'; label = 'SPECIALIST'; }
                else if (eff >= 1.5) { cls = 'eff-high'; label = 'STRONG'; }
                else if (eff >= 0.8) { cls = 'eff-std'; label = 'EFFECTIVE'; }
                else if (eff >= 0.3) { cls = 'eff-mid'; label = 'PARTIAL'; }
                else if (eff > 0) { cls = 'eff-low'; label = 'WEAK'; }
                else { cls = 'eff-0'; label = 'NONE'; }

                tableHTML += `<td class="eff-cell ${cls}">${pct}%<span class="eff-label">${label}</span></td>`;
            }
            tableHTML += '</tr>';
        }

        tableHTML += '</tbody>';
        matrixTable.innerHTML = tableHTML;

        // --- 3. Render Passive Tower Cards ---
        const passivesContainer = document.getElementById('intel-passives');
        if (!passivesContainer) return;

        let passiveHTML = '<div class="intel-passive-cards">';
        for (const pKey of passiveTowerKeys) {
            const tower = TOWER_TYPES[pKey];
            passiveHTML += `<div class="intel-passive-card" style="border-left: 3px solid ${tower.color}">`;
            passiveHTML += `<div class="intel-passive-icon">${tower.symbol}</div>`;
            passiveHTML += `<div><h4 style="color:${tower.color}">${tower.name}</h4>`;
            passiveHTML += `<p>${tower.passiveEffect || tower.description}</p>`;
            passiveHTML += `<p style="margin-top:4px;font-style:italic;color:#64748b;">${tower.educationalNote}</p>`;
            passiveHTML += `</div></div>`;
        }
        passiveHTML += '</div>';
        passivesContainer.innerHTML = passiveHTML;
    }
}
