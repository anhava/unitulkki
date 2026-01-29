/**
 * Finnish translations (Primary locale)
 *
 * Unitulkki - AI-pohjainen unitulkki suomalaisille
 */

export const fi = {
  // App
  appName: "Unitulkki",
  appTagline: "AI-pohjainen unitulkinta",
  appDescription: "Kerro unesi ja saat tekoälypohjaisen tulkinnan sen merkityksestä",

  // Navigation
  navDreams: "Unet",
  navHistory: "Historia",
  navSettings: "Asetukset",

  // Home screen
  homeTitle: "Unitulkki",
  homeSubtitle: "Kerro unesi ja saat tekoälypohjaisen tulkinnan sen merkityksestä",
  homeFeature1: "Strukturoitu tulkinta",
  homeFeature2: "Reaaliaikainen analyysi",
  homeGetInterpretation: "Saat tulkinnassa:",
  homeSymbols: "Symbolien merkitykset",
  homeEmotions: "Tunneanalyysi",
  homeConnections: "Yhteydet elämään",
  homeInsights: "Oivalluksia & kysymyksiä",
  homeTryExamples: "Kokeile esimerkiksi:",
  homeExample1: "Lensin pilvien yläpuolella",
  homeExample2: "Juoksin mutta en päässyt eteenpäin",

  // Input
  inputPlaceholder: "Kuvaile unesi...",
  inputSubmit: "Tulkitse",
  inputPoweredBy: "Powered by Aihio AI",

  // History
  historyTitle: "Unihistoria",
  historyEmpty: "Ei vielä tallennettuja unia",
  historyEmptyHint: "Aloita kertomalla unesi kotisivulla. Tulkinta tallennetaan automaattisesti.",
  historyTip: "Vinkki: Pidä unipäiväkirjaa nähdäksesi kuvioita unissasi",
  historyToday: "Tänään",
  historyYesterday: "Eilen",
  historyDaysAgo: "päivää sitten",
  historyReadMore: "Lue lisää",
  historyDelete: "Poista",

  // Settings
  settingsTitle: "Asetukset",
  settingsLanguage: "Kieli",
  settingsLanguageFi: "Suomi",
  settingsLanguageEn: "Englanti",
  settingsPreferences: "Asetukset",
  settingsHaptics: "Tärinäpalaute",
  settingsHapticsDesc: "Tuntoaistipalaute painikkeille",
  settingsLength: "Tulkinnan pituus",
  settingsLengthShort: "Lyhyt",
  settingsLengthNormal: "Normaali",
  settingsLengthLong: "Pitkä",
  settingsData: "Tietojen hallinta",
  settingsDreamsCount: "tallennettua unta",
  settingsClearHistory: "Tyhjennä unihistoria",
  settingsClearHistoryDesc: "Poista kaikki tallennetut unet",
  settingsAbout: "Tietoja",
  settingsVersion: "Versio",
  settingsPrivacy: "Tietosuojakäytäntö",
  settingsMadeWith: "Tehty AI SDK:lla & Aihio AI",
  settingsCopyright: "Unitulkki © 2026",

  // Interpretation
  interpretationSummary: "Yhteenveto",
  interpretationSymbols: "Symbolit",
  interpretationEmotions: "Tunnemaailma",
  interpretationConnections: "Yhteydet elämään",
  interpretationKeyMessage: "Avainviesti",
  interpretationQuestions: "Pohdittavaa",
  interpretationDeepAnalysis: "Syvempi analyysi",
  interpretationYourDream: "Unesi",
  interpretationThemes: "Teemat",
  interpretationPrimaryEmotion: "Päätunne",
  interpretationHighConfidence: "Vahva tulkinta",
  interpretationMediumConfidence: "Kohtuullinen tulkinta",
  interpretationLowConfidence: "Yleinen tulkinta",
  interpretationDisclaimer: "Unitulkinnat ovat suuntaa-antavia ja perustuvat yleiseen symboliikkaan. Henkilökohtainen merkitys voi vaihdella.",
  interpretationSavedAt: "Tallennettu klo",

  // Moods
  moodPeaceful: "Rauhallinen",
  moodHappy: "Iloinen",
  moodAnxious: "Ahdistunut",
  moodSad: "Surullinen",
  moodConfused: "Hämmentynyt",
  moodNostalgic: "Nostalginen",
  moodNeutral: "Neutraali",

  // Actions
  actionShare: "Jaa",
  actionDelete: "Poista",
  actionClose: "Sulje",
  actionAnalyzing: "Analysoidaan...",
  actionNewDream: "Uusi uni",

  // Premium
  premiumTitle: "Avaa kaikki ominaisuudet",
  premiumSubtitle: "Unitulkki Premium antaa sinulle syvemmän ymmärryksen unistasi",
  premiumUnlimitedDreams: "Rajattomat tulkinnat",
  premiumDeepAnalysis: "Syvempi analyysi",
  premiumNoAds: "Ei mainoksia",
  premiumMonthly: "Kuukausitilaus",
  premiumYearly: "Vuositilaus",
  premiumLifetime: "Elinikäinen",
  premiumMostPopular: "SUOSITUIN",
  premiumSave: "Säästä",
  premiumTrialDays: "päivää ilmaiseksi",
  premiumTrialDesc: "Kokeile kaikkia ominaisuuksia ilman sitoumusta",
  premiumStartTrial: "Aloita kokeilu",
  premiumContinue: "Jatka",
  premiumRestore: "Palauta ostokset",
  premiumLegal: "Tilaus uusiutuu automaattisesti. Voit peruuttaa milloin tahansa.",
  premiumUnlock: "Avaa Premium",
  premiumLockedDesc: "Avaa Premium nähdäksesi syvemmän analyysin",

  // Errors
  errorGeneric: "Jokin meni pieleen",
  errorNetwork: "Verkkovirhe. Tarkista internetyhteytesi.",
  errorTryAgain: "Yritä uudelleen",
} as const;

export type TranslationKey = keyof typeof fi;
