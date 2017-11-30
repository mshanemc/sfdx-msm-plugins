const exec = require('child-process-promise').exec;
const tmpDir = 'mdapiout';

(function () {
	'use strict';

	module.exports = {
		topic: 'mdapi',
		command: 'package:get',
		description: 'gets package from an org, converts, and merges it into the local source',
		help: 'You\'ve made a v1 package in an org and want to pull that metadata into your local source',
    flags: [{
      name: 'packageName',
      char: 'p',
      description: 'Name of the packageVersion you want to pull down.  Should start with 04t',
      hasValue: true,
      required: true
    }, {
      name: 'sourceOrg',
      char: 'u',
      description: 'username/alias of org where the package is',
      hasValue: true,
      required: true
		}, {
			name: 'destination',
			char: 'd',
			description: 'where to put the converted source.  Default is force-app',
			hasValue: true,
			required: false
		}],
		run(context) {
			const dest = context.flags.destination || './force-app';

			exec(`sfdx force:mdapi:retrieve -s -p "${context.flags.packageName}" -u ${context.flags.sourceOrg}  -r ./${tmpDir} -w 30`)
			.then( (result)=>{
				console.log('Package Retrieved.  Unzipping...');
				return exec(`unzip ./${tmpDir}/unpackaged.zip -d ./${tmpDir}`);
			})
			.then( (result) =>{
				console.log('Package Unzipped.  Converting...');
				return exec(`sfdx force:mdapi:convert -r ./${tmpDir} -d ${dest}`);
			})
			.then( (result) => {
				console.log('Package Converted.  Cleaning up...');
				return exec(`rm -rf ./${tmpDir}`);
			})
			.then( (result)=>{
				console.log('Done!');
			})
			.catch((result) => { console.log(result.stderr);});
		}
	};
}());