/* ═══════════════════════════════════════════════════════════════
   SISTEMA // STATE.JS — Central state definitions
═══════════════════════════════════════════════════════════════ */

'use strict';

const STATE_KEY = 'sistema_state_v2';

// ── Default Player State ──────────────────────────────────────
const DEFAULT_STATE = {
  player: {
    name: '',
    level: 1,
    exp: 0,
    expToNext: 100,
    rank: 'E',
    gold: 0,
    streak: 0,
    lastLogin: null,
    title: null,
    setup: false,
  },

  stats: {
    STR: { value: 10, label: 'Fuerza',        color: '#ff4444', desc: 'Entrenamientos físicos' },
    INT: { value: 10, label: 'Inteligencia',   color: '#0099cc', desc: 'Estudio y aprendizaje' },
    VIT: { value: 10, label: 'Vitalidad',      color: '#00ff88', desc: 'Salud, sueño, higiene' },
    SEN: { value: 10, label: 'Percepción',     color: '#ffd700', desc: 'Orden y puntualidad' },
    WIL: { value: 10, label: 'Voluntad',       color: '#a56eff', desc: 'Resistencia a vicios' },
  },

  // ── Daily Quests (reset every day) ──
  dailyQuests: [
    { id: 'dq1', name: 'Levantarse antes de las 9:30 AM',      exp: 30, stat: 'WIL', type: 'daily', completed: false, streakDays: 0 },
    { id: 'dq2', name: 'Exposición solar (15-20 min)',          exp: 25, stat: 'VIT', type: 'daily', completed: false, streakDays: 0 },
    { id: 'dq3', name: 'Higiene mañana (completa)',             exp: 20, stat: 'VIT', type: 'daily', completed: false, streakDays: 0 },
    { id: 'dq4', name: 'Higiene noche (completa)',              exp: 20, stat: 'VIT', type: 'daily', completed: false, streakDays: 0 },
    { id: 'dq5', name: 'Entrenamiento físico diario',           exp: 50, stat: 'STR', type: 'daily', completed: false, streakDays: 0 },
    { id: 'dq6', name: 'Flexiones matutinas — 10 reps',        exp: 40, stat: 'STR', type: 'daily', completed: false, streakDays: 0 },
    { id: 'dq7', name: 'Tomar 1 litro de agua',                exp: 15, stat: 'VIT', type: 'daily', completed: false, streakDays: 0 },
  ],

  // ── Class Missions (reset weekly, goal: 3/week) ──
  classMissions: [
    { id: 'cm1', name: 'Sesión de estudio / lectura',    exp: 40, stat: 'INT', type: 'class', completedThisWeek: 0 },
    { id: 'cm2', name: 'Práctica de programación',       exp: 40, stat: 'INT', type: 'class', completedThisWeek: 0 },
    { id: 'cm3', name: 'Ver curso o tutoriales (1h+)',   exp: 30, stat: 'INT', type: 'class', completedThisWeek: 0 },
  ],

  // ── Weekly Raids (reset weekly) ──
  weeklyRaids: [
    { id: 'wr1', name: 'Limpieza profunda del cuarto',   exp: 80,  stat: 'SEN', type: 'raid', completedThisWeek: false },
    { id: 'wr2', name: 'Limpieza profunda de la cocina', exp: 60,  stat: 'SEN', type: 'raid', completedThisWeek: false },
    { id: 'wr3', name: 'Limpieza profunda del hogar',    exp: 100, stat: 'SEN', type: 'raid', completedThisWeek: false },
    { id: 'wr4', name: 'Salir a correr (20+ min)',       exp: 90,  stat: 'STR', type: 'raid', completedThisWeek: false },
    { id: 'wr5', name: 'Orar y journaling',              exp: 50,  stat: 'WIL', type: 'raid', completedThisWeek: false },
  ],

  // ── Negative Actions (debuffs) ──
   negativeActions: [
     // ── Originales ──
     { id: 'na1', name: 'Llegar tarde al trabajo',     penalty: { stat: 'SEN', amount: 2 },                           expLoss: 20, type: 'negative' },
     { id: 'na2', name: 'Usar scooter por pereza',     penalty: { stat: 'SEN', amount: 1 },                           expLoss: 10, type: 'negative' },
     { id: 'na3', name: 'Más de 7 tazas de café',      penalty: { stat: 'VIT', amount: 2, statB: 'INT', amountB: 1 }, expLoss: 15, type: 'negative' },
     { id: 'na4', name: 'Consumo de alcohol',           penalty: { stat: 'VIT', amount: 3, statB: 'INT', amountB: 2 }, expLoss: 30, type: 'negative' },
   
     // ── Sueño y descanso ──
     { id: 'na5', name: 'Despertar después de las 9:30 AM',  penalty: { stat: 'WIL', amount: 2, statB: 'SEN', amountB: 1 }, expLoss: 25, type: 'negative' },
     { id: 'na6', name: 'Desvelarse después de las 12 AM',   penalty: { stat: 'VIT', amount: 2, statB: 'WIL', amountB: 1 }, expLoss: 20, type: 'negative' },
     { id: 'na7', name: 'Dormir menos de 6 horas',           penalty: { stat: 'VIT', amount: 3, statB: 'INT', amountB: 2 }, expLoss: 35, type: 'negative' },
   
     // ── Alimentación ──
     { id: 'na8', name: 'Saltarse el desayuno',               penalty: { stat: 'VIT', amount: 2 },                           expLoss: 15, type: 'negative' },
     { id: 'na9', name: 'Comida chatarra (día completo)',      penalty: { stat: 'VIT', amount: 3, statB: 'WIL', amountB: 2 }, expLoss: 25, type: 'negative' },
   
     // ── Productividad ──
     { id: 'na10', name: 'Día sin estudiar ni programar',      penalty: { stat: 'INT', amount: 2 },                           expLoss: 20, type: 'negative' },
     { id: 'na11', name: 'Más de 3 horas de redes sociales',   penalty: { stat: 'WIL', amount: 2, statB: 'INT', amountB: 1 }, expLoss: 20, type: 'negative' },
     { id: 'na12', name: 'Procrastinar tarea importante',       penalty: { stat: 'WIL', amount: 3, statB: 'SEN', amountB: 1 }, expLoss: 30, type: 'negative' },
   
     // ── Cuerpo y entrenamiento ──
     { id: 'na14', name: 'Saltarse el entrenamiento sin causa', penalty: { stat: 'STR', amount: 2, statB: 'WIL', amountB: 2 }, expLoss: 30, type: 'negative' },
     { id: 'na15', name: 'Día sedentario completo',             penalty: { stat: 'STR', amount: 1, statB: 'VIT', amountB: 1 }, expLoss: 15, type: 'negative' },
   
     // ── Orden y entorno ──
     { id: 'na16', name: 'Dejar el cuarto desordenado',         penalty: { stat: 'SEN', amount: 2 },                           expLoss: 15, type: 'negative' },
     { id: 'na17', name: 'No tender la cama al levantarse',     penalty: { stat: 'SEN', amount: 1 },                           expLoss: 10, type: 'negative' },
     { id: 'na18', name: 'Dejar platos sucios en el fregadero', penalty: { stat: 'SEN', amount: 2 },                           expLoss: 15, type: 'negative' },
   ],

  // ── Dungeon Sessions ──
  dungeon: {
    sessionsToday: 0,
    totalMinutesEver: 0,
    expEarnedToday: 0,
    lastSessionDate: null,
  },

  // ── Shadow Habits ──
  shadowHabits: [],
  extractedShadows: [],

  // ── Titles ──
  titles: [],
  activeTitle: null,

  // ── Penalty system ──
  penalty: {
    active: false,
    task: '',
    date: null,
  },

  // ── Dates for reset tracking ──
  meta: {
    lastDailyReset: null,
    lastWeeklyReset: null,
    currentWeekStart: null,
  },

  // ── Shop: purchased items ──
  shopHistory: [],
};

