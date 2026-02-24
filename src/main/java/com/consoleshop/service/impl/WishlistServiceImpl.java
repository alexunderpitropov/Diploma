package com.consoleshop.service.impl;

import com.consoleshop.dto.response.ProductResponse;
import com.consoleshop.entity.Product;
import com.consoleshop.entity.User;
import com.consoleshop.entity.WishlistItem;
import com.consoleshop.exception.ResourceNotFoundException;
import com.consoleshop.repository.ProductRepository;
import com.consoleshop.repository.UserRepository;
import com.consoleshop.repository.WishlistRepository;
import com.consoleshop.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public List<ProductResponse> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(w -> mapToResponse(w.getProduct()))
                .toList();
    }

    @Override
    public void addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) return;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        wishlistRepository.save(WishlistItem.builder().user(user).product(product).build());
    }

    @Override
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(wishlistRepository::delete);
    }

    @Override
    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    private ProductResponse mapToResponse(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(),
                p.getPrice(), p.getStock(), p.getImageUrl(),
                p.getPlatform().getName(), p.getCategory().getName());
    }
}