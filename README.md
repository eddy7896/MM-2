# MoodMorph

MoodMorph is a modern web application for analyzing the color palette and fonts of any website. Enter a website URL, and MoodMorph will extract and visualize the dominant colors and font families used, presenting them in an interactive, visually appealing way. The tool is designed for designers, developers, and anyone interested in understanding the visual identity of a website.

---

## Features
- Modern glassmorphism UI for address bar and controls
- Extracts and displays the main color palette from any website or uploaded image
- Shows harmonious color relationships and lets you download SVG color cards
- Detects and previews the main fonts used on the site
- Image upload with filename display and clear (X) button
- Address bar doubles as a progress bar with animated fill and live subtext prompts
- Analysis icon (magnifying glass) acts as the analyze button and becomes a clear (X) button when done
- Automatic analysis starts as soon as an image is uploaded (file input or drag-and-drop)
- Responsive design for desktop and mobile
- Animated, colorful background for a delightful user experience


## Setup & Run

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/eddy7896/web-analyser.git
   cd web-analyser/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend API (ensure it runs on `http://localhost:5000`).
4. Start the frontend:
   ```bash
   npm start
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Both Frontend and Backend

You can run both the frontend and backend by using the `start-all.bat` script:
```bash
start-all.bat
```
it will install the dependencies and start both the frontend and backend in separate terminal windows.

---

## 🐳 Docker Setup

You can containerize and run the entire project using Docker and Docker Compose.

### Build and Run with Docker Compose

1. **Build and start the containers:**
   ```sh
   docker-compose up --build
   ```
   This will build images for both the backend and frontend, install all dependencies, and start both services.

2. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

3. **Stop the services:**
   Press `Ctrl+C` in the terminal, then run:
   ```sh
   docker-compose down
   ```

### Requirements
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## 🌐 Deploy to VPS (Free Hosting)

You can deploy MoodMorph to free VPS hosting platforms like Oracle Cloud, Google Cloud, or AWS.

### Quick Deployment (One Command)

On your VPS, run this single command:

```bash
curl -fsSL https://raw.githubusercontent.com/eddy7896/web-analyser/main/quick-deploy.sh | bash
```

### Manual Deployment

1. **Choose a free VPS provider:**
   - **Oracle Cloud Always Free** (Recommended): 1-4 ARM cores, 6-24 GB RAM, 200 GB storage
   - **Google Cloud Platform**: f1-micro instance + $300 credit
   - **AWS EC2 Free Tier**: t2.micro for 12 months

2. **Create and configure your VPS instance**

3. **Connect to your VPS and deploy:**
   ```bash
   git clone https://github.com/eddy7896/web-analyser.git
   cd web-analyser
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Access your application at:** `http://YOUR_VPS_IP`

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

---

