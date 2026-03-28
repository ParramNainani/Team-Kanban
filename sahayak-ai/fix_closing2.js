const fs = require('fs');
let c = fs.readFileSync('app/(dashboard)/chat/page.tsx', 'utf8');

c = c.replace(
  '                  {SUPPORTED_LANGUAGES.map((lang) => (\n                    <option key={lang.value} value={lang.value}>\n                      {lang.label}\n                    </option>\n                  ))}\n                </select>',
  '                  {SUPPORTED_LANGUAGES.map((lang) => (\n                    <option key={lang.value} value={lang.value} className="bg-[#111] text-gray-300">\n                      {lang.label}\n                    </option>\n                  ))}\n                </select>\n              </div>'
);

const oldImports = import { ArrowUp, Loader2, Mic, MicOff, AlertCircle, RefreshCw, Paperclip, X } from "lucide-react";;
const newImports = import { ArrowUp, Loader2, Mic, MicOff, AlertCircle, RefreshCw, Paperclip, X, Globe } from "lucide-react";;

c = c.replace(oldImports, newImports);


fs.writeFileSync('app/(dashboard)/chat/page.tsx', c);
