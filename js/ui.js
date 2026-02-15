// ========================================
// CYBER DEFENSE SIMULATOR - UI MANAGER
// Handles all DOM-based UI interactions
// Including educational systems: quiz, knowledge tracker, case studies
// ========================================

import {
    STATE, TOWER_TYPES, THREAT_TYPES, LEVELS, ACHIEVEMENTS, ENCYCLOPEDIA,
    QUIZ_QUESTIONS, CASE_STUDIES, DID_YOU_KNOW_TIPS, SPEC_TOPICS, THREAT_COUNTERS,
    SYNERGIES, getEncyclopediaEntryCount
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
            quiz: document.getElementById('quiz-modal'),
            assessment: document.getElementById('assessment-modal')
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
        this.elements.didYouKnow.addEventListener('mouseenter', () => {
            this.elements.didYouKnow.classList.add('dyk-dismissed');
        });

        // Threat info state
        this.hoveredThreat = null;

        // Assessment state (end-of-level mini-assessment)
        this.assessmentQuestions = [];
        this.assessmentIndex = 0;
        this.assessmentScore = 0;
        this.assessmentAnswered = false;
        this.assessmentCallback = null;
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
                    ${Array.from({ length: 10 }, (_, i) =>
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

    /** Returns a copy of the question with options shuffled and correct index updated. */
    shuffleQuestionOptions(q) {
        if (!q || !q.options || q.options.length === 0) return q;
        const options = [...q.options];
        const correctAnswer = options[q.correct];
        // Fisher-Yates shuffle
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        const newCorrect = options.indexOf(correctAnswer);
        return { ...q, options, correct: newCorrect };
    }

    getQuizQuestion(levelId) {
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
        const rawQuestion = this.getQuizQuestion(levelId);
        if (!rawQuestion) {
            if (callback) callback(false);
            return;
        }
        const question = this.shuffleQuestionOptions(rawQuestion);

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
            btn.textContent = option.replace(/^[A-D]\)\s*/i, '');
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

        // Track mastery data
        this._recordQuizResult(question.specRef, isCorrect);

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

        // Build feedback content: explanation + remediation (if wrong) + source
        let feedbackHtml = `<p>${question.explanation}</p>`;

        if (!isCorrect && question.remediation) {
            feedbackHtml += `<div class="quiz-remediation">
                <div class="quiz-remediation-label">\uD83D\uDCD6 WHY THIS IS THE CORRECT ANSWER:</div>
                <p>${question.remediation}</p>
            </div>`;
        }

        if (question.source) {
            feedbackHtml += `<div class="quiz-source">Source: ${question.source}</div>`;
        }

        document.getElementById('quiz-explanation').innerHTML = feedbackHtml;

        // For correct answers: show continue button immediately
        // For wrong answers: delay the continue button to force reading the remediation
        const continueBtn = document.getElementById('btn-quiz-continue');
        if (isCorrect) {
            continueBtn.classList.remove('hidden');
            continueBtn.textContent = 'CONTINUE';
        } else {
            continueBtn.classList.add('hidden');
            continueBtn.textContent = 'I HAVE READ THE EXPLANATION \u2014 CONTINUE';
            // Show after 4 seconds to force reading
            this._quizContinueTimer = setTimeout(() => {
                continueBtn.classList.remove('hidden');
            }, 4000);
        }
    }

    // Record quiz result for mastery tracking (per D1-D5)
    _recordQuizResult(specRef, isCorrect) {
        if (!specRef) return;
        // Extract spec ID like "D1", "D2", etc.
        const specId = specRef.match(/D[1-5]/)?.[0];
        if (!specId) return;

        if (!this.game.progress.mastery) {
            this.game.progress.mastery = {};
        }
        if (!this.game.progress.mastery[specId]) {
            this.game.progress.mastery[specId] = { correct: 0, attempted: 0 };
        }
        this.game.progress.mastery[specId].attempted++;
        if (isCorrect) {
            this.game.progress.mastery[specId].correct++;
        }
        this.game.saveProgress();
    }

    // ============================================================
    //  END-OF-LEVEL ASSESSMENT
    //  A 3-question mini-assessment shown after completing a level.
    //  Questions are selected from the level pool + general pool,
    //  covering diverse spec areas (D1-D5).
    // ============================================================

    startAssessment(levelId, callback) {
        this.assessmentCallback = callback;
        this.assessmentScore = 0;
        this.assessmentIndex = 0;
        this.assessmentAnswered = false;

        const levelQs = QUIZ_QUESTIONS[levelId] || [];
        const generalQs = QUIZ_QUESTIONS.general || [];
        const allQs = [...levelQs, ...generalQs];

        // Group questions by spec area
        const bySpec = {};
        for (const q of allQs) {
            const specId = q.specRef.match(/D[1-5]/)?.[0] || 'D1';
            if (!bySpec[specId]) bySpec[specId] = [];
            bySpec[specId].push(q);
        }

        // Pick questions covering as many different spec areas as possible
        const selected = [];
        const specKeys = Object.keys(bySpec).sort(() => Math.random() - 0.5);

        // Round 1: one question from each spec area
        for (const specId of specKeys) {
            if (selected.length >= 3) break;
            const pool = bySpec[specId].filter(q => !selected.includes(q));
            if (pool.length > 0) {
                selected.push(pool[Math.floor(Math.random() * pool.length)]);
            }
        }

        // Round 2: fill remaining from random spec areas
        while (selected.length < 3 && allQs.length > selected.length) {
            const remaining = allQs.filter(q => !selected.includes(q));
            if (remaining.length === 0) break;
            selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
        }

        // Shuffle options for each question so correct answer isn't always in the same position
        this.assessmentQuestions = selected.map(q => this.shuffleQuestionOptions(q));

        // Set up UI
        document.getElementById('assessment-level-label').textContent = `Level ${levelId}`;
        document.getElementById('assessment-results').classList.add('hidden');
        document.getElementById('assessment-question-area').classList.remove('hidden');

        // Render progress dots
        this._renderAssessmentDots();

        // Show first question
        this._showAssessmentQuestion();
        this.showModal('assessment');
    }

    _renderAssessmentDots() {
        const container = document.getElementById('assessment-progress');
        container.innerHTML = '';
        for (let i = 0; i < this.assessmentQuestions.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'assessment-dot';
            dot.id = `assess-dot-${i}`;
            if (i === this.assessmentIndex) dot.classList.add('active');
            container.appendChild(dot);
        }
    }

    _showAssessmentQuestion() {
        const q = this.assessmentQuestions[this.assessmentIndex];
        if (!q) return;

        this.assessmentAnswered = false;

        document.getElementById('assess-spec-ref').textContent = `BTEC SPEC: ${q.specRef}`;
        document.getElementById('assess-question').textContent = q.question;

        // Build options
        const optionsContainer = document.getElementById('assess-options');
        optionsContainer.innerHTML = '';
        q.options.forEach((option, index) => {
            const btn = document.createElement('div');
            btn.className = 'quiz-option';
            btn.textContent = option.replace(/^[A-D]\)\s*/i, '');
            btn.addEventListener('click', () => this._answerAssessment(index));
            optionsContainer.appendChild(btn);
        });

        // Hide feedback and next button
        document.getElementById('assess-feedback').classList.add('hidden');
        document.getElementById('btn-assess-next').classList.add('hidden');

        // Update dots
        for (let i = 0; i < this.assessmentQuestions.length; i++) {
            const dot = document.getElementById(`assess-dot-${i}`);
            if (dot) {
                dot.classList.toggle('active', i === this.assessmentIndex);
            }
        }
    }

    _answerAssessment(selectedIndex) {
        if (this.assessmentAnswered) return;
        this.assessmentAnswered = true;

        const q = this.assessmentQuestions[this.assessmentIndex];
        const isCorrect = selectedIndex === q.correct;

        // Track mastery
        this._recordQuizResult(q.specRef, isCorrect);

        if (isCorrect) this.assessmentScore++;

        // Highlight options
        const options = document.querySelectorAll('#assess-options .quiz-option');
        options.forEach((opt, i) => {
            opt.classList.add('disabled');
            if (i === q.correct) opt.classList.add('correct');
            if (i === selectedIndex && !isCorrect) opt.classList.add('incorrect');
        });

        // Update dot
        const dot = document.getElementById(`assess-dot-${this.assessmentIndex}`);
        if (dot) {
            dot.classList.remove('active');
            dot.classList.add(isCorrect ? 'correct' : 'incorrect');
        }

        // Show feedback
        const feedbackEl = document.getElementById('assess-feedback');
        feedbackEl.classList.remove('hidden');

        const resultIcon = document.getElementById('assess-result-icon');
        resultIcon.textContent = isCorrect ? '\u2714 CORRECT!' : '\u2718 INCORRECT';
        resultIcon.className = `quiz-result-icon ${isCorrect ? 'correct' : 'incorrect'}`;

        // Build explanation with remediation if wrong
        let html = `<p>${q.explanation}</p>`;
        if (!isCorrect && q.remediation) {
            html += `<div class="quiz-remediation">
                <div class="quiz-remediation-label">\uD83D\uDCD6 WHY THIS IS THE CORRECT ANSWER:</div>
                <p>${q.remediation}</p>
            </div>`;
        }
        if (q.source) {
            html += `<div class="quiz-source">Source: ${q.source}</div>`;
        }
        document.getElementById('assess-explanation').innerHTML = html;

        // Show next button (with delay for wrong answers)
        const nextBtn = document.getElementById('btn-assess-next');
        const isLast = this.assessmentIndex >= this.assessmentQuestions.length - 1;
        nextBtn.textContent = isLast ? 'SEE RESULTS' : 'NEXT QUESTION';

        if (isCorrect) {
            nextBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.add('hidden');
            nextBtn.textContent = isLast
                ? 'I HAVE READ THE EXPLANATION \u2014 SEE RESULTS'
                : 'I HAVE READ THE EXPLANATION \u2014 NEXT';
            this._assessContinueTimer = setTimeout(() => {
                nextBtn.classList.remove('hidden');
            }, 4000);
        }
    }

    advanceAssessment() {
        // Clear timer
        if (this._assessContinueTimer) {
            clearTimeout(this._assessContinueTimer);
            this._assessContinueTimer = null;
        }

        this.assessmentIndex++;

        if (this.assessmentIndex >= this.assessmentQuestions.length) {
            this._showAssessmentResults();
        } else {
            this._showAssessmentQuestion();
        }
    }

    _showAssessmentResults() {
        document.getElementById('assessment-question-area').classList.add('hidden');
        document.getElementById('assessment-results').classList.remove('hidden');

        const total = this.assessmentQuestions.length;
        const score = this.assessmentScore;
        const pct = Math.round((score / total) * 100);

        const scoreEl = document.getElementById('assess-score-value');
        scoreEl.textContent = `${score}/${total}`;
        scoreEl.className = `assessment-score-value ${score >= 2 ? 'pass' : 'fail'}`;

        const labelEl = document.getElementById('assess-score-label');
        if (score === total) {
            labelEl.textContent = 'PERFECT SCORE! You have demonstrated strong understanding of these topics.';
        } else if (score >= 2) {
            labelEl.textContent = 'Good understanding. Review the explanations for any questions you missed.';
        } else {
            labelEl.textContent = 'Keep learning! Review the explanations carefully and try the encyclopedia for more detail.';
        }

        // Show which spec areas were tested
        const specsCovered = [...new Set(this.assessmentQuestions.map(q => q.specRef))];
        const summaryEl = document.getElementById('assess-topics-summary');
        summaryEl.innerHTML = `
            <h4>SPEC AREAS ASSESSED</h4>
            <p>${specsCovered.join(' \u2022 ')}</p>
            <p style="margin-top:6px;">Your mastery data has been updated in the Knowledge Tracker.</p>
        `;
    }

    closeAssessment() {
        this.hideModal('assessment');
        if (this._assessContinueTimer) {
            clearTimeout(this._assessContinueTimer);
            this._assessContinueTimer = null;
        }
        if (this.assessmentCallback) {
            this.assessmentCallback(this.assessmentScore);
            this.assessmentCallback = null;
        }
    }

    closeQuiz() {
        this.hideModal('quiz');

        // Clear any remediation timer
        if (this._quizContinueTimer) {
            clearTimeout(this._quizContinueTimer);
            this._quizContinueTimer = null;
        }

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

        // Synergy status
        let synergyHtml = '';
        if (threat.synergyEffects) {
            const activeBuffs = [];
            if (threat.synergyEffects.credentialBreach) {
                activeBuffs.push(`<span style="color:#f97316;">\uD83D\uDD17 Credential Breach (+50% speed)</span>`);
            }
            if (threat.synergyEffects.coverFire) {
                activeBuffs.push(`<span style="color:#3b82f6;">\uD83D\uDEE1 DDoS Cover Fire (40% miss chance)</span>`);
            }
            if (threat.synergyEffects.snifferBuff) {
                activeBuffs.push(`<span style="color:#d946ef;">\uD83D\uDC41 Sniffer Intel (+30% speed, 20% resist)</span>`);
            }
            if (threat.synergyEffects.scanned) {
                activeBuffs.push(`<span style="color:#22d3ee;">\uD83D\uDD0D Proxy Scanned (slowed + extra damage)</span>`);
            }
            if (threat.inSegmentationZone) {
                activeBuffs.push(`<span style="color:#6366f1;">\uD83D\uDDFA In Segmentation Zone (synergies blocked)</span>`);
            }
            if (activeBuffs.length > 0) {
                synergyHtml = `<div style="margin-top:6px;padding-top:4px;border-top:1px solid #ffffff22;">
                    <strong style="color:#fbbf24;font-size:0.7rem;">\u26A1 ACTIVE SYNERGIES:</strong><br>
                    ${activeBuffs.join('<br>')}
                </div>`;
            }
        }

        // Insert synergy info after defense section
        const defenseEl = document.getElementById('threat-info-defense');
        let synergyEl = document.getElementById('threat-info-synergy');
        if (!synergyEl) {
            synergyEl = document.createElement('div');
            synergyEl.id = 'threat-info-synergy';
            synergyEl.style.fontSize = '0.72rem';
            defenseEl.parentNode.insertBefore(synergyEl, defenseEl.nextSibling);
        }
        synergyEl.innerHTML = synergyHtml;

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
        this.elements.dykSpec.textContent = `BTEC SPEC: ${tip.specRef}${tip.source ? ` \u2022 Source: ${tip.source}` : ''}`;
        this.elements.didYouKnow.classList.remove('hidden', 'dyk-dismissed');
    }

    hideDYK() {
        this.elements.didYouKnow.classList.add('hidden');
        this.elements.didYouKnow.classList.remove('dyk-dismissed');
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
        const mastery = this.game.progress.mastery || {};

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

        // Overall mastery (average across all spec areas)
        let totalCorrect = 0;
        let totalAttempted = 0;
        for (const specId of ['D1', 'D2', 'D3', 'D4', 'D5']) {
            const m = mastery[specId];
            if (m) {
                totalCorrect += m.correct;
                totalAttempted += m.attempted;
            }
        }
        const overallMasteryPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        const overallCoveredPct = totalSubs > 0 ? Math.round((coveredSubs / totalSubs) * 100) : 0;

        const overallDiv = document.createElement('div');
        overallDiv.className = 'knowledge-topic';
        overallDiv.style.borderColor = '#00d4ff';
        overallDiv.innerHTML = `
            <div class="knowledge-topic-header">
                <div class="knowledge-topic-title">OVERALL LEARNING AIM D PROGRESS</div>
                <div class="knowledge-progress-badge ${overallCoveredPct === 100 ? 'complete' : overallCoveredPct > 0 ? 'partial' : 'not-started'}">${overallCoveredPct}% COVERED</div>
            </div>
            <div class="mastery-bar-container">
                <span class="mastery-label" style="color:#00d4ff;">Covered</span>
                <div class="mastery-bar"><div class="mastery-bar-fill covered" style="width:${overallCoveredPct}%"></div></div>
                <span class="mastery-label">${overallCoveredPct}%</span>
            </div>
            <div class="mastery-bar-container">
                <span class="mastery-label" style="color:#00ff88;">Mastered</span>
                <div class="mastery-bar"><div class="mastery-bar-fill mastered" style="width:${overallMasteryPct}%"></div></div>
                <span class="mastery-label">${totalAttempted > 0 ? `${overallMasteryPct}% (${totalCorrect}/${totalAttempted})` : 'No questions attempted'}</span>
            </div>
            <p style="font-size:0.78rem;color:#94a3b8;margin-top:8px;">
                <strong style="color:#00d4ff;">Covered</strong> = topic encountered through gameplay.
                <strong style="color:#00ff88;">Mastered</strong> = questions answered correctly in quizzes/assessments.
                Complete all ${LEVELS.length} levels and answer questions correctly to reach 100% in both.
            </p>
        `;
        container.appendChild(overallDiv);

        // Per-topic progress with mastery
        for (const topic of SPEC_TOPICS) {
            let topicTotal = topic.subtopics.length;
            let topicCovered = 0;
            const topicMastery = mastery[topic.id] || { correct: 0, attempted: 0 };
            const masteryPct = topicMastery.attempted > 0 ? Math.round((topicMastery.correct / topicMastery.attempted) * 100) : 0;

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

            // Determine status based on both coverage and mastery
            let statusClass, statusText;
            if (topicPct === 100 && masteryPct >= 80) {
                statusClass = 'complete';
                statusText = 'MASTERED';
            } else if (topicPct === 100) {
                statusClass = 'partial';
                statusText = 'COVERED';
            } else if (topicPct > 0) {
                statusClass = 'partial';
                statusText = `${topicPct}% COVERED`;
            } else {
                statusClass = 'not-started';
                statusText = 'NOT STARTED';
            }

            // Mastery badge
            let masteryBadge = '';
            if (topicMastery.attempted > 0) {
                const mClass = masteryPct >= 80 ? 'mastered' : 'in-progress';
                masteryBadge = `<span class="mastery-badge ${mClass}">${masteryPct}% (${topicMastery.correct}/${topicMastery.attempted})</span>`;
            } else {
                masteryBadge = `<span class="mastery-badge not-attempted">Not assessed</span>`;
            }

            const topicDiv = document.createElement('div');
            topicDiv.className = 'knowledge-topic';
            topicDiv.innerHTML = `
                <div class="knowledge-topic-header">
                    <div class="knowledge-topic-title">${topic.title}</div>
                    <div class="knowledge-progress-badge ${statusClass}">${statusText}</div>
                </div>
                <div class="mastery-bar-container">
                    <span class="mastery-label" style="color:#00d4ff;">Covered</span>
                    <div class="mastery-bar"><div class="mastery-bar-fill covered" style="width:${topicPct}%"></div></div>
                    <span class="mastery-label">${topicPct}%</span>
                </div>
                <div class="mastery-bar-container">
                    <span class="mastery-label" style="color:#00ff88;">Mastered</span>
                    <div class="mastery-bar"><div class="mastery-bar-fill mastered" style="width:${masteryPct}%"></div></div>
                    <span class="mastery-label">${masteryBadge}</span>
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
                    <p>${this.getAchievementDescription(ach)}</p>
                </div>
            `;

            grid.appendChild(card);
        }
    }

    checkAchievement(achievement) {
        const p = this.game.progress;
        switch (achievement.condition) {
            case 'levels_completed >= 1': return p.levelsCompleted.length >= 1;
            case 'levels_completed_all': return p.levelsCompleted.length >= LEVELS.length;
            case 'no_damage_level': return Object.values(p.levelStars).some(s => s === 3);
            case 'budget_remaining_50': return p.budgetRemaining50Achieved === true;
            case 'synergy_firewall_ids': return (p.synergyPairsUsed || []).includes('firewall|ids');
            case 'synergy_encryption_backup': return (p.synergyPairsUsed || []).includes('encryption|backup');
            case 'synergy_proxy_encryption': return (p.synergyPairsUsed || []).includes('encryption|proxyNode');
            case 'synergy_quarantine_backup': return (p.synergyPairsUsed || []).includes('backup|quarantine');
            case 'tower_variety_5': return p.towersEverUsed.length >= 5;
            case 'all_towers_used': return p.towersEverUsed.length >= Object.keys(TOWER_TYPES).length;
            case 'all_encyclopedia_read': return (p.encyclopediaRead || []).length >= getEncyclopediaEntryCount();
            case 'score_10000': return p.highScore >= 10000;
            case 'ransomware_kills_10': return p.totalRansomwareKills >= 10;
            default: return false;
        }
    }

    /** Returns display description for an achievement, with dynamic thresholds from LEVELS/TOWER_TYPES/ENCYCLOPEDIA. */
    getAchievementDescription(achievement) {
        const totalLevels = LEVELS.length;
        const totalTowers = Object.keys(TOWER_TYPES).length;
        const totalEncyclopedia = getEncyclopediaEntryCount();
        switch (achievement.id) {
            case 'all_levels': return `Complete all ${totalLevels} levels`;
            case 'all_towers': return `Use all ${totalTowers} tower types across your games`;
            case 'encyclopedist': return `Read all ${totalEncyclopedia} encyclopedia entries`;
            default: return achievement.description;
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

        // --- 4. Render Threat Synergies Panel ---
        const synergiesContainer = document.getElementById('intel-synergies');
        if (!synergiesContainer) return;

        let synHTML = '<div class="intel-synergy-cards">';
        for (const [key, syn] of Object.entries(SYNERGIES)) {
            // Gather the threat icons for the "requires" list
            const reqIcons = syn.requires.map(tKey => {
                const t = THREAT_TYPES[tKey];
                return t ? `<span class="synergy-req-icon" style="background:${t.color}22;color:${t.color}" title="${t.name}">${t.symbol}</span>` : tKey;
            }).join(' <span class="synergy-plus">+</span> ');

            // Which threats benefit
            let benefitHTML = '';
            if (syn.target) {
                const t = THREAT_TYPES[syn.target];
                if (t) benefitHTML = `<span class="synergy-benefit" style="color:${t.color}">${t.symbol} ${t.name}</span>`;
            } else if (syn.protects) {
                benefitHTML = syn.protects.map(tKey => {
                    const t = THREAT_TYPES[tKey];
                    return t ? `<span class="synergy-benefit" style="color:${t.color}">${t.symbol} ${t.name}</span>` : tKey;
                }).join(', ');
            } else if (syn.effect === 'aura') {
                benefitHTML = '<span class="synergy-benefit" style="color:#d946ef;">All threats in range</span>';
            }

            // Build effect summary
            let effectLines = [];
            if (syn.speedMultiplier && syn.speedMultiplier > 1) {
                effectLines.push(`<span class="synergy-effect-tag speed">+${Math.round((syn.speedMultiplier - 1) * 100)}% Speed</span>`);
            }
            if (syn.missChance) {
                effectLines.push(`<span class="synergy-effect-tag miss">${Math.round(syn.missChance * 100)}% Tower Miss</span>`);
            }
            if (syn.damageResist) {
                effectLines.push(`<span class="synergy-effect-tag resist">${Math.round(syn.damageResist * 100)}% Damage Resist</span>`);
            }
            if (syn.range) {
                effectLines.push(`<span class="synergy-effect-tag range">${syn.range}px Range</span>`);
            }

            // Counters: segmentation zone + proxy DPI
            const counterHTML = `<div class="synergy-counter"><span class="synergy-counter-icon">\uD83D\uDDFA</span> Blocked by <strong>Segmentation Zone</strong></div>`
                + `<div class="synergy-counter"><span class="synergy-counter-icon">\uD83C\uDF10</span> Stripped by <strong>Proxy Node</strong> (Deep Packet Inspection)</div>`;

            synHTML += `<div class="intel-synergy-card" style="border-left: 3px solid ${syn.color}">`;
            synHTML += `  <div class="synergy-card-header">`;
            synHTML += `    <span class="synergy-card-icon" style="background:${syn.color}20;color:${syn.color}">${syn.icon}</span>`;
            synHTML += `    <div>`;
            synHTML += `      <h4 style="color:${syn.color}">${syn.name}</h4>`;
            synHTML += `      <div class="synergy-requires">Requires: ${reqIcons}</div>`;
            synHTML += `    </div>`;
            synHTML += `  </div>`;
            synHTML += `  <p class="synergy-desc">${syn.description}</p>`;
            synHTML += `  <div class="synergy-effects-row">`;
            synHTML += `    <div class="synergy-buffs-label">Buffs: ${benefitHTML}</div>`;
            synHTML += `    <div class="synergy-effect-tags">${effectLines.join(' ')}</div>`;
            synHTML += `  </div>`;
            synHTML += `  ${counterHTML}`;
            synHTML += `  <p class="synergy-edu">\uD83D\uDCDA ${syn.educationalNote}</p>`;
            synHTML += `</div>`;
        }
        synHTML += '</div>';
        synergiesContainer.innerHTML = synHTML;
    }
}
