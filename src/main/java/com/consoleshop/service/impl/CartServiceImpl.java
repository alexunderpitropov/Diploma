package com.consoleshop.service.impl;

import com.consoleshop.dto.response.CartResponse;
import com.consoleshop.entity.Cart;
import com.consoleshop.entity.CartItem;
import com.consoleshop.entity.Product;
import com.consoleshop.exception.ResourceNotFoundException;
import com.consoleshop.repository.CartItemRepository;
import com.consoleshop.repository.CartRepository;
import com.consoleshop.repository.ProductRepository;
import com.consoleshop.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCartByUserId(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, Long productId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .ifPresentOrElse(
                        item -> {
                            item.setQuantity(item.getQuantity() + quantity);
                            cartItemRepository.save(item);
                        },
                        () -> cartItemRepository.save(
                                CartItem.builder()
                                        .cart(cart)
                                        .product(product)
                                        .quantity(quantity)
                                        .build()
                        )
                );

        return getCartByUserId(userId);
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long userId, Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findByIdAndCart_User_Id(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return getCartByUserId(userId);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findByIdAndCart_User_Id(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        cartItemRepository.deleteById(item.getId());
        cartItemRepository.flush();

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartResponse.CartItemResponse> items = cart.getItems().stream()
                .map(i -> new CartResponse.CartItemResponse(
                        i.getId(),
                        i.getProduct().getId(),
                        i.getProduct().getName(),
                        i.getProduct().getPrice(),
                        i.getQuantity()
                ))
                .toList();

        return new CartResponse(cart.getId(), items);
    }
}