# ═══════════════════════════════════════
# Hugging Face Spaces - Discord Bot
# ═══════════════════════════════════════
FROM node:20-slim

# better-sqlite3 cần build tools để compile native addon
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Tạo thư mục app
WORKDIR /app

# Copy package files trước để tận dụng Docker cache
COPY package.json package-lock.json ./

# Cài dependencies
RUN npm ci --omit=dev

# Copy toàn bộ source code
COPY . .

# Tạo thư mục data cho SQLite (persistent trong container)
RUN mkdir -p /app/data

# HF Spaces yêu cầu expose port 7860 
# Bot không cần HTTP server, nhưng ta thêm health check endpoint
# để HF Spaces không restart container liên tục
EXPOSE 7860

# Chạy deploy commands rồi start bot
CMD ["sh", "-c", "node src/deploy-commands.js && node src/index.js"]
