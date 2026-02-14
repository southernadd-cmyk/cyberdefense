// ========================================
// CYBER DEFENSE SIMULATOR - GAME CONFIG
// All game data, constants, and definitions
// ========================================

// --- Grid & Canvas Settings ---
export const CELL_SIZE = 48;
export const GRID_COLS = 20;
export const GRID_ROWS = 12;
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;   // 960
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE;  // 576

// --- Cell Types ---
export const CELL = {
    EMPTY: 0,
    PATH: 1,
    SPAWN: 2,
    ASSET: 3,
    BLOCKED: 4
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
            zeroDay: 0.3        // Unknown attack signatures bypass firewall rules
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
            zeroDay: 0.2        // Unknown signatures - AV relies on known patterns (80% resist)
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
            zeroDay: 0.2        // Sandbox analysis may catch some unknown threats
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
            zeroDay: 1.0        // Behavioural analysis catches unknown attack patterns
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
            zeroDay: 0.3        // Some protection through least privilege
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
    zeroDay:       { strongCounters: ['patchMgmt', 'ids'], weakCounters: ['firewall', 'accessControl'], immune: ['antivirus', 'emailFilter'] }
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
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup'],
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
            { threats: [{ type: 'ransomware', count: 2, interval: 3000, path: 0 }, { type: 'malware', count: 6, interval: 1000, path: 1 }] },
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
            { wave: 3, title: 'Ransomware & Business Continuity', text: 'Ransomware encrypts data and demands payment. In healthcare, this can prevent access to patient records and disrupt treatment. Backup systems allow recovery without paying the ransom.', legislation: 'GDPR requires organizations to ensure the ability to restore access to personal data in a timely manner (Article 32). The Data Protection Act 2018 reinforces this requirement.' }
        ]
    },
    {
        id: 4,
        name: 'E-Commerce Platform',
        description: 'Protect an online store handling payment card data. SQL injection is a major risk.',
        scenario: 'An e-commerce company processes thousands of transactions daily. They store customer personal data and payment information. SQL injection attacks could expose payment card data, leading to massive fines and loss of customer trust. Build a comprehensive security infrastructure.',
        difficulty: 4,
        startingBudget: 5000,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'patchMgmt'],
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
            { threats: [{ type: 'sqlInjection', count: 6, interval: 1500, path: 0 }, { type: 'trojan', count: 5, interval: 1500, path: 1 }, { type: 'phishing', count: 10, interval: 600, path: 2 }] },
            { threats: [{ type: 'insider', count: 3, interval: 2500, path: 1 }, { type: 'ransomware', count: 3, interval: 3000, path: 0 }, { type: 'sqlInjection', count: 5, interval: 1500, path: 2 }] },
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
            { wave: 2, title: 'SQL Injection Attacks', text: 'SQL injection inserts malicious database commands through web forms. This can expose, modify, or delete entire databases. Input validation and parameterized queries are essential defenses.', legislation: 'Under GDPR, organizations must implement appropriate technical measures to protect data. Failure to prevent SQL injection may be considered negligence.' }
        ]
    },
    {
        id: 5,
        name: 'Government Agency',
        description: 'Protect classified government systems. Business continuity is paramount.',
        scenario: 'A government agency handles classified information and citizen data. They face sophisticated attacks from multiple threat actors. Business continuity planning is critical - any downtime affects public services. Implement comprehensive security with emphasis on disaster recovery.',
        difficulty: 5,
        startingBudget: 6000,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'training', 'patchMgmt'],
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
            { threats: [{ type: 'ransomware', count: 4, interval: 2500, path: 0 }, { type: 'sqlInjection', count: 5, interval: 1500, path: 1 }, { type: 'zeroDay', count: 2, interval: 3000, path: 2 }] },
            { threats: [{ type: 'zeroDay', count: 4, interval: 2000, path: 0 }, { type: 'insider', count: 4, interval: 2000, path: 1 }, { type: 'ransomware', count: 3, interval: 2500, path: 2 }, { type: 'ddos', count: 20, interval: 250, path: 0 }] },
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
            { wave: 3, title: 'Business Continuity', text: 'Business continuity planning ensures an organization can continue operating during and after a security incident. This includes backup systems, disaster recovery plans, and incident response procedures.', legislation: 'The Network and Information Systems Regulations 2018 require operators of essential services to have appropriate measures for business continuity.' }
        ]
    },
    {
        id: 6,
        name: 'Critical Infrastructure',
        description: 'Protect power grid control systems. The ultimate test of your cyber defense skills.',
        scenario: 'You are tasked with defending a critical national infrastructure provider. Their systems control power distribution for millions of people. All known threat types are active, and attackers are highly sophisticated. Deploy every defense at your disposal and demonstrate mastery of layered security.',
        difficulty: 6,
        startingBudget: 7500,
        availableTowers: ['firewall', 'antivirus', 'emailFilter', 'encryption', 'ids', 'accessControl', 'backup', 'training', 'patchMgmt'],
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
            { threats: [{ type: 'ddos', count: 20, interval: 300, path: 0 }, { type: 'phishing', count: 10, interval: 700, path: 1 }, { type: 'malware', count: 6, interval: 1200, path: 2 }] },
            { threats: [{ type: 'trojan', count: 6, interval: 1500, path: 0 }, { type: 'insider', count: 4, interval: 2000, path: 1 }, { type: 'sqlInjection', count: 5, interval: 1500, path: 2 }] },
            { threats: [{ type: 'ransomware', count: 5, interval: 2000, path: 0 }, { type: 'zeroDay', count: 4, interval: 2000, path: 1 }, { type: 'malware', count: 10, interval: 800, path: 2 }] },
            { threats: [{ type: 'zeroDay', count: 6, interval: 1500, path: 0 }, { type: 'ransomware', count: 5, interval: 1800, path: 1 }, { type: 'insider', count: 5, interval: 1500, path: 2 }, { type: 'ddos', count: 25, interval: 200, path: 0 }] },
            { threats: [{ type: 'zeroDay', count: 8, interval: 1200, path: 0 }, { type: 'ransomware', count: 6, interval: 1500, path: 1 }, { type: 'insider', count: 6, interval: 1200, path: 2 }, { type: 'sqlInjection', count: 8, interval: 1000, path: 0 }, { type: 'phishing', count: 15, interval: 400, path: 1 }, { type: 'malware', count: 12, interval: 600, path: 2 }] }
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
            { wave: 2, title: 'Advanced Persistent Threats', text: 'Sophisticated attackers use multiple techniques simultaneously to overwhelm defenses. Only a comprehensive, layered security approach can protect against these coordinated attacks.', legislation: 'The Network and Information Systems Regulations 2018 specifically address security for operators of essential services and digital service providers.' }
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

function getPreventionText(threatType) {
    const preventions = {
        phishing: 'Email filters, security training, and multi-factor authentication are key defenses against phishing.',
        malware: 'Antivirus software, firewalls, and regular system updates help prevent malware infections.',
        ransomware: 'Regular backups, email filtering, and user training are the best defenses. Never pay the ransom.',
        ddos: 'IDS/IPS systems, firewalls, and traffic analysis can detect and mitigate DDoS attacks.',
        sqlInjection: 'Input validation, parameterized queries, patch management, and web application firewalls prevent SQL injection.',
        trojan: 'Antivirus software, access controls, and user training help detect and prevent trojans.',
        insider: 'Access controls, user monitoring, security training, and the principle of least privilege reduce insider threat risk.',
        zeroDay: 'Patch management, AI-based detection, IDS/IPS, and defense in depth provide the best protection against zero-days.'
    };
    return preventions[threatType] || '';
}

// --- Quiz Questions (BTEC exam-style, per level) ---
export const QUIZ_QUESTIONS = {
    // General pool (can appear on any level)
    general: [
        {
            question: 'Which of the following is the MOST common method used by cyber criminals to gain initial access to a network?',
            options: ['A) DDoS attack', 'B) Phishing email', 'C) Zero-day exploit', 'D) Physical break-in'],
            correct: 1,
            explanation: 'Phishing emails are responsible for over 80% of reported security incidents. They trick users into clicking malicious links or revealing credentials.',
            specRef: 'D1 - Threats to data'
        },
        {
            question: 'Under GDPR, how long does an organisation have to report a data breach to the ICO?',
            options: ['A) 24 hours', 'B) 48 hours', 'C) 72 hours', 'D) 7 days'],
            correct: 2,
            explanation: 'GDPR Article 33 requires notification to the supervisory authority within 72 hours of becoming aware of a personal data breach.',
            specRef: 'D3 - Legislation'
        },
        {
            question: 'What is the maximum fine for a serious GDPR violation?',
            options: ['A) \u00A31 million', 'B) \u00A310 million or 2% of turnover', 'C) \u20AC20 million or 4% of turnover', 'D) Unlimited'],
            correct: 2,
            explanation: 'The most serious GDPR violations can result in fines of up to \u20AC20 million or 4% of global annual turnover, whichever is higher.',
            specRef: 'D3 - Legislation'
        },
        {
            question: 'Which security principle involves using multiple layers of different security controls?',
            options: ['A) Least privilege', 'B) Defense in depth', 'C) Zero trust', 'D) Separation of duties'],
            correct: 1,
            explanation: 'Defense in depth uses multiple layers of security controls so that if one layer fails, the next layer provides protection. This is a core concept in D4.',
            specRef: 'D4 - Defense in depth'
        },
        {
            question: 'What does the Computer Misuse Act 1990 make illegal?',
            options: ['A) Only hacking government systems', 'B) Unauthorized access to computer material', 'C) Sharing passwords with colleagues', 'D) Using personal devices for work'],
            correct: 1,
            explanation: 'Section 1 of the Computer Misuse Act 1990 makes unauthorized access to computer material a criminal offence, punishable by up to 2 years imprisonment.',
            specRef: 'D3 - Legislation'
        }
    ],
    // Level-specific questions
    1: [
        {
            question: 'A small business receives an email claiming to be from their bank, asking them to verify their account details. What type of attack is this?',
            options: ['A) Ransomware', 'B) DDoS attack', 'C) Phishing', 'D) SQL injection'],
            correct: 2,
            explanation: 'This is phishing \u2013 a social engineering attack that impersonates a trusted entity to trick victims into revealing sensitive information.',
            specRef: 'D1 - Threats to data'
        },
        {
            question: 'Which defense is MOST effective against phishing emails?',
            options: ['A) Firewall only', 'B) Stronger passwords', 'C) Email filtering combined with staff training', 'D) Faster internet connection'],
            correct: 2,
            explanation: 'Email filters catch technical indicators, but staff training ensures employees recognise phishing attempts that bypass filters. The combination is most effective.',
            specRef: 'D2 - Security controls'
        },
        {
            question: 'Why does a firewall alone NOT provide complete protection for a small business?',
            options: ['A) Firewalls are too expensive', 'B) Some threats like phishing bypass network-level controls', 'C) Firewalls only work on weekdays', 'D) Small businesses don\'t need firewalls'],
            correct: 1,
            explanation: 'Phishing emails arrive through legitimate email channels and bypass firewalls. This demonstrates why defense in depth (multiple security layers) is essential.',
            specRef: 'D4 - Defense in depth'
        },
        {
            question: 'Under the Data Protection Act 2018, a small shop that stores customer email addresses must:',
            options: ['A) Do nothing special \u2013 email addresses aren\'t personal data', 'B) Implement appropriate security measures to protect this data', 'C) Only protect data stored on paper', 'D) Share the data freely with other businesses'],
            correct: 1,
            explanation: 'Email addresses are personal data under the DPA 2018. Any organisation processing personal data must implement appropriate security measures.',
            specRef: 'D3 - Legislation'
        }
    ],
    2: [
        {
            question: 'A school stores student medical records. Under GDPR, this data is classified as:',
            options: ['A) Standard personal data', 'B) Special category data', 'C) Public information', 'D) Business data'],
            correct: 1,
            explanation: 'Health data is classified as "special category data" under GDPR Article 9, requiring additional protections and a specific lawful basis for processing.',
            specRef: 'D3 - Legislation'
        },
        {
            question: 'An employee uses their authorised login to access student records they have no legitimate reason to view. This violates:',
            options: ['A) Only school policy', 'B) The Computer Misuse Act 1990, Section 1', 'C) No law \u2013 they have a valid login', 'D) GDPR only'],
            correct: 1,
            explanation: 'Exceeding authorised access is an offence under Section 1 of the Computer Misuse Act 1990 \u2013 even if you have a valid login, accessing data beyond your authorisation is illegal.',
            specRef: 'D3 - Legislation'
        },
        {
            question: 'What is the PRIMARY purpose of access control in a school network?',
            options: ['A) Making the network faster', 'B) Ensuring only authorised users can access specific data', 'C) Blocking all external traffic', 'D) Reducing electricity costs'],
            correct: 1,
            explanation: 'Access control implements the principle of least privilege \u2013 users can only access the data and systems they need for their role.',
            specRef: 'D2 - Security controls'
        },
        {
            question: 'Explain why encrypting a student database provides protection even if a hacker breaches the network.',
            options: ['A) Encryption makes the database invisible', 'B) The stolen data would be unreadable without the decryption key', 'C) Encryption prevents all hacking attempts', 'D) It doesn\'t \u2013 encryption only works on physical theft'],
            correct: 1,
            explanation: 'Encryption converts data into unreadable ciphertext. Even if an attacker exfiltrates encrypted data, they cannot read it without the decryption key. This is a key defense in depth measure.',
            specRef: 'D2 - Security controls'
        }
    ],
    3: [
        {
            question: 'In 2017, the WannaCry ransomware attack affected NHS hospitals. What was the PRIMARY impact?',
            options: ['A) Hospitals lost internet access', 'B) Patient records were encrypted, disrupting treatment and operations', 'C) Only financial records were affected', 'D) The attack only lasted a few minutes'],
            correct: 1,
            explanation: 'WannaCry encrypted hospital systems, forcing cancellation of 19,000 appointments and operations. This demonstrates how ransomware can have life-threatening consequences in healthcare.',
            specRef: 'D1 - Threats to data'
        },
        {
            question: 'Which security control is the MOST critical defense against ransomware?',
            options: ['A) Antivirus software', 'B) Stronger passwords', 'C) Regular, tested backups', 'D) Faster internet'],
            correct: 2,
            explanation: 'While prevention is important, regular backups ensure data can be restored without paying the ransom. The 3-2-1 rule recommends 3 copies, 2 media types, 1 offsite.',
            specRef: 'D5 - Business continuity'
        },
        {
            question: 'Why is healthcare data considered "special category data" under GDPR?',
            options: ['A) It\'s stored in hospitals', 'B) It reveals sensitive information about health conditions that could cause discrimination', 'C) Doctors request special treatment', 'D) It\'s always stored on paper'],
            correct: 1,
            explanation: 'GDPR Article 9 classifies health data as special category because its misuse could lead to discrimination or significant harm. Extra safeguards are required.',
            specRef: 'D3 - Legislation'
        },
        {
            question: 'A business continuity plan for a hospital should include:',
            options: ['A) Plans to close the hospital during an attack', 'B) Backup systems, disaster recovery procedures, and incident response plans', 'C) Only financial backup plans', 'D) A plan to pay any ransom demanded'],
            correct: 1,
            explanation: 'Business continuity planning ensures critical services continue during and after incidents. For healthcare, this includes backup systems, manual procedures, and tested recovery plans.',
            specRef: 'D5 - Business continuity'
        }
    ],
    4: [
        {
            question: 'An e-commerce website is vulnerable to SQL injection. What could an attacker potentially access?',
            options: ['A) Only the website\'s images', 'B) The entire customer database including payment card details', 'C) Only public information', 'D) The physical server room'],
            correct: 1,
            explanation: 'SQL injection can give attackers full access to backend databases, potentially exposing all stored data including personal details, passwords, and payment information.',
            specRef: 'D1 - Threats to data'
        },
        {
            question: 'In 2015, the TalkTalk data breach exposed 157,000 customer records. Which regulation resulted in a \u00A3400,000 fine?',
            options: ['A) Computer Misuse Act 1990', 'B) The Data Protection Act', 'C) Employment law', 'D) Consumer Rights Act'],
            correct: 1,
            explanation: 'TalkTalk was fined \u00A3400,000 under the Data Protection Act for failing to implement basic security measures. Under GDPR (introduced later), the fine could have been significantly higher.',
            specRef: 'D3 - Legislation'
        },
        {
            question: 'Which combination of security controls would BEST protect an e-commerce database?',
            options: ['A) Firewall only', 'B) Encryption + patch management + IDS/IPS + access control', 'C) Just a stronger password', 'D) Disconnecting from the internet'],
            correct: 1,
            explanation: 'Multiple overlapping controls (defense in depth) provide the best protection: encryption protects data at rest, patch management prevents known exploits, IDS/IPS monitors for attacks, and access control limits who can reach the database.',
            specRef: 'D4 - Defense in depth'
        }
    ],
    5: [
        {
            question: 'Why is security awareness training considered one of the most cost-effective security measures?',
            options: ['A) It\'s free', 'B) It reduces the success rate of social engineering attacks by up to 70%', 'C) It replaces all technical controls', 'D) Employees already know everything about security'],
            correct: 1,
            explanation: 'Humans are often the weakest link. Training reduces phishing success rates by 50-70% and creates a security-aware culture that complements technical controls.',
            specRef: 'D2 - Security controls'
        },
        {
            question: 'The Network and Information Systems (NIS) Regulations 2018 specifically apply to:',
            options: ['A) All UK businesses', 'B) Operators of essential services and digital service providers', 'C) Only government agencies', 'D) Only private companies'],
            correct: 1,
            explanation: 'The NIS Regulations 2018 apply to operators of essential services (energy, transport, health, water, digital infrastructure) and relevant digital service providers.',
            specRef: 'D3 - Legislation'
        },
        {
            question: 'Evaluate why a government agency needs both technical controls AND organisational policies for effective security.',
            options: [
                'A) Technical controls alone are sufficient',
                'B) Technical controls prevent attacks while policies ensure correct human behaviour, creating comprehensive protection',
                'C) Policies are only needed for legal compliance',
                'D) Organisational policies replace the need for technology'
            ],
            correct: 1,
            explanation: 'Effective security combines technical measures (firewalls, encryption) with organisational measures (policies, training, access procedures). Neither alone is sufficient \u2013 this is the essence of defense in depth.',
            specRef: 'D4 - Defense in depth'
        }
    ],
    6: [
        {
            question: 'Explain why critical infrastructure (e.g., power grids) requires a higher level of cyber security than a typical business.',
            options: [
                'A) It doesn\'t \u2013 all businesses need the same security',
                'B) Compromise could affect millions of people and endanger lives',
                'C) Critical infrastructure uses older technology',
                'D) Government funding covers all costs'
            ],
            correct: 1,
            explanation: 'Critical infrastructure attacks can cause physical damage, endanger lives, and affect millions. The 2015 Ukraine power grid attack left 230,000 people without electricity.',
            specRef: 'D1 - Threats to data'
        },
        {
            question: 'Looking at ALL the defenses you\'ve used throughout this game, explain the concept of "defense in depth".',
            options: [
                'A) Using one very strong firewall',
                'B) Multiple overlapping security layers so that if one fails, others still provide protection',
                'C) Spending the maximum budget on security',
                'D) Only using passive defenses'
            ],
            correct: 1,
            explanation: 'Defense in depth layers multiple security controls: perimeter (firewalls), detection (IDS/IPS), prevention (antivirus, email filters), access (authentication), protection (encryption, backups), and people (training). No single control is sufficient.',
            specRef: 'D4 - Defense in depth'
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
    }
};

// --- "Did You Know?" Educational Tips ---
export const DID_YOU_KNOW_TIPS = [
    { tip: '91% of cyber attacks begin with a phishing email. Email filters and staff training are your best first defenses.', specRef: 'D1, D2' },
    { tip: 'The average cost of a data breach in the UK is \u00A33.4 million. Prevention is far cheaper than recovery.', specRef: 'D5' },
    { tip: 'GDPR requires breach notification within 72 hours. Having an incident response plan ready saves critical time.', specRef: 'D3' },
    { tip: 'The 3-2-1 backup rule: 3 copies of data, 2 different storage types, 1 copy offsite. This ensures recovery from any disaster.', specRef: 'D2, D5' },
    { tip: 'Multi-factor authentication (MFA) prevents 99.9% of automated account compromise attacks according to Microsoft.', specRef: 'D2' },
    { tip: 'Under the Computer Misuse Act 1990, creating malware carries a sentence of up to 10 years in prison.', specRef: 'D3' },
    { tip: '"Zero-day" means there are zero days available to fix the vulnerability before it\'s exploited. Patch management reduces your exposure window.', specRef: 'D1, D2' },
    { tip: 'Defense in depth means no single point of failure. Like a castle with moat, walls, guards, and a keep \u2013 if one fails, others protect.', specRef: 'D4' },
    { tip: 'The DPA 2018 lists 6 principles: lawfulness, purpose limitation, data minimisation, accuracy, storage limitation, and security.', specRef: 'D3' },
    { tip: 'Insider threats account for 25% of data breaches. Access control and the principle of least privilege are key defenses.', specRef: 'D1, D2' },
    { tip: 'The ICO (Information Commissioner\'s Office) enforces data protection laws in the UK and can issue fines and enforcement notices.', specRef: 'D3' },
    { tip: 'Encryption converts readable plaintext into unreadable ciphertext. AES-256 would take billions of years to crack with current technology.', specRef: 'D2' },
    { tip: 'Social engineering exploits human psychology rather than technical vulnerabilities. Even the best technology can\'t fully prevent it without training.', specRef: 'D1, D2' },
    { tip: 'The WannaCry ransomware attack cost the NHS an estimated \u00A392 million. Regular patching could have prevented it.', specRef: 'D1, D5' },
    { tip: 'IDS detects suspicious activity; IPS can automatically block it. Together, they provide real-time threat monitoring and response.', specRef: 'D2' },
    { tip: 'Under GDPR, children\'s data requires additional protection. Schools and youth organisations must implement enhanced safeguards.', specRef: 'D3' },
    { tip: 'A firewall examines network packets and decides whether to allow or block them based on predefined security rules.', specRef: 'D2' },
    { tip: 'Business continuity planning (BCP) ensures operations continue during a crisis. Regular testing is essential \u2013 an untested plan may fail.', specRef: 'D5' },
    { tip: 'SQL injection is in the OWASP Top 10 vulnerabilities. Input validation and parameterized queries prevent it entirely.', specRef: 'D1, D2' },
    { tip: 'DDoS attacks can generate over 1 Tbps of traffic. Cloud-based mitigation services can absorb these massive attacks.', specRef: 'D1, D2' }
];

// --- BTEC Specification Mapping (Learning Aim D Knowledge Tracker) ---
export const SPEC_TOPICS = [
    {
        id: 'D1',
        title: 'D1: Threats to Data and Information',
        subtopics: [
            { id: 'D1.1', name: 'Malware (viruses, worms, spyware)', coveredInLevels: [1, 2, 3, 4, 5, 6], coveredByThreats: ['malware'] },
            { id: 'D1.2', name: 'Phishing and social engineering', coveredInLevels: [1, 2, 3, 4, 5, 6], coveredByThreats: ['phishing'] },
            { id: 'D1.3', name: 'Ransomware', coveredInLevels: [3, 4, 5, 6], coveredByThreats: ['ransomware'] },
            { id: 'D1.4', name: 'DDoS attacks', coveredInLevels: [2, 4, 5, 6], coveredByThreats: ['ddos'] },
            { id: 'D1.5', name: 'SQL injection', coveredInLevels: [4, 5, 6], coveredByThreats: ['sqlInjection'] },
            { id: 'D1.6', name: 'Trojan horses', coveredInLevels: [2, 3, 4, 5, 6], coveredByThreats: ['trojan'] },
            { id: 'D1.7', name: 'Insider threats', coveredInLevels: [2, 3, 4, 5, 6], coveredByThreats: ['insider'] },
            { id: 'D1.8', name: 'Zero-day exploits', coveredInLevels: [3, 5, 6], coveredByThreats: ['zeroDay'] }
        ]
    },
    {
        id: 'D2',
        title: 'D2: Security Controls and Protection',
        subtopics: [
            { id: 'D2.1', name: 'Firewalls', coveredInLevels: [1, 2, 3, 4, 5, 6], coveredByTowers: ['firewall'] },
            { id: 'D2.2', name: 'Antivirus / anti-malware', coveredInLevels: [1, 2, 3, 4, 5, 6], coveredByTowers: ['antivirus'] },
            { id: 'D2.3', name: 'Email filtering', coveredInLevels: [1, 2, 3, 4, 5, 6], coveredByTowers: ['emailFilter'] },
            { id: 'D2.4', name: 'Encryption', coveredInLevels: [2, 3, 4, 5, 6], coveredByTowers: ['encryption'] },
            { id: 'D2.5', name: 'Intrusion detection/prevention (IDS/IPS)', coveredInLevels: [3, 4, 5, 6], coveredByTowers: ['ids'] },
            { id: 'D2.6', name: 'Access control and authentication', coveredInLevels: [2, 3, 4, 5, 6], coveredByTowers: ['accessControl'] },
            { id: 'D2.7', name: 'Backup systems', coveredInLevels: [3, 4, 5, 6], coveredByTowers: ['backup'] },
            { id: 'D2.8', name: 'Security awareness training', coveredInLevels: [5, 6], coveredByTowers: ['training'] },
            { id: 'D2.9', name: 'Patch management', coveredInLevels: [4, 5, 6], coveredByTowers: ['patchMgmt'] }
        ]
    },
    {
        id: 'D3',
        title: 'D3: Legislation and Compliance',
        subtopics: [
            { id: 'D3.1', name: 'GDPR (General Data Protection Regulation)', coveredInLevels: [1, 2, 3, 4, 5, 6] },
            { id: 'D3.2', name: 'Data Protection Act 2018', coveredInLevels: [1, 2, 3, 4, 5] },
            { id: 'D3.3', name: 'Computer Misuse Act 1990', coveredInLevels: [2, 4, 5, 6] },
            { id: 'D3.4', name: 'NIS Regulations 2018', coveredInLevels: [5, 6] }
        ]
    },
    {
        id: 'D4',
        title: 'D4: Defense in Depth / Layered Security',
        subtopics: [
            { id: 'D4.1', name: 'Combining multiple security controls', coveredInLevels: [2, 3, 4, 5, 6] },
            { id: 'D4.2', name: 'Physical, technical, and procedural controls', coveredInLevels: [5, 6] },
            { id: 'D4.3', name: 'Evaluating security solutions', coveredInLevels: [3, 4, 5, 6] }
        ]
    },
    {
        id: 'D5',
        title: 'D5: Business Continuity & Disaster Recovery',
        subtopics: [
            { id: 'D5.1', name: 'Backup and recovery procedures', coveredInLevels: [3, 4, 5, 6] },
            { id: 'D5.2', name: 'Business impact analysis', coveredInLevels: [3, 4, 5] },
            { id: 'D5.3', name: 'Incident response planning', coveredInLevels: [5, 6] }
        ]
    }
];

// --- Achievements ---
export const ACHIEVEMENTS = [
    { id: 'first_win', name: 'First Victory', description: 'Complete your first level', icon: '\uD83C\uDFC6', condition: 'levels_completed >= 1' },
    { id: 'all_levels', name: 'Cyber Expert', description: 'Complete all 6 levels', icon: '\uD83C\uDF1F', condition: 'levels_completed >= 6' },
    { id: 'no_damage', name: 'Impenetrable', description: 'Complete a level without any asset damage', icon: '\uD83D\uDEE1', condition: 'no_damage_level' },
    { id: 'budget_master', name: 'Budget Master', description: 'Complete a level with over 50% budget remaining', icon: '\uD83D\uDCB0', condition: 'budget_remaining_50' },
    { id: 'speed_demon', name: 'Quick Thinking', description: 'Complete a level in under 3 minutes', icon: '\u26A1', condition: 'time_under_3min' },
    { id: 'layered', name: 'Defense in Depth', description: 'Use 5 different tower types in one level', icon: '\uD83C\uDFEF', condition: 'tower_variety_5' },
    { id: 'all_towers', name: 'Full Arsenal', description: 'Use all 9 tower types across your games', icon: '\u2694', condition: 'all_towers_used' },
    { id: 'encyclopedist', name: 'Knowledge is Power', description: 'Read all encyclopedia entries', icon: '\uD83D\uDCDA', condition: 'all_encyclopedia_read' },
    { id: 'high_score', name: 'High Scorer', description: 'Achieve a score of 10,000 or more', icon: '\uD83D\uDCC8', condition: 'score_10000' },
    { id: 'ransomware_survivor', name: 'Ransomware Survivor', description: 'Defeat 10 ransomware threats across all games', icon: '\uD83D\uDD12', condition: 'ransomware_kills_10' }
];
