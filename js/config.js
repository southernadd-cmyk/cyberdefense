// ========================================
// CYBER DEFENSE SIMULATOR - GAME CONFIG
// All game data, constants, and definitions
// ========================================

// --- Grid & Canvas Settings ---
export const CELL_SIZE = 48;
export const GRID_COLS = 20;
export const GRID_ROWS = 13;
// Extra row at bottom so the map is not flush to the canvas edge
export const CANVAS_BOTTOM_EXTRA = CELL_SIZE;        // one row
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;   // 960
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE + CANVAS_BOTTOM_EXTRA;

// --- Cell Types ---
export const CELL = {
    EMPTY: 0,
    PATH: 1,
    SPAWN: 2,
    ASSET: 3,
    BLOCKED: 4,
    TOWER: 5
};

// --- Game States ---
export const STATE = {
    MENU: 'menu',
    LEVEL_SELECT: 'level_select',
    LEVEL_INTRO: 'level_intro',
    PLANNING: 'planning',
    PLAYING: 'playing',
    WAVE_BREAK: 'wave_break',
    PAUSED: 'paused',
    LEVEL_COMPLETE: 'level_complete',
    GAME_OVER: 'game_over'
};

export const PLANNING_DURATION = 30000; // 30 seconds
export const WAVE_BREAK_DURATION = 10000; // 10 seconds between waves

// --- Colors ---
export const COLORS = {
    gridLine: '#1a2332',
    gridBg: '#0d1117',
    pathFill: '#1a2744',
    pathBorder: '#2a3a5e',
    spawnPoint: '#ff475755',
    assetPoint: '#00ff8855',
    rangeCircle: '#00d4ff22',
    rangeBorder: '#00d4ff44',
    healthGreen: '#00ff88',
    healthYellow: '#fbbf24',
    healthRed: '#ff4757',
    buildHighlight: '#00d4ff33',
    buildBlocked: '#ff475733',
    projectile: '#00d4ff'
};

// --- Threat Type Definitions ---
export const THREAT_TYPES = {
    phishing: {
        name: 'Phishing Email',
        speed: 90,
        health: 50,
        damage: 10,
        reward: 50,
        color: '#fbbf24',
        symbol: '\u2709',
        size: 12,
        description: 'Social engineering attack via email. Bypasses firewalls.',
        special: 'bypassFirewall',
        educationalNote: 'Phishing is the most common cyber attack vector. It tricks users into clicking malicious links or revealing personal information through deceptive emails.'
    },
    malware: {
        name: 'Malware',
        speed: 60,
        health: 100,
        damage: 20,
        reward: 100,
        color: '#a855f7',
        symbol: '\u2623',
        size: 14,
        description: 'Malicious software that can spread to adjacent systems.',
        special: 'spread',
        educationalNote: 'Malware includes viruses, worms, and spyware. It can corrupt files, steal data, and spread across networks. Antivirus software uses signatures and heuristics to detect it.'
    },
    ransomware: {
        name: 'Ransomware',
        speed: 40,
        health: 200,
        damage: 100,
        reward: 200,
        color: '#ff4757',
        symbol: '\uD83D\uDD12',
        size: 16,
        description: 'Encrypts data for ransom. Instant critical damage without backup.',
        special: 'encrypt',
        educationalNote: 'Ransomware encrypts victim data and demands payment. Backup systems are the primary defense. GDPR requires reporting breaches within 72 hours.'
    },
    ddos: {
        name: 'DDoS Attack',
        speed: 120,
        health: 30,
        damage: 5,
        reward: 30,
        color: '#3b82f6',
        symbol: '\u26A1',
        size: 8,
        description: 'Distributed denial of service. Fast swarm of many small attacks.',
        special: 'swarm',
        educationalNote: 'DDoS attacks overwhelm systems with traffic from multiple sources. IDS/IPS systems detect unusual traffic patterns and can mitigate these attacks.'
    },
    sqlInjection: {
        name: 'SQL Injection',
        speed: 60,
        health: 80,
        damage: 30,
        reward: 120,
        color: '#f97316',
        symbol: '\u2699',
        size: 13,
        description: 'Targets databases with malicious queries. Extra damage to data assets.',
        special: 'dbDamage',
        educationalNote: 'SQL injection exploits vulnerabilities in database-driven applications. Input validation and parameterized queries are key defenses. Under GDPR, database breaches can result in significant fines.'
    },
    trojan: {
        name: 'Trojan Horse',
        speed: 40,
        health: 60,
        damage: 15,
        reward: 80,
        color: '#8b5cf6',
        symbol: '\uD83D\uDC0E',
        size: 14,
        description: 'Disguised as legitimate software. Harder to detect initially.',
        special: 'disguise',
        educationalNote: 'Trojans masquerade as legitimate software to trick users into installing them. They can create backdoors for further attacks. The Computer Misuse Act 1990 makes creating and distributing such software illegal.'
    },
    insider: {
        name: 'Insider Threat',
        speed: 40,
        health: 150,
        damage: 40,
        reward: 180,
        color: '#ef4444',
        symbol: '\uD83D\uDC64',
        size: 15,
        description: 'Spawns inside the network. Bypasses perimeter defenses.',
        special: 'spawnInside',
        educationalNote: 'Insider threats come from employees, contractors, or partners with authorized access. Access control, monitoring, and security training are essential countermeasures.'
    },
    zeroDay: {
        name: 'Zero-Day Exploit',
        speed: 80,
        health: 250,
        damage: 50,
        reward: 300,
        color: '#06b6d4',
        symbol: '\u2604',
        size: 15,
        description: 'Exploits unknown vulnerabilities. Highly resistant to antivirus.',
        special: 'resistant',
        resistances: { antivirus: 0.8 },
        educationalNote: 'Zero-day exploits target unknown vulnerabilities before patches exist. Patch management and AI-based detection help mitigate risk. Defense in depth is crucial since no single control can stop them.'
    },
    sniffer: {
        name: 'Network Sniffer',
        speed: 50,
        health: 40,
        damage: 0,
        reward: 150,
        color: '#d946ef',
        symbol: '\uD83D\uDC41',
        size: 10,
        description: 'Support unit. Buffs nearby threats with +30% speed and 20% damage resistance.',
        special: 'support',
        educationalNote: 'Network sniffers passively capture data packets traversing a network. Attackers use them to gather intelligence before launching targeted attacks. Encryption and network segmentation limit what sniffers can capture.'
    }
};

// --- Threat Synergy Definitions ---
// Synergies activate when specific threat combinations are alive on the field simultaneously.
// The game engine checks these each frame and applies/removes buffs dynamically.
export const SYNERGIES = {
    credentialBreach: {
        name: 'Credential Breach',
        requires: ['phishing', 'ransomware'],
        effect: 'speedBoost',
        target: 'ransomware',         // Which threat type gets the buff
        speedMultiplier: 1.5,          // +50% speed
        color: '#f97316',
        icon: '\uD83D\uDD17',
        description: 'Phishing emails steal credentials, enabling ransomware to spread faster through compromised accounts.',
        educationalNote: 'In coordinated attacks, phishing often serves as the initial vector: stolen credentials give ransomware operators direct access to critical systems, accelerating encryption.'
    },
    coverFire: {
        name: 'DDoS Cover Fire',
        requires: ['ddos'],
        protects: ['malware', 'trojan'],  // Which threat types get the buff
        effect: 'missChance',
        missChance: 0.4,               // 40% chance towers miss
        range: 120,                     // DDoS must be within 120px
        color: '#3b82f6',
        icon: '\uD83D\uDEE1',
        description: 'DDoS traffic overwhelms defences, allowing malware to slip through undetected.',
        educationalNote: 'Attackers frequently launch DDoS attacks as a smokescreen. While defenders focus on the flood of traffic, malware payloads sneak past overloaded security systems.'
    },
    snifferBuff: {
        name: 'Sniffer Intelligence',
        requires: ['sniffer'],
        effect: 'aura',
        range: 100,                    // Sniffer buff radius in pixels
        speedMultiplier: 1.3,          // +30% speed
        damageResist: 0.2,             // 20% damage resistance
        color: '#d946ef',
        icon: '\uD83D\uDC41',
        description: 'Network sniffers provide intelligence to nearby threats, boosting their evasion.',
        educationalNote: 'In real attacks, reconnaissance tools like packet sniffers give attackers detailed knowledge of network defences, helping them adapt and evade detection more effectively.'
    }
};

// --- Tower Type Definitions ---
// EFFECTIVENESS SYSTEM: Each active tower has an effectiveness map.
// Values: 0 = ineffective, 0.2 = minimal, 0.5 = partial, 1.0 = standard, 1.5 = strong, 2.0+ = specialist counter
// Towers deal: baseDamage * effectiveness[threatType]. If 0 or missing, tower CANNOT target that threat.
export const TOWER_TYPES = {
    firewall: {
        name: 'Firewall',
        cost: 500,
        range: 120,
        damage: 20,
        attackSpeed: 1.0,
        color: '#3b82f6',
        bgColor: '#3b82f620',
        symbol: '\uD83D\uDEE1',
        type: 'active',
        description: 'Filters network traffic. Strong vs malware and DDoS. Phishing bypasses firewalls.',
        shortDesc: 'Network traffic filter',
        // WHY: Firewalls examine network packets. They catch malware/DDoS traffic
        // but phishing arrives through legitimate email channels.
        effectiveness: {
            phishing: 0.2,      // Phishing uses legitimate email - bypasses firewall rules
            malware: 1.5,       // Firewalls detect and block known malware traffic patterns
            ransomware: 0.5,    // Some ransomware detected, but often arrives via email
            ddos: 1.5,          // Firewalls filter volumetric traffic effectively
            sqlInjection: 0.8,  // Web application firewalls can detect injection patterns
            trojan: 0.5,        // Trojans disguise as legitimate traffic - partial detection
            insider: 0,         // Insiders are already inside the network - firewall useless
            zeroDay: 0.3,       // Unknown attack signatures bypass firewall rules
            sniffer: 1.2        // Firewalls detect sniffing traffic patterns
        },
        strongVs: ['malware', 'ddos'],
        weakVs: ['phishing', 'insider'],
        upgrades: [
            { name: 'Hardware Firewall', damage: 30, range: 140, cost: 400 },
            { name: 'Next-Gen Firewall', damage: 45, range: 160, cost: 600 }
        ],
        educationalNote: 'Firewalls monitor and control incoming/outgoing network traffic based on security rules. They form the first line of defense in network security but CANNOT stop threats that bypass the network (phishing, insiders).'
    },
    antivirus: {
        name: 'Antivirus',
        cost: 300,
        range: 80,
        damage: 30,
        attackSpeed: 0.8,
        color: '#ef4444',
        bgColor: '#ef444420',
        symbol: '\u2694',
        type: 'active',
        description: 'Detects malicious software. Specialist vs malware & trojans. Weak vs network attacks.',
        shortDesc: 'Malware detector & remover',
        // WHY: Antivirus uses signatures to detect known malware and trojans.
        // Network attacks (DDoS) and insider threats don't involve malware.
        effectiveness: {
            phishing: 0.2,      // Phishing is social engineering, not malware
            malware: 2.0,       // Primary purpose: detect and remove malware
            ransomware: 1.0,    // Ransomware IS malware - standard detection
            ddos: 0,            // DDoS is network flooding - not detectable by AV
            sqlInjection: 0.2,  // SQL injection is a code attack, not malware
            trojan: 2.0,        // Trojans ARE malware - signature detection
            insider: 0.2,       // Insider actions aren't malware-based
            zeroDay: 0.2,       // Unknown signatures - AV relies on known patterns (80% resist)
            sniffer: 0.8        // AV can detect some sniffer tools
        },
        strongVs: ['malware', 'trojan'],
        weakVs: ['ddos', 'insider', 'zeroDay'],
        upgrades: [
            { name: 'Heuristic Scanning', damage: 45, range: 100, cost: 350 },
            { name: 'AI-Based Detection', damage: 65, range: 120, cost: 500 }
        ],
        educationalNote: 'Antivirus software detects and removes malicious programs using signature databases. It is highly effective against known malware and trojans but struggles with zero-day exploits (unknown signatures) and cannot stop network-level or human-level attacks.'
    },
    emailFilter: {
        name: 'Email Filter',
        cost: 400,
        range: 80,
        damage: 40,
        attackSpeed: 0.5,
        color: '#fbbf24',
        bgColor: '#fbbf2420',
        symbol: '\u2709',
        type: 'active',
        description: 'Scans email traffic. Specialist vs phishing. Also catches email-borne malware.',
        shortDesc: 'Filters malicious emails',
        // WHY: Email filters scan email content and attachments.
        // They catch phishing and email-delivered threats but not network attacks.
        effectiveness: {
            phishing: 2.5,      // Primary purpose: catch phishing emails
            malware: 0.8,       // Catches malware distributed via email attachments
            ransomware: 1.0,    // Ransomware often distributed via email
            ddos: 0,            // DDoS is network flooding - nothing to do with email
            sqlInjection: 0,    // SQL injection targets web forms, not email
            trojan: 0.8,        // Trojans often arrive as email attachments
            insider: 0,         // Insiders don't use email to attack
            zeroDay: 0.2,       // Sandbox analysis may catch some unknown threats
            sniffer: 0          // Sniffers are network tools, not email-based
        },
        strongVs: ['phishing'],
        weakVs: ['ddos', 'sqlInjection', 'insider'],
        upgrades: [
            { name: 'Advanced Sandbox', damage: 60, range: 100, cost: 400 },
            { name: 'AI Email Security', damage: 80, range: 120, cost: 550 }
        ],
        educationalNote: 'Email filters scan incoming messages for phishing attempts, malicious attachments, and spam. Over 90% of cyber attacks start with an email, making this a critical first defense against social engineering.'
    },
    encryption: {
        name: 'Encryption',
        cost: 600,
        range: 0,
        damage: 0,
        attackSpeed: 0,
        color: '#10b981',
        bgColor: '#10b98120',
        symbol: '\uD83D\uDD12',
        type: 'passive',
        description: 'Protects an asset. Reduces damage by 60%. Place near assets to protect.',
        shortDesc: 'Protects asset data',
        specialEffect: 'assetProtection',
        protectionAmount: 0.6,
        passiveEffect: 'Reduces damage to nearby assets by 60%. Stolen data is unreadable.',
        upgrades: [
            { name: 'AES-256 Encryption', protectionAmount: 0.8, cost: 500 },
            { name: 'End-to-End Encryption', protectionAmount: 0.95, cost: 700 }
        ],
        educationalNote: 'Encryption converts data into unreadable code that requires a key to decrypt. AES-256 is the current standard. Even if data is stolen, encryption ensures it is unreadable. GDPR recommends encryption for personal data.'
    },
    ids: {
        name: 'IDS/IPS',
        cost: 700,
        range: 160,
        damage: 15,
        attackSpeed: 1.2,
        color: '#a855f7',
        bgColor: '#a855f720',
        symbol: '\uD83D\uDC41',
        type: 'active',
        specialEffect: 'slow',
        slowAmount: 0.3,
        description: 'Monitors traffic and slows threats. Specialist vs DDoS. Detects anomalies.',
        shortDesc: 'Detects & slows intruders',
        // WHY: IDS/IPS monitors network patterns and detects anomalies.
        // Excellent at spotting DDoS flood patterns and unusual access.
        effectiveness: {
            phishing: 0.3,      // Limited - phishing looks like normal email traffic
            malware: 0.8,       // Detects suspicious network activity from malware
            ransomware: 0.5,    // Can detect ransomware communication patterns
            ddos: 2.0,          // Designed to detect traffic anomalies and flooding
            sqlInjection: 1.2,  // Pattern matching detects injection attempts
            trojan: 0.5,        // Can detect suspicious outbound connections
            insider: 1.0,       // Anomaly detection spots unusual user behaviour
            zeroDay: 1.0,       // Behavioural analysis catches unknown attack patterns
            sniffer: 1.5        // IDS excels at detecting packet capture activity
        },
        strongVs: ['ddos'],
        weakVs: ['phishing'],
        upgrades: [
            { name: 'IPS Active Prevention', damage: 25, slowAmount: 0.4, cost: 500 },
            { name: 'AI Threat Intelligence', damage: 40, slowAmount: 0.5, range: 200, cost: 700 }
        ],
        educationalNote: 'Intrusion Detection Systems (IDS) monitor network traffic for suspicious patterns. IPS can automatically block detected threats. They excel at detecting DDoS floods and unusual behaviour but struggle with threats that mimic normal traffic.'
    },
    accessControl: {
        name: 'Access Control',
        cost: 350,
        range: 80,
        damage: 25,
        attackSpeed: 1.0,
        color: '#f97316',
        bgColor: '#f9731620',
        symbol: '\uD83D\uDD11',
        type: 'active',
        description: 'Restricts system access. Specialist vs insider threats. Limits data exposure.',
        shortDesc: 'Controls system access',
        // WHY: Access control verifies identity and limits permissions.
        // Essential for insider threats; also helps with SQL injection via least privilege.
        effectiveness: {
            phishing: 0.3,      // MFA helps but doesn't stop phishing itself
            malware: 0.2,       // Limits malware spread through access restrictions
            ransomware: 0.2,    // Limited permissions slow ransomware but don't stop it
            ddos: 0,            // Access control can't prevent network flooding
            sqlInjection: 1.0,  // Database access controls limit SQL injection impact
            trojan: 0.8,        // Access restrictions limit what trojans can do
            insider: 2.0,       // Primary defense: limits what insiders can access
            zeroDay: 0.3,       // Some protection through least privilege
            sniffer: 0.3        // Access control doesn't directly stop passive sniffing
        },
        strongVs: ['insider'],
        weakVs: ['ddos', 'malware'],
        upgrades: [
            { name: '2FA Authentication', damage: 40, range: 100, cost: 350 },
            { name: 'Biometric Security', damage: 60, range: 120, cost: 500 }
        ],
        educationalNote: 'Access control restricts who can view or use resources using the principle of least privilege. Multi-factor authentication (MFA) adds extra verification. Essential against insider threats but cannot stop network-level attacks like DDoS.'
    },
    backup: {
        name: 'Backup System',
        cost: 500,
        range: 0,
        damage: 0,
        attackSpeed: 0,
        color: '#06b6d4',
        bgColor: '#06b6d420',
        symbol: '\uD83D\uDCBE',
        type: 'passive',
        description: 'Prevents instant loss from ransomware. Essential for business continuity.',
        shortDesc: 'Data backup & recovery',
        specialEffect: 'ransomwareProtection',
        passiveEffect: 'Prevents instant asset loss from ransomware. Enables data recovery.',
        upgrades: [
            { name: 'Real-time Backup', cost: 400 },
            { name: 'Offsite + Cloud Backup', cost: 600 }
        ],
        educationalNote: 'Regular backups are essential for business continuity. The 3-2-1 rule recommends 3 copies, 2 different media types, 1 offsite. Backups are the PRIMARY defense against ransomware \u2013 they remove the attacker\'s leverage.'
    },
    training: {
        name: 'Security Training',
        cost: 800,
        range: 999,
        damage: 0,
        attackSpeed: 0,
        color: '#ec4899',
        bgColor: '#ec489920',
        symbol: '\uD83C\uDF93',
        type: 'passive',
        description: 'Global: reduces phishing & social engineering damage by 70%.',
        shortDesc: 'Staff awareness training',
        specialEffect: 'socialEngineering',
        reductionAmount: 0.7,
        passiveEffect: 'Globally reduces damage from phishing, trojans, and social engineering by 70%.',
        upgrades: [
            { name: 'Quarterly Training', reductionAmount: 0.8, cost: 500 },
            { name: 'Phishing Simulations', reductionAmount: 0.9, cost: 600 }
        ],
        educationalNote: 'Security awareness training teaches employees to recognise threats like phishing and social engineering. Studies show it reduces phishing success rates by 50-70%. Humans are often the weakest link \u2013 training strengthens them.'
    },
    patchMgmt: {
        name: 'Patch Management',
        cost: 450,
        range: 120,
        damage: 0,
        attackSpeed: 0,
        color: '#6b7280',
        bgColor: '#6b728020',
        symbol: '\uD83D\uDD27',
        type: 'passive',
        specialEffect: 'patchVulnerabilities',
        description: 'Boosts nearby tower damage vs zero-days by 60%. Closes vulnerabilities.',
        shortDesc: 'System update management',
        passiveEffect: 'Boosts effectiveness of nearby towers against zero-day exploits by 60%.',
        upgrades: [
            { name: 'Automated Patching', range: 160, cost: 400 },
            { name: 'AI Vulnerability Scanning', range: 200, cost: 550 }
        ],
        educationalNote: 'Patch management ensures software is up-to-date with security fixes. Unpatched systems are the most common attack vector. It is the PRIMARY defense against zero-day exploits once patches are available.'
    },

    // --- PATH CONTROL TOWERS ---
    proxyNode: {
        name: 'Proxy Node',
        cost: 400,
        range: 48,          // 1-cell radius for scan aura
        damage: 0,
        attackSpeed: 0,
        color: '#22d3ee',
        bgColor: '#22d3ee20',
        symbol: '\uD83C\uDF10',
        type: 'passive',
        specialEffect: 'proxyInspect',
        placementType: 'path',    // placed ON a path cell (threats walk through)
        slowAmount: 0.4,          // 40% slow to threats passing through
        damageAmplify: 0.2,       // +20% damage taken by scanned threats
        scanDuration: 2000,       // scan debuff lasts 2s after leaving proxy range
        description: 'Placed on a path. Inspects threats passing through: 40% slow + 20% extra damage for 2s.',
        shortDesc: 'Traffic inspection point',
        passiveEffect: 'Sits on the path and inspects all traffic. Threats passing through are slowed and take extra damage.',
        upgrades: [
            { name: 'Caching Proxy', slowAmount: 0.55, damageAmplify: 0.3, scanDuration: 3000, cost: 350 },
            { name: 'Deep Packet Inspection', slowAmount: 0.7, damageAmplify: 0.4, scanDuration: 4000, stripSynergies: true, cost: 500 }
        ],
        educationalNote: 'Proxy servers route traffic through a controlled point for inspection and filtering. They can cache content, block malicious requests, and log all traffic for analysis. Forward proxies protect internal users; reverse proxies protect servers. Deep Packet Inspection examines the actual data payload, not just headers.'
    },
    quarantine: {
        name: 'Quarantine Zone',
        cost: 550,
        range: 72,          // ~1.5 cell radius
        damage: 0,
        attackSpeed: 0,
        color: '#f97316',
        bgColor: '#f9731620',
        symbol: '\u26D4',
        type: 'passive',
        placementType: 'path',     // placed ON a path cell (threats walk through)
        specialEffect: 'quarantineFreeze',
        freezeDuration: 3000,      // 3 seconds freeze
        description: 'Placed on a path. Freezes threats inside for 3s. Frozen threats take no damage.',
        shortDesc: 'Isolates & freezes threats',
        passiveEffect: 'Threats entering the zone are frozen in place for 3 seconds. While frozen, they cannot move or take damage. Each threat is frozen only once per zone.',
        upgrades: [
            { name: 'Enhanced Isolation', freezeDuration: 5000, range: 96, cost: 450 },
            { name: 'Automated Quarantine', freezeDuration: 7000, range: 120, cost: 650 }
        ],
        educationalNote: 'Quarantine isolates suspicious files or network segments to prevent malware spread. During quarantine, the threat is contained and cannot cause harm but also cannot be cleaned until released. Incident response plans often mandate quarantine as a first step before analysis.'
    },
    segmentation: {
        name: 'Segmentation Zone',
        cost: 800,
        range: 144,          // 3-cell radius -- large isolation zone
        damage: 0,
        attackSpeed: 0,
        color: '#6366f1',
        bgColor: '#6366f120',
        symbol: '\uD83D\uDDFA',
        type: 'passive',
        placementType: 'path',    // placed ON a path cell (threats walk through)
        specialEffect: 'segmentationZone',
        synergySuppress: true,    // suppresses threat synergies inside the zone
        damageAmplify: 0.2,       // +20% damage to threats inside zone
        description: 'Placed on a path. Large isolation zone that suppresses threat synergies. +20% damage.',
        shortDesc: 'Isolates & fragments threats',
        passiveEffect: 'Creates an isolation bubble. Threats inside lose all synergy buffs and take 20% extra damage from towers.',
        upgrades: [
            { name: 'Micro-Segmentation', range: 192, damageAmplify: 0.35, cost: 600 },
            { name: 'Zero-Trust Zone', range: 240, damageAmplify: 0.5, slowAmount: 0.3, cost: 800 }
        ],
        educationalNote: 'Network segmentation divides a network into isolated zones. If an attacker compromises one segment, they cannot easily move to others. This limits the "blast radius" of an attack. Zero-trust architecture takes this further by verifying every connection.'
    }
};

// --- Threat-Tower Effectiveness Matrix (for display/reference) ---
// Maps each threat to its strong counters and weak counters
export const THREAT_COUNTERS = {
    phishing:      { strongCounters: ['emailFilter', 'training'], weakCounters: ['firewall', 'antivirus', 'ids'], immune: [] },
    malware:       { strongCounters: ['antivirus', 'firewall'], weakCounters: ['emailFilter', 'ids'], immune: ['accessControl'] },
    ransomware:    { strongCounters: ['backup', 'emailFilter', 'antivirus'], weakCounters: ['firewall', 'ids'], immune: [] },
    ddos:          { strongCounters: ['ids', 'firewall'], weakCounters: [], immune: ['emailFilter', 'accessControl', 'antivirus'] },
    sqlInjection:  { strongCounters: ['ids', 'accessControl', 'patchMgmt'], weakCounters: ['firewall'], immune: ['emailFilter', 'antivirus'] },
    trojan:        { strongCounters: ['antivirus', 'accessControl'], weakCounters: ['emailFilter', 'firewall', 'ids'], immune: [] },
    insider:       { strongCounters: ['accessControl', 'training', 'ids'], weakCounters: [], immune: ['firewall', 'emailFilter', 'antivirus'] },
    zeroDay:       { strongCounters: ['patchMgmt', 'ids'], weakCounters: ['firewall', 'accessControl'], immune: ['antivirus', 'emailFilter'] },
    sniffer:       { strongCounters: ['ids', 'firewall'], weakCounters: ['antivirus'], immune: ['emailFilter', 'accessControl'] }
};

