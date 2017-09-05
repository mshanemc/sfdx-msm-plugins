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

### Things you can't do:

zip/unzip an individual file (just use CLI zip...this is for doing a bunch in bulk!)