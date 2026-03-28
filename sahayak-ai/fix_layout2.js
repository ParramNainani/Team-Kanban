const fs = require('fs');
let c = fs.readFileSync('components/landing/LandingPage.tsx', 'utf8');

c = c.replace(
  '        <AnalyticsSection />\n\n        <section id="faq"',
  '        <section id="faq"'
);

fs.writeFileSync('components/landing/LandingPage.tsx', c);
