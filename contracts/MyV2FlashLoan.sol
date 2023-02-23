// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import { FlashLoanReceiverBase } from "@aave/protocol-v2/contracts/flashloan/base/FlashLoanReceiverBase.sol";
import { ILendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import { IUniswapV2Router02 } from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyV2FlashLoan is FlashLoanReceiverBase {

    IUniswapV2Router02 private router;
    address[] private chain;

    constructor(
        address _addressProvider,
        address _router,
        address[] memory _chain
    ) FlashLoanReceiverBase(ILendingPoolAddressesProvider(_addressProvider)) public {
        require(_chain.length > 2, "At least 3 coins required");
        require(_chain[0] == _chain[_chain.length - 1], "First and last coins must be equal");

        router = IUniswapV2Router02(_router);
        chain = _chain;
    }

    function myFlashLoanCall(uint256 requestedAmount) public {
        address receiverAddress = address(this);

        uint balance = IERC20(chain[0]).balanceOf(receiverAddress);

        address[] memory assets = new address[](1);
        assets[0] = chain[0];

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = requestedAmount;

        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        LENDING_POOL.flashLoan(
            receiverAddress,
            assets,
            amounts,
            modes,
            receiverAddress,
            "",
            0
        );
    }

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    )
        external
        override
        returns (bool)
    {
        require(initiator == address(this));
        require(assets.length == 1 && amounts.length == 1 && premiums.length == 1, "Loan expected for only 1 token");
        require(assets[0] == chain[0], "Invalid loaned coin");

        address asset = assets[0];
        uint256 amount = amounts[0];
        uint256 premium = premiums[0];

        IERC20(asset).approve(address(router), amount);

        router.swapExactTokensForTokens(amount, 0, chain, address(this), block.timestamp);

        uint amountOwing = amount.add(premium);

        require(amountOwing <= IERC20(asset).balanceOf(address(this)), "Not enough tokens to repay the loan");

        IERC20(asset).approve(address(LENDING_POOL), amountOwing);

        return true;
    }
}
