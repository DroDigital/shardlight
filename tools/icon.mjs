#!/usr/bin/env node
// Draw the app icon in code (a glowing shard over a night sky, pixel art) at 1024 px: build/icon.png, desktop/icon.png.
import { encodePNG } from "../vendor/pixelfx/tools/lib/png.mjs";
import { writeFileSync, mkdirSync } from "node:fs";

const N = 64, K = 16, px = new Uint8ClampedArray(N * N * 4);
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const set = (x, y, c, a = 255) => {
  if (x < 0 || y < 0 || x >= N || y >= N) return;
  const i = (y * N + x) * 4, k = a / 255;
  for (let j = 0; j < 3; j++) px[i + j] = px[i + j] * (1 - k) + c[j] * k;
  px[i + 3] = Math.max(px[i + 3], a);
};
// a rounded square of night sky, banded like the game's
const R = 12, top = hex("#0d0b24"), bot = hex("#3a2a6a");
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    const dx = Math.max(R - x, 0, x - (N - 1 - R)), dy = Math.max(R - y, 0, y - (N - 1 - R));
    if (dx * dx + dy * dy > R * R) continue;
    const b = Math.floor((y / N) * 6) / 6, c = top.map((v, j) => v + (bot[j] - v) * b);
    set(x, y, c);
  }
// stars
for (const [x, y] of [[9, 10], [52, 8], [45, 18], [14, 30], [55, 40], [7, 47], [20, 14], [38, 6]]) set(x, y, hex("#e8ecff"));
// glow
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    const d = Math.hypot(x - 32, y - 31) / 26;
    if (d < 1 && px[(y * N + x) * 4 + 3]) set(x, y, hex("#ffd84a"), Math.round(110 * (1 - d) ** 2));
  }
// the shard: a faceted crystal, lit left, shaded right, white-hot ridge
const shard = (x, y) => {
  const u = (y - 10) / 44;
  if (u < 0 || u > 1) return 0;
  const half = u < 0.35 ? (u / 0.35) * 11 : 11 * (1 - (u - 0.35) / 0.65) ** 0.8;
  const cx = 32 + (u - 0.5) * 4;
  if (Math.abs(x + 0.5 - cx) > half) return 0;
  return x + 0.5 < cx - 1 ? 1 : x + 0.5 < cx + 1 ? 3 : 2;
};
const C = { 1: hex("#ffe066"), 2: hex("#c48412"), 3: hex("#fffbe6") };
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    const s = shard(x, y);
    if (s) set(x, y, C[s]);
    else if (shard(x - 1, y) || shard(x + 1, y) || shard(x, y - 1) || shard(x, y + 1)) set(x, y, hex("#1a1020"));
  }
for (const [x, y] of [[26, 22], [27, 23], [25, 30]]) set(x, y, hex("#ffffff"));
// up to 1024 px, nearest neighbour
const out = new Uint8ClampedArray(N * K * N * K * 4);
for (let y = 0; y < N * K; y++) for (let x = 0; x < N * K; x++) out.set(px.subarray(((y / K | 0) * N + (x / K | 0)) * 4, ((y / K | 0) * N + (x / K | 0)) * 4 + 4), (y * N * K + x) * 4);
mkdirSync("build", { recursive: true });
const png = encodePNG(N * K, N * K, out);
writeFileSync("build/icon.png", png);
writeFileSync("desktop/icon.png", png);
console.log("build/icon.png, desktop/icon.png (1024 px)");
