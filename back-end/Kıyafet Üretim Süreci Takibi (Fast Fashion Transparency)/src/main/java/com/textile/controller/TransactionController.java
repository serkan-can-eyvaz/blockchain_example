package com.textile.controller;

import com.textile.entity.Transaction;
import com.textile.entity.TransactionType;
import com.textile.entity.User;
import com.textile.entity.UserRole;
import com.textile.service.TransactionService;
import com.textile.model.ProductTransaction;
import com.textile.entity.Block;
import com.textile.service.BlockchainService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;
    private final BlockchainService blockchainService;
    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        logger.info("[TransactionController] /api/transactions POST isteği alındı: {}", transaction);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = transactionService.getUserService().getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        if (transaction.getUser() == null || transaction.getUser().getId() == null) {
            transaction.setUser(currentUser);
        } else if (!transaction.getUser().getId().equals(currentUser.getId()) && 
                   currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.badRequest().build();
        }
        
        if (transaction.getProduct() == null || transaction.getProduct().getId() == null) {
            logger.warn("[TransactionController] Product id eksik!");
            return ResponseEntity.badRequest().build();
        }
        
        logger.info("[TransactionController] User ve Product id kontrolü geçti. UserId: {}, ProductId: {}", 
                   transaction.getUser().getId(), transaction.getProduct().getId());
        
        var product = transactionService.getProductService().getProductById(transaction.getProduct().getId());
        logger.info("[TransactionController] Product veritabanından çekildi: {}", product);
        
        transaction.setProduct(product);
        logger.info("[TransactionController] TransactionService.createTransaction çağrılıyor.");
        
        Transaction result = transactionService.createTransaction(transaction);
        logger.info("[TransactionController] Transaction başarıyla oluşturuldu: {}", result);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = transactionService.getUserService().getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        return ResponseEntity.ok(transactionService.getTransactionsByCurrentUser(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = transactionService.getUserService().getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        try {
            return ResponseEntity.ok(transactionService.getTransactionByIdAndUser(id, currentUser));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Transaction>> getTransactionsByProduct(@PathVariable Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = transactionService.getUserService().getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        return ResponseEntity.ok(transactionService.getTransactionsByProductAndUser(productId, currentUser));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUser(@PathVariable Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = transactionService.getUserService().getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        if (!userId.equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(transactionService.getTransactionsByUser(userId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Transaction>> getTransactionsByType(@PathVariable TransactionType type) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = transactionService.getUserService().getUserByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        return ResponseEntity.ok(transactionService.getTransactionsByTypeAndUser(type, currentUser));
    }

    @PostMapping("/add")
    public ResponseEntity<String> addTransaction(@RequestBody ProductTransaction transaction) {
        blockchainService.addTransaction(transaction);
        return ResponseEntity.ok("Transaction pending listesine eklendi.");
    }

    @PostMapping("/mine")
    public ResponseEntity<Block> minePendingTransactions() {
        Block block = blockchainService.minePendingTransactions();
        return ResponseEntity.ok(block);
    }
} 