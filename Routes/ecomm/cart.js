const express = require('express');
const Cart = require('../../Models/ecomm/cart');  // Assume you have placed the Cart schema in the models folder.
const router = express.Router();

// Create a new cart or add items to an existing cart
router.post('/', async (req, res) => {
    try {
        const { userId, productId, quantity, price, discountPrice } = req.body;

        // Check if there's already a cart for the user
        let cart = await Cart.findOne({ userId, status: true });

        if (!cart) {
            // Create a new cart if it doesn't exist
            cart = new Cart({
                userId,
                items: [{ productId, quantity, price, discountPrice }]
            });
        } else {
            // Add item to existing cart or update quantity if the product is already in the cart
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // Product exists in the cart, update the quantity and prices
                cart.items[itemIndex].quantity += quantity;
                cart.items[itemIndex].price = price; // Update price if necessary
                cart.items[itemIndex].discountPrice = discountPrice; // Update discountPrice if necessary
            } else {
                // Add new product to cart
                cart.items.push({ productId, quantity, price, discountPrice });
            }
        }

        // Save the cart and update subtotal and total discount in the pre-save hook
        await cart.save();

        res.json({
            success: true,
            message: "Cart updated successfully.",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get active cart for a user
router.get('/', async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne().populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.json({
            success: true,
            message: "Cart retrieved successfully.",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get active cart for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ userId, status: true }).populate('items.productId userId');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.json({
            success: true,
            message: "Cart retrieved successfully.",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Update quantity, price, or discountPrice of an item in the cart
router.put('/:cartId/item/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const { quantity, price, discountPrice } = req.body;

        let cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            if (quantity === 0) {
                // Remove the item if quantity is 0
                cart.items.splice(itemIndex, 1);
            } else {
                // Update the item details
                cart.items[itemIndex].quantity = quantity;
                if (price) cart.items[itemIndex].price = price;
                if (discountPrice) cart.items[itemIndex].discountPrice = discountPrice;
            }

            await cart.save();
            res.json({
                success: true,
                message: "Cart updated successfully.",
                data: cart,
            });
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Clear cart (delete all items)
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the active cart for the user
        const cart = await Cart.findOne({ userId, status: true });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Clear the cart by removing all items
        cart.items = [];
        await cart.save();

        res.status(200).json({ success: true, message: 'Cart cleared', data: cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
