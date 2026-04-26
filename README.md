# Piggy Bank

A Solana Anchor program for a simple piggy bank with deposit and withdrawal functionality.

## Features
- Initialize a piggy bank account
- Deposit SOL
- Withdraw SOL (owner only)
- Prevent unauthorized withdrawals

## Running Tests

To run the tests:

```sh
anchor test --skip-local-validator
```

## Test Output

All tests passing:

```
  piggy-bank
Already initialized, skipping...
Piggy bank: 2yKBiFSDq67QtthER6uPdZWK1Tk1XdpUdfmdQjdmb4kQ
    ✔ Initializes the piggy bank (5654ms)
Deposited. New PDA balance: 0.40117624 SOL
    ✔ Deposits SOL (1410ms)
Unauthorized withdraw blocked
    ✔ Fails when non-owner tries to withdraw (2682ms)
Withdrew. User balance: 6.87912388 SOL
    ✔ Withdraws SOL (1180ms)

  4 passing (11s)
```

## Screenshot

![All tests passing](/src/Screenshot(291).png)

---

## Demo Video

[Watch the Demo](https://drive.google.com/file/d/1dLCBdTXpBF_M5zCj-fq1JwnjbhayQ-uf/view?usp=drive_link)

---

- See `programs/piggy-bank/src/lib.rs` for the Solana program logic.
- See `tests/piggy-bank.ts` for the test suite.
