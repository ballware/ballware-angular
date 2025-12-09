# Integrierte Tests für Storybook Stories

Diese Dokumentation beschreibt, wie die integrierten Tests für Storybook Stories mit dem Storybook Test Runner ausgeführt werden.

## Übersicht

Die Tests sind direkt in die Stories integriert über `play`-Funktionen und werden automatisch mit dem Storybook Test Runner (basierend auf Playwright) ausgeführt. Dies ermöglicht:

- **Integrierte Tests**: Tests leben direkt bei den Stories
- **Automatische Ausführung**: Der Test Runner führt alle Stories und ihre play-Funktionen aus
- **Accessibility Tests**: Automatische a11y-Prüfungen mit axe-playwright
- **Konsistenz**: Eine Quelle für Dokumentation und Tests

## Testdateien

Die Tests sind direkt in den Story-Dateien als `play`-Funktionen integriert:

```typescript
export const Default: Story = {
  render: (args) => ({ ... }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test: Button should be visible
    const button = canvas.getByRole('button');
    await expect(button).toBeTruthy();
  },
};
```

### Story-Dateien mit integrierten Tests:

```
libs/dx-renderer/src/lib/edit/
  ├── bool/
  │   └── editbool.component.stories.ts (mit play-Funktionen)
  ├── button/
  │   └── editbutton.component.stories.ts (mit play-Funktionen)
  └── detailgrid/
      └── editdetaildatagrid.component.stories.ts (mit play-Funktionen)
```

## Voraussetzungen

Die Dependencies sind bereits installiert:
- `@storybook/test-runner`
- `@storybook/test` (für expect, within, userEvent)
- `axe-playwright` (für Accessibility-Tests)

## Tests ausführen

### Alle Stories testen

```bash
# Mit automatischem Storybook-Start (Development-Modus)
npx test-storybook

# Oder gegen bereits laufendes Storybook
npx test-storybook --url http://localhost:4400
```

### Gegen gebautes Storybook testen (CI/CD)

```bash
# Storybook bauen
npm run build-storybook

# Gegen statisches Build testen
npx test-storybook --url file://$(pwd)/storybook-static
```

### Bestimmte Stories testen

```bash
# Nur Stories mit bestimmtem Pattern
npx test-storybook --stories-glob="**/editbool.component.stories.ts"

# Einzelne Story testen
npx test-storybook --stories-glob="**/editbutton.component.stories.ts" --stories-pattern="**/Default"
```

### Watch-Modus (während Entwicklung)

```bash
# Tests automatisch bei Änderungen ausführen
npx test-storybook --watch
```

### Mit detailliertem Output

```bash
# Verbose-Modus für mehr Informationen
npx test-storybook --verbose

# Mit Coverage-Report
npx test-storybook --coverage
```

## Test-Struktur

### Play-Funktionen in Stories

Die `play`-Funktionen werden automatisch nach dem Rendering der Story ausgeführt:

```typescript
import { expect, within, userEvent } from '@storybook/test';

export const InteractiveStory: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // 1. Elemente finden
    const button = canvas.getByRole('button');
    
    // 2. Assertions
    await expect(button).toBeTruthy();
    await expect(button.textContent).toContain('Click Me');
    
    // 3. Interaktionen
    await userEvent.click(button);
    
    // 4. Weitere Assertions nach Interaktion
    const result = canvas.getByText('Clicked!');
    await expect(result).toBeTruthy();
  },
};
```

### Verfügbare Test-Utilities

- **`within(canvasElement)`**: Scoped queries für die Story
- **`expect()`**: Jest-kompatible Assertions
- **`userEvent`**: Realistische User-Interaktionen
- **`waitFor()`**: Warten auf asynchrone Änderungen

## Test-Runner-Konfiguration

Die Konfiguration befindet sich in `.storybook/test-runner.ts`:

### Features:

1. **Automatische Accessibility-Tests**: Jede Story wird mit axe-playwright auf a11y-Probleme geprüft
2. **Viewport-Konfiguration**: Standard 1280x720, anpassbar
3. **Tag-basiertes Filtern**: Stories mit `skip-test` Tag werden übersprungen

### Tags verwenden:

```typescript
export const SkippedStory: Story = {
  tags: ['skip-test'],
  // Diese Story wird von Tests übersprungen
};
```

## Test-Kategorien

### Bool Component Tests
- ✅ Rendering (Default, Checked, Readonly)
- ✅ Sichtbarkeit und disabled States
- ✅ Checkbox-States und Klassen

### Button Component Tests
- ✅ Rendering verschiedener Varianten
- ✅ Click-Events
- ✅ Disabled-State
- ✅ Text-Rendering

### DetailGrid Component Tests
- ✅ Grid-Rendering mit Daten
- ✅ Leeres Grid
- ✅ Spalten-Rendering
- ✅ Zeilen-Count

## CI/CD Integration

### GitHub Actions Beispiel:

```yaml
name: Storybook Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Storybook
        run: npm run build-storybook
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run Storybook Tests
        run: npx test-storybook --url file://$(pwd)/storybook-static
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

## Vorteile der integrierten Lösung

### ✅ Co-Location
- Tests leben direkt bei den Stories
- Keine separaten Test-Dateien zu pflegen
- Einfacher zu finden und zu warten

### ✅ Interaktive Entwicklung
- Tests können direkt in Storybook UI ausgeführt werden
- Play-Funktionen zeigen Interaktionen visuell
- Debugging direkt im Browser

### ✅ Automatisierung
- Test Runner führt alle Stories automatisch aus
- Accessibility-Tests inklusive
- Einfache CI/CD-Integration

### ✅ Konsistenz
- Gleiche Tools wie für Stories (@storybook/test)
- Keine separate Playwright-Konfiguration nötig
- Ein Setup für Dokumentation und Tests

## Best Practices

1. **Tests fokussiert halten**: Jede Story sollte einen spezifischen Aspekt testen
2. **Realistische Interaktionen**: `userEvent` statt direkter DOM-Manipulation
3. **Accessibility beachten**: Queries per Role/Label statt CSS-Selektoren
4. **Async/Await verwenden**: Für zuverlässige Tests
5. **Stories klein halten**: Lieber mehrere fokussierte Stories als eine komplexe

## Troubleshooting

### Tests schlagen fehl wegen Timeout
- Erhöhe das Timeout in der Test-Runner-Konfiguration
- Prüfe, ob Storybook korrekt läuft

### Accessibility-Tests schlagen fehl
- Prüfe die axe-playwright-Ausgabe
- Behebe die gemeldeten a11y-Probleme
- Oder deaktiviere a11y-Tests temporär in `test-runner.ts`

### Play-Funktion wird nicht ausgeführt
- Stelle sicher, dass `@storybook/test` importiert ist
- Prüfe auf TypeScript-Fehler in der Story-Datei

### Element nicht gefunden
- Verwende `waitFor()` für asynchrone Elemente
- Prüfe die Selektoren mit Storybook UI

## Weitere Ressourcen

- [Storybook Test Runner Dokumentation](https://storybook.js.org/docs/react/writing-tests/test-runner)
- [Storybook Interaction Testing](https://storybook.js.org/docs/react/writing-tests/interaction-testing)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright)

