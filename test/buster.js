var config = module.exports;
var define = require('./require');

config["tests"] = {
    rootPath: '../',
    environment: 'node',
    tests: ['test/*-test.js'],
    autoRun: false
};