// ── Rank thresholds ──
const RANK_THRESHOLDS = {
  E: { min: 1,   max: 10,  color: '#7a9fb5' },
  D: { min: 11,  max: 25,  color: '#4ae0a0' },
  C: { min: 26,  max: 45,  color: '#0099cc' },
  B: { min: 46,  max: 65,  color: '#a56eff' },
  A: { min: 66,  max: 85,  color: '#ff9d00' },
  S: { min: 86,  max: 100, color: '#ff003c' },
};

// ── EXP curve (exp needed per level) ──
function getExpForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.35));
}

// ── Rank from level ──
function getRankFromLevel(level) {
  for (const [rank, data] of Object.entries(RANK_THRESHOLDS)) {
    if (level >= data.min && level <= data.max) return rank;
  }
  return 'S';
}

// ── Flexiones escaladas por nivel (dq6) ──
function getDailyFlexiones(level) {
  if (level < 5)  return '10 reps';
  if (level < 10) return '15 reps';
  if (level < 15) return '20 reps';
  if (level < 20) return '25 reps';
  if (level < 30) return '35 reps';
  if (level < 40) return '45 reps';
  if (level < 60) return '60 reps';
  return '80 reps';
}

// ── Workout based on level (penalización) ──
function getPenaltyTask(level) {
  const tasks = [
    { lvl: 1,  task: '10 sentadillas' },
    { lvl: 5,  task: '15 sentadillas o 10 flexiones' },
    { lvl: 10, task: '20 flexiones o 15 fondos' },
    { lvl: 15, task: '25 flexiones + 20 sentadillas' },
    { lvl: 25, task: '50 flexiones o 30 fondos + 10 burpees' },
    { lvl: 40, task: '100 sentadillas o 50 flexiones + plancha 1 min' },
    { lvl: 60, task: '5x20 flexiones + 5x20 sentadillas + plancha 2 min' },
    { lvl: 80, task: '200 sentadillas o 100 flexiones + 20 burpees + plancha 3 min' },
  ];
  let best = tasks[0];
  for (const t of tasks) {
    if (level >= t.lvl) best = t;
  }
  return best.task;
}

