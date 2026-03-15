/**
 * Проверяет, что enum-ы в server/src/types.ts совпадают с lib/enums.js.
 * Если кто-то обновил lib/enums.ts но забыл обновить server/src/types.ts — тест упадёт.
 */
import { describe, it, expect } from 'vitest';
import { BuildingType, PlayerRank, PlayerRole, Faction, UnitType } from '../types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const libEnums = require('../../../lib/enums.js') as {
  BuildingType: Record<string, string>;
  PlayerRank: Record<string, string>;
  PlayerRole: Record<string, string>;
  Faction: Record<string, string>;
  UnitType: Record<string, string>;
};

describe('enum sync: server/src/types.ts vs lib/enums.js', () => {
  it('BuildingType values match', () => {
    expect(Object.values(BuildingType).sort()).toEqual(
      Object.values(libEnums.BuildingType).sort(),
    );
  });

  it('PlayerRank values match', () => {
    expect(Object.values(PlayerRank).sort()).toEqual(
      Object.values(libEnums.PlayerRank).sort(),
    );
  });

  it('PlayerRole values match', () => {
    expect(Object.values(PlayerRole).sort()).toEqual(
      Object.values(libEnums.PlayerRole).sort(),
    );
  });

  it('Faction values match', () => {
    expect(Object.values(Faction).sort()).toEqual(
      Object.values(libEnums.Faction).sort(),
    );
  });

  it('UnitType values match', () => {
    expect(Object.values(UnitType).sort()).toEqual(
      Object.values(libEnums.UnitType).sort(),
    );
  });
});
