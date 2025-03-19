export default class Facility {
  constructor(facility) {
    if (typeof facility === 'string') {
      try {
        facility = JSON.parse(facilityJSON);
      } catch (e) {
        return false;
      }
    }

    if (!facility.id || !facility.type || !facility.coords
    ) {
      return false
    }

    this.id = facility.id;
    this.type = facility.type;
    this.coords = facility.coords;
  };
}
