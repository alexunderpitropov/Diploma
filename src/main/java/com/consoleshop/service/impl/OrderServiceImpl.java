package com.consoleshop.service.impl;

import com.consoleshop.dto.request.OrderRequest;
import com.consoleshop.dto.response.OrderResponse;
import com.consoleshop.entity.*;
import com.consoleshop.exception.ResourceNotFoundException;
import com.consoleshop.repository.*;
import com.consoleshop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public OrderResponse create(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        List<OrderItem> orderItems = cart.getItems().stream()
                .map(item -> OrderItem.builder()
                        .product(item.getProduct())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(item.getProduct().getPrice())
                        .build())
                .toList();

        BigDecimal total = orderItems.stream()
                .map(i -> i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .items(orderItems)
                .totalPrice(total)
                .deliveryAddress(request.getDeliveryAddress())
                .status(OrderStatus.PENDING)
                .build();

        orderItems.forEach(i -> i.setOrder(order));
        orderRepository.save(order);
        cart.getItems().clear();
        cartRepository.save(cart);
        return mapToResponse(order);
    }

    @Override
    public OrderResponse getById(Long id) {
        return mapToResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    @Override
    public List<OrderResponse> getByUserId(Long userId) {
        return orderRepository.findByUserId(userId).stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<OrderResponse> getAll() {
        return orderRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(status);
        return mapToResponse(orderRepository.save(order));
    }

    private OrderResponse mapToResponse(Order o) {
        List<OrderResponse.OrderItemResponse> items = o.getItems().stream()
                .map(i -> new OrderResponse.OrderItemResponse(
                        i.getId(), i.getProduct().getName(),
                        i.getQuantity(), i.getPriceAtPurchase()))
                .toList();
        return new OrderResponse(o.getId(), o.getStatus().name(),
                o.getTotalPrice(), o.getDeliveryAddress(), o.getCreatedAt(), items);
    }
}