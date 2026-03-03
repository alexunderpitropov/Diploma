package com.consoleshop.repository;

import com.consoleshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.platforms LEFT JOIN FETCH p.category")
    List<Product> findAllWithPlatforms();

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.platforms LEFT JOIN FETCH p.category WHERE p.id = :id")
    Optional<Product> findByIdWithPlatforms(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.platforms pl LEFT JOIN FETCH p.category WHERE pl.id = :platformId")
    List<Product> findByPlatformsId(@Param("platformId") Long platformId);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByNameContainingIgnoreCase(String name);
}