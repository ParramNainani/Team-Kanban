const fs = require('fs');
let c = fs.readFileSync('components/landing/LandingPage.tsx', 'utf8');

c = c.replace('            <DemoPanel />\r\n            </div>\r\n          </section>',
`            <DemoPanel />
            </div>
          </section>

          <AnalyticsSection />`);

fs.writeFileSync('components/landing/LandingPage.tsx', c);
