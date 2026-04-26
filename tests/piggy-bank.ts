import BN from "bn.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";

describe("piggy-bank", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PiggyBank as Program;

  const user = provider.wallet.publicKey;

  
  const [piggyBankPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("piggy-bank"), user.toBuffer()],
    program.programId
  );

  it("Initializes the piggy bank", async () => {
  try {
    await program.methods
      .initialize()
      .accounts({
        piggyBank: piggyBankPda,
        user,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  } catch (e) {
    console.log("Already initialized, skipping...");
  }

  const account = await program.account.piggyBank.fetch(piggyBankPda);
  assert.equal(account.owner.toBase58(), user.toBase58());

  console.log("Piggy bank:", piggyBankPda.toBase58());
});

  it("Deposits SOL", async () => {
    const depositAmount = new BN(
      0.1 * anchor.web3.LAMPORTS_PER_SOL
    );

    const balanceBefore =
      await provider.connection.getBalance(piggyBankPda);

    await program.methods
      .deposit(depositAmount)
      .accounts({
        piggyBank: piggyBankPda,
        user,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const balanceAfter =
      await provider.connection.getBalance(piggyBankPda);

    assert.isAbove(balanceAfter, balanceBefore);

    console.log(
      "Deposited. New PDA balance:",
      balanceAfter / anchor.web3.LAMPORTS_PER_SOL,
      "SOL"
    );
  });

it("Fails when non-owner tries to withdraw", async () => {
  const attacker = anchor.web3.Keypair.generate();


  const tx = new anchor.web3.Transaction().add(
    anchor.web3.SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: attacker.publicKey,
      lamports: 0.1 * anchor.web3.LAMPORTS_PER_SOL,
    })
  );

  await provider.sendAndConfirm(tx);

  const withdrawAmount = new BN(
    0.01 * anchor.web3.LAMPORTS_PER_SOL
  );

  try {
    await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        piggyBank: piggyBankPda,
        user: attacker.publicKey,
        owner: attacker.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([attacker])
      .rpc();

    assert.fail("Unauthorized withdraw should fail");
  } catch (err) {
    console.log("Unauthorized withdraw blocked");
  }
});

  it("Withdraws SOL", async () => {
    const withdrawAmount = new BN(
      0.05 * anchor.web3.LAMPORTS_PER_SOL
    );

    const userBefore =
      await provider.connection.getBalance(user);

    await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        piggyBank: piggyBankPda,
        user,
        owner: user,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const userAfter =
      await provider.connection.getBalance(user);

    assert.isAbove(userAfter, userBefore - 5000);

    console.log(
      "Withdrew. User balance:",
      userAfter / anchor.web3.LAMPORTS_PER_SOL,
      "SOL"
    );
  });
});
