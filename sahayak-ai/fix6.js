const fs = require('fs');
let c = fs.readFileSync('components/landing/LandingPage.tsx', 'utf8');

c = c.replace('import { HowItWorksSection } from "./HowItWorksSection";`r`nimport { AnalyticsSection } from "./AnalyticsSection";', 
'import { HowItWorksSection } from "./HowItWorksSection";\nimport { AnalyticsSection } from "./AnalyticsSection";');

c = c.replace('<DemoPanel />\n          </section>\n          \n          <AnalyticsSection />\n\n          <section>\n            </div>\n          </section>',
'<DemoPanel />\n            </div>\n          </section>\n          <AnalyticsSection />');

fs.writeFileSync('components/landing/LandingPage.tsx', c);
