# Unitulkki UI/UX Parannusehdotukset

Perustuu tutkimukseen johtavista wellness-sovelluksista (Calm, Headspace) ja unipäiväkirjasovelluksista (Lucidity, Dreamgaze, Empi Dream).

---

## 1. Visuaalinen Design

### 1.1 Väripaletti - Rauhoittavampi sävy

**Nykyinen ongelma:** Violetti on hyvä valinta, mutta se voisi olla pehmeämpi.

**Suositus (Headspace/Calm -tyyliin):**
```typescript
// Lisää design-tokens.ts:ään
export const calmColors = {
  // Pehmeämmät pastellit
  dreamPurple: "#B794F6",      // Vaaleampi violetti
  nightBlue: "#1E3A5F",        // Syvä yösininen
  moonGlow: "#F5F0FF",         // Kuunvalo
  starlight: "#E8E0F0",        // Tähtivalo
  twilight: "#2D1B4E",         // Hämärä

  // Luontovärit (Calm-tyyliin)
  forestMist: "#A8D5BA",       // Metsän usva
  oceanCalm: "#7EC8E3",        // Tyyni meri
  sandDune: "#E8D5B7",         // Hiekka
};
```

### 1.2 Pyöreämmät muodot

**Nykyinen:** `radius.md = 12`
**Suositus:** Kasvata arvoja, vältä teräviä kulmia

```typescript
export const radius = {
  xs: 8,      // oli 4
  sm: 12,     // oli 8
  md: 16,     // oli 12
  lg: 24,     // oli 16
  xl: 32,     // oli 24
  xxl: 48,    // oli 32
  full: 9999,
};
```

### 1.3 Enemmän "ilmaa" - Spacing

```typescript
export const spacing = {
  xs: 6,      // oli 4
  sm: 12,     // oli 8
  md: 20,     // oli 16
  lg: 32,     // oli 24
  xl: 48,     // oli 32
  xxl: 64,    // oli 48
  xxxl: 96,   // oli 64
};
```

---

## 2. Onboarding & Ensikäyttökokemus

### 2.1 Tervetulonäkymä (Headspace-tyyliin)

**Nykyinen:** Staattinen logo + teksti
**Suositus:** Interaktiivinen, henkilökohtainen

```
┌─────────────────────────────────────┐
│                                     │
│         ✨ Animoitu kuulogo         │
│                                     │
│      "Tervetuloa, uneksija"         │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Mikä kuvaa sinua parhaiten? │   │
│   ├─────────────────────────────┤   │
│   │ 😴 Haluan ymmärtää uniani   │   │
│   │ 🌙 Haluan muistaa unet      │   │
│   │ 🔮 Kiinnostaa symboliikka   │   │
│   │ 💭 Vain utelias             │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 2.2 Progressiivinen paljastus

Älä näytä kaikkea kerralla. Ensimmäisellä käyttökerralla:
1. Vain tekstikenttä + "Kerro unesi"
2. Ensimmäisen tulkinnan jälkeen → näytä Historia
3. 3+ unta → näytä Kuviot
4. 7 päivän käyttö → näytä Herätys

---

## 3. Chat/Tulkinta-UX

### 3.1 Parempi visuaalinen erottelu

**Suositus:** Selkeä jako käyttäjän unen ja AI:n tulkinnan välillä

```
┌─────────────────────────────────────┐
│ 💭 UNESI                            │
│ ┌─────────────────────────────────┐ │
│ │ "Lensin korkealla vuorten yllä, │ │
│ │  mutta sitten aloin pudota..."  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ✨ TULKINTA                         │
│ ┌─────────────────────────────────┐ │
│ │ [Animoitu paljastus osio       │ │
│ │  kerrallaan...]                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 3.2 Typing-indikaattori

**Nykyinen:** Prosenttilaskuri
**Suositus:** Rauhoittava animaatio

```typescript
// Pehmeä "ajattelukupla" -animaatio
<View style={styles.thinkingBubble}>
  <Text style={styles.thinkingEmoji}>🌙</Text>
  <DotPulseAnimation />
  <Text style={styles.thinkingText}>Tulkitsen untasi...</Text>
</View>
```

### 3.3 Quick Actions (Nopeat toiminnot)

Tulkinnan jälkeen näytä:
```
┌─────────────────────────────────────┐
│  [💾 Tallenna]  [🔄 Uusi]  [📤 Jaa] │
└─────────────────────────────────────┘
```

---

## 4. Gamifikaatio (Headspace-tyyliin)