// --- Level Definitions ---
export const LEVELS = [
    {
        id: 1,
        name: 'Small Business Network',
        description: 'A local shop needs basic network protection. Learn the fundamentals of firewalls and antivirus.',
        scenario: 'You have been hired as the IT security consultant for a small retail business. They have a basic network with a file server, point-of-sale system, and employee workstations. Recent phishing emails have worried the owner. Set up basic defenses to protect their network.',
        difficulty: 1,
        startingBudget: 2000,
        availableTowers: ['firewall', 'antivirus', 'emailFilter'],
        paths: [
            [
                { x: 0, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 2 },
                { x: 10, y: 2 }, { x: 10, y: 8 }, { x: 16, y: 8 },
                { x: 16, y: 5 }, { x: 19, y: 5 }
            ]
        ],
        assets: [
            { x: 19, y: 5, name: 'File Server', type: 'server', health: 100 }
        ],
        waves: [
            { threats: [{ type: 'phishing', count: 5, interval: 1500 }] },
            { threats: [{ type: 'phishing', count: 4, interval: 1200 }, { type: 'malware', count: 2, interval: 2000 }] },
            { threats: [{ type: 'phishing', count: 6, interval: 1000 }, { type: 'malware', count: 4, interval: 1500 }] },
            { threats: [{ type: 'malware', count: 6, interval: 1200 }, { type: 'phishing', count: 8, interval: 800 }] }
        ],
        learningSummary: {
            title: 'Small Business Security Fundamentals',
            points: [
                'Firewalls provide the first line of defense by filtering network traffic.',
                'Antivirus software detects known malware using signature databases.',
                'Email filters are critical for blocking phishing attempts, the most common attack vector.',
                'Even small businesses need layered security - no single defense is sufficient.'
            ],
            legislation: 'Under GDPR, even small businesses handling personal data must implement appropriate security measures. Failure can result in fines up to 4% of annual turnover.'
        },
        eduPopups: [
            { wave: 1, title: 'Phishing Attacks', text: 'Phishing emails try to trick recipients into clicking malicious links or revealing sensitive information. Email filters help catch these before they reach employees.', legislation: 'Data Protection Act 2018 requires organizations to protect personal data from unauthorized access.' }
        ]
    },
    {
        id: 2,
        name: 'School Network',
        description: 'Protect a school network with student data. Multiple entry points require layered defenses.',
        scenario: 'A secondary school stores sensitive student data including names, addresses, and medical records. The network has multiple access points for staff and students. Implement layered security to protect against increasing threats while maintaining compliance with data protection laws.',
        difficulty: 2,
        startingBudget: 3000,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'accessControl', 'encryption'],
        paths: [
            [
                { x: 0, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 5 },
                { x: 12, y: 5 }, { x: 12, y: 2 }, { x: 19, y: 2 }
            ],
            [
                { x: 0, y: 9 }, { x: 5, y: 9 }, { x: 5, y: 6 },
                { x: 12, y: 6 }, { x: 12, y: 9 }, { x: 19, y: 9 }
            ]
        ],
        assets: [
            { x: 19, y: 2, name: 'Student Database', type: 'database', health: 100 },
            { x: 19, y: 9, name: 'Staff Systems', type: 'server', health: 100 }
        ],
        waves: [
            { threats: [{ type: 'phishing', count: 6, interval: 1200, path: 0 }, { type: 'phishing', count: 4, interval: 1400, path: 1 }] },
            { threats: [{ type: 'malware', count: 4, interval: 1500, path: 0 }, { type: 'trojan', count: 3, interval: 2000, path: 1 }] },
            { threats: [{ type: 'phishing', count: 8, interval: 800, path: 0 }, { type: 'malware', count: 5, interval: 1200, path: 1 }, { type: 'ddos', count: 10, interval: 500, path: 0 }] },
            { threats: [{ type: 'insider', count: 2, interval: 3000, path: 1 }, { type: 'malware', count: 6, interval: 1000, path: 0 }, { type: 'trojan', count: 4, interval: 1500, path: 1 }] },
            { threats: [{ type: 'phishing', count: 10, interval: 600, path: 0 }, { type: 'insider', count: 3, interval: 2500, path: 1 }, { type: 'malware', count: 8, interval: 900, path: 0 }] }
        ],
        learningSummary: {
            title: 'Educational Data Protection',
            points: [
                'Schools hold sensitive personal data (student records, medical info) requiring strong protection.',
                'Multiple network entry points require defense in depth - layered security controls.',
                'Access control ensures only authorized users can reach sensitive data.',
                'Encryption protects data even if other defenses are breached.',
                'Insider threats highlight the need for access controls and monitoring.'
            ],
            legislation: 'Schools must comply with GDPR and the Data Protection Act 2018. Children\'s data requires extra protection. ICO can investigate breaches and impose fines.'
        },
        eduPopups: [
            { wave: 2, title: 'Defense in Depth', text: 'Using multiple layers of security (firewalls + antivirus + access control) means that if one defense fails, others still protect your data. This is called defense in depth.', legislation: 'GDPR Article 32 requires "appropriate technical and organisational measures" - this means layered security.' },
            { wave: 4, title: 'Insider Threats', text: 'Not all threats come from outside. Insider threats include malicious employees or those who accidentally cause breaches. Access control limits what each user can access.', legislation: 'The Computer Misuse Act 1990 makes unauthorized access to computer systems a criminal offence, even for employees exceeding their access rights.' }
        ]
    },
    {
        id: 3,
        name: 'Healthcare Organization',
        description: 'Protect patient records and medical systems. Ransomware is a critical threat.',
        scenario: 'A healthcare trust stores highly sensitive patient records including medical histories and treatment plans. Ransomware attacks on healthcare organizations have increased dramatically. You must implement comprehensive defenses including backup systems to ensure business continuity.',
        difficulty: 3,
        startingBudget: 4000,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'proxyNode'],
        paths: [
            [
                { x: 0, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 1 },
                { x: 9, y: 1 }, { x: 9, y: 5 }, { x: 15, y: 5 },
                { x: 15, y: 3 }, { x: 19, y: 3 }
            ],
            [
                { x: 0, y: 8 }, { x: 3, y: 8 }, { x: 3, y: 10 },
                { x: 9, y: 10 }, { x: 9, y: 6 }, { x: 15, y: 6 },
                { x: 15, y: 8 }, { x: 19, y: 8 }
            ]
        ],
        assets: [
            { x: 19, y: 3, name: 'Patient Records', type: 'database', health: 120 },
            { x: 19, y: 8, name: 'Medical Systems', type: 'server', health: 100 }
        ],
        waves: [
            { threats: [{ type: 'phishing', count: 8, interval: 1000, path: 0 }, { type: 'malware', count: 4, interval: 1500, path: 1 }] },
            { threats: [{ type: 'trojan', count: 4, interval: 1800, path: 0 }, { type: 'ddos', count: 12, interval: 400, path: 1 }] },
            // Wave 3: CREDENTIAL BREACH SYNERGY - phishing opens the door for ransomware
            { threats: [{ type: 'phishing', count: 6, interval: 800, path: 0 }, { type: 'ransomware', count: 3, interval: 2500, path: 0 }, { type: 'malware', count: 4, interval: 1200, path: 1 }], synergy: 'credentialBreach' },
            { threats: [{ type: 'insider', count: 3, interval: 2500, path: 0 }, { type: 'ransomware', count: 3, interval: 2500, path: 1 }, { type: 'phishing', count: 8, interval: 700, path: 0 }] },
            { threats: [{ type: 'ransomware', count: 4, interval: 2000, path: 0 }, { type: 'zeroDay', count: 2, interval: 3000, path: 1 }, { type: 'malware', count: 8, interval: 800, path: 0 }] }
        ],
        learningSummary: {
            title: 'Healthcare Data Security & Business Continuity',
            points: [
                'Healthcare data is classified as "special category data" under GDPR requiring extra protection.',
                'Ransomware can prevent access to critical patient records, potentially endangering lives.',
                'Backup systems are essential for business continuity - they allow recovery after ransomware attacks.',
                'IDS/IPS provides early warning of attacks, giving time to respond.',
                'Defense in depth is critical: no single control can protect against all threats.'
            ],
            legislation: 'Healthcare organizations must comply with GDPR Article 9 (special category data), the Data Protection Act 2018, and NHS-specific data security standards. Breaches must be reported to the ICO within 72 hours.'
        },
        eduPopups: [
            { wave: 3, title: 'Credential Breach Synergy', text: 'This wave demonstrates a coordinated attack: phishing emails steal credentials, which ransomware operators then use for faster network penetration. When both threats are active, ransomware moves 50% faster! Use the Proxy Node to route traffic through chokepoints where your defences are strongest.', legislation: 'GDPR requires organizations to ensure the ability to restore access to personal data in a timely manner (Article 32). The Data Protection Act 2018 reinforces this requirement.' }
        ]
    },
    {
        id: 4,
        name: 'E-Commerce Platform',
        description: 'Protect an online store handling payment card data. SQL injection is a major risk.',
        scenario: 'An e-commerce company processes thousands of transactions daily. They store customer personal data and payment information. SQL injection attacks could expose payment card data, leading to massive fines and loss of customer trust. Build a comprehensive security infrastructure.',
        difficulty: 4,
        startingBudget: 5000,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'patchMgmt', 'proxyNode', 'quarantine'],
        paths: [
            [
                { x: 0, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 5 },
                { x: 13, y: 5 }, { x: 13, y: 1 }, { x: 19, y: 1 }
            ],
            [
                { x: 0, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 10 },
                { x: 10, y: 10 }, { x: 10, y: 6 }, { x: 19, y: 6 }
            ],
            [
                { x: 0, y: 10 }, { x: 8, y: 10 }, { x: 8, y: 8 },
                { x: 16, y: 8 }, { x: 16, y: 10 }, { x: 19, y: 10 }
            ]
        ],
        assets: [
            { x: 19, y: 1, name: 'Payment Database', type: 'database', health: 100 },
            { x: 19, y: 6, name: 'Customer Portal', type: 'server', health: 100 },
            { x: 19, y: 10, name: 'Order System', type: 'server', health: 80 }
        ],
        waves: [
            { threats: [{ type: 'phishing', count: 6, interval: 1000, path: 0 }, { type: 'ddos', count: 15, interval: 400, path: 1 }] },
            { threats: [{ type: 'sqlInjection', count: 4, interval: 2000, path: 0 }, { type: 'malware', count: 6, interval: 1200, path: 2 }] },
            // Wave 3: DDOS COVER FIRE SYNERGY - DDoS overwhelms while malware slips through
            { threats: [{ type: 'ddos', count: 15, interval: 300, path: 1 }, { type: 'malware', count: 4, interval: 2000, path: 1 }, { type: 'trojan', count: 3, interval: 1800, path: 0 }], synergy: 'coverFire' },
            // Wave 4: CREDENTIAL BREACH SYNERGY + insider
            { threats: [{ type: 'phishing', count: 8, interval: 700, path: 0 }, { type: 'ransomware', count: 3, interval: 3000, path: 0 }, { type: 'insider', count: 3, interval: 2500, path: 1 }, { type: 'sqlInjection', count: 4, interval: 1500, path: 2 }], synergy: 'credentialBreach' },
            { threats: [{ type: 'zeroDay', count: 3, interval: 2500, path: 0 }, { type: 'ransomware', count: 3, interval: 2500, path: 1 }, { type: 'ddos', count: 20, interval: 300, path: 2 }, { type: 'sqlInjection', count: 6, interval: 1200, path: 0 }] }
        ],
        learningSummary: {
            title: 'E-Commerce Security & Payment Protection',
            points: [
                'SQL injection can expose entire databases of customer information and payment details.',
                'Payment card data requires PCI DSS compliance in addition to GDPR.',
                'Multiple attack vectors (email, web, database) require diverse defense strategies.',
                'Patch management prevents exploitation of known vulnerabilities.',
                'Business impact of breaches includes financial loss, fines, and reputational damage.'
            ],
            legislation: 'E-commerce businesses must comply with GDPR for personal data, PCI DSS for payment card data, and the Computer Misuse Act 1990. Data breaches involving payment data can result in fines of millions of pounds.'
        },
        eduPopups: [
            { wave: 2, title: 'SQL Injection Attacks', text: 'SQL injection inserts malicious database commands through web forms. This can expose, modify, or delete entire databases. Input validation and parameterized queries are essential defenses.', legislation: 'Under GDPR, organizations must implement appropriate technical measures to protect data. Failure to prevent SQL injection may be considered negligence.' },
            { wave: 3, title: 'DDoS Cover Fire', text: 'In this wave, a massive DDoS flood provides "cover fire" for malware payloads. Towers have a 40% chance to miss DDoS-protected threats! Use Quarantine Barriers to slow and weaken threats, and IDS/IPS to handle the DDoS traffic.', legislation: 'PCI DSS Requirement 11 mandates regular testing of security systems, including DDoS response procedures.' }
        ]
    },
    {
        id: 5,
        name: 'Government Agency',
        description: 'Protect classified government systems. Business continuity is paramount.',
        scenario: 'A government agency handles classified information and citizen data. They face sophisticated attacks from multiple threat actors. Business continuity planning is critical - any downtime affects public services. Implement comprehensive security with emphasis on disaster recovery.',
        difficulty: 5,
        startingBudget: 6000,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'training', 'patchMgmt', 'proxyNode', 'quarantine', 'segmentation'],
        paths: [
            [
                { x: 0, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 4 },
                { x: 10, y: 4 }, { x: 10, y: 1 }, { x: 19, y: 1 }
            ],
            [
                { x: 0, y: 5 }, { x: 3, y: 5 }, { x: 3, y: 8 },
                { x: 8, y: 8 }, { x: 8, y: 5 }, { x: 14, y: 5 },
                { x: 14, y: 8 }, { x: 19, y: 8 }
            ],
            [
                { x: 0, y: 10 }, { x: 6, y: 10 }, { x: 6, y: 7 },
                { x: 12, y: 7 }, { x: 12, y: 10 }, { x: 19, y: 10 }
            ]
        ],
        assets: [
            { x: 19, y: 1, name: 'Classified Data', type: 'database', health: 120 },
            { x: 19, y: 8, name: 'Citizen Portal', type: 'server', health: 100 },
            { x: 19, y: 10, name: 'Email System', type: 'server', health: 80 }
        ],
        waves: [
            { threats: [{ type: 'phishing', count: 10, interval: 800, path: 0 }, { type: 'ddos', count: 15, interval: 350, path: 1 }] },
            { threats: [{ type: 'insider', count: 3, interval: 2500, path: 1 }, { type: 'malware', count: 8, interval: 1000, path: 0 }, { type: 'trojan', count: 4, interval: 1500, path: 2 }] },
            // Wave 3: SNIFFER SUPPORT + CREDENTIAL BREACH - coordinated attack
            { threats: [{ type: 'sniffer', count: 2, interval: 4000, path: 1 }, { type: 'phishing', count: 8, interval: 700, path: 0 }, { type: 'ransomware', count: 4, interval: 2500, path: 0 }, { type: 'zeroDay', count: 2, interval: 3000, path: 2 }], synergy: 'credentialBreach' },
            // Wave 4: DDOS COVER FIRE + SNIFFER - full coordinated assault
            { threats: [{ type: 'ddos', count: 20, interval: 250, path: 0 }, { type: 'sniffer', count: 2, interval: 5000, path: 1 }, { type: 'malware', count: 6, interval: 1500, path: 1 }, { type: 'insider', count: 4, interval: 2000, path: 2 }], synergy: 'coverFire' },
            { threats: [{ type: 'zeroDay', count: 5, interval: 1800, path: 0 }, { type: 'ransomware', count: 5, interval: 2000, path: 1 }, { type: 'insider', count: 5, interval: 1800, path: 2 }, { type: 'phishing', count: 15, interval: 500, path: 0 }, { type: 'malware', count: 10, interval: 700, path: 1 }] }
        ],
        learningSummary: {
            title: 'Government Security & Business Continuity',
            points: [
                'Government agencies face sophisticated, state-sponsored cyber threats.',
                'Business continuity plans ensure critical public services continue during attacks.',
                'Security training reduces social engineering success rates by up to 70%.',
                'Multiple layers of defense (physical, technical, procedural) are essential.',
                'Regular disaster recovery testing ensures backup systems work when needed.'
            ],
            legislation: 'Government agencies must comply with GDPR, the Data Protection Act 2018, the Computer Misuse Act 1990, and sector-specific regulations like the Network and Information Systems Regulations 2018.'
        },
        eduPopups: [
            { wave: 1, title: 'Security Training', text: 'Security awareness training is one of the most cost-effective security measures. Educated employees are 70% less likely to fall for social engineering attacks.', legislation: 'GDPR Article 39 requires the Data Protection Officer to promote awareness and training of staff involved in processing operations.' },
            { wave: 3, title: 'Sniffer Intelligence & Coordinated Attacks', text: 'Network Sniffers are support units that buff nearby threats with extra speed and damage resistance. Combined with Credential Breach synergy, this wave represents a sophisticated coordinated attack. Use Segmentation Zones to block synergy effects!', legislation: 'The Network and Information Systems Regulations 2018 require operators of essential services to have appropriate measures for business continuity.' }
        ]
    },
    {
        id: 6,
        name: 'Critical Infrastructure',
        description: 'Protect power grid control systems. The ultimate test of your cyber defense skills.',
        scenario: 'You are tasked with defending a critical national infrastructure provider. Their systems control power distribution for millions of people. All known threat types are active, and attackers are highly sophisticated. Deploy every defense at your disposal and demonstrate mastery of layered security.',
        difficulty: 6,
        startingBudget: 7500,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'training', 'patchMgmt', 'proxyNode', 'quarantine', 'segmentation'],
        paths: [
            [
                { x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 3 },
                { x: 8, y: 3 }, { x: 8, y: 0 }, { x: 14, y: 0 },
                { x: 14, y: 3 }, { x: 19, y: 3 }
            ],
            [
                { x: 0, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 8 },
                { x: 10, y: 8 }, { x: 10, y: 5 }, { x: 15, y: 5 },
                { x: 15, y: 8 }, { x: 19, y: 8 }
            ],
            [
                { x: 0, y: 11 }, { x: 4, y: 11 }, { x: 4, y: 9 },
                { x: 9, y: 9 }, { x: 9, y: 11 }, { x: 14, y: 11 },
                { x: 14, y: 9 }, { x: 19, y: 9 }
            ]
        ],
        assets: [
            { x: 19, y: 3, name: 'SCADA Control', type: 'server', health: 100 },
            { x: 19, y: 8, name: 'Power Grid DB', type: 'database', health: 100 },
            { x: 19, y: 9, name: 'Monitoring System', type: 'server', health: 80 }
        ],
        waves: [
            // Wave 1: DDoS COVER FIRE - DDoS hides malware approach
            { threats: [{ type: 'ddos', count: 20, interval: 300, path: 0 }, { type: 'malware', count: 4, interval: 1500, path: 0 }, { type: 'phishing', count: 10, interval: 700, path: 1 }], synergy: 'coverFire' },
            { threats: [{ type: 'trojan', count: 6, interval: 1500, path: 0 }, { type: 'insider', count: 4, interval: 2000, path: 1 }, { type: 'sqlInjection', count: 5, interval: 1500, path: 2 }] },
            // Wave 3: CREDENTIAL BREACH + SNIFFER - combined coordinated assault
            { threats: [{ type: 'sniffer', count: 3, interval: 3000, path: 1 }, { type: 'phishing', count: 10, interval: 600, path: 0 }, { type: 'ransomware', count: 5, interval: 2000, path: 0 }, { type: 'zeroDay', count: 3, interval: 2500, path: 2 }], synergy: 'credentialBreach' },
            // Wave 4: ALL SYNERGIES ACTIVE - full spectrum assault
            { threats: [{ type: 'ddos', count: 25, interval: 200, path: 0 }, { type: 'sniffer', count: 2, interval: 5000, path: 1 }, { type: 'malware', count: 6, interval: 1200, path: 1 }, { type: 'ransomware', count: 4, interval: 2000, path: 2 }, { type: 'phishing', count: 8, interval: 600, path: 0 }, { type: 'insider', count: 4, interval: 1800, path: 2 }] },
            // Wave 5: ULTIMATE - massive coordinated attack with all threat types and synergies
            { threats: [{ type: 'sniffer', count: 3, interval: 4000, path: 0 }, { type: 'zeroDay', count: 8, interval: 1200, path: 0 }, { type: 'ransomware', count: 6, interval: 1500, path: 1 }, { type: 'ddos', count: 20, interval: 250, path: 2 }, { type: 'malware', count: 8, interval: 800, path: 2 }, { type: 'insider', count: 5, interval: 1500, path: 1 }, { type: 'phishing', count: 12, interval: 500, path: 0 }] }
        ],
        learningSummary: {
            title: 'Critical Infrastructure Protection',
            points: [
                'Critical infrastructure requires the highest level of cyber security measures.',
                'All defense types working together demonstrate true defense in depth.',
                'A single point of failure can have catastrophic real-world consequences.',
                'Continuous monitoring (IDS/IPS) provides early warning of sophisticated attacks.',
                'Combining technical controls with staff training creates the strongest defense.'
            ],
            legislation: 'Critical infrastructure is protected under the Network and Information Systems Regulations 2018, GDPR, the Computer Misuse Act 1990, and sector-specific regulations. Operators must report incidents within 72 hours and maintain robust business continuity plans.'
        },
        eduPopups: [
            { wave: 1, title: 'DDoS Cover Fire in Critical Infrastructure', text: 'This wave uses DDoS traffic as "cover fire" for malware. In real infrastructure attacks (like Stuxnet), diversionary attacks distracted defenders while the real payload was delivered. Use path control towers to create chokepoints and Segmentation Zones to neutralise synergies.', legislation: 'The Network and Information Systems Regulations 2018 specifically address security for operators of essential services and digital service providers.' },
            { wave: 3, title: 'Full Spectrum Cyber Attack', text: 'This is a coordinated multi-vector assault: sniffers gather intelligence, phishing steals credentials, and ransomware exploits the breach. This mirrors real advanced persistent threats (APTs). Network segmentation is your best defence against coordinated synergies.', legislation: 'NCSC guidance recommends network segmentation as a key defence for critical national infrastructure.' }
        ]
    },
    // ============ LEVEL 7 ============
    {
        id: 7,
        name: 'Financial Services',
        description: 'Defend banking systems and payment infrastructure. Compliance with PCI-DSS is critical.',
        scenario: 'A major financial services firm processes millions of transactions daily. They hold customer account data, payment card information, and trading records. Attackers are financially motivated and highly skilled. You must implement PCI-DSS compliant defenses and prepare incident response procedures.',
        difficulty: 7,
        startingBudget: 8500,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'training', 'patchMgmt', 'proxyNode', 'quarantine', 'segmentation'],
        paths: [
            [
                { x: 0, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 4 },
                { x: 11, y: 4 }, { x: 11, y: 1 }, { x: 19, y: 1 }
            ],
            [
                { x: 0, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 9 },
                { x: 9, y: 9 }, { x: 9, y: 6 }, { x: 15, y: 6 },
                { x: 15, y: 9 }, { x: 19, y: 9 }
            ],
            [
                { x: 0, y: 11 }, { x: 6, y: 11 }, { x: 6, y: 8 },
                { x: 13, y: 8 }, { x: 13, y: 11 }, { x: 19, y: 11 }
            ]
        ],
        assets: [
            { x: 19, y: 1, name: 'Transaction Database', type: 'database', health: 120 },
            { x: 19, y: 9, name: 'ATM Network', type: 'server', health: 100 },
            { x: 19, y: 11, name: 'Trading Platform', type: 'server', health: 90 }
        ],
        waves: [
            { threats: [{ type: 'phishing', count: 12, interval: 600, path: 0 }, { type: 'sqlInjection', count: 6, interval: 1200, path: 1 }, { type: 'malware', count: 5, interval: 1500, path: 2 }] },
            // Wave 2: Credential Breach targeting transaction systems
            { threats: [{ type: 'phishing', count: 10, interval: 500, path: 0 }, { type: 'ransomware', count: 5, interval: 2000, path: 0 }, { type: 'sniffer', count: 2, interval: 4000, path: 1 }, { type: 'trojan', count: 4, interval: 1800, path: 2 }], synergy: 'credentialBreach' },
            { threats: [{ type: 'ddos', count: 20, interval: 250, path: 1 }, { type: 'insider', count: 4, interval: 2000, path: 0 }, { type: 'malware', count: 6, interval: 1200, path: 1 }, { type: 'sqlInjection', count: 5, interval: 1500, path: 2 }], synergy: 'coverFire' },
            // Wave 4: Sniffer + multi-path coordinated assault
            { threats: [{ type: 'sniffer', count: 3, interval: 3000, path: 0 }, { type: 'zeroDay', count: 4, interval: 2000, path: 0 }, { type: 'ransomware', count: 5, interval: 1500, path: 1 }, { type: 'insider', count: 4, interval: 1800, path: 2 }, { type: 'ddos', count: 15, interval: 300, path: 2 }] },
            // Wave 5: Full spectrum financial attack
            { threats: [{ type: 'sniffer', count: 3, interval: 3500, path: 1 }, { type: 'phishing', count: 15, interval: 400, path: 0 }, { type: 'ransomware', count: 6, interval: 1500, path: 0 }, { type: 'sqlInjection', count: 8, interval: 1000, path: 1 }, { type: 'zeroDay', count: 5, interval: 1800, path: 2 }, { type: 'malware', count: 8, interval: 800, path: 2 }] },
            { threats: [{ type: 'ddos', count: 25, interval: 200, path: 0 }, { type: 'sniffer', count: 2, interval: 5000, path: 1 }, { type: 'insider', count: 5, interval: 1500, path: 1 }, { type: 'ransomware', count: 8, interval: 1200, path: 2 }, { type: 'zeroDay', count: 6, interval: 1500, path: 0 }, { type: 'trojan', count: 6, interval: 1200, path: 2 }] }
        ],
        learningSummary: {
            title: 'Financial Services Cyber Security & PCI-DSS',
            points: [
                'Financial systems are prime targets due to direct monetary gain for attackers.',
                'PCI-DSS (Payment Card Industry Data Security Standard) mandates specific controls for card data.',
                'Incident response plans must include regulatory notification within strict timeframes.',
                'Encryption of data at rest and in transit is mandatory for financial data.',
                'Network segmentation isolates cardholder data environments from general networks.',
                'Regular penetration testing and vulnerability scanning are compliance requirements.'
            ],
            legislation: 'Financial firms must comply with GDPR, PCI-DSS, the FCA (Financial Conduct Authority) regulations, and the Data Protection Act 2018. PCI-DSS requires network segmentation, encryption, and regular security testing. Breach notification must occur within 72 hours under GDPR.'
        },
        eduPopups: [
            { wave: 2, title: 'PCI-DSS Compliance', text: 'The Payment Card Industry Data Security Standard requires 12 key security controls including firewalls, encryption, access control, and regular testing. Any organisation handling card payments must comply or face fines and lose the ability to process cards.', legislation: 'PCI-DSS is enforced by card brands (Visa, Mastercard). Non-compliance can result in fines of £5,000-£100,000 per month.' },
            { wave: 4, title: 'Incident Response in Finance', text: 'Financial incident response requires immediate containment, preservation of evidence for forensics, regulatory notification, and customer communication. The FCA requires firms to report material cyber incidents. Speed of response directly impacts financial losses.', legislation: 'The FCA requires regulated firms to report cyber incidents. GDPR mandates 72-hour breach notification to the ICO.' }
        ]
    },
    // ============ LEVEL 8 ============
    {
        id: 8,
        name: 'Cloud Services Provider',
        description: 'Protect cloud infrastructure serving hundreds of customers. Understand the shared responsibility model.',
        scenario: 'You manage security for a cloud services provider hosting applications and data for hundreds of businesses. A breach could affect all customers simultaneously. You must defend against attacks targeting the cloud infrastructure while maintaining the shared responsibility model with your tenants.',
        difficulty: 8,
        startingBudget: 9500,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'training', 'patchMgmt', 'proxyNode', 'quarantine', 'segmentation'],
        paths: [
            [
                { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 2 },
                { x: 9, y: 2 }, { x: 9, y: 0 }, { x: 19, y: 0 }
            ],
            [
                { x: 0, y: 4 }, { x: 3, y: 4 }, { x: 3, y: 6 },
                { x: 8, y: 6 }, { x: 8, y: 4 }, { x: 14, y: 4 },
                { x: 14, y: 6 }, { x: 19, y: 6 }
            ],
            [
                { x: 0, y: 8 }, { x: 5, y: 8 }, { x: 5, y: 10 },
                { x: 10, y: 10 }, { x: 10, y: 8 }, { x: 19, y: 8 }
            ],
            [
                { x: 0, y: 11 }, { x: 7, y: 11 }, { x: 7, y: 9 },
                { x: 13, y: 9 }, { x: 13, y: 11 }, { x: 19, y: 11 }
            ]
        ],
        assets: [
            { x: 19, y: 0, name: 'Cloud Storage', type: 'database', health: 110 },
            { x: 19, y: 6, name: 'API Gateway', type: 'server', health: 100 },
            { x: 19, y: 8, name: 'Customer VMs', type: 'server', health: 100 },
            { x: 19, y: 11, name: 'Admin Console', type: 'database', health: 80 }
        ],
        waves: [
            { threats: [{ type: 'sqlInjection', count: 8, interval: 1000, path: 1 }, { type: 'phishing', count: 10, interval: 600, path: 0 }, { type: 'malware', count: 5, interval: 1500, path: 2 }] },
            { threats: [{ type: 'ddos', count: 20, interval: 250, path: 0 }, { type: 'trojan', count: 5, interval: 1500, path: 1 }, { type: 'insider', count: 3, interval: 2500, path: 3 }, { type: 'malware', count: 6, interval: 1200, path: 2 }], synergy: 'coverFire' },
            // Wave 3: API-focused attack + Sniffer intel
            { threats: [{ type: 'sniffer', count: 3, interval: 3000, path: 1 }, { type: 'sqlInjection', count: 8, interval: 800, path: 1 }, { type: 'phishing', count: 12, interval: 500, path: 0 }, { type: 'ransomware', count: 4, interval: 2000, path: 3 }], synergy: 'credentialBreach' },
            { threats: [{ type: 'zeroDay', count: 5, interval: 1500, path: 0 }, { type: 'ransomware', count: 5, interval: 1800, path: 2 }, { type: 'ddos', count: 20, interval: 200, path: 1 }, { type: 'sniffer', count: 2, interval: 4000, path: 3 }, { type: 'insider', count: 4, interval: 2000, path: 3 }] },
            // Wave 5: Multi-tenant breach attempt
            { threats: [{ type: 'sniffer', count: 3, interval: 3000, path: 0 }, { type: 'phishing', count: 15, interval: 400, path: 0 }, { type: 'sqlInjection', count: 10, interval: 700, path: 1 }, { type: 'malware', count: 8, interval: 900, path: 2 }, { type: 'ransomware', count: 6, interval: 1500, path: 2 }, { type: 'zeroDay', count: 4, interval: 2000, path: 3 }] },
            { threats: [{ type: 'ddos', count: 30, interval: 180, path: 0 }, { type: 'sniffer', count: 3, interval: 3500, path: 1 }, { type: 'trojan', count: 6, interval: 1200, path: 1 }, { type: 'insider', count: 5, interval: 1500, path: 2 }, { type: 'ransomware', count: 8, interval: 1000, path: 3 }, { type: 'zeroDay', count: 6, interval: 1200, path: 0 }] }
        ],
        learningSummary: {
            title: 'Cloud Security & Shared Responsibility',
            points: [
                'The shared responsibility model means the provider secures the infrastructure, tenants secure their data and applications.',
                'API security is critical - APIs are the primary attack surface in cloud environments.',
                'Multi-tenancy means a single vulnerability could affect hundreds of customers.',
                'Cloud environments require identity-based security rather than perimeter-based.',
                'Data sovereignty laws mean data location matters - GDPR restricts transfers outside the EU.',
                'Automated security monitoring is essential at cloud scale.'
            ],
            legislation: 'Cloud providers must comply with GDPR (especially Articles 28 and 32 on processor obligations), the NIS Regulations 2018 for digital service providers, and contractual SLAs. Data stored in the cloud is still subject to the Data Protection Act 2018.'
        },
        eduPopups: [
            { wave: 2, title: 'Shared Responsibility Model', text: 'In cloud computing, security is shared: the provider secures the infrastructure (physical, network, hypervisor), while customers are responsible for their data, access management, and application security. Misunderstanding this model is a leading cause of cloud breaches.', legislation: 'GDPR Article 28 requires data controllers to only use processors (cloud providers) that provide sufficient guarantees of appropriate security measures.' },
            { wave: 5, title: 'Multi-Tenant Security Risks', text: 'Cloud platforms serve many customers on shared infrastructure. A vulnerability in the platform or a compromised admin account could expose all tenants. Network segmentation, strong access controls, and encryption are essential to maintain isolation between tenants.', legislation: 'The NIS Regulations 2018 classify cloud computing services as digital services, requiring providers to take appropriate security measures and report significant incidents.' }
        ]
    },
    // ============ LEVEL 9 ============
    {
        id: 9,
        name: 'National Cyber Security Centre',
        description: 'Defend against Advanced Persistent Threats targeting national security systems.',
        scenario: 'You have been appointed to the defensive operations team at a national cyber security centre. State-sponsored APT groups are targeting intelligence systems, secure communications, and research facilities. Every threat type and synergy is in play. Apply the cyber kill chain model to identify and neutralise threats at each stage.',
        difficulty: 9,
        startingBudget: 11000,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'training', 'patchMgmt', 'proxyNode', 'quarantine', 'segmentation'],
        paths: [
            [
                { x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 3 },
                { x: 7, y: 3 }, { x: 7, y: 0 }, { x: 12, y: 0 },
                { x: 12, y: 3 }, { x: 19, y: 3 }
            ],
            [
                { x: 0, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 7 },
                { x: 10, y: 7 }, { x: 10, y: 5 }, { x: 19, y: 5 }
            ],
            [
                { x: 0, y: 8 }, { x: 4, y: 8 }, { x: 4, y: 10 },
                { x: 9, y: 10 }, { x: 9, y: 8 }, { x: 15, y: 8 },
                { x: 15, y: 10 }, { x: 19, y: 10 }
            ],
            [
                { x: 0, y: 11 }, { x: 6, y: 11 }, { x: 6, y: 9 },
                { x: 14, y: 9 }, { x: 14, y: 11 }, { x: 19, y: 11 }
            ]
        ],
        assets: [
            { x: 19, y: 3, name: 'Intelligence Database', type: 'database', health: 130 },
            { x: 19, y: 5, name: 'Secure Comms Network', type: 'server', health: 110 },
            { x: 19, y: 10, name: 'Threat Alert System', type: 'server', health: 100 },
            { x: 19, y: 11, name: 'Research Laboratory', type: 'server', health: 90 }
        ],
        waves: [
            // Wave 1: Reconnaissance phase - sniffers and phishing probes
            { threats: [{ type: 'sniffer', count: 4, interval: 2500, path: 0 }, { type: 'phishing', count: 12, interval: 500, path: 1 }, { type: 'malware', count: 6, interval: 1200, path: 2 }, { type: 'ddos', count: 10, interval: 500, path: 3 }] },
            // Wave 2: Weaponisation - exploits delivered via multiple vectors
            { threats: [{ type: 'trojan', count: 6, interval: 1200, path: 0 }, { type: 'sqlInjection', count: 8, interval: 900, path: 1 }, { type: 'zeroDay', count: 4, interval: 2000, path: 2 }, { type: 'insider', count: 3, interval: 2500, path: 3 }], synergy: 'coverFire' },
            // Wave 3: Exploitation - credential breach + sniffer intelligence
            { threats: [{ type: 'sniffer', count: 3, interval: 3000, path: 0 }, { type: 'phishing', count: 15, interval: 400, path: 0 }, { type: 'ransomware', count: 6, interval: 1500, path: 1 }, { type: 'ddos', count: 20, interval: 200, path: 2 }, { type: 'malware', count: 8, interval: 800, path: 3 }], synergy: 'credentialBreach' },
            // Wave 4: Installation and C2 - persistent threats
            { threats: [{ type: 'trojan', count: 8, interval: 1000, path: 0 }, { type: 'sniffer', count: 3, interval: 3500, path: 1 }, { type: 'zeroDay', count: 6, interval: 1500, path: 1 }, { type: 'ransomware', count: 6, interval: 1200, path: 2 }, { type: 'insider', count: 5, interval: 1500, path: 3 }, { type: 'malware', count: 10, interval: 700, path: 0 }] },
            // Wave 5: Actions on objectives - full APT assault
            { threats: [{ type: 'sniffer', count: 4, interval: 2500, path: 0 }, { type: 'ddos', count: 25, interval: 180, path: 1 }, { type: 'phishing', count: 15, interval: 350, path: 0 }, { type: 'ransomware', count: 8, interval: 1000, path: 2 }, { type: 'zeroDay', count: 8, interval: 1200, path: 3 }, { type: 'trojan', count: 6, interval: 1200, path: 1 }] },
            // Wave 6: Exfiltration attempt - massive coordinated final push
            { threats: [{ type: 'sniffer', count: 4, interval: 2000, path: 0 }, { type: 'insider', count: 6, interval: 1200, path: 0 }, { type: 'ddos', count: 30, interval: 150, path: 1 }, { type: 'ransomware', count: 8, interval: 900, path: 2 }, { type: 'zeroDay', count: 8, interval: 1000, path: 3 }, { type: 'malware', count: 12, interval: 600, path: 1 }, { type: 'sqlInjection', count: 8, interval: 800, path: 3 }] }
        ],
        learningSummary: {
            title: 'Advanced Persistent Threats & the Cyber Kill Chain',
            points: [
                'APTs are long-term, targeted attacks by well-resourced adversaries (often state-sponsored).',
                'The Cyber Kill Chain has 7 stages: Reconnaissance, Weaponisation, Delivery, Exploitation, Installation, Command & Control, Actions on Objectives.',
                'Defending at each kill chain stage provides multiple opportunities to detect and stop attacks.',
                'Threat intelligence sharing between organisations improves collective defence.',
                'Zero-day exploits require defense-in-depth since signature-based detection fails.',
                'Incident response must include forensic analysis to understand the full scope of compromise.'
            ],
            legislation: 'National security systems are governed by the Official Secrets Act 1989, NIS Regulations 2018, GDPR, and sector-specific classified information handling procedures. The NCSC provides guidance under the Cyber Assessment Framework (CAF).'
        },
        eduPopups: [
            { wave: 1, title: 'The Cyber Kill Chain', text: 'Lockheed Martin\'s Cyber Kill Chain describes 7 stages of a cyber attack: Reconnaissance (gathering info), Weaponisation (creating exploits), Delivery (sending the attack), Exploitation (triggering the vulnerability), Installation (establishing persistence), C2 (remote control), and Actions on Objectives (stealing data). Each stage is a chance to detect and stop the attacker.', legislation: 'The NCSC Cyber Assessment Framework requires organisations to have capabilities to detect and respond to attacks at multiple stages.' },
            { wave: 4, title: 'Threat Intelligence', text: 'Threat intelligence involves collecting, analysing, and sharing information about current threats and attackers. The NCSC shares threat intelligence with UK organisations through CiSP (Cyber Security Information Sharing Partnership). Understanding attacker tactics (TTPs) helps defenders anticipate and prevent attacks.', legislation: 'The NIS Regulations 2018 encourage information sharing between competent authorities and operators of essential services.' }
        ]
    },
    // ============ LEVEL 10 ============
    {
        id: 10,
        name: 'Global Defence Network',
        description: 'The ultimate test: defend interconnected international systems against every threat.',
        scenario: 'You command the cyber defence of a global coalition network connecting satellite communications, military command centres, defence grids, and intelligence hubs across multiple nations. Every attack type and synergy is deployed simultaneously. This is the ultimate test of everything you have learned about cyber security. Apply all your knowledge of threats, defences, legislation, and strategy to survive.',
        difficulty: 10,
        startingBudget: 13000,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'training', 'patchMgmt', 'proxyNode', 'quarantine', 'segmentation'],
        paths: [
            [
                { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 },
                { x: 6, y: 2 }, { x: 6, y: 0 }, { x: 10, y: 0 },
                { x: 10, y: 2 }, { x: 15, y: 2 }, { x: 15, y: 0 },
                { x: 19, y: 0 }
            ],
            [
                { x: 0, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 6 },
                { x: 8, y: 6 }, { x: 8, y: 4 }, { x: 13, y: 4 },
                { x: 13, y: 6 }, { x: 19, y: 6 }
            ],
            [
                { x: 0, y: 8 }, { x: 3, y: 8 }, { x: 3, y: 10 },
                { x: 7, y: 10 }, { x: 7, y: 8 }, { x: 12, y: 8 },
                { x: 12, y: 10 }, { x: 19, y: 10 }
            ],
            [
                { x: 0, y: 11 }, { x: 5, y: 11 }, { x: 5, y: 9 },
                { x: 11, y: 9 }, { x: 11, y: 11 }, { x: 16, y: 11 },
                { x: 16, y: 9 }, { x: 19, y: 9 }
            ]
        ],
        assets: [
            { x: 19, y: 0, name: 'Satellite Uplink', type: 'server', health: 120 },
            { x: 19, y: 6, name: 'Command Centre', type: 'database', health: 130 },
            { x: 19, y: 10, name: 'Defence Grid', type: 'server', health: 110 },
            { x: 19, y: 9, name: 'Intel Hub', type: 'database', health: 100 }
        ],
        waves: [
            // Wave 1: Probing attacks across all paths
            { threats: [{ type: 'phishing', count: 15, interval: 400, path: 0 }, { type: 'malware', count: 8, interval: 900, path: 1 }, { type: 'ddos', count: 15, interval: 300, path: 2 }, { type: 'sqlInjection', count: 6, interval: 1200, path: 3 }] },
            // Wave 2: Coordinated synergy assault - cover fire + sniffer
            { threats: [{ type: 'ddos', count: 25, interval: 200, path: 0 }, { type: 'sniffer', count: 3, interval: 3000, path: 1 }, { type: 'malware', count: 8, interval: 800, path: 1 }, { type: 'trojan', count: 6, interval: 1200, path: 2 }, { type: 'insider', count: 4, interval: 2000, path: 3 }], synergy: 'coverFire' },
            // Wave 3: Credential breach + zero-day combo
            { threats: [{ type: 'phishing', count: 15, interval: 350, path: 0 }, { type: 'ransomware', count: 8, interval: 1200, path: 0 }, { type: 'sniffer', count: 3, interval: 2500, path: 1 }, { type: 'zeroDay', count: 6, interval: 1500, path: 2 }, { type: 'sqlInjection', count: 8, interval: 800, path: 3 }], synergy: 'credentialBreach' },
            // Wave 4: All synergies active across all paths
            { threats: [{ type: 'sniffer', count: 4, interval: 2000, path: 0 }, { type: 'ddos', count: 20, interval: 200, path: 1 }, { type: 'phishing', count: 12, interval: 400, path: 0 }, { type: 'ransomware', count: 6, interval: 1200, path: 2 }, { type: 'malware', count: 10, interval: 600, path: 1 }, { type: 'insider', count: 5, interval: 1500, path: 3 }, { type: 'zeroDay', count: 5, interval: 1500, path: 3 }] },
            // Wave 5: Overwhelming force on every front
            { threats: [{ type: 'sniffer', count: 4, interval: 2500, path: 0 }, { type: 'ddos', count: 30, interval: 150, path: 0 }, { type: 'ransomware', count: 8, interval: 900, path: 1 }, { type: 'zeroDay', count: 8, interval: 1000, path: 2 }, { type: 'trojan', count: 8, interval: 900, path: 1 }, { type: 'insider', count: 6, interval: 1200, path: 3 }, { type: 'sqlInjection', count: 8, interval: 800, path: 2 }] },
            // Wave 6: Apocalypse wave - every threat type at maximum intensity
            { threats: [{ type: 'sniffer', count: 5, interval: 2000, path: 0 }, { type: 'phishing', count: 20, interval: 300, path: 0 }, { type: 'ransomware', count: 10, interval: 800, path: 1 }, { type: 'ddos', count: 30, interval: 150, path: 1 }, { type: 'zeroDay', count: 10, interval: 900, path: 2 }, { type: 'malware', count: 15, interval: 500, path: 2 }, { type: 'insider', count: 8, interval: 1000, path: 3 }, { type: 'trojan', count: 8, interval: 900, path: 3 }, { type: 'sqlInjection', count: 10, interval: 700, path: 3 }] },
            // Wave 7: The Final Stand - impossible without mastery
            { threats: [{ type: 'sniffer', count: 5, interval: 1500, path: 0 }, { type: 'ddos', count: 35, interval: 120, path: 0 }, { type: 'phishing', count: 20, interval: 250, path: 1 }, { type: 'ransomware', count: 12, interval: 700, path: 1 }, { type: 'zeroDay', count: 12, interval: 800, path: 2 }, { type: 'insider', count: 8, interval: 900, path: 2 }, { type: 'malware', count: 15, interval: 400, path: 3 }, { type: 'trojan', count: 10, interval: 700, path: 3 }, { type: 'sqlInjection', count: 10, interval: 600, path: 0 }] }
        ],
        learningSummary: {
            title: 'Comprehensive Cyber Defence Mastery',
            points: [
                'Effective cyber security requires understanding threats, controls, legislation, and strategy together.',
                'Defence in depth with multiple layered controls is the foundation of all security architectures.',
                'No single technology can protect against all threats - human training is equally important.',
                'International cooperation and threat intelligence sharing strengthen collective defence.',
                'Compliance with legislation (GDPR, DPA, CMA, NIS) is a legal requirement, not optional.',
                'Business continuity planning ensures organisations survive even successful attacks.',
                'The cyber security landscape constantly evolves - continuous learning is essential.'
            ],
            legislation: 'This level covers all UK cyber legislation: GDPR (data protection), Data Protection Act 2018, Computer Misuse Act 1990 (criminalising hacking), NIS Regulations 2018 (essential services), and sector-specific regulations. International frameworks include ISO 27001 and the NIST Cybersecurity Framework.'
        },
        eduPopups: [
            { wave: 1, title: 'Defence in Depth - The Complete Picture', text: 'True defence in depth combines physical controls (locks, security guards), technical controls (firewalls, encryption, IDS), and procedural controls (policies, training, incident response). No single layer is sufficient. The goal is to slow attackers enough that detection and response can neutralise the threat.', legislation: 'GDPR Article 32 requires "appropriate technical and organisational measures" - this encompasses all three categories of controls.' },
            { wave: 4, title: 'The Future of Cyber Security', text: 'Emerging threats include AI-powered attacks, quantum computing breaking current encryption, IoT device vulnerabilities, and deepfake social engineering. Defenders must adopt zero-trust architectures, automated threat detection (SIEM/SOAR), and continuous security monitoring. The skills you have learned in these levels form the foundation for addressing these future challenges.', legislation: 'The UK Cyber Strategy 2022 outlines the government\'s approach to making the UK a leading cyber power, including workforce development, research, and international partnerships.' }
        ]
    }
];

