package com.consoleshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private long pendingOrders;
    private BigDecimal totalRevenue;
}