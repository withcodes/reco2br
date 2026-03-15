FROM node:20-slim

# Install LibreOffice for .XLS → .XLSX conversion
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-calc \
    libreoffice-core \
    fonts-liberation \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

# Data directory for persistent voucher storage
RUN mkdir -p /app/data

ENV PORT=8080
ENV DATA_DIR=/app/data

EXPOSE 8080

CMD ["npm", "start"]
