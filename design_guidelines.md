# Windows 96-Inspired File Storage System - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based (Windows 96 Retro Aesthetic)

Drawing inspiration from Windows 95/96 operating systems, this design embraces retro computing aesthetics with modern functionality. The interface recreates the nostalgic desktop environment with pixel-perfect attention to classic UI patterns while ensuring usability for contemporary users.

## Core Design Principles

1. **Authentic Retro Styling:** Embrace skeumorphic design with 3D beveled edges, inset panels, and classic window chrome
2. **Grid-Based Desktop:** Strict grid alignment for desktop icons with snap-to-grid behavior
3. **Layered Windows:** Z-index management for overlapping windows with classic title bars
4. **Pixel-Perfect Precision:** Sharp edges, no rounded corners (except where authentic to era)

## Typography

**System Fonts:**
- Primary: `"MS Sans Serif", "Microsoft Sans Serif", Arial, sans-serif` (8pt/10pt/12pt)
- Monospace: `"Courier New", Courier, monospace` (for file viewers)
- Title Bars: Bold, 11px font size
- Desktop Icons: 10px font size with text-shadow for legibility
- Menu Text: 11px regular weight

**Hierarchy:**
- Window titles: Bold, small caps effect
- File names: Regular weight, truncated with ellipsis
- Context menus: Standard weight with underlined access keys

## Layout System

**Spacing Units:** Tailwind units of 1, 2, 3, 4, 6, 8 (tight spacing characteristic of retro UIs)

**Desktop Grid:**
- Icon grid: 80px × 90px cells (icon + label)
- Grid gap: 16px horizontal, 12px vertical
- Desktop padding: p-4 from edges
- Snap-to-grid positioning for all desktop items

**Window Layout:**
- Title bar height: h-7 (28px)
- Window borders: 2px raised/inset borders
- Content padding: p-3 inside windows
- Minimum window size: 320px × 240px
- Taskbar height: h-10 (40px)

## Component Library

### Taskbar (Fixed Top)
- Full width bar with 3D raised effect
- Left section: Desktop return button (house icon, 32px square)
- Center section: Tabs for open files (max-width per tab: 180px, truncated text)
- Right section: User profile indicator (32px square)
- Tab active state: Inset appearance
- Tab inactive state: Raised appearance

### Desktop Icons
- Icon size: 32px × 32px pixel art style
- Label: 2-line max, centered below icon, max-width: 70px
- Selected state: Inverted appearance with dotted border
- Hover state: Single-pixel highlight border
- File type icons: Distinct pixel art for .txt, .jpg, .mp4, .mp3, folder, recycle bin, user profile

### Windows/File Viewers
- Classic window chrome with title bar containing:
  - Left: Window icon (16px)
  - Center: File name
  - Right: Minimize, maximize, close buttons (16px each, 3D buttons)
- 3D beveled border (2px width, raised effect)
- Content area: White/neutral background with inset border
- Resizable via corner/edge drag handles
- Text viewer: Monospace font, scrollable textarea
- Image viewer: Centered image with scroll if needed
- Video/Audio viewer: Embedded player controls (browser default styled retro-appropriate)

### Context Menus
- Dropdown list with 1px solid border
- Menu items: Full-width, left-aligned text with 16px left padding
- Item height: h-7 each
- Hover state: Filled background
- Divider lines: 1px solid, my-1 spacing
- Keyboard shortcuts shown right-aligned in gray text

### Recycle Bin
- Special folder icon on desktop (trash can pixel art)
- Opens as window showing deleted files in list view
- Header with "Empty Recycle Bin" button (classic 3D button)
- File list with columns: Name, Original Location, Date Deleted

### Settings Window
- Tab navigation at top (General, Appearance, Themes)
- **Appearance tab:**
  - Desktop background upload: File input with preview (200px × 150px)
  - Theme selector: Radio buttons with theme names
  - Custom color pickers: 6-8 controls for UI elements (buttons, borders, backgrounds)
- **Themes tab:**
  - Pre-made theme cards (100px × 80px previews)
  - Light/Dark/Classic/High Contrast options
- Standard OK/Cancel/Apply buttons at bottom (3D button style)

### User Profile Icon
- Desktop icon with generic user avatar pixel art
- Context menu options: "Change Profile Data", "Settings", "Log Out"
- Double-click opens login/profile window

### Authentication Modal
- Centered modal (400px × 300px) with classic dialog styling
- Login form: Username/password inputs with 3D inset borders
- "Create Account" / "Sign In" toggle
- Submit button: Wide, 3D raised button

### Shared File Link Generation
- Dialog window (350px × 200px)
- Text input showing generated URL (read-only, 3D inset)
- "Copy Link" button
- Close button

## Interaction Patterns

- **Drag and Drop:** Desktop icons snap to grid, ghost preview during drag
- **Double-Click:** Opens file in maximized window
- **Right-Click:** Context menu appears at cursor position
- **Window Management:** Click taskbar tab to restore/focus, click again to minimize
- **File Selection:** Click selects (inverted state), Ctrl+click for multi-select

## Animations

**Minimal/Period-Appropriate:**
- Window minimize: Instant disappear (no animation)
- Window maximize: Instant resize
- Context menu: Instant appear/disappear
- Drag feedback: Cursor change only
- Loading: Classic hourglass cursor or spinning disk icon

## Accessibility

- Keyboard navigation: Tab through interactive elements, arrow keys in menus
- Enter/Space activates buttons and menu items
- Escape closes windows and context menus
- Alt+underlined letter for menu access keys
- Focus indicators: Dotted outline on focused elements

## Images

**Desktop Background:**
- User-uploadable, full-screen background image
- Aspect ratio: Any (CSS cover/contain)
- Fallback: Solid teal/gray gradient (Windows 96 default aesthetic)

**Icon Set:**
- Pixel art style icons (32px × 32px) for all file types
- Consistent 16-color palette for retro authenticity
- Clear visual distinction between file types

This design creates an authentic retro computing experience while maintaining modern web standards and usability. The skeumorphic approach with 3D beveled UI elements, grid-snapping icons, and classic window management recreates the nostalgic feel of Windows 96 desktop environments.