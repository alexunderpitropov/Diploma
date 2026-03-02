package com.consoleshop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ImageController {

    @Value("${app.images-dir:images}")
    private String imagesDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        Path dir = Paths.get(imagesDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }

        String filename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        String url = baseUrl + "/images/" + filename;
        return ResponseEntity.ok(Map.of("url", url));
    }

    @DeleteMapping("/upload")
    public ResponseEntity<Void> delete(@RequestParam("filename") String filename) throws IOException {
        Path file = Paths.get(imagesDir, filename);
        Files.deleteIfExists(file);
        return ResponseEntity.noContent().build();
    }
}