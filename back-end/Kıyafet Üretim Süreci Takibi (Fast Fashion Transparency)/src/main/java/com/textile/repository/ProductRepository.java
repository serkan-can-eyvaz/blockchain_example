package com.textile.repository;

import com.textile.entity.Product;
import com.textile.entity.ProductStatus;
import com.textile.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByProducer(User producer);
    List<Product> findByStatus(ProductStatus status);
    List<Product> findByStatusAndProducer(ProductStatus status, User producer);
    Optional<Product> findByBatchNumber(String batchNumber);
    List<Product> findByDeletedFalse();
    List<Product> findByProducerAndDeletedFalse(User producer);
} 