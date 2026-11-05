# INGET YA

Gas keun

1. [Install Project Deps](#install-project-deps)
2. [Initialize Service](#initialize-service)
3. [Build and Run](#build-and-run)

## Install Project Deps

Instal pake clean-install (base: `package-lock.json`) biar deps tetep sama di tiap clone.

```shell
npm ci
```

Copy & edit `.env`

```shell
# command buat copy
cp .env.example .env
```

## Initialize Service

Bikin doc default buat database **Users** & **Products**

```shell
npm run init
```

## Build and Run

> [!TIP]
> Abis build di bawah ini, bakal muncul 3 folder baru: `public` (dev & prod), `views` (dev & prod), dan `dist` (prod).
> `public` itu folder static (hasil bundle) yang bisa diakses user (read-only).
> `views` itu hasil compile code .ejs buat dibaca view enine server.
> `dist` itu hasil compile code backend yang bakal dipake saat production.

### A. Development

Buka 2 terminal atau 1 terminal dengan 2 tabs. Jalanin barengan.

1. Watch dev bundling

```shell
npm run dev:build
```

2. Watch dev server

```shell
npm run dev:start
```

### B. Production

> Bundle dan run secara bergantian

Bundle dan compile source

```shell
npm run build
```

Tunggu sampe berhasil, baru start server setelahnya

```shell
npm run start
```
