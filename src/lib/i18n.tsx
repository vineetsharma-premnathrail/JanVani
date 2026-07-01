"use client";

/* ------------------------------------------------------------------
   Lightweight i18n. No heavy library — just typed dictionaries and a
   context. Language choice persists in localStorage. Add a locale by
   extending `dictionaries` and `LOCALES`.
   ------------------------------------------------------------------ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const LOCALES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

type Dict = typeof dictionaries.en;

export const dictionaries = {
  en: {
    nav: { how: "How it works", impact: "For your MP", submit: "Raise your voice", signIn: "Sign in" },
    hero: {
      badge: "Citizen voice, measured and mapped",
      titleA: "Your street knows",
      titleB: "what it needs.",
      titleC: "Now your MP will too.",
      sub: "Speak, type, or snap a photo of what your area needs. JanVaani turns thousands of voices — in your language — into a ranked, evidence-backed plan your representative can act on.",
      ctaPrimary: "Raise your voice",
      ctaSecondary: "See how it works",
      trust: "No literacy needed · Works by voice · Free & anonymous option",
    },
    stats: {
      voices: "Voices heard",
      themes: "Needs identified",
      areas: "Areas mapped",
      langs: "Languages",
    },
    how: {
      eyebrow: "How it works",
      title: "From a spoken word to a funded work.",
      s1t: "You speak up",
      s1d: "Record a voice note, type, or upload a photo in any of 5 languages. A broken road, a distant school, a dry borewell — whatever your area needs.",
      s2t: "AI listens & groups",
      s2d: "Your submission is transcribed, understood, and grouped with others raising the same need — so one road complained about 400 times counts as 400 voices, not 400 problems.",
      s3t: "Demand meets data",
      s3d: "Needs are weighed against real numbers — population, school enrolment, travel distance, existing gaps — not against who shouted loudest.",
      s4t: "Your MP acts",
      s4d: "Your representative sees a ranked, mapped, defensible list of priority works — and can direct development funds where demand truly is.",
    },
    forMp: {
      eyebrow: "For your representative",
      title: "An objective priority list, not a pile of letters.",
      body: "MPs receive requests through meetings, letters, social media and portals — while development plans hold dozens of competing projects. JanVaani consolidates every channel, spots recurring needs, maps demand hotspots, and ranks works against public data.",
      b1: "Every channel in one ledger",
      b2: "Recurring needs surfaced automatically",
      b3: "Demand hotspots on a live map",
      b4: "Competing proposals compared on evidence",
      cta: "MP / office sign-in",
    },
    submit: {
      eyebrow: "Raise your voice",
      title: "Tell us what your area needs.",
      sub: "It takes a minute. Speak in your own language — you don't need to write.",
      voiceTab: "Speak",
      textTab: "Type",
      photoTab: "Photo",
      voiceHint: "Tap the mic and describe the problem in your own words.",
      recordStart: "Tap to record",
      recordStop: "Tap to stop",
      recording: "Listening…",
      recorded: "Recorded — tap play to review",
      textLabel: "Describe the need",
      textPlaceholder: "e.g. The road to the government school floods every monsoon and children can't reach class…",
      photoLabel: "Add a photo (optional)",
      photoHint: "A picture of the issue helps your MP see it.",
      categoryLabel: "What is this about?",
      categories: ["Roads & transport", "Water & sanitation", "Education", "Health", "Electricity", "Livelihood", "Other"],
      locationLabel: "Which area?",
      locationPlaceholder: "Village / ward / landmark",
      useLocation: "Use my location",
      anonToggle: "Submit anonymously",
      submitBtn: "Send to my MP",
      privacy: "Your contact is never shown publicly. Anonymous submissions are still counted.",
    },
    auth: {
      eyebrow: "Sign in",
      citizenTitle: "Welcome. Your voice matters.",
      citizenSub: "Sign in with your phone number — no password to remember.",
      phoneLabel: "Mobile number",
      sendOtp: "Send OTP",
      otpLabel: "Enter the 6-digit code",
      verify: "Verify & continue",
      or: "or",
      google: "Continue with Google",
      mpTitle: "Representative & office",
      mpSub: "Access your constituency dashboard.",
      mpSignIn: "Sign in with Google",
      switchToMp: "I'm an MP or staff member",
      switchToCitizen: "I'm a citizen",
      terms: "By continuing you agree to use JanVaani respectfully and truthfully.",
    },
    footer: {
      tagline: "Citizen voice, measured and mapped.",
      built: "A civic-tech platform for evidence-led development.",
      rights: "Built for the people, with the people.",
    },
    lang: "Language",
  },
  hi: {
    nav: { how: "यह कैसे काम करता है", impact: "आपके सांसद के लिए", submit: "अपनी आवाज़ उठाएँ", signIn: "साइन इन" },
    hero: {
      badge: "नागरिकों की आवाज़, मापी और मानचित्रित",
      titleA: "आपकी गली जानती है",
      titleB: "उसे क्या चाहिए।",
      titleC: "अब आपके सांसद भी जानेंगे।",
      sub: "बोलकर, लिखकर या फ़ोटो खींचकर बताइए कि आपके इलाक़े को क्या चाहिए। जनवाणी हज़ारों आवाज़ों को — आपकी भाषा में — एक क्रमबद्ध, प्रमाण-आधारित योजना में बदल देती है।",
      ctaPrimary: "अपनी आवाज़ उठाएँ",
      ctaSecondary: "यह कैसे काम करता है",
      trust: "पढ़ना-लिखना ज़रूरी नहीं · आवाज़ से चलता है · मुफ़्त और गुमनाम विकल्प",
    },
    stats: { voices: "सुनी गई आवाज़ें", themes: "पहचानी गई ज़रूरतें", areas: "मानचित्रित क्षेत्र", langs: "भाषाएँ" },
    how: {
      eyebrow: "यह कैसे काम करता है",
      title: "एक बोले शब्द से एक पूरे काम तक।",
      s1t: "आप बोलिए",
      s1d: "5 भाषाओं में से किसी में भी आवाज़ रिकॉर्ड कीजिए, लिखिए या फ़ोटो डालिए। टूटी सड़क, दूर का स्कूल, सूखा बोरवेल — जो भी चाहिए।",
      s2t: "एआई सुनता और जोड़ता है",
      s2d: "आपकी बात लिखी जाती है, समझी जाती है और उसी ज़रूरत की बाक़ी आवाज़ों से जोड़ी जाती है — ताकि 400 बार बताई गई एक सड़क 400 आवाज़ें गिनी जाए, 400 समस्याएँ नहीं।",
      s3t: "माँग मिलती है आँकड़ों से",
      s3d: "ज़रूरतें असली आँकड़ों पर तौली जाती हैं — जनसंख्या, स्कूल नामांकन, दूरी, मौजूदा कमी — न कि इस पर कि किसने सबसे ज़ोर से आवाज़ उठाई।",
      s4t: "आपके सांसद कार्रवाई करते हैं",
      s4d: "आपके प्रतिनिधि को प्राथमिकता वाले कामों की एक क्रमबद्ध, मानचित्रित सूची दिखती है — और वे विकास निधि वहाँ लगा सकते हैं जहाँ सच में माँग है।",
    },
    forMp: {
      eyebrow: "आपके प्रतिनिधि के लिए",
      title: "चिट्ठियों का ढेर नहीं, एक वस्तुनिष्ठ प्राथमिकता सूची।",
      body: "सांसदों को बैठकों, चिट्ठियों, सोशल मीडिया और पोर्टलों से अनुरोध मिलते हैं — और विकास योजनाओं में दर्जनों प्रतिस्पर्धी परियोजनाएँ होती हैं। जनवाणी हर माध्यम को जोड़ती है, बार-बार आने वाली ज़रूरतें पहचानती है, और सार्वजनिक आँकड़ों पर कामों को क्रमबद्ध करती है।",
      b1: "हर माध्यम एक ही जगह",
      b2: "बार-बार आने वाली ज़रूरतें अपने आप सामने",
      b3: "माँग के केंद्र एक जीवंत नक़्शे पर",
      b4: "प्रतिस्पर्धी प्रस्ताव प्रमाण पर तुलना",
      cta: "सांसद / कार्यालय साइन-इन",
    },
    submit: {
      eyebrow: "अपनी आवाज़ उठाएँ",
      title: "बताइए आपके इलाक़े को क्या चाहिए।",
      sub: "बस एक मिनट। अपनी भाषा में बोलिए — लिखने की ज़रूरत नहीं।",
      voiceTab: "बोलें",
      textTab: "लिखें",
      photoTab: "फ़ोटो",
      voiceHint: "माइक दबाइए और अपने शब्दों में समस्या बताइए।",
      recordStart: "रिकॉर्ड करने के लिए दबाएँ",
      recordStop: "रोकने के लिए दबाएँ",
      recording: "सुन रहे हैं…",
      recorded: "रिकॉर्ड हो गया — सुनने के लिए चलाएँ",
      textLabel: "ज़रूरत बताइए",
      textPlaceholder: "जैसे: सरकारी स्कूल की सड़क हर बरसात में डूब जाती है और बच्चे नहीं पहुँच पाते…",
      photoLabel: "फ़ोटो जोड़ें (वैकल्पिक)",
      photoHint: "समस्या की तस्वीर आपके सांसद को समझने में मदद करती है।",
      categoryLabel: "यह किस बारे में है?",
      categories: ["सड़क व परिवहन", "पानी व स्वच्छता", "शिक्षा", "स्वास्थ्य", "बिजली", "आजीविका", "अन्य"],
      locationLabel: "कौन-सा क्षेत्र?",
      locationPlaceholder: "गाँव / वार्ड / पहचान-स्थल",
      useLocation: "मेरा स्थान उपयोग करें",
      anonToggle: "गुमनाम रूप से भेजें",
      submitBtn: "मेरे सांसद को भेजें",
      privacy: "आपका संपर्क कभी सार्वजनिक नहीं दिखाया जाता। गुमनाम सुझाव भी गिने जाते हैं।",
    },
    auth: {
      eyebrow: "साइन इन",
      citizenTitle: "स्वागत है। आपकी आवाज़ मायने रखती है।",
      citizenSub: "अपने फ़ोन नंबर से साइन इन करें — कोई पासवर्ड याद रखने की ज़रूरत नहीं।",
      phoneLabel: "मोबाइल नंबर",
      sendOtp: "OTP भेजें",
      otpLabel: "6 अंकों का कोड डालें",
      verify: "सत्यापित करें और आगे बढ़ें",
      or: "या",
      google: "Google से जारी रखें",
      mpTitle: "प्रतिनिधि व कार्यालय",
      mpSub: "अपना क्षेत्र डैशबोर्ड खोलें।",
      mpSignIn: "Google से साइन इन",
      switchToMp: "मैं सांसद या कर्मचारी हूँ",
      switchToCitizen: "मैं एक नागरिक हूँ",
      terms: "जारी रखकर आप जनवाणी का सम्मानपूर्वक और सच्चाई से उपयोग करने के लिए सहमत होते हैं।",
    },
    footer: {
      tagline: "नागरिकों की आवाज़, मापी और मानचित्रित।",
      built: "प्रमाण-आधारित विकास के लिए एक सिविक-टेक मंच।",
      rights: "जनता के लिए, जनता के साथ बनाया गया।",
    },
    lang: "भाषा",
  },
} satisfies Record<string, unknown>;

// Fallback locales that don't yet have a full dictionary reuse English.
function dictFor(locale: Locale): Dict {
  return (dictionaries as Record<string, Dict>)[locale] ?? dictionaries.en;
}

type I18nValue = { locale: Locale; setLocale: (l: Locale) => void; t: Dict };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("janvaani.locale") as Locale | null;
    if (saved) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("janvaani.locale", l);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictFor(locale) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
