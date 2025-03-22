const GridModule = require('./grid.js');

console.log('GridModule', GridModule);

export default {
  __init__: [ 'grid' ],
  grid: [ 'type', GridModule.default ]
};