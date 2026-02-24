package com.consoleshop.repository;

import com.consoleshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByPlatformId(Long platformId);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByPlatformIdAndCategoryId(Long platformId, Long categoryId);
    List<Product> findByNameContainingIgnoreCase(String name);
}