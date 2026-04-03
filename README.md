# Gradient Background Generator

A powerful Next.js application for creating stunning SVG gradient backgrounds with real-time preview and customizable color palettes.

## Features

- **Dual Color Modes**: Choose between Free Choice mode for full control or Recommended mode for AI-assisted color palettes
- **Smart Color Recommendations**: Select a base color and get complementary, analogous, and triadic color combinations
- **Real-time Preview**: See your gradient backgrounds update instantly as you modify colors
- **Custom Color Palettes**: Add up to 8 colors to create unique gradients
- **Preset Templates**: Choose from professionally designed color combinations
- **API Integration**: Generate gradients programmatically via REST API
- **SVG Export**: Download your creations as high-quality SVG files
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Data Caching**: Your color palettes are automatically saved across sessions

## Usage Guide

### Free Choice Mode
- Complete manual control over your color palette
- Add, remove, and modify colors freely
- Perfect for when you have specific colors in mind

### Recommended Mode
1. Select a base color using the color picker
2. Click "Generate Recommendations" to get a smart color palette
3. The algorithm uses color theory to suggest:
   - Complementary colors (high contrast)
   - Analogous colors (harmonious)
   - Triadic colors (balanced)
   - Adjusted brightness and saturation variations
4. You can still modify, add, or remove any recommended colors
5. Change the base color at any time and regenerate

## Getting Started

Read the documentation at https://opennext.js.org/cloudflare.

## Develop

Run the Next.js development server:

```bash
npm run dev
# or similar package manager command
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Preview

Preview the application locally on the Cloudflare runtime:

```bash
npm run preview
# or similar package manager command
```

## Deploy

Deploy the application to Cloudflare:

```bash
npm run deploy
# or similar package manager command
```

## Custom Domain

The deployed application is available at:

**gbg.nuclearrockstone.xyz**

Configure your DNS and Cloudflare settings accordingly (add the appropriate CNAME/A records and route the domain to your Cloudflare deployment).

## API Usage

Generate gradients programmatically using the REST API:

```
GET https://gbg.nuclearrockstone.xyz/api?colors=hex_FF0000&colors=hex_00FF00&width=800&height=600
```

### Parameters:
- `colors`: Hex colors with `hex_` prefix (e.g., `hex_FF0000` for red)
- `width`: Image width in pixels (100-2000)
- `height`: Image height in pixels (100-2000)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
