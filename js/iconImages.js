// ========================================
// ICON IMAGE LOADER - SVG icons for towers, threats, assets
// ========================================

const ICON_BASE = 'images/';

const TOWER_FILES = {
    firewall: 'tower_firewall.svg',
    antivirus: 'tower_antivirus.svg',
    emailFilter: 'tower_email_filter.svg',
    encryption: 'tower_encryption.svg',
    ids: 'tower_ids_ips.svg',
    accessControl: 'tower_access_control.svg',
    backup: 'tower_backup_system.svg',
    training: 'tower_security_training.svg',
    patchMgmt: 'tower_patch_management.svg',
    proxyNode: 'tower_proxy_node.svg',
    quarantine: 'tower_quarantine.svg',
    segmentation: 'tower_segmentation.svg'
};

const THREAT_FILES = {
    phishing: 'threat_phishing_email.svg',
    malware: 'threat_malware.svg',
    ransomware: 'threat_ransomware.svg',
    ddos: 'threat_ddos_attack.svg',
    sqlInjection: 'threat_sql_injection.svg',
    trojan: 'threat_trojan_horse.svg',
    trojan_hidden: 'threat_hidden_trojan.svg',
    insider: 'threat_insider_threat.svg',
    zeroDay: 'threat_zero_day_exploit.svg',
    sniffer: 'threat_network_sniffer.svg'
};

const cache = new Map();
const loadingPaths = new Set(); // paths currently loading (avoids duplicate requests, no cache placeholder)

function loadImage(path) {
    if (cache.has(path)) return Promise.resolve(cache.get(path));
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            cache.set(path, img);
            resolve(img);
        };
        img.onerror = () => {
            cache.set(path, null);
            resolve(null);
        };
        img.src = path;
    });
}

/**
 * Load all tower, threat, and known asset SVGs. Call at game start.
 */
export function loadIconImages() {
    const promises = [];
    Object.values(TOWER_FILES).forEach((f) => promises.push(loadImage(ICON_BASE + f)));
    Object.values(THREAT_FILES).forEach((f) => promises.push(loadImage(ICON_BASE + f)));
    const assetFiles = [
        'asset_file_server.svg', 'asset_student_database.svg', 'asset_staff_systems.svg',
        'asset_patient_records.svg', 'asset_medical_systems.svg', 'asset_payment_database.svg',
        'asset_customer_portal.svg', 'asset_order_system.svg', 'asset_classified_data.svg',
        'asset_citizen_portal.svg', 'asset_email_system.svg', 'asset_scada_control.svg',
        'asset_power_grid_db.svg', 'asset_monitoring_system.svg',
        'asset_transaction_database.svg', 'asset_atm_network.svg', 'asset_trading_platform.svg',
        'asset_cloud_storage.svg', 'asset_api_gateway.svg', 'asset_customer_vms.svg', 'asset_admin_console.svg',
        'asset_intelligence_database.svg', 'asset_secure_comms_network.svg', 'asset_threat_alert_system.svg', 'asset_research_laboratory.svg',
        'asset_satellite_uplink.svg', 'asset_command_centre.svg', 'asset_defence_grid.svg', 'asset_intel_hub.svg'
    ];
    assetFiles.forEach((f) => promises.push(loadImage(ICON_BASE + f)));
    return Promise.all(promises);
}

export function getTowerImage(towerType) {
    const file = TOWER_FILES[towerType];
    if (!file) return null;
    return cache.get(ICON_BASE + file) || null;
}

export function getThreatImage(threatType) {
    const file = THREAT_FILES[threatType];
    if (!file) return null;
    return cache.get(ICON_BASE + file) || null;
}

/** Return the URL path for a threat's SVG icon (for use in <img src="">). */
export function getThreatIconSrc(threatType) {
    const file = THREAT_FILES[threatType];
    return file ? ICON_BASE + file : '';
}

/** Return the URL path for a tower's SVG icon (for use in <img src="">). */
export function getTowerIconSrc(towerType) {
    const file = TOWER_FILES[towerType];
    return file ? ICON_BASE + file : '';
}

/** Asset: try asset_<name_slug>.svg (e.g. "File Server" -> asset_file_server.svg). */
function assetNameToSlug(name) {
    return 'asset_' + (name || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.svg';
}

export function getAssetImage(assetName) {
    const slug = assetNameToSlug(assetName);
    const path = ICON_BASE + slug;
    const cached = cache.get(path);
    if (cached) return cached;
    if (!loadingPaths.has(path)) {
        loadingPaths.add(path);
        loadImage(path).then((img) => {
            if (img) cache.set(path, img);
            loadingPaths.delete(path);
        });
    }
    return null;
}

/** Preload a single asset icon by name (for levels with custom asset names). */
export function loadAssetIcon(assetName) {
    const slug = assetNameToSlug(assetName);
    const path = ICON_BASE + slug;
    return loadImage(path);
}
