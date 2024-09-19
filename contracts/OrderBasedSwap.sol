// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./IERC20.sol";

contract OrderSwap {
    struct Order {
        address depositor;   
        address tokenToSell; 
        address tokenToReceive;
        uint256 amountToSell; 
        uint256 amountToReceive; 
        bool isActive;
    }

    uint256 public nextOrderId; 
    mapping(uint256 => Order) public orders;

    event OrderCreated(uint256 orderId, address indexed depositor, uint256 amountToSell, uint256 amountToReceive);
    event OrderFulfilled(uint256 orderId, address indexed buyer, uint256 amountSold, uint256 amountReceived);
    event OrderCancelled(uint256 orderId);

    
    function createOrder(address tokenToSell, address tokenToReceive, uint256 amountToSell, uint256 amountToReceive) external {
        require(amountToSell > 0, "Amount to sell must be greater than 0");
        require(amountToReceive > 0, "Amount to receive must be greater than 0");

      
        IERC20(tokenToSell).transferFrom(msg.sender, address(this), amountToSell);

        
        orders[nextOrderId] = Order({
            depositor: msg.sender,
            tokenToSell: tokenToSell,
            tokenToReceive: tokenToReceive,
            amountToSell: amountToSell,
            amountToReceive: amountToReceive,
            isActive: true
        });

        emit OrderCreated(nextOrderId, msg.sender, amountToSell, amountToReceive);

       
        nextOrderId++;
    }

    
    function fulfillOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.isActive, "Order is not active");

        
        IERC20(order.tokenToReceive).transferFrom(msg.sender, order.depositor, order.amountToReceive);

       
        IERC20(order.tokenToSell).transfer(msg.sender, order.amountToSell);

       
        order.isActive = false;

        emit OrderFulfilled(orderId, msg.sender, order.amountToSell, order.amountToReceive);
    }

   
    function cancelOrder(uint256 orderId) external {
      
        Order storage order = orders[orderId];
        require(order.isActive, "Order is not active");
        require(order.depositor == msg.sender, "Only the depositor can cancel the order");
      
        IERC20(order.tokenToSell).transfer(order.depositor, order.amountToSell);

       
        order.isActive = false;

        emit OrderCancelled(orderId);
    }
}
