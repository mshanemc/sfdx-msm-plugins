const { execSync } = require('child_process');
const tmpDir = 'mdapiout';

function errorHandler(result, successMessage) {
	console.log(successMessage);
}

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

			let result = execSync(`sfdx force:mdapi:retrieve -s -p "${context.flags.packageName}" -u ${context.flags.sourceOrg}  -r ./${tmpDir} -w 30`);
			errorHandler(result, 'Package Retrieved.  Unzipping...');

			result = execSync(`unzip -o ./${tmpDir}/unpackaged.zip -d ./${tmpDir}`);
			errorHandler(result, 'Package Unzipped.  Converting...');

			result = execSync(`sfdx force:mdapi:convert -r ./${tmpDir} -d ${dest}`);
			errorHandler(result, 'Package Converted.  Cleaning up...');

			result = execSync(`rm -rf ./${tmpDir}`);
			errorHandler(result, 'Done!');

		}
	};


}());