const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

const precision = BigInt(1e18);
const DAI_KOVAN_ADDRESS = "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd";
const AAVE_BRIDGE_ADDRESS = "0x4922EEBff2D2d82dd112B1D662Fd72B948a3C16E";
const SUBSCRIPTION_PRICE = BigInt(2) * precision / BigInt(1e3);
// const NDAYS = 2000000;
const PERIOD = 2000;
const DURATION = 1000;



describe("PlanFactory", function() {

  let planFactory;
  let planControllerLogic;
  let planController;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const PlanController = await ethers.getContractFactory("PlanController");
    planControllerLogic = await PlanController.deploy();
    await planControllerLogic.deployed();

    const PlanFactory = await ethers.getContractFactory("PlanFactory");
    planFactory = await PlanFactory.deploy(planControllerLogic.address);
    await planFactory.deployed();

    await planFactory.updateFeePercentage(500);
    await planFactory.updateKeeperFeePercentage(500);

    await planFactory.createPlan(PERIOD);
    let planControllerAddress = await planFactory.plans(0);

    planController = await PlanController.attach(planControllerAddress);
    await planController.approveToken(DAI_KOVAN_ADDRESS, SUBSCRIPTION_PRICE);
    await planController.approveSubscriptionLength(DURATION);

    const ERC20Contract = await ethers.getContractFactory("ERC20");
    daiContract = await ERC20Contract.attach(DAI_KOVAN_ADDRESS);


  })

  // it("Test deployment", async function() {
  //
  //   await planController.connect(addr1).createSubscription(DAI_KOVAN_ADDRESS);
  //   await daiContract.connect(addr1).approve(planController.address, await daiContract.balanceOf(addr1.address));
  //   await planController.connect(addr1).fundSubscription(0);
  //   //
  //   await time.increase(10000);
  //
  //   await planController.providerWithdrawal(DAI_KOVAN_ADDRESS);
  //   await planController.connect(addr1).withdrawInterest(0);
  //
  //   await time.increase(10000);
  //
  //   await planController.providerWithdrawal(DAI_KOVAN_ADDRESS);
  //   await planController.connect(addr1).withdrawInterest(0);
  //
  //   await planController.connect(addr2).createSubscription(DAI_KOVAN_ADDRESS);
  //   await daiContract.connect(addr2).approve(planController.address, await daiContract.balanceOf(addr2.address));
  //   await planController.connect(addr2).fundSubscription(1);
  //
  //   await time.increase(10000);
  //
  //   await planController.providerWithdrawal(DAI_KOVAN_ADDRESS);
  //   await planController.connect(addr2).withdrawInterest(1);
  //
  //   await time.increase(1);
  //   await planController.connect(addr2).withdrawInterest(1);
  // });
  //
  // it("Test period ends, interest withdrawal, interest withdrawal, provider", async function () {
  //   await planController.connect(addr1).createSubscription(DAI_KOVAN_ADDRESS);
  //   await daiContract.connect(addr1).approve(planController.address, await daiContract.balanceOf(addr1.address));
  //   await planController.connect(addr1).fundSubscription(0);
  //
  //   await time.increase(NDAYS-NDAYS/100);
  //   await planController.deleteStream(0);
  //   await time.increase(NDAYS);
  //   await planController.connect(addr1).withdrawInterest(0);
  //   await time.increase(NDAYS);
  //   await planController.connect(addr1).withdrawInterest(0);
  //   await planController.providerWithdrawal(DAI_KOVAN_ADDRESS);
  //   await planController.connect(addr1).withdrawInterest(0);
  //   // await expect(planController.connect(addr1).withdrawInterest(0)).to.be.reverted;
  //
  // });

  it("Test simple interactions", async function () {
    await planController.connect(addr1).createSubscription(DAI_KOVAN_ADDRESS);
    await daiContract.connect(addr1).approve(planController.address, await daiContract.balanceOf(addr1.address));
    await planController.connect(addr1).fundSubscription(0, 0);

    await time.increase(1000000);

    console.log("Provider withdrawal...");
    await planController.providerWithdrawal(DAI_KOVAN_ADDRESS);
    console.log("Interest Transfer...");
    await planController.connect(addr1).withdrawInterest(0);

    console.log("Time increasee..");
    await time.increase(10000);

    console.log("Interest Transfer...");
    // await planController.connect(addr1).withdrawInterest(0);
    console.log("Provider withdrawal...");
    await planController.providerWithdrawal(DAI_KOVAN_ADDRESS);
    console.log("Interest Transfer...");
    await planController.connect(addr1).withdrawInterest(0);

  })


})
