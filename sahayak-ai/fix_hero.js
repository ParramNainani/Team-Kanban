const fs = require('fs');
let c = fs.readFileSync('components/landing/HeroSection.tsx', 'utf8');

c = c.replace(
  'import { useReducedMotion } from "./useReducedMotion";',
  'import { useReducedMotion } from "./useReducedMotion";\nimport { useAuth } from "@/components/AuthProvider";'
);

c = c.replace(
  'const { persona } = useLanding();',
  'const { persona } = useLanding();\n  const { user, signInWithGoogle } = useAuth();'
);

c = c.replace(
  '<Link href="/chat" className={primaryCtaClassName}>\n              Get Started Free\n              <ArrowRight className="h-4 w-4" aria-hidden />\n            </Link>',
  {user ? (
              <Link href="/chat" className={primaryCtaClassName}>
                Go to Chat
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <button onClick={signInWithGoogle} className={primaryCtaClassName}>
                Sign In / Sign Up
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            )}
);

fs.writeFileSync('components/landing/HeroSection.tsx', c);
