# Username's CSS

## Add a new template
1. Copy `templates/example-theme/` and rename the folder (this is the template's slug).
2. Put your CSS and HTML in `code.html` (CSS inside a `<style>` block, HTML below it).
3. Add `banner.png` and `preview-1.png`, `preview-2.png`, etc. to the same folder.
4. Add an entry to `data/templates.json` (copy an existing one).

## Preview locally
Install the **Live Server** extension in VS Code, right-click `index.html` -> Open with Live Server.
(Opening the file directly will not work because the site loads JSON with fetch.)

## Publish
Push to GitHub -> Settings -> Pages -> deploy from the `main` branch, root folder.
