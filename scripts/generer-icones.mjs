// Génère des icônes PWA minimalistes (fond sombre + pastille claire),
// à remplacer par un vrai logo quand tu en as un.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function genererPng(taille) {
  const fond = [23, 23, 23]; // neutral-900
  const pastille = [250, 250, 250];
  const centre = taille / 2;
  const rayon = taille * 0.28;

  const raw = Buffer.alloc(taille * (1 + taille * 3));
  for (let y = 0; y < taille; y++) {
    const ligneDebut = y * (1 + taille * 3);
    raw[ligneDebut] = 0; // filtre "none"
    for (let x = 0; x < taille; x++) {
      const dx = x - centre;
      const dy = y - centre;
      const dansCercle = dx * dx + dy * dy <= rayon * rayon;
      const couleur = dansCercle ? pastille : fond;
      const off = ligneDebut + 1 + x * 3;
      raw[off] = couleur[0];
      raw[off + 1] = couleur[1];
      raw[off + 2] = couleur[2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(taille, 0);
  ihdr.writeUInt32BE(taille, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });
for (const taille of [192, 512]) {
  writeFileSync(`public/icons/icon-${taille}.png`, genererPng(taille));
}
console.log("Icônes générées.");
