const fs = require('fs');
let c = fs.readFileSync('app/(dashboard)/chat/page.tsx', 'utf8');

c = c.replace(
  'import { Bot, User, Send, MessageSquare, Plus, Menu, Mic, MicOff, Loader2, Volume2, LogIn, LogOut, Paperclip, X } from "lucide-react";',
  'import { Bot, User, Send, MessageSquare, Plus, Menu, Mic, MicOff, Loader2, Volume2, LogIn, LogOut, Paperclip, X, Globe, ChevronDown } from "lucide-react";'
);

c = c.replace(
  'const [speechLang, setSpeechLang] = useState("en-IN");',
  'const [speechLang, setSpeechLang] = useState("en-IN");\n  const [showLangDropdown, setShowLangDropdown] = useState(false);'
);

const oldUI = <div className="flex items-center space-x-1 mb-0.5">
              <select
                value={speechLang}
                onChange={(e) => setSpeechLang(e.target.value)}
                className="bg-transparent text-gray-500 hover:text-gray-300 text-xs outline-none cursor-pointer p-1 appearance-none text-center font-medium font-mono"
                title="Select Voice Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>;

const newUI = <div className="relative flex items-center space-x-1 mb-0.5 mr-2">
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#333] hover:border-[#E15A15]/50 text-gray-300 text-xs px-3 py-1.5 rounded-full transition-all shadow-sm"
                title="Select Voice Language"
              >
                <Globe size={14} className="text-[#E15A15]" />
                <span className="font-semibold font-mono tracking-wider">{SUPPORTED_LANGUAGES.find(l => l.value === speechLang)?.label || 'EN'}</span>
                <ChevronDown size={12} className="text-gray-500" />
              </button>
              
              {showLangDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                  <div className="absolute bottom-full left-0 mb-3 w-40 max-h-64 overflow-y-auto bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl p-1.5 z-50 transform origin-bottom-left custom-scrollbar">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => { setSpeechLang(lang.value); setShowLangDropdown(false); }}
                        className={\w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-all \\}
                      >
                        <span>{lang.label}</span>
                        <span className="text-[10px] opacity-40">{lang.value.split('-')[0].toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </>
              )};

c = c.replace(oldUI, newUI);

fs.writeFileSync('app/(dashboard)/chat/page.tsx', c);
