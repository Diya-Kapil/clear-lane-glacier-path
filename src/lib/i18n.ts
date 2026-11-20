/** Tiny dictionary for interface chrome (English + Hindi stretch goal). */
import { useAppStore } from "@/store/app-store";

const dict = {
  en: {
    skip: "Skip to main content",
    home: "Home", prefs: "Preferences", find: "Find a dealership", report: "Report a problem",
    status: "My status", advisor: "Advisor", impact: "Impact",
    display: "Display", textSize: "Text size", contrast: "High contrast", theme: "Dark theme", language: "Language",
    soundOff: "Sound-off mode", soundOffOn: "Sound off — no audio will play",
    heroTitle: "A service visit you can see, read and approve.",
    heroBody: "Clear Lane turns every spoken step at the service desk into text, captions and visuals. Works completely with the sound off.",
    imCustomer: "I'm a customer", imCustomerBody: "Set your communication needs, book a visit, show us the problem and follow every step on screen.",
    imAdvisor: "I'm a service advisor", imAdvisorBody: "See each customer's preferences, use live captions, send written estimates and log every accommodation.",
    start: "Start", openAdvisor: "Open advisor view",
    prototype: "Prototype: mock data. All people, cars and dealerships are fictional.",
  },
  hi: {
    skip: "मुख्य सामग्री पर जाएँ",
    home: "होम", prefs: "पसंद", find: "डीलरशिप खोजें", report: "समस्या बताएँ",
    status: "मेरी स्थिति", advisor: "सलाहकार", impact: "प्रभाव",
    display: "डिस्प्ले", textSize: "अक्षर का आकार", contrast: "उच्च कंट्रास्ट", theme: "डार्क थीम", language: "भाषा",
    soundOff: "बिना आवाज़ मोड", soundOffOn: "आवाज़ बंद — कोई ऑडियो नहीं चलेगा",
    heroTitle: "ऐसी सर्विस विज़िट जिसे आप देख, पढ़ और मंज़ूर कर सकें।",
    heroBody: "Clear Lane सर्विस डेस्क की हर बोली गई बात को टेक्स्ट, कैप्शन और चित्रों में बदलता है। पूरी तरह बिना आवाज़ के काम करता है।",
    imCustomer: "मैं ग्राहक हूँ", imCustomerBody: "अपनी संवाद पसंद चुनें, विज़िट बुक करें, समस्या दिखाएँ और हर कदम स्क्रीन पर देखें।",
    imAdvisor: "मैं सर्विस सलाहकार हूँ", imAdvisorBody: "ग्राहक की पसंद देखें, लाइव कैप्शन चलाएँ, लिखित अनुमान भेजें और हर सुविधा दर्ज करें।",
    start: "शुरू करें", openAdvisor: "सलाहकार व्यू खोलें",
    prototype: "प्रोटोटाइप: नकली डेटा। सभी लोग, कारें और डीलरशिप काल्पनिक हैं।",
  },
} as const;

export type TKey = keyof (typeof dict)["en"];

export function useT() {
  const lang = useAppStore((s) => s.settings.lang);
  return (k: TKey) => dict[lang][k] ?? dict.en[k];
}
