const fs = require('fs');
const glob = require('fs').readdirSync('routes').map(f => 'routes/' + f);

for (const file of glob) {
  if (!file.endsWith('.js')) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace .create({ ... })
  code = code.replace(/\.create\(\{/g, '.create({ userId: req.body.userId || req.query.userId || "guest", ');
  
  // Replace find() and findOne() and update
  code = code.replace(/userId:\s*"global_user"/g, 'userId: req.body.userId || req.query.userId || "guest"');
  
  // We need to also add userId filtering to find() calls. 
  // For example: Chat.find() => Chat.find({ userId: req.body.userId || req.query.userId || "guest" })
  code = code.replace(/\.find\(\)/g, '.find({ userId: req.body.userId || req.query.userId || "guest" })');
  
  // What if find already has parameters?
  code = code.replace(/\.find\(\{/g, '.find({ userId: req.body.userId || req.query.userId || "guest", ');
  
  // Update findOne
  code = code.replace(/\.findOne\(\{/g, '.findOne({ userId: req.body.userId || req.query.userId || "guest", ');

  fs.writeFileSync(file, code);
}
console.log('Routes updated!');
