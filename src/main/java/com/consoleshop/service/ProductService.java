package com.consoleshop.service;

import com.consoleshop.dto.request.ProductRequest;
import com.consoleshop.dto.response.ProductResponse;
import java.util.List;

public interface ProductService {
    List<ProductResponse> getAll();
    List<ProductResponse> getByPlatform(Long platformId);
    List<ProductResponse> getByCategory(Long categoryId);
    List<ProductResponse> search(String name);
    ProductResponse getById(Long id);
    ProductResponse create(ProductRequest request);
    ProductResponse update(Long id, ProductRequest request);
    void delete(Long id);
}