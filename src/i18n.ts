type Translations = Record<string, any>;

class SimpleI18n {
  translations: Record<string, Translations> = {};
  locale = 'en';
  defaultLocale = 'en';
  fallbacks = true;

  t = (key: string, opts?: Record<string, any>): string => {
    const val = this.lookup(key, this.locale) ?? (this.fallbacks ? this.lookup(key, this.defaultLocale) : undefined);
    if (val == null) return key;
    if (typeof val === 'string') return this.interpolate(val, opts);
    return String(val);
  };

  private lookup(key: string, locale: string): any {
    const parts = key.split('.');
    let node: any = this.translations[locale];
    for (const p of parts) {
      if (node == null) return undefined;
      node = node[p];
    }
    return node;
  }

  private interpolate(template: string, opts?: Record<string, any>): string {
    if (!opts) return template;
    return template.replace(/\{\{(.*?)\}\}/g, (_, k) => (opts[k.trim()] ?? ''));
  }
}

const I18n = new SimpleI18n();

// Minimal translation keys for demo; extend as needed
I18n.translations = {
  en: {
    common: {
      settings: 'Settings',
      online: 'Online',
      offline: 'Offline',
      syncNow: 'Sync now',
      exportJson: 'Export patient data (JSON)',
      exportCsv: 'Export patient data (CSV)',
      helpSupport: 'Help & Support',
      privacyPolicy: 'Privacy Policy',
      logout: 'Logout',
      version: 'ASHA Health Tracker v{{version}}',
      selectLanguage: 'Select Language',
    },
    auth: {
      login: 'ASHA Login',
      register: 'ASHA Registration',
      welcomeBack: 'Welcome Back',
      signInSubtitle: 'Sign in to continue your work',
      emailAddress: 'Email Address',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      signIn: 'Sign In',
      signingIn: 'Signing In... ',
      dontHaveAccount: "Don't have an account? ",
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account? ',
      signInLink: 'Sign In',
    },
    patients: {
      listTitle: 'Patients',
      analysis: 'Analysis',
      analysisSubtitle: 'Patient statistics and insights',
      guidance: 'Guidance',
      guidanceSubtitle: 'Patient care instructions',
      addPatient: 'Add Patient',
      registerNewPatient: 'Register new patient',
      ashaInfo: 'ASHA Info',
      resourcesAndTraining: 'Resources and training',
      myProfile: 'My Profile',
    }
    ,
    landing: {
      subtitle: 'Health Tracker for Community Workers',
      getStarted: 'Get Started',
      helper: 'Trusted by 1000+ ASHA Workers Across India',
      footer: 'Version {{version}} • Offline Ready • Secure',
    },
    register: {
      joinAshaNetwork: 'Join ASHA Network',
      createYourAccount: 'Create your account to get started',
      personalInfo: 'Personal Information',
      accountInfo: 'Account Information',
      territoryInfo: 'Territory Information',
      fullName: 'Full Name *',
      ashaId: 'ASHA ID *',
      phoneNumber: 'Phone Number *',
      emailAddress: 'Email Address *',
      password: 'Password *',
      confirmPassword: 'Confirm Password *',
      state: 'State',
      district: 'District',
      block: 'Block',
      village: 'Village',
      supervisorId: 'Supervisor ID',
      creatingAccount: 'Creating Account...',
      createAccount: 'Create Account',
    },
    placeholders: {
      enterFullName: 'Enter your full name',
      enterAshaId: 'Enter your ASHA ID',
      enterPhone: 'Enter your phone number',
      enterEmail: 'Enter your email',
      createPassword: 'Create password',
      enterPassword: 'Enter your password',
      confirmYourPassword: 'Confirm your password',
      enterState: 'Enter state',
      enterDistrict: 'Enter district',
      enterBlock: 'Block',
      enterVillage: 'Village',
      enterSupervisorId: 'Enter supervisor ID (if any)',
    },
    analysis: {
      quickActions: 'Quick Actions',
      viewAllPatients: 'View All Patients',
      addNewPatient: 'Add New Patient',
      register: 'Register',
      total: '{{count}} total',
    },
    alerts: {
      error: 'Error',
      success: 'Success',
      loginFailed: 'Login Failed',
      registrationFailed: 'Registration Failed',
      fillAllFields: 'Please fill all fields',
      fillAllRequired: 'Please fill all required fields',
      passwordsNoMatch: 'Passwords do not match',
      passwordMin: 'Password must be at least 6 characters',
      welcomeBack: 'Welcome back, {{name}}!',
      welcomeToApp: 'Welcome to ASHA Health Tracker, {{name}}!',
    }
  },
  hi: {
    common: {
      settings: 'सेटिंग्स',
      online: 'ऑनलाइन',
      offline: 'ऑफ़लाइन',
      syncNow: 'सिंक करें',
      exportJson: 'रोगी डेटा निर्यात (JSON)',
      exportCsv: 'रोगी डेटा निर्यात (CSV)',
      helpSupport: 'सहायता और समर्थन',
      privacyPolicy: 'गोपनीयता नीति',
      logout: 'लॉग आउट',
      version: 'आशा हेल्थ ट्रैकर v{{version}}',
      selectLanguage: 'भाषा चुनें',
    },
    auth: {
      login: 'आशा लॉगिन',
      register: 'आशा पंजीकरण',
      welcomeBack: 'वापसी पर स्वागत है',
      signInSubtitle: 'अपना काम जारी रखने के लिए साइन इन करें',
      emailAddress: 'ईमेल पता',
      password: 'पासवर्ड',
      forgotPassword: 'पासवर्ड भूल गए?',
      signIn: 'साइन इन',
      signingIn: 'साइन इन हो रहा है...',
      dontHaveAccount: 'क्या आपका खाता नहीं है? ',
      createAccount: 'खाता बनाएं',
      alreadyHaveAccount: 'क्या आपके पास पहले से खाता है? ',
      signInLink: 'साइन इन',
    },
    patients: {
      listTitle: 'रोगी',
      analysis: 'विश्लेषण',
      analysisSubtitle: 'रोगी आँकड़े और जानकारी',
      guidance: 'मार्गदर्शन',
      guidanceSubtitle: 'रोगी देखभाल निर्देश',
      addPatient: 'रोगी जोड़ें',
      registerNewPatient: 'नए रोगी को पंजीकृत करें',
      ashaInfo: 'आशा जानकारी',
      resourcesAndTraining: 'संसाधन और प्रशिक्षण',
      myProfile: 'मेरा प्रोफ़ाइल',
    },
    landing: {
      subtitle: 'समुदाय कार्यकर्ताओं के लिए हेल्थ ट्रैकर',
      getStarted: 'शुरू करें',
      helper: 'भारत भर में 1000+ आशा कार्यकर्ताओं द्वारा विश्वसनीय',
      footer: 'संस्करण {{version}} • ऑफ़लाइन तैयार • सुरक्षित',
    },
    register: {
      joinAshaNetwork: 'आशा नेटवर्क से जुड़ें',
      createYourAccount: 'शुरू करने के लिए अपना खाता बनाएं',
      personalInfo: 'व्यक्तिगत जानकारी',
      accountInfo: 'खाता जानकारी',
      territoryInfo: 'क्षेत्र की जानकारी',
      fullName: 'पूरा नाम *',
      ashaId: 'आशा आईडी *',
      phoneNumber: 'फ़ोन नंबर *',
      emailAddress: 'ईमेल पता *',
      password: 'पासवर्ड *',
      confirmPassword: 'पासवर्ड की पुष्टि करें *',
      state: 'राज्य',
      district: 'जिला',
      block: 'ब्लॉक',
      village: 'गांव',
      supervisorId: 'पर्यवेक्षक आईडी',
      creatingAccount: 'खाता बनाया जा रहा है...',
      createAccount: 'खाता बनाएं',
    },
    placeholders: {
      enterFullName: 'अपना पूरा नाम दर्ज करें',
      enterAshaId: 'अपनी आशा आईडी दर्ज करें',
      enterPhone: 'अपना फ़ोन नंबर दर्ज करें',
      enterEmail: 'अपना ईमेल दर्ज करें',
      createPassword: 'पासवर्ड बनाएं',
      enterPassword: 'अपना पासवर्ड दर्ज करें',
      confirmYourPassword: 'अपना पासवर्ड पुष्टि करें',
      enterState: 'राज्य दर्ज करें',
      enterDistrict: 'जिला दर्ज करें',
      enterBlock: 'ब्लॉक',
      enterVillage: 'गांव',
      enterSupervisorId: 'पर्यवेक्षक आईडी दर्ज करें (यदि कोई हो)',
    },
    analysis: {
      quickActions: 'त्वरित क्रियाएं',
      viewAllPatients: 'सभी रोगी देखें',
      addNewPatient: 'नया रोगी जोड़ें',
      register: 'पंजीकरण',
      total: '{{count}} कुल',
    },
    alerts: {
      error: 'त्रुटि',
      success: 'सफलता',
      loginFailed: 'लॉगिन विफल',
      registrationFailed: 'पंजीकरण विफल',
      fillAllFields: 'कृपया सभी फ़ील्ड भरें',
      fillAllRequired: 'कृपया सभी आवश्यक फ़ील्ड भरें',
      passwordsNoMatch: 'पासवर्ड मेल नहीं खाते',
      passwordMin: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
      welcomeBack: 'वापसी पर स्वागत है, {{name}}!',
      welcomeToApp: 'आशा हेल्थ ट्रैकर में आपका स्वागत है, {{name}}!',
    }
  },
  mr: {
    common: { settings: 'सेटिंग्ज', online: 'ऑनलाइन', offline: 'ऑफलाइन', syncNow: 'सिंक करा', exportJson: 'रुग्ण डेटा निर्यात (JSON)', exportCsv: 'रुग्ण डेटा निर्यात (CSV)', helpSupport: 'मदत आणि समर्थन', privacyPolicy: 'गोपनीयता धोरण' },
    auth: { login: 'आशा लॉगिन', register: 'आशा नोंदणी' },
    patients: { listTitle: 'रुग्ण' },
  },
  bn: {
    common: { settings: 'সেটিংস', online: 'অনলাইন', offline: 'অফলাইন', syncNow: 'সিঙ্ক করুন', exportJson: 'রোগীর ডেটা রপ্তানি (JSON)', exportCsv: 'রোগীর ডেটা রপ্তানি (CSV)', helpSupport: 'সহায়তা ও সমর্থন', privacyPolicy: 'গোপনীয়তা নীতি' },
    auth: { login: 'আশা লগইন', register: 'আশা নিবন্ধন' },
    patients: { listTitle: 'রোগীরা' },
  },
  ta: {
    common: { settings: 'அமைப்புகள்', online: 'ஆன்லைன்', offline: 'ஆப்லைன்', syncNow: 'சிங்க் செய்', exportJson: 'நோயாளர் தரவு ஏற்றுமதி (JSON)', exportCsv: 'நோயாளர் தரவு ஏற்றுமதி (CSV)', helpSupport: 'உதவி & ஆதரவு', privacyPolicy: 'தனியுரிமைக் கொள்கை' },
    auth: { login: 'ஆஷா உள்நுழைவு', register: 'ஆஷா பதிவு' },
    patients: { listTitle: 'நோயாளிகள்' },
  },
  te: {
    common: { settings: 'సెట్టింగ్స్', online: 'ఆన్‌లైన్', offline: 'ఆఫ్‌లైన్', syncNow: 'సింక్ చేయి', exportJson: 'రోగి డేటా ఎగుమతి (JSON)', exportCsv: 'రోగి డేటా ఎగుమతి (CSV)', helpSupport: 'సహాయం & మద్దతు', privacyPolicy: 'గోప్యతా విధానం' },
    auth: { login: 'ఆశా లాగిన్', register: 'ఆశా నమోదు' },
    patients: { listTitle: 'రోగులు' },
  },
  kn: {
    common: { settings: 'ಸೆಟ್ಟಿಂಗ್ಗಳು', online: 'ಆನ್‌ಲೈನ್', offline: 'ಆಫ್‌ಲೈನ್', syncNow: 'ಸಿಂಕ್ ಮಾಡಿ', exportJson: 'ರೋಗಿಗಳ ಡೇಟಾ ರಫ್ತು (JSON)', exportCsv: 'ರೋಗಿಗಳ ಡೇಟಾ ರಫ್ತು (CSV)', helpSupport: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ', privacyPolicy: 'ಗೌಪ್ಯತಾ ನೀತಿ' },
    auth: { login: 'ಆಶಾ ಲಾಗಿನ್', register: 'ಆಶಾ ನೋಂದಣಿ' },
    patients: { listTitle: 'ರೋಗಿಗಳು' },
  },
  ml: {
    common: { settings: 'ക്രമീകരണങ്ങൾ', online: 'ഓൺലൈൻ', offline: 'ഓഫ്‌ലൈൻ', syncNow: 'സിങ്ക് ചെയ്യുക', exportJson: 'രോഗി ഡാറ്റ എക്സ്‌പോർട്ട് (JSON)', exportCsv: 'രോഗി ഡാറ്റ എക്സ്‌പോർട്ട് (CSV)', helpSupport: 'സഹായം & പിന്തുണ', privacyPolicy: 'സ്വകാര്യതാ നയം' },
    auth: { login: 'ആശ ലോഗിൻ', register: 'ആശ രജിസ്ട്രേഷൻ' },
    patients: { listTitle: 'രോഗികൾ' },
  },
  gu: {
    common: { settings: 'સેટિંગ્સ', online: 'ઑનલાઇન', offline: 'ઑફલાઇન', syncNow: 'સિંક કરો', exportJson: 'રોગી ડેટા નિકાસ (JSON)', exportCsv: 'રોગી ડેટા નિકાસ (CSV)', helpSupport: 'મદદ અને સપોર્ટ', privacyPolicy: 'ગોપનીયતા નીતિ' },
    auth: { login: 'આશા લોગિન', register: 'આશા નોંધણી' },
    patients: { listTitle: 'રોગીઓ' },
  },
  pa: {
    common: { settings: 'ਸੈਟਿੰਗਜ਼', online: 'ਆਨਲਾਈਨ', offline: 'ਆਫਲਾਈਨ', syncNow: 'ਸਿੰਕ ਕਰੋ', exportJson: 'ਮਰੀਜ਼ ਡਾਟਾ ਐਕਸਪੋਰਟ (JSON)', exportCsv: 'ਮਰੀਜ਼ ਡਾਟਾ ਐਕਸਪੋਰਟ (CSV)', helpSupport: 'ਮਦਦ ਅਤੇ ਸਮਰਥਨ', privacyPolicy: 'ਪਰਾਈਵੇਸੀ ਨੀਤੀ' },
    auth: { login: 'ਆਸ਼ਾ ਲਾਗਇਨ', register: 'ਆਸ਼ਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ' },
    patients: { listTitle: 'ਮਰੀਜ਼' },
  },
  or: {
    common: { settings: 'ସେଟିଂସ୍', online: 'ଅନଲାଇନ୍', offline: 'ଅଫଲାଇନ୍', syncNow: 'ସିଙ୍କ କରନ୍ତୁ', exportJson: 'ରୋଗୀ ତଥ୍ୟ ରପ୍ତାନି (JSON)', exportCsv: 'ରୋଗୀ ତଥ୍ୟ ରପ୍ତାନି (CSV)', helpSupport: 'ସହଯୋଗ ଏବଂ ସମର୍ଥନ', privacyPolicy: 'ଗୋପନୀୟତା ନୀତି' },
    auth: { login: 'ଆଶା ଲଗଇନ୍', register: 'ଆଶା ନିବନ୍ଧନ' },
    patients: { listTitle: 'ରୋଗୀମାନେ' },
  },
};

I18n.defaultLocale = 'en';
I18n.locale = 'en';
I18n.fallbacks = true;

export default I18n;
