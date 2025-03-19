const fs = require('fs');
const path = require('path');
const forceSyncModels = require('../db_config').forceSyncModels;
const MODEL_PATH = path.join(__dirname, '../models');

class Utils {
  static initModels() {
    if (!forceSyncModels) {
      console.error('Models were not initialized. Flag "forceSyncModels" must be "true", setup it in /db_config.js')
      return console.log('Error! See logs for details');
    }
    let log = `INIT_DB started ${new Date().toLocaleString()}`;
    Utils.getModels((err, models) => {
      if (err) {
        return console.log(err);
      }
      if (models.length === 0) {
        return console.log('Models not found.');
      } else {
        log += ` Found ${models.length} models`;
      }

      Promise.all(models.map((el) => {
        return el.sync({force: forceSyncModels});
      }))
        .then(() => {
          return console.log(`${log} ...processed models: ${models.length} -> Success `);
        }, (e) => {
          return console.log(`${log} -> Error: ${e.parent.detail || e.message}`);
        });
    });
  }

  static getModels(callback) {
    Utils.readModelsDir((err, files) => {
      if (err) {
        return callback(err);
      }
      let models = [];
      files.forEach((el) => {
        let model = Utils.getModel(el);
        if (model) {
          models.push(model);
        }
      });
      return callback(null, models);
    });
  }

  static getModel(fileName) {
    const filePath = path.join(MODEL_PATH, fileName);
    const module = require(filePath);
    if (module && module.sync) {
      return module;
    } else {
      return false;
    }
  }

  static readModelsDir(callback) {
    fs.readdir(MODEL_PATH, callback);
  }
}

module.exports = Utils;