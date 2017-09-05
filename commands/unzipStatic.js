const forceUtils = require('../lib/forceUtils.js');
const {
  exec
} = require('child_process');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const decompress = require("decompress");
const decompressUnzip = require("decompress-unzip");
const parseXML = require('xml2js').parseString;

(function () {
  'use strict';

  module.exports = {
    topic: 'static',
    command: 'unzip',
    description: 'unzip static resources',
    help: 'unzips static resource(s) of type application/zip to a local folder'
    /*flags: [{
      name: 'name',
      char: 'n',
      description: 'static resource name (omit to do all of them)',
      hasValue: true,
      required: false
    }, {
      name: 'outputdir',
      char: 'd',
      description: 'folder for saving the created files',
      hasValue: true,
      required: false
    }]*/,
    run(context) {
      var topLevelAbsolute, config;
      const unzippedLocation = 'resource-bundles';


      const target = context.flags.name;
      const outputdir = context.flags.outputdir;

      var walkSync = function(dir, filelist) {
        var fs = fs || require('fs'),
            files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function(file) {
          if (fs.statSync(dir + file).isDirectory()) {
            filelist = walkSync(dir + file + '/', filelist);
          }
          else {
            if (file.includes(".resource") && !file.includes(".resource-meta.xml")){
              //see if the file is zipped type?
              var fullpath = dir  + file;
              var meta = fs.readFileSync(fullpath + "-meta.xml", 'utf8');
              //console.log(parseString(meta));
              //console.log(fullpath);
              //console.log(meta);
              parseXML(meta, function(err, result){
                if (err){
                  //console.log(err)
                } else {
                  //console.log(result.StaticResource.contentType[0]);
                  if (result.StaticResource.contentType){
                    //console.log(result.StaticResource.contentType);
                    if (result.StaticResource.contentType[0]==='application/zip'){
                      //console.log(fullpath);
                      filelist.push(fullpath);
                    } else {
                      //console.log("not a zipped file!")
                    }
                  }
                }
              })
            }
          }
        });
        return filelist;
      };

      while (!topLevelAbsolute){
        console.log('Starting directory: ' + process.cwd());
        if (fs.existsSync('sfdx-project.json')){
          //console.log("found config file!");
          topLevelAbsolute = process.cwd();
          var config = JSON.parse(fs.readFileSync('sfdx-project.json', 'utf8'));
          //console.log(config);

          //create the folder.  Rename it up higher if you don't like resource-bundles
          if (!fs.existsSync(unzippedLocation)){
            fs.mkdirSync(unzippedLocation);
          }

          //find some static resources
          var allFiles = walkSync(topLevelAbsolute+'/');

          //console.log(allFiles);
          //for each of the zip files
          for (var i=0; i<allFiles.length; i++){
            //console.log(allFiles[i]);
            var fullRelative = allFiles[i].replace(topLevelAbsolute+'/', '').replace(".resource", '');
            //console.log(fullRelative);
            var paths = fullRelative.split('/');
            var pathInProgress = 'resource-bundles';
            //recreate the directory structure from the source tree(s)
            for (var k=0; k<paths.length; k++){
              pathInProgress = pathInProgress + '/' + paths[k]
              //console.log(pathInProgress);
              if (!fs.existsSync(pathInProgress)){
                fs.mkdirSync(pathInProgress);
              }
            }
            //console.log("destination folder: " +  unzippedLocation + '/' +  fullRelative );
            //fs.createReadStream(allFiles[i]).pipe(unzip.Extract({ path: unzippedLocation + '/' +  fullRelative}));
            //nodeJsZip.unzip(path.join(__dirname,"./demo.zip"),callback);
            decompress(allFiles[i], unzippedLocation + '/' +  fullRelative, {
              plugins: [
                  decompressUnzip()
              ]
            });
            console.log('Files decompressed to ' + fullRelative);
          }

        } else {
          console.log("no config file. going up a directory");
          process.chdir('..');
        }
      }
    }
  };
}());

