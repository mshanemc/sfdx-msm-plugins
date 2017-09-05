//const forceUtils = require('../lib/forceUtils.js');
/*const {
  exec
} = require('child_process');*/
const fs = require("fs");
//const fse = require("fs-extra");
//const path = require("path");
//const parseXML = require("xml2js").parseString;
const archiver = require("archiver");
const _ = require("lodash");
const walkSync = require("../lib/staticCommon.js").walkSync;


(function () {
  "use strict";

  module.exports = {
    topic: "static",
    command: "zip",
    description: "zip static resources",
    help: "zips static resource(s) of type application/zip from local source folder to their original location in the tree",
    run(context) {
      var topLevelAbsolute, config;
      const unzippedLocation = "resource-bundles";

      //const target = context.flags.name;
      //const outputdir = context.flags.outputdir;

      // var walkSync = function(dir, filelist) {
      //   var files = fs.readdirSync(dir);
      //   filelist = filelist || [];
      //   files.forEach(function(file) {
      //     if (fs.statSync(dir + file).isDirectory()) {
      //       filelist = walkSync(dir + file + "/", filelist); //recursive walk of any directories found
      //     } else if (file.includes(".resource") && !file.includes(".resource-meta.xml")){ //see if the file is zipped type?

      //         var fullpath = dir  + file;
      //         var meta = fs.readFileSync(fullpath + "-meta.xml", "utf8");

      //         parseXML(meta, function(err, result){
      //           if (err){
      //             console.log(err);
      //           } else {
      //             //console.log(result.StaticResource.contentType[0]);
      //             if (result.StaticResource.contentType &&  result.StaticResource.contentType[0]==="application/zip"){
      //               filelist.push(fullpath);
      //             }
      //           }
      //         });
      //     }
      //   });
      //   return filelist;
      // };


      while (!topLevelAbsolute){
        if (fs.existsSync("sfdx-project.json")){
          topLevelAbsolute = process.cwd();
        } else {
          console.log("no config file. going up a directory");
          process.chdir("..");
        }
      }

      //check for existence of folder.  If you can't find it, that's a problem
      if (!fs.existsSync(unzippedLocation)){
        throw new Error("resource-bundles folder was not found");
      }

      config = JSON.parse(fs.readFileSync("sfdx-project.json", "utf8"));

      //find some static resources
      var allFiles = [];
      _.forEach(config.packageDirectories, function(pd){
        _.merge(allFiles, walkSync(topLevelAbsolute + "/" + pd.path + "/"));
      });

      //for each of the static resource files
      var archive = archiver("zip", {
        zlib: { level: 9 } // Sets the compression level.
      });

      _.forEach(allFiles, function(file){
        var resourceDir = unzippedLocation + "/" + file.replace(topLevelAbsolute+"/", "").replace(".resource", "");
        //console.log("will compress:");

        var output = fs.createWriteStream(file);

        archive.pipe(output);
        archive.directory(resourceDir, false);
      });

      archive.finalize();

    }
  };
}());

