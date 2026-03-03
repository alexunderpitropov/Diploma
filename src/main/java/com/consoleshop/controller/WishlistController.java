package com.consoleshop.controller;

import com.consoleshop.dto.response.ProductResponse;
import com.consoleshop.service.WishlistService;
import com.consoleshop.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getWishlist(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(wishlistService.getWishlist(securityUtils.getUserId(userDetails)));
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<Void> addToWishlist(@AuthenticationPrincipal UserDetails userDetails,
                                              @PathVariable Long productId) {
        wishlistService.addToWishlist(securityUtils.getUserId(userDetails), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@AuthenticationPrincipal UserDetails userDetails,
                                                   @PathVariable Long productId) {
        wishlistService.removeFromWishlist(securityUtils.getUserId(userDetails), productId);
        return ResponseEntity.ok().build();
    }
}