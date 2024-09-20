import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import "hardhat/builtin-tasks/console";

describe("OrderBasedSwap", function () {
  const amount = ethers.parseUnits("100", 18);
  const userAmount = ethers.parseUnits("100", 18);
  

  
  async function deployToken() {
    
    // Contracts are deployed using the first signer/account by default
    
    const [owner1, owner2, otherAccount] = await hre.ethers.getSigners();

    const EDoseToken = await hre.ethers.getContractFactory("EDOSE");
    const Edose = await EDoseToken.deploy();
    await Edose.transfer(owner2, userAmount);

    const Web3XI = await hre.ethers.getContractFactory("Web3CXI");
    const WEB3XI = await Web3XI.deploy();
    
await WEB3XI.transfer(owner1, userAmount);

    return {Edose,owner1, owner2, otherAccount,WEB3XI};
  }
 
  
 async function deployBasedSwap() {
   const {Edose,WEB3XI} = await loadFixture(deployToken)
    // Contracts are deployed using the first signer/account by default
   const  [ owner1,owner2 ,otherAccount] = await hre.ethers.getSigners();

    const BaseSwap = await hre.ethers.getContractFactory("OrderSwap");
    const  baseSwap= await BaseSwap.deploy();
  await WEB3XI.connect(owner1).approve(baseSwap, amount);
    return {baseSwap,Edose,WEB3XI,owner1,owner2 ,otherAccount};
  }

  describe("CreateOrder", function () {
    it(" should fail if i want to sell zero amount", async function () {
      const { WEB3XI, owner1, baseSwap, Edose } = await loadFixture(deployBasedSwap);
      
      await expect(baseSwap.createOrder(WEB3XI, Edose, 0, amount)).to.revertedWith("Amount to sell must be greater than 0");
      
    });

    it(" should fail if i desire to recieve zero amount", async function () {
      const { WEB3XI, owner1, baseSwap, Edose } = await loadFixture(deployBasedSwap);
      
      await expect(baseSwap.createOrder(WEB3XI, Edose, amount, 0)).to.revertedWith("Amount to receive must be greater than 0");
      
    });
    it(" should create order successfully", async function () {
      const { WEB3XI, owner1, baseSwap, Edose } = await loadFixture(deployBasedSwap);
      await baseSwap.createOrder(WEB3XI, Edose, amount, amount);
    });

    
  });
  describe('FulfilOrder', () => {
    it(' should fail if order is not active', async () => {
      const { WEB3XI, owner1, baseSwap, Edose,otherAccount } = await loadFixture(deployBasedSwap);
      await baseSwap.createOrder(WEB3XI, Edose, amount, amount);
      await expect(baseSwap.fulfillOrder(3)).to.be.revertedWith("Order is not active");      
    });

    it(' should fail if person to fulfil order do not have the token', async () => {
      const { WEB3XI, owner1, baseSwap, Edose,otherAccount } = await loadFixture(deployBasedSwap);
      await baseSwap.createOrder(WEB3XI, Edose, amount, amount);
      await expect(baseSwap.connect(otherAccount).fulfillOrder(0)).to.be.revertedWith("Insufficient balance")      
    });

    it(' should fail if person to fulfil order do not have the token', async () => {
      const { WEB3XI, owner1, baseSwap, Edose,otherAccount } = await loadFixture(deployBasedSwap);
      await baseSwap.createOrder(WEB3XI, Edose, amount, amount);
      await expect(baseSwap.connect(otherAccount).fulfillOrder(0)).to.be.revertedWith("Insufficient balance")      
    });

        it(' should pass if order fulfilled successfully', async () => {
          const { WEB3XI, owner1, owner2, baseSwap, Edose, otherAccount } = await loadFixture(deployBasedSwap);
          await baseSwap.createOrder(WEB3XI, Edose, amount, amount);
     
          await baseSwap.fulfillOrder(0);
    });
    
  });
  
})