const fs = require('fs');
let c = fs.readFileSync('app/(dashboard)/chat/page.tsx', 'utf8');

c = c.replace(
  'const SUPPORTED_LANGUAGES = [\n  { value: "en-IN", label: "EN" },\n  { value: "hi-IN", label: "HI" },\n  { value: "bn-IN", label: "BN" },\n  { value: "af-ZA", label: "AF" },\n  { value: "ar-SA", label: "AR" },\n  { value: "bg-BG", label: "BG" },\n  { value: "cs-CZ", label: "CS" },\n  { value: "da-DK", label: "DA" },\n  { value: "de-DE", label: "DE" },\n  { value: "el-GR", label: "EL" },\n  { value: "es-ES", label: "ES" },\n  { value: "fi-FI", label: "FI" },\n  { value: "fr-FR", label: "FR" },\n  { value: "gu-IN", label: "GU" },\n  { value: "he-IL", label: "HE" },\n  { value: "hr-HR", label: "HR" },\n  { value: "hu-HU", label: "HU" },\n  { value: "id-ID", label: "ID" },\n  { value: "it-IT", label: "IT" },\n  { value: "ja-JP", label: "JA" },\n  { value: "kn-IN", label: "KN" },\n  { value: "ko-KR", label: "KO" },\n  { value: "ml-IN", label: "ML" },\n  { value: "mr-IN", label: "MR" },\n  { value: "nl-NL", label: "NL" },\n  { value: "no-NO", label: "NO" },\n  { value: "pa-IN", label: "PA" },\n  { value: "pl-PL", label: "PL" },\n  { value: "pt-BR", label: "PT" },\n  { value: "ro-RO", label: "RO" },\n  { value: "ru-RU", label: "RU" },\n  { value: "sv-SE", label: "SV" },\n  { value: "ta-IN", label: "TA" },\n  { value: "te-IN", label: "TE" },\n  { value: "tr-TR", label: "TR" },\n  { value: "uk-UA", label: "UK" },\n  { value: "ur-IN", label: "UR" },\n  { value: "vi-VN", label: "VI" },\n  { value: "zh-CN", label: "ZH" },\n];',
  'const SUPPORTED_LANGUAGES = [\n  { value: "en-IN", label: "English" },\n  { value: "hi-IN", label: "Hindi" },\n  { value: "bn-IN", label: "Bengali" },\n  { value: "af-ZA", label: "Afrikaans" },\n  { value: "ar-SA", label: "Arabic" },\n  { value: "bg-BG", label: "Bulgarian" },\n  { value: "cs-CZ", label: "Czech" },\n  { value: "da-DK", label: "Danish" },\n  { value: "de-DE", label: "German" },\n  { value: "el-GR", label: "Greek" },\n  { value: "es-ES", label: "Spanish" },\n  { value: "fi-FI", label: "Finnish" },\n  { value: "fr-FR", label: "French" },\n  { value: "gu-IN", label: "Gujarati" },\n  { value: "he-IL", label: "Hebrew" },\n  { value: "hr-HR", label: "Croatian" },\n  { value: "hu-HU", label: "Hungarian" },\n  { value: "id-ID", label: "Indonesian" },\n  { value: "it-IT", label: "Italian" },\n  { value: "ja-JP", label: "Japanese" },\n  { value: "kn-IN", label: "Kannada" },\n  { value: "ko-KR", label: "Korean" },\n  { value: "ml-IN", label: "Malayalam" },\n  { value: "mr-IN", label: "Marathi" },\n  { value: "nl-NL", label: "Dutch" },\n  { value: "no-NO", label: "Norwegian" },\n  { value: "pa-IN", label: "Punjabi" },\n  { value: "pl-PL", label: "Polish" },\n  { value: "pt-BR", label: "Portuguese" },\n  { value: "ro-RO", label: "Romanian" },\n  { value: "ru-RU", label: "Russian" },\n  { value: "sv-SE", label: "Swedish" },\n  { value: "ta-IN", label: "Tamil" },\n  { value: "te-IN", label: "Telugu" },\n  { value: "tr-TR", label: "Turkish" },\n  { value: "uk-UA", label: "Ukrainian" },\n  { value: "ur-IN", label: "Urdu" },\n  { value: "vi-VN", label: "Vietnamese" },\n  { value: "zh-CN", label: "Chinese" },\n];'
);

const oldUIBlock = <div className="relative flex items-center space-x-1 mb-0.5">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center justify-center p-2 text-xs font-bold font-mono text-gray-400 hover:text-[#E15A15] hover:bg-[#2a2a2a] transition-colors rounded-full relative group"
                title="Select Voice Language"
              >
                <div className="absolute inset-0 bg-[#E15A15]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">{SUPPORTED_LANGUAGES.find(l => l.value === speechLang)?.label || "EN"}</span>
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

const newUIBlock = <div className="relative flex items-center mb-0.5">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center space-x-1.5 p-1.5 px-2 text-xs font-semibold text-gray-400 hover:text-[#E15A15] hover:bg-[#2a2a2a] transition-all rounded-full relative group"
                title="Select Voice Language"
              >
                <div className="absolute inset-0 bg-[#E15A15]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 tracking-wide">{SUPPORTED_LANGUAGES.find(l => l.value === speechLang)?.label || "English"}</span>
              </button>
              
              {showLangDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                  <div className="absolute bottom-full left-0 mb-3 w-48 max-h-64 overflow-y-auto bg-[#1a1a1a]/95 backdrop-blur-md border border-[#333] rounded-2xl shadow-2xl p-2 z-50 transform origin-bottom-left custom-scrollbar">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => { setSpeechLang(lang.value); setShowLangDropdown(false); }}
                        className={\w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-all \\}
                      >
                        <span className="font-medium">{lang.label}</span>
                        <span className="text-[10px] font-mono opacity-50 bg-[#333] px-1.5 py-0.5 rounded-md">{lang.value.split('-')[0].toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </>
              )};

c = c.replace(oldUIBlock, newUIBlock);

fs.writeFileSync('app/(dashboard)/chat/page.tsx', c);