### 4.1 Uniputki (Dream Streak)

```
┌─────────────────────────────────────┐
│ 🔥 7 päivän uniputki!               │
│ ━━━━━━━━━━━━━○━━━━━━━━ 14 pvä       │
│                                     │
│ "Olet kirjannut unia jo viikon!    │
│  Jatka samaan malliin."             │
└─────────────────────────────────────┘
```

### 4.2 Saavutukset (Badges)

```
🌙 Ensimmäinen uni     ✓
🌟 Viikko unelmointia  ✓
🔮 10 tulkintaa        ○
🌈 Lucid-uneksija      ○
📚 Unihistorioitsija   ○
```

### 4.3 Viikoittainen yhteenveto

Push-ilmoitus sunnuntaina:
```
"Viikon unikatsaus: Kirjasit 5 unta!
Yleisimmät teemat: vesi, lentäminen
Näytä yhteenveto →"
```

---

## 5. Navigaatio & Hierarkia

### 5.1 Kolmen tason hierarkia

```
TASO 1: Päänavigaatio (Tab Bar)
├── 📖 Päiväkirja
├── ➕ Tulkitse (keskellä, korostettu)
└── 👤 Profiili

TASO 2: Profiilin alla
├── ⚙️ Asetukset
├── 📊 Unikuviot
├── 🔔 Herätys
├── 💎 Premium
└── ℹ️ Tietoja

TASO 3: Syvemmät toiminnot
├── PDF-vienti
├── Tietojen hallinta
└── Tietosuoja
```

### 5.2 Kontekstuaaliset FAB:t (Floating Action Button)

```
Historiassa:       [➕ Uusi uni] FAB alareunassa
Tulkinnassa:       [💾 Tallenna] FAB kun valmis
Kuvioissa:         [📤 Jaa] FAB
```

---

## 6. Mikrointeraktiot

### 6.1 Animaatiot (Headspace-tyyliin)

```typescript
// Onnistumisanimaatio (tallennettaessa)
const successAnimation = {
  scale: [1, 1.2, 1],
  opacity: [1, 0.8, 1],
  duration: 400,
};

// Pehmeä sisääntuloanimaatio osioille
const sectionReveal = {
  translateY: [20, 0],
  opacity: [0, 1],
  duration: 500,
  delay: index * 100, // Porrastettu
};
```

### 6.2 Haptiikka

```typescript
// Eriytetty haptiikka eri toiminnoille
haptics.dream();     // Pehmeä, unenomainen (kun tulkinta valmis)
haptics.save();      // Tyytyväinen "thud" (kun tallennettu)
haptics.milestone(); // Juhlistava (saavutukset)
```

---

## 7. Saavutettavuus

### 7.1 Kontrastit

```typescript
// Varmista WCAG AA -taso
textOnDark: {
  primary: "#FFFFFF",      // 21:1 kontrasti
  secondary: "#E2E8F0",    // 12:1 kontrasti
  tertiary: "#94A3B8",     // 4.5:1 kontrasti (minimi)
}
```

### 7.2 Kosketusalueet

```typescript
// Minimi 44x44 pikseliä
const touchableMinSize = {
  width: 44,
  height: 44,
};
```

---

## 8. Suositellut ensimmäiset parannukset

### Prioriteetti 1 (Kriittinen)
- [ ] Pyöristä kulmat (radius)
- [ ] Lisää ilmaa (spacing)
- [ ] Paranna typing-indikaattori

### Prioriteetti 2 (Tärkeä)
- [ ] Lisää uniputki (streak)
- [ ] Paranna tulkintanäkymän animaatiot
- [ ] Lisää quick actions tulkinnan jälkeen

### Prioriteetti 3 (Mukava lisä)
- [ ] Saavutukset/badges
- [ ] Viikoittainen yhteenveto
- [ ] Personoitu onboarding

---

## Lähteet

- [Headspace Design for Mindfulness](https://raw.studio/blog/how-headspace-designs-for-mindfulness/)
- [Meditation App Design Tips](https://www.purrweb.com/blog/designing-a-meditation-app-tips-step-by-step-guide/)
- [Best Dream Journal Apps 2025](https://medium.com/@elsewheredreams/best-dream-journal-apps-of-2025-fb7f800371b8)
- [Chat UX Best Practices](https://skywork.ai/blog/chat-native-app-ux-best-practices/)
- [Mindfulness App Design Trends](https://www.bighuman.com/blog/trends-in-mindfulness-app-design)
