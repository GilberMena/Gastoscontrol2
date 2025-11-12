import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_FILE = path.join(__dirname, "temp-gastos.json");

let app;

beforeAll(async () => {
  const initial = [
    { id: 1, categoria: "Transporte", monto: 10000 },
    { id: 2, categoria: "Comida y bebidas", monto: 20000 }
  ];
  fs.writeFileSync(TEMP_FILE, JSON.stringify(initial, null, 2), "utf8");

  process.env.GASTOS_FILE = TEMP_FILE;
  const mod = await import("../app.js");
  app = mod.default;
});

afterAll(() => {
  try { fs.unlinkSync(TEMP_FILE); } catch (e) {}
});

test("GET /gastos devuelve array inicial", async () => {
  const res = await request(app).get("/gastos");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(2);
});

test("POST /gastos crea un gasto", async () => {
  const nuevo = { categoria: "Ocio", monto: 5000 };
  const res = await request(app).post("/gastos").send(nuevo);
  expect(res.status).toBe(201);
  expect(res.body.gasto).toMatchObject({ categoria: "Ocio", monto: 5000 });
});

test("PUT /gastos/:id actualiza gasto", async () => {
  const res = await request(app).put("/gastos/1").send({ monto: 12345 });
  expect(res.status).toBe(200);
  expect(res.body.gasto.monto).toBe(12345);
});

test("DELETE /gastos/:id elimina gasto", async () => {
  const res = await request(app).delete("/gastos/2");
  expect(res.status).toBe(200);
  expect(res.body.gasto.id).toBe(2);
});
