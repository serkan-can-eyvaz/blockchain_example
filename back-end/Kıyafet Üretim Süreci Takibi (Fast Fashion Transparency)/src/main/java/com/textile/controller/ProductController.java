package com.textile.controller;

import com.textile.entity.Product;
import com.textile.entity.ProductStatus;
import com.textile.entity.User;
import com.textile.entity.UserRole;
import com.textile.service.ProductService;
import com.textile.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        // Smart Contract: Tüketici rolündeki kullanıcılar ürün oluşturamaz
        if (currentUser.getRole() == UserRole.CUSTOMER) {
            return ResponseEntity.status(403).body(null);
        }
        
        if (product.getProducer() == null || product.getProducer().getId() == null) {
            product.setProducer(currentUser);
        } else if (!product.getProducer().getId().equals(currentUser.getId()) && 
                   currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        return ResponseEntity.ok(productService.getProductsByCurrentUser(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        try {
            return ResponseEntity.ok(productService.getProductByIdAndUser(id, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Product>> getProductsByStatus(@PathVariable ProductStatus status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        return ResponseEntity.ok(productService.getProductsByStatusAndUser(status, currentUser));
    }

    @GetMapping("/producer/{producerId}")
    public ResponseEntity<List<Product>> getProductsByProducer(@PathVariable Long producerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        if (!producerId.equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.badRequest().build();
        }
        
        return userService.getUserById(producerId)
                .map(producer -> ResponseEntity.ok(productService.getProductsByProducer(producer)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/batch/{batchNumber}")
    public ResponseEntity<Product> getProductByBatchNumber(@PathVariable String batchNumber) {
        try {
            return ResponseEntity.ok(productService.getProductByBatchNumber(batchNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        try {
            Product product = productService.getProductByIdAndUser(id, currentUser);
            return ResponseEntity.ok(productService.updateProduct(id, productDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @RequestParam(required = false) String reason) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        productService.deleteProduct(id, currentUser, reason != null ? reason : "Kullanıcı tarafından silindi");
        return ResponseEntity.ok().build();
    }
} 