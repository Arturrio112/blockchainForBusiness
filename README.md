# FractionX - Quick Start Guide

---

## Prerequisites

- **Node.js 18+**
- **MetaMask** browser extension

---

## Step-by-Step Setup

### Install Dependencies

```bash
cd /project
npm install
```

---

### Compile Smart Contracts

```bash
npx hardhat compile
```

---

### Start Local Blockchain (Terminal 1)

Open a **new terminal** and run:

```bash
cd /project
npx hardhat node
```

---

### Deploy Contracts (Terminal 2)

```bash
cd /project
npx hardhat run scripts/deploy.cjs --network localhost
```

---

### Start Frontend (Terminal 3)

```bash
cd /project
npm run dev
```

---

### Configure MetaMask

#### A. Add Localhost Network

1. Open **MetaMask**
2. Click network dropdown → **Add network** → **Add a network manually**
3. Enter these details:
   ```
   Network Name: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   ```
4. Click **Save**

#### B. Import Test Account

1. Click **Account** icon → **Add account or hardware wallet** → **Import account**
2. Paste the **Private Key** from Terminal 1 (step 3):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. Click **Import**

---