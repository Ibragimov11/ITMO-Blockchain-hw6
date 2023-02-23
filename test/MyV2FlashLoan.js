const { ethers } = require("hardhat")

const ADDRESS_PROVIDER = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
const ADDRESS_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"

const { WETH, LINK, USDT, USDC, WBTC, DAI } = require("./config")

const CHAIN_1 = [WETH, LINK, USDT, WETH]
const CHAIN_1S = ["WETH", "LINK", "USDT", "WETH"]
const CHAIN_2 = [WETH, USDC, WBTC, DAI, WETH]
const CHAIN_2S = ["WETH", "USDC", "WBTC", "DAI", "WETH"]


describe("MyV2FlashLoan", function () {
    it("WETH -> LINK -> USDT -> WETH", async function () {
        await testFlashLoan(CHAIN_1, CHAIN_1S, true)
    })

    it("WETH -> USDC -> WBTC -> DAI -> WETH", async function () {
        await testFlashLoan(CHAIN_2, CHAIN_2S, true)
    })

    it("Without start balance: should fail", async function () {
        await testFlashLoan(CHAIN_1, CHAIN_1S, false)
    })

    async function testFlashLoan(chain, chain_str, flag) {
        const TOKEN_BORROW_ADDRESS = chain[0]

        const [owner] = await ethers.getSigners()
        const MyV2FlashLoanFactory = await ethers.getContractFactory("MyV2FlashLoan")
        const WETHFactory = await ethers.getContractFactory("WETH9")

        const myV2FlashLoan = await MyV2FlashLoanFactory.deploy(ADDRESS_PROVIDER, ADDRESS_ROUTER, chain)
        const token = WETHFactory.attach(TOKEN_BORROW_ADDRESS)
        const amount = ethers.utils.parseEther("1")

        if (flag) {
            token.connect(owner).deposit({ value: ethers.utils.parseEther("1") })
        }
        token.connect(owner).transfer(myV2FlashLoan.address, amount)

        const startsum = await token.balanceOf(myV2FlashLoan.address)
        console.log("Start balance ", startsum.toString())
        console.log("Loaned sum: ", amount.toString())
        
        console.log("Token swaps chain:")
        for (let i = 0; i < chain_str.length - 1; i++) {
            console.log("\t" + chain_str[i] + " -> " + chain_str[i + 1])
        }

        const result = await (await myV2FlashLoan.myFlashLoanCall(amount)).wait()

        if (result.status === 1) {
            console.log("Flashloan successed.")

            const finalsum = await token.balanceOf(myV2FlashLoan.address)
            console.log("Final balance: ", finalsum.toString())

            if (startsum.lt(finalsum)) {
                console.log("Flashloan profit: ", finalsum.sub(startsum).toString())
            } else {
                console.log("Flashloan loss: ", startsum.sub(finalsum).toString())
            }
    
            console.log("Gas used: ", result.gasUsed.toString())
        } else {
            console.log("Flashloan failed.")
        }
    }
})
