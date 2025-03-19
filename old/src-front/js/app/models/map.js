import Coords from '../models/coords.js';
import Unit from '../models/unit.js';
import Facility from '../models/facility.js';

export default class Map {
  constructor() {
    this.units = {};
    this.facilities = [];
    this.listeners = [];
  };

  addUnit(options) {
    let unitObject = new Unit(options);
    if (unitObject) {
      this.units[unitObject.id] = unitObject;
      this.emitEvent({type: 'UNIT_CONNECTED', options: {unit: this.units[unitObject.id]}});
      //console.log('Unit at: ' + unit.coords.lat + ' ' + unit.coords.lon);
    } else {
      return console.error('unitObject must be a Unit.');
    }
  };

  moveUnit(options) {
    if (!this.units[options.id]) {
      let unitObject = new Unit(options);
      if (unitObject) {
        this.units[unitObject.id] = unitObject;
        this.emitEvent({type: 'UNIT_CONNECTED', options: {unit: this.units[unitObject.id]}});
        //console.log('Unit at: ' + unit.coords.lat + ' ' + unit.coords.lon);
      } else {
        return console.error('unitObject must be a Unit.');
      }
      return console.log('User for movement not found. Is new?.');
    }
    if (this.units[options.id].update(options)) {
      this.emitEvent({type: 'UNIT_MOVED', options: {unit: this.units[options.id]}});
    } else {
      return console.error('unitObject must be a Unit.');
    }
  };

  deleteUnit(options) {
    this.units[options.id] && this.emitEvent({
        type: 'UNIT_DISCONNECTED',
        options: {
          id: options.id,
          sprite: this.units[options.id].sprite
        }
      }
    );
    delete this.units[options.id];
  };

  initUnits(options) {
    let unitsCount = 0;
    for (let key in options.units) {
      if (options.units[key].coords) {
        if (options.units[key].id == incubyApp.player.id) {
          continue;
        }
        if (this.units[key]) {
          this.units[key].coords = options[key].coords;
        } else if (options.units[key].coords) {
          let unitObject = new Unit(options.units[key]);
          if (unitObject) {
            this.units[unitObject.id] = unitObject;
            this.emitEvent({type: 'UNIT_CONNECTED', options: {unit: this.units[unitObject.id]}});
            //console.log('Unit at: ' + unit.coords.lat + ' ' + unit.coords.lon);
          } else {
            return console.error('unitObject must be a Unit.');
          }
        }
      }
      unitsCount++;
    }
    console.log('Online: ', unitsCount);

    /**/
    let fHome = {
      id: 1,
      type: 'home',
      coords: {lat: 54.3612063, lon: 18.5499457}
    };
    let fWork = {
      id: 2,
      type: 'work',
      coords: {lat: 53.927325, lon: 27.6811183}
    };
    let fGym = {
      id: 3,
      type: 'gym',
      coords: {lat: 53.920526, lon: 27.5891443}
    };
    //
    this.emitEvent({type: 'FACILITY_ADD', options: {facility: fHome}});
    this.emitEvent({type: 'FACILITY_ADD', options: {facility: fWork}});
    this.emitEvent({type: 'FACILITY_ADD', options: {facility: fGym}});
    /**/

  };

  addFacility(options) {
    let facilityObject = new Facility();
    if (facilityObject.load(options)) {
      this.facilities[facilityObject.id] = facilityObject;
      this.emitEvent({type: 'FACILITY_ADD', options: {facility: this.facilities[facilityObject.id]}});
    } else {
      return console.error('facilityObject must be a Facility.');
    }
  };

  deleteFacility() {
  };

  getFacilities() {
  };

  emitEvent(event) {
    switch (event.type) {
      case 'UNIT_CONNECTED':
      {
        this.listeners.map((el) => {
          if (el.eventType == 'UNIT_CONNECTED') {
            el.listener.onUnitAdd.bind(el.listener, event.options.unit)();
          }
        });
        break;
      }
      case 'UNIT_MOVED':
      {
        this.listeners.map((el) => {
          if (el.eventType == 'UNIT_MOVED') {
            el.listener.onUnitMoved.bind(el.listener, event.options.unit)();
          }
        });
        break;
      }
      case 'UNIT_DISCONNECTED':
      {
        this.listeners.map((el) => {
          if (el.eventType == 'UNIT_DISCONNECTED') {
            el.listener.onUnitDeleted.bind(el.listener, event.options)();
          }
        });
        break;
      }
      case 'FACILITY_ADD':
      {
        this.listeners.map((el) => {
          if (el.eventType == 'FACILITY_ADD') {
            el.listener.onFacilityAdd.bind(el.listener, event.options.facility)();
          }
        });
        break;
      }
      default:
        return console.error('Unknown events type.');
    }
  };

  addListener(eventType, listener) {
    this.listeners.push({'eventType': eventType, 'listener': listener});
  };

  onCoordsChanged(coordsObject) {
    this.coords = coordsObject;
  };
}