// ── Gold per exp ──
function getGoldForExp(exp) {
  return Math.ceil(exp * 0.3);
}

// ── Titles definition ──
const TITLES_DEF = [
  { id: 'dawn_walker',  name: 'Caminante del Alba', icon: '🌅', condition: (s) => s.player.streak >= 7,                desc: 'Racha de 7 días madrugando',      bonus: 'EXP +5%',   color: 'gold-title'   },
  { id: 'iron_will',    name: 'Voluntad de Hierro', icon: '⚔️',  condition: (s) => s.stats.WIL.value >= 30,            desc: 'WIL alcanzó 30',                  bonus: 'WIL +2',    color: 'cyan-title'   },
  { id: 'scholar',      name: 'Académico',           icon: '📚', condition: (s) => s.stats.INT.value >= 30,            desc: 'INT alcanzó 30',                  bonus: 'INT +2',    color: 'cyan-title'   },
  { id: 'warrior',      name: 'Guerrero',            icon: '💪', condition: (s) => s.stats.STR.value >= 30,            desc: 'STR alcanzó 30',                  bonus: 'STR +2',    color: 'cyan-title'   },
  { id: 'awakened',     name: 'Despertado',          icon: '◈',  condition: (s) => s.player.level >= 10,              desc: 'Alcanzaste nivel 10',              bonus: 'EXP +10%',  color: 'purple-title' },
  { id: 'shadow_lord',  name: 'Señor de Sombras',    icon: '☽',  condition: (s) => s.extractedShadows.length >= 3,    desc: '3+ sombras extraídas',            bonus: 'GOLD +10%', color: 'purple-title' },
  { id: 'dungeon_king', name: 'Rey del Dungeon',     icon: '⏱',  condition: (s) => s.dungeon.totalMinutesEver >= 600, desc: '10+ horas de Deep Work totales',   bonus: 'INT +3',    color: 'gold-title'   },
  { id: 'clean_sweep',  name: 'Purificador',         icon: '✨', condition: (s) => s.stats.SEN.value >= 25,           desc: 'SEN alcanzó 25',                  bonus: 'SEN +2',    color: 'gold-title'   },
  { id: 'hydrated',     name: 'Cuerpo de Agua',      icon: '💧', condition: (s) => {
      const dq7 = s.dailyQuests.find(q => q.id === 'dq7');
      return dq7 && (dq7.streakDays >= 14);
    }, desc: '14 días seguidos bebiendo agua', bonus: 'VIT +3', color: 'cyan-title' },
  { id: 'iron_body',    name: 'Cuerpo de Hierro',    icon: '🔩', condition: (s) => {
      const dq6 = s.dailyQuests.find(q => q.id === 'dq6');
      return dq6 && (dq6.streakDays >= 21);
    }, desc: '21 días seguidos de flexiones', bonus: 'STR +5', color: 'gold-title' },
  { id: 'runner',       name: 'Corredor de Sombras', icon: '🏃', condition: (s) => {
      const wr4 = s.weeklyRaids.find(r => r.id === 'wr4');
      return wr4 && s.player.level >= 5 && s.stats.STR.value >= 20;
    }, desc: 'STR 20+ y nivel 5 con raid de carrera activa', bonus: 'STR +2 VIT +2', color: 'cyan-title' },
];
