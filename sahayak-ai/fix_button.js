const fs = require('fs');
let c = fs.readFileSync('app/(dashboard)/chat/page.tsx', 'utf8');

const oldButton = <span className="relative z-10">{SUPPORTED_LANGUAGES.find(l => l.value === speechLang)?.label || "EN"}</span>;
const newButton = <span className="relative z-10">{SUPPORTED_LANGUAGES.find(l => l.value === speechLang)?.label || "English"}</span>;

c = c.replace(oldButton, newButton);

fs.writeFileSync('app/(dashboard)/chat/page.tsx', c);
