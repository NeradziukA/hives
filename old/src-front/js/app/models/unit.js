export default class Unit {
  constructor(unit) {
    if (typeof unit === 'string') {
      try {
        unit = JSON.parse(unitJSON);
      } catch (e) {
        return false;
      }
    }

    if (!unit || !unit.id || !unit.type || !unit.coords
    ) {
      return false
    }

    this.id = unit.id;
    this.type = unit.type;
    this.coords = unit.coords;
  };

  update(unit) {
    if (typeof unit === 'string') {
      try {
        unit = JSON.parse(unitJSON);
      } catch (e) {
        return false;
      }
    }

    if (!unit || !unit.id || !unit.type || !unit.coords
    ) {
      return false
    }

    this.id = unit.id;
    this.type = unit.type;
    this.coords = unit.coords;

    return true;
  };
}
