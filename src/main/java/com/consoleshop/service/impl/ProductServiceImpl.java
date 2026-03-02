package com.consoleshop.service.impl;

import com.consoleshop.dto.request.ProductRequest;
import com.consoleshop.dto.response.ProductResponse;
import com.consoleshop.entity.Category;
import com.consoleshop.entity.Platform;
import com.consoleshop.entity.Product;
import com.consoleshop.exception.ResourceNotFoundException;
import com.consoleshop.repository.CategoryRepository;
import com.consoleshop.repository.PlatformRepository;
import com.consoleshop.repository.ProductRepository;
import com.consoleshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final PlatformRepository platformRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<ProductResponse> getByPlatform(Long platformId) {
        return productRepository.findByPlatformId(platformId).stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<ProductResponse> getByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<ProductResponse> search(String name) {
        return productRepository.findByNameContainingIgnoreCase(name).stream().map(this::mapToResponse).toList();
    }

    @Override
    public ProductResponse getById(Long id) {
        return mapToResponse(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found")));
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Platform platform = platformRepository.findById(request.getPlatformId())
                .orElseThrow(() -> new ResourceNotFoundException("Platform not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .platform(platform)
                .category(category)
                .build();
        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Platform platform = platformRepository.findById(request.getPlatformId())
                .orElseThrow(() -> new ResourceNotFoundException("Platform not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setPlatform(platform);
        product.setCategory(category);
        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    private ProductResponse mapToResponse(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(),
                p.getPrice(), p.getStock(), p.getImageUrl(),
                p.getPlatform().getName(), p.getCategory().getName());
    }
}