// --- Encyclopedia Entries ---
export const ENCYCLOPEDIA = {
    threats: {
        title: 'Cyber Threats',
        entries: Object.entries(THREAT_TYPES).map(([key, t]) => ({
            id: key,
            name: t.name,
            content: {
                overview: t.educationalNote,
                inGame: t.description,
                stats: `Speed: ${t.speed} | Health: ${t.health} | Damage: ${t.damage}`,
                prevention: getPreventionText(key)
            }
        }))
    },
    defenses: {
        title: 'Security Controls',
        entries: Object.entries(TOWER_TYPES).map(([key, t]) => ({
            id: key,
            name: t.name,
            content: {
                overview: t.educationalNote,
                inGame: t.description,
                stats: t.type === 'active' ? `Range: ${t.range} | Damage: ${t.damage} | Cost: \u00A3${t.cost}` : `Type: Passive | Cost: \u00A3${t.cost}`,
                upgradePath: t.upgrades.map(u => u.name).join(' \u2192 ')
            }
        }))
    },
    legislation: {
        title: 'Legislation & Compliance',
        entries: [
            {
                id: 'gdpr',
                name: 'GDPR',
                content: {
                    overview: 'The General Data Protection Regulation (2018) is an EU regulation on data protection and privacy. It applies to all organizations processing personal data of EU citizens.',
                    keyPoints: [
                        'Lawful basis required for processing personal data',
                        'Data subjects have rights: access, rectification, erasure, portability',
                        'Data Protection Impact Assessments required for high-risk processing',
                        'Breach notification within 72 hours to supervisory authority',
                        'Fines up to \u20AC20 million or 4% of global annual turnover'
                    ],
                    inGame: 'Referenced throughout levels. Organizations must implement appropriate security measures to protect personal data.'
                }
            },
            {
                id: 'dpa2018',
                name: 'Data Protection Act 2018',
                content: {
                    overview: 'The UK\'s implementation of GDPR. It sets out the framework for data protection law in the UK and supplements the GDPR.',
                    keyPoints: [
                        'Six principles of data processing (lawfulness, purpose limitation, data minimisation, accuracy, storage limitation, security)',
                        'Special category data (health, biometric, genetic) requires extra protection',
                        'Establishes the role of the Information Commissioner\'s Office (ICO)',
                        'Criminal offences for intentional misuse of personal data',
                        'Applies to all UK organizations processing personal data'
                    ],
                    inGame: 'Healthcare and education levels highlight the need for protecting special category data.'
                }
            },
            {
                id: 'cma1990',
                name: 'Computer Misuse Act 1990',
                content: {
                    overview: 'UK legislation that makes certain activities illegal, such as hacking into computer systems, and is the main legislation addressing cybercrime in the UK.',
                    keyPoints: [
                        'Section 1: Unauthorized access to computer material (up to 2 years imprisonment)',
                        'Section 2: Unauthorized access with intent to commit further offences (up to 5 years)',
                        'Section 3: Unauthorized acts with intent to impair computer operation (up to 10 years)',
                        'Section 3A: Making, supplying or obtaining articles for use in computer misuse offences',
                        'Applies to actions both within and outside the UK if they affect UK computers'
                    ],
                    inGame: 'The threats you defend against (hacking, malware, ransomware) are all offences under this Act.'
                }
            }
        ]
    }
};

/** Total number of encyclopedia entries (all categories). Used for achievement threshold. */
export function getEncyclopediaEntryCount() {
    return Object.values(ENCYCLOPEDIA).reduce((n, cat) => n + (cat.entries?.length || 0), 0);
}

function getPreventionText(threatType) {
    const preventions = {
        phishing: 'Email filters, security training, and multi-factor authentication are key defenses against phishing.',
        malware: 'Antivirus software, firewalls, and regular system updates help prevent malware infections.',
        ransomware: 'Regular backups, email filtering, and user training are the best defenses. Never pay the ransom.',
        ddos: 'IDS/IPS systems, firewalls, and traffic analysis can detect and mitigate DDoS attacks.',
        sqlInjection: 'Input validation, parameterized queries, patch management, and web application firewalls prevent SQL injection.',
        trojan: 'Antivirus software, access controls, and user training help detect and prevent trojans.',
        insider: 'Access controls, user monitoring, security training, and the principle of least privilege reduce insider threat risk.',
        zeroDay: 'Patch management, AI-based detection, IDS/IPS, and defense in depth provide the best protection against zero-days.',
        sniffer: 'IDS/IPS systems detect packet capture activity. Encryption limits what sniffers can read. Network segmentation restricts lateral movement.'
    };
    return preventions[threatType] || '';
}

