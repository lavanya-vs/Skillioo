const fs = require('fs');
const glob = require('fs').readdirSync('routes').map(f => 'routes/' + f);
for (const file of glob) {
  if (!file.endsWith('.js')) continue;
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/userId: req\.body\.userId \|\| req\.query\.userId \|\| "guest",\s*userId: req\.body\.userId \|\| req\.query\.userId \|\| "guest"/g, 'userId: req.body.userId || req.query.userId || "guest"');
  fs.writeFileSync(file, code);
}
console.log('Fixed duplicates!');
