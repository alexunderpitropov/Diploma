package com.consoleshop.service.impl;

import com.consoleshop.dto.response.AdminStatsResponse;
import com.consoleshop.entity.OrderStatus;
import com.consoleshop.repository.OrderRepository;
import com.consoleshop.repository.ProductRepository;
import com.consoleshop.repository.UserRepository;
import com.consoleshop.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    public AdminStatsResponse getStats() {

        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        long pendingOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING)
                .count();

        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .map(o -> o.getTotalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminStatsResponse(
                totalUsers,
                totalProducts,
                totalOrders,
                pendingOrders,
                totalRevenue
        );
    }
}