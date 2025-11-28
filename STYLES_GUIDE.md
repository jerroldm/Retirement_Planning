# Style Guide - Retirement Planning Visualizer

This document outlines the design system and styling conventions for the Retirement Planning Visualizer application.

## Color Palette

### Primary Colors
- **Primary Blue**: `#007bff` - Used for primary actions, buttons, links, and highlights
- **Dark Blue**: `#0056b3` - Primary button hover state
- **Darker Blue**: `#004085` - Primary button active state

### Neutral Colors
- **Dark Text**: `#333` - Primary text color for body content
- **Gray Text**: `#666` - Secondary text color for labels and descriptions
- **Light Gray**: `#999` - Tertiary text color for less important information
- **Light Background**: `#f5f5f5` - Page background color
- **Border Gray**: `#ddd` - Standard border color
- **Light Border**: `#e0e0e0` - Light borders for cards and sections

### Status/Semantic Colors
- **Error Red**: `#dc3545` - Used for errors, validation messages, and delete actions
- **Success Green**: `#28a745` - Used for success states and confirmations
- **Warning Amber**: `#FF9800` - Used for warnings and hover states on expense cards

## Button Styles

### Standard Button Classes

All form buttons should use the following class structure:

```html
<!-- Primary Action Button (Blue) -->
<button type="submit" class="btn btn-primary">Action Label</button>

<!-- Secondary Action Button (Gray) -->
<button type="button" class="btn btn-secondary">Cancel</button>
```

### CSS Definition

```css
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}
```

### Button Usage by Component

#### Personal, Income, Expenses, Social Security Tabs
- Uses `.btn .btn-primary` and `.btn .btn-secondary` classes
- Located in respective Form components (ExpensesForm.jsx, IncomeForm.jsx, etc.)
- CSS styling defined in PersonTypeSelector.css (base styles) and component-specific CSS

#### Savings Accounts Tab
- **Component**: SavingsAccountForm.jsx
- **CSS**: SavingsAccountForm.css
- **Button Classes**: `.btn .btn-primary` and `.btn .btn-secondary`
- **Form Wrapper**: `.form-actions` class

#### Assets Tab
- **Component**: AssetForm.jsx
- **CSS**: AssetForm.css
- **Button Classes**: `.btn .btn-primary` and `.btn .btn-secondary`
- **Form Wrapper**: `.modal-footer` class

### Special Button Styles

