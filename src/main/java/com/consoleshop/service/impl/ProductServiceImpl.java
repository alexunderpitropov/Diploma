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

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final PlatformRepository platformRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<ProductResponse> getAll() {
        return productRepository.findAllWithPlatforms().stream()
                .map(this::mapToResponse).toList();
    }

    @Override
    public List<ProductResponse> getByPlatform(Long platformId) {
        return productRepository.findByPlatformsId(platformId).stream()
                .map(this::mapToResponse).toList();
    }

    @Override
    public List<ProductResponse> getByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse).toList();
    }

    @Override
    public List<ProductResponse> search(String name) {
        return productRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse).toList();
    }

    @Override
    public ProductResponse getById(Long id) {
        return mapToResponse(productRepository.findByIdWithPlatforms(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found")));
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Set<Platform> platforms = resolvePlatforms(request.getPlatformIds());
        Category category = resolveCategory(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .specs(request.getSpecs())
                .platforms(platforms)
                .category(category)
                .build();

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findByIdWithPlatforms(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Set<Platform> platforms = resolvePlatforms(request.getPlatformIds());
        Category category = resolveCategory(request.getCategoryId());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setSpecs(request.getSpecs());
        product.setPlatforms(platforms);
        product.setCategory(category);

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    private Set<Platform> resolvePlatforms(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new ResourceNotFoundException("At least one platform required");
        }
        Set<Platform> platforms = new HashSet<>(platformRepository.findAllById(ids));
        if (platforms.isEmpty()) {
            throw new ResourceNotFoundException("Platforms not found");
        }
        return platforms;
    }

    private Category resolveCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private ProductResponse mapToResponse(Product p) {
        List<String> platformNames = p.getPlatforms().stream()
                .map(Platform::getName)
                .sorted()
                .collect(Collectors.toList());

        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getStock(),
                p.getImageUrl(),
                platformNames,
                p.getCategory().getName(),
                p.getCategory().getId(),
                p.getSpecs()
        );
    }
}