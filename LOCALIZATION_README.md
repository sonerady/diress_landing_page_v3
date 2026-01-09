# Localization (i18n) Guide

## Overview

This document outlines the localization strategy for the Diress AI Fashion Platform. The goal is to translate all user-facing content into **73 languages** (Google Play supported languages, excluding RTL languages).

---

## Supported Languages (73 Languages)

| Code | Language | Native Name |
|------|----------|-------------|
| af | Afrikaans | Afrikaans |
| am | Amharic | አማርኛ |
| az | Azerbaijani | Azərbaycan |
| be | Belarusian | Беларуская |
| bg | Bulgarian | Български |
| bn | Bengali | বাংলা |
| ca | Catalan | Català |
| cs | Czech | Čeština |
| da | Danish | Dansk |
| de | German | Deutsch |
| el | Greek | Ελληνικά |
| en-US | English (US) | English |
| en-GB | English (UK) | English |
| en-AU | English (Australia) | English |
| es-ES | Spanish (Spain) | Español |
| es-419 | Spanish (Latin America) | Español |
| et | Estonian | Eesti |
| eu | Basque | Euskara |
| fi | Finnish | Suomi |
| fil | Filipino | Filipino |
| fr-FR | French (France) | Français |
| fr-CA | French (Canada) | Français |
| gl | Galician | Galego |
| gu | Gujarati | ગુજરાતી |
| hi | Hindi | हिन्दी |
| hr | Croatian | Hrvatski |
| hu | Hungarian | Magyar |
| hy | Armenian | Հայերdelays |
| id | Indonesian | Indonesia |
| is | Icelandic | Íslenska |
| it | Italian | Italiano |
| ja | Japanese | 日本語 |
| ka | Georgian | ქართული |
| kk | Kazakh | Қазақ |
| km | Khmer | ភាសាខ្មែរ |
| kn | Kannada | ಕನ್ನಡ |
| ko | Korean | 한국어 |
| ky | Kyrgyz | Кыргызча |
| lo | Lao | ລາວ |
| lt | Lithuanian | Lietuvių |
| lv | Latvian | Latviešu |
| mk | Macedonian | Македонски |
| ml | Malayalam | മലയാളം |
| mn | Mongolian | Монгол |
| mr | Marathi | मराठी |
| ms | Malay | Melayu |
| my | Burmese | မြန်မာ |
| no | Norwegian | Norsk |
| ne | Nepali | नेपाली |
| nl | Dutch | Nederlands |
| pa | Punjabi | ਪੰਜਾਬੀ |
| pl | Polish | Polski |
| pt-BR | Portuguese (Brazil) | Português |
| pt-PT | Portuguese (Portugal) | Português |
| ro | Romanian | Română |
| ru | Russian | Русский |
| si | Sinhala | සිංහල |
| sk | Slovak | Slovenčina |
| sl | Slovenian | Slovenščina |
| sq | Albanian | Shqip |
| sr | Serbian | Српски |
| sv | Swedish | Svenska |
| sw | Swahili | Kiswahili |
| ta | Tamil | தமிழ் |
| te | Telugu | తెలుగు |
| th | Thai | ไทย |
| tr | Turkish | Türkçe |
| uk | Ukrainian | Українська |
| uz | Uzbek | Oʻzbek |
| vi | Vietnamese | Tiếng Việt |
| zh-CN | Chinese (Simplified) | 简体中文 |
| zh-TW | Chinese (Traditional) | 繁體中文 |
| zu | Zulu | isiZulu |

---

## Translation Guidelines

### DO Translate
- All user-facing UI text
- Marketing copy and descriptions
- Button labels and CTAs
- Navigation items
- Error messages and notifications
- Tooltips and help text

