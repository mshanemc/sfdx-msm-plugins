const zip = require('./commands/zipStatic.js');
const unzip = require('./commands/unzipStatic.js');
const upload = require('./commands/uploadFile.js');
const userPhoto = require('./commands/userPhoto.js');

(function () {
  'use strict';

  exports.topics = [{
    name: 'unzipStatic',
    description: 'unzips zipped static resources'
  },{
    name: 'zipStatic',
    description: 'zips static resources'
  },{
    name: 'uploadFile.js',
    description: 'uploads files'
  }, {
    name: 'userPhoto.js',
    description: 'set user Chatter photos'
  }];

  exports.namespace = {
    name: 'msm',
    description: 'commands from Shane McLaughlin @mshanemc'
  };

  exports.commands = [
    unzip,
    zip,
    upload,
    userPhoto
  ];

}());