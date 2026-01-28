
// Fix: Added missing TribeName import from types.ts
import { UnitData, TribeName } from './types';

export const TROOP_DATA: UnitData[] = [
  { tribe: "Romans", unit: "Legionnaire", attack: 40, def_inf: 35, def_cav: 50, speed: 6, carry: 50, wood: 120, clay: 100, iron: 150, crop: 30, sum_resources: 400, crop_upkeep: 1, training_time_s: 1600 },
  { tribe: "Romans", unit: "Praetorian", attack: 30, def_inf: 65, def_cav: 35, speed: 5, carry: 20, wood: 100, clay: 130, iron: 160, crop: 70, sum_resources: 460, crop_upkeep: 1, training_time_s: 1760 },
  { tribe: "Romans", unit: "Imperian", attack: 70, def_inf: 40, def_cav: 25, speed: 7, carry: 50, wood: 150, clay: 160, iron: 210, crop: 80, sum_resources: 600, crop_upkeep: 1, training_time_s: 1920 },
  { tribe: "Romans", unit: "Equites Legati", attack: 0, def_inf: 20, def_cav: 10, speed: 16, carry: 0, wood: 140, clay: 160, iron: 20, crop: 40, sum_resources: 360, crop_upkeep: 2, training_time_s: 1360 },
  { tribe: "Romans", unit: "Equites Imperatoris", attack: 120, def_inf: 65, def_cav: 50, speed: 14, carry: 100, wood: 550, clay: 440, iron: 320, crop: 100, sum_resources: 1410, crop_upkeep: 3, training_time_s: 2640 },
  { tribe: "Romans", unit: "Equites Caesaris", attack: 180, def_inf: 80, def_cav: 105, speed: 10, carry: 70, wood: 550, clay: 640, iron: 800, crop: 180, sum_resources: 2170, crop_upkeep: 4, training_time_s: 3520 },
  { tribe: "Romans", unit: "Battering Ram", attack: 60, def_inf: 30, def_cav: 75, speed: 4, carry: 0, wood: 900, clay: 360, iron: 500, crop: 70, sum_resources: 1830, crop_upkeep: 3, training_time_s: 4600 },
  { tribe: "Romans", unit: "Fire Catapult", attack: 75, def_inf: 60, def_cav: 10, speed: 3, carry: 0, wood: 950, clay: 1350, iron: 600, crop: 90, sum_resources: 2990, crop_upkeep: 6, training_time_s: 9000 },
  { tribe: "Romans", unit: "Senator", attack: 50, def_inf: 40, def_cav: 30, speed: 4, carry: 0, wood: 30750, clay: 27200, iron: 45000, crop: 37500, sum_resources: 140450, crop_upkeep: 5, training_time_s: 90660 },
  { tribe: "Romans", unit: "Settler", attack: 0, def_inf: 80, def_cav: 80, speed: 5, carry: 3000, wood: 4600, clay: 4200, iron: 5800, crop: 4400, sum_resources: 19000, crop_upkeep: 1, training_time_s: 26880 },
  { tribe: "Gauls", unit: "Phalanx", attack: 15, def_inf: 40, def_cav: 50, speed: 7, carry: 35, wood: 100, clay: 130, iron: 55, crop: 30, sum_resources: 315, crop_upkeep: 1, training_time_s: 1040 },
  { tribe: "Gauls", unit: "Swordsman", attack: 65, def_inf: 35, def_cav: 20, speed: 6, carry: 45, wood: 140, clay: 150, iron: 185, crop: 60, sum_resources: 535, crop_upkeep: 1, training_time_s: 1440 },
  { tribe: "Gauls", unit: "Pathfinder", attack: 0, def_inf: 20, def_cav: 10, speed: 17, carry: 0, wood: 170, clay: 150, iron: 20, crop: 40, sum_resources: 380, crop_upkeep: 2, training_time_s: 1360 },
  { tribe: "Gauls", unit: "Theutates Thunder", attack: 100, def_inf: 25, def_cav: 40, speed: 19, carry: 75, wood: 350, clay: 450, iron: 230, crop: 60, sum_resources: 1090, crop_upkeep: 2, training_time_s: 2480 },
  { tribe: "Gauls", unit: "Druidrider", attack: 45, def_inf: 115, def_cav: 55, speed: 16, carry: 35, wood: 360, clay: 330, iron: 280, crop: 120, sum_resources: 1090, crop_upkeep: 2, training_time_s: 2560 },
  { tribe: "Gauls", unit: "Haeduan", attack: 140, def_inf: 60, def_cav: 165, speed: 13, carry: 65, wood: 500, clay: 620, iron: 675, crop: 170, sum_resources: 1965, crop_upkeep: 3, training_time_s: 3120 },
  { tribe: "Gauls", unit: "Ram", attack: 50, def_inf: 30, def_cav: 105, speed: 4, carry: 0, wood: 950, clay: 555, iron: 330, crop: 75, sum_resources: 1910, crop_upkeep: 3, training_time_s: 5000 },
  { tribe: "Gauls", unit: "Trebuchet", attack: 70, def_inf: 45, def_cav: 10, speed: 3, carry: 0, wood: 960, clay: 1450, iron: 630, crop: 90, sum_resources: 3130, crop_upkeep: 6, training_time_s: 9000 },
  { tribe: "Gauls", unit: "Chieftain", attack: 40, def_inf: 50, def_cav: 50, speed: 5, carry: 0, wood: 30750, clay: 45400, iron: 31000, crop: 37500, sum_resources: 144650, crop_upkeep: 4, training_time_s: 90700 },
  { tribe: "Gauls", unit: "Settler", attack: 0, def_inf: 80, def_cav: 80, speed: 5, carry: 3000, wood: 4400, clay: 5600, iron: 4200, crop: 3900, sum_resources: 18100, crop_upkeep: 1, training_time_s: 22700 },
  { tribe: "Teutons", unit: "Maceman", attack: 40, def_inf: 20, def_cav: 5, speed: 7, carry: 60, wood: 95, clay: 75, iron: 40, crop: 40, sum_resources: 250, crop_upkeep: 1, training_time_s: 720 },
  { tribe: "Teutons", unit: "Spearman", attack: 10, def_inf: 35, def_cav: 60, speed: 7, carry: 40, wood: 145, clay: 70, iron: 85, crop: 40, sum_resources: 340, crop_upkeep: 1, training_time_s: 1120 },
  { tribe: "Teutons", unit: "Axeman", attack: 60, def_inf: 30, def_cav: 30, speed: 6, carry: 50, wood: 130, clay: 120, iron: 170, crop: 70, sum_resources: 490, crop_upkeep: 1, training_time_s: 1200 },
  { tribe: "Teutons", unit: "Scout", attack: 0, def_inf: 10, def_cav: 5, speed: 9, carry: 0, wood: 160, clay: 100, iron: 50, crop: 50, sum_resources: 360, crop_upkeep: 1, training_time_s: 1120 },
  { tribe: "Teutons", unit: "Paladin", attack: 55, def_inf: 100, def_cav: 40, speed: 10, carry: 110, wood: 370, clay: 270, iron: 290, crop: 75, sum_resources: 1005, crop_upkeep: 2, training_time_s: 2400 },
  { tribe: "Teutons", unit: "Teutonic Knight", attack: 150, def_inf: 50, def_cav: 75, speed: 9, carry: 80, wood: 450, clay: 515, iron: 480, crop: 80, sum_resources: 1525, crop_upkeep: 3, training_time_s: 2960 },
  { tribe: "Teutons", unit: "Ram", attack: 65, def_inf: 30, def_cav: 80, speed: 4, carry: 0, wood: 1000, clay: 300, iron: 350, crop: 70, sum_resources: 1720, crop_upkeep: 3, training_time_s: 4200 },
  { tribe: "Teutons", unit: "Catapult", attack: 50, def_inf: 60, def_cav: 10, speed: 3, carry: 0, wood: 900, clay: 1200, iron: 600, crop: 60, sum_resources: 2760, crop_upkeep: 6, training_time_s: 9000 },
  { tribe: "Teutons", unit: "Chief", attack: 40, def_inf: 60, def_cav: 40, speed: 4, carry: 0, wood: 35500, clay: 26600, iron: 25000, crop: 27200, sum_resources: 114300, crop_upkeep: 4, training_time_s: 70500 },
  { tribe: "Teutons", unit: "Settler", attack: 10, def_inf: 80, def_cav: 80, speed: 5, carry: 3000, wood: 5800, clay: 4400, iron: 4600, crop: 5200, sum_resources: 20000, crop_upkeep: 1, training_time_s: 31000 },
  { tribe: "Egyptians", unit: "Slave Militia", attack: 10, def_inf: 30, def_cav: 20, speed: 7, carry: 15, wood: 45, clay: 60, iron: 30, crop: 15, sum_resources: 150, crop_upkeep: 1, training_time_s: 530 },
  { tribe: "Egyptians", unit: "Ash Warden", attack: 30, def_inf: 55, def_cav: 40, speed: 6, carry: 50, wood: 115, clay: 100, iron: 145, crop: 60, sum_resources: 420, crop_upkeep: 1, training_time_s: 1380 },
  { tribe: "Egyptians", unit: "Khopesh Warrior", attack: 65, def_inf: 50, def_cav: 20, speed: 7, carry: 45, wood: 170, clay: 180, iron: 220, crop: 80, sum_resources: 650, crop_upkeep: 1, training_time_s: 1440 },
  { tribe: "Egyptians", unit: "Sopdu Explorer", attack: 0, def_inf: 20, def_cav: 10, speed: 16, carry: 0, wood: 170, clay: 150, iron: 20, crop: 40, sum_resources: 380, crop_upkeep: 2, training_time_s: 1360 },
  { tribe: "Egyptians", unit: "Anhur Guard", attack: 50, def_inf: 110, def_cav: 50, speed: 15, carry: 50, wood: 360, clay: 330, iron: 280, crop: 120, sum_resources: 1090, crop_upkeep: 2, training_time_s: 2560 },
  { tribe: "Egyptians", unit: "Resheph Chariot", attack: 110, def_inf: 120, def_cav: 150, speed: 10, carry: 70, wood: 450, clay: 560, iron: 610, crop: 180, sum_resources: 1800, crop_upkeep: 3, training_time_s: 3240 },
  { tribe: "Egyptians", unit: "Ram", attack: 55, def_inf: 30, def_cav: 95, speed: 4, carry: 0, wood: 995, clay: 575, iron: 340, crop: 80, sum_resources: 1990, crop_upkeep: 3, training_time_s: 4800 },
  { tribe: "Egyptians", unit: "Stone Catapult", attack: 65, def_inf: 55, def_cav: 10, speed: 3, carry: 0, wood: 980, clay: 1510, iron: 660, crop: 100, sum_resources: 3250, crop_upkeep: 6, training_time_s: 9000 },
  { tribe: "Egyptians", unit: "Nomarch", attack: 40, def_inf: 50, def_cav: 50, speed: 4, carry: 0, wood: 34000, clay: 50000, iron: 34000, crop: 42000, sum_resources: 160000, crop_upkeep: 4, training_time_s: 90700 },
  { tribe: "Egyptians", unit: "Settler", attack: 0, def_inf: 80, def_cav: 80, speed: 5, carry: 3000, wood: 5040, clay: 6510, iron: 4830, crop: 4620, sum_resources: 21000, crop_upkeep: 1, training_time_s: 24800 },
  { tribe: "Huns", unit: "Mercenary", attack: 35, def_inf: 40, def_cav: 30, speed: 6, carry: 50, wood: 130, clay: 80, iron: 40, crop: 40, sum_resources: 290, crop_upkeep: 1, training_time_s: 810 },
  { tribe: "Huns", unit: "Bowman", attack: 50, def_inf: 30, def_cav: 10, speed: 6, carry: 30, wood: 140, clay: 110, iron: 60, crop: 60, sum_resources: 370, crop_upkeep: 1, training_time_s: 1120 },
  { tribe: "Huns", unit: "Spotter", attack: 0, def_inf: 20, def_cav: 10, speed: 19, carry: 0, wood: 170, clay: 150, iron: 20, crop: 40, sum_resources: 380, crop_upkeep: 2, training_time_s: 1360 },
  { tribe: "Huns", unit: "Steppe Rider", attack: 120, def_inf: 30, def_cav: 15, speed: 16, carry: 75, wood: 290, clay: 370, iron: 190, crop: 45, sum_resources: 895, crop_upkeep: 2, training_time_s: 2400 },
  { tribe: "Huns", unit: "Marksman", attack: 110, def_inf: 80, def_cav: 70, speed: 15, carry: 105, wood: 320, clay: 350, iron: 330, crop: 50, sum_resources: 1050, crop_upkeep: 2, training_time_s: 2480 },
  { tribe: "Huns", unit: "Marauder", attack: 180, def_inf: 60, def_cav: 40, speed: 14, carry: 80, wood: 450, clay: 560, iron: 610, crop: 140, sum_resources: 1760, crop_upkeep: 3, training_time_s: 2990 },
  { tribe: "Huns", unit: "Ram", attack: 65, def_inf: 30, def_cav: 90, speed: 4, carry: 0, wood: 1060, clay: 330, iron: 360, crop: 70, sum_resources: 1820, crop_upkeep: 3, training_time_s: 4400 },
  { tribe: "Huns", unit: "Catapult", attack: 45, def_inf: 55, def_cav: 10, speed: 3, carry: 0, wood: 950, clay: 1280, iron: 620, crop: 60, sum_resources: 2910, crop_upkeep: 6, training_time_s: 9000 },
  { tribe: "Huns", unit: "Logades", attack: 50, def_inf: 40, def_cav: 30, speed: 5, carry: 0, wood: 37200, clay: 27600, iron: 25200, crop: 27600, sum_resources: 117600, crop_upkeep: 4, training_time_s: 90700 },
  { tribe: "Huns", unit: "Settler", attack: 10, def_inf: 80, def_cav: 80, speed: 5, carry: 3000, wood: 6100, clay: 4600, iron: 4800, crop: 5400, sum_resources: 20900, crop_upkeep: 1, training_time_s: 28950 },
  { tribe: "Spartans", unit: "Hoplite", attack: 50, def_inf: 35, def_cav: 30, speed: 6, carry: 60, wood: 110, clay: 185, iron: 110, crop: 35, sum_resources: 440, crop_upkeep: 1, training_time_s: 1700 },
  { tribe: "Spartans", unit: "Sentinel", attack: 0, def_inf: 40, def_cav: 22, speed: 9, carry: 0, wood: 185, clay: 150, iron: 35, crop: 75, sum_resources: 445, crop_upkeep: 1, training_time_s: 1232 },
  { tribe: "Spartans", unit: "Shieldsman", attack: 40, def_inf: 85, def_cav: 45, speed: 8, carry: 40, wood: 145, clay: 95, iron: 245, crop: 45, sum_resources: 530, crop_upkeep: 1, training_time_s: 1936 },
  { tribe: "Spartans", unit: "Twinsteel Therion", attack: 90, def_inf: 55, def_cav: 40, speed: 6, carry: 50, wood: 130, clay: 200, iron: 400, crop: 65, sum_resources: 795, crop_upkeep: 1, training_time_s: 2112 },
  { tribe: "Spartans", unit: "Elpida Rider", attack: 55, def_inf: 120, def_cav: 90, speed: 16, carry: 110, wood: 555, clay: 445, iron: 330, crop: 110, sum_resources: 1440, crop_upkeep: 2, training_time_s: 2816 },
  { tribe: "Spartans", unit: "Corinthian Crusher", attack: 195, def_inf: 80, def_cav: 75, speed: 9, carry: 80, wood: 660, clay: 495, iron: 995, crop: 165, sum_resources: 2315, crop_upkeep: 3, training_time_s: 3432 },
  { tribe: "Spartans", unit: "Ram", attack: 65, def_inf: 30, def_cav: 80, speed: 4, carry: 0, wood: 525, clay: 260, iron: 790, crop: 130, sum_resources: 1705, crop_upkeep: 3, training_time_s: 4620 },
  { tribe: "Spartans", unit: "Ballista", attack: 50, def_inf: 60, def_cav: 10, speed: 3, carry: 0, wood: 550, clay: 1240, iron: 825, crop: 135, sum_resources: 2750, crop_upkeep: 6, training_time_s: 9900 },
  { tribe: "Spartans", unit: "Ephor", attack: 40, def_inf: 60, def_cav: 40, speed: 4, carry: 0, wood: 33450, clay: 30665, iron: 36240, crop: 13935, sum_resources: 114290, crop_upkeep: 4, training_time_s: 77550 },
  { tribe: "Spartans", unit: "Settler", attack: 10, def_inf: 80, def_cav: 80, speed: 5, carry: 3000, wood: 5115, clay: 5580, iron: 6045, crop: 3255, sum_resources: 19995, crop_upkeep: 1, training_time_s: 34100 },
  { tribe: "Vikings", unit: "Thrall", attack: 45, def_inf: 22, def_cav: 5, speed: 7, carry: 55, wood: 95, clay: 80, iron: 50, crop: 40, sum_resources: 265, crop_upkeep: 1, training_time_s: 800 },
  { tribe: "Vikings", unit: "Shield Maiden", attack: 20, def_inf: 50, def_cav: 30, speed: 7, carry: 40, wood: 125, clay: 70, iron: 85, crop: 40, sum_resources: 320, crop_upkeep: 1, training_time_s: 1080 },
  { tribe: "Vikings", unit: "Berserker", attack: 70, def_inf: 30, def_cav: 25, speed: 5, carry: 75, wood: 235, clay: 220, iron: 200, crop: 70, sum_resources: 725, crop_upkeep: 2, training_time_s: 1550 },
  { tribe: "Vikings", unit: "Heimdall’s Eye", attack: 0, def_inf: 10, def_cav: 5, speed: 9, carry: 0, wood: 155, clay: 95, iron: 50, crop: 50, sum_resources: 350, crop_upkeep: 1, training_time_s: 1120 },
  { tribe: "Vikings", unit: "Huskarl Rider", attack: 45, def_inf: 95, def_cav: 100, speed: 12, carry: 110, wood: 385, clay: 295, iron: 290, crop: 85, sum_resources: 1055, crop_upkeep: 2, training_time_s: 2650 },
  { tribe: "Vikings", unit: "Valkyrie’s Blessing", attack: 160, def_inf: 50, def_cav: 75, speed: 9, carry: 80, wood: 475, clay: 535, iron: 515, crop: 100, sum_resources: 1625, crop_upkeep: 2, training_time_s: 3060 },
  { tribe: "Vikings", unit: "Ram", attack: 65, def_inf: 30, def_cav: 80, speed: 4, carry: 0, wood: 950, clay: 325, iron: 375, crop: 70, sum_resources: 1720, crop_upkeep: 2, training_time_s: 4200 },
  { tribe: "Vikings", unit: "Catapult", attack: 50, def_inf: 60, def_cav: 10, speed: 3, carry: 0, wood: 850, clay: 1225, iron: 625, crop: 60, sum_resources: 2760, crop_upkeep: 6, training_time_s: 9000 },
  { tribe: "Vikings", unit: "Jarl", attack: 40, def_inf: 40, def_cav: 60, speed: 5, carry: 0, wood: 35500, clay: 26600, iron: 25000, crop: 27200, sum_resources: 114300, crop_upkeep: 4, training_time_s: 70500 },
  { tribe: "Vikings", unit: "Settler", attack: 10, def_inf: 80, def_cav: 80, speed: 5, carry: 3000, wood: 5800, clay: 4400, iron: 4800, crop: 4800, sum_resources: 20000, crop_upkeep: 1, training_time_s: 31000 }
];

export const TRIBES: TribeName[] = [
  'Romans', 'Gauls', 'Teutons', 'Egyptians', 'Huns', 'Spartans', 'Vikings'
];

/** 
 * Training time reduction multipliers (1.0 = 100%)
 * Index 0 corresponds to Level 1, Index 19 to Level 20.
 */
export const TRAINING_TIME_REDUCTION_COMMON = [
  1.00, 0.90, 0.81, 0.73, 0.66, 0.59, 0.53, 0.48, 0.43, 0.39, 
  0.35, 0.31, 0.28, 0.25, 0.23, 0.21, 0.19, 0.17, 0.15, 0.14
];

export const TRAINING_TIME_REDUCTION_BARRACKS = [
  1.0000, 0.9000, 0.8100, 0.7290, 0.6561, 0.5905, 0.5314, 0.4783, 0.4305, 0.3874,
  0.3487, 0.3138, 0.2824, 0.2542, 0.2288, 0.2059, 0.1853, 0.1668, 0.1501, 0.1351
];
