use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
    system_instruction,
};

declare_id!("F69JHYXF6ndrSSvUrwea6PWUNAYBooZtACx2BW7FwK6K");

#[program]
pub mod piggy_bank {
    use super::*;

    
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let piggy_bank = &mut ctx.accounts.piggy_bank;

        piggy_bank.owner = ctx.accounts.user.key();
        piggy_bank.bump = ctx.bumps.piggy_bank;

        Ok(())
    }

    
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let ix = system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.piggy_bank.key(),
            amount,
        );

        invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.piggy_bank.to_account_info(),
            ],
        )?;

        Ok(())
    }

    
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let piggy_bank = &mut ctx.accounts.piggy_bank.to_account_info();
    let user = &mut ctx.accounts.user.to_account_info();

    
    **piggy_bank.try_borrow_mut_lamports()? -= amount;
    **user.try_borrow_mut_lamports()? += amount;

    Ok(())
}
}

#[account]
pub struct PiggyBank {
    pub owner: Pubkey,
    pub bump: u8,
}

impl PiggyBank {

    pub const LEN: usize = 8 + 32 + 1;
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = PiggyBank::LEN,
        seeds = [b"piggy-bank", user.key().as_ref()],
        bump
    )]
    pub piggy_bank: Account<'info, PiggyBank>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"piggy-bank", user.key().as_ref()],
        bump
    )]
    pub piggy_bank: Account<'info, PiggyBank>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"piggy-bank", user.key().as_ref()],
        bump,
        has_one = owner
    )]
    pub piggy_bank: Account<'info, PiggyBank>,

    #[account(mut)]
    pub user: Signer<'info>, 

    pub system_program: Program<'info, System>,

    pub owner: SystemAccount<'info>,
}
