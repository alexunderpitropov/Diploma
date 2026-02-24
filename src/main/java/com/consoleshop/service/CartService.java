package com.consoleshop.service;

import com.consoleshop.dto.response.CartResponse;

public interface CartService {
    CartResponse getCartByUserId(Long userId);
    CartResponse addItem(Long userId, Long productId, Integer quantity);
    CartResponse updateItem(Long userId, Long cartItemId, Integer quantity);
    CartResponse removeItem(Long userId, Long cartItemId);
    void clearCart(Long userId);
}