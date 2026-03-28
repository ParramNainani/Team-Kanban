const fs = require('fs');
let c = fs.readFileSync('app/(dashboard)/chat/page.tsx', 'utf8');

const closingSelect =                   </option>
                ))}
              </select>;

const newClosingSelect =                   </option>
                ))}
              </select>
              </div>;

c = c.replace(closingSelect, newClosingSelect);

fs.writeFileSync('app/(dashboard)/chat/page.tsx', c);
