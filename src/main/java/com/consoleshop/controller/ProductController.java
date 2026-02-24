package com.consoleshop.controller;

import com.consoleshop.dto.request.ProductRequest;
import com.consoleshop.dto.response.ProductResponse;
import com.consoleshop.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/platform/{platformId}")
    public ResponseEntity<List<ProductResponse>> getByPlatform(@PathVariable Long platformId) {
        return ResponseEntity.ok(productService.getByPlatform(platformId));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getByCategory(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> search(@RequestParam String name) {
        return ResponseEntity.ok(productService.search(name));
    }
}