package com.textile.repository;

import com.textile.entity.Product;
import com.textile.entity.Transaction;
import com.textile.entity.TransactionType;
import com.textile.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByProduct(Product product);
    List<Transaction> findByUser(User user);
    List<Transaction> findByType(TransactionType type);
    List<Transaction> findByProductOrderByCreatedAtDesc(Product product);
    List<Transaction> findByProductId(Long productId);
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByProductIdAndUser(Long productId, User user);
    List<Transaction> findByTypeAndUser(TransactionType type, User user);
} 