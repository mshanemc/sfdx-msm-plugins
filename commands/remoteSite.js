//const forceUtils = require('../lib/forceUtils.js');
/*const {
  exec
} = require('child_process');*/
const fs = require("fs");
//const fse = require("fs-extra");
//const path = require("path");
//const parseXML = require("xml2js").parseString;

(function () {
  "use strict";

  module.exports = {
    topic: "remotesite",
    command: "create",
    description: "Adds a remote site setting to the local repo.",
    help: "pass in the url and optional description.  Builds the metadata--you still need to push/deploy it to your org.",
		flags: [
			{
				name: 'url',
				char: 'u',
				description: 'url that you want to allow callouts to',
				hasValue: true,
				required: true
			}, {
				name: 'name',
				char: 'n',
				description: 'name it (Salesforce API compliant name)',
				hasValue: true,
				required: true
			},
			{
				name: 'description',
				char: 'd',
				description: 'description so you can remember why you added this and what it\'s for',
				hasValue: true,
				required: false
			},
			{
				name: 'target',
				char: 't',
				description: 'where to create the folder (if it doesn\'t exist already) and file...defaults to force-app/main-default',
				hasValue: true,
				required: false
			}
		],
		run(context) {
			//validate name
			if (context.flags.name.includes(' ')){
				throw ('spaces are not allowed in the name');
			}

			let searchPath = 'force-app/main/default';
      if (context.flags.target){
				searchPath = context.flags.target;
				if (searchPath.endsWith('/')){
					searchPath = searchPath.substring(0, searchPath.length-1);
					console.log(searchPath);
				}
			}

			if (!fs.existsSync(`${searchPath}/remoteSiteSettings`)){
				fs.mkdirSync(`${searchPath}/remoteSiteSettings`);
			}

			let text = `<?xml version="1.0" encoding="UTF-8"?>
<RemoteSiteSetting xmlns="http://soap.sforce.com/2006/04/metadata">
		<disableProtocolSecurity>false</disableProtocolSecurity>
		<isActive>true</isActive>
		<url>${context.flags.url}</url>
</RemoteSiteSetting>`;

			if (context.flags.description){
				text = `<?xml version="1.0" encoding="UTF-8"?>
<RemoteSiteSetting xmlns="http://soap.sforce.com/2006/04/metadata">
		<description>${context.flags.description}</description>
		<disableProtocolSecurity>false</disableProtocolSecurity>
		<isActive>true</isActive>
		<url>${context.flags.url}</url>
</RemoteSiteSetting>`;
			}

			fs.writeFileSync(`${searchPath}/remoteSiteSettings/${context.flags.name}.remoteSite-meta.xml`, text);
    }
  };
}());

