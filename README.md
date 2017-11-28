Making SFDX flow easier.

## Setup

Install plugin: `sfdx plugins:install sfdx-msm-plugin`

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

### Setting a user's Chatter profile pic
`sfdx msm:user:photo -g Oscar -l Mayer -f ~/Downloads/King.png`

Sets the chatter photo for the user who has a first name Oscar and last name Mayer.  I used -g for first name (given name) since -f usually refers to a file elsewhere in sfdx commands.

---

### Things you can't do:

zip/unzip an individual file (just use CLI zip...this is for doing a bunch in bulk!)