// --- Quiz Questions (BTEC exam-style, per level) ---
export const QUIZ_QUESTIONS = {
    // =======================================================================
    // QUESTION BANK — balanced across D1-D5
    // Each question has: question, options (plausible distractors), correct,
    // explanation (shown always), remediation (extra required reading on wrong),
    // specRef (e.g. "D2"), source (empirical claim citation)
    // =======================================================================
    general: [
        // --- D1 general ---
        {
            question: 'Which of the following is the MOST common method used by cyber criminals to gain initial access to a network?',
            options: [
                'A) Distributed denial-of-service (DDoS)',
                'B) Phishing email',
                'C) Zero-day exploit',
                'D) Brute-force password attack'
            ],
            correct: 1,
            explanation: 'Phishing emails are responsible for the majority of initial-access breaches. They trick users into clicking malicious links or revealing credentials.',
            remediation: 'Phishing is a social engineering technique. Unlike DDoS (which overwhelms servers) or brute-force (which guesses passwords), phishing exploits human trust. Zero-day exploits are rare and expensive — phishing is far cheaper and more common for attackers.',
            specRef: 'D1',
            source: 'Verizon DBIR, 2023'
        },
        {
            question: 'A "zero-day" vulnerability is dangerous because:',
            options: [
                'A) It only affects computers that are switched off',
                'B) The vendor has had zero days to produce a patch before exploitation',
                'C) It can only be exploited on the first day of the month',
                'D) It takes zero seconds to download the fix'
            ],
            correct: 1,
            explanation: '"Zero-day" means zero days of available defence — the vendor is unaware or has not yet issued a patch, leaving all users exposed.',
            remediation: 'Common confusion: zero-day does NOT mean the attack is instantaneous. It means the time between discovery by attackers and a patch being available is zero. Patch management reduces your exposure window once a fix exists.',
            specRef: 'D1',
            source: 'NCSC Glossary, 2024'
        },
        {
            question: 'A trojan horse differs from a virus because:',
            options: [
                'A) Trojans are less dangerous than viruses',
                'B) Trojans disguise themselves as legitimate software, tricking the user into installing them',
                'C) Trojans only affect mobile phones',
                'D) Trojans spread automatically without user interaction'
            ],
            correct: 1,
            explanation: 'Trojans disguise themselves as useful programs (like a game or tool). Unlike viruses, they rely on the user voluntarily installing them. The name comes from the Greek myth of the Trojan Horse.',
            remediation: 'Viruses attach to files and self-replicate. Worms spread across networks automatically. Trojans require user action to install because they masquerade as legitimate software. This social engineering element makes them particularly dangerous — users believe they are installing something safe.',
            specRef: 'D1',
            source: 'NCSC Malware Guidance, 2023'
        },
        {
            question: 'A DDoS attack overwhelms a target by:',
            options: [
                'A) Sending a single extremely large file',
                'B) Flooding the target with traffic from many compromised devices (a botnet)',
                'C) Hacking the administrator password',
                'D) Encrypting the server\'s files'
            ],
            correct: 1,
            explanation: 'DDoS (Distributed Denial of Service) uses thousands of compromised devices (a botnet) to simultaneously flood a target with traffic, making it unavailable to legitimate users.',
            remediation: 'A single large file is not a DDoS — it is the distributed nature (many sources) that makes it hard to block. Password hacking is a brute-force attack. Encrypting files is ransomware. DDoS specifically aims to deny service by overwhelming bandwidth or processing capacity.',
            specRef: 'D1',
            source: 'NCSC DDoS Guidance, 2023'
        },
        {
            question: 'An insider threat is particularly dangerous because:',
            options: [
                'A) Insiders have weaker passwords than external attackers',
                'B) Insiders already have authorised access, bypassing perimeter defenses like firewalls',
                'C) Insider threats only happen in large organisations',
                'D) Antivirus software is designed to detect insider activity'
            ],
            correct: 1,
            explanation: 'Insiders (employees, contractors) already have legitimate network access. They bypass firewalls and perimeter controls because they are already inside the network. This makes detection harder.',
            remediation: 'Insider threats are not about weak passwords — they exploit existing legitimate access. They occur in organisations of all sizes. Antivirus detects malware, not suspicious user behaviour. Access control, monitoring (IDS), and the principle of least privilege are the primary defenses.',
            specRef: 'D1',
            source: 'Verizon DBIR, 2023'
        },
        {
            question: 'Ransomware is particularly damaging to businesses because:',
            options: [
                'A) It only affects personal computers, not servers',
                'B) It encrypts data and demands payment, causing operational disruption and potential data loss',
                'C) It can be easily removed by restarting the computer',
                'D) It only affects files that are not important'
            ],
            correct: 1,
            explanation: 'Ransomware encrypts critical business files and demands payment (usually in cryptocurrency) for the decryption key. Without backups, the business faces permanent data loss or paying the ransom with no guarantee of recovery.',
            remediation: 'Ransomware targets servers, shared drives, and databases — not just personal PCs. Restarting does not decrypt files. It targets the most valuable data. The only reliable defense after encryption is having tested, offsite backups (the 3-2-1 rule).',
            specRef: 'D1',
            source: 'NCSC Ransomware Guidance, 2023'
        },
        // --- D2 general ---
        {
            question: 'Multi-factor authentication (MFA) protects accounts by:',
            options: [
                'A) Encrypting the password database',
                'B) Requiring two or more different types of evidence to verify identity',
                'C) Blocking all login attempts from outside the office',
                'D) Automatically changing the password every day'
            ],
            correct: 1,
            explanation: 'MFA combines something you know (password), something you have (phone/token), or something you are (biometric). Even if a password is stolen, the second factor blocks access.',
            remediation: 'MFA is NOT the same as encryption or IP restriction. Encryption protects data at rest/in transit. MFA protects the login process itself by requiring multiple proof types. Microsoft research shows MFA blocks 99.9% of automated attacks.',
            specRef: 'D2',
            source: 'Microsoft Security Blog, 2019'
        },
        {
            question: 'A firewall operates by:',
            options: [
                'A) Scanning files for known virus signatures',
                'B) Examining network packets and allowing or blocking them based on rules',
                'C) Encrypting all data leaving the network',
                'D) Training employees to recognise threats'
            ],
            correct: 1,
            explanation: 'Firewalls inspect network traffic against a set of predefined rules. They allow legitimate traffic and block suspicious connections at the network perimeter.',
            remediation: 'A common mistake is confusing firewalls with antivirus. Antivirus scans files for malware signatures. Firewalls filter network traffic. Encryption transforms data to be unreadable. Each is a different type of security control with a different purpose.',
            specRef: 'D2',
            source: 'NCSC Cyber Essentials, 2024'
        },
        {
            question: 'The purpose of an Intrusion Detection System (IDS) is to:',
            options: [
                'A) Prevent all attacks automatically',
                'B) Monitor network traffic and alert administrators to suspicious activity',
                'C) Replace firewalls entirely',
                'D) Encrypt data in transit'
            ],
            correct: 1,
            explanation: 'An IDS monitors network traffic for patterns that may indicate an attack and raises alerts. An IPS goes further by automatically blocking detected threats.',
            remediation: 'Key distinction: IDS detects and alerts (passive), while IPS detects and blocks (active). Neither replaces a firewall — they work alongside firewalls as part of defense in depth. IDS cannot encrypt data; that is the role of encryption protocols.',
            specRef: 'D2',
            source: 'NIST SP 800-94, 2007 (revised 2012)'
        },
        // --- D3 general ---
        {
            question: 'Under GDPR, how long does an organisation have to report a personal data breach to the ICO?',
            options: [
                'A) 24 hours',
                'B) 72 hours',
                'C) 7 working days',
                'D) 30 days'
            ],
            correct: 1,
            explanation: 'GDPR Article 33 requires notification to the supervisory authority within 72 hours of becoming aware of a personal data breach that poses a risk to individuals.',
            remediation: '24 hours is a common but incorrect answer — GDPR specifies 72 hours, not 24. The 30-day period applies to notifying affected individuals (Article 34), not the supervisory authority. The clock starts when the organisation becomes "aware" of the breach.',
            specRef: 'D3',
            source: 'GDPR Article 33, 2018'
        },
        {
            question: 'What does the Computer Misuse Act 1990 make illegal?',
            options: [
                'A) Using a computer without a licence',
                'B) Unauthorised access to computer material',
                'C) Sharing your own password with a colleague',
                'D) Installing open-source software'
            ],
            correct: 1,
            explanation: 'Section 1 of the Computer Misuse Act 1990 makes unauthorised access to computer material a criminal offence, punishable by up to 2 years imprisonment.',
            remediation: 'The Act has three main sections: S1 — unauthorised access; S2 — unauthorised access with intent to commit further offences; S3 — unauthorised modification of computer material. It does NOT regulate software licensing or password sharing (unless that sharing enables unauthorised access).',
            specRef: 'D3',
            source: 'Computer Misuse Act 1990 (legislation.gov.uk)'
        },
        // --- D4 general ---
        {
            question: 'Which security principle involves using multiple layers of different security controls?',
            options: [
                'A) Least privilege — giving users minimal access',
                'B) Defense in depth — layering controls so one failure doesn\'t compromise everything',
                'C) Security by obscurity — hiding systems from attackers',
                'D) Single sign-on — one password for all systems'
            ],
            correct: 1,
            explanation: 'Defense in depth layers multiple controls (firewalls, IDS, encryption, training, backups) so that if one fails, others still provide protection.',
            remediation: 'Least privilege limits user permissions (important, but a single control). Security by obscurity is considered a weak strategy because it relies on secrecy rather than strength. Single sign-on is an authentication convenience, not a security layering approach.',
            specRef: 'D4',
            source: 'NCSC 10 Steps to Cyber Security, 2021'
        },
        // --- D5 general ---
        {
            question: 'A business continuity plan (BCP) should be:',
            options: [
                'A) Written once and never changed',
                'B) Regularly tested, reviewed, and updated',
                'C) Only created after a major incident occurs',
                'D) Kept secret from all employees'
            ],
            correct: 1,
            explanation: 'BCPs must be living documents — regularly tested through exercises, updated to reflect changes, and communicated to relevant staff.',
            remediation: 'A common mistake is treating a BCP as a "write and forget" document. Untested plans often fail during real incidents. The BCI Horizon Scan Report found that organisations that test their BCP annually recover 50% faster from incidents.',
            specRef: 'D5',
            source: 'BCI Horizon Scan Report, 2023'
        },
        {
            question: 'The "3-2-1" backup rule recommends:',
            options: [
                'A) 3 passwords, 2 firewalls, 1 antivirus',
                'B) 3 copies of data, on 2 different media types, with 1 copy stored offsite',
                'C) Back up every 3 hours, keep for 2 days, on 1 server',
                'D) 3 staff trained, 2 backup systems, 1 recovery plan'
            ],
            correct: 1,
            explanation: 'The 3-2-1 rule ensures data survives any single disaster: 3 copies, 2 different media (e.g. hard drive + cloud), 1 offsite location.',
            remediation: 'This is a widely misremembered rule. The numbers refer specifically to copies, media types, and locations — not to time intervals, personnel, or other controls. Offsite storage is critical because local disasters (fire, flood) would destroy all on-premises copies.',
            specRef: 'D5',
            source: 'US-CERT / CISA Backup Guidance, 2022'
        }
    ],
    // =======================================================================
    //  LEVEL-SPECIFIC QUESTIONS
    // =======================================================================
    1: [
        {
            question: 'A small business receives an email claiming to be from their bank, asking them to click a link and verify their account. What type of attack is this?',
            options: [
                'A) Ransomware — it will encrypt their files',
                'B) DDoS — it will flood their network',
                'C) Phishing — it impersonates a trusted entity to steal data',
                'D) SQL injection — it targets the bank\'s database'
            ],
            correct: 2,
            explanation: 'This is phishing — a social engineering attack that impersonates a trusted entity (the bank) to trick victims into revealing credentials or clicking malicious links.',
            remediation: 'Ransomware encrypts files and demands payment. DDoS floods a server with traffic. SQL injection manipulates database queries. Phishing specifically uses deception and impersonation to trick humans — that is the key distinction here.',
            specRef: 'D1',
            source: 'NCSC Phishing Guidance, 2023'
        },
        {
            question: 'Which combination of controls is MOST effective against phishing?',
            options: [
                'A) Firewall + antivirus — they block all email threats',
                'B) Email filtering + security awareness training',
                'C) Encryption + backup — they protect the data instead',
                'D) Stronger passwords alone'
            ],
            correct: 1,
            explanation: 'Email filters catch technical indicators (malicious links, spoofed domains), while training ensures employees recognise attempts that bypass filters. The combination addresses both the technical and human factors.',
            remediation: 'Firewalls filter network traffic, not email content. Stronger passwords help if credentials are stolen but don\'t prevent the phishing email from arriving. Encryption protects data at rest, not the social engineering attack itself. The right answer combines a technical control (email filter) with a human control (training).',
            specRef: 'D2',
            source: 'NCSC Phishing Guidance, 2023'
        },
        {
            question: 'Why does a firewall alone NOT provide complete protection?',
            options: [
                'A) Firewalls are outdated technology that no one uses',
                'B) Some threats like phishing arrive through legitimate channels that firewalls allow',
                'C) Firewalls only protect against physical theft',
                'D) Firewalls block all traffic, including legitimate users'
            ],
            correct: 1,
            explanation: 'Phishing emails travel through legitimate email channels. Firewalls allow normal email traffic, so phishing passes straight through. This is why defense in depth (multiple layers) is essential.',
            remediation: 'Firewalls are NOT outdated — they are essential for network security. But they operate at the network level and cannot analyse email content for social engineering. This demonstrates a core D4 principle: no single control protects against all threats.',
            specRef: 'D4',
            source: 'NCSC 10 Steps to Cyber Security, 2021'
        },
        {
            question: 'Under the Data Protection Act 2018, customer email addresses are classified as:',
            options: [
                'A) Public information — anyone can use them',
                'B) Personal data — requiring appropriate security measures',
                'C) Special category data — like health records',
                'D) Not data — because they are digital'
            ],
            correct: 1,
            explanation: 'Email addresses are personal data under the DPA 2018 because they can identify a living individual. Organisations must implement appropriate security measures to protect them.',
            remediation: 'Special category data refers to sensitive information like health, biometric, or political data — NOT ordinary contact details. Email addresses identify individuals, so they ARE personal data. "Public information" does not exempt data from protection if it identifies a person.',
            specRef: 'D3',
            source: 'ICO Guide to DPA 2018, 2018'
        },
        {
            question: 'If a small business suffers a phishing attack and loses customer data, which of these is an immediate business impact?',
            options: [
                'A) The business will be permanently shut down by the government',
                'B) Loss of customer trust, potential fines, and disruption to operations',
                'C) Only the IT department is affected',
                'D) Nothing happens if fewer than 100 records are lost'
            ],
            correct: 1,
            explanation: 'Data breaches cause reputational damage, potential regulatory fines, operational disruption, and loss of customer confidence — regardless of business size.',
            remediation: 'There is no minimum threshold of records for GDPR to apply. Even one person\'s data being breached can trigger notification requirements. The impact extends well beyond IT — it affects customer relationships, legal obligations, and business reputation.',
            specRef: 'D5',
            source: 'UK Cyber Breaches Survey, 2023'
        },
        {
            question: 'Which principle of the Data Protection Act 2018 requires personal data to be accurate and, where necessary, kept up to date?',
            options: [
                'A) Lawfulness and fairness',
                'B) Accuracy',
                'C) Storage limitation',
                'D) Integrity and confidentiality'
            ],
            correct: 1,
            explanation: 'The Accuracy principle (GDPR Article 5(1)(d)) requires that personal data is accurate and, where necessary, kept up to date; inaccurate data must be erased or rectified without delay.',
            remediation: 'The six DPA 2018 principles are: lawfulness, purpose limitation, data minimisation, accuracy, storage limitation, and security. Accuracy supports both individual rights and reliable business use.',
            specRef: 'D3',
            source: 'DPA 2018 Schedule 1'
        },
        {
            question: 'Under the Computer Misuse Act 1990, which section makes unauthorised access with intent to commit further offences a criminal offence?',
            options: [
                'A) Section 1',
                'B) Section 2',
                'C) Section 3',
                'D) Section 3A'
            ],
            correct: 1,
            explanation: 'Section 2 of the Computer Misuse Act 1990 covers unauthorised access with intent to commit or facilitate further offences (e.g. stealing data). It carries up to 5 years imprisonment.',
            remediation: 'Section 1 is basic unauthorised access; Section 2 adds intent to commit further offences; Section 3 covers unauthorised acts impairing operation (e.g. DDoS); Section 3A covers making/supplying articles for misuse.',
            specRef: 'D3',
            source: 'Computer Misuse Act 1990'
        },
        {
            question: 'Why is defence in depth important in cyber security?',
            options: [
                'A) It means using one very strong control so nothing else is needed',
                'B) Multiple layers mean if one control fails, others can still protect; no single point of failure',
                'C) It only applies to physical security',
                'D) It replaces the need for staff training'
            ],
            correct: 1,
            explanation: 'Defence in depth uses multiple overlapping controls (technical, procedural, human). If one layer is bypassed — e.g. phishing gets past the firewall — other layers (e.g. training, access control) can still limit harm.',
            remediation: 'No single control protects against all threats. Layering firewall, email filter, antivirus, access control, encryption, backup, and training reduces risk and limits impact of a single failure.',
            specRef: 'D4',
            source: 'NCSC 10 Steps to Cyber Security, 2021'
        },
        {
            question: 'What is the main purpose of a business continuity plan (BCP) in the context of cyber incidents?',
            options: [
                'A) To prevent all cyber attacks from happening',
                'B) To enable the organisation to continue or restore operations and meet obligations after an incident',
                'C) To replace the need for backups',
                'D) To prosecute attackers'
            ],
            correct: 1,
            explanation: 'A BCP describes how the organisation will maintain or restore critical operations during and after a disruption (e.g. ransomware, outage), including communication and recovery steps.',
            remediation: 'BCP is part of D5 (Business Continuity & Disaster Recovery). It works with backups, incident response, and testing. It does not prevent attacks or replace technical controls.',
            specRef: 'D5',
            source: 'NCSC Business Continuity Guidance'
        },
        {
            question: 'Which security control is most effective at reducing the impact of ransomware on business data?',
            options: [
                'A) A stronger firewall only',
                'B) Regular, tested backups (especially offsite or immutable) so data can be restored without paying the ransom',
                'C) Disabling all email',
                'D) Using the same password for all systems'
            ],
            correct: 1,
            explanation: 'Ransomware encrypts data and demands payment. The only reliable way to recover without paying is to restore from backups. Backups must be regular, tested, and protected (e.g. offsite, not constantly connected).',
            remediation: 'Firewalls and email filters can reduce delivery of ransomware but cannot decrypt data once encrypted. Backup is the key D2/D5 control for ransomware resilience.',
            specRef: 'D2',
            source: 'NCSC Ransomware Guidance, 2023'
        },
        {
            question: 'GDPR requires a personal data breach to be reported to the supervisory authority within:',
            options: [
                'A) 24 hours',
                'B) 72 hours of becoming aware of it',
                'C) 30 days',
                'D) Only if more than 1000 people are affected'
            ],
            correct: 1,
            explanation: 'Under GDPR Article 33, a breach must be reported to the ICO (or relevant supervisory authority) without undue delay and, where feasible, within 72 hours of becoming aware of it.',
            remediation: 'There is no minimum number of affected individuals for the 72-hour notification. Failure to report can result in significant fines. Individuals may also need to be informed under Article 34.',
            specRef: 'D3',
            source: 'GDPR Article 33, 2018'
        },
        {
            question: 'An insider threat is difficult to defend against because:',
            options: [
                'A) Insiders use the fastest computers',
                'B) Insiders already have authorised access, so they bypass perimeter controls like firewalls',
                'C) Antivirus does not work on insiders',
                'D) Insiders are only in large organisations'
            ],
            correct: 1,
            explanation: 'Insiders (employees or contractors) have legitimate access to systems and data. They can bypass firewalls and many technical controls, making access control, monitoring (IDS), and least privilege essential.',
            remediation: 'D1 includes insider threats. D2 controls that help include access control, monitoring, and training. No organisation size is exempt.',
            specRef: 'D1',
            source: 'Verizon DBIR, 2023'
        },
        {
            question: 'What role does encryption play in protecting personal data?',
            options: [
                'A) It prevents any data from being stolen',
                'B) It makes data unreadable to anyone without the key, so stolen or leaked data cannot be read',
                'C) It replaces the need for access control',
                'D) It is only required for email'
            ],
            correct: 1,
            explanation: 'Encryption converts data into ciphertext that can only be read with the correct key. If data is stolen or leaked, encryption protects confidentiality because the attacker cannot read it without the key.',
            remediation: 'Encryption is a key D2 control. It protects data at rest and in transit. It does not prevent theft or replace access control; it reduces the impact of unauthorised access or loss.',
            specRef: 'D2',
            source: 'NCSC Encryption Guidance'
        },
        {
            question: 'A zero-day vulnerability is particularly dangerous because:',
            options: [
                'A) It only works at midnight',
                'B) There is no patch available yet, so defences that rely on known signatures may fail',
                'C) It only affects one computer',
                'D) Antivirus always detects it'
            ],
            correct: 1,
            explanation: '"Zero-day" means the vendor has had zero days to issue a patch. Attackers can exploit it before a fix exists, so signature-based antivirus and many perimeter controls may not detect it. Defence in depth and behavioural detection help.',
            remediation: 'D1 covers zero-day exploits. D2 controls include patch management (once a patch exists), IDS/IPS for behaviour, and defence in depth so other layers can limit damage.',
            specRef: 'D1',
            source: 'NCSC Zero Day Guidance'
        },
        {
            question: 'Which of these is a strong counter to SQL injection attacks?',
            options: [
                'A) Using the same password for the database and the application',
                'B) Parameterised queries (prepared statements) and input validation so user input cannot alter query structure',
                'C) Turning off the firewall',
                'D) Storing all data in one table'
            ],
            correct: 1,
            explanation: 'SQL injection works by inserting malicious SQL through user input. Parameterised queries and input validation ensure user input is treated as data, not as part of the query structure, preventing injection.',
            remediation: 'D1 covers SQL injection. D2 controls include secure coding (parameterised queries), input validation, patch management, and web application firewalls.',
            specRef: 'D2',
            source: 'OWASP SQL Injection Prevention'
        },
        {
            question: 'The ICO (Information Commissioner\'s Office) can impose fines for serious breaches of data protection law up to:',
            options: [
                'A) \u00A3100,000',
                'B) \u00A317.5 million or 4% of global annual turnover, whichever is higher',
                'C) \u00A31 million only',
                'D) No financial penalties'
            ],
            correct: 1,
            explanation: 'Under GDPR, the ICO can impose fines of up to \u20AC20 million or 4% of global annual turnover (whichever is higher) for the most serious infringements. In the UK this is applied in pounds.',
            remediation: 'D3: The ICO enforces the DPA 2018 and UK GDPR. Fines are tiered; the maximum applies to serious breaches of principles such as lawful processing, security, or international transfer rules.',
            specRef: 'D3',
            source: 'ICO Regulatory Action Policy'
        },
        {
            question: 'Why might an organisation conduct a Data Protection Impact Assessment (DPIA) before a new project?',
            options: [
                'A) To avoid storing any data',
                'B) To identify and mitigate privacy risks to individuals before processing starts, and to demonstrate compliance',
                'C) To delete all existing data',
                'D) Only when requested by the marketing team'
            ],
            correct: 1,
            explanation: 'A DPIA is required under GDPR when processing is likely to result in high risk to individuals. It identifies risks, mitigations, and helps demonstrate that the organisation has considered data protection by design.',
            remediation: 'D3: DPIAs support the accountability principle and help meet GDPR Article 35. They are part of data protection by design and by default.',
            specRef: 'D3',
            source: 'ICO DPIA Guidance'
        },
        {
            question: 'Incident response planning should include:',
            options: [
                'A) Only technical steps to fix the server',
                'B) Detection, containment, eradication, recovery, and communication; plus roles and contact details',
                'C) Waiting until an incident happens before planning',
                'D) Only informing the board'
            ],
            correct: 1,
            explanation: 'An incident response plan should define how the organisation will detect, contain, eradicate, and recover from incidents, who does what, and how (and when) to communicate with regulators, customers, and staff.',
            remediation: 'D5: Incident response is part of business continuity. Plans must be documented, tested, and updated. GDPR requires breach notification within 72 hours.',
            specRef: 'D5',
            source: 'NIST SP 800-61 Rev 2'
        },
        {
            question: 'DDoS attacks are primarily countered by:',
            options: [
                'A) Antivirus software only',
                'B) IDS/IPS, traffic filtering, and DDoS mitigation services that detect and absorb or filter attack traffic',
                'C) Stronger passwords',
                'D) Encrypting the server'
            ],
            correct: 1,
            explanation: 'DDoS floods the target with traffic to cause denial of service. Defences include detecting anomalous traffic (IDS/IPS), filtering or rate-limiting, and using DDoS mitigation providers to absorb or scrub attack traffic.',
            remediation: 'D1: DDoS is a threat type. D2: Firewalls and IDS/IPS are relevant; specialist DDoS mitigation is often needed for large attacks. Antivirus targets malware, not volumetric traffic.',
            specRef: 'D2',
            source: 'NCSC DDoS Guidance'
        },
        {
            question: 'The principle of least privilege in access control means:',
            options: [
                'A) Giving everyone administrator rights for speed',
                'B) Granting users only the minimum access they need to do their job',
                'C) Using one shared account for the team',
                'D) Removing all access control'
            ],
            correct: 1,
            explanation: 'Least privilege means each user (or process) has only the minimum access necessary for their role. It limits the damage from compromised accounts and insider threats.',
            remediation: 'D2: Access control is a key security control. Least privilege supports both external threat mitigation and insider risk reduction (D1).',
            specRef: 'D2',
            source: 'NCSC Access Control Guidance'
        },
        {
            question: 'Why is patch management important for cyber security?',
            options: [
                'A) Patches slow down the system so attackers give up',
                'B) Many attacks exploit known vulnerabilities; applying patches removes the vulnerability and reduces risk',
                'C) Patches are only for Windows',
                'D) It replaces the need for a firewall'
            ],
            correct: 1,
            explanation: 'Attackers routinely exploit known, unpatched vulnerabilities. Patch management ensures security updates are applied in a timely way so those vulnerabilities are removed or reduced.',
            remediation: 'D2: Patch management is a core control. It is especially important for zero-day mitigation once a vendor releases a fix (D1). It does not replace other controls (D4).',
            specRef: 'D2',
            source: 'NCSC Patch Management Guidance'
        }
    ],
    2: [
        {
            question: 'A school stores student medical records. Under GDPR, this data is classified as:',
            options: [
                'A) Standard personal data — same as names and addresses',
                'B) Special category data — requiring additional protections',
                'C) Anonymised data — because students are minors',
                'D) Business data — because the school processes it'
            ],
            correct: 1,
            explanation: 'Health data is "special category data" under GDPR Article 9, requiring additional safeguards and a specific lawful basis for processing.',
            remediation: 'Common misconception: children\'s data is not automatically anonymised. Special category data includes health, biometric, ethnic, political, religious, genetic, and sexual orientation data. It requires stricter controls than standard personal data such as names or email addresses.',
            specRef: 'D3',
            source: 'GDPR Article 9, 2018'
        },
        {
            question: 'An employee uses their authorised login to access student records they have no legitimate reason to view. This violates:',
            options: [
                'A) No law — they have a valid login, so access is authorised',
                'B) The Computer Misuse Act 1990 — exceeding authorised access is an offence',
                'C) GDPR only — it is not a criminal matter',
                'D) School policy only — it has no legal consequences'
            ],
            correct: 1,
            explanation: 'Section 1 of the Computer Misuse Act 1990 covers unauthorised access — even if you have a valid login, accessing data beyond your authorisation is a criminal offence.',
            remediation: 'This is a frequently misunderstood area. Having a valid login does NOT mean you have unlimited access rights. The CMA 1990 criminalises exceeding your authorised access level. It IS a criminal matter, not just a policy violation. GDPR may also be breached, but the CMA specifically addresses the unauthorised access itself.',
            specRef: 'D3',
            source: 'CMA 1990 S1, R v Bow Street Magistrates (1999)'
        },
        {
            question: 'Access control implements the "principle of least privilege". This means:',
            options: [
                'A) Only senior managers should have computer access',
                'B) Users are given only the minimum permissions needed for their role',
                'C) All users share one administrator account',
                'D) Access is only restricted during working hours'
            ],
            correct: 1,
            explanation: 'Least privilege ensures users can only access what they need for their job. This limits the damage if an account is compromised and prevents unauthorised data access.',
            remediation: 'Sharing administrator accounts is the opposite of least privilege — it gives everyone maximum access. Least privilege is about role-based permissions, not seniority. It applies 24/7, not just during working hours. It is a fundamental security control recognised by NCSC Cyber Essentials.',
            specRef: 'D2',
            source: 'NCSC Cyber Essentials, 2024'
        },
        {
            question: 'Encryption protects a stolen database because:',
            options: [
                'A) It makes the database file invisible to the attacker',
                'B) The data is converted to unreadable ciphertext that requires a key to decrypt',
                'C) It prevents all network attacks from reaching the database',
                'D) Encrypted databases cannot be copied'
            ],
            correct: 1,
            explanation: 'Encryption transforms readable data (plaintext) into unreadable ciphertext. Without the decryption key, stolen data is meaningless to the attacker.',
            remediation: 'Encryption does NOT make data invisible or prevent copying — the encrypted file can still be taken. It does NOT prevent network attacks (that is the firewall\'s job). Its value is that even after data is stolen, it remains unreadable without the key. This is why GDPR specifically recommends encryption.',
            specRef: 'D2',
            source: 'GDPR Recital 83, 2018'
        },
        {
            question: 'A school discovers a data breach on Friday afternoon. Under GDPR, they should:',
            options: [
                'A) Wait until Monday to assess the situation properly',
                'B) Begin their incident response plan immediately and notify the ICO within 72 hours',
                'C) Delete the affected data to remove the problem',
                'D) Only report it if parents complain'
            ],
            correct: 1,
            explanation: 'The 72-hour clock starts when the school becomes aware of the breach. Delaying or deleting data would breach GDPR obligations and could increase penalties.',
            remediation: 'The 72-hour deadline runs from awareness, including weekends. Deleting data after a breach is destruction of evidence and breaches record-keeping obligations. Reporting is mandatory regardless of complaints — it is triggered by the breach itself, not by affected individuals contacting you.',
            specRef: 'D5',
            source: 'GDPR Article 33, ICO Breach Reporting Guidance, 2021'
        },
        {
            question: 'Children\'s personal data under GDPR requires:',
            options: [
                'A) No extra protection compared to adults',
                'B) Additional safeguards; the UK sets the age of consent for information society services at 13',
                'C) Deletion as soon as they leave school',
                'D) Parental consent only for health data'
            ],
            correct: 1,
            explanation: 'GDPR Article 8 and the UK ICO Children\'s Code require enhanced protection for children\'s data. The UK has set the age of consent for information society services at 13.',
            remediation: 'D3: Special protections for children\'s data support their vulnerability and the need for clear, age-appropriate privacy information.',
            specRef: 'D3',
            source: 'GDPR Article 8, ICO Children\'s Code'
        },
        {
            question: 'Multi-factor authentication (MFA) helps prevent account takeover because:',
            options: [
                'A) It makes passwords longer',
                'B) Even if a password is stolen, the attacker needs a second factor (e.g. phone or token)',
                'C) It blocks all login attempts from abroad',
                'D) It replaces the need for access control'
            ],
            correct: 1,
            explanation: 'MFA requires something you know (password) plus something you have (e.g. phone) or something you are (biometric). A stolen password alone is insufficient.',
            remediation: 'D2: MFA is a key access control. It significantly reduces the risk from phishing and credential theft (D1).',
            specRef: 'D2',
            source: 'NCSC MFA Guidance'
        },
        {
            question: 'A trojan horse is a type of malware that:',
            options: [
                'A) Only affects mobile phones',
                'B) Disguises itself as legitimate software to trick users into installing it',
                'C) Spreads without any user action',
                'D) Only damages hardware'
            ],
            correct: 1,
            explanation: 'Trojans masquerade as useful or harmless software; the user is tricked into installing them. They do not self-replicate like viruses or worms.',
            remediation: 'D1: Trojans are a threat type. D2: Antivirus, access control, and user training help reduce the risk.',
            specRef: 'D1',
            source: 'NCSC Malware Guidance'
        },
        {
            question: 'The purpose of an IDS (Intrusion Detection System) is to:',
            options: [
                'A) Block all incoming traffic',
                'B) Monitor network or system activity and raise alerts when suspicious behaviour is detected',
                'C) Encrypt data at rest',
                'D) Replace the need for a firewall'
            ],
            correct: 1,
            explanation: 'IDS monitors traffic or host activity and detects signs of intrusion or misuse, generating alerts for investigation. IPS can also block (prevention).',
            remediation: 'D2: IDS/IPS are detection and prevention controls. They complement firewalls and support defence in depth (D4).',
            specRef: 'D2',
            source: 'NIST SP 800-94'
        },
        {
            question: 'Under the Data Protection Act 2018, the "integrity and confidentiality" principle means:',
            options: [
                'A) Data must be stored for as long as possible',
                'B) Personal data must be processed in a way that ensures appropriate security, including protection against unauthorised access, loss or damage',
                'C) Data can be shared with anyone for marketing',
                'D) Only the IT department is responsible for security'
            ],
            correct: 1,
            explanation: 'The security principle (integrity and confidentiality) requires appropriate technical and organisational measures to protect personal data.',
            remediation: 'D3: This is one of the six principles. It underpins the need for access control, encryption, and incident response (D2, D5).',
            specRef: 'D3',
            source: 'DPA 2018 Schedule 1'
        },
        {
            question: 'Why is security awareness training especially important in education settings?',
            options: [
                'A) Students do not use computers',
                'B) Staff and students handle sensitive data and are targets for phishing; training reduces human error',
                'C) Training replaces the need for email filters',
                'D) Only teachers need training'
            ],
            correct: 1,
            explanation: 'Schools hold special category data (e.g. health, SEN). Phishing and social engineering target staff and sometimes students. Training is a key human layer in defence in depth.',
            remediation: 'D2: Training is a control. D1: Phishing targets people. D4: Training complements technical controls.',
            specRef: 'D2',
            source: 'NCSC Education Guidance'
        },
        {
            question: 'Backup and disaster recovery procedures support business continuity because:',
            options: [
                'A) They prevent all cyber incidents',
                'B) They allow the organisation to restore systems and data after an incident and resume operations',
                'C) They are only needed once a year',
                'D) They replace the need for antivirus'
            ],
            correct: 1,
            explanation: 'Backups and tested recovery procedures mean that after ransomware, hardware failure, or other loss, the organisation can restore data and continue or resume operations.',
            remediation: 'D5: Backup and recovery are core to business continuity. D2: Backup is also a control against ransomware (D1).',
            specRef: 'D5',
            source: 'NCSC Backup Guidance'
        },
        {
            question: 'Phishing emails often bypass technical controls because:',
            options: [
                'A) Firewalls are always broken',
                'B) They use legitimate email channels and social engineering; filters and users must both be relied on',
                'C) Encryption stops them',
                'D) They only target home users'
            ],
            correct: 1,
            explanation: 'Phishing arrives via normal email. Technical controls (filters) can block many but not all; user awareness and reporting complete the defence.',
            remediation: 'D1: Phishing is a threat. D2/D4: Email filter plus training is the recommended combination.',
            specRef: 'D1',
            source: 'NCSC Phishing Guidance'
        },
        {
            question: 'Storage limitation under GDPR means:',
            options: [
                'A) Storing as much data as possible for future use',
                'B) Keeping personal data only as long as necessary for the purpose for which it was collected',
                'C) Deleting all data after one day',
                'D) Only the legal team decides retention'
            ],
            correct: 1,
            explanation: 'Personal data must not be kept longer than necessary for the stated purpose. Retention schedules and secure deletion support this principle.',
            remediation: 'D3: Storage limitation is one of the six principles. It reduces breach impact and supports compliance.',
            specRef: 'D3',
            source: 'GDPR Article 5(1)(e)'
        },
        {
            question: 'Malware can be delivered by:',
            options: [
                'A) Only by USB stick',
                'B) Email attachments, malicious links, drive-by downloads, and compromised software, among other vectors',
                'C) Only when the user has no antivirus',
                'D) Only to Windows computers'
            ],
            correct: 1,
            explanation: 'Malware is delivered via multiple vectors including email, web, removable media, and supply chain. Defence in depth (filtering, antivirus, patching, training) is needed.',
            remediation: 'D1: Malware is a threat. D2: Multiple controls (email filter, antivirus, patch management, user awareness) address different delivery methods (D4).',
            specRef: 'D1',
            source: 'NCSC Malware Guidance'
        },
        {
            question: 'What is the main benefit of network segmentation for security?',
            options: [
                'A) It makes the network faster for everyone',
                'B) It limits the spread of an attack or breach to one segment; other areas remain protected',
                'C) It removes the need for firewalls',
                'D) It is only for large organisations'
            ],
            correct: 1,
            explanation: 'Segmentation divides the network into zones. If one zone is compromised, the attacker cannot easily move to others, containing the impact.',
            remediation: 'D4: Segmentation is a key defence-in-depth control. It supports containment during incident response (D5).',
            specRef: 'D4',
            source: 'NCSC Network Segmentation'
        },
        {
            question: 'The Equality Act 2010 is relevant to cyber security and data because:',
            options: [
                'A) It only covers physical access to buildings',
                'B) Discrimination in access to systems or misuse of data related to protected characteristics can be unlawful; security and access policies must be fair',
                'C) It replaces the Data Protection Act',
                'D) It only applies to private companies'
            ],
            correct: 1,
            explanation: 'The Equality Act protects against discrimination. Unfair access to systems, biased algorithms, or misuse of data relating to protected characteristics can engage both equality and data protection law.',
            remediation: 'D3: Legislation overlap. Security and access control (D2) should be applied fairly and in line with equality obligations.',
            specRef: 'D3',
            source: 'Equality Act 2010'
        },
        {
            question: 'Why should backups be tested regularly?',
            options: [
                'A) To use up old tapes',
                'B) Untested backups often fail when needed; testing confirms that restore works and procedures are correct',
                'C) Testing is only required by law for banks',
                'D) Backups do not need testing'
            ],
            correct: 1,
            explanation: 'Many organisations discover backup or restore failures only during an incident. Regular testing validates that backups are usable and that recovery procedures work.',
            remediation: 'D5: Testing backups is part of business continuity and disaster recovery. It is a control that supports resilience (D2).',
            specRef: 'D5',
            source: 'NCSC Backup Guidance'
        },
        {
            question: 'Social engineering attacks target:',
            options: [
                'A) Only weak passwords',
                'B) Human psychology — tricking people into revealing information or performing actions that compromise security',
                'C) Only old computers',
                'D) Only home users'
            ],
            correct: 1,
            explanation: 'Social engineering exploits human trust, urgency, or authority to get people to disclose credentials, click links, or bypass procedures. Technical controls alone cannot fully prevent it.',
            remediation: 'D1: Phishing and other social engineering are threats. D2: Security awareness training is the primary human-focused control (D4).',
            specRef: 'D1',
            source: 'NCSC Social Engineering Guidance'
        },
        {
            question: 'The "purpose limitation" principle in data protection means:',
            options: [
                'A) Data can be used for any purpose the organisation chooses',
                'B) Personal data must be collected for specified, legitimate purposes and not used in ways incompatible with those purposes',
                'C) Data must be deleted after one use',
                'D) Only one person can access the data'
            ],
            correct: 1,
            explanation: 'Purpose limitation means you collect and use data only for the stated, legitimate purpose. Using it for a new, incompatible purpose (e.g. marketing when collected for service delivery) requires a new basis and often fresh consent.',
            remediation: 'D3: One of the six principles. It supports fairness and transparency and limits scope of processing.',
            specRef: 'D3',
            source: 'GDPR Article 5(1)(b)'
        },
        {
            question: 'Combining firewall, IDS, antivirus, access control, and training is an example of:',
            options: [
                'A) Using only one control for speed',
                'B) Defence in depth — multiple layers so that if one control fails, others can still protect',
                'C) Replacing the need for backups',
                'D) Only needed for government'
            ],
            correct: 1,
            explanation: 'Defence in depth uses multiple, complementary controls. No single control stops all threats; layering reduces the chance that a single failure leads to full compromise.',
            remediation: 'D4: Defence in depth. Each control (D2) addresses different threats (D1) and supports resilience (D5).',
            specRef: 'D4',
            source: 'NCSC 10 Steps to Cyber Security'
        }
    ],
    3: [
        {
            question: 'In the 2017 WannaCry attack on the NHS, the PRIMARY reason many hospitals were vulnerable was:',
            options: [
                'A) They had no internet connection',
                'B) Many systems ran unpatched, end-of-life operating systems like Windows XP',
                'C) Staff deliberately installed the ransomware',
                'D) The NHS did not use any computers'
            ],
            correct: 1,
            explanation: 'Many NHS systems ran unsupported Windows XP, which no longer received security patches. WannaCry exploited a known vulnerability (EternalBlue) that had been patched in supported systems.',
            remediation: 'WannaCry exploited MS17-010, a vulnerability Microsoft had patched two months earlier. Systems running unsupported Windows XP could not receive this patch. This is the strongest real-world example of why patch management (D2) is critical for business continuity (D5).',
            specRef: 'D1',
            source: 'NAO Investigation: WannaCry, Oct 2017'
        },
        {
            question: 'Which security control is the LAST line of defense against ransomware — allowing recovery even if all other controls fail?',
            options: [
                'A) A firewall with stricter rules',
                'B) Antivirus with the latest signatures',
                'C) Regular, tested, offsite backups',
                'D) Multi-factor authentication'
            ],
            correct: 2,
            explanation: 'Backups are the ultimate safety net. If ransomware encrypts all files, tested backups allow full recovery without paying the ransom. The key word is "tested" — untested backups may fail.',
            remediation: 'Firewalls and antivirus are prevention controls — they try to stop ransomware arriving. MFA protects authentication. But none of these help after ransomware has already encrypted your data. Only backups allow recovery. This is a D5 concept: business continuity when prevention fails.',
            specRef: 'D5',
            source: 'NCSC Ransomware Guidance, 2023'
        },
        {
            question: 'A hospital\'s business continuity plan should include:',
            options: [
                'A) A plan to shut down all systems and wait for the attack to end',
                'B) Backup systems, manual operating procedures, and a tested incident response plan',
                'C) A budget allocation to pay ransoms',
                'D) Instructions to keep the breach secret from staff'
            ],
            correct: 1,
            explanation: 'Business continuity planning ensures critical services continue during incidents. For healthcare: backup systems maintain data access, manual procedures keep patients safe, and incident response coordinates the recovery.',
            remediation: 'Paying ransoms is advised against by NCSC and law enforcement — it funds criminal activity and does not guarantee data recovery. Shutting down all systems could endanger patients. Keeping breaches secret from staff who need to respond makes the situation worse. Effective BCPs combine technology, procedures, and people.',
            specRef: 'D5',
            source: 'NCSC Incident Management Guidance, 2022'
        },
        {
            question: 'The WannaCry attack cost the NHS an estimated \u00A392 million. This demonstrates the importance of:',
            options: [
                'A) Having a bigger IT budget only',
                'B) Proactive patch management and business continuity planning',
                'C) Disconnecting all hospitals from the internet',
                'D) Hiring more security guards'
            ],
            correct: 1,
            explanation: 'The \u00A392 million cost included disrupted services, emergency IT response, and cancelled appointments. Proactive patching would have prevented the attack; BCP would have reduced its impact.',
            remediation: 'Money alone doesn\'t solve the problem — the patches were free but weren\'t applied. Disconnecting from the internet would prevent modern healthcare from functioning. Physical security guards don\'t protect against cyber attacks. The answer combines prevention (patching) with resilience (BCP).',
            specRef: 'D2',
            source: 'Department of Health & Social Care, 2018'
        },
        {
            question: 'Defense in depth in a healthcare setting means:',
            options: [
                'A) Installing the most expensive single security product',
                'B) Layering firewalls, antivirus, IDS, encryption, access control, backups and training together',
                'C) Only allowing doctors to use computers',
                'D) Using one very strong password for all systems'
            ],
            correct: 1,
            explanation: 'Defense in depth combines multiple overlapping controls at different levels. If ransomware bypasses the email filter and antivirus, encryption protects data, backups enable recovery, and training may have caught the phishing email.',
            remediation: 'No single product — however expensive — can stop all threats. Using one password for all systems is a critical vulnerability, not a defense. Restricting access to doctors only would prevent the hospital from functioning. True defense in depth uses diverse, overlapping controls.',
            specRef: 'D4',
            source: 'NCSC 10 Steps to Cyber Security, 2021'
        },
        {
            question: 'Healthcare data (e.g. patient records) is classed as special category data under GDPR because:',
            options: [
                'A) It is always encrypted',
                'B) It reveals health information and is therefore sensitive; it needs a specific lawful basis and extra safeguards',
                'C) It is only stored in hospitals',
                'D) It does not need extra protection'
            ],
            correct: 1,
            explanation: 'Special category data under GDPR Article 9 includes health data. Processing requires a specific lawful basis (e.g. health care, public interest) and appropriate safeguards.',
            remediation: 'D3: Special category data requires stricter controls. D2: Encryption and access control are typical safeguards in healthcare (D4).',
            specRef: 'D3',
            source: 'GDPR Article 9'
        },
        {
            question: 'Ransomware in a healthcare setting is especially serious because:',
            options: [
                'A) It only affects billing systems',
                'B) Loss of access to patient records and systems can directly endanger patient safety and delay care',
                'C) Hospitals are exempt from reporting',
                'D) Antivirus always stops it'
            ],
            correct: 1,
            explanation: 'Ransomware can lock clinical and administrative systems. In healthcare, delayed access to records or treatment systems can harm patients and disrupt critical services.',
            remediation: 'D1: Ransomware is a threat. D2/D5: Backup, patch management, and business continuity are essential in healthcare.',
            specRef: 'D1',
            source: 'NCSC Ransomware, Healthcare'
        },
        {
            question: 'Why is the 3-2-1 backup rule recommended?',
            options: [
                'A) To save money by using one backup',
                'B) Three copies, on two different media types, with one copy offsite — so you can recover even if one location or medium fails',
                'C) Back up only every 3 days',
                'D) It only applies to large organisations'
            ],
            correct: 1,
            explanation: '3-2-1 means at least three copies, on at least two different media/types, with at least one copy offsite. It protects against local failure, media failure, and site-level disaster.',
            remediation: 'D5: Backup strategy. D2: Backup is a control. Essential for ransomware resilience.',
            specRef: 'D5',
            source: 'NCSC Backup Guidance'
        },
        {
            question: 'Under the Computer Misuse Act, creating or supplying malware (e.g. ransomware) can be prosecuted under:',
            options: [
                'A) Section 1 only',
                'B) Section 3A — making, supplying or obtaining articles for use in computer misuse offences',
                'C) GDPR only',
                'D) There is no such offence'
            ],
            correct: 1,
            explanation: 'Section 3A of the Computer Misuse Act 1990 (as amended) makes it an offence to make, supply, or obtain articles (including malware) for use in computer misuse offences. It can carry up to 2 years imprisonment.',
            remediation: 'D3: CMA covers both unauthorised access (S1–S3) and tools for misuse (S3A).',
            specRef: 'D3',
            source: 'Computer Misuse Act 1990 (as amended)'
        },
        {
            question: 'Access control in a hospital should ensure that:',
            options: [
                'A) Everyone can access all patient records for efficiency',
                'B) Staff only have access to the systems and data they need for their role (least privilege)',
                'C) No one can access records at night',
                'D) Only doctors need accounts'
            ],
            correct: 1,
            explanation: 'Least privilege and role-based access limit exposure of sensitive health data and reduce the impact of a compromised account or insider threat.',
            remediation: 'D2: Access control. D1: Insiders and compromised accounts are threats. D3: Health data requires appropriate security.',
            specRef: 'D2',
            source: 'NCSC Access Control'
        },
        {
            question: 'Business continuity in healthcare must consider:',
            options: [
                'A) Only IT systems',
                'B) Critical clinical and support systems, staff availability, communication with patients and partners, and regulatory reporting',
                'C) Only finance',
                'D) Only when a breach is public'
            ],
            correct: 1,
            explanation: 'BCP in healthcare covers clinical systems, data availability, staff roles, communication, and legal/regulatory obligations (e.g. CQC, ICO).',
            remediation: 'D5: Business continuity. Healthcare is a sector where continuity directly affects safety and compliance.',
            specRef: 'D5',
            source: 'NCSC Business Continuity'
        },
        {
            question: 'Encryption of patient data at rest and in transit helps healthcare organisations to:',
            options: [
                'A) Avoid the need for access control',
                'B) Protect confidentiality so that if data is stolen or intercepted, it cannot be read without the key',
                'C) Speed up all systems',
                'D) Replace backups'
            ],
            correct: 1,
            explanation: 'Encryption ensures that stolen or intercepted data remains unreadable without the key, supporting confidentiality and reducing breach impact.',
            remediation: 'D2: Encryption. D3: Appropriate security for personal/special category data. D5: Reduces impact of incidents.',
            specRef: 'D2',
            source: 'GDPR Recital 83'
        },
        {
            question: 'A healthcare organisation that suffers a ransomware attack should:',
            options: [
                'A) Pay the ransom immediately',
                'B) Follow incident response: contain the spread, preserve evidence, assess impact, notify ICO and affected individuals if required, and recover from backups if available',
                'C) Delete all backups to save space',
                'D) Only tell the board after a month'
            ],
            correct: 1,
            explanation: 'Incident response includes containment, assessment, notification (e.g. ICO within 72 hours, affected individuals where high risk), and recovery. Paying the ransom is not recommended and may not guarantee decryption.',
            remediation: 'D5: Incident response and BCP. D3: Breach notification. D2: Recovery from backup where possible.',
            specRef: 'D5',
            source: 'NCSC Ransomware, ICO Breach Guidance'
        },
        {
            question: 'Patch management is critical in healthcare because:',
            options: [
                'A) Patches are only for Windows',
                'B) Many attacks exploit known vulnerabilities; unpatched systems (e.g. legacy medical devices) are a major risk',
                'C) Healthcare is exempt from patching',
                'D) It replaces the need for antivirus'
            ],
            correct: 1,
            explanation: 'Known vulnerabilities in unpatched systems (including medical and IoT devices) are frequently exploited. Patch management reduces this risk.',
            remediation: 'D2: Patch management. D1: Exploitation of known vulns. WannaCry demonstrated the impact in healthcare.',
            specRef: 'D2',
            source: 'NCSC Patch Management'
        },
        {
            question: 'The right to erasure ("right to be forgotten") under GDPR:',
            options: [
                'A) Allows individuals to demand deletion of their personal data in certain circumstances; the controller must comply unless an exception applies',
                'B) Means all data must be deleted after one year',
                'C) Only applies to social media',
                'D) Replaces the need for consent'
            ],
            correct: 1,
            explanation: 'Individuals can request erasure when data is no longer necessary, consent is withdrawn, or other grounds apply. Exceptions include legal obligations or legal claims.',
            remediation: 'D3: GDPR Article 17. Organisations must have procedures to handle requests and document decisions.',
            specRef: 'D3',
            source: 'GDPR Article 17'
        },
        {
            question: 'Why might an insider in a hospital be a serious threat?',
            options: [
                'A) Insiders cannot access patient data',
                'B) They have legitimate access to sensitive systems and data; they can steal, leak, or damage data without bypassing the perimeter',
                'C) Only contractors are insiders',
                'D) Antivirus always detects them'
            ],
            correct: 1,
            explanation: 'Insiders (staff or contractors) already have access. They can misuse credentials to access or exfiltrate data, or deliberately cause harm, often without triggering perimeter defences.',
            remediation: 'D1: Insider threat. D2: Access control, monitoring, and least privilege. D4: No single control is sufficient.',
            specRef: 'D1',
            source: 'Verizon DBIR'
        },
        {
            question: 'IDS/IPS can help in a healthcare network by:',
            options: [
                'A) Encrypting all patient data',
                'B) Detecting and optionally blocking suspicious or malicious activity (e.g. lateral movement, malware traffic)',
                'C) Replacing the need for backups',
                'D) Only monitoring email'
            ],
            correct: 1,
            explanation: 'IDS monitors for signs of intrusion or misuse; IPS can block in real time. Both help detect and contain threats that have got past the perimeter.',
            remediation: 'D2: IDS/IPS. D4: Part of defence in depth. Supports incident detection (D5).',
            specRef: 'D2',
            source: 'NIST SP 800-94'
        },
        {
            question: 'Data protection by design and by default (GDPR Article 25) means:',
            options: [
                'A) Adding security only after a breach',
                'B) Building in data protection and privacy measures from the start and defaulting to the most privacy-friendly options',
                'C) Using the same design for all systems',
                'D) Only the IT team is responsible'
            ],
            correct: 1,
            explanation: 'Data protection must be integrated into the design of systems and processes, and default settings should be privacy-friendly (e.g. minimal data, restricted access).',
            remediation: 'D3: Accountability and design. Supports the security principle and reduces breach risk (D2, D5).',
            specRef: 'D3',
            source: 'GDPR Article 25'
        },
        {
            question: 'Recovery time objective (RTO) in business continuity refers to:',
            options: [
                'A) How long the attacker had access',
                'B) The maximum acceptable time to restore a system or service after an incident',
                'C) How long to keep backups',
                'D) The time to report a breach'
            ],
            correct: 1,
            explanation: 'RTO is the target time within which a system or process must be restored after a disruption. It drives recovery priorities and design.',
            remediation: 'D5: Business continuity. RTO and RPO (recovery point objective) are key BCP metrics.',
            specRef: 'D5',
            source: 'NCSC Business Continuity'
        },
        {
            question: 'Why is email filtering important in healthcare?',
            options: [
                'A) It replaces the need for backups',
                'B) Many attacks (phishing, malware) arrive via email; filtering reduces the volume that reaches users',
                'C) It encrypts all emails automatically',
                'D) Only large trusts need it'
            ],
            correct: 1,
            explanation: 'Phishing and malware are often delivered by email. Filtering blocks or quarantines many malicious messages before they reach staff, reducing the human and technical risk.',
            remediation: 'D1: Phishing/malware. D2: Email filter. D4: Part of layered defence.',
            specRef: 'D2',
            source: 'NCSC Email Security'
        },
        {
            question: 'The NIS Regulations 2018 apply to:',
            options: [
                'A) Every UK business',
                'B) Operators of essential services (including certain health and care services) and relevant digital service providers',
                'C) Only banks',
                'D) Only central government'
            ],
            correct: 1,
            explanation: 'NIS Regulations require operators of essential services (energy, transport, health, water, digital infrastructure, etc.) and certain digital service providers to manage security risks and report incidents.',
            remediation: 'D3: Sector-specific legislation. Healthcare operators may be in scope. Complements GDPR.',
            specRef: 'D3',
            source: 'NIS Regulations 2018'
        }
    ],
    4: [
        {
            question: 'SQL injection attacks work by:',
            options: [
                'A) Flooding a server with traffic until it crashes',
                'B) Inserting malicious SQL code into input fields to manipulate the database',
                'C) Physically connecting to the database server',
                'D) Guessing the database administrator\'s password'
            ],
            correct: 1,
            explanation: 'SQL injection inserts malicious database commands through web forms or URL parameters. If the application doesn\'t validate input, the commands execute directly on the database.',
            remediation: 'Flooding a server is DDoS, not SQL injection. Password guessing is a brute-force attack. SQL injection is specifically about manipulating database queries through unvalidated input. It requires no physical access — it works remotely through the website.',
            specRef: 'D1',
            source: 'OWASP Top 10, 2021'
        },
        {
            question: 'TalkTalk was fined \u00A3400,000 in 2016 for a SQL injection breach. The fine was relatively low because:',
            options: [
                'A) The breach was minor and affected few people',
                'B) The breach occurred before GDPR — under GDPR, fines can reach \u20AC20 million or 4% of global turnover',
                'C) TalkTalk voluntarily reported the breach',
                'D) SQL injection is not considered a serious vulnerability'
            ],
            correct: 1,
            explanation: 'TalkTalk was fined under the pre-GDPR Data Protection Act, which had a maximum fine of \u00A3500,000. Under GDPR (from 2018), the same breach could result in fines of \u20AC20 million or 4% of global turnover.',
            remediation: 'The breach affected 157,000 customers — it was not minor. Voluntary reporting does not eliminate fines (though it may reduce them). SQL injection is ranked in the OWASP Top 10 most critical web vulnerabilities. The key point is the difference in penalty regimes between DPA 1998 and GDPR.',
            specRef: 'D3',
            source: 'ICO Monetary Penalty Notice: TalkTalk, 2016'
        },
        {
            question: 'Patch management prevents attacks by:',
            options: [
                'A) Making software run faster',
                'B) Fixing known security vulnerabilities before attackers can exploit them',
                'C) Adding new features to software',
                'D) Encrypting the software code'
            ],
            correct: 1,
            explanation: 'Security patches fix known vulnerabilities. Unpatched software is the most common attack vector because attackers specifically target published CVEs that organisations haven\'t patched yet.',
            remediation: 'Patches primarily fix security flaws, not add features or improve performance. They don\'t encrypt anything. The WannaCry attack succeeded specifically because NHS systems hadn\'t applied a patch that was available two months earlier. Prompt patching closes the window of vulnerability.',
            specRef: 'D2',
            source: 'NCSC Vulnerability Management Guidance, 2023'
        },
        {
            question: 'Which combination BEST protects an e-commerce database? Choose the defense-in-depth answer.',
            options: [
                'A) A single next-generation firewall',
                'B) Encryption + input validation + IDS/IPS + access control + regular patching',
                'C) Changing the database password monthly',
                'D) Moving the database to a different country'
            ],
            correct: 1,
            explanation: 'Defense in depth layers: encryption (protects stored data), input validation (prevents SQL injection), IDS/IPS (detects attacks), access control (limits who reaches the database), and patching (fixes known vulnerabilities).',
            remediation: 'A single firewall, however advanced, is one point of failure. Password rotation alone doesn\'t address SQL injection, unpatched vulnerabilities, or lack of encryption. Moving data to another country doesn\'t improve security — it just changes jurisdiction. True defense in depth uses multiple different control types together.',
            specRef: 'D4',
            source: 'NCSC 10 Steps to Cyber Security, 2021'
        },
        {
            question: 'After a data breach, an e-commerce company must notify affected customers because:',
            options: [
                'A) It is good marketing practice',
                'B) GDPR Article 34 requires notification when the breach poses a high risk to individuals\' rights',
                'C) Only if the media reports on it first',
                'D) Notification is optional and only recommended'
            ],
            correct: 1,
            explanation: 'GDPR Article 34 requires organisations to notify affected individuals "without undue delay" when a breach is likely to result in high risk to their rights and freedoms.',
            remediation: 'Customer notification is a legal obligation under GDPR, not a marketing choice. It is triggered by the risk level of the breach, not by media attention. Failure to notify can result in additional fines from the ICO.',
            specRef: 'D3',
            source: 'GDPR Article 34, ICO Guidance, 2021'
        },
        {
            question: 'PCI-DSS requires organisations that process card payments to:',
            options: [
                'A) Only use antivirus',
                'B) Implement network segmentation, encryption, access control, and regular security testing for cardholder data',
                'C) Store card numbers in plain text',
                'D) Rely only on the bank for security'
            ],
            correct: 1,
            explanation: 'PCI-DSS mandates controls including segmentation of cardholder data environment, encryption, access control, and regular testing. The merchant is responsible for securing card data.',
            remediation: 'D3: PCI-DSS is sector-specific. D2/D4: Segmentation, encryption, and access control support both compliance and defence in depth.',
            specRef: 'D3',
            source: 'PCI-DSS Requirements'
        },
        {
            question: 'SQL injection attacks target:',
            options: [
                'A) Only email systems',
                'B) Web applications that use user input in database queries without proper sanitisation',
                'C) Only firewalls',
                'D) Only backup systems'
            ],
            correct: 1,
            explanation: 'SQL injection inserts malicious SQL via user input (e.g. forms, URLs). If the application concatenates input into queries, the attacker can read or modify data.',
            remediation: 'D1: SQL injection is a threat. D2: Parameterised queries, input validation, and WAFs are controls.',
            specRef: 'D1',
            source: 'OWASP SQL Injection'
        },
        {
            question: 'The lawful basis for processing personal data under GDPR can include:',
            options: [
                'A) Only consent',
                'B) Consent, contract, legal obligation, vital interests, public task, legitimate interests (and for special category, additional conditions)',
                'C) Only when the customer is happy',
                'D) There is no requirement for a lawful basis'
            ],
            correct: 1,
            explanation: 'GDPR Article 6 lists lawful bases: consent, contract, legal obligation, vital interests, public task, legitimate interests. At least one must apply for each processing purpose.',
            remediation: 'D3: Lawfulness is the first principle. Special category data under Article 9 requires an additional condition.',
            specRef: 'D3',
            source: 'GDPR Article 6'
        },
        {
            question: 'Why is segmenting the cardholder data environment (CDE) important for PCI-DSS?',
            options: [
                'A) It makes the network faster',
                'B) It isolates systems that store or process card data so a breach elsewhere does not automatically expose card data',
                'C) It is only for large retailers',
                'D) It replaces encryption'
            ],
            correct: 1,
            explanation: 'Segmentation limits the scope of cardholder data systems. If another part of the network is compromised, the CDE can remain out of reach if properly segmented.',
            remediation: 'D4: Defence in depth. D2: Network segmentation. D3: PCI-DSS requirement.',
            specRef: 'D4',
            source: 'PCI-DSS Requirement 1'
        },
        {
            question: 'A data breach affecting customer payment details could result in:',
            options: [
                'A) No consequences if the company apologises',
                'B) ICO fines, loss of PCI-DSS compliance (ability to take cards), civil claims, and reputational damage',
                'C) Only a warning for first offence',
                'D) Only affecting the IT department'
            ],
            correct: 1,
            explanation: 'Serious breaches can lead to significant ICO fines, contractual consequences (e.g. card scheme sanctions), civil liability, and loss of customer trust.',
            remediation: 'D3: GDPR/DPA and sector regulation. D5: Incident response and BCP help mitigate impact.',
            specRef: 'D3',
            source: 'ICO Regulatory Action; PCI SSC'
        },
        {
            question: 'Firewalls help protect e-commerce systems by:',
            options: [
                'A) Encrypting all traffic',
                'B) Controlling which network traffic is allowed in and out based on rules, reducing exposure to attack',
                'C) Storing customer passwords',
                'D) Replacing the need for backups'
            ],
            correct: 1,
            explanation: 'Firewalls filter traffic by rules (e.g. ports, IPs). They reduce the attack surface and block many unsolicited or malicious connections.',
            remediation: 'D2: Firewall is a core control. D4: Part of defence in depth. Does not replace other controls.',
            specRef: 'D2',
            source: 'NCSC Firewall Guidance'
        },
        {
            question: 'The right to access (subject access request) under GDPR means:',
            options: [
                'A) Anyone can access any data',
                'B) Individuals can request a copy of their personal data and information about how it is processed; the controller must respond within one month',
                'C) Only lawyers can request',
                'D) Data must be deleted on request immediately'
            ],
            correct: 1,
            explanation: 'Article 15 gives individuals the right to obtain confirmation of processing, access to their data, and other information. Response time is generally one month.',
            remediation: 'D3: GDPR Article 15. Organisations need procedures to handle SARs and document compliance.',
            specRef: 'D3',
            source: 'GDPR Article 15'
        },
        {
            question: 'Why should an e-commerce site use HTTPS (TLS) for checkout?',
            options: [
                'A) It makes the page load faster',
                'B) It encrypts data in transit so card and personal details cannot be read if intercepted',
                'C) It is only for large sites',
                'D) It replaces the need for a firewall'
            ],
            correct: 1,
            explanation: 'TLS encrypts traffic between the browser and server. Without it, payment and personal data could be intercepted (e.g. on public Wi-Fi).',
            remediation: 'D2: Encryption in transit. D3: PCI-DSS and GDPR recommend encryption. D4: Part of layered security.',
            specRef: 'D2',
            source: 'NCSC TLS Guidance'
        },
        {
            question: 'Business impact analysis (BIA) in business continuity:',
            options: [
                'A) Is only for finance',
                'B) Identifies critical systems and processes and the impact of their failure, so recovery priorities can be set',
                'C) Replaces the need for backups',
                'D) Is optional for small businesses'
            ],
            correct: 1,
            explanation: 'BIA identifies what is critical, the impact of disruption, and recovery priorities. It informs BCP and backup/recovery strategy.',
            remediation: 'D5: Business continuity. BIA drives RTO/RPO and resource allocation for recovery.',
            specRef: 'D5',
            source: 'NCSC Business Continuity'
        },
        {
            question: 'Antivirus software is most effective against:',
            options: [
                'A) All types of cyber attack including DDoS and phishing',
                'B) Known malware and many variants; it uses signatures and heuristics to detect and block malicious code',
                'C) Only viruses, not trojans or ransomware',
                'D) Only when the user is offline'
            ],
            correct: 1,
            explanation: 'Antivirus detects and blocks known malware and many variants. It is less effective against zero-days or purely social engineering (e.g. phishing without malware).',
            remediation: 'D1: Malware, trojans, ransomware. D2: Antivirus is one control. D4: Use with other controls.',
            specRef: 'D2',
            source: 'NCSC Malware Guidance'
        },
        {
            question: 'Supply chain cyber risk means:',
            options: [
                'A) Only physical delivery of hardware',
                'B) Attackers can compromise a supplier or third-party software to reach your systems; you must assess and manage third-party access',
                'C) Only large companies have suppliers',
                'D) Suppliers are always secure'
            ],
            correct: 1,
            explanation: 'Attackers often target weaker links (e.g. suppliers with access to your network or software updates). Supply chain security involves assessing and contracting for security, and segmenting third-party access.',
            remediation: 'D1: Supply chain as vector. D4: Defence in depth includes supplier and partner risk (D3 in some sectors).',
            specRef: 'D1',
            source: 'NCSC Supply Chain Guidance'
        },
        {
            question: 'Under GDPR, when must individuals be informed about a data breach?',
            options: [
                'A) Only if they ask',
                'B) When the breach is likely to result in high risk to their rights and freedoms, without undue delay',
                'C) Only after the ICO has investigated',
                'D) Only for special category data'
            ],
            correct: 1,
            explanation: 'Article 34 requires notification to affected individuals without undue delay when the breach is likely to result in high risk to their rights and freedoms.',
            remediation: 'D3: GDPR Article 34. ICO guidance explains "high risk" and content of the notification.',
            specRef: 'D3',
            source: 'GDPR Article 34'
        },
        {
            question: 'Why is input validation important for web application security?',
            options: [
                'A) It only improves user experience',
                'B) It prevents malicious input (e.g. SQL injection, XSS) from being processed and harming the system or other users',
                'C) It encrypts all input',
                'D) It is only for login forms'
            ],
            correct: 1,
            explanation: 'Validating and sanitising input ensures that user-supplied data cannot be used to inject code or manipulate queries. It is a key control against injection attacks.',
            remediation: 'D1: SQL injection and similar. D2: Secure development and input validation. D4: Part of layered defence.',
            specRef: 'D2',
            source: 'OWASP Input Validation'
        },
        {
            question: 'Recovery point objective (RPO) refers to:',
            options: [
                'A) How long the attacker had access',
                'B) The maximum acceptable amount of data loss (e.g. how far back in time you can recover from backups)',
                'C) How long to keep logs',
                'D) The time to report to the ICO'
            ],
            correct: 1,
            explanation: 'RPO is the maximum acceptable data loss measured in time. It drives backup frequency (e.g. if RPO is 1 hour, backups must be at least hourly).',
            remediation: 'D5: Business continuity. RPO and RTO inform backup and recovery design (D2).',
            specRef: 'D5',
            source: 'NCSC Business Continuity'
        },
        {
            question: 'DDoS attacks aim to:',
            options: [
                'A) Steal data directly from the server',
                'B) Make a service unavailable by overwhelming it with traffic or resource demands',
                'C) Encrypt files for ransom',
                'D) Only affect email'
            ],
            correct: 1,
            explanation: 'DDoS (Distributed Denial of Service) floods the target with traffic or requests so that legitimate users cannot access the service. The goal is availability loss, not data theft.',
            remediation: 'D1: DDoS is a threat. D2: Mitigation includes filtering, rate limiting, and DDoS mitigation services (D4).',
            specRef: 'D1',
            source: 'NCSC DDoS Guidance'
        },
        {
            question: 'The accountability principle in GDPR means:',
            options: [
                'A) Only the CEO is responsible',
                'B) The controller must demonstrate compliance — e.g. with policies, records of processing, DPIAs, and documentation',
                'C) No documentation is needed',
                'D) Only large organisations are accountable'
            ],
            correct: 1,
            explanation: 'Accountability means the data controller is responsible for complying with the principles and must be able to demonstrate that compliance (e.g. through records, policies, and procedures).',
            remediation: 'D3: GDPR Article 5(2). Supports enforcement and trust. Relevant to all controllers.',
            specRef: 'D3',
            source: 'GDPR Article 5(2)'
        }
    ],
    5: [
        {
            question: 'Security awareness training reduces phishing click rates because:',
            options: [
                'A) It installs software that blocks phishing emails',
                'B) It teaches employees to recognise social engineering tactics and report suspicious emails',
                'C) Trained employees no longer receive phishing emails',
                'D) It replaces the need for email filters'
            ],
            correct: 1,
            explanation: 'Training teaches recognition skills — spotting suspicious sender addresses, urgent language, unusual requests, and unexpected attachments. Trained employees become a human detection layer.',
            remediation: 'Training does NOT install software or stop phishing emails arriving. Employees will still receive phishing emails — training helps them recognise and report them. Training complements email filters (not replaces them). Both technical and human controls are needed.',
            specRef: 'D2',
            source: 'KnowBe4 Phishing Benchmark Report, 2023'
        },
        {
            question: 'The NIS Regulations 2018 specifically apply to:',
            options: [
                'A) Every UK business with a website',
                'B) Operators of essential services (energy, health, transport, water) and digital service providers',
                'C) Only businesses with more than 250 employees',
                'D) Any business that uses email'
            ],
            correct: 1,
            explanation: 'The NIS Regulations target operators of essential services (energy, transport, health, water, digital infrastructure) and relevant digital service providers, requiring them to manage security risks and report incidents.',
            remediation: 'NIS Regulations are sector-specific, not size-based. A 10-person water treatment plant is covered; a 500-person retailer is not. They complement GDPR (which applies to all organisations processing personal data) by adding sector-specific security requirements for critical infrastructure.',
            specRef: 'D3',
            source: 'NIS Regulations 2018 (legislation.gov.uk)'
        },
        {
            question: 'A government agency needs BOTH technical controls AND organisational policies because:',
            options: [
                'A) Policies alone are sufficient — technology is optional',
                'B) Technical controls prevent attacks while policies ensure correct human behaviour — neither alone is sufficient',
                'C) Organisational policies are only needed for legal compliance, not actual security',
                'D) Technical controls make policies unnecessary'
            ],
            correct: 1,
            explanation: 'Firewalls and encryption stop technical attacks, but policies govern how staff handle data, respond to incidents, and follow security procedures. Effective security requires both.',
            remediation: 'A firewall cannot teach an employee not to share passwords. A policy cannot block a DDoS attack. Technical controls and organisational measures address different threat vectors. This is the essence of defense in depth — combining technological, procedural, and human elements.',
            specRef: 'D4',
            source: 'NCSC Cyber Assessment Framework, 2022'
        },
        {
            question: 'An organisation\'s incident response plan should be activated:',
            options: [
                'A) Only during major attacks that make the news',
                'B) Whenever a security incident is detected, regardless of severity',
                'C) Only after the attacker has been identified',
                'D) Only if the CEO authorises it'
            ],
            correct: 1,
            explanation: 'Incident response plans should be activated immediately upon detection of any security incident. Early response limits damage, preserves evidence, and meets regulatory notification deadlines.',
            remediation: 'Waiting to identify the attacker wastes critical response time. Requiring CEO authorisation creates dangerous delays. Even "small" incidents may be the visible tip of a larger compromise. Early activation is always preferred — the plan can be scaled down if the incident proves minor.',
            specRef: 'D5',
            source: 'NIST SP 800-61 Rev 2, Computer Security Incident Handling Guide, 2012'
        },
        {
            question: 'A disaster recovery plan differs from a business continuity plan because:',
            options: [
                'A) They are the same thing with different names',
                'B) DR focuses on restoring IT systems; BCP covers the whole business including people, processes, and communication',
                'C) BCP only applies to natural disasters, not cyber attacks',
                'D) DR is only needed for hardware failures'
            ],
            correct: 1,
            explanation: 'Disaster Recovery (DR) specifically addresses restoring IT systems and data. Business Continuity Planning (BCP) is broader — it ensures the entire organisation can continue operating, including manual workarounds, communication plans, and staff coordination.',
            remediation: 'These terms are often confused. DR is a subset of BCP. BCP covers cyber attacks, natural disasters, pandemics — any disruption. DR focuses specifically on the technical recovery of systems and data. Both are needed for comprehensive resilience.',
            specRef: 'D5',
            source: 'ISO 22301 Business Continuity Standard, 2019'
        },
        {
            question: 'Which threat is specifically countered by security awareness training and email filtering?',
            options: [
                'A) DDoS',
                'B) Phishing — training and filters reduce delivery and human susceptibility',
                'C) Hardware failure',
                'D) Power cuts'
            ],
            correct: 1,
            explanation: 'Phishing uses email and social engineering. Email filters reduce delivery; training helps users recognise and report what gets through.',
            remediation: 'D1: Phishing. D2: Email filter and training. D4: Both controls together (defence in depth).',
            specRef: 'D2',
            source: 'NCSC Phishing Guidance'
        },
        {
            question: 'The Official Secrets Act 1989 is relevant to government cyber security because:',
            options: [
                'A) It only covers paper documents',
                'B) It protects classified information; unauthorised disclosure or compromise of protected data is an offence',
                'C) It replaces the Computer Misuse Act',
                'D) It only applies to the military'
            ],
            correct: 1,
            explanation: 'The Official Secrets Act protects classified information. Unauthorised disclosure or failure to protect such information can be a criminal offence.',
            remediation: 'D3: Legislation. Government agencies handle classified data; CMA and OSA both apply to misuse and disclosure.',
            specRef: 'D3',
            source: 'Official Secrets Act 1989'
        },
        {
            question: 'Why is threat intelligence useful for defence?',
            options: [
                'A) It replaces the need for firewalls',
                'B) It provides information on current threats and attacker methods so defences can be prioritised and updated',
                'C) It is only for large organisations',
                'D) It only covers physical threats'
            ],
            correct: 1,
            explanation: 'Threat intelligence (e.g. IOCs, TTPs) helps organisations understand what to look for and how to harden defences. It supports detection and incident response.',
            remediation: 'D4/D5: Informs defence in depth and incident response. NCSC provides threat intelligence to UK organisations.',
            specRef: 'D4',
            source: 'NCSC Threat Intelligence'
        },
        {
            question: 'Why should backups be stored offsite or in a separate system?',
            options: [
                'A) To save space on the main server',
                'B) So that a single incident (e.g. ransomware, fire) cannot destroy both live data and backups',
                'C) Only for legal compliance',
                'D) Offsite backups are not recommended'
            ],
            correct: 1,
            explanation: 'If backups are on the same system or site, ransomware or physical disaster can destroy both. Offsite or immutable backups enable recovery.',
            remediation: 'D5: Business continuity. D2: Backup strategy. Part of 3-2-1 rule.',
            specRef: 'D5',
            source: 'NCSC Backup Guidance'
        },
        {
            question: 'What does "integrity" mean in the context of data security?',
            options: [
                'A) Only that data is encrypted',
                'B) Ensuring data is accurate and has not been altered without authorisation',
                'C) Only that data is backed up',
                'D) Only for financial data'
            ],
            correct: 1,
            explanation: 'Integrity means data has not been tampered with or corrupted. Controls include access control, checksums, and logging.',
            remediation: 'D2: Technical and organisational measures. GDPR/DPA security principle includes integrity (and confidentiality).',
            specRef: 'D2',
            source: 'GDPR Article 5(1)(f); NCSC'
        },
        {
            question: 'A zero-day exploit is hard to defend against because:',
            options: [
                'A) It only works at night',
                'B) No patch exists yet, so signature-based defences may not detect it',
                'C) Only one computer is affected',
                'D) Antivirus always blocks it'
            ],
            correct: 1,
            explanation: 'Zero-day means the vendor has had zero days to issue a patch. Behavioural detection, segmentation, and least privilege help limit impact.',
            remediation: 'D1: Zero-day. D2/D4: Defence in depth and monitoring reduce impact when signatures are not yet available.',
            specRef: 'D1',
            source: 'NCSC Zero Day'
        },
        {
            question: 'The Cyber Assessment Framework (CAF) is used to:',
            options: [
                'A) Replace GDPR',
                'B) Assess and improve the cyber resilience of organisations, including critical infrastructure',
                'C) Only test firewalls',
                'D) Only in the private sector'
            ],
            correct: 1,
            explanation: 'The NCSC CAF helps organisations assess their cyber security and resilience. It is used by regulators and essential services.',
            remediation: 'D4/D5: Supports defence in depth and resilience. D3: NIS and sector regimes may reference it.',
            specRef: 'D4',
            source: 'NCSC Cyber Assessment Framework'
        },
        {
            question: 'Why is it important to preserve evidence after a cyber incident?',
            options: [
                'A) Only for criminal prosecution',
                'B) To support investigation, root cause analysis, regulatory action, and potential legal proceedings',
                'C) Evidence preservation is not recommended',
                'D) Only the police need evidence'
            ],
            correct: 1,
            explanation: 'Preserving logs and artefacts supports incident analysis, regulatory reporting, and any legal or disciplinary action. It should be part of incident response.',
            remediation: 'D5: Incident response. D3: May be relevant to ICO or law enforcement. Do not wipe systems before assessment.',
            specRef: 'D5',
            source: 'NIST SP 800-61'
        },
        {
            question: 'Malware that encrypts files and demands payment is called:',
            options: [
                'A) A trojan',
                'B) Ransomware',
                'C) DDoS',
                'D) Phishing'
            ],
            correct: 1,
            explanation: 'Ransomware encrypts data and demands payment (usually in cryptocurrency) for the decryption key. Backup is the primary defence for recovery.',
            remediation: 'D1: Ransomware. D2: Backup, email filter, patch management. D5: Recovery and BCP.',
            specRef: 'D1',
            source: 'NCSC Ransomware'
        },
        {
            question: 'Access control and authentication support security by:',
            options: [
                'A) Encrypting all data',
                'B) Ensuring only authorised users and systems can access resources; reducing risk from insiders and stolen credentials',
                'C) Replacing the need for backups',
                'D) Only for admin accounts'
            ],
            correct: 1,
            explanation: 'Access control and strong authentication (e.g. MFA) limit who can access what. They mitigate insider threat and credential theft.',
            remediation: 'D2: Access control. D1: Insiders and credential theft. D4: Part of layered defence.',
            specRef: 'D2',
            source: 'NCSC Access Control'
        },
        {
            question: 'What is the main purpose of the ICO in relation to data protection?',
            options: [
                'A) To sell insurance',
                'B) To enforce UK data protection law (DPA 2018, UK GDPR), advise organisations, and handle complaints',
                'C) To run the NHS',
                'D) To prosecute all cyber criminals'
            ],
            correct: 1,
            explanation: 'The ICO is the UK supervisory authority for data protection. It enforces the law, issues guidance, and can impose fines and other sanctions.',
            remediation: 'D3: ICO enforces DPA 2018 and UK GDPR. Organisations must cooperate and report breaches as required.',
            specRef: 'D3',
            source: 'ICO'
        },
        {
            question: 'Security monitoring (e.g. SIEM, IDS alerts) supports:',
            options: [
                'A) Only compliance reporting',
                'B) Early detection of incidents, investigation, and response so that breaches can be contained',
                'C) Replacing the need for a firewall',
                'D) Only for large organisations'
            ],
            correct: 1,
            explanation: 'Monitoring and alerting help detect suspicious or malicious activity so that incidents can be investigated and contained before major damage.',
            remediation: 'D2: Detection. D5: Incident response. D4: Part of defence in depth.',
            specRef: 'D5',
            source: 'NIST SP 800-61'
        },
        {
            question: 'Why might an attacker use a DDoS attack alongside another attack?',
            options: [
                'A) DDoS is the only attack type',
                'B) To distract defenders and overload systems so that another attack (e.g. data theft) is harder to detect or resist',
                'C) DDoS always fails',
                'D) Only for fun'
            ],
            correct: 1,
            explanation: 'Attackers sometimes use DDoS as a smokescreen — while defenders focus on availability, another attack (e.g. malware, exfiltration) may go unnoticed.',
            remediation: 'D1: Multiple threats. D4: Defence in depth and monitoring help manage multiple attack vectors.',
            specRef: 'D1',
            source: 'NCSC DDoS; threat intelligence'
        },
        {
            question: 'Business continuity exercises (e.g. tabletop or technical drills) are important because:',
            options: [
                'A) They are only for compliance',
                'B) They reveal gaps in plans and procedures before a real incident; untested plans often fail',
                'C) They replace the need for backups',
                'D) They are only needed once'
            ],
            correct: 1,
            explanation: 'Exercises test whether plans work and whether people know their roles. They often reveal outdated contacts, broken procedures, or missing backups.',
            remediation: 'D5: Business continuity. Regular testing and updating of BCP and IR plans are good practice.',
            specRef: 'D5',
            source: 'NCSC Business Continuity'
        }
    ],
    6: [
        {
            question: 'The 2015 Ukraine power grid attack demonstrated that:',
            options: [
                'A) Power grids cannot be hacked because they are isolated',
                'B) Cyber attacks on critical infrastructure can cause physical harm and affect millions of people',
                'C) Only military systems are at risk of nation-state attacks',
                'D) The attack was easily prevented by antivirus software'
            ],
            correct: 1,
            explanation: 'The Ukraine attack left 230,000 people without electricity for up to 6 hours. It proved that cyber attacks can have real-world physical consequences when targeting critical infrastructure.',
            remediation: 'Power grids are increasingly connected to the internet for monitoring and control, making them hackable. The attack involved sophisticated techniques (spear-phishing + malware + remote access) that antivirus alone could not have stopped. All critical infrastructure — not just military — is a target.',
            specRef: 'D1',
            source: 'ICS-CERT Alert, SANS ICS Analysis, 2016'
        },
        {
            question: 'Defense in depth means:',
            options: [
                'A) Investing all budget in the single strongest control available',
                'B) Multiple overlapping security layers at different levels, so that if one fails, others still provide protection',
                'C) Using as many copies of the same security product as possible',
                'D) Focusing all resources on perimeter defense'
            ],
            correct: 1,
            explanation: 'Defense in depth layers diverse controls: perimeter (firewalls), detection (IDS/IPS), prevention (antivirus, email filters), access (authentication), protection (encryption, backups), and people (training).',
            remediation: 'Duplicating the same product is NOT defense in depth — it creates the same blind spots multiple times. Perimeter-only defense fails when threats bypass the perimeter (e.g. phishing). True defense in depth uses diverse, complementary controls at multiple layers.',
            specRef: 'D4',
            source: 'NCSC 10 Steps to Cyber Security, 2021'
        },
        {
            question: 'Under the NIS Regulations, an operator of essential services that fails to implement adequate security measures can face:',
            options: [
                'A) No penalty — the regulations are advisory only',
                'B) Fines of up to \u00A317 million from the relevant competent authority',
                'C) Only a written warning',
                'D) Criminal prosecution of the CEO'
            ],
            correct: 1,
            explanation: 'NIS Regulations allow competent authorities to impose fines of up to \u00A317 million for the most serious failures to implement appropriate security measures.',
            remediation: 'The NIS Regulations are legally binding, not advisory. The penalty framework includes information notices, enforcement notices, and fines. While individual criminal prosecution is not part of NIS (it\'s in the CMA 1990), the financial penalties are significant and enforced.',
            specRef: 'D3',
            source: 'NIS Regulations 2018, DCMS Guidance, 2018'
        },
        {
            question: 'For critical infrastructure, which approach provides the strongest resilience against ALL threat types?',
            options: [
                'A) Air-gapping the entire network from the internet',
                'B) A comprehensive security strategy combining technical controls, organisational policies, staff training, incident response, and business continuity planning',
                'C) Outsourcing all security to a single managed security provider',
                'D) Implementing only passive monitoring without active prevention'
            ],
            correct: 1,
            explanation: 'Comprehensive resilience requires defence at every level: technical (firewalls, IDS, encryption), procedural (policies, access control), human (training), and organisational (incident response, BCP). No shortcut provides equivalent protection.',
            remediation: 'Air-gapping is impractical for modern infrastructure that requires remote monitoring. Outsourcing security creates a single point of dependency. Passive monitoring without prevention means attacks succeed and are only detected afterwards. The strongest approach combines all elements.',
            specRef: 'D4',
            source: 'NCSC Cyber Assessment Framework, 2022'
        },
        {
            question: 'A critical infrastructure provider must conduct regular business continuity exercises because:',
            options: [
                'A) It is a waste of time but required by law',
                'B) Untested plans often fail under real incident pressure, and exercises identify gaps before a real attack',
                'C) Exercises are only needed after an incident has occurred',
                'D) The plan only needs to be tested once when first written'
            ],
            correct: 1,
            explanation: 'Regular exercises reveal outdated contact details, broken backup systems, and unrealistic assumptions. The BCI reports that organisations testing annually recover 50% faster from real incidents.',
            remediation: 'Exercises are not busywork — they are the only way to validate that a plan actually works. Systems change, staff change, threats change. A plan written three years ago with untested backups and outdated phone numbers will fail when needed most.',
            specRef: 'D5',
            source: 'BCI Horizon Scan Report, 2023; ISO 22301, 2019'
        },
        {
            question: 'Critical national infrastructure (e.g. energy, water) is a target because:',
            options: [
                'A) It has no value to attackers',
                'B) Disruption causes widespread harm; attackers may seek ransom, sabotage, or geopolitical impact',
                'C) Only military systems are targeted',
                'D) It is always air-gapped'
            ],
            correct: 1,
            explanation: 'Critical infrastructure disruption affects society and economy. Attackers may be criminal (ransom) or state-sponsored (sabotage, espionage).',
            remediation: 'D1: Threat motivation. D3: NIS Regulations apply. D4/D5: Resilience and BCP are essential.',
            specRef: 'D1',
            source: 'NCSC Critical Infrastructure'
        },
        {
            question: 'NIS Regulations require operators of essential services to:',
            options: [
                'A) Only have a firewall',
                'B) Take appropriate technical and organisational measures to manage security risk and report significant incidents',
                'C) Stop using the internet',
                'D) Only report to the police'
            ],
            correct: 1,
            explanation: 'NIS requires risk-based security measures and notification of significant incidents to the competent authority. Sector-specific and legally binding.',
            remediation: 'D3: NIS Regulations 2018. Complements GDPR. D5: Incident reporting.',
            specRef: 'D3',
            source: 'NIS Regulations 2018'
        },
        {
            question: 'Why is defence in depth especially important for critical infrastructure?',
            options: [
                'A) One control is enough',
                'B) A single point of failure can cause major disruption; multiple layers reduce the chance that one failure leads to full compromise',
                'C) Only for energy sector',
                'D) It replaces the need for staff'
            ],
            correct: 1,
            explanation: 'Critical infrastructure faces sophisticated threats. No single control is sufficient; multiple technical, procedural, and human layers limit impact of any one failure.',
            remediation: 'D4: Defence in depth. D2: Multiple controls. D5: Resilience and recovery.',
            specRef: 'D4',
            source: 'NCSC CAF'
        },
        {
            question: 'Recovery from a major incident in critical infrastructure typically requires:',
            options: [
                'A) Only restarting the server',
                'B) Documented procedures, trained staff, tested backups, and coordination with regulators and partners',
                'C) Only the IT team',
                'D) No prior planning'
            ],
            correct: 1,
            explanation: 'Recovery depends on BCP/DR plans, backups, clear roles, and often coordination with sector regulators and other stakeholders.',
            remediation: 'D5: Business continuity and incident response. Planning and testing before an incident are essential.',
            specRef: 'D5',
            source: 'NCSC Business Continuity'
        },
        {
            question: 'Supply chain attacks on critical infrastructure can:',
            options: [
                'A) Only affect one supplier',
                'B) Compromise widely used software or hardware (e.g. updates, devices) and affect many organisations at once',
                'C) Only happen in theory',
                'D) Be prevented by a firewall only'
            ],
            correct: 1,
            explanation: 'Attackers compromise suppliers or software updates to reach many victims. SolarWinds and similar incidents showed the impact. Supply chain risk must be assessed and managed.',
            remediation: 'D1: Supply chain threat. D4: Defence in depth includes supplier and update assurance. D3: Sector guidance may apply.',
            specRef: 'D1',
            source: 'NCSC Supply Chain'
        },
        {
            question: 'Physical security is relevant to cyber security because:',
            options: [
                'A) It is unrelated',
                'B) Unauthorised physical access can allow installation of malware, theft of devices, or access to consoles and data',
                'C) Only in military sites',
                'D) It replaces logical access control'
            ],
            correct: 1,
            explanation: 'Physical access can bypass network controls. Attackers can plug in devices, steal hardware, or use unattended workstations. Physical and logical security should be aligned.',
            remediation: 'D4: Defence in depth includes physical controls. D2: Access control has physical and logical aspects.',
            specRef: 'D4',
            source: 'NCSC Physical Security'
        },
        {
            question: 'Why should critical infrastructure operators test their incident response plans?',
            options: [
                'A) Only to satisfy auditors',
                'B) Untested plans often fail under real pressure; testing reveals gaps and trains staff',
                'C) Testing is not recommended',
                'D) Only once when first written'
            ],
            correct: 1,
            explanation: 'Real incidents are high-pressure. Testing reveals missing steps, wrong contacts, and procedural gaps before they matter in a live incident.',
            remediation: 'D5: Incident response and BCP. Regular exercises and updates are good practice.',
            specRef: 'D5',
            source: 'NIST SP 800-61'
        },
        {
            question: 'Ransomware targeting operational technology (OT) in critical infrastructure can:',
            options: [
                'A) Only affect office IT',
                'B) Disrupt industrial control systems (e.g. SCADA), affecting physical processes and public safety',
                'C) Only slow down computers',
                'D) Be ignored until the ransom is paid'
            ],
            correct: 1,
            explanation: 'OT/ICS systems control physical processes. Ransomware or other malware can disrupt operations, safety systems, or supply, with real-world consequences.',
            remediation: 'D1: Ransomware and OT. D2/D4: Segmentation between IT and OT, backup, and resilience. D5: BCP for OT.',
            specRef: 'D1',
            source: 'NCSC OT Security'
        },
        {
            question: 'The "confidentiality, integrity and availability" (CIA) triad in cyber security refers to:',
            options: [
                'A) A single product',
                'B) Core security goals: keeping data secret, accurate and unaltered, and accessible when needed',
                'C) Only for government',
                'D) Only confidentiality matters'
            ],
            correct: 1,
            explanation: 'Confidentiality (no unauthorised access), integrity (no unauthorised change), and availability (accessible when needed) are the three main security objectives.',
            remediation: 'D2/D4: Controls are chosen to protect one or more of these. D5: Availability is linked to BCP.',
            specRef: 'D4',
            source: 'NCSC; security frameworks'
        },
        {
            question: 'Why might an attacker target an industrial control system (ICS)?',
            options: [
                'A) ICS have no value',
                'B) To disrupt or destroy physical processes (e.g. power, water, manufacturing) for ransom, sabotage, or geopolitical gain',
                'C) Only to steal emails',
                'D) ICS cannot be hacked'
            ],
            correct: 1,
            explanation: 'ICS control real-world processes. Compromise can cause outages, safety incidents, or sabotage. Motivations include criminal (ransom) and nation-state.',
            remediation: 'D1: Threat to OT/ICS. D3: NIS and sector regimes. D4/D5: Segmentation, monitoring, BCP.',
            specRef: 'D1',
            source: 'NCSC OT/ICS'
        },
        {
            question: 'Vulnerability management (identifying and remediating weaknesses) supports security because:',
            options: [
                'A) It is only for compliance',
                'B) Attackers exploit known vulnerabilities; finding and fixing them (e.g. patching) reduces the attack surface',
                'C) It replaces the need for a firewall',
                'D) Only critical vulnerabilities matter'
            ],
            correct: 1,
            explanation: 'Many breaches use known, unpatched vulnerabilities. Vulnerability management (scanning, prioritisation, patching) reduces this risk.',
            remediation: 'D2: Patch management and vulnerability management. D1: Exploitation of vulns. D4: Part of defence.',
            specRef: 'D2',
            source: 'NCSC Vulnerability Management'
        },
        {
            question: 'In incident response, "containment" means:',
            options: [
                'A) Ignoring the incident',
                'B) Limiting the spread and impact of the incident (e.g. isolating affected systems) while preserving evidence',
                'C) Deleting all data',
                'D) Only telling the board'
            ],
            correct: 1,
            explanation: 'Containment aims to stop the incident from spreading (e.g. disconnecting compromised systems) and to preserve evidence for later analysis.',
            remediation: 'D5: Incident response. Containment is typically an early phase before eradication and recovery.',
            specRef: 'D5',
            source: 'NIST SP 800-61'
        },
        {
            question: 'Why is encryption important for data in transit (e.g. over the internet)?',
            options: [
                'A) It only speeds up transfer',
                'B) Unencrypted traffic can be intercepted and read; encryption (e.g. TLS) protects confidentiality and integrity',
                'C) Only for payment data',
                'D) It replaces the need for access control'
            ],
            correct: 1,
            explanation: 'Data in transit (e.g. web, email) can be intercepted. TLS/encryption ensures that intercepted traffic cannot be read or tampered with.',
            remediation: 'D2: Encryption. D3: GDPR and PCI-DSS recommend encryption. D4: Part of layered security.',
            specRef: 'D2',
            source: 'NCSC TLS; GDPR Recital 83'
        },
        {
            question: 'Security policies and procedures (e.g. acceptable use, incident response) support security by:',
            options: [
                'A) Only for compliance',
                'B) Defining expected behaviour, roles, and response so that staff and partners act consistently and lawfully',
                'C) Replacing the need for technical controls',
                'D) Only the IT team need to follow them'
            ],
            correct: 1,
            explanation: 'Policies set expectations and accountability. Procedures (e.g. incident response) ensure consistent, lawful action. They are organisational controls that complement technical ones.',
            remediation: 'D4: Technical and organisational controls. D3: Policies support compliance (e.g. DPA). D5: IR procedures.',
            specRef: 'D4',
            source: 'NCSC Governance'
        },
        {
            question: 'What is a key benefit of having a designated incident response team?',
            options: [
                'A) Only for large organisations',
                'B) Clear ownership and trained people to detect, contain, and recover; faster response and better coordination',
                'C) It replaces the need for backups',
                'D) Only to report to the police'
            ],
            correct: 1,
            explanation: 'A defined team (or role) with clear responsibilities and training can respond faster and more consistently, limiting damage and meeting legal obligations.',
            remediation: 'D5: Incident response. Part of BCP. D3: Breach notification and cooperation with regulators.',
            specRef: 'D5',
            source: 'NIST SP 800-61'
        }
    ],
    7: [
        {
            question: 'PCI-DSS requires organisations that process card payments to:',
            options: [
                'A) Only use antivirus software',
                'B) Implement network segmentation to isolate cardholder data, encryption, access control, and regular security testing',
                'C) Store card numbers in plain text for faster transactions',
                'D) Rely solely on the bank to secure payment data'
            ],
            correct: 1,
            explanation: 'PCI-DSS mandates 12 key security controls including firewalls, encryption of data at rest and in transit, access control, network segmentation of the cardholder data environment, and regular penetration testing and vulnerability scanning.',
            remediation: 'PCI-DSS is enforced by card brands (Visa, Mastercard). Non-compliance can result in fines and loss of ability to process cards. The merchant or service provider is responsible for securing cardholder data — the bank does not secure the merchant\'s systems.',
            specRef: 'D2, D3',
            source: 'PCI Security Standards Council, PCI-DSS v4.0'
        },
        {
            question: 'A financial firm must report a material cyber incident to the FCA:',
            options: [
                'A) Only after the incident is fully resolved',
                'B) As soon as the firm becomes aware that the incident has or may have an impact on its ability to provide services',
                'C) Only if customer data was definitely stolen',
                'D) Only when requested by the police'
            ],
            correct: 1,
            explanation: 'The FCA requires regulated firms to report material cyber incidents promptly. Delaying notification can worsen regulatory consequences and customer harm. GDPR also mandates 72-hour breach notification to the ICO for personal data breaches.',
            remediation: 'Incident response in finance requires immediate containment, preservation of evidence, regulatory notification, and customer communication. Speed of response directly impacts financial and reputational losses.',
            specRef: 'D3, D5',
            source: 'FCA Handbook, GDPR Article 33'
        },
        {
            question: 'Network segmentation helps protect payment systems because:',
            options: [
                'A) It makes the network faster',
                'B) It isolates cardholder data environments from the rest of the network, limiting lateral movement if one system is compromised',
                'C) It is only required for banks, not retailers',
                'D) It replaces the need for firewalls'
            ],
            correct: 1,
            explanation: 'Segmentation creates zones so that a breach in one area (e.g. a contractor\'s access) cannot easily reach the payment system. The Target breach succeeded partly because the attacker moved laterally from a non-segmented HVAC contractor connection to the payment network.',
            remediation: 'Segmentation is a PCI-DSS requirement for any organisation handling card data. It works alongside firewalls, encryption, and access control — it does not replace them. Defense in depth requires multiple controls.',
            specRef: 'D2, D4',
            source: 'PCI-DSS Requirement 1; NCSC Network Segmentation Guidance'
        },
        {
            question: 'Why is encryption of data at rest and in transit mandatory for financial data?',
            options: [
                'A) It is only recommended, not mandatory',
                'B) It protects data from being read if intercepted or stolen, reducing the impact of a breach and meeting regulatory requirements',
                'C) It prevents all types of cyber attacks',
                'D) It is only required for data sent over the internet'
            ],
            correct: 1,
            explanation: 'Encryption ensures that even if an attacker gains access to stored data or intercepts traffic, the data remains unreadable without the key. PCI-DSS and GDPR both require appropriate encryption for sensitive financial and personal data.',
            remediation: 'Encryption protects confidentiality; it does not prevent attacks like DDoS or phishing. Data at rest (on disks, databases) and in transit (over networks) must both be protected. Key management is as important as the encryption itself.',
            specRef: 'D2, D3',
            source: 'PCI-DSS Requirement 3; GDPR Article 32'
        },
        {
            question: 'Third-party or supply chain access to a financial network increases risk because:',
            options: [
                'A) Third parties never have access to internal networks',
                'B) Attackers can compromise a less-secure supplier and use that access to move into the main organisation\'s network',
                'C) Only large organisations use third parties',
                'D) Banks are responsible for securing third-party systems'
            ],
            correct: 1,
            explanation: 'The Target breach began with compromise of an HVAC contractor that had network access. Supply chain and third-party access create additional entry points that must be secured through contracts, least privilege, and segmentation.',
            remediation: 'Organisations must assess and contractually require security standards from suppliers with network or data access. Assume any third-party connection is a potential vector — segment and monitor accordingly.',
            specRef: 'D1, D4',
            source: 'NCSC Supply Chain Security Guidance; Target Breach Analysis'
        },
        {
            question: 'Why must financial firms report material cyber incidents to the FCA promptly?',
            options: [
                'A) Only after full resolution',
                'B) To protect consumers and market integrity; delay can worsen harm and regulatory response',
                'C) Only if customer data is stolen',
                'D) The FCA does not require reporting'
            ],
            correct: 1,
            explanation: 'The FCA requires prompt reporting of material cyber incidents. Timely reporting supports consumer protection and regulatory action.',
            remediation: 'D3: FCA requirements. D5: Incident response and notification. Overlaps with GDPR 72-hour breach notification.',
            specRef: 'D3',
            source: 'FCA Handbook'
        },
        {
            question: 'What does PCI-DSS require for storage of cardholder data?',
            options: [
                'A) Store in plain text for speed',
                'B) Strong cryptography (e.g. AES), key management, and access control; render PAN unreadable where stored',
                'C) Only encrypt in transit',
                'D) No specific requirement'
            ],
            correct: 1,
            explanation: 'PCI-DSS Requirement 3 requires strong cryptography for cardholder data at rest, secure key management, and access controls. PAN should be unreadable where stored.',
            remediation: 'D2: Encryption and access control. D3: PCI-DSS. D4: Part of defence in depth.',
            specRef: 'D2',
            source: 'PCI-DSS Requirement 3'
        },
        {
            question: 'Why is least privilege important in a financial environment?',
            options: [
                'A) It slows down staff',
                'B) It limits the damage from a compromised account or insider; users only have access needed for their role',
                'C) Only for IT staff',
                'D) It replaces MFA'
            ],
            correct: 1,
            explanation: 'Least privilege reduces the scope of what an attacker or insider can access. In finance, this limits exposure of payment and customer data.',
            remediation: 'D2: Access control. D1: Insider and credential theft. D4: Layered defence.',
            specRef: 'D2',
            source: 'NCSC Access Control'
        },
        {
            question: 'A financial firm discovers a data breach. Besides the FCA, who may need to be notified?',
            options: [
                'A) No one else',
                'B) ICO (within 72 hours for personal data), affected individuals if high risk, and possibly other regulators or partners',
                'C) Only the police',
                'D) Only after one month'
            ],
            correct: 1,
            explanation: 'GDPR requires ICO notification within 72 hours for personal data breaches. Affected individuals must be informed when high risk. Contractual or sector rules may require notifying others.',
            remediation: 'D3: GDPR Articles 33–34. D5: Incident response and communication.',
            specRef: 'D3',
            source: 'GDPR; ICO Breach Guidance'
        },
        {
            question: 'Why should financial organisations use multi-factor authentication (MFA) for critical systems?',
            options: [
                'A) It is optional',
                'B) Passwords can be stolen or phished; MFA adds a second factor so stolen credentials alone are insufficient',
                'C) Only for customers',
                'D) It replaces the need for encryption'
            ],
            correct: 1,
            explanation: 'MFA requires something you know (password) plus something you have or are. It significantly reduces the risk from credential theft and phishing.',
            remediation: 'D2: Authentication. D1: Phishing and credential theft. Often required or expected in finance (D3).',
            specRef: 'D2',
            source: 'NCSC MFA'
        },
        {
            question: 'What is the main purpose of network segmentation in a cardholder data environment?',
            options: [
                'A) To make the network faster',
                'B) To isolate systems that process or store card data so that a breach elsewhere does not automatically expose them',
                'C) Only for large banks',
                'D) It replaces firewalls'
            ],
            correct: 1,
            explanation: 'Segmentation creates a separate zone for cardholder data. Compromise of other systems (e.g. corporate network) does not automatically give access to the CDE.',
            remediation: 'D2/D4: PCI-DSS and defence in depth. Limits lateral movement (D1).',
            specRef: 'D4',
            source: 'PCI-DSS Requirement 1'
        },
        {
            question: 'Ransomware recovery in a financial context should prioritise:',
            options: [
                'A) Paying the ransom first',
                'B) Containment, assessment, recovery from backups where possible, and notification of regulators and affected parties',
                'C) Deleting all backups',
                'D) Only informing the board'
            ],
            correct: 1,
            explanation: 'Paying the ransom is not recommended and may not work. Recovery should use backups where possible, with containment and notification as required.',
            remediation: 'D5: Incident response. D2: Backup. D3: FCA, ICO, and possibly customer notification.',
            specRef: 'D5',
            source: 'NCSC Ransomware; FCA'
        },
        {
            question: 'Why is regular penetration testing recommended for financial systems?',
            options: [
                'A) Only for compliance',
                'B) To find vulnerabilities in a controlled way before attackers do; supports risk management and compliance (e.g. PCI-DSS)',
                'C) It replaces the need for firewalls',
                'D) Only once per year'
            ],
            correct: 1,
            explanation: 'Pen testing simulates attacks to find weaknesses. It helps prioritise remediation and can be required by PCI-DSS and other frameworks.',
            remediation: 'D2: Testing and assurance. D4: Part of risk management. D3: PCI-DSS requires testing.',
            specRef: 'D2',
            source: 'PCI-DSS; NCSC Pen Testing'
        },
        {
            question: 'Data minimisation in a financial context means:',
            options: [
                'A) Storing as much as possible for analytics',
                'B) Collecting and retaining only the personal data necessary for the defined purpose',
                'C) Deleting all data after one day',
                'D) Only for marketing data'
            ],
            correct: 1,
            explanation: 'Data minimisation (GDPR principle) means only processing what is necessary. It reduces breach impact and supports compliance.',
            remediation: 'D3: GDPR Article 5(1)(c). Applies to all personal data, including financial. D2: Reduces scope of protection needed.',
            specRef: 'D3',
            source: 'GDPR Article 5'
        },
        {
            question: 'Why might a financial firm use a Security Information and Event Management (SIEM) system?',
            options: [
                'A) Only for compliance reports',
                'B) To aggregate and analyse logs and events so that security incidents can be detected and investigated',
                'C) To replace firewalls',
                'D) Only for email'
            ],
            correct: 1,
            explanation: 'SIEM collects and correlates logs and events to detect suspicious or malicious activity and support incident investigation.',
            remediation: 'D2: Detection and monitoring. D5: Incident response. D4: Part of defence in depth.',
            specRef: 'D5',
            source: 'NIST SP 800-61'
        },
        {
            question: 'What is the role of the Data Protection Officer (DPO) under GDPR?',
            options: [
                'A) To market personal data',
                'B) To oversee data protection compliance, advise the organisation, and act as a contact point for the ICO and data subjects',
                'C) Only to delete data',
                'D) Only in the public sector'
            ],
            correct: 1,
            explanation: 'The DPO monitors compliance, advises on DPIAs and data protection, and cooperates with the supervisory authority. Required in certain circumstances (e.g. large-scale processing).',
            remediation: 'D3: GDPR Articles 37–39. Supports accountability and compliance.',
            specRef: 'D3',
            source: 'GDPR Articles 37–39'
        },
        {
            question: 'Why is encryption of backup media important for financial data?',
            options: [
                'A) Backups do not need encryption',
                'B) Backup media can be lost or stolen; encryption ensures the data cannot be read without the key',
                'C) Only for cloud backups',
                'D) It slows down restore'
            ],
            correct: 1,
            explanation: 'Backups often contain the same sensitive data as live systems. Encrypting backup media protects confidentiality if the media is lost or stolen.',
            remediation: 'D2: Encryption and backup. D5: Recovery. D3: Appropriate security for personal/financial data.',
            specRef: 'D2',
            source: 'NCSC Backup; PCI-DSS'
        },
        {
            question: 'Phishing targeting financial staff (e.g. finance or HR) is dangerous because:',
            options: [
                'A) Only IT staff are targeted',
                'B) They may have access to payment systems, payroll, or sensitive data; one compromised account can cause major harm',
                'C) Phishing does not work on staff',
                'D) Only external email is used'
            ],
            correct: 1,
            explanation: 'Finance and HR often have high-privilege access. A phished credential can lead to fraud, data theft, or system compromise.',
            remediation: 'D1: Phishing. D2: Training and MFA. D4: Defence in depth and least privilege.',
            specRef: 'D1',
            source: 'NCSC Phishing'
        },
        {
            question: 'What does "secure disposal" of data mean in a financial context?',
            options: [
                'A) Deleting files and emptying the recycle bin',
                'B) Irreversibly destroying data (e.g. secure erase, degaussing, destruction of media) so it cannot be recovered',
                'C) Selling old disks',
                'D) Only for paper'
            ],
            correct: 1,
            explanation: 'Secure disposal ensures data cannot be recovered from decommissioned devices or media. Simple delete is often insufficient; secure erase or physical destruction may be required.',
            remediation: 'D2: Data lifecycle. D3: Storage limitation and security principle. D5: Asset disposal procedures.',
            specRef: 'D2',
            source: 'NCSC Secure Disposal'
        },
        {
            question: 'Why should financial organisations have a documented incident response plan?',
            options: [
                'A) Only for auditors',
                'B) So that in a real incident, roles, steps, and contacts are clear; response is faster and meets legal/regulatory obligations',
                'C) Plans are not needed',
                'D) Only the IT team need to know it'
            ],
            correct: 1,
            explanation: 'A documented plan ensures consistent, timely response and supports compliance with FCA, GDPR (e.g. 72-hour notification), and other requirements.',
            remediation: 'D5: Incident response and BCP. D3: Regulatory expectations. Plan should be tested and updated.',
            specRef: 'D5',
            source: 'NIST SP 800-61; FCA'
        }
    ],
    8: [
        {
            question: 'In the cloud shared responsibility model:',
            options: [
                'A) The cloud provider is responsible for all security',
                'B) The provider secures the infrastructure (physical, network, hypervisor); the customer is responsible for their data, access management, and application security',
                'C) The customer is responsible for all security',
                'D) Responsibility is shared 50/50 regardless of service type'
            ],
            correct: 1,
            explanation: 'The provider secures the underlying platform; the customer must secure their workloads, data, identity, and configuration. Misunderstanding this model is a leading cause of cloud breaches — e.g. misconfigured firewalls or over-privileged IAM roles.',
            remediation: 'GDPR Article 28 requires data controllers to use processors (cloud providers) that provide sufficient security guarantees. The customer remains responsible for ensuring their use of the cloud meets legal and security requirements.',
            specRef: 'D2, D3',
            source: 'AWS/Azure Shared Responsibility Model; GDPR Article 28'
        },
        {
            question: 'A misconfigured cloud firewall or over-privileged IAM role can lead to:',
            options: [
                'A) Only slower performance',
                'B) Unauthorised access to customer data stored in the cloud, potentially exposing all tenants in multi-tenant environments',
                'C) The cloud provider automatically fixing the issue',
                'D) No impact because cloud data is always encrypted'
            ],
            correct: 1,
            explanation: 'The Capital One breach was caused by a misconfigured firewall (SSRF) that allowed the attacker to obtain IAM credentials and access over 100 million customer records. Encryption protects data at rest but not if the attacker gains valid access.',
            remediation: 'Customers must secure their cloud configuration: least-privilege IAM, network security groups, and regular configuration audits. The provider does not fix customer misconfigurations — that is the customer\'s responsibility under the shared model.',
            specRef: 'D2, D4',
            source: 'Capital One Breach (2019) Analysis; NCSC Cloud Security Guidance'
        },
        {
            question: 'The NIS Regulations 2018 classify cloud computing services as:',
            options: [
                'A) Exempt from security requirements',
                'B) Digital services that must take appropriate security measures and report significant incidents',
                'C) Only relevant to government use',
                'D) Covered entirely by GDPR with no extra duties'
            ],
            correct: 1,
            explanation: 'Digital service providers (including cloud platforms) fall under NIS Regulations and must implement appropriate technical and organisational measures and report significant incidents to the relevant authority.',
            remediation: 'NIS complements GDPR: GDPR focuses on personal data; NIS focuses on security and availability of essential and digital services. Cloud providers may have obligations under both.',
            specRef: 'D3',
            source: 'NIS Regulations 2018; DCMS Guidance'
        },
        {
            question: 'API security is critical in cloud environments because:',
            options: [
                'A) APIs are rarely used in the cloud',
                'B) APIs are the primary interface to cloud services — insecure APIs can expose data and allow unauthorized access across many customers',
                'C) The cloud provider secures all APIs automatically',
                'D) API security is only important for mobile apps'
            ],
            correct: 1,
            explanation: 'Cloud applications communicate via APIs. Insecure APIs (e.g. missing authentication, injection flaws, excessive permissions) can be exploited to access or modify data. A single API vulnerability can affect many tenants.',
            remediation: 'API security requires authentication, authorization, input validation, rate limiting, and encryption in transit. OWASP publishes an API Security Top 10. This is the customer\'s responsibility in the shared model.',
            specRef: 'D1, D2',
            source: 'OWASP API Security Top 10; NCSC Cloud Security'
        },
        {
            question: 'Data sovereignty in the cloud means:',
            options: [
                'A) Data can be stored anywhere with no restrictions',
                'B) Data location matters — laws (e.g. GDPR) may restrict where personal data is stored or processed, especially outside the EU/UK',
                'C) Only the cloud provider needs to know where data is stored',
                'D) Sovereignty only applies to government data'
            ],
            correct: 1,
            explanation: 'GDPR restricts transfers of personal data outside the UK/EEA unless adequate safeguards exist. Cloud customers must know where their data is processed and ensure compliance with data protection law.',
            remediation: 'Data stored in the cloud remains subject to the Data Protection Act 2018 and GDPR. Controllers must choose processors and regions that meet legal requirements and document data flows.',
            specRef: 'D3',
            source: 'GDPR Chapter V; ICO International Transfers Guidance'
        }
    ],
    9: [
        {
            question: 'An Advanced Persistent Threat (APT) is characterised by:',
            options: [
                'A) Being a one-off, low-skill attack',
                'B) Long-term, targeted operations by well-resourced adversaries (often state-sponsored) using multiple techniques to maintain access',
                'C) Only targeting individuals, not organisations',
                'D) Being easily stopped by antivirus alone'
            ],
            correct: 1,
            explanation: 'APTs use sustained campaigns, custom malware, and the full kill chain. They are typically nation-state or highly organised groups with the resources to develop zero-days and evade detection.',
            remediation: 'Defense in depth, threat intelligence, and detection at multiple kill chain stages are essential. Signature-based antivirus is insufficient; behavioural detection, segmentation, and incident response are critical.',
            specRef: 'D1, D4',
            source: 'NCSC APT Guidance; MITRE ATT&CK'
        },
        {
            question: 'The Cyber Kill Chain describes:',
            options: [
                'A) A single step that attackers use',
                'B) Seven stages: Reconnaissance, Weaponisation, Delivery, Exploitation, Installation, Command & Control, Actions on Objectives — each stage is an opportunity to detect and stop the attacker',
                'C) A type of malware',
                'D) Only physical attacks on data centres'
            ],
            correct: 1,
            explanation: 'Lockheed Martin\'s model helps defenders identify where they can break the attack. Defending at multiple stages (e.g. blocking delivery with email filters, detecting exploitation with IDS, preventing C2 with segmentation) improves resilience.',
            remediation: 'The NCSC Cyber Assessment Framework requires capabilities to detect and respond at multiple stages. No single control stops every attack — layering defences across the kill chain is the goal.',
            specRef: 'D4',
            source: 'Lockheed Martin Cyber Kill Chain; NCSC CAF'
        },
        {
            question: 'Threat intelligence sharing between organisations helps defence because:',
            options: [
                'A) It is illegal to share threat information',
                'B) Shared indicators and tactics allow defenders to anticipate and block attacks seen elsewhere before they reach their own systems',
                'C) Only governments can use threat intelligence',
                'D) It replaces the need for technical controls'
            ],
            correct: 1,
            explanation: 'The NCSC runs CiSP (Cyber Security Information Sharing Partnership) for UK organisations. Understanding attacker TTPs (tactics, techniques, procedures) helps defenders prioritise controls and detect novel attacks.',
            remediation: 'Threat intelligence complements — it does not replace — firewalls, IDS, and other controls. It informs what to look for and how to respond. NIS Regulations encourage information sharing between competent authorities and operators.',
            specRef: 'D4, D5',
            source: 'NCSC CiSP; NIS Regulations 2018'
        },
        {
            question: 'Zero-day exploits are especially dangerous in APT campaigns because:',
            options: [
                'A) They only work for one day',
                'B) No patch exists yet, so signature-based defences often fail — defence in depth and behavioural detection are needed',
                'C) They are only used by script kiddies',
                'D) Antivirus always detects them'
            ],
            correct: 1,
            explanation: 'Zero-days give attackers a window where no vendor patch exists. APT groups stockpile zero-days. Defence requires layered controls: segmentation, IDS/IPS for behaviour, patch management for when a fix is released.',
            remediation: 'Defence in depth means that when one control fails (e.g. no signature for a zero-day), others (network segmentation, least privilege, backup) can limit damage. The kill chain model helps identify multiple intervention points.',
            specRef: 'D1, D2, D4',
            source: 'NCSC Zero Day Guidance; Cyber Kill Chain'
        },
        {
            question: 'Incident response for a suspected APT compromise should include:',
            options: [
                'A) Immediately wiping all systems to remove the threat',
                'B) Containment, preservation of evidence for forensics, eradication of the threat, and recovery — plus understanding the full scope before declaring the incident over',
                'C) Only notifying the board after everything is fixed',
                'D) Paying the attacker to leave'
            ],
            correct: 1,
            explanation: 'APT actors often maintain long-term access. Full forensic analysis is needed to find all footholds. Premature declaration of "clean" can leave persistent access. Evidence preservation supports attribution and improving defences.',
            remediation: 'Wiping without evidence preservation loses forensic value and may miss reinfection. Notification obligations (GDPR, NIS, FCA) often require early reporting. Incident response plans must be tested and include forensics and communication.',
            specRef: 'D5',
            source: 'NIST SP 800-61; NCSC Incident Management'
        }
    ],
    10: [
        {
            question: 'When defending interconnected international or critical national infrastructure:',
            options: [
                'A) A single point of failure in one system can have cascading effects across borders and sectors',
                'B) Each nation\'s systems are completely independent',
                'C) Only technical controls are needed, not cross-border coordination',
                'D) Incident response can wait until the attack is fully understood'
            ],
            correct: 0,
            explanation: 'Critical infrastructure (energy, finance, transport, defence) is interconnected. A failure or compromise in one system can affect supply chains and other nations. Resilience requires both technical defence and cross-border coordination.',
            remediation: 'The Colonial Pipeline incident showed how one company\'s shutdown affected fuel supply across regions. NIS Regulations and international frameworks (e.g. NIST, ISO 27001) support coordination and baseline security for essential services.',
            specRef: 'D4, D5',
            source: 'NIS Regulations 2018; Colonial Pipeline (2021) Lessons'
        },
        {
            question: 'Operators of essential services under NIS Regulations must:',
            options: [
                'A) Only comply with GDPR',
                'B) Take appropriate technical and organisational measures to manage security risks, and report significant incidents to the competent authority',
                'C) Only report incidents to the public, not regulators',
                'D) Rely solely on their suppliers for security'
            ],
            correct: 1,
            explanation: 'NIS requires risk-based security measures and incident reporting. Competent authorities can issue guidance and enforce. This applies to energy, transport, health, water, digital infrastructure, and other essential sectors.',
            remediation: 'NIS complements GDPR and sector-specific regulation. The operator remains responsible for managing risk; suppliers must be assessed and contracted appropriately but cannot substitute for the operator\'s own governance.',
            specRef: 'D3',
            source: 'NIS Regulations 2018'
        },
        {
            question: 'A comprehensive cyber defence strategy for global or critical infrastructure should include:',
            options: [
                'A) Only firewalls and antivirus',
                'B) Technical controls (firewalls, IDS, encryption, segmentation), organisational policies, staff training, incident response planning, business continuity, and threat intelligence',
                'C) Only responding after an attack has succeeded',
                'D) Outsourcing all decisions to a single vendor'
            ],
            correct: 1,
            explanation: 'No single control is sufficient. Technical controls, human factors (training), governance (policies), and resilience (BCP, incident response) together provide defence in depth. Threat intelligence informs prioritisation.',
            remediation: 'The NCSC Cyber Assessment Framework and 10 Steps to Cyber Security describe this holistic approach. Global and critical infrastructure face sophisticated threats — comprehensive strategy is essential.',
            specRef: 'D2, D4, D5',
            source: 'NCSC CAF; 10 Steps to Cyber Security'
        },
        {
            question: 'Why is regular testing of backup and recovery procedures critical for critical infrastructure?',
            options: [
                'A) Backups never fail, so testing is optional',
                'B) Untested backups often fail when needed; regular exercises ensure data can be restored and operations recovered in a real incident',
                'C) Testing is only required once when the system is first built',
                'D) Recovery is the sole responsibility of the cloud provider'
            ],
            correct: 1,
            explanation: 'Backup corruption, misconfiguration, or outdated procedures are common. Organisations that test recovery annually recover significantly faster. Ransomware and destructive attacks make backup and tested recovery essential.',
            remediation: 'The 3-2-1 rule (3 copies, 2 media types, 1 offsite) and regular restore tests are baseline. For critical infrastructure, business continuity and disaster recovery plans must be exercised and updated.',
            specRef: 'D2, D5',
            source: 'NCSC Backup Guidance; BCI Horizon Scan'
        },
        {
            question: 'International frameworks such as ISO 27001 and the NIST Cybersecurity Framework help organisations:',
            options: [
                'A) They are only for certification and have no practical use',
                'B) They provide a structured approach to managing cyber risk and aligning security controls with business objectives, supporting consistency across borders',
                'C) They replace the need for UK law compliance',
                'D) They only apply to the public sector'
            ],
            correct: 1,
            explanation: 'ISO 27001 (ISMS) and NIST CSF offer risk-based frameworks that organisations can adopt to structure their security programme. They support compliance with laws like GDPR and NIS by providing a systematic way to implement controls.',
            remediation: 'UK organisations must still comply with DPA 2018, GDPR, NIS, and sector regulation. International frameworks are tools to achieve that — they do not replace legal obligations. They aid consistency when operating across jurisdictions.',
            specRef: 'D3, D4',
            source: 'ISO/IEC 27001; NIST CSF 2.0'
        }
    ]
};

