# Design Guidelines: Video Hosting & Download Platform

## Design Approach
**Reference-Based:** Drawing inspiration from Netflix, YouTube, and Vimeo's media-centric interfaces, prioritizing visual content discovery and seamless media interaction.

## Core Design Elements

### Typography
- **Headings:** Inter Bold (font-weight: 700) for titles and section headers
- **Body:** Inter Regular (font-weight: 400) for descriptions and metadata
- **Metadata:** Inter Medium (font-weight: 500, text-sm) for video duration, file size, upload dates
- **Hierarchy:** 
  - Hero: text-5xl to text-6xl
  - Section titles: text-3xl
  - Video titles: text-lg
  - Metadata: text-sm

### Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (e.g., p-4, gap-6, mt-8)
- Container: max-w-7xl with px-4 md:px-6 lg:px-8
- Section padding: py-12 md:py-16 lg:py-24
- Card gaps: gap-4 md:gap-6
- Grid spacing: grid with gap-4 md:gap-6

### Component Library

**Hero Section:**
- Full-width cinematic hero showcasing featured video
- Large video thumbnail background with gradient overlay
- Centered content: Platform title, tagline, primary CTA ("Browse Library")
- Height: min-h-[70vh] on desktop, min-h-[50vh] on mobile

**Video Grid:**
- Responsive grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Video cards with 16:9 aspect ratio thumbnails
- Hover state: Scale up thumbnail slightly (scale-105), show play icon overlay
- Card structure: Thumbnail + Title + Metadata row (duration, size, views)

**Video Detail Modal/Page:**
- Large video player (16:9 aspect ratio)
- Video controls beneath player
- Download button (prominent, with file size)
- Video metadata sidebar: Title, description, upload date, category tags
- Related videos section below

**Search & Filter Bar:**
- Sticky top navigation bar
- Search input with icon (left-aligned)
- Filter dropdowns: Category, Upload Date, File Size
- Grid/List view toggle on right

**Upload Interface:**
- Drag-and-drop zone with dashed border
- Upload progress bars with percentage
- Thumbnail preview generation after upload
- Form fields: Title, Description, Category

**Admin Panel:**
- Sidebar navigation
- Table view of all videos
- Quick actions: Edit, Delete, Download
- Bulk selection capability

### Animations
- Card hover: Smooth scale transition (transition-transform duration-200)
- Thumbnail loading: Subtle skeleton loading state
- Video player: Fade-in controls on hover

## Images

**Hero Section:**
- Large cinematic still from a featured movie/video
- Aspect ratio: 21:9 or 16:9 ultra-wide
- Dark gradient overlay (from bottom) to ensure text readability
- CTA button with backdrop-blur-md background

**Video Thumbnails:**
- 16:9 aspect ratio for all video cards
- High-quality preview frames from videos
- Placeholder: Gradient background with play icon for videos without thumbnails

**Empty States:**
- Illustration for empty library: Simple icon-based graphic
- Upload dropzone: Cloud upload icon centered

## User Experience Details
- Thumbnail hover reveals quick actions (Play, Download, Add to Playlist)
- Download button shows file size and format
- Video duration overlay on bottom-right of thumbnails
- Category tags as clickable filters
- Breadcrumb navigation for admin panel
- Toast notifications for upload/download progress