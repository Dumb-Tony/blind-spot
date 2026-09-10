import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const dist=path.join(root,"dist");
const html=fs.readFileSync(path.join(dist,"index.html"),"utf8");
const css=fs.readFileSync(path.join(dist,"styles.css"),"utf8");
const matter=fs.readFileSync(path.join(dist,"vendor/matter.min.js"),"utf8");
const data=fs.readFileSync(path.join(dist,"game-data.js"),"utf8");
const game=fs.readFileSync(path.join(dist,"game.js"),"utf8");
const standalone=html
  .replace('<link rel="stylesheet" href="styles.css">',`<style>\n${css}\n</style>`)
  .replace('<script src="vendor/matter.min.js"></script>',`<script>\n${matter}\n</script>`)
  .replace('<script src="game-data.js"></script>',`<script>\n${data}\n</script>`)
  .replace('<script src="game.js"></script>',`<script>\n${game}\n</script>`);
fs.writeFileSync(path.join(dist,"blind-spot-standalone.html"),standalone);
console.log(`Built ${path.join(dist,"blind-spot-standalone.html")} (${standalone.length} bytes)`);
