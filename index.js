const zip = require('./commands/zipStatic.js');
const unzip = require('./commands/unzipStatic.js');

(function () {
  'use strict';

  exports.topics = [{
    name: 'unzipStatic',
    description: 'unzips zipped static resources'
  },{
    name: 'zipStatic',
    description: 'zips static resources'
  }];

  exports.namespace = {
    name: 'msm',
    description: 'commands from Shane McLaughlin @mshanemc'
  };

  exports.commands = [
    unzip,
    zip
  ];

}());