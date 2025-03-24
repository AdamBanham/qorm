const GridModule = require('./grid.js');

export default {
  __init__: [ 'grid' ],
  grid: [ 'type', GridModule.default ]
};