// --- Real-World Case Studies ---
export const CASE_STUDIES = {
    1: {
        title: 'Real Case: 2020 Twitter Social Engineering Attack',
        summary: 'In July 2020, attackers used phone-based social engineering to trick Twitter employees into providing access to internal tools. They hijacked 130 high-profile accounts (including Barack Obama and Elon Musk) and stole over $100,000 in Bitcoin.',
        lesson: 'Even the world\'s largest tech companies are vulnerable to social engineering. Email filters and security training are essential defenses.',
        specLink: 'D1: Social engineering is a key threat type; D2: Training and email filters are critical controls'
    },
    2: {
        title: 'Real Case: 2023 MOVEit School Data Breach',
        summary: 'A vulnerability in MOVEit file transfer software allowed attackers to access data from thousands of organisations including UK schools. Student personal information including names, addresses, and special educational needs data was compromised.',
        lesson: 'Schools hold sensitive special category data about children. Multiple entry points and third-party software create additional risks that require layered security.',
        specLink: 'D1: Supply chain attacks; D3: Special category data under DPA 2018; D4: Defense in depth'
    },
    3: {
        title: 'Real Case: 2017 WannaCry NHS Attack',
        summary: 'The WannaCry ransomware attack affected 80 NHS trusts across England. 19,000 appointments were cancelled, 600 GP surgeries were affected, and 5 hospitals had to divert ambulances. The NHS was particularly vulnerable because many systems ran unpatched Windows XP.',
        lesson: 'Ransomware in healthcare can endanger lives. Regular backups, patch management, and business continuity plans are critical for survival.',
        specLink: 'D1: Ransomware threats; D2: Backup and patch management; D5: Business continuity'
    },
    4: {
        title: 'Real Case: 2015 TalkTalk Data Breach',
        summary: 'TalkTalk suffered a SQL injection attack that exposed personal data of 157,000 customers, including bank account details. The attack was carried out by teenagers. TalkTalk was fined \u00A3400,000 by the ICO for failing to implement basic security measures like patching known SQL injection vulnerabilities.',
        lesson: 'SQL injection is a well-known, preventable vulnerability. Organisations that fail to implement basic security measures face significant fines and reputational damage.',
        specLink: 'D1: SQL injection; D2: Patch management; D3: DPA/GDPR fines'
    },
    5: {
        title: 'Real Case: 2020 SolarWinds Government Hack',
        summary: 'State-sponsored attackers compromised SolarWinds\' software update system, embedding malware that was distributed to 18,000 organisations including multiple US government agencies. The attack went undetected for 9 months.',
        lesson: 'Sophisticated attackers target supply chains to bypass perimeter defenses. Continuous monitoring (IDS/IPS), security training, and defense in depth are essential for government agencies.',
        specLink: 'D1: Advanced persistent threats; D2: IDS/IPS and monitoring; D4: Defense in depth; D5: Business continuity'
    },
    6: {
        title: 'Real Case: 2015 Ukraine Power Grid Attack',
        summary: 'Attackers used phishing emails to gain access to Ukrainian power company networks. They then used the access to remotely switch off power substations, leaving 230,000 people without electricity for up to 6 hours. This was the first confirmed cyber attack on a power grid.',
        lesson: 'Critical infrastructure attacks can affect millions and have physical consequences. Every layer of defense matters \u2013 the initial access was through a simple phishing email.',
        specLink: 'D1: All threat types; D2: All security controls; D3: NIS Regulations; D4: Defense in depth; D5: Business continuity'
    },
    7: {
        title: 'Real Case: 2013 Target Payment Card Breach',
        summary: 'Attackers stole 40 million credit and debit card numbers and 70 million customer records from Target by first compromising a heating contractor with network access, then moving laterally to the payment system. The breach went undetected for weeks.',
        lesson: 'Financial and payment data require PCI-DSS controls: network segmentation to isolate cardholder data, encryption, access control, and continuous monitoring. Third-party access creates additional entry points that must be secured.',
        specLink: 'D1: Malware, SQL injection; D2: Segmentation, encryption, access control, IDS; D3: PCI-DSS; D4: Defense in depth; D5: Incident response'
    },
    8: {
        title: 'Real Case: 2019 Capital One Cloud Misconfiguration',
        summary: 'A single misconfigured firewall on a cloud-hosted web application allowed an attacker to access over 100 million customer records stored in an AWS S3 bucket. The attacker exploited a server-side request forgery (SSRF) vulnerability to obtain IAM credentials.',
        lesson: 'In the cloud, the shared responsibility model means customers must secure their data and access controls. Misconfigured firewalls, over-privileged IAM roles, and insufficient network segmentation can expose entire tenant environments.',
        specLink: 'D1: Unauthorised access; D2: Access control, encryption, segmentation; D3: DPA 2018, GDPR; D4: Defense in depth; D5: Incident response'
    },
    9: {
        title: 'Real Case: 2017 NotPetya Destructive Malware',
        summary: 'NotPetya, attributed to state-sponsored actors, spread globally through a compromised software update. It encrypted and destroyed data across Maersk, Merck, FedEx and others, causing over $10 billion in damage. It was designed to disrupt, not to ransom.',
        lesson: 'Advanced persistent threats use the full kill chain: supply chain compromise for delivery, credential theft, lateral movement, and destructive payloads. Defense in depth, segmentation, backup, and threat intelligence are essential to detect and contain APT activity.',
        specLink: 'D1: Malware, ransomware-style, zero-day; D2: Patch management, backup, IDS; D4: Defense in depth; D5: Business continuity, incident response'
    },
    10: {
        title: 'Real Case: 2021 Colonial Pipeline Ransomware',
        summary: 'A ransomware attack on Colonial Pipeline, which supplies 45% of fuel to the US East Coast, forced the company to shut down 5,500 miles of pipeline. Panic buying and fuel shortages followed. The company paid a ransom; recovery still took days and required coordination across government and industry.',
        lesson: 'Critical national infrastructure is a high-value target. A single point of failure can have international impact. Layered defences, segmentation, backup, and tested incident response and business continuity plans are essential for operators of essential services.',
        specLink: 'D1: Ransomware, all threat types; D2: All controls; D3: NIS Regulations, GDPR; D4: Defense in depth; D5: Business continuity, incident response'
    }
};

