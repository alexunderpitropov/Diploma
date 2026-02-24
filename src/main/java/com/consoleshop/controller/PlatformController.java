package com.consoleshop.controller;

import com.consoleshop.entity.Platform;
import com.consoleshop.repository.PlatformRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/platforms")
@RequiredArgsConstructor
public class PlatformController {

    private final PlatformRepository platformRepository;

    @GetMapping
    public ResponseEntity<List<Platform>> getAll() {
        return ResponseEntity.ok(platformRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Platform> getById(@PathVariable Long id) {
        return ResponseEntity.ok(platformRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Platform not found")));
    }
}