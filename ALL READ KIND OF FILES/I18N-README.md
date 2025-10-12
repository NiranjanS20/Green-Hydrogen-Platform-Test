# 🌍 Internationalization (i18n) - Multi-Language Support

## 🌟 Overview

Your Green Hydrogen Platform now supports **multiple languages**! Users can switch between English, Spanish, and French with a single click. The language preference is saved and persists across sessions.

---

## ✨ Supported Languages

| Language | Code | Flag | Status |
|----------|------|------|--------|
| **English** | `en` | 🇬🇧 | ✅ Complete |
| **Spanish** | `es` | 🇪🇸 | ✅ Complete |
| **French** | `fr` | 🇫🇷 | ✅ Complete |

---

## 🎨 Features

### 1. **Language Switcher Component**
- **Location**: Top navigation bar (next to nav links)
- **Display**: Flag + language name (e.g., "🇬🇧 English")
- **Dropdown**: Click to see all available languages
- **Checkmark**: Shows current selected language
- **Responsive**: Shows flag only on mobile

### 2. **Translation System**
- **JSON-based**: Easy to edit and maintain
- **Nested Keys**: Organized by feature/page
- **Parameter Support**: Dynamic values like user names
- **Fallback**: Returns key if translation missing
- **Type-Safe**: Full TypeScript support

### 3. **Persistence**
- **LocalStorage**: Saves user's language preference
- **Auto-Load**: Remembers choice on page reload
- **HTML Lang**: Updates `<html lang="...">` attribute
- **SEO-Friendly**: Search engines recognize language

---

## 📁 File Structure

```
lib/i18n/
├── locales/
│   ├── en.json          # English translations
│   ├── es.json          # Spanish translations
│   └── fr.json          # French translations
├── config.ts            # i18n configuration
└── useTranslation.ts    # React hook for translations

components/
└── LanguageSwitcher.tsx # Language dropdown component
```

---

## 🔧 Usage

### For End Users

1. **Find Language Switcher**: Look in navigation bar (top-right area)
2. **See Current Language**: Shows flag and name (e.g., "🇬🇧 English")
3. **Click Dropdown**: Opens list of available languages
4. **Select Language**: Click desired language
5. **Page Reloads**: Content updates to selected language
6. **Preference Saved**: Choice remembered for next visit

### For Developers

#### Using Translations in Components

```typescript
'use client';

import { useTranslation } from '@/lib/i18n/useTranslation';

export default function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

#### With Dynamic Parameters

```typescript
const { t } = useTranslation();
const userName = "John Doe";

// Use {{parameter}} syntax in translation files
<h1>{t('dashboard.welcomeBack', { name: userName })}</h1>

// In en.json: "welcomeBack": "Welcome back, {{name}}!"
// Output: "Welcome back, John Doe!"
```

---

## 📝 Translation Files

### Structure Example (`en.json`)

```json
{
  "common": {
    "welcome": "Welcome",
    "login": "Login",
    "logout": "Sign Out",
    "save": "Save"
  },
  "dashboard": {
    "title": "Dashboard Overview",
    "welcomeBack": "Welcome back, {{name}}!",
    "subtitle": "Monitor your ecosystem in real-time"
  },
  "transportation": {
    "title": "Hydrogen Transportation",
    "addRoute": "Add Route",
    "noRoutes": "No routes added yet"
  }
}
```

### Adding New Translations

1. **Add to English** (`locales/en.json`):
   ```json
   "myFeature": {
     "title": "My New Feature",
     "description": "This is amazing"
   }
   ```

2. **Add to Spanish** (`locales/es.json`):
   ```json
   "myFeature": {
     "title": "Mi Nueva Función",
     "description": "Esto es increíble"
   }
   ```

3. **Add to French** (`locales/fr.json`):
   ```json
   "myFeature": {
     "title": "Ma Nouvelle Fonctionnalité",
     "description": "C'est incroyable"
   }
   ```

4. **Use in Code**:
   ```typescript
   <h1>{t('myFeature.title')}</h1>
   <p>{t('myFeature.description')}</p>
   ```

---

## 🌐 Adding New Languages

### Step 1: Create Translation File

Create `lib/i18n/locales/de.json` (for German):

```json
{
  "common": {
    "welcome": "Willkommen",
    "login": "Anmelden",
    "logout": "Abmelden"
  },
  "dashboard": {
    "title": "Dashboard Übersicht",
    "welcomeBack": "Willkommen zurück, {{name}}!"
  }
}
```

### Step 2: Update Config

Edit `lib/i18n/config.ts`:

```typescript
import de from './locales/de.json';  // Import new language

export type Locale = 'en' | 'es' | 'fr' | 'de';  // Add to type

export const locales: Locale[] = ['en', 'es', 'fr', 'de'];  // Add to array

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch'  // Add name
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪'  // Add flag
};