#### Add/Action Buttons (List Views)
- Used for adding new items to lists
- Example: `.btn-add-income`, `.btn-add-expense`
- Color: Blue (#007bff) to indicate primary action
- CSS Pattern:
  ```css
  .btn-add-{action} {
    padding: 10px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn-add-{action}:hover {
    background: #0056b3;
  }
  ```

#### Icon Buttons
- Used for edit/delete actions in cards
- Small square buttons with icon emojis
- Example: `.btn-icon`
- CSS Pattern:
  ```css
  .btn-icon {
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background-color: #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-icon:hover {
    background-color: #e0e0e0;
  }

  .btn-icon.edit:hover {
    background-color: #e3f2fd;  /* Light blue tint */
  }
  ```

#### Reset Button
- Used for form reset actions
- Example: `.btn-reset` in InputForm
- Subtle gray styling
- CSS Pattern:
  ```css
  .btn-reset {
    padding: 8px 16px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.2s;
  }

  .btn-reset:hover {
    background: #e8e8e8;
  }
  ```

#### Logout Button
- Header button for logout action
- White text on transparent dark background
- CSS Pattern:
  ```css
  .btn-logout {
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
  }

  .btn-logout:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
  ```

## Form Styling

### Form Layout
- Forms use `.form-layout` class for flex column layout
- Form groups use `.form-grid` for responsive grid layout
- Gap between sections: 16px

### Form Inputs
- Padding: `10px 12px`
- Border: `1px solid #ddd`
- Border Radius: `4px`
- Font Size: `14px`
- Focus State: Border changes to `#007bff`, box-shadow with rgba(0, 123, 255, 0.1)

### Form Labels
- Font Weight: `500`
- Font Size: `14px`
- Color: `#333`
- Margin Bottom: `6px`

### Form Actions Container
- Display: `flex`
- Gap: `12px`
- Buttons grow equally with `flex: 1`
- Margin Top: `8px` (SavingsAccountForm) or `20px` (AssetForm with border-top)

## Modal Styling

### Modal Overlay
- Position: `fixed` (full screen)
- Background: `rgba(0, 0, 0, 0.5)` (semi-transparent dark)
- Display: `flex` with center alignment
- Z-Index: `1000`

### Modal Content
- Background: `white`
- Border Radius: `8px`
- Box Shadow: `0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.15)`
- Max Width: `600px` (forms) to `800px` (complex forms like AssetForm)
- Width: `90%`
- Padding: `24px` (standard) to `30px 20px` (account forms)

### Modal Headings
- Font Size: `20px` (h2) to `24px` (h3)
- Margin: `0 0 8px 0`
- Color: `#333`
- Font Weight: `600-700`

### Modal Body
- Max Height: `70vh`
- Overflow: `auto`

## Cards and List Styling

### Card Styling
- Border: `1px solid #e0e0e0`
- Border Radius: `8px`
- Padding: `16px`
- Background: `white`
- Transition: `all 0.3s ease`
- Box Shadow: `0 2px 4px rgba(0, 0, 0, 0.05)`

### Card Hover States
- Border Color: Changes to semantic color (e.g., `#FF9800` for expenses)
- Box Shadow: Increases to `0 4px 12px rgba(color, 0.15)`
- Background: Slight tint (optional)

### List Container
- Display: `grid`
- Template Columns: `repeat(auto-fill, minmax(300px, 1fr))`
- Gap: `16px`

### List Headers
- Display: `flex`
- Justify Content: `space-between`
- Align Items: `center`
- Margin Bottom: `30px`
- Padding Bottom: `20px`
- Border Bottom: `2px solid #e0e0e0`

## Typography

### Font Family
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
```

### Font Sizes
- Headings (h1): `32px` (page title)
- Headings (h2): `24px` (section title)
- Headings (h3): `20px` (modal/card title)
- Headings (h5): `15px` (card subtitle)
- Body: `14px`
- Small: `12px-13px` (labels, metadata)

### Font Weights
- Regular: `400`
- Medium: `500` (labels, secondary text)
- Semibold: `600` (card titles)
- Bold: `700` (page titles)

## Spacing

### Standard Gaps/Margins
- Extra Small: `4px` (inline spacing)
- Small: `8px` (tight grouping)
- Standard: `12px-16px` (normal spacing)
- Medium: `20px` (section spacing)
- Large: `24px-30px` (major sections)

## Border Radius

- Standard: `4px` (inputs, buttons, cards)
- Large: `8px` (modals, list items)
- Circular: `50%` (spinner, avatars)

## Transitions

- Standard: `0.3s ease`
- Quick: `0.2s ease`
- Hover Effects: Use `.3s ease` for background color changes

## Responsive Behavior

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Grid Adjustments
- Forms adjust to single column on mobile
- Card grids use `minmax(200px, 1fr)` or `minmax(300px, 1fr)` to maintain minimum width
- Sidebar collapses on mobile to bottom navigation

## Accessibility

### Color Contrast
- All text should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Do not rely on color alone to convey information

### Focus States
- All interactive elements must have visible focus indicators
- Use: `outline: none; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);`

### Button Sizing
- Minimum clickable area: `32px × 32px` for touch targets
- Standard button padding ensures proper size

## Implementation Standards

### When Adding New Buttons
1. Use `.btn .btn-primary` for primary actions (submit, save, create)
2. Use `.btn .btn-secondary` for secondary actions (cancel, reset)
3. Define button CSS in component-specific CSS file, not global
4. Use consistent padding: `10px 16px`
5. Always include hover and active states
6. Consider focus states for accessibility

### When Creating New Components
1. Follow modal styling standards for overlay forms
2. Use consistent spacing between form groups
3. Use form-actions or modal-footer for button containers
4. Apply transitions for all interactive state changes
5. Maintain color consistency with palette

### Consistency Checklist
- [ ] All form buttons use `.btn .btn-primary` and `.btn .btn-secondary`
- [ ] Colors match the defined palette
- [ ] Hover and active states are defined
- [ ] Focus states are visible
- [ ] Spacing follows standard gaps (4px, 8px, 12px, 16px, 20px, 24px)
- [ ] Border radius is 4px for inputs/buttons, 8px for cards/modals
- [ ] Transitions use 0.3s ease
- [ ] Component-specific CSS includes button styling
