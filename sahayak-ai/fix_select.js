const fs = require('fs');
let c = fs.readFileSync('app/(dashboard)/chat/page.tsx', 'utf8');

const oldSelect = <div className="flex items-center space-x-1 mb-0.5">
              <select
                value={speechLang}
                onChange={(e) => setSpeechLang(e.target.value)}
                className="bg-transparent text-gray-500 hover:text-gray-300 text-xs outline-none cursor-pointer p-1 appearance-none text-center font-medium font-mono"
                title="Select Voice Language"
              >;

const newSelect = <div className="flex items-center space-x-2 mb-0.5">
              <div className="relative group">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-hover:text-[#E15A15] pointer-events-none transition-colors" />
                <select
                  value={speechLang}
                  onChange={(e) => setSpeechLang(e.target.value)}
                  className="bg-[#2a2a2a]/50 border border-[#444] text-gray-300 hover:text-white hover:border-[#E15A15] text-xs outline-none cursor-pointer py-1.5 pl-8 pr-3 rounded-full appearance-none transition-all mr-1 shadow-sm font-medium"
                  title="Select Voice Language"
                >;

c = c.replace(oldSelect, newSelect);

const oldImports = import { ArrowUp, Loader2, Mic, MicOff, AlertCircle, RefreshCw, Paperclip, X } from "lucide-react";;
const newImports = import { ArrowUp, Loader2, Mic, MicOff, AlertCircle, RefreshCw, Paperclip, X, Globe } from "lucide-react";;

c = c.replace(oldImports, newImports);

fs.writeFileSync('app/(dashboard)/chat/page.tsx', c);
