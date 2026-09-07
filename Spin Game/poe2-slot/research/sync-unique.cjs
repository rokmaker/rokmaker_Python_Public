'use strict';
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const audit=JSON.parse(fs.readFileSync(path.join(__dirname,'unique-weapon-skills.json'),'utf8'));
const data=require(path.join(base,'data.js'));
data.gems=data.gems.filter(g=>g.origin!=='unique-weapon').concat(audit.skills);
fs.writeFileSync(path.join(base,'data.js'),'// Data snapshot from PoE2DB. See SOURCES.md.\n(function(root) {\n  const data = '+JSON.stringify(data,null,2)+';\n  if (typeof module === "object" && module.exports) module.exports = data;\n  else root.POE_DATA = data;\n})(typeof globalThis !== "undefined" ? globalThis : this);\n');