### DO NOT Translate
- Brand name: **Diress** (keep as is)
- Technical terms that are industry standard
- Code, CSS class names, IDs
- File names and paths
- API endpoints
- Color codes (e.g., #B6B870)

### Translation Quality Requirements
- Translations must be **contextually accurate** for fashion/AI industry
- Use **formal tone** appropriate for B2B SaaS
- Maintain **consistent terminology** across all pages
- Consider **cultural adaptation** not just literal translation

---

## Content to Localize

### 1. Navigation & Header
```json
{
  "nav.home": "Home",
  "nav.features": "Features",
  "nav.pricing": "Pricing",
  "nav.contact": "Contact",
  "nav.getStarted": "Get Started"
}
```

### 2. Hero Section (Step 0)
```json
{
  "hero.title.line1": "Create Stunning",
  "hero.title.line2": "AI Fashion Photos",
  "hero.title.animated": ["E-commerce", "Editorial", "Catalog", "Social Media", "Marketing"],
  "hero.cta": "Get Started",
  "hero.ctaArrow": "→"
}
```

### 3. Backgrounds Section (Step 1/5)
```json
{
  "backgrounds.badge": "5000+ Backgrounds",
  "backgrounds.scene1.title": "Rustic Wooden Barn",
  "backgrounds.scene1.desc": "Showcase your clothing in authentic rustic settings. Perfect for casual wear and vintage styles.",
  "backgrounds.scene2.title": "Cozy Mountain Lodge",
  "backgrounds.scene2.desc": "Display your products in a warm fireplace mountain cabin. Ideal for winter collections, knitwear and premium apparel.",
  "backgrounds.scene3.title": "Bali Rice Terraces",
  "backgrounds.scene3.desc": "Present your fashion line against stunning Bali rice fields. Perfect for summer collections, resort wear and bohemian styles."
}
```

### 4. AI Pose Section (Step 4)
```json
{
  "pose.badge": "5000+ Poses",
  "pose.customBadge": "Create Custom Poses",
  "pose.title": "Confident Stance",
  "pose.subtitle": "Professional model poses for your products"
}
```

### 5. Customize Model Section (Step 3)
```json
{
  "customize.tabs.hairStyle": "Hair Style",
  "customize.tabs.hairColor": "Hair Color",
  "customize.tabs.skinTone": "Skin Tone",
  "customize.tabs.ethnicity": "Ethnicity",
  "customize.tabs.mood": "Mood",
  "customize.hairColors": ["Blonde", "Brunette", "Black", "Red", "Gray"],
  "customize.moods": ["Happy", "Serious", "Confident", "Relaxed", "Professional"]
}
```

### 6. AI Export Section (Step 6)
```json
{
  "export.tag": "AI Export",
  "export.title": "E-commerce Ready Photos",
  "export.subtitle": "Professional product visuals generated by AI",
  "export.styles.editorial": "Editorial Style",
  "export.styles.studio": "Studio Style",
  "export.styles.detail": "Product Detail",
  "export.styles.ghost": "Ghost Mannequin"
}
```

### 7. AI Video Section (Step 7)
```json
{
  "video.title": "AI Video",
  "video.imageLabel": "Image",
  "video.description": "Transform your product images into stunning videos"
}
```

### 8. Bottom Navigation
```json
{
  "bottomNav.step0": "Welcome",
  "bottomNav.step1": "Select Scene",
  "bottomNav.step2": "Ecommerce Kits",
  "bottomNav.step3": "Customize Model",
  "bottomNav.step4": "AI Pose",
  "bottomNav.step5": "Backgrounds",
  "bottomNav.step6": "AI Export",
  "bottomNav.step7": "AI Video"
}
```

### 9. Sidebar Menu
```json
{
  "sidebar.virtualModel": "Virtual Model",
  "sidebar.selectScene": "Select Scene",
  "sidebar.customizeModel": "Customize Model",
  "sidebar.hairStyle": "Hair Style",
  "sidebar.hairColor": "Hair Color",
  "sidebar.skinTone": "Skin Tone",
  "sidebar.ethnicity": "Ethnicity",
  "sidebar.mood": "Mood",
  "sidebar.aiPose": "AI Pose",
  "sidebar.backgrounds": "Backgrounds",
  "sidebar.aiExport": "AI Export",
  "sidebar.imageToVideo": "Image to Video"
}
```

### 10. Common UI Elements
```json
{
  "common.next": "Next",
  "common.prev": "Previous",
  "common.generate": "Generate",
  "common.loading": "Loading...",
  "common.more": "More",
  "common.close": "Close"
}
```

---

## File Structure

```
/locales
  /en-US
    common.json
    navigation.json
    hero.json
    backgrounds.json
    customize.json
    export.json
    video.json
  /tr
    common.json
    navigation.json
    ...
  /de
    ...
  /fr-FR
    ...
  ... (73 language folders)
```

---

## Implementation Notes

### Recommended i18n Libraries
- **React**: react-i18next, react-intl
- **Vue**: vue-i18n
- **Vanilla JS**: i18next

### Basic i18next Setup
```javascript
import i18n from 'i18next';

i18n.init({
  lng: 'en-US',
  fallbackLng: 'en-US',
  resources: {
    'en-US': { translation: require('./locales/en-US/common.json') },
    'tr': { translation: require('./locales/tr/common.json') },
    // ... other languages
  }
});

// Usage
i18n.t('hero.cta'); // "Get Started"
```

### Language Detection Priority
1. URL parameter (`?lang=de`)
2. localStorage preference
3. Browser language (navigator.language)
4. Default: en-US

---

## Translation Workflow

1. **Extract**: Export all strings to JSON files
2. **Translate**: Send to professional translators or use AI-assisted translation with human review
3. **Review**: Native speaker review for context accuracy
4. **Integrate**: Import translations back to codebase
5. **Test**: Visual QA for text overflow, truncation issues
6. **Deploy**: Gradual rollout by region

---

## Quality Checklist

- [ ] All visible text is externalized to JSON
- [ ] No hardcoded strings in HTML/JS
- [ ] Pluralization handled correctly
- [ ] Date/time formats localized
- [ ] Number formats localized (decimal separators)
- [ ] Currency symbols localized
- [ ] Images with text have localized versions
- [ ] SEO meta tags translated
- [ ] Form validation messages translated
- [ ] Email templates translated

---

## Contact

For localization questions or to report translation issues, contact the development team.

**Last Updated**: January 2025
**Version**: 1.0