// --- "Did You Know?" Educational Tips ---
export const DID_YOU_KNOW_TIPS = [
    // D1 — Threats
    { tip: '91% of cyber attacks begin with a phishing email. Email filters and staff training are your best first defenses.', specRef: 'D1, D2', source: 'Deloitte Cyber Review, 2020' },
    { tip: 'Insider threats account for 25% of data breaches. Access control and the principle of least privilege are key defenses.', specRef: 'D1, D2', source: 'Verizon DBIR, 2023' },
    { tip: '"Zero-day" means zero days to fix the vulnerability before exploitation. Patch management reduces your exposure window once a fix exists.', specRef: 'D1, D2', source: 'NCSC Glossary, 2024' },
    { tip: 'Social engineering exploits human psychology rather than technical vulnerabilities. Even the best technology can\'t fully prevent it without training.', specRef: 'D1, D2', source: 'NCSC Social Engineering Guidance, 2023' },
    { tip: 'SQL injection is in the OWASP Top 10 most critical web vulnerabilities. Input validation and parameterised queries prevent it entirely.', specRef: 'D1, D2', source: 'OWASP Top 10, 2021' },
    { tip: 'DDoS attacks can generate over 1 Tbps of traffic. Cloud-based mitigation and IDS/IPS are the primary defenses.', specRef: 'D1, D2', source: 'Cloudflare DDoS Report, 2023' },
    // D2 — Security Controls
    { tip: 'Multi-factor authentication (MFA) blocks 99.9% of automated account compromise attacks.', specRef: 'D2', source: 'Microsoft Security Blog, 2019' },
    { tip: 'A firewall examines network packets and allows or blocks them based on predefined security rules. It is the first line of network defense.', specRef: 'D2', source: 'NCSC Cyber Essentials, 2024' },
    { tip: 'IDS detects suspicious activity; IPS can automatically block it. Together, they provide real-time threat monitoring and response.', specRef: 'D2', source: 'NIST SP 800-94, 2012' },
    { tip: 'Encryption converts readable plaintext into unreadable ciphertext. AES-256 would take billions of years to crack with current technology.', specRef: 'D2', source: 'NIST Encryption Standards, 2023' },
    { tip: 'Security awareness training reduces phishing success rates by 50\u201370%. Humans are often the weakest link \u2013 training strengthens them.', specRef: 'D2', source: 'KnowBe4 Phishing Benchmark Report, 2023' },
    // D3 — Legislation
    { tip: 'GDPR requires breach notification within 72 hours. Having an incident response plan ready saves critical time.', specRef: 'D3', source: 'GDPR Article 33, 2018' },
    { tip: 'Under the Computer Misuse Act 1990, creating malware carries a sentence of up to 10 years in prison (Section 3A).', specRef: 'D3', source: 'CMA 1990 (as amended by PJA 2006)' },
    { tip: 'The DPA 2018 lists 6 principles: lawfulness, purpose limitation, data minimisation, accuracy, storage limitation, and security.', specRef: 'D3', source: 'DPA 2018, Schedule 1' },
    { tip: 'The ICO (Information Commissioner\'s Office) enforces UK data protection laws and can issue fines up to \u00A317.5 million or 4% of global turnover.', specRef: 'D3', source: 'ICO Regulatory Action Policy, 2022' },
    { tip: 'Under GDPR, children\'s data requires additional protection. Schools and youth organisations must implement enhanced safeguards.', specRef: 'D3', source: 'GDPR Article 8, ICO Children\'s Code, 2020' },
    // D4 — Defense in Depth
    { tip: 'Defense in depth means no single point of failure. Like a castle with moat, walls, guards, and a keep \u2013 if one fails, others protect.', specRef: 'D4', source: 'NCSC 10 Steps to Cyber Security, 2021' },
    { tip: 'The three types of security control are: technical (firewalls, encryption), procedural (policies, processes), and physical (locks, CCTV).', specRef: 'D4', source: 'NCSC Cyber Assessment Framework, 2022' },
    // D5 — Business Continuity
    { tip: 'The average cost of a data breach in the UK is \u00A33.4 million. Prevention is far cheaper than recovery.', specRef: 'D5', source: 'IBM Cost of a Data Breach Report, 2023' },
    { tip: 'The 3-2-1 backup rule: 3 copies of data, 2 different storage types, 1 copy offsite. This ensures recovery from any disaster.', specRef: 'D2, D5', source: 'US-CERT / CISA Backup Guidance, 2022' },
    { tip: 'The WannaCry ransomware attack cost the NHS an estimated \u00A392 million. Regular patching could have prevented it.', specRef: 'D1, D5', source: 'DHSC / NAO WannaCry Investigation, 2018' },
    { tip: 'Business continuity planning (BCP) ensures operations continue during a crisis. Organisations that test annually recover 50% faster.', specRef: 'D5', source: 'BCI Horizon Scan Report, 2023' }
];

