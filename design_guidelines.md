# Qnnect Design Guidelines

## Design Approach: Professional Video Platform
**Approach**: Hybrid design system inspired by modern video productivity tools (Loom, Descript, Linear)  
**Rationale**: As a professional interview practice tool with real-time video analysis, the interface must prioritize clarity, minimal distraction during recording, and efficient data visualization. The design balances video-centric layouts with dashboard-style analytics.

---

## Core Design Principles
1. **Distraction-Free Recording**: Clean, uncluttered interface during active interviews
2. **Data Clarity**: Real-time metrics must be instantly readable without cognitive load
3. **Professional Trust**: Visual design conveys reliability and expertise
4. **Contextual Visibility**: Show controls and data only when relevant to current task

---

## Color Palette

### Dark Mode Primary (Default)
- **Background**: 222 15% 8% (deep charcoal)
- **Surface**: 222 15% 12% (elevated panels)
- **Surface Elevated**: 222 15% 16% (cards, modals)
- **Border**: 222 10% 25% (subtle separation)

### Accent Colors
- **Primary Brand**: 262 83% 58% (vibrant purple - confidence, tech)
- **Success/Active**: 142 76% 45% (green - recording indicator, positive metrics)
- **Warning**: 38 92% 50% (amber - attention states)
- **Error**: 0 84% 60% (red - critical feedback)

### Text Hierarchy
- **Primary Text**: 0 0% 98% (high contrast)
- **Secondary Text**: 0 0% 65% (muted information)
- **Tertiary Text**: 0 0% 45% (timestamps, metadata)

---

## Typography

**Font Stack**: 
- Primary: 'Inter' (Google Fonts) - clean, professional, excellent at small sizes
- Monospace: 'JetBrains Mono' - for timestamps, metrics, code

**Scale**:
- **Display**: text-4xl font-bold (interview titles, empty states)
- **Heading**: text-2xl font-semibold (section headers)
- **Subheading**: text-lg font-medium (card titles, labels)
- **Body**: text-base font-normal (primary content)
- **Caption**: text-sm font-normal (metadata, helper text)
- **Micro**: text-xs font-medium (badges, status indicators)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** consistently
- `p-4` for compact component padding
- `p-6` for standard card/panel padding  
- `gap-4` for related elements
- `gap-8` for section separation
- `space-y-6` for vertical stacking

**Grid System**:
- **Dashboard Layout**: Sidebar (w-64) + Main content area (flex-1)
- **Interview View**: Full-width video with floating overlay panels
- **Analytics Grid**: 2-4 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)

---

## Component Library

### Video Interface
- **Video Container**: Rounded corners (rounded-xl), aspect-16/9, dark backdrop
- **Recording Controls**: Floating bottom panel with glassmorphic effect (backdrop-blur-xl bg-black/40)
- **Status Indicators**: Top-right corner badges (recording pulse animation, duration timer)
- **Preview Overlay**: Grid lines (rule of thirds) toggleable

### Real-Time Metrics Panel
- **Emotion Display**: Circular progress indicators with emoji icons, percentage values
- **Live Transcript**: Scrolling text area with auto-scroll, speaker labels, timestamp markers
- **Confidence Meter**: Horizontal bar chart with gradient fill (low=amber, high=green)
- **Speech Pattern Graph**: Minimalist line chart showing pace/clarity over time

### Navigation & Controls
- **Sidebar Navigation**: Icon + label, active state with left border accent (border-l-4 border-primary)
- **Action Buttons**: 
  - Primary: Solid bg-primary with shadow
  - Secondary: Border variant with hover state
  - Danger: Red variant for delete/cancel
- **Recording Button**: Large circular button (h-16 w-16) with pulsing red indicator when active

### Data Visualization
- **Interview Cards**: Grid layout, thumbnail preview, duration badge, score indicator
- **Timeline Scrubber**: Video timeline with emotion markers as colored dots above track
- **Analytics Dashboard**: Stats cards with icon, number (text-3xl), and label
- **Transcript Sync**: Split view with video on left, scrolling transcript on right

### Feedback States
- **Loading**: Skeleton screens with shimmer effect for video processing
- **Empty States**: Illustration + heading + CTA (centered, max-w-md)
- **Error States**: Alert box with icon, message, and retry action
- **Success**: Toast notification (top-right, auto-dismiss)

---

## Interaction Patterns

### Recording Flow
1. **Setup Screen**: Camera preview + mic check + question display
2. **Recording Mode**: Full-screen video, minimal UI, escape to pause
3. **Processing**: Upload progress bar with percentage, thumbnail generation preview
4. **Review**: Playback with synchronized transcript and emotion timeline

### Dashboard Navigation
- **Quick Actions**: Prominent "Start Interview" FAB (fixed bottom-right)
- **Filter/Search**: Top bar with keyword search, date range, difficulty filter
- **Sort Options**: Dropdown with recent, score, duration options

### Real-Time Feedback
- **Emotion Detection**: Subtle emoji transitions (no jarring updates)
- **Speech Transcription**: Smooth scroll, highlight current phrase
- **Confidence Tracking**: Animated bar with easing transitions

---

## Animation Guidelines
**Minimal & Purposeful Only**:
- Recording indicator pulse (subtle, 2s loop)
- Progress bars (smooth spring animation)
- Modal entry/exit (fade + scale, 200ms)
- Toast notifications (slide-in from top-right)
- **NO** decorative animations, parallax, or scroll effects

---

## Responsive Behavior
- **Desktop (lg+)**: Sidebar + main content, multi-column analytics
- **Tablet (md)**: Collapsible sidebar, 2-column grids
- **Mobile**: Bottom nav bar, single column, full-width video

---

## Accessibility
- WCAG AA contrast ratios maintained
- Focus indicators: 2px ring with primary color offset
- Keyboard navigation: All controls accessible via Tab
- Screen reader labels for all icon buttons
- Live region announcements for recording state changes

---

## Images
**No hero images** - this is a functional application, not a marketing site.

**Video Thumbnails**: Auto-generated from first frame using Canvas API, displayed in interview history cards (16:9 aspect, rounded-lg, hover overlay with play icon)

**Empty State Illustrations**: Simple, monochromatic line art for "No interviews yet" state (centered, max-w-xs)