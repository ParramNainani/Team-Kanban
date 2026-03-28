const fs = require('fs');

let c = fs.readFileSync('components/landing/Navbar.tsx', 'utf8');

c = c.replace(
  'import { useReducedMotion } from "./useReducedMotion";',
  'import { useReducedMotion } from "./useReducedMotion";\nimport { useAuth } from "@/components/AuthProvider";'
);

c = c.replace(
  'const [active, setActive] = useState<string>("hero");',
  'const [active, setActive] = useState<string>("hero");\n  const { user, signInWithGoogle, signOut } = useAuth();'
);

c = c.replace(
  '<Link href="/chat" className={primaryCtaClassName}>\n              Try Chat Now\n            </Link>',
  {user ? (
              <>
                <Link href="/chat" className={primaryCtaClassName}>
                  Go to Chat
                </Link>
                <button onClick={signOut} className="rounded-lg px-3 py-2 text-sm font-medium text-[#635E5C] hover:text-slate-900 transition">
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={signInWithGoogle} className={primaryCtaClassName}>
                Sign In / Sign Up
              </button>
            )}
);

fs.writeFileSync('components/landing/Navbar.tsx', c);
