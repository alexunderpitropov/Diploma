package com.consoleshop.controller;

import com.consoleshop.dto.response.CartResponse;
import com.consoleshop.service.CartService;
import com.consoleshop.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCartByUserId(securityUtils.getUserId(userDetails)));
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal UserDetails userDetails,
                                                @RequestParam Long productId,
                                                @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.addItem(securityUtils.getUserId(userDetails), productId, quantity));
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<CartResponse> updateItem(@AuthenticationPrincipal UserDetails userDetails,
                                                   @PathVariable Long cartItemId,
                                                   @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateItem(securityUtils.getUserId(userDetails), cartItemId, quantity));
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(@AuthenticationPrincipal UserDetails userDetails,
                                                   @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(securityUtils.getUserId(userDetails), cartItemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(securityUtils.getUserId(userDetails));
        return ResponseEntity.ok().build();
    }
}