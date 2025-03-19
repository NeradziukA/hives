import Coords from '../models/coords.js';
import Map from '../models/map.js';

export default class View {
  constructor(stage, mapObject) {
    this.stage = stage;
    if (mapObject instanceof Map) {
      this.map = mapObject;
    } else {
      return console.error('mapObject must be a Map.');
    }
  };

  setScale(scale) {
    if (isNaN(scale)) {
      this.scale = 1;
      return console.log('Scale must be a number. Set to default.')
    } else {
      this.scale = scale;
    }
    this.relocateObjects();
  };

  getScale() {
    return this.scale;
  };

  coordsToXY(coords) { // 0,000089 = 10 m = 8.9 px
    let xy = {};
    try {
      xy.y = window.innerHeight / 2 - ((coords.lat - this.coords.lat) * 100000) / this.getScale();
      xy.x = ((coords.lon - this.coords.lon) * 100000) / this.getScale() + window.innerWidth / 2;
    } catch (e) {
      xy.y = ((coords.lat) * 100000) / this.getScale() + window.innerWidth / 2;
      xy.x = ((coords.lon) * 100000) / this.getScale() + window.innerHeight / 2;
    }
    //console.log(xy.x + ' ' + xy.y);
    return xy;
  };

  onCoordsChanged(coordsObject) {
    if (coordsObject instanceof Coords) {
      this.coords = coordsObject;
      this.relocateObjects();
    } else {
      return console.error('Must be a coordsObject.')
    }
  };

  relocateObjects() {
    let key;
    let xy;
    for (key in this.map.units) {
      if (this.map.units.hasOwnProperty(key)) {
        xy = this.coordsToXY(this.map.units[key].coords);
        this.map.units[key].sprite.position.set(xy.x, xy.y);
      }
    }
    for (key in this.map.facilities) {
      if (this.map.facilities.hasOwnProperty(key)) {
        xy = this.coordsToXY(this.map.facilities[key].coords);
        this.map.facilities[key].sprite.position.set(xy.x, xy.y);
      }
    }
  };

  onUnitMoved(user) {
    let _user = this.map.units[user.id];
    let xy = this.coordsToXY(_user.coords);
    _user.sprite.position.set(xy.x, xy.y);
  };

  onUnitAdd(user) {
    let _user = this.map.units[user.id];

    _user.sprite = new PIXI.Sprite(PIXI.loader.resources['img/z_m1_32x70.png'].texture);
    //user.sprite.x = user.coords.lon;
    //user.sprite.y = user.coords.lat;

    let xy = this.coordsToXY(_user.coords);
    _user.sprite.position.set(xy.x, xy.y);

    _user.sprite.scale.set(0.5, 0.5);
    _user.sprite.anchor.set(0.5, 0.5);
    _user.sprite.rotate = -1.17;
    this.stage.addChild(_user.sprite);
  };

  onFacilityAdd(facility) {
    //let facility = this.map.facilities[facility.id];
    this.map.facilities.push(facility);

    switch (facility.type) {
      case 'work':
      {
        facility.sprite = new PIXI.Sprite(PIXI.loader.resources['img/build_z1_85x70.png'].texture);
        break;
      }
      case 'home':
      {
        facility.sprite = new PIXI.Sprite(PIXI.loader.resources['img/build_h1_85x70.png'].texture);
        break;
      }
      default:
      {
        facility.sprite = new PIXI.Sprite(PIXI.loader.resources['img/build_h1_85x70.png'].texture);
        break;
      }
    }


    let xy = this.coordsToXY(facility.coords);
    facility.sprite.position.set(xy.x, xy.y);

    facility.sprite.scale.set(0.5, 0.5);
    facility.sprite.anchor.set(0.5, 0.5);
    facility.sprite.rotate = -1.17;
    this.stage.addChild(facility.sprite);
  };

  onUnitDeleted(options) {
    this.stage.removeChild(options.sprite);
  };
}