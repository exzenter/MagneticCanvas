# Magnetic Canvas

[https://exzent.de](https://exzent.de)

Interactive magnetic filings effect — small bars rotate to follow the cursor like iron filings near a magnet.

## Demo (Standalone)

Open `index.html` in a browser. The canvas fills the viewport and filings track the mouse in real time.

### Features

- DPI-aware canvas rendering
- Batched single-path drawing for high performance
- Smooth angle interpolation
- IntersectionObserver pauses animation when off-screen

## WordPress Gutenberg Block

The `magnetic-filings-wp/` folder contains a drop-in WordPress plugin.

### Installation

1. Copy `magnetic-filings-wp/` into `wp-content/plugins/`
2. Activate **Magnetic Filings** in the WordPress admin
3. Add the **Magnetic Filings** block from the block inserter (Design category)

### Block Settings

| Setting | Description | Range |
|---------|-------------|-------|
| Aspect Ratio | Canvas proportions | 16:9, 4:3, 3:2, 1:1, 21:9, 9:16 |
| Filing Color | Color of the filings | Color picker |
| Background Color | Canvas background | Color picker |
| Shaving Length | Length of each filing | 4 – 60 px |
| Shaving Width | Thickness of each filing | 1 – 10 px |
| Amount X | Number of columns | 2 – 60 |
| Amount Y | Number of rows | 2 – 60 |

The editor shows a live interactive preview. On the frontend, filings respond to the cursor anywhere on the page while the IntersectionObserver ensures zero CPU usage when scrolled out of view.

## License

GPL-2.0-or-later
