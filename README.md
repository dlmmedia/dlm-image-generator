# 🎨 DLM Image Generator

A comprehensive AI image generation platform powered by **Nano Banana** and **OpenAI** models, inspired by [Higgsfield.ai](https://higgsfield.ai/).

![DLM Generator](https://raw.githubusercontent.com/JimmyLv/awesome-nano-banana/main/cases/5/ghibli-style-mona-lisa.png)

## ✨ Features

- **100+ Creative AI Styles** - Curated collection from [awesome-nano-banana](https://github.com/JimmyLv/awesome-nano-banana)
- **Multiple AI Models** - Nano Banana, Nano Banana Pro (4K), and OpenAI Image Generation
- **Beautiful Card-Based UI** - Modern, premium design inspired by Higgsfield.ai
- **Reference Image Support** - Upload images as references for generation
- **Project Gallery** - Save and organize your generations
- **Advanced Controls** - Resolution, aspect ratio, and model selection

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API Keys for Nano Banana and/or OpenAI (optional for demo mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dlm-image-generator.git
cd dlm-image-generator

# Install dependencies
npm install

# Set up environment variables
cp env.example.txt .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Nano Banana API Key
NANO_BANANA_API_KEY=your_nano_banana_api_key

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Vercel Blob Storage Token (for image persistence)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## 📱 Pages

### Explore (`/`)
- Browse 100+ curated AI styles
- Search by name, category, or tags
- Filter by category
- Click any style to generate

### Generate (`/generate`)
- Select a style or create custom prompts
- Upload reference images
- Choose between Nano Banana, Nano Banana Pro, or OpenAI
- Adjust resolution and aspect ratio
- Real-time preview

### Gallery (`/gallery`)
- View saved generations
- Grid and list view modes
- Regenerate from history
- Download or delete images

## 🎨 Styles Categories

- **Characters & Avatars** - Chibi, anime, Disney, fantasy
- **Art Styles** - Ghibli, watercolor, oil painting, ukiyo-e
- **Photography** - Vintage film, noir, polaroid, golden hour
- **3D & CGI** - Low poly, claymation, Lego, voxel
- **Concept Art** - Cyberpunk, steampunk, retrofuturism
- **Illustration** - Line art, comic, botanical, tarot
- **Experimental** - Glitch, holographic, dreamcore

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom components with micro-interactions
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **AI Models**: Nano Banana, OpenAI DALL-E

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/     # Image generation endpoint
│   │   ├── upload/       # Image upload endpoint
│   │   ├── styles/       # Styles API
│   │   └── projects/     # Projects API
│   ├── generate/         # Generate page
│   ├── gallery/          # Gallery page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Explore page
│   └── globals.css       # Global styles
├── components/
│   ├── navigation.tsx    # Top navigation
│   └── style-card.tsx    # Style card component
├── data/
│   └── styles.ts         # 100 curated styles
└── lib/
    ├── types.ts          # TypeScript types
    └── utils.ts          # Utility functions
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel Dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/dlm-image-generator)

### Environment Variables in Vercel

Set these in your Vercel project settings:

- `NANO_BANANA_API_KEY`
- `OPENAI_API_KEY`
- `BLOB_READ_WRITE_TOKEN`

## 🙏 Credits

- **UI Inspiration**: [Higgsfield.ai](https://higgsfield.ai/)
- **Style Library**: [awesome-nano-banana](https://github.com/JimmyLv/awesome-nano-banana)
- **AI Models**: [Nano Banana](https://nanobanana.com/), [OpenAI](https://openai.com/)

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.
