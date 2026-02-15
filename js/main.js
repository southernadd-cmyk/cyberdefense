// ========================================
// CYBER DEFENSE SIMULATOR - ENTRY POINT
// Initializes game, sets up event listeners
// Including educational system wiring
// ========================================

import { STATE, LEVELS } from './config.js';
import { Game } from './game.js';
import { UIManager } from './ui.js';
import { loadIconImages } from './iconImages.js';
// --- Initialize ---
loadIconImages(); // Preload tower/threat/asset SVG icons (fallback to inline until loaded)
const canvas = document.getElementById('game-canvas');
const gameContainer = document.getElementById('game-container');
const game = new Game(canvas);
const ui = new UIManager(game);

/** Map a pointer event to canvas coordinates (use container so padding area still maps to canvas). */
function eventToCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let canvasX = (e.clientX - rect.left) * scaleX;
    let canvasY = (e.clientY - rect.top) * scaleY;
    return { canvasX, canvasY };
}

// --- Game Callbacks ---
game.onStateChange = (state) => {
    switch (state) {
        case STATE.PLANNING:
        case STATE.PLAYING:
        case STATE.WAVE_BREAK:
            ui.updateHUD();
            ui.updateTowerInfoPanel();
            break;
        case STATE.PAUSED:
            // Only show the pause modal for user-initiated pauses,
            // NOT when paused by quiz/edu popups (system pauses)
            if (!game._isSystemPause) {
                ui.showModal('pause');
            }
            break;
        case STATE.LEVEL_COMPLETE:
            ui.showLevelComplete();
            break;
        case STATE.GAME_OVER:
            ui.showGameOver();
            break;
    }
};

game.onNotification = (message, type) => {
    ui.showNotification(message, type);
};

game.onEduPopup = (popup) => {
    ui.showEduPopup(popup);
};

game.onWaveChange = (current, total) => {
    // HUD updates automatically via interval
};

// --- Educational System Callbacks ---
game.onQuizRequest = (levelId) => {
    ui.showQuiz(levelId, () => {
        // Quiz completed callback - game resumes automatically
    });
};

game.onShowDYK = () => {
    ui.startDYKRotation();
};

game.onHideDYK = () => {
    ui.hideDYK();
};

game.onThreatHover = (threat) => {
    if (threat) {
        ui.showThreatInfo(threat);
    } else {
        ui.hideThreatInfo();
    }
};

// --- Game area event listeners (on container so bottom padding still counts as bottom row) ---
gameContainer.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const inCanvas = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inCanvas) return;
    const { canvasX, canvasY } = eventToCanvasCoords(e);
    game.handleCanvasClick(canvasX, canvasY);
});

gameContainer.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const inCanvas = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inCanvas) {
        game.hoveredCell = null;
        ui.hideThreatInfo();
        return;
    }
    const { canvasX, canvasY } = eventToCanvasCoords(e);
    game.handleCanvasMouseMove(canvasX, canvasY);
});

gameContainer.addEventListener('contextmenu', (e) => {
    const rect = canvas.getBoundingClientRect();
    const inCanvas = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inCanvas) return;
    e.preventDefault();
    game.handleRightClick();
});

gameContainer.addEventListener('mouseleave', () => {
    game.hoveredCell = null;
    ui.hideThreatInfo();
});

// --- Main Menu Buttons ---
document.getElementById('btn-play').addEventListener('click', () => {
    ui.showLevelSelect();
});

document.getElementById('btn-encyclopedia').addEventListener('click', () => {
    ui.showEncyclopedia();
});

document.getElementById('btn-knowledge').addEventListener('click', () => {
    ui.showKnowledgeTracker();
});

document.getElementById('btn-intel').addEventListener('click', () => {
    ui.showIntelBriefing('mainMenu');
});

document.getElementById('btn-achievements').addEventListener('click', () => {
    ui.showAchievements();
});

// --- Level Select ---
document.getElementById('btn-back-menu').addEventListener('click', () => {
    ui.showMainMenu();
});

// --- Game HUD Buttons ---
document.getElementById('btn-pause').addEventListener('click', () => {
    if (game.state === STATE.PAUSED) {
        game.resume();
        ui.hideModal('pause');
    } else {
        game.pause();
    }
});

document.getElementById('btn-speed').addEventListener('click', () => {
    const speed = game.toggleSpeed();
    const btn = document.getElementById('btn-speed');
    btn.textContent = speed === 1 ? '\u25B6\u25B6' : speed === 2 ? '\u25B6\u25B6\u25B6' : '\u25B6';
    ui.showNotification(`Speed: ${speed}x`, 'info');
});

document.getElementById('btn-menu-ingame').addEventListener('click', () => {
    game.pause();
});

// --- Pause Modal ---
document.getElementById('btn-resume').addEventListener('click', () => {
    game.resume();
    ui.hideModal('pause');
});

document.getElementById('btn-restart').addEventListener('click', () => {
    ui.hideModal('pause');
    ui.hideDYK();
    game.loadLevel(game.currentLevelIndex);
    ui.renderTowerSidebar();
    ui.showLevelIntro(LEVELS[game.currentLevelIndex]);
});

document.getElementById('btn-quit').addEventListener('click', () => {
    ui.hideAllModals();
    ui.stopHudUpdates();
    ui.hideDYK();
    ui.hideThreatInfo();
    game.stop();
    game.state = STATE.MENU;
    ui.showMainMenu();
});

