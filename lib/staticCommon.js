const fs = require("fs");
const parseXML = require("xml2js").parseString;

module.exports = {

	walkSync: (dir, filelist) => {
		var files = fs.readdirSync(dir);
		filelist = filelist || [];
		files.forEach(function(file) {
			if (fs.statSync(dir + file).isDirectory()) {
				filelist = module.exports.walkSync(dir + file + "/", filelist); //recursive walk of any directories found
			} else if (file.includes(".resource") && !file.includes(".resource-meta.xml")){ //see if the file is zipped type?

					var fullpath = dir  + file;
					var meta = fs.readFileSync(fullpath + "-meta.xml", "utf8");

					parseXML(meta, function(err, result){
						if (err){
							console.log(err);
						} else {
							//console.log(result.StaticResource.contentType[0]);
							if (result.StaticResource.contentType &&  result.StaticResource.contentType[0]==="application/zip"){
								filelist.push(fullpath);
							}
						}
					});
			}
		});
		return filelist;
	}
};