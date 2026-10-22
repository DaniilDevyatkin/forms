---
name: Форма
description: Сбор структурированной информации по пунктам с админ-просмотром ответов
colors:
  daylight: "oklch(0.975 0.004 70)"
  paper: "oklch(1 0 0)"
  paper-raised: "oklch(0.955 0.006 60)"
  graphite-ink: "oklch(0.22 0.012 45)"
  ash: "oklch(0.46 0.012 45)"
  seam: "oklch(0.895 0.006 60)"
  seam-strong: "oklch(0.80 0.012 55)"
  ember: "oklch(0.55 0.165 34)"
  ember-hot: "oklch(0.48 0.17 34)"
  quenched-green: "oklch(0.55 0.11 160)"
  fault: "oklch(0.55 0.17 25)"
  scene-warm: "oklch(0.90 0.07 60 / 0.55)"
  scene-teal: "oklch(0.93 0.035 210 / 0.6)"
typography:
  display:
    fontFamily: "Golos Text, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Golos Text, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Golos Text, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-0.01em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "18px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.ember-hot}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    height: "42px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "42px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: "44px"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: Форма

## 1. Overview

**Creative North Star: "The Daylight Studio"**

Светлая рабочая поверхность студии утром: тёплая бумага, графитовый текст, тонкие линии вместо рамок и один раскалённый уголь — единственная кнопка, которую нельзя пропустить. Форма заполняется под обычным дневным светом, на ноутбуке, между задачами. Поэтому фон светлый: тёмная палитра здесь работала бы против контекста.

Глубина держится на трёх уровнях (фон → белая панель → поднятая поверхность) и мягкой тени под панелями, а не на стекле и блобах. Мягкое тёплое свечение в правом верхнем углу и прохладная аура слева снизу дают сцене воздух, но не отвлекают.

Система отвергает маркетинговые hero-блоки на форме, стеклянные карточки, градиентные заголовки, декоративные блобы и пустой тёмный «терминальный» лук ради ощущения технологичности.

**Key Characteristics:**
- Светлая тёплая база, белые панели, графитовый текст
- Один раскалённый акцент (Ember) только на главном действии и завершённых пунктах
- Ритм через интервалы и линии, не через рамки и карточки
- Моноширинный шрифт как маркер «данных», а не как декор
- Движение только как отклик на состояние

## 2. Colors: The Daylight Palette

Тёплый светлый фон, чистый белый для работы и единственный насыщенный цвет на 10% площади.

### Primary
- **Ember** (`oklch(0.55 0.165 34)`): кнопка «Отправить», обязательные маркеры, прогресс, отмеченные пункты, аватар выбранной записи. Белый текст — контраст 5.9:1.
- **Ember Hot** (`oklch(0.48 0.17 34)`): hover главной кнопки.

### Neutral
- **Daylight** (`oklch(0.975 0.004 70)`): фон сцены.
- **Paper** (`oklch(1 0 0)`): панели и поля ввода.
- **Paper Raised** (`oklch(0.955 0.006 60)`): hover строк и вторичных кнопок.
- **Graphite Ink** (`oklch(0.22 0.012 45)`): основной текст, контраст 11.3:1 к фону.
- **Ash** (`oklch(0.46 0.012 45)`): пояснительный текст, подписи, плейсхолдеры, контраст 5.5:1.
- **Seam** (`oklch(0.895 0.006 60)`): границы и разделители. **Seam Strong** — hover-обводка полей.

### Scene
- **Scene Warm** (`oklch(0.90 0.07 60 / 0.55)`) и **Scene Teal** (`oklch(0.93 0.035 210 / 0.6)`): две мягкие радиальные аур на фоне. Только атмосфера, никогда не под текстом.

### Tertiary
- **Quenched Green** (`oklch(0.55 0.11 160)`): подтверждение отправки.
- **Fault** (`oklch(0.55 0.17 25)`): ошибки полей и формы.

### Named Rules
**The One Ember Rule.** Раскалённый акцент занимает не более 10% любого экрана. Его редкость и есть его смысл.

**The Lit-Paper Rule.** Основной фон светлый: форма живёт в дневном контексте. Тёмные поверхности запрещены, пока не появятся ночные сессии как отдельный режим.

## 3. Typography