// --- Level Intro ---
document.getElementById('btn-start-level').addEventListener('click', () => {
    ui.hideModal('levelIntro');

    // Remove any dynamically added case study boxes (clean up for next time)
    document.querySelectorAll('.case-study-box').forEach(el => el.remove());

    game.state = STATE.PLANNING;
    game.planningTimer = 30000;
    game.start();
});

// --- Level Complete ---
document.getElementById('btn-next-level').addEventListener('click', () => {
    ui.hideModal('levelComplete');
    ui.hideDYK();

    // Trigger end-of-level assessment before proceeding
    const levelId = game.levelConfig.id;
    ui.startAssessment(levelId, (score) => {
        // Assessment complete — now proceed to next level
        const nextIndex = game.currentLevelIndex + 1;
        if (nextIndex < LEVELS.length) {
            game.loadLevel(nextIndex);
            ui.renderTowerSidebar();
            ui.showLevelIntro(LEVELS[nextIndex]);
        } else {
            game.state = STATE.MENU;
            ui.showLevelSelect();
        }
    });
});

document.getElementById('btn-back-levels').addEventListener('click', () => {
    ui.hideModal('levelComplete');
    ui.hideDYK();

    // Trigger assessment even when going back to level select
    const levelId = game.levelConfig.id;
    ui.startAssessment(levelId, () => {
        ui.stopHudUpdates();
        game.state = STATE.MENU;
        ui.showLevelSelect();
    });
});

// --- Game Over ---
document.getElementById('btn-retry').addEventListener('click', () => {
    ui.hideModal('gameOver');
    ui.hideDYK();
    game.loadLevel(game.currentLevelIndex);
    ui.renderTowerSidebar();
    ui.showLevelIntro(LEVELS[game.currentLevelIndex]);
});

document.getElementById('btn-back-levels2').addEventListener('click', () => {
    ui.hideModal('gameOver');
    ui.stopHudUpdates();
    ui.hideDYK();
    game.state = STATE.MENU;
    ui.showLevelSelect();
});

// --- Tower Actions ---
document.getElementById('btn-upgrade').addEventListener('click', () => {
    if (game.selectedTower) {
        game.upgradeTower(game.selectedTower);
    }
});

document.getElementById('btn-sell').addEventListener('click', () => {
    if (game.selectedTower) {
        game.sellTower(game.selectedTower);
        ui.updateTowerInfoPanel();
    }
});

// --- Encyclopedia ---
document.getElementById('btn-back-enc').addEventListener('click', () => {
    ui.showMainMenu();
});

// --- Intel Briefing ---
document.getElementById('btn-back-intel').addEventListener('click', () => {
    // Return to wherever the user came from
    if (ui.intelReturnTo === 'levelIntro') {
        ui.showScreen('gameScreen');
        ui.showModal('levelIntro');
    } else {
        ui.showMainMenu();
    }
});

document.getElementById('btn-view-intel').addEventListener('click', () => {
    ui.hideModal('levelIntro');
    ui.showIntelBriefing('levelIntro');
});

// --- Knowledge Tracker ---
document.getElementById('btn-back-knowledge').addEventListener('click', () => {
    ui.showMainMenu();
});

// --- Achievements ---
document.getElementById('btn-back-ach').addEventListener('click', () => {
    ui.showMainMenu();
});

// --- Educational Popup ---
document.getElementById('btn-close-edu').addEventListener('click', () => {
    ui.closeEduPopup();
});

// --- Quiz Modal ---
document.getElementById('btn-quiz-continue').addEventListener('click', () => {
    ui.closeQuiz();
});

// --- Assessment Modal ---
document.getElementById('btn-assess-next').addEventListener('click', () => {
    ui.advanceAssessment();
});

document.getElementById('btn-assess-done').addEventListener('click', () => {
    ui.closeAssessment();
});

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    if (game.state === STATE.PLANNING || game.state === STATE.PLAYING || game.state === STATE.WAVE_BREAK) {
        switch (e.key) {
            case 'Escape':
                if (game.selectedTowerType) {
                    game.selectedTowerType = null;
                    ui.elements.towerList.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
                } else if (game.selectedTower) {
                    game.selectedTower.selected = false;
                    game.selectedTower = null;
                    ui.updateTowerInfoPanel();
                } else {
                    game.pause();
                }
                break;
            case ' ':
                e.preventDefault();
                if (game.state === STATE.PLANNING) {
                    game.skipPlanning();
                }
                break;
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9': {
                const idx = parseInt(e.key) - 1;
                if (game.levelConfig && idx < game.levelConfig.availableTowers.length) {
                    ui.selectTowerType(game.levelConfig.availableTowers[idx]);
                }
                break;
            }
        }
    } else if (game.state === STATE.PAUSED) {
        if (e.key === 'Escape') {
            game.resume();
            ui.hideModal('pause');
        }
    }
});

// --- Canvas Resize Handler ---
function resizeCanvas() {
    const container = document.getElementById('game-container');
    if (!container) return;

    const availableWidth = container.clientWidth - 220;
    const availableHeight = container.clientHeight;

    const scaleX = availableWidth / canvas.width;
    const scaleY = availableHeight / canvas.height;
    const scale = Math.min(scaleX, scaleY, 1);

    canvas.style.width = (canvas.width * scale) + 'px';
    canvas.style.height = (canvas.height * scale) + 'px';
}

window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

// --- Initial State ---
ui.showMainMenu();

console.log('Cyber Defense Simulator loaded successfully!');
console.log('BTEC IT Unit 1 - Learning Aim D');
console.log('Educational features: Quiz system, Knowledge Tracker, Case Studies, Did You Know tips');
