const fs = require('fs');
let c = fs.readFileSync('app/(dashboard)/chat/page.tsx', 'utf8');

const oldSelect = <div className="flex items-center space-x-1 mb-0.5">
              <select
                value={speechLang}
                onChange={(e) => setSpeechLang(e.target.value)}
                className="bg-transparent text-gray-500 hover:text-gray-300 text-xs outline-none cursor-pointer p-1 appearance-none text-center font-medium font-mono"
                title="Select Voice Language"
              >;

const newSelect = <div className="flex items-center space-x-2 mb-0.5 mr-2 ml-1">
              <div className="relative group flex items-center bg-[#222] border border-[#333] hover:border-[#E15A15]/50 transition-colors rounded-full px-2 py-1">
                <Globe size={14} className="text-gray-400 group-hover:text-[#E15A15] transition-colors" />
                <select
                  value={speechLang}
                  onChange={(e) => setSpeechLang(e.target.value)}
                  className="bg-transparent text-gray-300 hover:text-white text-[13px] outline-none cursor-pointer pl-1.5 pr-2 appearance-none font-medium text-center"
                  title="Select Voice Language"
                >;

c = c.replace(oldSelect, newSelect);

fs.writeFileSync('app/(dashboard)/chat/page.tsx', c);
