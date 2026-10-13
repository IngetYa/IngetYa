# INGET YA

Gas keun

## 1. Clean Install Packages

> pake ref `package-lock.json`

```shell
npm ci
```

## 2. Copy dan Edit `.env`

```shell
# copy
cp .env.example .env

# (optional) in-terminal editing
# edit di mana aja bisa
nano .env
```

## 4. Run

> [!TIP]
> Abis build di bawah ini, bakal muncul 2 folder baru: `public` (dev & prod) sama `dist` (prod). `public` itu folder static (hasil bundle) yang bisa diakses user (read-only). `dist` itu hasil compile code backend yang bakal dipake saat production.

### A. Development

Buka 2 terminal atau 1 terminal dengan 2 tabs

1. Watch dev bundling

```shell
npm run dev:fe
```

2. Watch dev server

```shell
npm run dev:be
```

### B. Production

Bundle dan compile source

```shell
npm run build
```

Tunggu sampe kelar, baru start server setelahnya

```shell
npm run start
```
