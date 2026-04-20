import { CanvasTexture, LinearFilter, RepeatWrapping, SRGBColorSpace } from "three";

import type { Product } from "@/types/product";

const labelCache = new Map<string, CanvasTexture>();
const stripCache = new Map<string, CanvasTexture>();
const panelCache = new Map<string, CanvasTexture>();
const headerCache = new Map<string, CanvasTexture>();

function drawLabelContent(ctx: CanvasRenderingContext2D, product: Product, size: number) {
  ctx.fillStyle = product.color;
  ctx.fillRect(0, 0, size, size);

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "rgba(255,255,255,0.12)");
  grad.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, size - 16, size - 16);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const name = product.name;
  const maxWidth = size - 40;
  const fontSize = 28;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;

  const words = name.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].substring(0, lines[2].length - 3) + "...";
  }

  const lineH = fontSize + 4;
  const textBlockY = size / 2 - (lines.length * lineH) / 2 + lineH / 2 - 10;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], size / 2, textBlockY + i * lineH);
  }

  ctx.font = `${18}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(product.sku, size / 2, textBlockY + lines.length * lineH + 8);
}

function drawArtworkLabel(ctx: CanvasRenderingContext2D, img: HTMLImageElement, product: Product, size: number) {
  ctx.drawImage(img, 0, 0, size, size);

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = product.color;
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, size - 16, size - 16);
}

export function getProductLabelTexture(product: Product): CanvasTexture {
  const cacheKey = `${product.id}-${product.color}-${product.artworkUrl || ""}`;
  const cached = labelCache.get(cacheKey);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  if (product.artworkUrl) {
    drawLabelContent(ctx, product, size);
    texture.needsUpdate = true;

    const img = new Image();
    img.onload = () => {
      drawArtworkLabel(ctx, img, product, size);
      texture.needsUpdate = true;
    };
    img.src = product.artworkUrl;
  } else {
    drawLabelContent(ctx, product, size);
    texture.needsUpdate = true;
  }

  labelCache.set(cacheKey, texture);
  return texture;
}

export function createStripTexture(
  text: string,
  bgColor: string,
  textColor: string = "#ffffff",
  width: number = 1024,
  height: number = 64,
  variant: "full" | "half" = "half",
): CanvasTexture {
  const cacheKey = `${text}-${bgColor}-${textColor}-${width}-${height}-${variant}`;
  const cached = stripCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  const drawLeaf = (x: number, y: number, scale: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(5, -10, 10, -5);
    ctx.quadraticCurveTo(5, 5, 0, 0);
    ctx.fill();
    ctx.restore();
  };

  const draw = () => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.floor(height * 0.42)}px 'Maniz Display', 'Inter', Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const segment = ` ${text.toUpperCase()} `;
    const segmentWidth = ctx.measureText(segment).width;

    const spacing = Math.max(40, width * 0.02);
    const repetitionWidth = segmentWidth + spacing * 2;
    const count = Math.ceil(width / repetitionWidth) + 1;

    for (let i = 0; i < count; i++) {
      const cx = repetitionWidth * i;
      ctx.fillText(segment, cx, height / 2);

      if (variant === "half") {
        ctx.fillStyle = `${textColor}ee`;
        drawLeaf(cx + segmentWidth / 2 + spacing, height / 2 - 2, 0.8, -Math.PI / 4);
        drawLeaf(cx + segmentWidth / 2 + spacing + 8, height / 2 + 3, 0.7, Math.PI / 6);
        ctx.beginPath();
        ctx.arc(cx + segmentWidth / 2 + spacing + 18, height / 2 - 1, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    texture.needsUpdate = true;
  };

  draw();
  if (typeof document !== "undefined" && document.fonts) {
    document.fonts.ready.then(draw);
  }

  stripCache.set(cacheKey, texture);
  return texture;
}

export function createBrandedPanelTexture(
  text: string,
  bgColor: string,
  textColor: string = "#ffffff",
  width: number = 512,
  height: number = 768,
  variant: "full" | "half" = "half",
): CanvasTexture {
  const cacheKey = `${text}-${bgColor}-${textColor}-${width}-${height}-${variant}`;
  const cached = panelCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  const drawTrigo = (cx: number, cy: number, scale: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = textColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.quadraticCurveTo(10, 0, 0, -50);
    ctx.stroke();

    const drawGrain = (x: number, y: number, r: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(r);
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(5, -25);
      ctx.stroke();
      ctx.restore();
    };

    for (let i = 0; i < 6; i++) {
      const y = -30 + i * 12;
      drawGrain(3, y, Math.PI / 6);
      drawGrain(-3, y + 6, -Math.PI / 6);
    }

    ctx.restore();
  };

  const drawBotanicalBranch = (cx: number, cy: number, rot: number, scale: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(scale, scale);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, -40, 0, -100);
    ctx.stroke();

    ctx.fillStyle = textColor;
    const drawLeaf = (x: number, y: number, r: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(r);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(8, -8, 15, 0);
      ctx.quadraticCurveTo(8, 8, 0, 0);
      ctx.fill();
      ctx.restore();
    };

    for (let i = 1; i <= 4; i++) {
      drawLeaf(-5, -i * 20, Math.PI + Math.PI / 4);
      drawLeaf(5, -i * 20 + 10, -Math.PI / 4);
    }
    ctx.restore();
  };

  if (variant === "half") {
    drawTrigo(width * 0.25, height * 0.8, 1);
    drawTrigo(width * 0.75, height * 0.8, 1);
    drawBotanicalBranch(width * 0.15, height * 0.9, 0.2, 1.2);
    drawBotanicalBranch(width * 0.85, height * 0.9, -0.2, 1.2);
    drawBotanicalBranch(width * 0.5, height * 0.85, 0, 1.1);
    drawBotanicalBranch(width * 0.35, height * 0.88, -0.4, 0.9);
    drawBotanicalBranch(width * 0.65, height * 0.88, 0.4, 0.9);

    drawBotanicalBranch(width * 0.1, height * 0.3, 1, 0.8);
    drawBotanicalBranch(width * 0.9, height * 0.3, -1, 0.8);
  }

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const words = text.toUpperCase().split(" ");
  const lineHeight = Math.floor(height * 0.1);
  const fontSize = Math.floor(height * 0.085);
  ctx.font = `bold ${fontSize}px 'Maniz Display', 'Inter', Arial, sans-serif`;

  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > width * 0.8 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const totalTextHeight = lines.length * lineHeight;
  const startY = height * 0.45 - totalTextHeight / 2 + lineHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, startY + i * lineHeight);
  }

  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.translate(width * 0.1 + Math.random() * 0.8 * width, height * 0.1 + Math.random() * 0.8 * height);
    ctx.fillStyle = textColor;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      ctx.rotate(Math.PI / 2);
      ctx.ellipse(0, 4, 1.5, 4, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;

  panelCache.set(cacheKey, texture);
  return texture;
}

export function createHeaderTexture(
  text: string,
  bgColor: string = "#00b3ca",
  textColor: string = "#ffffff",
  width: number = 800,
  height: number = 200,
  subtitle?: string,
  variant: "full" | "half" = "half",
): CanvasTexture {
  const cacheKey = `header-${text}-${bgColor}-${textColor}-${width}-${height}-${subtitle}-${variant}`;
  const cached = headerCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  const draw = () => {
    const img = new Image();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    img.onload = () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      texture.needsUpdate = true;
    };
    img.src = '/Kayco_Pallets/header_texture.png';

    texture.needsUpdate = true;
  };

  draw();
  if (typeof document !== "undefined" && document.fonts) {
    document.fonts.ready.then(draw);
  }

  headerCache.set(cacheKey, texture);
  return texture;
}
