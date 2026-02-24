package com.consoleshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String status;
    private BigDecimal totalPrice;
    private String deliveryAddress;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    @Data
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private String productName;
        private Integer quantity;
        private BigDecimal priceAtPurchase;
    }
}