**Display Font:** Golos Text (с system-ui, sans-serif)
**Body Font:** Golos Text (с system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (с ui-monospace)

**Character:** Один тёплый гротеск несёт всё: заголовки, поля, данные. Широкий глиф и открытые линии дают воздух, которого не хватает нейтральным системным шрифтам; моноширинный появляется только там, где значение — машинный факт (ID, время, IP).

### Hierarchy
- **Display** (600, clamp(2rem, 3.6vw, 3rem), 1.05): заголовок страницы, одна строка мысли.
- **Headline** (600, 1.35–1.75rem, 1.15): «Ответы», имя в детали ответа.
- **Title** (500, 1rem): заголовки панелей.
- **Body** (400, 15px, 1.6): текст формы и значения ответов; длина строки ≤ 65ch.
- **Label** (500, 13px): подписи полей; «необязательно» — 12px, Ash при 70%.
- **Mono** (400, 12.5px): ID, время, IP, служебные подписи.

### Named Rules
**The Fact Rule.** Моноширинный шрифт только для значений, которые проверяются глазами как данные. Никаких моно-заголовков.

## 4. Elevation

Система лежит на светлых слоях с одной мягкой тенью (амбиент, не «карточка в воздухе»). Тень отделяет панель от фона, а не создаёт декор: `0 1px 2px ink/4%, 0 24px 48px -32px ink/25%`. Поля ввода несут только микро-тень 1px. Свечение зарезервировано за акцентом: логотип и прогресс.

### Shadow Vocabulary
- **panel-ambient** (`0 1px 2px oklch(0.22 0.012 45 / 0.04), 0 24px 48px -32px oklch(0.22 0.012 45 / 0.25)`): все панели.
- **cta-ambient** (`0 8px 20px -12px oklch(0.55 0.165 34 / 0.85)`): главная кнопка.
- **field-ambient** (`0 1px 2px oklch(0.22 0.012 45 / 0.04)`): поля ввода.

### Named Rules
**The Ambient Rule.** Тень — признак поверхности, а не состояния. Hover меняет цвет, а не высоту.

## 5. Components

Компоненты спокойные и точные: состояние меняется цветом и линией, не формой.

### Buttons
- **Shape:** скругление 10px, высота 42px, горизонтальный паддинг 16px.
- **Primary:** Ember, белый текст, иконка 16px слева; hover → Ember Hot; active → сдвиг на 1px; disabled → 45%.
- **Outline:** белый фон, линия Seam; hover → Paper Raised.
- **Ghost:** только текст Ash; hover → Graphite Ink, Paper Raised.

### Cards / Containers
- **Corner Style:** 18px.
- **Background:** Paper.
- **Border:** 1px Seam; внутренние разделители — Seam.
- **Internal Padding:** 24–40px (форма), 20px (рейл), строки детали — 16px.
- **Shadow Strategy:** panel-ambient, см. Elevation.

### Inputs / Fields
- **Style:** бумажный белый, линия Seam, скругление 10px, высота 44px, текст 15px.
- **Hover:** обводка Seam Strong. **Focus:** обводка Ember, кольцо 2px Ember/25%.
- **Error:** обводка Fault, текст ошибки 12.5px Fault.
- **Label:** 13px Ash + миниатюрная метка-маркер (14px): штрихи в покое, галочка Ember при заполнении.

### Navigation
- **Style:** липкая шапка 64px, полупрозрачный фон с размытием, нижняя линия Seam. Справа — сегментированный переключатель: активный пункт залит Graphite Ink с белым текстом, неактивный — Ash с переходом в Ink на hover.

### Signature: Ответы (Admin)
- **Style:** два столбца — список записей (340px) и деталь ответа; на мобильном переключаются кнопкой «К списку».
- **List item:** аватар-инициал, имя, контакт, время; выбранный — тёплая подложка Ember/6% и Ember-аватар с белой буквой.
- **Detail:** `dl` с подписями Ash слева (200px) и значениями Graphite Ink; пустое значение — «Не заполнено».

## 6. Do's and Don'ts

### Do:
- **Do** держать сетку на 4px-шаге и токенах выше; новые оттенки — только через OKLCH-переменные.
- **Do** давать каждому интерактиву default, hover, focus-visible, active, disabled.
- **Do** использовать Ember для одного действия на экран и для обязательных маркеров.
- **Do** занимать ширину экрана: контентная сетка max-width 80rem, панель формы — белая поверхность с воздухом вокруг.
- **Do** уважать `prefers-reduced-motion`.

### Don't:
- **Don't** делать тёмный фон по умолчанию — форма живёт в дневном контексте.
- **Don't** добавлять гигантские hero-блоки и «SaaS-лендинг» на форму.
- **Don't** использовать стеклянные карточки, градиентные заголовки и декоративные блобы.
- **Don't** применять светло-бежевые «тёплые» AI-шаблоны или дождевой серо-белый SaaS-фон.
- **Don't** перегружать панель графиками ради графиков.
- **Don't** ставить цветной `border-left` толще 1px или «тени-карточки в воздухе».
