# HW6

## Configuring

```bash
npm install
npm install --save-dev hardhat
```

Then set your Alchemy api key to `ALCHEMY_TOKEN` at `.env` file

#### Compile and run tests:
```bash
npx hardhat compile
npx hardhat test
```

## Output
```
  MyV2FlashLoan

Start balance  1000000000000000000
Loaned sum:  1000000000000000000
Token swaps chain:
        WETH -> LINK
        LINK -> USDT
        USDT -> WETH
Flashloan successed.
Final balance:  126170393444243773
Flashloan loss:  873829606555756227
Gas used:  420311
    ✔ WETH -> LINK -> USDT -> WETH (30147ms)

Start balance  1000000000000000000
Loaned sum:  1000000000000000000
Token swaps chain:
        WETH -> USDC
        USDC -> WBTC
        WBTC -> DAI
        DAI -> WETH
Flashloan successed.
Final balance:  741100322699185273
Flashloan loss:  258899677300814727
Gas used:  483573
    ✔ WETH -> USDC -> WBTC -> DAI -> WETH (13534ms)

Start balance  0
Loaned sum:  1000000000000000000
Token swaps chain:
        WETH -> LINK
        LINK -> USDT
        USDT -> WETH
    1) Without start balance: should fail
        Error: VM Exception while processing transaction: reverted with reason string 'Not enough tokens to repay the loan'
        at MyV2FlashLoan.executeOperation (contracts/MyV2FlashLoan.sol:76) ...

  2 passing (45s)
  1 failing
```

Notice that fail of one test is expected