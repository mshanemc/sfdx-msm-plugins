const forceUtils = require('../lib/forceUtils');
const fs = require('fs');

(function () {
	'use strict';

	module.exports = {
		topic: 'data',
		command: 'file:upload',
		description: 'upload a file from local resources',
		help: 'uploads a file to Salesforce from local resources',
    flags: [{
				name: 'name',
				char: 'n',
				description: 'optional name for the file (defaults to local filename if not provided)',
				hasValue: true,
				required: false
			},
			{
				name: 'file',
				char: 'f',
				description: 'REQUIRED path to the local file that\'s being uploaded',
				hasValue: true,
				required: true
			},
			{
				name: 'parentId',
				char: 'p',
				description: 'optional ID that the file should be attached to',
				hasValue: true,
				required: false
			},
			{
				name: 'chatterId',
				char: 'c',
				description: 'optional ID that the file should be attached to as a chatter content post',
				hasValue: true,
				required: false
			},
			{
				name: 'targetusername',
				char: 'u',
				description: 'username for the target org',
				hasValue: true,
				required: false
		}],
		run(context) {
			let targetUsername = context.flags.targetusername;

			forceUtils.getOrg(targetUsername, (org) => {
				org.force._getConnection(org, org.config).then((conn) => {
					targetUsername = org.authConfig.username;
					fs.readFile(context.flags.file, function (err, filedata) {
						if (err){
							console.error(err);
						} else {
							let base64data = new Buffer(filedata).toString('base64');
							let data = {
								VersionData: base64data,
								PathOnClient: context.flags.file
							};

							// if (context.flags.parentId){
							// 	data.ParentId = context.flags.parentId;
							// }

							// if (context.flags.fileType) {
							// 	data.ContentType = context.flags.fileType;
							// }

							if (context.flags.name) {
								data.Title = context.flags.name;
							}
							// } else {
							// 	data.Name = 'Uploaded File'; //TODO: make it use the last portion of the filename
							// }

							conn.sobject('ContentVersion').create( data, function (uploadErr, CV){
								if (uploadErr) {
									console.log(uploadErr);
								} else {
									console.log(CV);
									if (context.flags.parentId){
										//get the contentDocumentId
										conn.query(`Select Id, ContentDocumentId from ContentVersion where Id='${CV.id}'`, function (queryError, result){
											if (queryError) {
												console.log(queryError);
											} else {
												console.log(result.records[0]);
												conn.sobject('ContentDocumentLink').create({
													ContentDocumentId : result.records[0].ContentDocumentId,
													LinkedEntityId: context.flags.parentId,
													ShareType : 'V'
												}, function (cdlError, cdlResult){
													if (cdlError){
														console.log(`Error: ${cdlError}`);
													} else {
														console.log('file attached to record');
														console.log(cdlResult);
													}
												});
											}
										});
									} else if (context.flags.chatterId){
										conn.sobject('FeedItem').create({
											RelatedRecordId: CV.id,
											ParentId: context.flags.chatterId,
											Type: 'ContentPost'
										}, function (chatterError, chatterResult) {
											if (chatterError) {
												console.log(`Error: ${chatterError}`);
											} else {
												console.log('file attached to record\'s chatter feed');
												console.log(chatterResult);
											}
										});
									}
								}
							});
						}
					});
				});
			});
		}
	};
}());