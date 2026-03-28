const fs = require('fs');
let c = fs.readFileSync('components/landing/LandingPage.tsx', 'utf8');
c = c.replace('import { HowItWorksSection } from './HowItWorksSection';\\
import { AnalyticsSection } from './AnalyticsSection';', 'import { HowItWorksSection } from './HowItWorksSection';\nimport { AnalyticsSection } from './AnalyticsSection';');
c = c.replace('<DemoPanel />', '<DemoPanel />\n          </section>\n          \n          <AnalyticsSection />\n\n          <section>');
fs.writeFileSync('components/landing/LandingPage.tsx', c);
