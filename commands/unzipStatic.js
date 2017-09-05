//const forceUtils = require('../lib/forceUtils.js');
// const {
//   exec
// } = require('child_process');
const fs = require("fs");
//const fse = require("fs-extra");
//const path = require("path");
const decompress = require("decompress");
const _ = require("lodash");
const decompressUnzip = require("decompress-unzip");
//const parseXML = require("xml2js").parseString;
const walkSync = require("../lib/staticCommon.js").walkSync;

(function () {
  "use strict";

  module.exports = {
    topic: "static",
    command: "unzip",
    description: "unzip static resources",
    help: "unzips static resource(s) of type application/zip to a local folder called resource-bundles.  This will reside at the top level of your sfdx project."
    /*flags: [{
      name: "name",
      char: "n",
      description: "static resource name (omit to do all of them)",
      hasValue: true,
      required: false
    }, {
      name: "outputdir",
      char: "d",
      description: "folder for saving the created files",
      hasValue: true,
      required: false
    }]*/,
    run(context) {
      var topLevelAbsolute, config;
      const unzippedLocation = "resource-bundles";

      //const target = context.flags.name;
      //const outputdir = context.flags.outputdir;

      while (!topLevelAbsolute){
        if (fs.existsSync("sfdx-project.json")){
          topLevelAbsolute = process.cwd();
        } else {
          console.log("no config file. going up a directory");
          process.chdir("..");
        }
      }

      //ok, we're in top-level.  Read the config file to see what directories we need to look in.
      config = JSON.parse(fs.readFileSync("sfdx-project.json", "utf8"));
      //console.log(config);

      //create the folder.  Rename it up higher if you don't like resource-bundles
      if (!fs.existsSync(unzippedLocation)){
        fs.mkdirSync(unzippedLocation);
      }

      //find some static resources in package directories
      var allFiles = [];
      _.forEach(config.packageDirectories, function(pd){
        _.merge(allFiles, walkSync(topLevelAbsolute + "/" + pd.path + "/"));
      });

      //for each of the zip files
      _.forEach(allFiles, function(file){
        var fullRelative = file.replace(topLevelAbsolute+"/", "").replace(".resource", "");
        //console.log(fullRelative);
        var paths = fullRelative.split("/");
        var pathInProgress = unzippedLocation;
        //recreate the directory structure from the source tree(s)
        _.forEach(paths, function(pathSlice){
          pathInProgress = pathInProgress + "/" + pathSlice;
          //console.log(pathInProgress);
          if (!fs.existsSync(pathInProgress)){
            fs.mkdirSync(pathInProgress);
          }
        });

        decompress(file, unzippedLocation + "/" +  fullRelative, {
          plugins: [ decompressUnzip() ]
        });

        console.log("Files decompressed to " + fullRelative);
      });
    }
  };
}());

