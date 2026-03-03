package com.consoleshop.repository;

import com.consoleshop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    @Query("SELECT ci FROM CartItem ci WHERE ci.id = :id AND ci.cart.user.id = :userId")
    Optional<CartItem> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}