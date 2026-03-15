"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Faction = exports.UnitType = exports.PlayerRole = exports.PlayerRank = exports.BuildingType = void 0;
var BuildingType;
(function (BuildingType) {
    // Zombie side
    BuildingType["INCUBATOR"] = "incubator";
    BuildingType["HIVE"] = "hive";
    BuildingType["SHELTER_ZOMBIE"] = "shelter-zombie";
    BuildingType["MUTATOR"] = "mutator";
    BuildingType["EXTRACTOR"] = "extractor";
    // Human side
    BuildingType["MILITARY_BASE"] = "military-base";
    BuildingType["RESISTANCE_BASE"] = "resistance-base";
    BuildingType["SHELTER_HUMAN"] = "shelter-human";
    BuildingType["LABORATORY"] = "laboratory";
    BuildingType["TRAINING_BASE"] = "training-base";
})(BuildingType || (exports.BuildingType = BuildingType = {}));
var PlayerRank;
(function (PlayerRank) {
    PlayerRank["NOVICE"] = "novice";
    PlayerRank["SURVIVOR"] = "survivor";
    PlayerRank["VETERAN"] = "veteran";
    PlayerRank["ELITE"] = "elite";
    PlayerRank["GENERAL"] = "general";
})(PlayerRank || (exports.PlayerRank = PlayerRank = {}));
var PlayerRole;
(function (PlayerRole) {
    PlayerRole["QUEST_MASTER"] = "quest_master";
    PlayerRole["NPC"] = "npc";
    PlayerRole["BOSS"] = "boss";
})(PlayerRole || (exports.PlayerRole = PlayerRole = {}));
var UnitType;
(function (UnitType) {
    UnitType["HUMAN_A"] = "HUMAN_A";
    UnitType["HUMAN_B"] = "HUMAN_B";
    UnitType["ZOMBIE_A"] = "ZOMBIE_A";
    UnitType["ZOMBIE_B"] = "ZOMBIE_B";
})(UnitType || (exports.UnitType = UnitType = {}));
var Faction;
(function (Faction) {
    Faction["HUMANS"] = "humans";
    Faction["ZOMBIES"] = "zombies";
    Faction["NEUTRAL"] = "neutral";
})(Faction || (exports.Faction = Faction = {}));
