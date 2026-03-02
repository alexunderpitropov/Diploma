package com.consoleshop.controller;

import com.consoleshop.dto.response.ProductResponse;
import com.consoleshop.entity.User;
import com.consoleshop.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.consoleshop.repository.UserRepository;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getWishlist(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(wishlistService.getWishlist(getUserId(userDetails)));
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<Void> addToWishlist(@AuthenticationPrincipal UserDetails userDetails,
                                              @PathVariable Long productId) {
        wishlistService.addToWishlist(getUserId(userDetails), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@AuthenticationPrincipal UserDetails userDetails,
                                                   @PathVariable Long productId) {
        wishlistService.removeFromWishlist(getUserId(userDetails), productId);
        return ResponseEntity.ok().build();
    }
}