# Styling Guide - List Components

This guide documents the standardized styling approach for all list/data display components in the application.

## Overview

All list components (PersonList, IncomeList, SavingsAccountList, AssetList) follow a consistent design pattern for unified visual appearance and user experience.

## List Component Structure

Every list component has three states:

### 1. Empty State
When there are no items to display:
- Display a centered, flexible container
- Include a brief message explaining the empty state
- Display the "Add" button centered below the message
- Use subtle, muted colors

**CSS Pattern:**
```css
.{name}-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #999;
}

.{name}-list-empty p {
  margin: 0 0 20px 0;
  font-size: 16px;
}
```

**Spacing Details:**
- Vertical padding: 60px (top and bottom)
- Horizontal padding: 20px (left and right)
- Paragraph margin-bottom: 20px (space between message and button)
- Text color: #999 (muted gray)
- Font size: 16px

### 2. Header Section (When data exists)
When items are present, display a header with title and action button:

**CSS Pattern:**
```css
.{name}-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.{name}-list-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}
```

**Spacing Details:**
- Flex layout: space-between (pushes title and button to opposite ends)
- Margin-bottom: 30px (space between header and content below)
- Padding-bottom: 20px (space inside header, above border)
- Border: 2px solid #e0e0e0 (light gray separator line)
- H2 font-size: 24px
- H2 color: #333 (dark gray for contrast)

### 3. Action Button
Both empty and populated states use the same blue button style:

**CSS Pattern:**
```css
.btn-add-{item} {
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

.btn-add-{item}:hover {
  background: #0056b3;
}

.btn-add-{item}:active {
  background: #004085;
}
```

**Color Scheme:**
- Default: #007bff (blue)
- Hover: #0056b3 (darker blue)
- Active: #004085 (darkest blue)
- Padding: 10px 16px (vertical, horizontal)
- Font size: 14px
- Font weight: 500 (medium weight)

## Implemented Components

### PersonList
- **List file:** PersonList.jsx
- **Styles file:** PersonList.css
- **Header title:** "Your People"
- **Button text:** "+ Add Person"
- **Empty message:** "No people yet."
- **First item button text:** "+ Add your first person"

### IncomeList
- **List file:** IncomeList.jsx
- **Styles file:** IncomeList.css
- **Header title:** "Your Income Sources"
- **Button text:** "+ Add Income Source"
- **Empty message:** "No income sources yet."
- **First item button text:** "+ Add your first income source"

### SavingsAccountList
- **List file:** SavingsAccountList.jsx
- **Styles file:** SavingsAccountList.css
- **Header title:** "Your Savings Accounts"
- **Button text:** "+ Add Savings Account"
- **Empty message:** "No savings accounts yet."
- **First item button text:** "+ Add your first savings account"

### AssetList
- **List file:** AssetList.jsx
- **Styles file:** AssetList.css
- **Header title:** "Your Assets"
- **Button text:** "+ Add Asset"
- **Empty message:** "No assets yet"
- **First item button text:** "+ Add your first asset"

### ExpensesList
- **List file:** ExpensesList.jsx
- **Styles file:** ExpensesList.css
- **Header title:** "Your Expenses"
- **Button text:** "+ Add Expense"
- **Empty message:** "No expenses yet."
- **First item button text:** "+ Add your first expense"
- **Note:** Cards displayed in responsive grid using `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`

## JavaScript Pattern

Each list component follows this structure:

```javascript
export const ListComponent = ({ items, onEdit, onDelete, onAddItem }) => {
  const hasItems = items.length > 0;

  // Show empty state if no items
  if (!hasItems) {
    return (
      <div className="list">
        <div className="list-empty">
          <p>No items yet.</p>
          <button className="btn-add-item" onClick={onAddItem}>
            + Add your first item
          </button>
        </div>
      </div>
    );
  }

  // Show header + content if items exist
  return (
    <div className="list">
      <div className="list-header">
        <h2>Your Items</h2>
        <button className="btn-add-item" onClick={onAddItem}>
          + Add Item
        </button>
      </div>

      <div className="list-content">
        {/* Render items as individual cards in horizontal grid */}
        {items.map(item => (
          <div key={item.id} className="item-card">
            {/* Card content */}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Card Grid Layout

All list components display cards in a **responsive horizontal grid layout**, not vertically stacked:

**CSS Pattern:**
```css
.list-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
```

**Key Details:**
- Use `display: grid` for the container (NOT flexbox)
- Use `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` for responsive columns
- Minimum card width: 300px
- Gap between cards: 16px
- Cards automatically wrap to next row when space is available
- On mobile (600px and below), adjust to single column if needed

This ensures cards flow horizontally and fill available width, matching the layout of PersonList, IncomeList, SavingsAccountList, AssetList, and ExpensesList.

## Card Action Icons

All list component cards include edit and delete action buttons organized horizontally in the top-right of each card.

**CSS Pattern:**
```css
.{component}-actions {
  display: flex;
  gap: 8px;
  min-width: fit-content;
}

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
  background-color: #e3f2fd;
}
```

**Icon Specifications:**
- **Edit Icon:** ✏️ (Yellow Pencil emoji)
- **Delete Icon:** 🗑️ (Trash Can emoji)
- **Button size:** 32x32px (width and height)
- **Gap between icons:** 8px
- **Background color:** #f0f0f0 (light gray)
- **Hover background (default):** #e0e0e0 (darker gray)
- **Hover background (edit):** #e3f2fd (light blue)
- **Border radius:** 4px
- **Font size:** 16px (for emoji rendering)

**Placement in Card:**
Icons are placed in the card header, aligned to the right with flexbox `justify-content: space-between` on the header container. The `.{component}-actions` wrapper ensures icons stay together horizontally and don't wrap.

## Key Design Principles

1. **Consistent Spacing:**
   - Empty state: 60px vertical, 20px horizontal padding
   - Header margin-bottom: 30px
   - Header padding-bottom: 20px

2. **Color Consistency:**
   - Muted text: #999
   - Dark text: #333
   - Border: #e0e0e0
   - Button: #007bff (blue)

3. **Button Placement:**
   - Empty state: Centered below message
   - With items: Top-right in header (flexbox space-between)

4. **Typography:**
   - Headers (h2): 24px, #333
   - Empty messages: 16px, #999
   - Buttons: 14px, medium weight (500)

5. **Visual Hierarchy:**
   - Clear distinction between empty and populated states
   - Header visually separates title from content
   - Button color draws attention without being overwhelming

## Future Consistency

When creating new list components:
1. Copy CSS structure from existing component
2. Update class names to match component name
3. Update heading titles to follow "Your [Items]" pattern
4. Use this same empty state → header + content pattern
5. Maintain blue button color (#007bff) for all add actions

## Notes

- No dotted borders on empty state (removed for clean look)
- Flexbox centering provides better alignment than text-align
- 60px padding gives generous breathing room in empty state
- 2px border on header provides subtle visual separation
- Hover and active states on buttons provide visual feedback