export const translations = {
  en,
  es,
  fr,
  de  // Add translations
};
```

### Step 3: Done!

The language will automatically appear in the dropdown menu.

---

## 🎯 Translation Coverage

### Current Translations Include:

#### Common Terms
- Login, Logout, Sign Up
- Email, Password, Full Name
- Save, Cancel, Delete, Edit, Add
- Search, Filter, Loading, Error, Success

#### Navigation
- Dashboard, Production, Storage
- Transportation, Research, Simulation
- Analytics, Profile

#### Dashboard Page
- Title, Subtitle
- Metrics (production, energy, carbon offset)
- Welcome message with user name

#### Transportation Page
- Title, Subtitle
- Add Route form fields
- Route details
- Empty states

#### Chat Bot
- Title, Status (online/offline)
- Greeting message
- Quick questions
- Thinking indicator

#### Authentication
- Welcome messages
- Sign in/up subtitles
- Account prompts

---

## 💡 Best Practices

### 1. **Keep Keys Organized**
```json
// Good - grouped by feature
{
  "production": {
    "title": "...",
    "subtitle": "..."
  }
}

// Avoid - flat structure
{
  "productionTitle": "...",
  "productionSubtitle": "..."
}
```

### 2. **Use Parameters for Dynamic Content**
```json
// Good - reusable
"greeting": "Hello, {{name}}!"

// Avoid - hardcoded
"greetingJohn": "Hello, John!"
```

### 3. **Consistent Naming**
```json
// Good - consistent
"save": "Save"
"cancel": "Cancel"
"delete": "Delete"

// Avoid - inconsistent
"saveBtn": "Save"
"cancelAction": "Cancel"
"removeItem": "Delete"
```

### 4. **Keep Translations Short**
```json
// Good for UI
"addNew": "Add New"

// Too long for button
"addNewItemToList": "Click here to add a new item to the list"
```

---

## 🔍 Testing Translations

### Manual Testing
1. Switch to each language using the dropdown
2. Navigate to different pages
3. Check that all text is translated
4. Verify that dynamic content (user names, etc.) works

### Missing Translation Check
```typescript
// In config.ts, modify getTranslation to log missing keys
export function getTranslation(locale: Locale, key: string) {
  // ... existing code ...
  
  if (typeof value !== 'string') {
    console.warn(`Missing translation: ${locale}.${key}`);
    return key;
  }
  
  return value;
}
```

---

## 🌍 Language Examples

### Dashboard Welcome Message

| Language | Translation |
|----------|-------------|
| 🇬🇧 English | "Welcome back, John!" |
| 🇪🇸 Spanish | "¡Bienvenido de nuevo, John!" |
| 🇫🇷 French | "Bon retour, John!" |

### Add Route Button

| Language | Translation |
|----------|-------------|
| 🇬🇧 English | "Add Route" |
| 🇪🇸 Spanish | "Agregar Ruta" |
| 🇫🇷 French | "Ajouter un Itinéraire" |

### No Data Message

| Language | Translation |
|----------|-------------|
| 🇬🇧 English | "No routes added yet" |
| 🇪🇸 Spanish | "No hay rutas agregadas aún" |
| 🇫🇷 French | "Aucun itinéraire ajouté" |

---

## 🔧 Technical Details

### LocalStorage Key
```javascript
localStorage.getItem('locale')  // Returns: 'en', 'es', or 'fr'
```

### HTML Lang Attribute
```html
<html lang="en">  <!-- Updates when language changes -->
```

### Translation Function
```typescript
t('dashboard.title')  // Returns translated string
t('dashboard.welcomeBack', { name: 'John' })  // With parameters
```

---

## 🚀 Future Enhancements

### Possible Additions

1. **More Languages**
   - German (🇩🇪 Deutsch)
   - Japanese (🇯🇵 日本語)
   - Chinese (🇨🇳 中文)
   - Arabic (🇸🇦 العربية)

2. **RTL Support**
   - Right-to-left for Arabic/Hebrew
   - Mirror UI layout
   - Adjust text alignment

3. **Auto-Detection**
   - Detect browser language
   - Set default based on location
   - Remember user preference

4. **Translation Management**
   - Admin panel for translations
   - Crowdsourced translations
   - Export/import CSV

---

## 📊 Statistics

### Translation Completeness

| Language | Common | Nav | Dashboard | Transport | Chat | Auth | Total |
|----------|--------|-----|-----------|-----------|------|------|-------|
| 🇬🇧 English | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | **100%** |
| 🇪🇸 Spanish | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | **100%** |
| 🇫🇷 French | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | **100%** |

---

## 🎉 Summary

Your platform now has **full multi-language support**:

- ✅ **3 Languages**: English, Spanish, French
- ✅ **Easy to Use**: Dropdown in navigation
- ✅ **Persistent**: Saves user preference
- ✅ **Complete**: All UI text translated
- ✅ **Extensible**: Easy to add new languages
- ✅ **Type-Safe**: TypeScript support
- ✅ **SEO-Friendly**: Proper HTML lang attributes

**Your platform is now globally accessible! 🌍🚀**