// --- BTEC Specification Mapping (Learning Aim D Knowledge Tracker) ---
export const SPEC_TOPICS = [
    {
        id: 'D1',
        title: 'D1: Threats to Data and Information',
        subtopics: [
            { id: 'D1.1', name: 'Malware (viruses, worms, spyware)', coveredInLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], coveredByThreats: ['malware'] },
            { id: 'D1.2', name: 'Phishing and social engineering', coveredInLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], coveredByThreats: ['phishing'] },
            { id: 'D1.3', name: 'Ransomware', coveredInLevels: [3, 4, 5, 6, 7, 8, 9, 10], coveredByThreats: ['ransomware'] },
            { id: 'D1.4', name: 'DDoS attacks', coveredInLevels: [2, 4, 5, 6, 7, 8, 9, 10], coveredByThreats: ['ddos'] },
            { id: 'D1.5', name: 'SQL injection', coveredInLevels: [4, 5, 6, 7, 8, 9, 10], coveredByThreats: ['sqlInjection'] },
            { id: 'D1.6', name: 'Trojan horses', coveredInLevels: [2, 3, 4, 5, 6, 7, 8, 9, 10], coveredByThreats: ['trojan'] },
            { id: 'D1.7', name: 'Insider threats', coveredInLevels: [2, 3, 4, 5, 6, 7, 8, 9, 10], coveredByThreats: ['insider'] },
            { id: 'D1.8', name: 'Zero-day exploits', coveredInLevels: [3, 5, 6, 7, 8, 9, 10], coveredByThreats: ['zeroDay'] }
        ]
    },
    {
        id: 'D2',
        title: 'D2: Security Controls and Protection',
        subtopics: [
            { id: 'D2.1', name: 'Firewalls', coveredInLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], coveredByTowers: ['firewall'] },
            { id: 'D2.2', name: 'Antivirus / anti-malware', coveredInLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], coveredByTowers: ['antivirus'] },
            { id: 'D2.3', name: 'Email filtering', coveredInLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], coveredByTowers: ['emailFilter'] },
            { id: 'D2.4', name: 'Encryption', coveredInLevels: [2, 3, 4, 5, 6, 7, 8, 9, 10], coveredByTowers: ['encryption'] },
            { id: 'D2.5', name: 'Intrusion detection/prevention (IDS/IPS)', coveredInLevels: [3, 4, 5, 6, 7, 8, 9, 10], coveredByTowers: ['ids'] },
            { id: 'D2.6', name: 'Access control and authentication', coveredInLevels: [2, 3, 4, 5, 6, 7, 8, 9, 10], coveredByTowers: ['accessControl'] },
            { id: 'D2.7', name: 'Backup systems', coveredInLevels: [3, 4, 5, 6, 7, 8, 9, 10], coveredByTowers: ['backup'] },
            { id: 'D2.8', name: 'Security awareness training', coveredInLevels: [5, 6, 7, 8, 9, 10], coveredByTowers: ['training'] },
            { id: 'D2.9', name: 'Patch management', coveredInLevels: [4, 5, 6, 7, 8, 9, 10], coveredByTowers: ['patchMgmt'] }
        ]
    },
    {
        id: 'D3',
        title: 'D3: Legislation and Compliance',
        subtopics: [
            { id: 'D3.1', name: 'GDPR (General Data Protection Regulation)', coveredInLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
            { id: 'D3.2', name: 'Data Protection Act 2018', coveredInLevels: [1, 2, 3, 4, 5, 7, 8, 10] },
            { id: 'D3.3', name: 'Computer Misuse Act 1990', coveredInLevels: [2, 4, 5, 6, 9, 10] },
            { id: 'D3.4', name: 'NIS Regulations 2018', coveredInLevels: [5, 6, 8, 9, 10] },
            { id: 'D3.5', name: 'PCI-DSS (Payment Card Industry)', coveredInLevels: [7] },
            { id: 'D3.6', name: 'ISO 27001 / NIST Framework', coveredInLevels: [10] }
        ]
    },
    {
        id: 'D4',
        title: 'D4: Defense in Depth / Layered Security',
        subtopics: [
            { id: 'D4.1', name: 'Combining multiple security controls', coveredInLevels: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
            { id: 'D4.2', name: 'Physical, technical, and procedural controls', coveredInLevels: [5, 6, 9, 10] },
            { id: 'D4.3', name: 'Evaluating security solutions', coveredInLevels: [3, 4, 5, 6, 7, 8, 9, 10] }
        ]
    },
    {
        id: 'D5',
        title: 'D5: Business Continuity & Disaster Recovery',
        subtopics: [
            { id: 'D5.1', name: 'Backup and recovery procedures', coveredInLevels: [3, 4, 5, 6, 7, 8, 9, 10] },
            { id: 'D5.2', name: 'Business impact analysis', coveredInLevels: [3, 4, 5, 8, 10] },
            { id: 'D5.3', name: 'Incident response planning', coveredInLevels: [5, 6, 7, 9, 10] }
        ]
    }
];

// --- Achievements ---
export const ACHIEVEMENTS = [
    { id: 'first_win', name: 'First Victory', description: 'Complete your first level', icon: '\uD83C\uDFC6', condition: 'levels_completed >= 1' },
    { id: 'all_levels', name: 'Cyber Expert', description: 'Complete all levels', icon: '\uD83C\uDF1F', condition: 'levels_completed_all' },
    { id: 'no_damage', name: 'Impenetrable', description: 'Complete a level without any asset damage', icon: '\uD83D\uDEE1', condition: 'no_damage_level' },
    { id: 'budget_master', name: 'Budget Master', description: 'Complete a level with over 50% budget remaining', icon: '\uD83D\uDCB0', condition: 'budget_remaining_50' },
    { id: 'synergy_perimeter', name: 'Perimeter Pair', description: 'Use Firewall and IDS/IPS together in one level', icon: '\uD83D\uDEE1', condition: 'synergy_firewall_ids' },
    { id: 'synergy_data', name: 'Data Defense', description: 'Use Encryption and Backup together in one level', icon: '\uD83D\uDD12', condition: 'synergy_encryption_backup' },
    { id: 'synergy_channel', name: 'Secure Channel', description: 'Use Proxy and Encryption together in one level', icon: '\u27A1', condition: 'synergy_proxy_encryption' },
    { id: 'synergy_contain', name: 'Contain and Recover', description: 'Use Quarantine and Backup together in one level', icon: '\uD83D\uDD06', condition: 'synergy_quarantine_backup' },
    { id: 'layered', name: 'Defense in Depth', description: 'Use 5 different tower types in one level', icon: '\uD83C\uDFEF', condition: 'tower_variety_5' },
    { id: 'all_towers', name: 'Full Arsenal', description: 'Use all tower types across your games', icon: '\u2694', condition: 'all_towers_used' },
    { id: 'encyclopedist', name: 'Knowledge is Power', description: 'Read all encyclopedia entries', icon: '\uD83D\uDCDA', condition: 'all_encyclopedia_read' },
    { id: 'high_score', name: 'High Scorer', description: 'Achieve a score of 10,000 or more', icon: '\uD83D\uDCC8', condition: 'score_10000' },
    { id: 'ransomware_survivor', name: 'Ransomware Survivor', description: 'Defeat 10 ransomware threats across all games', icon: '\uD83D\uDD12', condition: 'ransomware_kills_10' }
];
