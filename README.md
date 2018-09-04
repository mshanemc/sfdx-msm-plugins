# Deprecated.  Archived

## don't use this set of plugins.

I migrated these to the oclif-based plugins here
https://github.com/mshanemc/shane-sfdx-plugins

(and added lots more)

---

why are you still here...?


Making SFDX flow easier.

## Setup

Install plugin: `sfdx plugins:install sfdx-msm-plugin`

There's a prompt for 'y' because the package is unsigned.  If you're doing this in a CI environment where no user is at the keyboard, use `echo 'y' | sfdx plugins:install sfdx-msm-plugin` to get around that.  :)

---

## Usage

### unzip all your zipped static resources
`sfdx msm:static:unzip`

This crawls up to the top of your sfdx project, inspects your sfdx-project.json file, and then looks through all your package directories to find any static resources that are zipped files.

Then it creates (if you don't have one already) a folder called **resource-bundles** (a la MavensMate) and unzips them there, preserving the directory paths.

You did want to check those static resources into source, right? :)

---

### zip them all back up
`sfdx msm:static:zip`

Using the same methods, loops through the static resources again, and zips up their local equivalent from the **resource-bundles** folder

---

### Uploading a file
`sfdx msm:data:file:upload -f ~/Downloads/King.png -c 0011900000VkJgrAAF`

Uploads a local file at location `-f` and optionally names it, attaches it in Files or via Chatter.  Don't use -p and -c together.

---

### Setting a user's Chatter profile and/or banner pic
`sfdx msm:user:photo -g Oscar -l Mayer -f ~/Downloads/King.png -b ~/Downloads/banner.png`

Sets the chatter photo for the user who has a first name Oscar and last name Mayer.  I used -g for first name (given name) since -f usually refers to a file elsewhere in sfdx commands.

---

### Manually set a password
`sfdx msm:user:password:set -u cg1 -p sfdx1234 -g Oscar -l Mayer`

Sets Oscar's password to be sfdx1234 in the scratch org whose alias is cg1.

---

### Create an org with a friendly username
`sfdx msm:org:create -f config/project-scratch-def.json -u shane -o junk.test`

All the basic parameters from **force:org:create**, but generates a more customizable url that will be `shane789@junk.test` where the 789 is a unique sequential id for the combination of the -u and -o specified.  There's a service running to issue these ids.


---


### Retrieving a package, unzipping, converting
`sfdx msm:mdapi:package:get -u cg1 -p "Reporting Objects" -d testApp`

The quotes are optional unless you've got a space in the name.  -p is the package name as defined in the UI where you built the package.  -d defaults to force-app but you could store the package somewhere else in your source tree.

---

### Retrieving unpackaged source, unzipping, converting
`sfdx msm:mdapi:pull -u cg1 -c`

Pulls all the code (apex, VF, components, static resources) for the specified non-scratch org and converts them into sfdx source format.  You can specify -d (instead of `force-app`) and also use the improbable-to-work-on-the-first-try `-a` to  pull **nearly everything** (good luck with that!).

---

### Add a remote site setting
`sfdx msm:remotesite:create -u https://google.com -n google -d "you know, for stuff"`

Creates a remote site setting in force-app/main/default (or, with `-t`, the path you specify) with the give url, name, and optional description.  You still need to push it to your org.  Creates in the DX format, not the mdapi format, so do force:source:convert and don't set `-t` to `src`

---

### Things you can't do:

zip/unzip an individual file (just use CLI zip...this is for doing a bunch in bulk!)


---

## Testing

`mocha tests --recursive --watch`